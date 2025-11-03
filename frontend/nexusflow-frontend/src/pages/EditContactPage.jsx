import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useDataStore } from '../store/dataStore'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { ArrowLeft, User, Mail, Phone, Building, Briefcase, Globe, FileText } from 'lucide-react'

const EditContactPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { 
    currentContact, 
    fetchContact, 
    updateContact, 
    contactsLoading, 
    contactsError,
    clearCurrentContact
  } = useDataStore()
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      source: 'other'
    }
  })

  const sourceOptions = [
    { value: 'referral', label: 'Referral' },
    { value: 'cold_call', label: 'Cold Call' },
    { value: 'website', label: 'Website' },
    { value: 'email', label: 'Email' },
    { value: 'social_media', label: 'Social Media' },
    { value: 'other', label: 'Other' },
  ]

  const [isLoading, setIsLoading] = React.useState(true)

  // Load contact data for editing
  React.useEffect(() => {
    const loadContact = async () => {
      try {
        setIsLoading(true)
        await fetchContact(id)
      } catch (error) {
        console.error('Error loading contact for editing:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      loadContact()
    }

    // Clear current contact when component unmounts
    return () => {
      clearCurrentContact()
    }
  }, [id, fetchContact, clearCurrentContact])

  // Populate form when currentContact changes
  React.useEffect(() => {
    if (currentContact) {
      reset({
        first_name: currentContact.first_name || '',
        last_name: currentContact.last_name || '',
        email: currentContact.email || '',
        phone_number: currentContact.phone_number || '',
        company_name: currentContact.company_name || '',
        title: currentContact.title || '',
        source: currentContact.source || 'other',
        notes: currentContact.notes || '',
      })
    }
  }, [currentContact, reset])

  const onSubmit = async (data) => {
    try {
      await updateContact(id, data)
      navigate(`/contacts/${id}`)
    } catch (error) {
      console.error('Error updating contact:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 mb-6">
            <Button
              variant="outline"
              onClick={() => navigate(`/contacts/${id}`)}
              disabled
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Contact
            </Button>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 animate-pulse">
            <div className="space-y-6">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!currentContact) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="outline"
            onClick={() => navigate('/contacts')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Contacts
          </Button>
          
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-red-800 dark:text-red-400 mb-2">
              Contact Not Found
            </h3>
            <p className="text-red-600 dark:text-red-300 mb-6">
              The contact you are trying to edit does not exist or has been deleted.
            </p>
            <Button onClick={() => navigate('/contacts')}>
              Return to Contacts
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate(`/contacts/${id}`)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Contact
          </Button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Edit Contact
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Update contact information for {currentContact.first_name} {currentContact.last_name}
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {contactsError && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm">
                  {typeof contactsError === 'object' ? JSON.stringify(contactsError) : contactsError}
                </p>
              </div>
            )}

            {/* Personal Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-500" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="First Name *"
                  {...register('first_name', { required: 'First name is required' })}
                  error={errors.first_name?.message}
                  placeholder="Enter first name"
                  leftIcon={<User className="h-4 w-4 text-gray-400" />}
                />
                
                <Input
                  label="Last Name *"
                  {...register('last_name', { required: 'Last name is required' })}
                  error={errors.last_name?.message}
                  placeholder="Enter last name"
                  leftIcon={<User className="h-4 w-4 text-gray-400" />}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Mail className="h-5 w-5 mr-2 text-blue-500" />
                Contact Information
              </h3>
              
              <Input
                label="Email *"
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                error={errors.email?.message}
                placeholder="Enter email address"
                leftIcon={<Mail className="h-4 w-4 text-gray-400" />}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Phone Number"
                  {...register('phone_number')}
                  error={errors.phone_number?.message}
                  placeholder="Enter phone number"
                  leftIcon={<Phone className="h-4 w-4 text-gray-400" />}
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <Globe className="h-4 w-4 mr-2 text-gray-400" />
                    Source
                  </label>
                  <select
                    {...register('source')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  >
                    {sourceOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Building className="h-5 w-5 mr-2 text-blue-500" />
                Professional Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Company"
                  {...register('company_name')}
                  error={errors.company_name?.message}
                  placeholder="Enter company name"
                  leftIcon={<Building className="h-4 w-4 text-gray-400" />}
                />
                
                <Input
                  label="Job Title"
                  {...register('title')}
                  error={errors.title?.message}
                  placeholder="Enter job title"
                  leftIcon={<Briefcase className="h-4 w-4 text-gray-400" />}
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-500" />
                Additional Information
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  {...register('notes')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors duration-200"
                  placeholder="Add any notes about this contact, such as interests, conversation points, or follow-up reminders..."
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/contacts/${id}`)}
                disabled={contactsLoading}
                className="px-8 py-3 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={contactsLoading}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
              >
                Update Contact
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditContactPage