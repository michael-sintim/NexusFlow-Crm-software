import React from 'react'
import { Plus, TrendingUp, Users, DollarSign, Target } from 'lucide-react'
import { useDataStore } from '../store/dataStore'
import KanbanBoard from '../components/pipeline/KanbanBoard'
import Button from '../components/ui/Button'
import { useNavigate } from 'react-router-dom'

const PipelinePage = () => {
  const { opportunities, fetchOpportunities, pipelineData } = useDataStore()
  const navigate = useNavigate()

  React.useEffect(() => {
    fetchOpportunities()
  }, [fetchOpportunities])

  // Calculate total pipeline value
  const totalValue = pipelineData?.reduce((sum, stage) => sum + stage.value, 0) || 0
  const totalOpportunities = pipelineData?.reduce((sum, stage) => sum + stage.count, 0) || 0

  // Enhanced stats with icons and better formatting
  const quickStats = [
    {
      label: 'Total Pipeline',
      value: `$${(totalValue / 1000).toFixed(1)}K`,
      icon: DollarSign,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      label: 'Opportunities',
      value: totalOpportunities.toString(),
      icon: Target,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      label: 'Active Contacts',
      value: '24', // This could come from your data store
      icon: Users,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      label: 'Win Rate',
      value: '42%',
      icon: TrendingUp,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Sales Pipeline
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1 text-lg">
                    Track and manage your sales opportunities effectively
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-4 lg:mt-0">
              <Button
                variant="outline"
                onClick={() => navigate('/analytics')}
                className="hidden sm:flex"
              >
                View Analytics
              </Button>
              <Button
                onClick={() => navigate('/opportunities/new')}
                className="shadow-lg shadow-blue-500/25"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Opportunity
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <IconComponent className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Pipeline Stage Stats */}
        {pipelineData && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Pipeline Stages
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {totalOpportunities} opportunities
              </span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              {pipelineData.map((stage, index) => (
                <div
                  key={stage.stage}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 group"
                >
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {stage.count}
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white mb-1 line-clamp-2">
                    {stage.name}
                  </div>
                  <div className="text-xs text-primary-600 dark:text-primary-400 font-semibold">
                    ${(stage.value / 1000).toFixed(1)}K
                  </div>
                  {/* Progress bar indicator */}
                  <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                    <div
                      className="bg-blue-600 h-1 rounded-full transition-all duration-300 group-hover:bg-blue-500"
                      style={{
                        width: `${(stage.count / totalOpportunities) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Kanban Board Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Opportunity Board
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Drag and drop opportunities between stages
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>High Priority</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Medium</span>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Kanban Board */}
          <div className="p-4">
            <div className="w-full overflow-x-auto overflow-y-hidden">
              <div className="min-w-max pb-4">
                <KanbanBoard opportunities={opportunities} />
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {(!opportunities || opportunities.length === 0) && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No opportunities yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start building your sales pipeline by adding your first opportunity.
              </p>
              <Button
                onClick={() => navigate('/opportunities/new')}
                size="lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Opportunity
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PipelinePage