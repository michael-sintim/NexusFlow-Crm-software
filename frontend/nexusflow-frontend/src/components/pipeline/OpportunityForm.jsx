import React from 'react'
import { useForm } from 'react-hook-form'
import { useApi } from '../../hooks/useApi'
import { useUIStore } from '../../store/uiStore'
import { opportunitiesAPI, contactsAPI } from '../../services/api'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { ArrowLeft, TrendingUp, Target, User, Calendar, DollarSign, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const OpportunityForm = ({ initialData }) => {
  const { theme } = useUIStore()
  const { register, handleSubmit, formState: { errors }, watch, setError, clearErrors } = useForm({
    defaultValues: initialData || {
      value: 0,
      stage: 'prospect'
    }
  })
  const { loading, error, callApi } = useApi()
  const [contacts, setContacts] = React.useState([])
  const navigate = useNavigate()

  const themeStyles = {
    light: {
      background: {
        primary: 'bg-white',
        page: 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50',
        error: 'bg-red-50'
      },
      border: {
        primary: 'border-gray-200',
        secondary: 'border-gray-300',
        error: 'border-red-200'
      },
      text: {
        primary: 'text-gray-900',
        secondary: 'text-gray-600',
        tertiary: 'text-gray-500',
        error: 'text-red-800'
      }
    },
    dark: {
      background: {
        primary: 'bg-gray-800',
        page: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900',
        error: 'bg-red-900/20'
      },
      border: {
        primary: 'border-gray-700',
        secondary: 'border-gray-600',
        error: 'border-red-800'
      },
      text: {
        primary: 'text-white',
        secondary: 'text-gray-400',
        tertiary: 'text-gray-500',
        error: 'text-red-400'
      }
    }
  }

  const currentTheme = themeStyles[theme]

  React.useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await contactsAPI.getAll()
        // Handle paginated response
        setContacts(response.data.results || response.data || [])
      } catch (err) {
        console.error('Failed to fetch contacts:', err)
      }
    }
    fetchContacts()
  }, [])

  // Custom date validation function
  const validateDate = (dateString) => {
    if (!dateString) return true // Optional field
    
    const selectedDate = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to compare dates only
    
    if (selectedDate < today) {
      return 'Close date cannot be in the past'
    }
    
    return true
  }

  const onSubmit = async (data) => {
    try {
      // Clear any existing date errors
      clearErrors('expected_close_date')
      
      // Validate date before submission
      const dateValidation = validateDate(data.expected_close_date)
      if (dateValidation !== true) {
        setError('expected_close_date', {
          type: 'manual',
          message: dateValidation
        })
        return
      }

      if (initialData) {
        await callApi(() => opportunitiesAPI.update(initialData.id, data))
      } else {
        await callApi(() => opportunitiesAPI.create(data))
      }
      // Navigate back to pipeline page after successful creation/update
      navigate('/pipeline')
    } catch (err) {
      // Error handled by useApi
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

  const value = watch('value')
  const closeDate = watch('expected_close_date')

  // Real-time date validation (optional)
  React.useEffect(() => {
    if (closeDate) {
      const validation = validateDate(closeDate)
      if (validation !== true) {
        setError('expected_close_date', {
          type: 'manual',
          message: validation
        })
      } else {
        clearErrors('expected_close_date')
      }
    }
  }, [closeDate, setError, clearErrors])

  return (
    <div className={`min-h-screen ${currentTheme.background.page} py-8`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/pipeline')}
            className={`flex items-center ${currentTheme.text.secondary} hover:${currentTheme.text.primary} mb-6 transition-colors`}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Pipeline
          </button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <h1 className={`text-3xl font-bold ${currentTheme.text.primary}`}>
              {initialData ? 'Update Opportunity' : 'Create New Opportunity'}
            </h1>
            <p className={`${currentTheme.text.secondary} mt-2`}>
              {initialData ? 'Update opportunity details' : 'Add a new sales opportunity to your pipeline'}
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className={`${currentTheme.background.primary} rounded-2xl shadow-xl border ${currentTheme.border.primary} p-8`}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {error && (
              <div className={`p-4 ${currentTheme.background.error} border ${currentTheme.border.error} rounded-lg`}>
                <p className={`${currentTheme.text.error} text-sm`}>{error}</p>
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className={`text-lg font-semibold ${currentTheme.text.primary} flex items-center`}>
                <FileText className="h-5 w-5 mr-2 text-green-500" />
                Opportunity Details
              </h3>
              
              <Input
                label="Opportunity Title"
                {...register('title', { required: 'Title is required' })}
                error={errors.title?.message}
                placeholder="Enter opportunity title"
                leftIcon={<FileText className="h-4 w-4 text-gray-400" />}
                theme={theme}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.secondary} mb-2 flex items-center`}>
                    <User className="h-4 w-4 mr-2 text-gray-400" />
                    Contact
                  </label>
                  <select
                    {...register('contact', { required: 'Contact is required' })}
                    className={`w-full px-3 py-2 border ${currentTheme.border.secondary} rounded-lg ${theme === 'light' ? 'bg-white' : 'bg-gray-700'} ${currentTheme.text.primary} focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200`}
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
                    <p className={`${currentTheme.text.error} text-sm mt-1`}>{errors.contact.message}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.secondary} mb-2 flex items-center`}>
                    <Target className="h-4 w-4 mr-2 text-gray-400" />
                    Stage
                  </label>
                  <select
                    {...register('stage', { required: 'Stage is required' })}
                    className={`w-full px-3 py-2 border ${currentTheme.border.secondary} rounded-lg ${theme === 'light' ? 'bg-white' : 'bg-gray-700'} ${currentTheme.text.primary} focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200`}
                  >
                    {stageOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.stage && (
                    <p className={`${currentTheme.text.error} text-sm mt-1`}>{errors.stage.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="space-y-6">
              <h3 className={`text-lg font-semibold ${currentTheme.text.primary} flex items-center`}>
                <DollarSign className="h-5 w-5 mr-2 text-green-500" />
                Financial Details
              </h3>
              
              <Input
                label="Value"
                type="number"
                step="0.01"
                {...register('value', { 
                  required: 'Value is required',
                  min: { value: 0, message: 'Value must be positive' }
                })}
                error={errors.value?.message}
                placeholder="0.00"
                leftIcon={<DollarSign className="h-4 w-4 text-gray-400" />}
                value={value}
                theme={theme}
              />
            </div>

            {/* Timeline */}
            <div className="space-y-6">
              <h3 className={`text-lg font-semibold ${currentTheme.text.primary} flex items-center`}>
                <Calendar className="h-5 w-5 mr-2 text-green-500" />
                Timeline
              </h3>
              
              <Input
                label="Expected Close Date"
                type="date"
                {...register('expected_close_date', {
                  validate: validateDate
                })}
                error={errors.expected_close_date?.message}
                leftIcon={<Calendar className="h-4 w-4 text-gray-400" />}
                theme={theme}
              />
            </div>

            {/* Additional Information */}
            <div className="space-y-6">
              <h3 className={`text-lg font-semibold ${currentTheme.text.primary} flex items-center`}>
                <FileText className="h-5 w-5 mr-2 text-green-500" />
                Additional Information
              </h3>
              
              <div>
                <label className={`block text-sm font-medium ${currentTheme.text.secondary} mb-2`}>
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className={`w-full px-3 py-2 border ${currentTheme.border.secondary} rounded-lg ${theme === 'light' ? 'bg-white' : 'bg-gray-700'} ${currentTheme.text.primary} focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition-colors duration-200 placeholder-gray-500 dark:placeholder-gray-400`}
                  placeholder="Describe this opportunity, including key requirements, decision makers, and any specific details..."
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className={`flex justify-end space-x-4 pt-6 border-t ${currentTheme.border.primary}`}>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/pipeline')}
                disabled={loading}
                className={`px-8 py-3 ${currentTheme.border.secondary} ${currentTheme.text.secondary} hover:${theme === 'light' ? 'bg-gray-50' : 'bg-gray-700'}`}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
              >
                {initialData ? 'Update Opportunity' : 'Create Opportunity'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className={`absolute -top-40 -right-32 w-80 h-80 ${theme === 'light' ? 'bg-green-200' : 'bg-green-900'} rounded-full blur-3xl opacity-30`}></div>
        <div className={`absolute -bottom-40 -left-32 w-80 h-80 ${theme === 'light' ? 'bg-teal-200' : 'bg-teal-900'} rounded-full blur-3xl opacity-30`}></div>
      </div>
    </div>
  )
}

export default OpportunityForm