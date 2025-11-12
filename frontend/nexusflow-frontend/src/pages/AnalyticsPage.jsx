import React from 'react'
import { 
  Trophy, 
  Target, 
  Clock, 
  TrendingUp,
  DollarSign,
  Calendar,
  CheckCircle,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'
import { useDataStore } from '../store/dataStore'
import StatCard from '../components/dashboard/StatCard'
import SalesFunnel from '../components/dashboard/SalesFunnel'
import RevenueChart from '../components/dashboard/RevenueChart'

const AnalyticsPage = () => {
  const { 
    dashboardData, 
    pipelineData, 
    fetchDashboardData, 
    fetchPipelineData,
    opportunities,
    tasks 
  } = useDataStore()

  React.useEffect(() => {
    fetchDashboardData()
    fetchPipelineData()
  }, [fetchDashboardData, fetchPipelineData])

  // Calculate real metrics from data
  const totalOpportunities = opportunities?.length || 0
  const wonOpportunities = opportunities?.filter(opp => opp.stage === 'closed_won').length || 0
  const lostOpportunities = opportunities?.filter(opp => opp.stage === 'closed_lost').length || 0
  const activeOpportunities = opportunities?.filter(opp => !['closed_won', 'closed_lost'].includes(opp.stage)).length || 0
  
  const winRate = totalOpportunities > 0 ? Math.round((wonOpportunities / totalOpportunities) * 100) : 0
  const totalPipelineValue = opportunities?.reduce((sum, opp) => sum + (parseFloat(opp.value) || 0), 0) || 0
  const avgDealSize = wonOpportunities > 0 ? Math.round(totalPipelineValue / wonOpportunities) : 0
  const completedTasks = tasks?.filter(task => task.status === 'completed').length || 0

  const analyticsStats = [
    {
      title: 'Win Rate',
      value: winRate,
      change: 5, // This could be calculated from historical data
      changeType: 'positive',
      format: 'percent',
      icon: Trophy,
      color: 'green'
    },
    {
      title: 'Avg Deal Size',
      value: avgDealSize,
      change: 12,
      changeType: 'positive',
      format: 'currency',
      icon: DollarSign,
      color: 'blue'
    },
    {
      title: 'Sales Cycle',
      value: 45, // This would come from your actual data
      change: -8,
      changeType: 'positive',
      format: 'number',
      icon: Clock,
      color: 'purple'
    },
    {
      title: 'Conversion Rate',
      value: dashboardData?.conversion_rate || 23,
      change: 3,
      changeType: 'positive',
      format: 'percent',
      icon: TrendingUp,
      color: 'orange'
    },
  ]

  // Calculate stage performance for pipeline
  const stagePerformance = [
    { name: 'New Lead', count: opportunities?.filter(opp => opp.stage === 'prospect').length || 0, value: opportunities?.filter(opp => opp.stage === 'prospect').reduce((sum, opp) => sum + (parseFloat(opp.value) || 0), 0) || 0 },
    { name: 'Needs', count: opportunities?.filter(opp => opp.stage === 'qualified').length || 0, value: opportunities?.filter(opp => opp.stage === 'qualified').reduce((sum, opp) => sum + (parseFloat(opp.value) || 0), 0) || 0 },
    { name: 'Price Discussion', count: opportunities?.filter(opp => opp.stage === 'proposal').length || 0, value: opportunities?.filter(opp => opp.stage === 'proposal').reduce((sum, opp) => sum + (parseFloat(opp.value) || 0), 0) || 0 },
    { name: 'Negotiation', count: opportunities?.filter(opp => opp.stage === 'negotiation').length || 0, value: opportunities?.filter(opp => opp.stage === 'negotiation').reduce((sum, opp) => sum + (parseFloat(opp.value) || 0), 0) || 0 },
    { name: 'Closed Won', count: wonOpportunities, value: opportunities?.filter(opp => opp.stage === 'closed_won').reduce((sum, opp) => sum + (parseFloat(opp.value) || 0), 0) || 0 },
  ]

  const totalValue = stagePerformance.reduce((sum, stage) => sum + stage.value, 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          Analytics Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-3 text-lg">
          Deep insights into your sales performance, trends, and key metrics
        </p>
      </div>

      {/* Analytics Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Revenue Trends
            </h3>
          </div>
          <RevenueChart />
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="h-5 w-5 text-purple-500" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Sales Funnel
            </h3>
          </div>
          <SalesFunnel />
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pipeline Performance */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="h-5 w-5 text-green-500" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Pipeline Performance
            </h3>
          </div>
          <div className="space-y-4">
            {stagePerformance.map((stage, index) => {
              const percentage = totalValue > 0 ? Math.round((stage.value / totalValue) * 100) : 0
              return (
                <div key={index} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 group">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 group-hover:scale-125 transition-transform duration-300" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {stage.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {stage.count} {stage.count === 1 ? 'opportunity' : 'opportunities'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">
                      ${(stage.value / 1000).toFixed(0)}K
                    </p>
                    <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
                      {percentage}%
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-6">
              <Target className="h-5 w-5 text-orange-500" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Performance Summary
              </h3>
            </div>
            <div className="space-y-5">
              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Win Rate</span>
                </div>
                <span className="font-bold text-green-600 dark:text-green-400 text-lg">
                  {winRate}%
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Revenue </span>
                </div>
                <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                  ${(totalPipelineValue / 1000).toFixed(0)}K
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Active Deals</span>
                </div>
                <span className="font-bold text-purple-600 dark:text-purple-400 text-lg">
                  {activeOpportunities}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Tasks Completed</span>
                </div>
                <span className="font-bold text-orange-600 dark:text-orange-400 text-lg">
                  {completedTasks}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Insights */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="h-5 w-5 text-indigo-500" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Quick Insights
              </h3>
            </div>
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
                <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
                  Conversion Health
                </p>
                <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-1">
                  {winRate >= 30 ? 'Excellent' : winRate >= 20 ? 'Good' : 'Needs Improvement'}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                  Pipeline Strength
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                  {totalPipelineValue >= 100000 ? 'Strong' : 'Growing'} pipeline
                </p>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                  Activity Level
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                  {completedTasks >= 10 ? 'Highly Active' : 'Moderate'} performance
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage  