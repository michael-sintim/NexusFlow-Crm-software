import React from 'react'
import { Plus, Filter, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { useDataStore } from '../store/dataStore'
import TaskList from '../components/tasks/TaskList'
import Button from '../components/ui/Button'
import { useNavigate } from 'react-router-dom'

const TasksPage = () => {
  const { tasks, fetchTasks, isLoading } = useDataStore()
  const [filter, setFilter] = React.useState('all')
  const navigate = useNavigate()

  React.useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // Safely handle tasks data
  const tasksArray = React.useMemo(() => {
    if (!tasks) return []
    if (Array.isArray(tasks)) return tasks
    if (tasks.results && Array.isArray(tasks.results)) return tasks.results
    if (tasks.data && Array.isArray(tasks.data)) return tasks.data
    return []
  }, [tasks])

  const filteredTasks = tasksArray.filter(task => {
    if (filter === 'all') return true
    return task.status === filter
  })

  // Calculate task statistics
  const taskStats = {
    total: tasksArray.length,
    open: tasksArray.filter(t => t.status === 'open').length,
    in_progress: tasksArray.filter(t => t.status === 'in_progress').length,
    completed: tasksArray.filter(t => t.status === 'completed').length,
    overdue: tasksArray.filter(t => {
      if (!t.due_date) return false
      return new Date(t.due_date) < new Date() && t.status !== 'completed'
    }).length
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Loading Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            </div>
          </div>
          
          {/* Loading Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="animate-pulse">
                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              </div>
            ))}
          </div>

          {/* Loading Tasks */}
          <div className="space-y-4">
            {[1, 2, 3].map(n => (
              <div key={n} className="animate-pulse">
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-6 lg:mb-0">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Tasks
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Manage your tasks, deadlines, and reminders in one place
            </p>
          </div>
          
          <Button
            onClick={() => navigate('/tasks/new')}
            className="w-full lg:w-auto cursor-pointer px-8 bg-blue-500 py-3 hover:bg-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <Plus className="h-5 w-5 mr-2 " />
            Add New Task
          </Button>
        </div>

        {/* Task Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Tasks */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{taskStats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Filter className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          {/* Open Tasks */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Open</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{taskStats.open}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>

          {/* In Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">In Progress</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{taskStats.in_progress}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Completed */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Completed</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{taskStats.completed}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Filters Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-4 lg:mb-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Your Tasks
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} found
                  {taskStats.overdue > 0 && (
                    <span className="text-red-600 dark:text-red-400 font-medium ml-2">
                      • {taskStats.overdue} overdue
                    </span>
                  )}
                </p>
              </div>
              
              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                {['all', 'open', 'in_progress', 'completed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      filter === status
                        ? 'bg-primary-500 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-sm'
                    }`}
                  >
                    {status === 'all' ? 'All Tasks' : status.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tasks List */}
          <div className="p-6">
            <TaskList tasks={filteredTasks} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default TasksPage