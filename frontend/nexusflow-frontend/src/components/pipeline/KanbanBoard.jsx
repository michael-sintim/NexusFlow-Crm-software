// src/components/pipeline/KanbanBoard.jsx
import React from 'react'
import { useDataStore } from '../../store/dataStore'
import { MoreHorizontal, User, Building, DollarSign } from 'lucide-react'

const DEAL_STAGES = [
  { id: 'new_lead', name: 'New Lead', color: 'bg-blue-500', textColor: 'text-blue-700' },
  { id: 'needs', name: 'Needs Analysis', color: 'bg-purple-500', textColor: 'text-purple-700' },
  { id: 'price_discussion', name: 'Price Discussion', color: 'bg-yellow-500', textColor: 'text-yellow-700' },
  { id: 'final_review', name: 'Final Review', color: 'bg-orange-500', textColor: 'text-orange-700' },
  { id: 'won', name: 'Won', color: 'bg-green-500', textColor: 'text-green-700' },
  { id: 'lost', name: 'Lost', color: 'bg-red-500', textColor: 'text-red-700' }
]

// Opportunity Card Component
const OpportunityCard = ({ opportunity, onContactClick }) => {
  const stage = DEAL_STAGES.find(s => s.id === opportunity.stage)
  
  return (
    <div
      onClick={() => onContactClick(opportunity)}
      className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all cursor-pointer group mb-3"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm line-clamp-1">
          {opportunity.name}
        </h4>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
          <MoreHorizontal className="h-3 w-3 text-gray-400" />
        </button>
      </div>
      
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
          <Building className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{opportunity.company}</span>
        </div>
        
        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
          <User className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{opportunity.contact_name}</span>
        </div>
        
        {opportunity.value && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-400">
            <DollarSign className="h-3 w-3 flex-shrink-0" />
            <span>${(opportunity.value / 1000).toFixed(0)}K</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-600">
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${stage?.color}`} />
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{stage?.name}</span>
        </div>
      </div>
    </div>
  )
}

// Stage Column Component
const StageColumn = ({ stage, opportunities, onContactClick }) => {
  const stageOpportunities = opportunities.filter(opp => opp.stage === stage.id)

  return (
    <div className="flex flex-col h-full">
      {/* Column Header */}
      <div className={`p-3 rounded-lg ${stage.color} text-white mb-3 flex-shrink-0`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm truncate">{stage.name}</h3>
          <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
            {stageOpportunities.length}
          </span>
        </div>
      </div>
      
      {/* Opportunities List */}
      <div className="flex-1 overflow-y-auto space-y-2 min-h-[200px]">
        {stageOpportunities.length === 0 ? (
          <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-xs border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg h-full flex items-center justify-center">
            No opportunities
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
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 h-full">
      {DEAL_STAGES.map(stage => (
        <StageColumn
          key={stage.id}
          stage={stage}
          opportunities={opportunities}
          onContactClick={onContactClick}
        />
      ))}
    </div>
  )
}

export default KanbanBoard