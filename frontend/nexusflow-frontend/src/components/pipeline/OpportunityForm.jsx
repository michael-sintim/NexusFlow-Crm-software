import React from 'react'
import { useForm } from 'react-hook-form'
import { useApi } from '../../hooks/useApi'
import { opportunitiesAPI, contactsAPI } from '../../services/api'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { ArrowLeft, TrendingUp, Target, User, Calendar, DollarSign, Percent, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const OpportunityForm = ({ initialData }) => {
  const { register, handleSubmit, formState: { errors }, watch, setError, clearErrors } = useForm({
    defaultValues: initialData || {
      probability: 0,
      value: 0,
      stage: 'prospect'
    }
  })
  const { loading, error, callApi } = useApi()
  const [contacts, setContacts] = React.useState([])
  const navigate = useNavigate()

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

  const probability = watch('probability')
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/pipeline')}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Pipeline
          </button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {initialData ? 'Update Opportunity' : 'Create New Opportunity'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {initialData ? 'Update opportunity details' : 'Add a new sales opportunity to your pipeline'}
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <FileText className="h-5 w-5 mr-2 text-green-500" />
                Opportunity Details
              </h3>
              
              <Input
                label="Opportunity Title"
                {...register('title', { required: 'Title is required' })}
                error={errors.title?.message}
                placeholder="Enter opportunity title"
                leftIcon={<FileText className="h-4 w-4 text-gray-400" />}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <User className="h-4 w-4 mr-2 text-gray-400" />
                    Contact
                  </label>
                  <select
                    {...register('contact', { required: 'Contact is required' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200"
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
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.contact.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <Target className="h-4 w-4 mr-2 text-gray-400" />
                    Stage
                  </label>
                  <select
                    {...register('stage', { required: 'Stage is required' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200"
                  >
                    {stageOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.stage && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.stage.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-500" />
                Financial Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <Percent className="h-4 w-4 mr-2 text-gray-400" />
                    Probability ({probability}%)
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      {...register('probability', {
                        min: { value: 0, message: 'Probability must be between 0-100' },
                        max: { value: 100, message: 'Probability must be between 0-100' }
                      })}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider accent-green-500"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  {errors.probability && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.probability.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
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
              />
            </div>

            {/* Additional Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <FileText className="h-5 w-5 mr-2 text-green-500" />
                Additional Information
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition-colors duration-200 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Describe this opportunity, including key requirements, decision makers, and any specific details..."
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/pipeline')}
                disabled={loading}
                className="px-8 py-3 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
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
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-green-200 dark:bg-green-900 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-teal-200 dark:bg-teal-900 rounded-full blur-3xl opacity-30"></div>
      </div>
    </div>
  )
}

export default OpportunityForm