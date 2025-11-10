// pages/PipelinePage.jsx
import React, { useEffect, useState } from 'react'
import { Plus, TrendingUp, Users, Target, DollarSign, Trophy, Search } from 'lucide-react'
import { useDataStore } from '../store/dataStore'
import Button from '../components/ui/Button'
import { useNavigate } from 'react-router-dom'
import KanbanBoard from '../components/pipeline/KanbanBoard'

const PipelinePage = () => {
  const navigate = useNavigate()
  
  // Get data from store with safe defaults
  const { 
    opportunities = [], 
    opportunitiesLoading,
    fetchOpportunities,
    fetchPipelineData
  } = useDataStore()

  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStage, setSelectedStage] = useState('')

  // Safe data fetch with error handling
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        await Promise.all([
          fetchOpportunities(),
          fetchPipelineData()
        ])
      } catch (error) {
        console.error('Failed to load pipeline data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [fetchOpportunities, fetchPipelineData])

  // Safe metric calculations
  const metrics = React.useMemo(() => {
    try {
      const totalValue = opportunities.reduce((sum, opp) => sum + (parseFloat(opp?.value) || 0), 0)
      const activeOpportunities = opportunities.filter(opp => 
        opp?.stage && !['won', 'lost', 'closed_won', 'closed_lost'].includes(opp.stage)
      ).length
      const wonOpportunities = opportunities.filter(opp => 
        opp?.stage && ['won', 'closed_won'].includes(opp.stage)
      ).length
      const totalOpportunities = opportunities.length

      return {
        totalValue,
        activeOpportunities,
        wonOpportunities,
        winRate: totalOpportunities > 0 ? Math.round((wonOpportunities / totalOpportunities) * 100) : 0,
        avgDealSize: totalOpportunities > 0 ? totalValue / totalOpportunities : 0
      }
    } catch (error) {
      console.error('Error calculating metrics:', error)
      return {
        totalValue: 0,
        activeOpportunities: 0,
        wonOpportunities: 0,
        winRate: 0,
        avgDealSize: 0
      }
    }
  }, [opportunities])

  // Safe filtered opportunities
  const filteredOpportunities = React.useMemo(() => {
    try {
      return opportunities.filter(opp => {
        // Search filter
        if (searchTerm) {
          const matchesSearch = 
            opp?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            opp?.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            opp?.contact_name?.toLowerCase().includes(searchTerm.toLowerCase())
          if (!matchesSearch) return false
        }

        // Stage filter
        if (selectedStage && opp?.stage !== selectedStage) {
          return false
        }

        return true
      })
    } catch (error) {
      console.error('Error filtering opportunities:', error)
      return []
    }
  }, [opportunities, searchTerm, selectedStage])

  const handleCreateOpportunity = () => {
    navigate('/opportunities/new')
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedStage('')
  }

  if (loading || opportunitiesLoading) {
    return <LoadingState />
  }

  const hasOpportunities = opportunities.length > 0
  const hasFilters = searchTerm || selectedStage

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
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
                    Track and manage your sales opportunities
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-4 lg:mt-0">
              <Button
                onClick={handleCreateOpportunity}
                className="shadow-lg shadow-blue-500/25"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Opportunity
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Pipeline"
            value={`$${(metrics.totalValue / 1000).toFixed(1)}K`}
            subtitle="Total deal value"
            icon={<DollarSign className="h-6 w-6" />}
            color="blue"
          />
          
          <MetricCard
            title="Active Deals"
            value={metrics.activeOpportunities.toString()}
            subtitle={`${opportunities.length} total`}
            icon={<Target className="h-6 w-6" />}
            color="green"
          />
          
          <MetricCard
            title="Deals Won"
            value={metrics.wonOpportunities.toString()}
            subtitle="Successful closures"
            icon={<Trophy className="h-6 w-6" />}
            color="purple"
          />
          
          <MetricCard
            title="Win Rate"
            value={`${metrics.winRate}%`}
            subtitle="Conversion rate"
            icon={<TrendingUp className="h-6 w-6" />}
            color="orange"
          />
        </div>

        {/* Filter Bar */}
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedStage={selectedStage}
          onStageChange={setSelectedStage}
          onClearFilters={handleClearFilters}
          hasFilters={hasFilters}
        />

        {/* Kanban Board or Empty State */}
        {!hasOpportunities ? (
          <EmptyState onCreate={handleCreateOpportunity} />
        ) : filteredOpportunities.length === 0 ? (
          <FilteredEmptyState 
            onCreate={handleCreateOpportunity}
            onClearFilters={handleClearFilters}
          />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Opportunity Pipeline
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Manage your deals across stages
                  </p>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {filteredOpportunities.length} of {opportunities.length}
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="h-[600px]">
                <KanbanBoard opportunities={filteredOpportunities} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Metric Card Component
const MetricCard = ({ title, value, subtitle, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
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

// Filter Bar Component
const FilterBar = ({ searchTerm, onSearchChange, selectedStage, onStageChange, onClearFilters, hasFilters }) => {
  const [localSearch, setLocalSearch] = React.useState(searchTerm)

  const handleSearchChange = (e) => {
    const value = e.target.value
    setLocalSearch(value)
    // Simple debounce
    setTimeout(() => onSearchChange(value), 300)
  }

}

// Empty State Components
const EmptyState = ({ onCreate }) => (
  <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
    <Target className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      No opportunities yet
    </h3>
    <p className="text-gray-600 dark:text-gray-400 mb-6">
      Start building your sales pipeline by creating your first opportunity
    </p>
    <Button onClick={onCreate} size="lg" className="shadow-lg">
      <Plus className="h-5 w-5 mr-2" />
      Create First Opportunity
    </Button>
  </div>
)

const FilteredEmptyState = ({ onCreate, onClearFilters }) => (
  <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
    <Search className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      No opportunities found
    </h3>
    <p className="text-gray-600 dark:text-gray-400 mb-6">
      Try adjusting your filters to see more results
    </p>
    <div className="flex gap-3 justify-center">
      <Button variant="outline" onClick={onClearFilters}>
        Clear Filters
      </Button>
      <Button onClick={onCreate}>
        <Plus className="h-4 w-4 mr-2" />
        Create Opportunity
      </Button>
    </div>
  </div>
)

// Loading State
const LoadingState = () => (
  <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
      <p className="text-lg text-gray-600 dark:text-gray-400">Loading pipeline data...</p>
    </div>
  </div>
)

export default PipelinePage