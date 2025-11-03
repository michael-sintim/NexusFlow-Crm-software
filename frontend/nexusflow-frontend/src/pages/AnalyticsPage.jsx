import React from 'react'
import { useDataStore } from '../store/dataStore'
import StatCard from '../components/dashboard/StatCard'
import SalesFunnel from '../components/dashboard/SalesFunnel'
import RevenueChart from '../components/dashboard/RevenueChart'

const AnalyticsPage = () => {
  const { dashboardData, pipelineData, fetchDashboardData, fetchPipelineData } = useDataStore()

  React.useEffect(() => {
    fetchDashboardData()
    fetchPipelineData()
  }, [fetchDashboardData, fetchPipelineData])

  const analyticsStats = [
    {
      title: 'Win Rate',
      value: dashboardData?.win_rate || 0,
      change: 5,
      changeType: 'positive',
      format: 'percent'
    },
    {
      title: 'Avg Deal Size',
      value: dashboardData?.avg_deal_size || 0,
      change: 12,
      changeType: 'positive',
      format: 'currency'
    },
    {
      title: 'Sales Cycle',
      value: 45,
      change: -8,
      changeType: 'positive',
      format: 'number'
    },
    {
      title: 'Conversion Rate',
      value: 23,
      change: 3,
      changeType: 'positive',
      format: 'percent'
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Deep insights into your sales performance and trends
        </p>
      </div>

      {/* Analytics Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart />
        <SalesFunnel />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Performance */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Pipeline Performance
          </h3>
          <div className="space-y-4">
            {pipelineData?.map((stage) => (
              <div key={stage.stage} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {stage.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {stage.count} opportunities
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    ${(stage.value / 1000).toFixed(0)}K
                  </p>
                  <p className="text-sm text-primary-600 dark:text-primary-400">
                    {stage.percentage}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Performance Summary
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Monthly Target</span>
              <span className="font-medium text-gray-900 dark:text-white">85%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Quarterly Growth</span>
              <span className="font-medium text-green-600 dark:text-green-400">+12%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Active Deals</span>
              <span className="font-medium text-gray-900 dark:text-white">24</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Avg Response Time</span>
              <span className="font-medium text-gray-900 dark:text-white">2.3h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage