import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, CheckCircle, PlayCircle, MoreVertical, User, Target } from 'lucide-react'
import { formatDateTime } from '../../lib/utils'
import { useDataStore } from '../../store/dataStore'

const TaskItem = ({ task }) => {
  const { complete, start } = useDataStore()

  const handleComplete = async () => {
    try {
      await complete(task.id)
    } catch (error) {
      console.error('Failed to complete task:', error)
    }
  }

  const handleStart = async () => {
    try {
      await start(task.id)
    } catch (error) {
      console.error('Failed to start task:', error)
    }
  }

  const isOverdue = new Date(task.due_date) < new Date() && task.status !== 'completed'

  const priorityColors = {
    high: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800',
    medium: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    low: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800',
  }

  const typeIcons = {
    call: '📞',
    email: '📧',
    meeting: '👥',
    follow_up: '🔄',
    other: '📝',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-gray-800 rounded-lg p-4 border transition-all duration-200 group ${
        isOverdue 
          ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10' 
          : 'border-gray-200 dark:border-gray-700 hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {/* Status Button */}
          {task.status === 'open' && (
            <button
              onClick={handleStart}
              className="p-1.5 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors mt-0.5"
            >
              <PlayCircle className="h-4 w-4 text-gray-400" />
            </button>
          )}
          
          {task.status === 'in_progress' && (
            <button
              onClick={handleComplete}
              className="p-1.5 rounded-full border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors mt-0.5"
            >
              <CheckCircle className="h-4 w-4 text-primary-600 dark:text-primary-400" />
            </button>
          )}
          
          {task.status === 'completed' && (
            <div className="p-1.5 rounded-full border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 mt-0.5">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          )}

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm">{typeIcons[task.task_type] || '📝'}</span>
              <h4 className={`font-medium text-sm ${
                task.status === 'completed' 
                  ? 'text-gray-500 dark:text-gray-400 line-through' 
                  : 'text-gray-900 dark:text-white'
              }`}>
                {task.title}
              </h4>
            </div>

            {task.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Task Meta */}
            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                <span className={isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : ''}>
                  {formatDateTime(task.due_date)}
                </span>
              </div>
              
              <div className={`px-2 py-1 rounded-full border text-xs font-medium ${priorityColors[task.priority]}`}>
                {task.priority}
              </div>

              {task.related_contact && (
                <div className="flex items-center">
                  <User className="h-3 w-3 mr-1" />
                  <span>{task.contact_name}</span>
                </div>
              )}

              {task.related_opportunity && (
                <div className="flex items-center">
                  <Target className="h-3 w-3 mr-1" />
                  <span className="truncate max-w-20">{task.opportunity_title}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100">
          <MoreVertical className="h-4 w-4 text-gray-400" />
        </button>
      </div>
    </motion.div>
  )
}

export default TaskItem