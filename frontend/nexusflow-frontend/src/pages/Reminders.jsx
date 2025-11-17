import React, { useEffect, useState } from 'react'
import { CalendarDays, Clock, AlertCircle } from 'lucide-react'
import { useUIStore } from '../store/uiStore'

const Reminders = () => {
  const { theme } = useUIStore()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Theme-based styles
  const themeStyles = {
    light: {
      background: {
        primary: 'bg-white',
        secondary: 'bg-gray-50'
      },
      border: {
        primary: 'border-gray-200'
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
        secondary: 'bg-gray-700/50'
      },
      border: {
        primary: 'border-gray-700'
      },
      text: {
        primary: 'text-white',
        secondary: 'text-gray-300',
        tertiary: 'text-gray-400'
      }
    }
  }

  const currentTheme = themeStyles[theme]

  useEffect(() => {
    const fetchUpcomingTasks = async () => {
      try {
        // replace with your actual endpoint
        const res = await fetch('/api/tasks/upcoming/')
        if (!res.ok) throw new Error('Failed to fetch upcoming tasks')
        const data = await res.json()
        setTasks(data)
      } catch (err) {
        console.error('Error loading reminders:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUpcomingTasks()
  }, [])

  return (
    <div className={`lg:col-span-2 ${currentTheme.background.primary} rounded-xl p-6 shadow-sm border ${currentTheme.border.primary}`}>
      <h3 className={`text-lg font-semibold ${currentTheme.text.primary} mb-4`}>
        Reminders
      </h3>

      {/* Loading State */}
      {loading && (
        <p className={`text-sm ${currentTheme.text.tertiary}`}>Loading reminders...</p>
      )}

      {/* Error State */}
      {error && (
        <div className={`flex items-center text-red-600 dark:text-red-400 text-sm`}>
          <AlertCircle className="h-4 w-4 mr-2" />
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && tasks.length === 0 && (
        <div className={`flex items-center ${currentTheme.text.tertiary} text-sm`}>
          <AlertCircle className="h-4 w-4 mr-2" />
          No upcoming tasks — you're all caught up 🎉
        </div>
      )}

      {/* Task List */}
      {!loading && tasks.length > 0 && (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center space-x-3 p-3 rounded-lg hover:${currentTheme.background.secondary} transition-colors`}
            >
              <div className={`w-8 h-8 ${theme === 'light' ? 'bg-primary-100' : 'bg-primary-900/30'} rounded-full flex items-center justify-center`}>
                <CalendarDays className={`h-4 w-4 ${theme === 'light' ? 'text-primary-600' : 'text-primary-400'}`} />
              </div>

              <div className="flex-1">
                <p className={`text-sm font-medium ${currentTheme.text.primary}`}>
                  {task.title}
                </p>
                <p className={`text-xs ${currentTheme.text.tertiary} flex items-center`}>
                  <Clock className="h-3 w-3 mr-1" />
                  Due {new Date(task.due_date).toLocaleString()}
                </p>
              </div>

              {task.priority && (
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    task.priority === 'high'
                      ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'
                      : task.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400'
                      : 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400'
                  }`}
                >
                  {task.priority}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Reminders