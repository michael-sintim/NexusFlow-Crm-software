// pages/PipelinePage.jsx
import React, { useEffect, useState, useCallback } from 'react'
import { Plus, TrendingUp, Users, Target, DollarSign, Trophy, Search } from 'lucide-react'
import { useDataStore } from '../store/dataStore'
import Button from '../components/ui/Button'
import { useNavigate } from 'react-router-dom'
import KanbanBoard from '../components/pipeline/KanbanBoard'

const PipelinePage = () => {
  const navigate = useNavigate()
  
  // Get data from store with safe defaults and validation
  const { 
    opportunities: rawOpportunities = [], 
    opportunitiesLoading = false,
    fetchOpportunities,
    fetchPipelineData
  } = useDataStore()

  // Ensure opportunities is always an array
  const opportunities = Array.isArray(rawOpportunities) ? rawOpportunities : []

  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStage, setSelectedStage] = useState('')
  const [fetchError, setFetchError] = useState(null)

  // Safe data fetch with comprehensive error handling
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setFetchError(null)
      
      // Validate that functions exist before calling
      if (typeof fetchOpportunities !== 'function') {
        throw new Error('fetchOpportunities is not available')
      }
      
      if (typeof fetchPipelineData !== 'function') {
        throw new Error('fetchPipelineData is not available')
      }

      await Promise.all([
        fetchOpportunities(),
        fetchPipelineData()
      ])
    } catch (error) {
      console.error('Failed to load pipeline data:', error)
      setFetchError(error.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [fetchOpportunities, fetchPipelineData])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Safe metric calculations with comprehensive validation
  const metrics = React.useMemo(() => {
    const defaultMetrics = {
      totalValue: 0,
      activeOpportunities: 0,
      wonValue: 0,
      winRate: 0,
      avgDealSize: 0
    }

    // Early return if no valid opportunities
    if (!opportunities.length) {
      return defaultMetrics
    }

    try {
      let totalValue = 0
      let activeOpportunities = 0
      let wonOpportunities = 0
      let wonValue = 0

      // Safe iteration with validation
      opportunities.forEach(opp => {
        if (opp && typeof opp === 'object') {
          const value = parseFloat(opp.value) || 0
          totalValue += value

          const stage = opp.stage
          if (stage && typeof stage === 'string') {
            if (!['won', 'lost', 'closed_won', 'closed_lost'].includes(stage)) {
              activeOpportunities++
            }
            
            if (['won', 'closed_won'].includes(stage)) {
              wonOpportunities++
              wonValue += value
            }
          }
        }
      })

      const totalOpportunities = opportunities.length
      const winRate = totalOpportunities > 0 ? Math.round((wonOpportunities / totalOpportunities) * 100) : 0
      const avgDealSize = totalOpportunities > 0 ? totalValue / totalOpportunities : 0

      return {
        totalValue,
        activeOpportunities,
        wonValue,
        winRate,
        avgDealSize
      }
    } catch (error) {
      console.error('Error calculating metrics:', error)
      return defaultMetrics
    }
  }, [opportunities])

  // Safe filtered opportunities with validation
  const filteredOpportunities = React.useMemo(() => {
    if (!opportunities.length) {
      return []
    }

    try {
      return opportunities.filter(opp => {
        // Validate opportunity object
        if (!opp || typeof opp !== 'object') {
          return false
        }

        // Safe search filter
        if (searchTerm && searchTerm.trim()) {
          const searchLower = searchTerm.toLowerCase().trim()
          const name = String(opp.name || '').toLowerCase()
          const company = String(opp.company || '').toLowerCase()
          const contactName = String(opp.contact_name || '').toLowerCase()

          const matchesSearch = 
            name.includes(searchLower) ||
            company.includes(searchLower) ||
            contactName.includes(searchLower)
          
          if (!matchesSearch) return false
        }

        // Safe stage filter
        if (selectedStage && selectedStage.trim()) {
          const oppStage = String(opp.stage || '')
          if (oppStage !== selectedStage) {
            return false
          }
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

  const handleRetry = () => {
    loadData()
  }

  // Show error state if fetch failed
  if (fetchError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load Pipeline
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {fetchError}
          </p>
          <Button onClick={handleRetry}>
            <Plus className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
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
                    Deal Flow 
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
                className="shadow-lg shadow-blue-500/25 bg-blue-500"
              >
                <Plus className="h-4 w-4 mr-2 bg-blue-500" />
                Add Deal
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
            value={`$${(metrics.wonValue / 1000).toFixed(1)}K`}
            subtitle="Amount closed"
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
        <div className="mb-6">
          <FilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedStage={selectedStage}
            onStageChange={setSelectedStage}
            onClearFilters={handleClearFilters}
            hasFilters={hasFilters}
          />
        </div>

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
                    Deal Flow Management
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
              <KanbanBoard opportunities={filteredOpportunities} />
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

  const colorClass = colorClasses[color] || colorClasses.blue

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
        <div className={`p-3 rounded-lg ${colorClass}`}>
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
    if (typeof onSearchChange === 'function') {
      setTimeout(() => onSearchChange(value), 300)
    }
  }

  const handleStageChange = (e) => {
    const value = e.target.value
    if (typeof onStageChange === 'function') {
      onStageChange(value)
    }
  }

  const handleClear = () => {
    if (typeof onClearFilters === 'function') {
      onClearFilters()
    }
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