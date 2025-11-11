// src/components/pipeline/KanbanBoard.jsx
import React, { useState } from 'react'
import { useDataStore } from '../../store/dataStore'
import { MoreHorizontal, User, Building, DollarSign, Edit, Trash2, Eye, ArrowLeft } from 'lucide-react'

// Match these with your Django backend STAGE_CHOICES
const DEAL_STAGES = [
  { id: 'prospect', name: 'Prospect', color: 'bg-blue-500', textColor: 'text-blue-700' },
  { id: 'qualified', name: 'Qualified', color: 'bg-purple-500', textColor: 'text-purple-700' },
  { id: 'proposal', name: 'Proposal', color: 'bg-yellow-500', textColor: 'text-yellow-700' },
  { id: 'negotiation', name: 'Negotiation', color: 'bg-orange-500', textColor: 'text-orange-700' },
  { id: 'closed_won', name: 'Closed Won', color: 'bg-green-500', textColor: 'text-green-700' },
  { id: 'closed_lost', name: 'Closed Lost', color: 'bg-red-500', textColor: 'text-red-700' }
]

// Format numbers in hundreds (K) format for cards
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

// Format exact amount for details modal
const formatExactAmount = (value) => {
  if (!value && value !== 0) return '$0.00'
  
  const numValue = parseFloat(value)
  if (isNaN(numValue)) return '$0.00'
  
  // Format with commas for thousands and 2 decimal places
  return `$${numValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}

// Delete Confirmation Modal
const DeleteConfirmationModal = ({ opportunity, onClose, onConfirm }) => {
  if (!opportunity) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
              <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Delete Opportunity
            </h3>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to delete <strong>"{opportunity.title || 'Unnamed Opportunity'}"</strong>? This action cannot be undone.
          </p>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Delete Opportunity
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Opportunity Details Modal (without probability, with exact amount)
const OpportunityDetailsModal = ({ opportunity, onClose, onEdit, onDelete }) => {
  if (!opportunity) return null

  const stage = DEAL_STAGES.find(s => s.id === opportunity.stage)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Opportunity Details
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                View and manage opportunity information
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Opportunity Title
                </label>
                <p className="text-gray-900 dark:text-white font-medium">
                  {opportunity.title || 'Unnamed Opportunity'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stage
                </label>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${stage?.color}`} />
                  <span className="text-gray-900 dark:text-white font-medium">
                    {stage?.name}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Value
                </label>
                <p className="text-green-600 dark:text-green-400 font-semibold">
                  {formatExactAmount(opportunity.value)}
                </p>
              </div>
              {/* Probability removed from view details */}
            </div>
          </div>

          {/* Contact Information */}
          {opportunity.contact && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Company
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {opportunity.contact.company_name || 'No company'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contact Person
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {opportunity.contact.first_name} {opportunity.contact.last_name}
                  </p>
                </div>
                {opportunity.contact.email && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {opportunity.contact.email}
                    </p>
                  </div>
                )}
                {opportunity.contact.phone_number && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {opportunity.contact.phone_number}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          {opportunity.description && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Description
              </h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {opportunity.description}
              </p>
            </div>
          )}

          {/* Timestamps */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div>
                <span>Created: </span>
                <span>{new Date(opportunity.created_at).toLocaleDateString()}</span>
              </div>
              <div>
                <span>Last Updated: </span>
                <span>{new Date(opportunity.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onDelete}
            className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4 inline mr-2" />
            Delete
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Edit className="h-4 w-4 inline mr-2" />
            Edit Opportunity
          </button>
        </div>
      </div>
    </div>
  )
}

// Opportunity Card Component
const OpportunityCard = ({ opportunity, onView, onEdit, onDelete }) => {
  const stage = DEAL_STAGES.find(s => s.id === opportunity.stage)
  const [showActions, setShowActions] = useState(false)
  
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
      className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all cursor-pointer group mb-3"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 
          onClick={() => onView(opportunity)}
          className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm line-clamp-1 cursor-pointer flex-1 mr-2"
        >
          {opportunityName}
        </h4>
        <div className="relative">
          <button 
            onClick={() => setShowActions(!showActions)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
          >
            <MoreHorizontal className="h-3 w-3 text-gray-400" />
          </button>
          
          {/* Action Dropdown */}
          {showActions && (
            <div className="absolute right-0 top-6 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
              <button
                onClick={() => {
                  onView(opportunity)
                  setShowActions(false)
                }}
                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </button>
              <button
                onClick={() => {
                  onEdit(opportunity)
                  setShowActions(false)
                }}
                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </button>
              <button
                onClick={() => {
                  onDelete(opportunity)
                  setShowActions(false)
                }}
                className="flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          )}
        </div>
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
const StageColumn = ({ stage, opportunities, onView, onEdit, onDelete }) => {
  const { updateOpportunityStage } = useDataStore()
  const stageOpportunities = opportunities.filter(opp => opp.stage === stage.id)

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
        
        {/* Stage Metrics */}
        <div className="space-y-1 text-xs opacity-90">
          <div className="flex justify-between">
            <span>Total:</span>
            <span className="font-semibold">{formatNumber(stageMetrics.totalValue)}</span>
          </div>
          <div className="flex justify-between">
            <span>Avg Deal:</span>
            <span className="font-semibold">{formatNumber(stageMetrics.avgValue)}</span>
          </div>
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
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  )
}

// Main Kanban Board Component
const KanbanBoard = ({ opportunities, onContactClick }) => {
  const { deleteOpportunity } = useDataStore()
  const [selectedOpportunity, setSelectedOpportunity] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [opportunityToDelete, setOpportunityToDelete] = useState(null)

  const handleViewOpportunity = (opportunity) => {
    setSelectedOpportunity(opportunity)
    setShowDetailsModal(true)
  }

  const handleEditOpportunity = (opportunity) => {
    // Navigate to edit page - replace with your actual edit route
    console.log('Edit opportunity:', opportunity)
    // Example: navigate(`/opportunities/${opportunity.id}/edit`)
    // Or open an edit modal if you have one
  }

  const handleDeleteOpportunity = (opportunity) => {
    setOpportunityToDelete(opportunity)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (opportunityToDelete) {
      try {
        await deleteOpportunity(opportunityToDelete.id)
        setShowDeleteModal(false)
        setOpportunityToDelete(null)
        // The store should automatically refresh the data
      } catch (error) {
        console.error('Failed to delete opportunity:', error)
        alert('Failed to delete opportunity. Please try again.')
      }
    }
  }

  const handleCloseModals = () => {
    setShowDetailsModal(false)
    setShowDeleteModal(false)
    setSelectedOpportunity(null)
    setOpportunityToDelete(null)
  }

  return (
    <>
      <div className="min-h-[600px]">
        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {DEAL_STAGES.map(stage => (
            <StageColumn
              key={stage.id}
              stage={stage}
              opportunities={opportunities}
              onView={handleViewOpportunity}
              onEdit={handleEditOpportunity}
              onDelete={handleDeleteOpportunity}
            />
          ))}
        </div>
      </div>

      {/* Opportunity Details Modal */}
      {showDetailsModal && (
        <OpportunityDetailsModal
          opportunity={selectedOpportunity}
          onClose={handleCloseModals}
          onEdit={() => {
            handleEditOpportunity(selectedOpportunity)
            handleCloseModals()
          }}
          onDelete={() => {
            handleDeleteOpportunity(selectedOpportunity)
            handleCloseModals()
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmationModal
          opportunity={opportunityToDelete}
          onClose={handleCloseModals}
          onConfirm={confirmDelete}
        />
      )}
    </>
  )
}

export default KanbanBoard