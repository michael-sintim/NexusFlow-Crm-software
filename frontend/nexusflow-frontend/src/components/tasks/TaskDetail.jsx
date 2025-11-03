import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Calendar, Clock, CheckCircle, PlayCircle, 
  User, Target, FileText, AlertCircle, Edit, Trash2,
  Mail, Phone, Building, MapPin, DollarSign
} from 'lucide-react'
import { useDataStore } from '../../store/dataStore'
import Button from '../ui/Button'
import { formatDateTime,formatDate } from '../../lib/utils'


const TaskDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
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

  React.useEffect(() => {
    const loadTask = async () => {
      if (tasks.length === 0) {
        await fetchTasks()
      }
      
      // Find the task in the store
      const foundTask = tasks.find(t => t.id === id)
      if (foundTask) {
        setTask(foundTask)
      } else {
        // If not found in store, try to fetch it individually
        try {
          // You might need to add a getTaskById method to your data store
          await fetchTasks() // Refresh the list
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
      // Refresh the task data
      await fetchTasks()
    } catch (error) {
      console.error('Failed to complete task:', error)
    }
  }

  const handleStart = async () => {
    try {
      await start(id)
      // Refresh the task data
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Loading Header */}
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
          </div>
          
          {/* Loading Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map(n => (
                <div key={n} className="animate-pulse">
                  <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map(n => (
                <div key={n} className="animate-pulse">
                  <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Task Not Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
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
    high: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800',
    medium: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    low: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800',
  }

  const statusColors = {
    open: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
    in_progress: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    completed: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800',
  }

  const typeIcons = {
    call: '📞',
    email: '📧',
    meeting: '👥',
    follow_up: '🔄',
    other: '📝',
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/tasks')}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {task.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
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
              className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20"
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
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-500" />
                Task Details
              </h2>
              
              <div className="space-y-4">
                {/* Description */}
                {task.description && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                      {task.description}
                    </p>
                  </div>
                )}

                {/* Task Meta */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{typeIcons[task.task_type] || '📝'}</span>
                      <span className="text-gray-900 dark:text-white capitalize">
                        {task.task_type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusColors[task.status]}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Due Date
                    </h3>
                    <div className={`flex items-center space-x-2 ${
                      isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-900 dark:text-white'
                    }`}>
                      <Calendar className="h-4 w-4" />
                      <span>{formatDateTime(task.due_date)}</span>
                      {isOverdue && <AlertCircle className="h-4 w-4" />}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned User */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-green-500" />
                Assigned To
              </h2>
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-medium">
                  {task.assigned_to_details?.first_name?.[0]}{task.assigned_to_details?.last_name?.[0]}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {task.assigned_to_details?.first_name} {task.assigned_to_details?.last_name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
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
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-purple-500" />
                  Related Contact
                </h2>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {task.contact_details.first_name[0]}{task.contact_details.last_name[0]}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {task.contact_details.first_name} {task.contact_details.last_name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {task.contact_details.title || 'No title'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>{task.contact_details.email}</span>
                    </div>
                    
                    {task.contact_details.phone_number && (
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Phone className="h-4 w-4 mr-2" />
                        <span>{task.contact_details.phone_number}</span>
                      </div>
                    )}
                    
                    {task.contact_details.company_name && (
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
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
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-orange-500" />
                  Related Opportunity
                </h2>
                
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {task.opportunity_details.title}
                  </h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Value:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ${task.opportunity_details.value}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Stage:</span>
                      <span className="font-medium text-gray-900 dark:text-white capitalize">
                        {task.opportunity_details.stage?.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Probability:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {task.opportunity_details.probability}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
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