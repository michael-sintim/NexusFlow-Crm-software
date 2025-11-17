import React, { useState, useEffect } from 'react'
import { useDataStore } from '../../store/dataStore'
import { useUIStore } from '../../store/uiStore'
import { contactsAPI } from '../../services/api'
import { MoreHorizontal, User, Building, DollarSign, Edit, Trash2, Eye, ArrowLeft, X, FileText, Calendar, Target } from 'lucide-react'

// Match these with your Django backend STAGE_CHOICES
const DEAL_STAGES = [
  { id: 'prospect', name: 'New Lead', color: 'bg-blue-500', textColor: 'text-blue-700' },
  { id: 'qualified', name: 'Client Needs', color: 'bg-purple-500', textColor: 'text-purple-700' },
  { id: 'proposal', name: 'Negotiation', color: 'bg-yellow-500', textColor: 'text-yellow-700' },
  { id: 'negotiation', name: 'Final Review', color: 'bg-orange-500', textColor: 'text-orange-700' },
  { id: 'closed_won', name: 'Closed Won', color: 'bg-green-500', textColor: 'text-green-700' },
  { id: 'closed_lost', name: 'Closed Lost', color: 'bg-red-500', textColor: 'text-red-700' }
]

// Format numbers to show exact figures without rounding
const formatNumber = (value) => {
  if (!value && value !== 0) return '$0'
  
  const numValue = parseFloat(value)
  if (isNaN(numValue)) return '$0'
  
  return `$${numValue.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })}`
}

// Format exact amount for details modal
const formatExactAmount = (value) => {
  if (!value && value !== 0) return '$0.00'
  
  const numValue = parseFloat(value)
  if (isNaN(numValue)) return '$0.00'
  
  return `$${numValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}

// Delete Confirmation Modal
const DeleteConfirmationModal = ({ opportunity, onClose, onConfirm }) => {
  const { theme } = useUIStore()
  
  const themeStyles = {
    light: {
      background: {
        primary: 'bg-white',
        error: 'bg-red-50'
      },
      border: {
        primary: 'border-gray-200',
        error: 'border-red-200'
      },
      text: {
        primary: 'text-gray-900',
        secondary: 'text-gray-600',
        error: 'text-red-800'
      }
    },
    dark: {
      background: {
        primary: 'bg-gray-800',
        error: 'bg-red-900/20'
      },
      border: {
        primary: 'border-gray-700',
        error: 'border-red-800'
      },
      text: {
        primary: 'text-white',
        secondary: 'text-gray-400',
        error: 'text-red-400'
      }
    }
  }

  const currentTheme = themeStyles[theme]

  if (!opportunity) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${currentTheme.background.primary} rounded-lg max-w-md w-full`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 ${theme === 'light' ? 'bg-red-100' : 'bg-red-900/20'} rounded-full`}>
              <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className={`text-lg font-semibold ${currentTheme.text.primary}`}>
              Delete Opportunity
            </h3>
          </div>
          
          <p className={`${currentTheme.text.secondary} mb-6`}>
            Are you sure you want to delete <strong>"{opportunity.title || 'Unnamed Opportunity'}"</strong>? This action cannot be undone.
          </p>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className={`px-4 py-2 text-sm font-medium ${currentTheme.text.secondary} hover:${theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'} rounded-lg transition-colors`}
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

// Edit Opportunity Modal
const EditOpportunityModal = ({ opportunity, onClose, onSave, contacts }) => {
  const { theme } = useUIStore()
  const [formData, setFormData] = useState({
    title: opportunity?.title || '',
    contact: opportunity?.contact?.id || '',
    stage: opportunity?.stage || 'prospect',
    value: opportunity?.value || 0,
    expected_close_date: opportunity?.expected_close_date || '',
    description: opportunity?.description || ''
  })

  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const themeStyles = {
    light: {
      background: {
        primary: 'bg-white',
        input: 'bg-white'
      },
      border: {
        primary: 'border-gray-200',
        secondary: 'border-gray-300',
        error: 'border-red-500'
      },
      text: {
        primary: 'text-gray-900',
        secondary: 'text-gray-600',
        label: 'text-gray-700',
        error: 'text-red-600'
      }
    },
    dark: {
      background: {
        primary: 'bg-gray-800',
        input: 'bg-gray-700'
      },
      border: {
        primary: 'border-gray-700',
        secondary: 'border-gray-600',
        error: 'border-red-500'
      },
      text: {
        primary: 'text-white',
        secondary: 'text-gray-400',
        label: 'text-gray-300',
        error: 'text-red-400'
      }
    }
  }

  const currentTheme = themeStyles[theme]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    
    if (!formData.contact) {
      newErrors.contact = 'Contact is required'
    }
    
    if (!formData.stage) {
      newErrors.stage = 'Stage is required'
    }
    
    if (!formData.value || parseFloat(formData.value) <= 0) {
      newErrors.value = 'Value must be greater than 0'
    }

    if (formData.expected_close_date) {
      const selectedDate = new Date(formData.expected_close_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (selectedDate < today) {
        newErrors.expected_close_date = 'Close date cannot be in the past'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setSaving(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Failed to save opportunity:', error)
      setErrors({ submit: 'Failed to save opportunity. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const stageOptions = [
    { value: 'prospect', label: 'Prospect' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'proposal', label: 'Proposal' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'closed_won', label: 'Closed Won' },
    { value: 'closed_lost', label: 'Closed Lost' },
  ]

  if (!opportunity) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${currentTheme.background.primary} rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${currentTheme.border.primary}`}>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className={`p-1 ${currentTheme.text.secondary} hover:${currentTheme.text.primary} rounded-lg transition-colors`}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h2 className={`text-xl font-semibold ${currentTheme.text.primary}`}>
                Edit Opportunity
              </h2>
              <p className={`text-sm ${currentTheme.text.secondary} mt-1`}>
                Update opportunity information
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.submit && (
            <div className={`p-4 ${theme === 'light' ? 'bg-red-50' : 'bg-red-900/20'} border ${theme === 'light' ? 'border-red-200' : 'border-red-800'} rounded-lg`}>
              <p className={`${currentTheme.text.error} text-sm`}>{errors.submit}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${currentTheme.text.primary} flex items-center`}>
              <FileText className="h-5 w-5 mr-2 text-blue-500" />
              Opportunity Details
            </h3>
            
            <div>
              <label className={`block text-sm font-medium ${currentTheme.text.label} mb-2`}>
                Opportunity Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${currentTheme.background.input} ${currentTheme.text.primary} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                  errors.title ? currentTheme.border.error : currentTheme.border.secondary
                }`}
                placeholder="Enter opportunity title"
              />
              {errors.title && (
                <p className={`${currentTheme.text.error} text-sm mt-1`}>{errors.title}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${currentTheme.text.label} mb-2 flex items-center`}>
                  <User className="h-4 w-4 mr-2 text-gray-400" />
                  Contact *
                </label>
                <select
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg ${currentTheme.background.input} ${currentTheme.text.primary} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                    errors.contact ? currentTheme.border.error : currentTheme.border.secondary
                  }`}
                >
                  <option value="">Select a contact</option>
                  {contacts.map(contact => (
                    <option key={contact.id} value={contact.id}>
                      {contact.first_name} {contact.last_name} 
                      {contact.company_name && ` - ${contact.company_name}`}
                    </option>
                  ))}
                </select>
                {errors.contact && (
                  <p className={`${currentTheme.text.error} text-sm mt-1`}>{errors.contact}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium ${currentTheme.text.label} mb-2 flex items-center`}>
                  <Target className="h-4 w-4 mr-2 text-gray-400" />
                  Stage *
                </label>
                <select
                  name="stage"
                  value={formData.stage}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg ${currentTheme.background.input} ${currentTheme.text.primary} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                    errors.stage ? currentTheme.border.error : currentTheme.border.secondary
                  }`}
                >
                  {stageOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.stage && (
                  <p className={`${currentTheme.text.error} text-sm mt-1`}>{errors.stage}</p>
                )}
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${currentTheme.text.primary} flex items-center`}>
              <DollarSign className="h-5 w-5 mr-2 text-green-500" />
              Financial Details
            </h3>
            
            <div>
              <label className={`block text-sm font-medium ${currentTheme.text.label} mb-2`}>
                Value *
              </label>
              <input
                type="number"
                step="0.01"
                name="value"
                value={formData.value}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${currentTheme.background.input} ${currentTheme.text.primary} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                  errors.value ? currentTheme.border.error : currentTheme.border.secondary
                }`}
                placeholder="0.00"
              />
              {errors.value && (
                <p className={`${currentTheme.text.error} text-sm mt-1`}>{errors.value}</p>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${currentTheme.text.primary} flex items-center`}>
              <Calendar className="h-5 w-5 mr-2 text-orange-500" />
              Timeline
            </h3>
            
            <div>
              <label className={`block text-sm font-medium ${currentTheme.text.label} mb-2`}>
                Expected Close Date
              </label>
              <input
                type="date"
                name="expected_close_date"
                value={formData.expected_close_date}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${currentTheme.background.input} ${currentTheme.text.primary} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                  errors.expected_close_date ? currentTheme.border.error : currentTheme.border.secondary
                }`}
              />
              {errors.expected_close_date && (
                <p className={`${currentTheme.text.error} text-sm mt-1`}>{errors.expected_close_date}</p>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${currentTheme.text.primary} flex items-center`}>
              <FileText className="h-5 w-5 mr-2 text-purple-500" />
              Additional Information
            </h3>
            
            <div>
              <label className={`block text-sm font-medium ${currentTheme.text.label} mb-2`}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={`w-full px-3 py-2 border ${currentTheme.border.secondary} rounded-lg ${currentTheme.background.input} ${currentTheme.text.primary} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors duration-200 placeholder-gray-500 dark:placeholder-gray-400`}
                placeholder="Describe this opportunity, including key requirements, decision makers, and any specific details..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className={`flex justify-end space-x-3 pt-6 border-t ${currentTheme.border.primary}`}>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className={`px-4 py-2 text-sm font-medium ${currentTheme.text.secondary} hover:${theme === 'light' ? 'bg-gray-50' : 'bg-gray-700'} rounded-lg transition-colors`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Update Opportunity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Opportunity Details Modal
const OpportunityDetailsModal = ({ opportunity, onClose, onEdit, onDelete }) => {
  const { theme } = useUIStore()
  
  const themeStyles = {
    light: {
      background: {
        primary: 'bg-white'
      },
      border: {
        primary: 'border-gray-200'
      },
      text: {
        primary: 'text-gray-900',
        secondary: 'text-gray-600',
        tertiary: 'text-gray-500'
      }
    },
    dark: {
      background: {
        primary: 'bg-gray-800'
      },
      border: {
        primary: 'border-gray-700'
      },
      text: {
        primary: 'text-white',
        secondary: 'text-gray-300',
        tertiary: 'text-gray-400'
      }
    }
  }

  const currentTheme = themeStyles[theme]

  if (!opportunity) return null

  const stage = DEAL_STAGES.find(s => s.id === opportunity.stage)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${currentTheme.background.primary} rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${currentTheme.border.primary}`}>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className={`p-1 ${currentTheme.text.secondary} hover:${currentTheme.text.primary} rounded-lg transition-colors`}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h2 className={`text-xl font-semibold ${currentTheme.text.primary}`}>
                Opportunity Details
              </h2>
              <p className={`text-sm ${currentTheme.text.secondary} mt-1`}>
                View and manage opportunity information
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className={`text-lg font-medium ${currentTheme.text.primary} mb-4`}>
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${currentTheme.text.secondary} mb-1`}>
                  Opportunity Title
                </label>
                <p className={`${currentTheme.text.primary} font-medium`}>
                  {opportunity.title || 'Unnamed Opportunity'}
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${currentTheme.text.secondary} mb-1`}>
                  Stage
                </label>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${stage?.color}`} />
                  <span className={`${currentTheme.text.primary} font-medium`}>
                    {stage?.name}
                  </span>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium ${currentTheme.text.secondary} mb-1`}>
                  Value
                </label>
                <p className="text-green-600 dark:text-green-400 font-semibold">
                  {formatExactAmount(opportunity.value)}
                </p>
              </div>
              {opportunity.expected_close_date && (
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.secondary} mb-1`}>
                    Expected Close Date
                  </label>
                  <p className={currentTheme.text.primary}>
                    {new Date(opportunity.expected_close_date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          {opportunity.contact && (
            <div>
              <h3 className={`text-lg font-medium ${currentTheme.text.primary} mb-4`}>
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.secondary} mb-1`}>
                    Company
                  </label>
                  <p className={currentTheme.text.primary}>
                    {opportunity.contact.company_name || 'No company'}
                  </p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.secondary} mb-1`}>
                    Contact Person
                  </label>
                  <p className={currentTheme.text.primary}>
                    {opportunity.contact.first_name} {opportunity.contact.last_name}
                  </p>
                </div>
                {opportunity.contact.email && (
                  <div>
                    <label className={`block text-sm font-medium ${currentTheme.text.secondary} mb-1`}>
                      Email
                    </label>
                    <p className={currentTheme.text.primary}>
                      {opportunity.contact.email}
                    </p>
                  </div>
                )}
                {opportunity.contact.phone_number && (
                  <div>
                    <label className={`block text-sm font-medium ${currentTheme.text.secondary} mb-1`}>
                      Phone
                    </label>
                    <p className={currentTheme.text.primary}>
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
              <h3 className={`text-lg font-medium ${currentTheme.text.primary} mb-4`}>
                Description
              </h3>
              <p className={`${currentTheme.text.secondary} whitespace-pre-wrap`}>
                {opportunity.description}
              </p>
            </div>
          )}

          {/* Timestamps */}
          <div className={`border-t ${currentTheme.border.primary} pt-4`}>
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 text-sm ${currentTheme.text.tertiary}`}>
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
        <div className={`flex justify-end space-x-3 p-6 border-t ${currentTheme.border.primary}`}>
          <button
            onClick={onDelete}
            className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Opportunity
          </button>
        </div>
      </div>
    </div>
  )
}

// Opportunity Card Component
const OpportunityCard = ({ opportunity, onView, onEdit, onDelete }) => {
  const { theme } = useUIStore()
  const stage = DEAL_STAGES.find(s => s.id === opportunity.stage)
  const [showActions, setShowActions] = useState(false)
  
  const themeStyles = {
    light: {
      background: {
        primary: 'bg-white',
        secondary: 'bg-gray-100',
        hover: 'hover:bg-gray-50'
      },
      border: {
        primary: 'border-gray-200'
      },
      text: {
        primary: 'text-gray-900',
        secondary: 'text-gray-600',
        tertiary: 'text-gray-500'
      }
    },
    dark: {
      background: {
        primary: 'bg-gray-700',
        secondary: 'bg-gray-600',
        hover: 'hover:bg-gray-600'
      },
      border: {
        primary: 'border-gray-600'
      },
      text: {
        primary: 'text-white',
        secondary: 'text-gray-300',
        tertiary: 'text-gray-400'
      }
    }
  }

  const currentTheme = themeStyles[theme]
  
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
      className={`${currentTheme.background.primary} rounded-lg p-3 border ${currentTheme.border.primary} shadow-sm ${currentTheme.background.hover} transition-all cursor-pointer group mb-3`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 
          onClick={() => onView(opportunity)}
          className={`font-semibold ${currentTheme.text.primary} hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm line-clamp-1 cursor-pointer flex-1 mr-2`}
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
            <div className={`absolute right-0 top-6 w-48 ${theme === 'light' ? 'bg-white' : 'bg-gray-800'} border ${currentTheme.border.primary} rounded-lg shadow-lg z-10`}>
              <button
                onClick={() => {
                  onView(opportunity)
                  setShowActions(false)
                }}
                className={`flex items-center w-full px-3 py-2 text-sm ${currentTheme.text.secondary} hover:${currentTheme.background.secondary}`}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </button>
              <button
                onClick={() => {
                  onEdit(opportunity)
                  setShowActions(false)
                }}
                className={`flex items-center w-full px-3 py-2 text-sm ${currentTheme.text.secondary} hover:${currentTheme.background.secondary}`}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </button>
              <button
                onClick={() => {
                  onDelete(opportunity)
                  setShowActions(false)
                }}
                className={`flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:${theme === 'light' ? 'bg-red-50' : 'bg-red-900/20'}`}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-1.5">
        <div className={`flex items-center gap-1.5 text-xs ${currentTheme.text.secondary}`}>
          <Building className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{companyName}</span>
        </div>
        
        <div className={`flex items-center gap-1.5 text-xs ${currentTheme.text.secondary}`}>
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
      
      <div className={`flex items-center justify-between mt-2 pt-2 border-t ${theme === 'light' ? 'border-gray-100' : 'border-gray-600'}`}>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${stage?.color}`} />
          <span className={`text-xs ${currentTheme.text.tertiary} truncate`}>{stage?.name}</span>
        </div>
      </div>
    </div>
  )
}

// Stage Column Component
const StageColumn = ({ stage, opportunities, onView, onEdit, onDelete }) => {
  const { theme } = useUIStore()
  const { updateOpportunityStage } = useDataStore()
  const stageOpportunities = opportunities.filter(opp => opp.stage === stage.id)

  const themeStyles = {
    light: {
      background: {
        primary: 'bg-white',
        empty: 'bg-gray-50'
      },
      border: {
        primary: 'border-gray-200',
        empty: 'border-gray-200'
      },
      text: {
        primary: 'text-gray-900',
        secondary: 'text-gray-600',
        empty: 'text-gray-400'
      }
    },
    dark: {
      background: {
        primary: 'bg-gray-800',
        empty: 'bg-gray-700/50'
      },
      border: {
        primary: 'border-gray-700',
        empty: 'border-gray-600'
      },
      text: {
        primary: 'text-white',
        secondary: 'text-gray-300',
        empty: 'text-gray-500'
      }
    }
  }

  const currentTheme = themeStyles[theme]

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
          <div className={`text-center py-6 ${currentTheme.text.empty} text-xs border-2 border-dashed ${currentTheme.border.empty} rounded-lg h-24 flex items-center justify-center`}>
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
  const { theme } = useUIStore()
  const { deleteOpportunity, updateOpportunity } = useDataStore()
  const [selectedOpportunity, setSelectedOpportunity] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [opportunityToDelete, setOpportunityToDelete] = useState(null)
  const [contacts, setContacts] = useState([])
  const [loadingContacts, setLoadingContacts] = useState(false)

  const themeStyles = {
    light: {
      background: {
        page: 'bg-gray-50'
      }
    },
    dark: {
      background: {
        page: 'bg-gray-900'
      }
    }
  }

  const currentTheme = themeStyles[theme]

  // Fetch contacts from API like the OpportunityForm component
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoadingContacts(true)
        console.log('🔍 KanbanBoard: Fetching contacts from API...')
        
        const response = await contactsAPI.getAll()
        console.log('📋 KanbanBoard: Contacts API response:', response)
        
        // Handle paginated response structure (results) or direct array
        const contactsData = response.data.results || response.data || []
        console.log('👥 KanbanBoard: Contacts data:', {
          data: contactsData,
          type: typeof contactsData,
          isArray: Array.isArray(contactsData),
          length: Array.isArray(contactsData) ? contactsData.length : 'N/A'
        })
        
        setContacts(contactsData)
      } catch (err) {
        console.error('❌ KanbanBoard: Failed to fetch contacts:', err)
        console.log('Error details:', err.response)
        setContacts([]) // Ensure contacts is always an array
      } finally {
        setLoadingContacts(false)
      }
    }
    fetchContacts()
  }, [])

  const handleViewOpportunity = (opportunity) => {
    setSelectedOpportunity(opportunity)
    setShowDetailsModal(true)
  }

  const handleEditOpportunity = (opportunity) => {
    setSelectedOpportunity(opportunity)
    setShowEditModal(true)
  }

  const handleSaveOpportunity = async (formData) => {
    if (selectedOpportunity) {
      await updateOpportunity(selectedOpportunity.id, formData)
    }
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
      } catch (error) {
        console.error('Failed to delete opportunity:', error)
        alert('Failed to delete opportunity. Please try again.')
      }
    }
  }

  const handleCloseModals = () => {
    setShowDetailsModal(false)
    setShowEditModal(false)
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
            setShowDetailsModal(false)
          }}
          onDelete={() => {
            handleDeleteOpportunity(selectedOpportunity)
            setShowDetailsModal(false)
          }}
        />
      )}

      {/* Edit Opportunity Modal */}
      {showEditModal && (
        <EditOpportunityModal
          opportunity={selectedOpportunity}
          contacts={contacts}
          onClose={handleCloseModals}
          onSave={handleSaveOpportunity}
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