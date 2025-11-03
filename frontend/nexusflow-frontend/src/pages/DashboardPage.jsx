import React from 'react'
import { Users, TrendingUp, DollarSign, CheckCircle, CalendarDays } from 'lucide-react'
import { useDataStore } from '../store/dataStore'
import StatCard from '../components/dashboard/StatCard'
import RevenueChart from '../components/dashboard/RevenueChart'
import { useNavigate } from 'react-router-dom'

const DashboardPage = () => {
  const { dashboardData, fetchDashboardData } = useDataStore()
  const navigate = useNavigate()

  React.useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

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
      value: dashboardData?.closed_won || 0,
      change: calculatePercentageChange(
        dashboardData?.closed_won, 
        dashboardData?.previous_closed_won
      ),
      changeType: getChangeType(dashboardData?.closed_won, dashboardData?.previous_closed_won),
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Welcome back! Here's what's happening with your sales today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="grid grid-cols-1 gap-6">
        <RevenueChart />
      </div>

      {/* Reminders & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reminders */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Reminders
          </h3>
          <div className="space-y-4">
            {dashboardData?.upcoming_tasks?.length > 0 ? (
              dashboardData.upcoming_tasks.map((task, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                    <CalendarDays className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {task.title || 'Untitled Task'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Due {task.due_date ? new Date(task.due_date).toLocaleString() : 'soon'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming tasks 🎉</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/contacts/new')} 
              className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-600 
                        bg-white dark:bg-gray-800 
                        hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20
                        hover:border-blue-200 dark:hover:border-blue-600
                        hover:shadow-lg transition-all duration-300 ease-out"
            >
              <p className="font-medium text-gray-900 dark:text-white">Add New Contact</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Create a new contact record</p>
            </button>

            <button 
              onClick={() => navigate('/opportunities/new')}
              className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-600 
                        bg-white dark:bg-gray-800 
                        hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/20 dark:hover:to-emerald-900/20
                        hover:border-green-200 dark:hover:border-green-600
                        hover:shadow-lg transition-all duration-300 ease-out"
            >
              <p className="font-medium text-gray-900 dark:text-white">Create Opportunity</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Start a new sales opportunity</p>
            </button>

            <button 
              onClick={() => navigate('/tasks/new')}
              className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-600 
                        bg-white dark:bg-gray-800 
                        hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20
                        hover:border-purple-200 dark:hover:border-purple-600
                        hover:shadow-lg transition-all duration-300 ease-out"
            >
              <p className="font-medium text-gray-900 dark:text-white">Schedule Task</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Add a new task to your calendar</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
