import React, { useState, useEffect } from 'react'
import { X, Calendar, Clock, User, MapPin, Tag, Bell, Repeat, Palette } from 'lucide-react'
import { contactsAPI, opportunitiesAPI, authAPI } from '../../services/api' // Removed usersAPI, using authAPI instead

const EventForm = ({ event, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'meeting',
    start_time: '',
    end_time: '',
    all_day: false,
    customer: '',
    opportunity: '',
    assigned_to: '',
    status: 'scheduled',
    reminder_minutes: 15,
    is_recurring: false,
    recurrence_rule: '',
    recurrence_end: '',
    color: '#3788d8'
  })
  
  const [contacts, setContacts] = useState([])
  const [opportunities, setOpportunities] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Event type options with colors
  const eventTypes = [
    { value: 'meeting', label: 'Meeting', color: '#3788d8' },
    { value: 'call', label: 'Phone Call', color: '#10b981' },
    { value: 'deadline', label: 'Deadline', color: '#f59e0b' },
    { value: 'task', label: 'Task', color: '#ef4444' },
    { value: 'reminder', label: 'Reminder', color: '#8b5cf6' },
    { value: 'other', label: 'Other', color: '#6b7280' }
  ]

  const statusOptions = [
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  const reminderOptions = [
    { value: 0, label: 'None' },
    { value: 5, label: '5 minutes before' },
    { value: 15, label: '15 minutes before' },
    { value: 30, label: '30 minutes before' },
    { value: 60, label: '1 hour before' },
    { value: 1440, label: '1 day before' }
  ]

  const colorOptions = [
    '#3788d8', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899',
    '#06b6d4', '#84cc16', '#f97316', '#dc2626', '#7c3aed', '#db2777'
  ]

  useEffect(() => {
    initializeFormData()
    fetchDropdownData()
  }, [event])

  const initializeFormData = () => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        event_type: event.event_type || 'meeting',
        start_time: event.start_time ? formatDateTimeLocal(event.start_time) : '',
        end_time: event.end_time ? formatDateTimeLocal(event.end_time) : '',
        all_day: event.all_day || false,
        customer: event.customer?.id || event.customer || '',
        opportunity: event.opportunity?.id || event.opportunity || '',
        assigned_to: event.assigned_to?.id || event.assigned_to || '',
        status: event.status || 'scheduled',
        reminder_minutes: event.reminder_minutes || 15,
        is_recurring: event.is_recurring || false,
        recurrence_rule: event.recurrence_rule || '',
        recurrence_end: event.recurrence_end ? formatDateTimeLocal(event.recurrence_end) : '',
        color: event.color || '#3788d8'
      })
    } else {
      // Set default times for new event
      const now = new Date()
      const end = new Date(now.getTime() + 60 * 60 * 1000) // 1 hour later
      
      setFormData(prev => ({
        ...prev,
        start_time: formatDateTimeLocal(now),
        end_time: formatDateTimeLocal(end)
      }))
    }
    setErrors({}) // Clear errors when form initializes
  }

  const formatDateTimeLocal = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    // Adjust for timezone offset to ensure correct local time display
    const timezoneOffset = date.getTimezoneOffset() * 60000
    const localDate = new Date(date.getTime() - timezoneOffset)
    return localDate.toISOString().slice(0, 16)
  }

  const fetchDropdownData = async () => {
    setLoading(true)
    try {
      // Use actual API calls with proper error handling
      const [contactsRes, opportunitiesRes, usersRes] = await Promise.allSettled([
        contactsAPI.getAll().catch(() => []), // Fallback to empty array on error
        opportunitiesAPI.getAll().catch(() => []), // Fallback to empty array on error
        authAPI.getUsers ? authAPI.getUsers().catch(() => []) : Promise.resolve([]) // Check if method exists
      ])
      
      // Set data from API responses or use mock data as fallback
      setContacts(contactsRes.status === 'fulfilled' && contactsRes.value?.data ? 
        contactsRes.value.data.results || contactsRes.value.data : 
        getMockContacts()
      )
      
      setOpportunities(opportunitiesRes.status === 'fulfilled' && opportunitiesRes.value?.data ? 
        opportunitiesRes.value.data.results || opportunitiesRes.value.data : 
        getMockOpportunities()
      )
      
      setUsers(usersRes.status === 'fulfilled' && usersRes.value?.data ? 
        usersRes.value.data.results || usersRes.value.data : 
        getMockUsers()
      )
    } catch (error) {
      console.error('Error fetching dropdown data:', error)
      // Fallback to mock data
      setContacts(getMockContacts())
      setOpportunities(getMockOpportunities())
      setUsers(getMockUsers())
    } finally {
      setLoading(false)
    }
  }

  // Mock data fallbacks
  const getMockContacts = () => [
    { id: '1', company_name: 'Acme Corp', first_name: 'John', last_name: 'Doe' },
    { id: '2', company_name: 'Globex Corp', first_name: 'Jane', last_name: 'Smith' },
    { id: '3', company_name: 'Wayne Enterprises', first_name: 'Bruce', last_name: 'Wayne' }
  ]

  const getMockOpportunities = () => [
    { id: '1', title: 'Enterprise Deal', value: 50000 },
    { id: '2', title: 'SMB Package', value: 15000 },
    { id: '3', title: 'Startup Partnership', value: 25000 }
  ]

  const getMockUsers = () => [
    { id: '1', first_name: 'Admin', last_name: 'User', role: 'admin' },
    { id: '2', first_name: 'Sales', last_name: 'Rep', role: 'sales' },
    { id: '3', first_name: 'Manager', last_name: 'Lead', role: 'sales' }
  ]

  const validateForm = () => {
    const newErrors = {}
    
    // Required field validation
    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required'
    }
    
    if (!formData.start_time) {
      newErrors.start_time = 'Start time is required'
    }
    
    if (!formData.end_time) {
      newErrors.end_time = 'End time is required'
    }
    
    if (!formData.assigned_to) {
      newErrors.assigned_to = 'Please assign this event to a user'
    }
    
    // Date validation
    if (formData.start_time && formData.end_time) {
      const start = new Date(formData.start_time)
      const end = new Date(formData.end_time)
      
      if (end <= start) {
        newErrors.end_time = 'End time must be after start time'
      }
    }
    
    // Recurrence validation
    if (formData.is_recurring && !formData.recurrence_rule.trim()) {
      newErrors.recurrence_rule = 'Recurrence rule is required for recurring events'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      // Scroll to first error
      const firstError = Object.keys(errors)[0]
      if (firstError) {
        const element = document.querySelector(`[name="${firstError}"]`)
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          })
          element.focus()
        }
      }
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Prepare data for API
      const submitData = {
        ...formData,
        id: event?.id,
        // Ensure we're sending proper IDs
        customer: formData.customer || null,
        opportunity: formData.opportunity || null,
        assigned_to: formData.assigned_to || null
      }
      
      await onSave(submitData)
    } catch (error) {
      console.error('Error saving event:', error)
      setErrors({ submit: error.message || 'Failed to save event. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleColorSelect = (color) => {
    setFormData(prev => ({ ...prev, color }))
  }

  const InputField = ({ label, name, type = 'text', required = false, children, ...props }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children || (
        <input
          type={type}
          name={name}
          value={formData[name] || ''}
          onChange={handleChange}
          required={required}
          className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors[name] 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300 dark:border-gray-600'
          }`}
          {...props}
        />
      )}
      {errors[name] && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors[name]}</p>
      )}
    </div>
  )

  const SelectField = ({ label, name, required = false, options, valueKey = 'value', labelKey = 'label' }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={formData[name] || ''}
        onChange={handleChange}
        required={required}
        className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          errors[name] 
            ? 'border-red-500 focus:ring-red-500' 
            : 'border-gray-300 dark:border-gray-600'
        }`}
      >
        <option value="">Select {label}</option>
        {options.map(option => (
          <option key={option[valueKey]} value={option[valueKey]}>
            {option[labelKey]}
          </option>
        ))}
      </select>
      {errors[name] && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors[name]}</p>
      )}
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {event ? 'Edit Event' : 'Create New Event'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {event ? 'Update your event details' : 'Schedule a new event in your calendar'}
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          disabled={isSubmitting}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {errors.submit && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200 text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Basic Information */}
        <section className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Event Details</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Basic information about your event</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <InputField
              label="Event Title"
              name="title"
              required
              placeholder="Enter event title"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField
                label="Event Type"
                name="event_type"
                options={eventTypes}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Event Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleColorSelect(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        formData.color === color 
                          ? 'border-gray-900 dark:border-white scale-110' 
                          : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>

            <InputField
              label="Description"
              name="description"
            >
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Enter event description (optional)"
              />
            </InputField>
          </div>
        </section>

        {/* Time & Date */}
        <section className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Time & Date</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">When your event takes place</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Start Time"
              name="start_time"
              type="datetime-local"
              required
            />

            <InputField
              label="End Time"
              name="end_time"
              type="datetime-local"
              required
            />
          </div>

          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <input
              type="checkbox"
              name="all_day"
              checked={formData.all_day}
              onChange={handleChange}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              id="all_day"
            />
            <label htmlFor="all_day" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              All day event
            </label>
          </div>
        </section>

        {/* People & Relations */}
        <section className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <User className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">People & Relations</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Assign and connect your event</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField
              label="Assigned To"
              name="assigned_to"
              required
              options={users.map(user => ({
                value: user.id,
                label: `${user.first_name} ${user.last_name}${user.role ? ` (${user.role})` : ''}`
              }))}
            />

            <SelectField
              label="Status"
              name="status"
              options={statusOptions}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField
              label="Customer"
              name="customer"
              options={contacts.map(contact => ({
                value: contact.id,
                label: `${contact.company_name || 'No Company'} - ${contact.first_name} ${contact.last_name}`
              }))}
            />

            <SelectField
              label="Opportunity"
              name="opportunity"
              options={opportunities.map(opp => ({
                value: opp.id,
                label: `${opp.title || 'No Title'}${opp.value ? ` ($${opp.value.toLocaleString()})` : ''}`
              }))}
            />
          </div>
        </section>

        {/* Reminders & Recurrence */}
        <section className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Bell className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reminders & Recurrence</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Notifications and repeating events</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField
              label="Reminder"
              name="reminder_minutes"
              options={reminderOptions}
            />

            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <input
                type="checkbox"
                name="is_recurring"
                checked={formData.is_recurring}
                onChange={handleChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                id="is_recurring"
              />
              <label htmlFor="is_recurring" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Recurring event
              </label>
            </div>
          </div>

          {formData.is_recurring && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <InputField
                label="Recurrence Rule"
                name="recurrence_rule"
                placeholder="FREQ=WEEKLY;INTERVAL=1"
                required={formData.is_recurring}
              />

              <InputField
                label="Recurrence End"
                name="recurrence_end"
                type="datetime-local"
              />
              
              <div className="md:col-span-2">
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Use RRULE format (e.g., FREQ=WEEKLY;INTERVAL=1 for weekly, FREQ=MONTHLY for monthly)
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky bottom-0 z-10">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {event ? `Last updated: ${new Date().toLocaleDateString()}` : 'Create a new calendar event'}
        </div>
        
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>{event ? 'Update Event' : 'Create Event'}</span>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}

export default EventForm