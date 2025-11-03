import React from 'react'
import { useForm } from 'react-hook-form'
import { useApi } from '../../hooks/useApi'
import { contactsAPI } from '../../services/api'
import Input from '../ui/Input'
import Button from '../ui/Button'
import ContactCard from './ContactCard'
import { 
  Mail, Phone, Building, Calendar, MoreVertical, 
  ArrowLeft, User, Briefcase, Globe, FileText, Users 
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const ContactList = ({ contacts, onContactUpdate }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      source: 'other'
    }
  })
  const { loading, error, callApi } = useApi()
  const navigate = useNavigate()

  const onSubmit = async (data) => {
    try {
      await callApi(() => contactsAPI.create(data))
      // Refresh the page or navigate to show the new contact
      window.location.reload()
    } catch (err) {
      // Error handled by useApi
    }
  }

  const sourceOptions = [
    { value: 'referral', label: 'Referral' },
    { value: 'cold_call', label: 'Cold Call' },
    { value: 'website', label: 'Website' },
    { value: 'email', label: 'Email' },
    { value: 'social_media', label: 'Social Media' },
    { value: 'other', label: 'Other' },
  ]

  // If there are no contacts, display the contact creation form
  if (contacts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome! Add Your First Customer
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl mx-auto">
                Let's get started by adding your first customer. This will help you track conversations, deals, and build your sales pipeline.
              </p>
            </div>
          </div>

          {/* Welcome message */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 dark:bg-blue-800 p-3 rounded-full flex-shrink-0">
                <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Start Building Your Customer Base
                </h3>
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  Adding your first customer is the first step toward growing your business. 
                  Once added, you'll be able to track deals, schedule follow-ups, and manage your entire sales pipeline.
                </p>
              </div>
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

              {/* Personal Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-500" />
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="First Name"
                    {...register('first_name', { required: 'First name is required' })}
                    error={errors.first_name?.message}
                    placeholder="Enter first name"
                    leftIcon={<User className="h-4 w-4 text-gray-400" />}
                  />
                  
                  <Input
                    label="Last Name"
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
                  Customer Information
                </h3>
                
                <Input
                  label="Email"
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
                      How did you connect?
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
              <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="submit"
                  loading={loading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Add Your First Customer
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Background decoration */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-200 dark:bg-blue-900 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-purple-200 dark:bg-purple-900 rounded-full blur-3xl opacity-30"></div>
        </div>
      </div>
    )
  }

  // Normal contact list display when contacts exist
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {contacts.map((contact) => (
        <ContactCard 
          key={contact.id} 
          contact={contact}
          onUpdate={onContactUpdate}
        />
      ))}
    </div>
  )
}

export default ContactList