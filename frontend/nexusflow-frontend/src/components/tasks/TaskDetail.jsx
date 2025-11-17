import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Calendar, Clock, CheckCircle, PlayCircle, 
  User, Target, FileText, AlertCircle, Edit, Trash2,
  Mail, Phone, Building, MapPin, DollarSign
} from 'lucide-react'
import { useDataStore } from '../../store/dataStore'
import { useUIStore } from '../../store/uiStore'
import Button from '../ui/Button'
import { formatDateTime, formatDate } from '../../lib/utils'
import { cn } from '../../lib/utils'

const TaskDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { theme } = useUIStore()
  const { 
    tasks, 
    fetchTasks, 
    complete, 
    start, 
    deleteTask,
    isLoading 
  } = useDataStore()
  const [task, setTask] = React.useState(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  // Theme-based styles
  const themeStyles = {
    light: {
      background: {
        primary: 'bg-white',
        secondary: 'bg-gray-50',
        page: 'bg-gray-50'
      },
      border: {
        primary: 'border-gray-100',
        secondary: 'border-gray-200'
      },
      text: {
        primary: 'text-gray-900',
        secondary: 'text-gray-600',
        tertiary: 'text-gray-500'
      }
    },
    dark: {
      background: {
        primary: 'bg-gray-800',
        secondary: 'bg-gray-750',
        page: 'bg-gray-900'
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

  React.useEffect(() => {
    const loadTask = async () => {
      if (tasks.length === 0) {
        await fetchTasks()
      }
      
      const foundTask = tasks.find(t => t.id === id)
      if (foundTask) {
        setTask(foundTask)
      } else {
        try {
          await fetchTasks()
        } catch (error) {
          console.error('Failed to load task:', error)
        }
      }
    }
    
    loadTask()
  }, [id, tasks, fetchTasks])

  const handleComplete = async () => {
    try {
      await complete(id)
      await fetchTasks()
    } catch (error) {
      console.error('Failed to complete task:', error)
    }
  }

  const handleStart = async () => {
    try {
      await start(id)
      await fetchTasks()
    } catch (error) {
      console.error('Failed to start task:', error)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteTask(id)
      navigate('/tasks')
    } catch (error) {
      console.error('Failed to delete task:', error)
      setIsDeleting(false)
    }
  }

  const handleEdit = () => {
    navigate(`/tasks/${id}/edit`)
  }

  if (isLoading && !task) {
    return (
      <div className={cn(
        "min-h-screen p-6",
        currentTheme.background.page
      )}>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Loading Header */}
          <div className="animate-pulse">
            <div className={cn(
              "h-6 rounded w-32 mb-4",
              theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'
            )}></div>
            <div className={cn(
              "h-8 rounded w-64 mb-2",
              theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'
            )}></div>
            <div className={cn(
              "h-4 rounded w-48",
              theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'
            )}></div>
          </div>
          
          {/* Loading Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map(n => (
                <div key={n} className="animate-pulse">
                  <div className={cn(
                    "h-24 rounded-xl",
                    theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'
                  )}></div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map(n => (
                <div key={n} className="animate-pulse">
                  <div className={cn(
                    "h-32 rounded-xl",
                    theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'
                  )}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className={cn(
        "min-h-screen p-6",
        currentTheme.background.page
      )}>
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className={cn(
            "w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4",
            theme === 'light' ? 'bg-red-100' : 'bg-red-900/20'
          )}>
            <AlertCircle className={cn(
              "h-8 w-8",
              theme === 'light' ? 'text-red-600' : 'text-red-400'
            )} />
          </div>
          <h3 className={cn(
            "text-2xl font-bold mb-2",
            currentTheme.text.primary
          )}>
            Task Not Found
          </h3>
          <p className={cn(
            "mb-6",
            currentTheme.text.secondary
          )}>
            The task you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={() => navigate('/tasks')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tasks
          </Button>
        </div>
      </div>
    )
  }

  const isOverdue = new Date(task.due_date) < new Date() && task.status !== 'completed'

  const priorityColors = {
    high: cn(
      theme === 'light' 
        ? 'bg-red-100 text-red-800 border-red-200'
        : 'bg-red-900/20 text-red-300 border-red-800'
    ),
    medium: cn(
      theme === 'light'
        ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
        : 'bg-yellow-900/20 text-yellow-300 border-yellow-800'
    ),
    low: cn(
      theme === 'light'
        ? 'bg-green-100 text-green-800 border-green-200'
        : 'bg-green-900/20 text-green-300 border-green-800'
    ),
  }

  const statusColors = {
    open: cn(
      theme === 'light'
        ? 'bg-gray-100 text-gray-800 border-gray-200'
        : 'bg-gray-800 text-gray-300 border-gray-700'
    ),
    in_progress: cn(
      theme === 'light'
        ? 'bg-blue-100 text-blue-800 border-blue-200'
        : 'bg-blue-900/20 text-blue-300 border-blue-800'
    ),
    completed: cn(
      theme === 'light'
        ? 'bg-green-100 text-green-800 border-green-200'
        : 'bg-green-900/20 text-green-300 border-green-800'
    ),
  }

  const typeIcons = {
    call: '📞',
    email: '📧',
    meeting: '👥',
    follow_up: '🔄',
    other: '📝',
  }

  return (
    <div className={cn(
      "min-h-screen p-6",
      currentTheme.background.page
    )}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/tasks')}
              className={cn(
                "p-2 rounded-lg transition-colors",
                theme === 'light' 
                  ? "hover:bg-gray-200" 
                  : "hover:bg-gray-700"
              )}
            >
              <ArrowLeft className={cn(
                "h-5 w-5",
                currentTheme.text.secondary
              )} />
            </button>
            <div>
              <h1 className={cn(
                "text-3xl font-bold",
                currentTheme.text.primary
              )}>
                {task.title}
              </h1>
              <p className={cn(
                "mt-1",
                currentTheme.text.secondary
              )}>
                Created {formatDate(task.created_at)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {task.status === 'open' && (
              <Button
                onClick={handleStart}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <PlayCircle className="h-4 w-4" />
                <span>Start Task</span>
              </Button>
            )}
            
            {task.status === 'in_progress' && (
              <Button
                onClick={handleComplete}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Complete</span>
              </Button>
            )}

            <Button
              onClick={handleEdit}
              variant="outline"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>

            <Button
              onClick={handleDelete}
              variant="outline"
              loading={isDeleting}
              className={cn(
                theme === 'light'
                  ? "text-red-600 border-red-300 hover:bg-red-50"
                  : "text-red-400 border-red-700 hover:bg-red-900/20"
              )}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Details Card */}
            <div className={cn(
              "rounded-xl p-6 shadow-sm border",
              currentTheme.background.primary,
              currentTheme.border.secondary
            )}>
              <h2 className={cn(
                "text-xl font-semibold mb-4 flex items-center",
                currentTheme.text.primary
              )}>
                <FileText className="h-5 w-5 mr-2 text-blue-500" />
                Task Details
              </h2>
              
              <div className="space-y-4">
                {/* Description */}
                {task.description && (
                  <div>
                    <h3 className={cn(
                      "text-sm font-medium mb-2",
                      currentTheme.text.secondary
                    )}>
                      Description
                    </h3>
                    <p className={cn(
                      "whitespace-pre-wrap",
                      currentTheme.text.tertiary
                    )}>
                      {task.description}
                    </p>
                  </div>
                )}

                {/* Task Meta */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className={cn(
                      "text-sm font-medium mb-2",
                      currentTheme.text.secondary
                    )}>
                      Type
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{typeIcons[task.task_type] || '📝'}</span>
                      <span className={cn(
                        "capitalize",
                        currentTheme.text.primary
                      )}>
                        {task.task_type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className={cn(
                      "text-sm font-medium mb-2",
                      currentTheme.text.secondary
                    )}>
                      Priority
                    </h3>
                    <span className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border",
                      priorityColors[task.priority]
                    )}>
                      {task.priority}
                    </span>
                  </div>

                  <div>
                    <h3 className={cn(
                      "text-sm font-medium mb-2",
                      currentTheme.text.secondary
                    )}>
                      Status
                    </h3>
                    <span className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border",
                      statusColors[task.status]
                    )}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <h3 className={cn(
                      "text-sm font-medium mb-2",
                      currentTheme.text.secondary
                    )}>
                      Due Date
                    </h3>
                    <div className={cn(
                      "flex items-center space-x-2",
                      isOverdue 
                        ? "text-red-600 dark:text-red-400 font-medium" 
                        : currentTheme.text.primary
                    )}>
                      <Calendar className="h-4 w-4" />
                      <span>{formatDateTime(task.due_date)}</span>
                      {isOverdue && <AlertCircle className="h-4 w-4" />}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned User */}
            <div className={cn(
              "rounded-xl p-6 shadow-sm border",
              currentTheme.background.primary,
              currentTheme.border.secondary
            )}>
              <h2 className={cn(
                "text-xl font-semibold mb-4 flex items-center",
                currentTheme.text.primary
              )}>
                <User className="h-5 w-5 mr-2 text-green-500" />
                Assigned To
              </h2>
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-medium">
                  {task.assigned_to_details?.first_name?.[0]}{task.assigned_to_details?.last_name?.[0]}
                </div>
                <div>
                  <h3 className={cn(
                    "font-medium",
                    currentTheme.text.primary
                  )}>
                    {task.assigned_to_details?.first_name} {task.assigned_to_details?.last_name}
                  </h3>
                  <p className={cn(
                    "text-sm",
                    currentTheme.text.tertiary
                  )}>
                    {task.assigned_to_details?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Related Contact */}
            {task.contact_details && (
              <div className={cn(
                "rounded-xl p-6 shadow-sm border",
                currentTheme.background.primary,
                currentTheme.border.secondary
              )}>
                <h2 className={cn(
                  "text-xl font-semibold mb-4 flex items-center",
                  currentTheme.text.primary
                )}>
                  <User className="h-5 w-5 mr-2 text-purple-500" />
                  Related Contact
                </h2>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {task.contact_details.first_name[0]}{task.contact_details.last_name[0]}
                    </div>
                    <div>
                      <h3 className={cn(
                        "font-medium",
                        currentTheme.text.primary
                      )}>
                        {task.contact_details.first_name} {task.contact_details.last_name}
                      </h3>
                      <p className={cn(
                        "text-sm",
                        currentTheme.text.tertiary
                      )}>
                        {task.contact_details.title || 'No title'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className={cn(
                      "flex items-center",
                      currentTheme.text.tertiary
                    )}>
                      <Mail className="h-4 w-4 mr-2" />
                      <span>{task.contact_details.email}</span>
                    </div>
                    
                    {task.contact_details.phone_number && (
                      <div className={cn(
                        "flex items-center",
                        currentTheme.text.tertiary
                      )}>
                        <Phone className="h-4 w-4 mr-2" />
                        <span>{task.contact_details.phone_number}</span>
                      </div>
                    )}
                    
                    {task.contact_details.company_name && (
                      <div className={cn(
                        "flex items-center",
                        currentTheme.text.tertiary
                      )}>
                        <Building className="h-4 w-4 mr-2" />
                        <span>{task.contact_details.company_name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Related Opportunity */}
            {task.opportunity_details && (
              <div className={cn(
                "rounded-xl p-6 shadow-sm border",
                currentTheme.background.primary,
                currentTheme.border.secondary
              )}>
                <h2 className={cn(
                  "text-xl font-semibold mb-4 flex items-center",
                  currentTheme.text.primary
                )}>
                  <Target className="h-5 w-5 mr-2 text-orange-500" />
                  Related Opportunity
                </h2>
                
                <div className="space-y-3">
                  <h3 className={cn(
                    "font-medium",
                    currentTheme.text.primary
                  )}>
                    {task.opportunity_details.title}
                  </h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className={currentTheme.text.tertiary}>Value:</span>
                      <span className={cn(
                        "font-medium",
                        currentTheme.text.primary
                      )}>
                        ${task.opportunity_details.value}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={currentTheme.text.tertiary}>Stage:</span>
                      <span className={cn(
                        "font-medium capitalize",
                        currentTheme.text.primary
                      )}>
                        {task.opportunity_details.stage?.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={currentTheme.text.tertiary}>Probability:</span>
                      <span className={cn(
                        "font-medium",
                        currentTheme.text.primary
                      )}>
                        {task.opportunity_details.probability}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className={cn(
              "rounded-xl p-6 shadow-sm border",
              currentTheme.background.primary,
              currentTheme.border.secondary
            )}>
              <h2 className={cn(
                "text-xl font-semibold mb-4",
                currentTheme.text.primary
              )}>
                Quick Actions
              </h2>
              
              <div className="space-y-3">
                {task.status === 'open' && (
                  <Button
                    onClick={handleStart}
                    className="w-full justify-center"
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Start Task
                  </Button>
                )}
                
                {task.status === 'in_progress' && (
                  <Button
                    onClick={handleComplete}
                    className="w-full justify-center bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Complete
                  </Button>
                )}

                <Button
                  onClick={handleEdit}
                  variant="outline"
                  className="w-full justify-center"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Task
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskDetail