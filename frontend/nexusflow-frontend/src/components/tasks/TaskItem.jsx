import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, CheckCircle, PlayCircle, MoreVertical, User, Target, Edit, Trash2, Eye, RotateCw } from 'lucide-react'
import { formatDateTime } from '../../lib/utils'
import { useDataStore } from '../../store/dataStore'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '../../store/uiStore'
import { cn } from '../../lib/utils'

const TaskItem = ({ task }) => {
  const { updateTask, deleteTask, fetchTasks } = useDataStore()
  const { theme } = useUIStore()
  const navigate = useNavigate()
  const [showActions, setShowActions] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  // Theme-based styles
  const themeStyles = {
    light: {
      background: {
        primary: 'bg-white',
        secondary: 'bg-gray-50',
      },
      border: {
        primary: 'border-gray-200',
        secondary: 'border-gray-300'
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

  // Function to cycle task status
  const cycleTaskStatus = async (e) => {
    e.stopPropagation()
    
    const statusCycle = {
      'open': 'in_progress',
      'in_progress': 'completed', 
      'completed': 'open'
    }

    const newStatus = statusCycle[task.status] || 'open'
    
    try {
      await updateTask(task.id, { 
        ...task, 
        status: newStatus 
      })
      fetchTasks()
    } catch (error) {
      console.error('Error updating task status:', error)
    }
  }

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteTask(task.id)
    } catch (error) {
      console.error('Failed to delete task:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = (e) => {
    e.stopPropagation()
    navigate(`/tasks/${task.id}/edit`)
  }

  const handleView = (e) => {
    e.stopPropagation()
    navigate(`/tasks/${task.id}`)
  }

  const handleCardClick = () => {
    navigate(`/tasks/${task.id}`)
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

  const typeIcons = {
    call: '📞',
    email: '📧',
    meeting: '👥',
    follow_up: '🔄',
    other: '📝',
  }

  // Status button configuration
  const statusConfig = {
    open: {
      icon: PlayCircle,
      label: 'Start Task',
      className: cn(
        "p-1.5 rounded-full border transition-colors mt-0.5",
        theme === 'light'
          ? "border-gray-300 hover:bg-gray-50"
          : "border-gray-600 hover:bg-gray-700"
      ),
      iconClassName: cn(
        "h-4 w-4",
        theme === 'light' 
          ? "text-gray-400 hover:text-blue-500" 
          : "text-gray-500 hover:text-blue-400"
      )
    },
    in_progress: {
      icon: CheckCircle,
      label: 'Complete Task',
      className: cn(
        "p-1.5 rounded-full border transition-colors mt-0.5",
        theme === 'light'
          ? "border-primary-200 bg-primary-50 hover:bg-primary-100"
          : "border-primary-800 bg-primary-900/20 hover:bg-primary-900/30"
      ),
      iconClassName: cn(
        "h-4 w-4",
        theme === 'light'
          ? "text-primary-600 hover:text-green-500"
          : "text-primary-400 hover:text-green-400"
      )
    },
    completed: {
      icon: RotateCw,
      label: 'Reopen Task',
      className: cn(
        "p-1.5 rounded-full border transition-colors mt-0.5",
        theme === 'light'
          ? "border-green-200 bg-green-50 hover:bg-green-100"
          : "border-green-800 bg-green-900/20 hover:bg-green-900/30"
      ),
      iconClassName: cn(
        "h-4 w-4",
        theme === 'light'
          ? "text-green-600 hover:text-blue-500"
          : "text-green-400 hover:text-blue-400"
      )
    }
  }

  const currentStatus = statusConfig[task.status] || statusConfig.open
  const StatusIcon = currentStatus.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-lg p-4 border transition-all duration-200 group cursor-pointer",
        isOverdue 
          ? cn(
              theme === 'light'
                ? "border-red-200 bg-red-50"
                : "border-red-800 bg-red-900/10"
            )
          : cn(
              currentTheme.background.primary,
              currentTheme.border.primary,
              theme === 'light'
                ? "hover:shadow-md hover:border-gray-300"
                : "hover:shadow-md hover:border-gray-600"
            )
      )}
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {/* Status Button - Now cycles through all statuses */}
          <button
            onClick={cycleTaskStatus}
            className={currentStatus.className}
            title={currentStatus.label}
          >
            <StatusIcon className={currentStatus.iconClassName} />
          </button>

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm">{typeIcons[task.task_type] || '📝'}</span>
              <h4 className={cn(
                "font-medium text-sm",
                task.status === 'completed' 
                  ? cn(
                      theme === 'light' 
                        ? "text-gray-500 line-through" 
                        : "text-gray-400 line-through"
                    )
                  : currentTheme.text.primary
              )}>
                {task.title}
              </h4>
            </div>

            {task.description && (
              <p className={cn(
                "text-sm mb-3 line-clamp-2",
                currentTheme.text.tertiary
              )}>
                {task.description}
              </p>
            )}

            {/* Task Meta */}
            <div className={cn(
              "flex items-center space-x-4 text-xs",
              currentTheme.text.tertiary
            )}>
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                <span className={isOverdue ? cn(
                  theme === 'light' ? 'text-red-600' : 'text-red-400',
                  "font-medium"
                ) : ''}>
                  {formatDateTime(task.due_date)}
                </span>
              </div>
              
              <div className={cn(
                "px-2 py-1 rounded-full border text-xs font-medium",
                priorityColors[task.priority]
              )}>
                {task.priority}
              </div>

              {task.contact_details && (
                <div className="flex items-center">
                  <User className="h-3 w-3 mr-1" />
                  <span>{task.contact_details.first_name} {task.contact_details.last_name}</span>
                </div>
              )}

              {task.opportunity_details && (
                <div className="flex items-center">
                  <Target className="h-3 w-3 mr-1" />
                  <span className="truncate max-w-20">{task.opportunity_details.title}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions Dropdown */}
        <div className="relative">
          <button 
            onClick={(e) => {
              e.stopPropagation()
              setShowActions(!showActions)
            }}
            className={cn(
              "p-1 rounded transition-colors opacity-0 group-hover:opacity-100",
              theme === 'light' 
                ? "hover:bg-gray-100" 
                : "hover:bg-gray-700"
            )}
          >
            <MoreVertical className={cn(
              "h-4 w-4",
              currentTheme.text.tertiary
            )} />
          </button>

          {showActions && (
            <div className={cn(
              "absolute right-0 top-8 border rounded-lg shadow-lg z-10 min-w-32",
              currentTheme.background.primary,
              currentTheme.border.secondary
            )}>
              <button
                onClick={handleView}
                className={cn(
                  "w-full text-left px-4 py-2 text-sm flex items-center transition-colors",
                  theme === 'light'
                    ? "text-gray-700 hover:bg-gray-50"
                    : "text-gray-300 hover:bg-gray-700"
                )}
              >
                <Eye className="h-4 w-4 mr-2" />
                View
              </button>
              
              <button
                onClick={handleEdit}
                className={cn(
                  "w-full text-left px-4 py-2 text-sm flex items-center transition-colors",
                  theme === 'light'
                    ? "text-gray-700 hover:bg-gray-50"
                    : "text-gray-300 hover:bg-gray-700"
                )}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </button>
              
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={cn(
                  "w-full text-left px-4 py-2 text-sm flex items-center transition-colors disabled:opacity-50",
                  theme === 'light'
                    ? "text-red-600 hover:bg-red-50"
                    : "text-red-400 hover:bg-red-900/20"
                )}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {showActions && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={(e) => {
            e.stopPropagation()
            setShowActions(false)
          }}
        />
      )}
    </motion.div>
  )
}

export default TaskItem