import React from 'react'
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  CheckCircle, 
  CalendarDays,
  Plus,
  Target,
  FileText,
  Clock,
  Calendar,
  Phone,
  Mail,
  UserPlus,
  Briefcase,
  Star,
  BarChart3  // ← Add this import
} from 'lucide-react'
import { useDataStore } from '../store/dataStore'
import StatCard from '../components/dashboard/StatCard'
import RevenueChart from '../components/dashboard/RevenueChart'
import { useNavigate } from 'react-router-dom'

const DashboardPage = () => {
  const { 
    dashboardData, 
    fetchDashboardData, 
    tasks, 
    fetchTasks,
    opportunities, 
    fetchOpportunities,
    contacts, 
    calendarEvents, 
    fetchCalendarEvents 
  } = useDataStore()
  
  const navigate = useNavigate()

  React.useEffect(() => {
    // Fetch all necessary data when component mounts
    const fetchAllData = async () => {
      try {
        await fetchDashboardData()
        await fetchTasks()
        await fetchCalendarEvents()
        await fetchOpportunities()
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      }
    }

    fetchAllData()
  }, [fetchDashboardData, fetchTasks, fetchCalendarEvents, fetchOpportunities])

  // Safely handle data - same logic as other pages
  const tasksArray = React.useMemo(() => {
    if (!tasks) return []
    if (Array.isArray(tasks)) return tasks
    if (tasks.results && Array.isArray(tasks.results)) return tasks.results
    if (tasks.data && Array.isArray(tasks.data)) return tasks.data
    return []
  }, [tasks])

  // Use calendarEvents instead of events to match Calendar page
  const eventsArray = React.useMemo(() => {
    if (!calendarEvents) return []
    if (Array.isArray(calendarEvents)) return calendarEvents
    if (calendarEvents.results && Array.isArray(calendarEvents.results)) return calendarEvents.results
    if (calendarEvents.data && Array.isArray(calendarEvents.data)) return calendarEvents.data
    return []
  }, [calendarEvents])

  const opportunitiesArray = React.useMemo(() => {
    if (!opportunities) return []
    if (Array.isArray(opportunities)) return opportunities
    if (opportunities.results && Array.isArray(opportunities.results)) return opportunities.results
    if (opportunities.data && Array.isArray(opportunities.data)) return opportunities.data
    return []
  }, [opportunities])

  // Calculate completed tasks count
  const completedTasksCount = tasksArray.filter(t => t.status === 'completed').length

  // Get recent tasks (last 7 days)
  const recentTasks = tasksArray
    .filter(task => {
      if (!task.created_at && !task.due_date) return false
      const taskDate = new Date(task.created_at || task.due_date)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return taskDate >= weekAgo
    })
    .slice(0, 5) // Limit to 5 most recent

  // Get upcoming events (next 7 days) - using calendarEvents data
  const upcomingEvents = eventsArray
    .filter(event => {
      if (!event.start_time && !event.created_at) return false
      const eventDate = new Date(event.start_time || event.created_at)
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)
      return eventDate <= nextWeek && eventDate >= new Date()
    })
    .slice(0, 5) // Limit to 5 upcoming

  // Get recent opportunities (last 7 days)
  const recentOpportunities = opportunitiesArray
    .filter(opp => {
      if (!opp.created_at) return false
      const oppDate = new Date(opp.created_at)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return oppDate >= weekAgo
    })
    .slice(0, 3) // Limit to 3 most recent

  const previousCompletedTasksCount = 0

  const stats = [
    {
      title: 'Total Customers',
      value: dashboardData?.total_contacts || 0,
      change: calculatePercentageChange(
        dashboardData?.total_contacts, 
        dashboardData?.previous_total_contacts
      ),
      changeType: getChangeType(dashboardData?.total_contacts, dashboardData?.previous_total_contacts),
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Potential Sales',
      value: dashboardData?.total_opportunities || 0,
      change: calculatePercentageChange(
        dashboardData?.total_opportunities, 
        dashboardData?.previous_total_opportunities
      ),
      changeType: getChangeType(dashboardData?.total_opportunities, dashboardData?.previous_total_opportunities),
      icon: TrendingUp,
      color: 'purple'
    },
    {
      title: 'Revenue in Progress',
      value: dashboardData?.total_value || 0,
      change: calculatePercentageChange(
        dashboardData?.total_value, 
        dashboardData?.previous_total_value
      ),
      changeType: getChangeType(dashboardData?.total_value, dashboardData?.previous_total_value),
      icon: DollarSign,
      color: 'green',
      format: 'currency'
    },
    {
      title: 'Tasks Completed',
      value: completedTasksCount,
      change: calculatePercentageChange(completedTasksCount, previousCompletedTasksCount),
      changeType: getChangeType(completedTasksCount, previousCompletedTasksCount),
      icon: CheckCircle,
      color: 'orange'
    },
  ]

  // Helper function to calculate percentage change
  function calculatePercentageChange(current, previous) {
    if (!previous || previous === 0) return 0;
    const change = ((current - previous) / previous) * 100;
    return Math.round(change);
  }

  // Helper function to determine if change is positive or negative
  function getChangeType(current, previous) {
    if (!previous) return 'positive';
    return current >= previous ? 'positive' : 'negative';
  }

  // Get icon for task type
  const getTaskIcon = (task) => {
    if (task.priority === 'high') return <Star className="h-4 w-4 text-red-500" />
    if (task.type === 'call') return <Phone className="h-4 w-4 text-blue-500" />
    if (task.type === 'meeting') return <Users className="h-4 w-4 text-purple-500" />
    if (task.type === 'email') return <Mail className="h-4 w-4 text-green-500" />
    return <FileText className="h-4 w-4 text-gray-500" />
  }

  // Get icon for event type - matching Calendar page logic
  const getEventIcon = (event) => {
    if (event.event_type === 'meeting') return <Users className="h-4 w-4 text-blue-500" />
    if (event.event_type === 'call') return <Phone className="h-4 w-4 text-purple-500" />
    if (event.event_type === 'appointment') return <CheckCircle className="h-4 w-4 text-green-500" />
    if (event.event_type === 'deadline') return <Clock className="h-4 w-4 text-red-500" />
    return <CalendarDays className="h-4 w-4 text-gray-500" />
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r text-left from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-left mt-3 text-lg">
          Welcome back! Here's your activity overview and quick insights.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Tasks */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Recent Tasks
              </h3>
              <button 
                onClick={() => navigate('/tasks')}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentTasks.length > 0 ? (
                recentTasks.map((task, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                      {getTaskIcon(task)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {task.title || 'Untitled Task'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          task.status === 'completed' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : task.status === 'in_progress'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {task.status?.replace('_', ' ') || 'open'}
                        </span>
                        {task.due_date && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Due {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No recent tasks</p>
                  <button 
                    onClick={() => navigate('/tasks/new')}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium mt-2"
                  >
                    Create your first task
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-500" />
                Upcoming Events
              </h3>
              <button 
                onClick={() => navigate('/calendar')}
                className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
              >
                View Calendar
              </button>
            </div>
            <div className="space-y-4">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-center w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                      {getEventIcon(event)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {event.title || 'Untitled Event'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {event.start_time ? new Date(event.start_time).toLocaleString() : 'Date not set'}
                        {event.location && ` • ${event.location}`}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CalendarDays className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No upcoming events</p>
                  <button 
                    onClick={() => navigate('/calendar')}
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium mt-2"
                  >
                    Schedule an event
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-500" />
              Quick Actions
            </h3>
            <div className="space-y-4">
              <button
                onClick={() => navigate('/contacts/new')} 
                className="w-full text-left p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 
                          bg-white dark:bg-gray-800 
                          hover:border-blue-300 dark:hover:border-blue-600
                          hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/20 dark:hover:to-blue-800/20
                          hover:shadow-lg transition-all duration-300 ease-out group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Add Contact</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Create new contact record</p>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => navigate('/opportunities/new')}
                className="w-full text-left p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 
                          bg-white dark:bg-gray-800 
                          hover:border-green-300 dark:hover:border-green-600
                          hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 dark:hover:from-green-900/20 dark:hover:to-green-800/20
                          hover:shadow-lg transition-all duration-300 ease-out group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">New Deal</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Start Deals</p>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => navigate('/tasks/new')}
                className="w-full text-left p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 
                          bg-white dark:bg-gray-800 
                          hover:border-orange-300 dark:hover:border-orange-600
                          hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 dark:hover:from-orange-900/20 dark:hover:to-orange-800/20
                          hover:shadow-lg transition-all duration-300 ease-out group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Create Task</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Add new task</p>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => navigate('/calendar')}
                className="w-full text-left p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 
                          bg-white dark:bg-gray-800 
                          hover:border-purple-300 dark:hover:border-purple-600
                          hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 dark:hover:from-purple-900/20 dark:hover:to-purple-800/20
                          hover:shadow-lg transition-all duration-300 ease-out group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Schedule Event</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Add calendar event</p>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => navigate('/pipeline')}
                className="w-full text-left p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 
                          bg-white dark:bg-gray-800 
                          hover:border-indigo-300 dark:hover:border-indigo-600
                          hover:bg-gradient-to-r hover:from-indigo-50 hover:to-indigo-100 dark:hover:from-indigo-900/20 dark:hover:to-indigo-800/20
                          hover:shadow-lg transition-all duration-300 ease-out group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Revenue</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400"> View Revenue</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Recent Opportunities */}
          {recentOpportunities.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Recent Revenue 
              </h3>
              <div className="space-y-3">
                {recentOpportunities.map((opp, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {opp.title || 'Untitled Opportunity'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {opp.contact?.company_name || 'No company'}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                      ${opp.value ? parseInt(opp.value).toLocaleString() : '0'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Revenue Chart - Moved to Bottom */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Revenue Trends
          </h3>
        </div>
        <RevenueChart />
      </div>
    </div>
  )
}
1212
export default DashboardPage