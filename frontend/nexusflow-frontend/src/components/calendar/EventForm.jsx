import React, { useState, useEffect } from 'react'
import { 
  X, 
  Calendar, 
  Clock, 
  Users, 
  Palette,
  Tag,
  MapPin,
  Phone,
  CheckCircle
} from 'lucide-react'

const EventForm = ({ event, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    all_day: false,
    color: '#3b82f6',
    location: '',
    event_type: 'meeting',
    reminder: '15'
  })

  const [loading, setLoading] = useState(false)

  // Event type options
  const eventTypes = [
    { value: 'meeting', label: 'Meeting', icon: Users },
    { value: 'call', label: 'Phone Call', icon: Phone },
    { value: 'deadline', label: 'Deadline', icon: Clock },
    { value: 'appointment', label: 'Appointment', icon: Calendar },
    { value: 'task', label: 'Task', icon: CheckCircle }
  ]

  // Reminder options
  const reminderOptions = [
    { value: '0', label: 'None' },
    { value: '5', label: '5 minutes before' },
    { value: '15', label: '15 minutes before' },
    { value: '30', label: '30 minutes before' },
    { value: '60', label: '1 hour before' },
    { value: '1440', label: '1 day before' }
  ]

  // Color options optimized for dark mode
  const colors = [
    { value: '#3b82f6', name: 'Blue' },
    { value: '#10b981', name: 'Green' },
    { value: '#f59e0b', name: 'Amber' },
    { value: '#ef4444', name: 'Red' },
    { value: '#8b5cf6', name: 'Purple' },
    { value: '#06b6d4', name: 'Cyan' },
    { value: '#f97316', name: 'Orange' },
    { value: '#84cc16', name: 'Lime' }
  ]

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        start_time: event.start_time ? formatDateTimeLocal(event.start_time) : '',
        end_time: event.end_time ? formatDateTimeLocal(event.end_time) : '',
        all_day: event.all_day || false,
        color: event.color || '#3b82f6',
        location: event.location || '',
        event_type: event.event_type || 'meeting',
        reminder: event.reminder || '15'
      })
    } else {
      // Set default times for new event
      const now = new Date()
      const end = new Date(now.getTime() + 60 * 60 * 1000)
      
      setFormData(prev => ({
        ...prev,
        start_time: formatDateTimeLocal(now),
        end_time: formatDateTimeLocal(end)
      }))
    }
  }, [event])

  const formatDateTimeLocal = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const timezoneOffset = date.getTimezoneOffset() * 60000
    const localDate = new Date(date.getTime() - timezoneOffset)
    return localDate.toISOString().slice(0, 16)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await onSave(formData)
    } catch (error) {
      console.error('Error saving event:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const getEventTypeIcon = (type) => {
    const eventType = eventTypes.find(et => et.value === type)
    return eventType ? eventType.icon : Users
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-10 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-lg"
              style={{ backgroundColor: formData.color }}
            >
              {React.createElement(getEventTypeIcon(formData.event_type), { 
                className: "h-5 w-5" 
              })}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {event ? 'Edit Event' : 'Create New Event'}
              </h2>
              <p className="text-sm text-gray-300">
                {event ? 'Update your event details' : 'Schedule a new event'}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2 flex items-center">
                  <Tag className="h-4 w-4 mr-2 text-gray-400" />
                  Event Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-colors"
                  placeholder="Enter event title..."
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-white placeholder-gray-400 transition-colors"
                  placeholder="Add event description, agenda, or notes..."
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-colors"
                  placeholder="Add location or meeting link..."
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Date & Time */}
              <div className="bg-gray-750 rounded-lg p-4 border border-gray-700">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-gray-400" />
                  Date & Time
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Start *
                      </label>
                      <input
                        type="datetime-local"
                        name="start_time"
                        value={formData.start_time}
                        onChange={handleChange}
                        required
                        className="w-full p-2 text-sm bg-gray-700 border border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        End *
                      </label>
                      <input
                        type="datetime-local"
                        name="end_time"
                        value={formData.end_time}
                        onChange={handleChange}
                        required
                        className="w-full p-2 text-sm bg-gray-700 border border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent text-white"
                      />
                    </div>
                  </div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="all_day"
                      checked={formData.all_day}
                      onChange={handleChange}
                      className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
                    />
                    <span className="text-sm text-gray-300">All day event</span>
                  </label>
                </div>
              </div>

              {/* Event Type */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  Event Type
                </label>
                <select
                  name="event_type"
                  value={formData.event_type}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                >
                  {eventTypes.map(type => (
                    <option key={type.value} value={type.value} className="bg-gray-700">
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reminder */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Set Reminder
                </label>
                <select
                  name="reminder"
                  value={formData.reminder}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                >
                  {reminderOptions.map(option => (
                    <option key={option.value} value={option.value} className="bg-gray-700">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2 flex items-center">
                  <Palette className="h-4 w-4 mr-2 text-gray-400" />
                  Event Color
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {colors.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                      className={`p-2 rounded-lg border-2 transition-all transform hover:scale-105 ${
                        formData.color === color.value 
                          ? 'border-white shadow-lg scale-105' 
                          : 'border-gray-600 hover:border-gray-400'
                      }`}
                      title={color.name}
                    >
                      <div
                        className="w-full h-8 rounded shadow-md"
                        style={{ backgroundColor: color.value }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 shadow-lg shadow-blue-600/25"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{event ? 'Update Event' : 'Create Event'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EventForm