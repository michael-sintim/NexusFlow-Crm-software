import React from 'react'
import TaskItem from './TaskItem'
import { useUIStore } from '../../store/uiStore'

const TaskList = ({ tasks }) => {
  const { theme } = useUIStore()

  // Theme-based styles
  const themeStyles = {
    light: {
      background: {
        primary: 'bg-white',
        secondary: 'bg-gray-50',
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

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className={cn(
          "w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4",
          theme === 'light' ? 'bg-gray-100' : 'bg-gray-800'
        )}>
          <svg className={cn(
            "h-8 w-8",
            theme === 'light' ? 'text-gray-400' : 'text-gray-500'
          )} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className={cn(
          "text-lg font-medium mb-2",
          currentTheme.text.primary
        )}>
          No tasks found
        </h3>
        <p className={cn(
          "max-w-sm mx-auto",
          currentTheme.text.tertiary
        )}>
          Create your first task to stay organized and track your activities.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  )
}

export default TaskList