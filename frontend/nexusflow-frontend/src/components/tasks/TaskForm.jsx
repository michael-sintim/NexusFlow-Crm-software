import React from 'react'
import { useForm } from 'react-hook-form'
import { useApi } from '../../hooks/useApi'
import { tasksAPI, contactsAPI, opportunitiesAPI } from '../../services/api'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { ArrowLeft, Calendar, Target, User, TrendingUp, FileText, AlertCircle, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const TaskForm = () => {
  const { register, handleSubmit, formState: { errors }, watch, setError, clearErrors } = useForm({
    defaultValues: {
      priority: 'medium',
      task_type: 'other'
    }
  })
  const { loading, error, callApi } = useApi()
  const [contacts, setContacts] = React.useState([])
  const [opportunities, setOpportunities] = React.useState([])
  const navigate = useNavigate()

  // Custom date validation function for datetime-local
  const validateDate = (dateTimeString) => {
    if (!dateTimeString) return true // Optional field
    
    const selectedDateTime = new Date(dateTimeString)
    const now = new Date()
    
    if (selectedDateTime < now) {
      return 'Due date and time cannot be in the past'
    }
    
    return true
  }

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [contactsRes, opportunitiesRes] = await Promise.all([
          contactsAPI.getAll(),
          opportunitiesAPI.getAll()
        ])
        // Handle paginated responses
        setContacts(contactsRes.data.results || contactsRes.data || [])
        setOpportunities(opportunitiesRes.data.results || opportunitiesRes.data || [])
      } catch (err) {
        console.error('Failed to fetch data:', err)
      }
    }
    fetchData()
  }, [])

  const onSubmit = async (data) => {
    try {
      // Clear any existing date errors
      clearErrors('due_date')
      
      // Validate date before submission
      const dateValidation = validateDate(data.due_date)
      if (dateValidation !== true) {
        setError('due_date', {
          type: 'manual',
          message: dateValidation
        })
        return
      }

      await callApi(() => tasksAPI.create(data))
      // Navigate back to tasks page after successful creation
      navigate('/tasks')
    } catch (err) {
      // Error handled by useApi
    }
  }

  const dueDate = watch('due_date')

  // Real-time date validation
  React.useEffect(() => {
    if (dueDate) {
      const validation = validateDate(dueDate)
      if (validation !== true) {
        setError('due_date', {
          type: 'manual',
          message: validation
        })
      } else {
        clearErrors('due_date')
      }
    }
  }, [dueDate, setError, clearErrors])

  const taskTypeOptions = [
    { value: 'call', label: 'Phone Call' },
    { value: 'email', label: 'Email' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'follow_up', label: 'Follow Up' },
    { value: 'other', label: 'Other' },
  ]

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/tasks')}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tasks
          </button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Create New Task
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Add a new task to your schedule
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Basic Task Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <FileText className="h-5 w-5 mr-2 text-orange-500" />
                Task Details
              </h3>
              
              <Input
                label="Task Title"
                {...register('title', { required: 'Title is required' })}
                error={errors.title?.message}
                placeholder="Enter task title"
                leftIcon={<FileText className="h-4 w-4 text-gray-400" />}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <Target className="h-4 w-4 mr-2 text-gray-400" />
                    Task Type
                  </label>
                  <select
                    {...register('task_type')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                  >
                    {taskTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 text-gray-400" />
                    Priority
                  </label>
                  <select
                    {...register('priority')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                  >
                    {priorityOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Related Entities */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <User className="h-5 w-5 mr-2 text-orange-500" />
                Related Entities
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <User className="h-4 w-4 mr-2 text-gray-400" />
                    Related Contact
                  </label>
                  <select
                    {...register('related_contact')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                  >
                    <option value="">No contact selected</option>
                    {contacts.map(contact => (
                      <option key={contact.id} value={contact.id}>
                        {contact.first_name} {contact.last_name}
                        {contact.company_name && ` - ${contact.company_name}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-gray-400" />
                    Related Opportunity
                  </label>
                  <select
                    {...register('related_opportunity')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                  >
                    <option value="">No opportunity selected</option>
                    {opportunities.map(opp => (
                      <option key={opp.id} value={opp.id}>
                        {opp.title} - ${opp.value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Scheduling */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Clock className="h-5 w-5 mr-2 text-orange-500" />
                Scheduling
              </h3>
              
              <Input
                label="Due Date & Time"
                type="datetime-local"
                {...register('due_date', { 
                  required: 'Due date is required',
                  validate: validateDate  // Add custom validation
                })}
                error={errors.due_date?.message}
                leftIcon={<Calendar className="h-4 w-4 text-gray-400" />}
              />
            </div>

            {/* Description */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <FileText className="h-5 w-5 mr-2 text-orange-500" />
                Additional Information
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none transition-colors duration-200 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Describe the task details, objectives, and any specific requirements..."
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/tasks')}
                disabled={loading}
                className="px-8 py-3 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
              >
                Create Task
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-orange-200 dark:bg-orange-900 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-yellow-200 dark:bg-yellow-900 rounded-full blur-3xl opacity-30"></div>
      </div>
    </div>
  )
}

export default TaskForm