// src/components/pipeline/KanbanBoard.jsx
import React from 'react'
import { useDataStore } from '../../store/dataStore'
import { MoreHorizontal, User, Building, DollarSign } from 'lucide-react'

// Match these with your Django backend STAGE_CHOICES
const DEAL_STAGES = [
  { id: 'prospect', name: 'Prospect', color: 'bg-blue-500', textColor: 'text-blue-700' },
  { id: 'qualified', name: 'Qualified', color: 'bg-purple-500', textColor: 'text-purple-700' },
  { id: 'proposal', name: 'Proposal', color: 'bg-yellow-500', textColor: 'text-yellow-700' },
  { id: 'negotiation', name: 'Negotiation', color: 'bg-orange-500', textColor: 'text-orange-700' },
  { id: 'closed_won', name: 'Closed Won', color: 'bg-green-500', textColor: 'text-green-700' },
  { id: 'closed_lost', name: 'Closed Lost', color: 'bg-red-500', textColor: 'text-red-700' }
]

// Format numbers in hundreds (K) format
const formatNumber = (value) => {
  if (!value && value !== 0) return '$0'
  
  const numValue = parseFloat(value)
  if (isNaN(numValue)) return '$0'
  
  if (numValue >= 1000000) {
    return `$${(numValue / 1000000).toFixed(1)}M`
  } else if (numValue >= 1000) {
    return `$${(numValue / 1000).toFixed(0)}K`
  } else {
    return `$${numValue.toFixed(0)}`
  }
}

// Format numbers with commas for thousands
const formatNumberWithCommas = (value) => {
  if (!value && value !== 0) return '0'
  
  const numValue = parseFloat(value)
  if (isNaN(numValue)) return '0'
  
  return numValue.toLocaleString('en-US')
}

// Opportunity Card Component
const OpportunityCard = ({ opportunity, onContactClick }) => {
  const stage = DEAL_STAGES.find(s => s.id === opportunity.stage)
  
  // Use the exact field names from your Django API response
  const opportunityName = opportunity.title || 'Unnamed Opportunity'
  const companyName = opportunity.contact?.company_name || 'No company'
  const contactName = opportunity.contact ? 
    `${opportunity.contact.first_name || ''} ${opportunity.contact.last_name || ''}`.trim() : 
    'No contact'
  
  const handleDragStart = (e) => {
    e.dataTransfer.setData('opportunityId', opportunity.id.toString())
    e.dataTransfer.setData('currentStage', opportunity.stage)
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onContactClick(opportunity)}
      className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all cursor-pointer group mb-3"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm line-clamp-1">
          {opportunityName}
        </h4>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
          <MoreHorizontal className="h-3 w-3 text-gray-400" />
        </button>
      </div>
      
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
          <Building className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{companyName}</span>
        </div>
        
        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
          <User className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{contactName}</span>
        </div>
        
        {opportunity.value && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-400">
            <DollarSign className="h-3 w-3 flex-shrink-0" />
            <span>{formatNumber(opportunity.value)}</span>
            {opportunity.value >= 1000 && (
              <span className="text-xs text-gray-400 ml-1">
                ({formatNumberWithCommas(opportunity.value)})
              </span>
            )}
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-600">
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${stage?.color}`} />
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{stage?.name}</span>
        </div>
        
        {/* Removed probability indicator */}
      </div>
    </div>
  )
}

// Stage Column Component
const StageColumn = ({ stage, opportunities, onContactClick }) => {
  const { updateOpportunityStage } = useDataStore()
  const stageOpportunities = opportunities.filter(opp => opp.stage === stage.id)

  // Calculate stage metrics (without probability)
  const stageMetrics = React.useMemo(() => {
    const totalValue = stageOpportunities.reduce((sum, opp) => sum + (parseFloat(opp.value) || 0), 0)
    const avgValue = stageOpportunities.length > 0 ? totalValue / stageOpportunities.length : 0

    return {
      totalValue,
      avgValue
    }
  }, [stageOpportunities])

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    const opportunityId = e.dataTransfer.getData('opportunityId')
    const currentStage = e.dataTransfer.getData('currentStage')
    
    if (currentStage !== stage.id) {
      try {
        await updateOpportunityStage(opportunityId, stage.id)
      } catch (error) {
        console.error('Failed to update opportunity stage:', error)
      }
    }
  }

  return (
    <div 
      className="flex flex-col h-full min-h-[500px]"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Column Header with Metrics */}
      <div className={`p-3 rounded-lg ${stage.color} text-white mb-3 flex-shrink-0`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm truncate">{stage.name}</h3>
          <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
            {stageOpportunities.length}
          </span>
        </div>
        
        {/* Stage Metrics (without probability) */}
        <div className="space-y-1 text-xs opacity-90">
          <div className="flex justify-between">
            <span>Total:</span>
            <span className="font-semibold">{formatNumber(stageMetrics.totalValue)}</span>
          </div>
          <div className="flex justify-between">
            <span>Avg Deal:</span>
            <span className="font-semibold">{formatNumber(stageMetrics.avgValue)}</span>
          </div>
          {/* Removed win chance metric */}
        </div>
      </div>
      
      {/* Opportunities List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {stageOpportunities.length === 0 ? (
          <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-xs border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg h-24 flex items-center justify-center">
            Drop opportunities here
          </div>
        ) : (
          stageOpportunities.map(opportunity => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              onContactClick={onContactClick}
            />
          ))
        )}
      </div>
    </div>
  )
}

// Main Kanban Board Component
const KanbanBoard = ({ opportunities, onContactClick }) => {
  // Calculate overall pipeline metrics (without weighted value)
  const pipelineMetrics = React.useMemo(() => {
    const totalValue = opportunities.reduce((sum, opp) => sum + (parseFloat(opp.value) || 0), 0)
    const activeOpportunities = opportunities.filter(opp => 
      opp.stage && !['closed_won', 'closed_lost'].includes(opp.stage)
    ).length

    return {
      totalValue,
      activeOpportunities,
      totalOpportunities: opportunities.length
    }
  }, [opportunities])

  return (
    <div className="space-y-4">
      {/* Pipeline Summary (without weighted value) */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 rounded-lg p-4 border border-blue-200 dark:border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatNumber(pipelineMetrics.totalValue)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Pipeline</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {pipelineMetrics.activeOpportunities}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Active Deals</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {pipelineMetrics.totalOpportunities}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Opportunities</div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 min-h-[600px]">
        {DEAL_STAGES.map(stage => (
          <StageColumn
            key={stage.id}
            stage={stage}
            opportunities={opportunities}
            onContactClick={onContactClick}
          />
        ))}
      </div>
    </div>
  )
}

export default KanbanBoard