// pages/PipelinePage.jsx
import React from 'react'
import { Plus, TrendingUp, Users, Target, DollarSign } from 'lucide-react'
import { useDataStore } from '../store/dataStore'
import Button from '../components/ui/Button'
import { useNavigate } from 'react-router-dom'
import PipelineKanban from '../components/pipeline/KanbanBoard'

const PipelinePage = () => {
  const { opportunities, fetchOpportunities, pipelineData, isLoading } = useDataStore()
  const navigate = useNavigate()

  React.useEffect(() => {
    fetchOpportunities()
  }, [fetchOpportunities])

  // Memoized calculations to prevent recomputing on every render
  const metrics = React.useMemo(() => {
    const totalValue = opportunities.reduce((sum, opp) => sum + parseFloat(opp.value || 0), 0)
    const weightedValue = opportunities.reduce((sum, opp) => {
      const probability = parseInt(opp.probability || 0) / 100
      return sum + (parseFloat(opp.value || 0) * probability)
    }, 0)
    const activeOpportunities = opportunities.filter(opp => 
      !['closed_won', 'closed_lost'].includes(opp.stage)
    ).length
    const wonOpportunities = opportunities.filter(opp => opp.stage === 'closed_won').length
    const totalOpportunities = opportunities.length

    return {
      totalValue,
      weightedValue,
      activeOpportunities,
      winRate: totalOpportunities > 0 ? (wonOpportunities / totalOpportunities) * 100 : 0,
      avgDealSize: totalOpportunities > 0 ? totalValue / totalOpportunities : 0
    }
  }, [opportunities])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 h-24"></div>
              ))}
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 h-96"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="space-y-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Sales Pipeline
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Track and manage your sales opportunities
              </p>
            </div>
            
            <Button
              onClick={() => navigate('/opportunities/new')}
              className="mt-4 sm:mt-0 bg-primary-600 hover:bg-primary-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Opportunity
            </Button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <MetricCard
              title="Total Pipeline"
              value={`$${(metrics.totalValue / 1000).toFixed(1)}K`}
              subtitle={`$${(metrics.weightedValue / 1000).toFixed(1)}K weighted`}
              icon={<DollarSign className="h-6 w-6" />}
              color="blue"
            />
            
            <MetricCard
              title="Active Deals"
              value={metrics.activeOpportunities}
              subtitle={`${opportunities.length} total opportunities`}
              icon={<Target className="h-6 w-6" />}
              color="green"
            />
            
            <MetricCard
              title="Win Rate"
              value={`${metrics.winRate.toFixed(0)}%`}
              subtitle="Last 30 days"
              icon={<TrendingUp className="h-6 w-6" />}
              color="purple"
            />
            
            <MetricCard
              title="Avg Deal Size"
              value={`$${(metrics.avgDealSize / 1000).toFixed(1)}K`}
              subtitle="Across all stages"
              icon={<Users className="h-6 w-6" />}
              color="orange"
            />
          </div>

          {/* Pipeline Stage Summary */}
          <PipelineStagesSummary pipelineData={pipelineData} />
        </div>

        {/* Kanban Board Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Opportunity Pipeline
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Drag and drop opportunities between stages
            </p>
          </div>
          <PipelineKanban opportunities={opportunities} />
        </div>
      </div>
    </div>
  )
}

// Separate component for metric cards
const MetricCard = ({ title, value, subtitle, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        {subtitle}
      </div>
    </div>
  )
}

// Separate component for pipeline stages
const PipelineStagesSummary = React.memo(({ pipelineData }) => {
  if (!pipelineData) return null

  const totalActive = pipelineData.reduce((sum, stage) => {
    if (!['closed_won', 'closed_lost'].includes(stage.stage)) {
      return sum + stage.count
    }
    return sum
  }, 0)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Pipeline Stages
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {pipelineData.map((stage) => (
          <div key={stage.stage} className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stage.count}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 capitalize">
              {stage.name.replace('_', ' ')}
            </div>
            <div className="text-xs text-primary-600 dark:text-primary-400 font-medium mt-1">
              ${(stage.value / 1000).toFixed(1)}K
            </div>
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
              <div 
                className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                style={{ 
                  width: `${totalActive > 0 ? (stage.count / totalActive) * 100 : 0}%` 
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})

export default PipelinePage