import React from 'react'
import { useForm } from 'react-hook-form'
import { useApi } from '../../hooks/useApi'
import { tasksAPI, contactsAPI, opportunitiesAPI } from '../../services/api'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { ArrowLeft, Calendar, Target, User, TrendingUp, FileText, AlertCircle, Clock } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDataStore } from '../../store/dataStore'
import { useUIStore } from '../../store/uiStore'
import { cn } from '../../lib/utils'

const TaskForm = () => {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { theme } = useUIStore()
  const { register, handleSubmit, formState: { errors }, watch, setError, clearErrors, setValue, reset } = useForm({
    defaultValues: {
      priority: 'medium',
      task_type: 'other',
      status: 'open'
    }
  })
  const { loading, error, callApi } = useApi()
  const { fetchTask, currentTask, tasks } = useDataStore()
  const [contacts, setContacts] = React.useState([])
  const [opportunities, setOpportunities] = React.useState([])
  const [isLoading, setIsLoading] = React.useState(isEdit)
  const navigate = useNavigate()

  // Theme-based styles
  const themeStyles = {
    light: {
      background: {
        page: 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50',
        card: 'bg-white'
      },
      border: {
        primary: 'border-gray-200',
        secondary: 'border-gray-300'
      },
      text: {
        primary: 'text-gray-900',
        secondary: 'text-gray-700',
        tertiary: 'text-gray-600'
      }
    },
    dark: {
      background: {
        page: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900',
        card: 'bg-gray-800'
      },
      border: {
        primary: 'border-gray-700',
        secondary: 'border-gray-600'
      },
      text: {
        primary: 'text-white',
        secondary: 'text-gray-300',
        tertiary: 'text-gray-400'
      }
    }
  }

  const currentTheme = themeStyles[theme]

  // Load task data if in edit mode
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [contactsRes, opportunitiesRes] = await Promise.all([
          contactsAPI.getAll(),
          opportunitiesAPI.getAll()
        ])
        
        setContacts(contactsRes.data.results || contactsRes.data || [])
        setOpportunities(opportunitiesRes.data.results || opportunitiesRes.data || [])

        if (isEdit && id) {
          setIsLoading(true)
          try {
            let taskData = tasks.find(task => task.id === id)
            
            if (!taskData) {
              taskData = await fetchTask(id)
            }

            if (taskData) {
              const formData = {
                title: taskData.title || '',
                description: taskData.description || '',
                task_type: taskData.task_type || 'other',
                priority: taskData.priority || 'medium',
                status: taskData.status || 'open',
                due_date: taskData.due_date ? new Date(taskData.due_date).toISOString().slice(0, 16) : '',
                related_contact: taskData.related_contact || '',
                related_opportunity: taskData.related_opportunity || ''
              }
              reset(formData)
            }
          } catch (err) {
            console.error('Failed to load task:', err)
          } finally {
            setIsLoading(false)
          }
        }
      } catch (err) {
        console.error('Failed to fetch data:', err)
        setIsLoading(false)
      }
    }
    loadData()
  }, [isEdit, id, fetchTask, reset, tasks])

  const validateDate = (dateTimeString) => {
    if (!dateTimeString) return true
    
    const selectedDateTime = new Date(dateTimeString)
    const now = new Date()
    
    if (selectedDateTime < now) {
      return 'Due date and time cannot be in the past'
    }
    
    return true
  }

  const onSubmit = async (data) => {
    try {
      clearErrors('due_date')
      
      const dateValidation = validateDate(data.due_date)
      if (dateValidation !== true) {
        setError('due_date', {
          type: 'manual',
          message: dateValidation
        })
        return
      }

      if (isEdit) {
        await callApi(() => tasksAPI.update(id, data))
      } else {
        await callApi(() => tasksAPI.create(data))
      }
      
      navigate('/tasks')
    } catch (err) {
      // Error handled by useApi
    }
  }

  const dueDate = watch('due_date')

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

  const statusOptions = [
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
  ]

  if (isLoading) {
    return (
      <div className={cn(
        "min-h-screen py-8",
        currentTheme.background.page
      )}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className={cn(
              "h-8 rounded w-64 mb-4",
              theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'
            )}></div>
            <div className={cn(
              "h-96 rounded-xl",
              theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'
            )}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "min-h-screen py-8",
      currentTheme.background.page
    )}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/tasks')}
            className={cn(
              "flex items-center transition-colors mb-6",
              theme === 'light' 
                ? "text-gray-600 hover:text-gray-900" 
                : "text-gray-400 hover:text-white"
            )}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tasks
          </button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8 text-white" />
            </div>
            <h1 className={cn(
              "text-3xl font-bold",
              currentTheme.text.primary
            )}>
              {isEdit ? 'Edit Task' : 'Create New Task'}
            </h1>
            <p className={cn(
              "mt-2",
              currentTheme.text.tertiary
            )}>
              {isEdit ? 'Update your task details' : 'Add a new task to your schedule'}
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className={cn(
          "rounded-2xl shadow-xl border p-8",
          currentTheme.background.card,
          currentTheme.border.primary
        )}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {error && (
              <div className={cn(
                "p-4 border rounded-lg",
                theme === 'light'
                  ? "bg-red-50 border-red-200"
                  : "bg-red-900/20 border-red-800"
              )}>
                <p className={cn(
                  "text-sm",
                  theme === 'light' ? "text-red-600" : "text-red-400"
                )}>{error}</p>
              </div>
            )}

            {/* Basic Task Information */}
            <div className="space-y-6">
              <h3 className={cn(
                "text-lg font-semibold flex items-center",
                currentTheme.text.primary
              )}>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={cn(
                    "block text-sm font-medium mb-2 flex items-center",
                    currentTheme.text.secondary
                  )}>
                    <Target className="h-4 w-4 mr-2 text-gray-400" />
                    Task Type
                  </label>
                  <select
                    {...register('task_type')}
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200",
                      theme === 'light'
                        ? "border-gray-300 bg-white text-gray-900"
                        : "border-gray-600 bg-gray-700 text-white"
                    )}
                  >
                    {taskTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={cn(
                    "block text-sm font-medium mb-2 flex items-center",
                    currentTheme.text.secondary
                  )}>
                    <AlertCircle className="h-4 w-4 mr-2 text-gray-400" />
                    Priority
                  </label>
                  <select
                    {...register('priority')}
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200",
                      theme === 'light'
                        ? "border-gray-300 bg-white text-gray-900"
                        : "border-gray-600 bg-gray-700 text-white"
                    )}
                  >
                    {priorityOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {isEdit && (
                  <div>
                    <label className={cn(
                      "block text-sm font-medium mb-2 flex items-center",
                      currentTheme.text.secondary
                    )}>
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      Status
                    </label>
                    <select
                      {...register('status')}
                      className={cn(
                        "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200",
                        theme === 'light'
                          ? "border-gray-300 bg-white text-gray-900"
                          : "border-gray-600 bg-gray-700 text-white"
                      )}
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Related Entities */}
            <div className="space-y-6">
              <h3 className={cn(
                "text-lg font-semibold flex items-center",
                currentTheme.text.primary
              )}>
                <User className="h-5 w-5 mr-2 text-orange-500" />
                Related Entities
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={cn(
                    "block text-sm font-medium mb-2 flex items-center",
                    currentTheme.text.secondary
                  )}>
                    <User className="h-4 w-4 mr-2 text-gray-400" />
                    Related Contact
                  </label>
                  <select
                    {...register('related_contact')}
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200",
                      theme === 'light'
                        ? "border-gray-300 bg-white text-gray-900"
                        : "border-gray-600 bg-gray-700 text-white"
                    )}
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
                  <label className={cn(
                    "block text-sm font-medium mb-2 flex items-center",
                    currentTheme.text.secondary
                  )}>
                    <TrendingUp className="h-4 w-4 mr-2 text-gray-400" />
                    Related Opportunity
                  </label>
                  <select
                    {...register('related_opportunity')}
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200",
                      theme === 'light'
                        ? "border-gray-300 bg-white text-gray-900"
                        : "border-gray-600 bg-gray-700 text-white"
                    )}
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
              <h3 className={cn(
                "text-lg font-semibold flex items-center",
                currentTheme.text.primary
              )}>
                <Clock className="h-5 w-5 mr-2 text-orange-500" />
                Scheduling
              </h3>
              
              <Input
                label="Due Date & Time"
                type="datetime-local"
                {...register('due_date', { 
                  required: 'Due date is required',
                  validate: validateDate
                })}
                error={errors.due_date?.message}
                leftIcon={<Calendar className="h-4 w-4 text-gray-400" />}
              />
            </div>

            {/* Description */}
            <div className="space-y-6">
              <h3 className={cn(
                "text-lg font-semibold flex items-center",
                currentTheme.text.primary
              )}>
                <FileText className="h-5 w-5 mr-2 text-orange-500" />
                Additional Information
              </h3>
              
              <div>
                <label className={cn(
                  "block text-sm font-medium mb-2",
                  currentTheme.text.secondary
                )}>
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none transition-colors duration-200",
                    theme === 'light'
                      ? "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                      : "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                  )}
                  placeholder="Describe the task details, objectives, and any specific requirements..."
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className={cn(
              "flex justify-end space-x-4 pt-6 border-t",
              currentTheme.border.secondary
            )}>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/tasks')}
                disabled={loading}
                className={cn(
                  "px-8 py-3",
                  theme === 'light'
                    ? "border-gray-300 text-gray-700 hover:bg-gray-50"
                    : "border-gray-600 text-gray-300 hover:bg-gray-700"
                )}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
              >
                {isEdit ? 'Update Task' : 'Create Task'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className={cn(
          "absolute -top-40 -right-32 w-80 h-80 rounded-full blur-3xl opacity-30",
          theme === 'light' ? "bg-orange-200" : "bg-orange-900"
        )}></div>
        <div className={cn(
          "absolute -bottom-40 -left-32 w-80 h-80 rounded-full blur-3xl opacity-30",
          theme === 'light' ? "bg-yellow-200" : "bg-yellow-900"
        )}></div>
      </div>
    </div>
  )
}

export default TaskForm