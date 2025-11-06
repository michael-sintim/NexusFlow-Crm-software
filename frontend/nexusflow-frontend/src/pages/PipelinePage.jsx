import React, { useCallback, useMemo, useEffect, useState } from 'react'
import { 
  Plus, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  Filter,
  Search,
  RefreshCw,
  MoreHorizontal
} from 'lucide-react'
import { useDataStore } from '../store/dataStore'
import KanbanBoard from '../components/pipeline/KanbanBoard'
import Button from '../components/ui/Button'
import { useNavigate } from 'react-router-dom'

// Define the deal stages from SRS
const DEAL_STAGES = [
  { stage: 'new_lead', name: 'New Lead', color: 'bg-blue-500', textColor: 'text-blue-700 dark:text-blue-300' },
  { stage: 'needs', name: 'Needs Analysis', color: 'bg-purple-500', textColor: 'text-purple-700 dark:text-purple-300' },
  { stage: 'price_discussion', name: 'Price Discussion', color: 'bg-yellow-500', textColor: 'text-yellow-700 dark:text-yellow-300' },
  { stage: 'final_review', name: 'Final Review', color: 'bg-orange-500', textColor: 'text-orange-700 dark:text-orange-300' },
  { stage: 'won', name: 'Won', color: 'bg-green-500', textColor: 'text-green-700 dark:text-green-300' },
  { stage: 'lost', name: 'Lost', color: 'bg-red-500', textColor: 'text-red-700 dark:text-red-300' }
]

// Quick Stats Component
const QuickStatCard = React.memo(({ icon: Icon, label, value, color, bgColor }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
          {label}
        </p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
      </div>
      <div className={`p-3 rounded-lg ${bgColor}`}>
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
    </div>
  </div>
))

QuickStatCard.displayName = 'QuickStatCard'

// Stage Progress Card
const StageProgressCard = React.memo(({ stage, count, value, totalOpportunities, index }) => {
  const progressPercentage = useMemo(() => {
    if (!totalOpportunities || totalOpportunities === 0) return 0
    return (count / totalOpportunities) * 100
  }, [count, totalOpportunities])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-3 h-3 rounded-full ${stage.color}`} />
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {index + 1}
        </span>
      </div>
      
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {count}
        </div>
        <div className={`text-sm font-semibold mb-1 ${stage.textColor}`}>
          {stage.name}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
          ${(value / 1000).toFixed(1)}K
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${stage.color} group-hover:opacity-90`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  )
})

StageProgressCard.displayName = 'StageProgressCard'

// Filter Bar Component
const FilterBar = React.memo(({ filters, onFilterChange, onRefresh }) => {
  const [localSearch, setLocalSearch] = useState(filters.search || '')

  const handleSearchSubmit = useCallback(() => {
    onFilterChange('search', localSearch)
  }, [localSearch, onFilterChange])

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit()
    }
  }, [handleSearchSubmit])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search Box */}
        <div className="flex-1 w-full sm:max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search opportunities..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Stage Filter */}
          <select
            value={filters.stage || ''}
            onChange={(e) => onFilterChange('stage', e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Stages</option>
            {DEAL_STAGES.map((stage) => (
              <option key={stage.stage} value={stage.stage}>
                {stage.name}
              </option>
            ))}
          </select>

          {/* Refresh Button */}
          <Button
            variant="outline"
            onClick={onRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
    </div>
  )
})

FilterBar.displayName = 'FilterBar'

// Loading Component
const PipelineLoading = () => (
  <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Loading sales pipeline...</p>
    </div>
  </div>
)

// Empty State Component
const PipelineEmptyState = React.memo(({ onCreateOpportunity }) => (
  <div className="text-center py-16">
    <div className="max-w-md mx-auto">
      <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
        No opportunities in your pipeline
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Start building your sales pipeline by adding your first opportunity. Track deals through every stage from new lead to closed won.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button onClick={onCreateOpportunity} size="lg" className="shadow-lg shadow-blue-500/25">
          <Plus className="h-4 w-4 mr-2" />
          Create First Opportunity
        </Button>
        <Button variant="outline" size="lg">
          Learn More
        </Button>
      </div>
    </div>
  </div>
))

PipelineEmptyState.displayName = 'PipelineEmptyState'

const PipelinePage = () => {
  const { 
    opportunities, 
    fetchOpportunities, 
    pipelineData,
    fetchPipelineData,
    opportunitiesLoading 
  } = useDataStore()
  
  const navigate = useNavigate()
  const [filters, setFilters] = useState({
    search: '',
    stage: '',
    owner: ''
  })

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchOpportunities(),
          fetchPipelineData()
        ])
      } catch (error) {
        console.error('Failed to load pipeline data:', error)
      }
    }

    loadData()
  }, [fetchOpportunities, fetchPipelineData])

  // Calculate pipeline statistics
  const pipelineStats = useMemo(() => {
    if (!pipelineData) {
      return {
        totalValue: 0,
        totalOpportunities: 0,
        wonValue: 0,
        activeContacts: 0,
        winRate: 0
      }
    }

    const totalValue = pipelineData.reduce((sum, stage) => sum + (stage.value || 0), 0)
    const totalOpportunities = pipelineData.reduce((sum, stage) => sum + (stage.count || 0), 0)
    
    const wonStage = pipelineData.find(stage => stage.stage === 'won')
    const wonValue = wonStage?.value || 0
    const wonCount = wonStage?.count || 0
    
    const winRate = totalOpportunities > 0 ? Math.round((wonCount / totalOpportunities) * 100) : 0

    return {
      totalValue,
      totalOpportunities,
      wonValue,
      activeContacts: pipelineData.reduce((sum, stage) => sum + (stage.contacts || 0), 0),
      winRate
    }
  }, [pipelineData])

  // Filter opportunities based on current filters
  const filteredOpportunities = useMemo(() => {
    if (!opportunities) return []
    
    return opportunities.filter(opportunity => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const matchesSearch = 
          opportunity.name?.toLowerCase().includes(searchTerm) ||
          opportunity.company?.toLowerCase().includes(searchTerm) ||
          opportunity.contact_name?.toLowerCase().includes(searchTerm)
        if (!matchesSearch) return false
      }

      // Stage filter
      if (filters.stage && opportunity.stage !== filters.stage) {
        return false
      }

      return true
    })
  }, [opportunities, filters])

  // Enhanced quick stats
  const quickStats = useMemo(() => [
    {
      label: 'Total Pipeline Value',
      value: `$${(pipelineStats.totalValue / 1000).toFixed(1)}K`,
      icon: DollarSign,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      label: 'Active Opportunities',
      value: pipelineStats.totalOpportunities.toString(),
      icon: Target,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      label: 'Contacts in Pipeline',
      value: pipelineStats.activeContacts.toString(),
      icon: Users,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      label: 'Win Rate',
      value: `${pipelineStats.winRate}%`,
      icon: TrendingUp,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    }
  ], [pipelineStats])

  // Enhanced stage data with fallback
  const stageData = useMemo(() => {
    if (pipelineData && pipelineData.length > 0) {
      return DEAL_STAGES.map(stage => {
        const data = pipelineData.find(s => s.stage === stage.stage)
        return {
          ...stage,
          count: data?.count || 0,
          value: data?.value || 0
        }
      })
    }

    // Fallback to zero data
    return DEAL_STAGES.map(stage => ({
      ...stage,
      count: 0,
      value: 0
    }))
  }, [pipelineData])

  // Navigation handlers
  const handleCreateOpportunity = useCallback(() => {
    navigate('/opportunities/new')
  }, [navigate])

  const handleViewAnalytics = useCallback(() => {
    navigate('/analytics')
  }, [navigate])

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const handleRefresh = useCallback(() => {
    fetchOpportunities()
    fetchPipelineData()
  }, [fetchOpportunities, fetchPipelineData])

  // Loading and empty states
  const isLoading = opportunitiesLoading && (!opportunities && !pipelineData)
  const isEmpty = opportunities && opportunities.length === 0
  const hasData = opportunities && opportunities.length > 0

  if (isLoading) {
    return <PipelineLoading />
  }

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
                    Track opportunities through progressive deal stages
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-4 lg:mt-0">
              <Button
                variant="outline"
                onClick={handleViewAnalytics}
                className="hidden sm:flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                View Analytics
              </Button>
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

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat) => (
            <QuickStatCard key={stat.label} {...stat} />
          ))}
        </div>

        {/* Filter Bar */}
        <div className="mb-8">
          <FilterBar 
            filters={filters}
            onFilterChange={handleFilterChange}
            onRefresh={handleRefresh}
          />
        </div>

        {/* Pipeline Stage Overview */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Pipeline Stages
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Track progress through each sales stage
              </p>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {pipelineStats.totalOpportunities} opportunities
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stageData.map((stage, index) => (
              <StageProgressCard
                key={stage.stage}
                stage={stage}
                count={stage.count}
                value={stage.value}
                totalOpportunities={pipelineStats.totalOpportunities}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Kanban Board Section */}
        {hasData && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Opportunity Board
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Drag and drop opportunities between deal stages
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <span>Showing {filteredOpportunities.length} of {opportunities.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Kanban Board */}
            <div className="p-4">
              <div className="w-full overflow-x-auto overflow-y-hidden">
                <div className="min-w-max pb-4">
                  <KanbanBoard opportunities={filteredOpportunities} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {isEmpty && (
          <PipelineEmptyState onCreateOpportunity={handleCreateOpportunity} />
        )}
      </div>
    </div>
  )
}

export default React.memo(PipelinePage)