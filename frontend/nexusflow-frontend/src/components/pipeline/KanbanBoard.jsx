// src/components/pipeline/KanbanBoard.jsx
import React, { useState } from 'react'
import { useDataStore } from '../../store/dataStore'
import { MoreHorizontal, User, Building, DollarSign } from 'lucide-react'

const DEAL_STAGES = [
  { id: 'new_lead', name: 'New Lead', color: 'bg-blue-500' },
  { id: 'needs', name: 'Needs Analysis', color: 'bg-purple-500' },
  { id: 'price_discussion', name: 'Price Discussion', color: 'bg-yellow-500' },
  { id: 'final_review', name: 'Final Review', color: 'bg-orange-500' },
  { id: 'won', name: 'Won', color: 'bg-green-500' },
  { id: 'lost', name: 'Lost', color: 'bg-red-500' }
]

// Opportunity Card Component
const OpportunityCard = ({ opportunity, onContactClick }) => {
  const stage = DEAL_STAGES.find(s => s.id === opportunity.stage)
  
  return (
    <div
      onClick={() => onContactClick(opportunity)}
      className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all cursor-pointer group mb-3"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm">
          {opportunity.name}
        </h4>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </button>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <Building className="h-3 w-3" />
          <span>{opportunity.company}</span>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <User className="h-3 w-3" />
          <span>{opportunity.contact_name}</span>
        </div>
        
        {opportunity.value && (
          <div className="flex items-center gap-2 text-xs font-semibold text-green-600 dark:text-green-400">
            <DollarSign className="h-3 w-3" />
            <span>${opportunity.value.toLocaleString()}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-600">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${stage?.color}`} />
          <span className="text-xs text-gray-500 dark:text-gray-400">{stage?.name}</span>
        </div>
      </div>
    </div>
  )
}

// Stage Column Component
const StageColumn = ({ stage, opportunities, onContactClick }) => {
  const stageOpportunities = opportunities.filter(opp => opp.stage === stage.id)

  return (
    <div className="flex-1 min-w-[280px]">
      <div className={`p-4 rounded-t-lg ${stage.color} text-white mb-4`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">{stage.name}</h3>
          <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
            {stageOpportunities.length}
          </span>
        </div>
      </div>
      
      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {stageOpportunities.length === 0 ? (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg">
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
  const { updateOpportunityStage } = useDataStore()
  const [draggedItem, setDraggedItem] = useState(null)

  // Simple drag and drop handlers
  const handleDragStart = (e, opportunity) => {
    setDraggedItem(opportunity)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, stageId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e, targetStageId) => {
    e.preventDefault()
    
    if (draggedItem && draggedItem.stage !== targetStageId) {
      try {
        // Update the opportunity stage in the store
        await updateOpportunityStage(draggedItem.id, targetStageId)
      } catch (error) {
        console.error('Failed to update opportunity stage:', error)
      }
    }
    
    setDraggedItem(null)
  }

  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {DEAL_STAGES.map(stage => (
        <div
          key={stage.id}
          className="flex-1 min-w-[280px]"
          onDragOver={(e) => handleDragOver(e, stage.id)}
          onDrop={(e) => handleDrop(e, stage.id)}
        >
          <StageColumn
            stage={stage}
            opportunities={opportunities}
            onContactClick={onContactClick}
          />
        </div>
      ))}
    </div>
  )
}

export default KanbanBoard