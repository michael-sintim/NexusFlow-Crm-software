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
import { useUIStore } from '../../store/uiStore'
import { cn } from '../../lib/utils'

const ContactList = ({ contacts, onContactUpdate }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      source: 'other'
    }
  })
  const { loading, error, callApi } = useApi()
  const { theme } = useUIStore()
  const navigate = useNavigate()

  // Theme-based styles
  const themeStyles = {
    light: {
      background: {
        page: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50',
        card: 'bg-white'
      },
      border: {
        primary: 'border-gray-200',
        secondary: 'border-gray-300'
      },
      text: {
        primary: 'text-gray-900',
        secondary: 'text-gray-700',
        tertiary: 'text-gray-600'
      }
    },
    dark: {
      background: {
        page: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900',
        card: 'bg-gray-800'
      },
      border: {
        primary: 'border-gray-700',
        secondary: 'border-gray-600'
      },
      text: {
        primary: 'text-white',
        secondary: 'text-gray-300',
        tertiary: 'text-gray-400'
      }
    }
  }

  const currentTheme = themeStyles[theme]

  const onSubmit = async (data) => {
    try {
      await callApi(() => contactsAPI.create(data))
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
      <div className={cn(
        "min-h-screen py-8",
        currentTheme.background.page
      )}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h1 className={cn(
                "text-3xl font-bold",
                currentTheme.text.primary
              )}>
                Welcome! Add Your First Customer
              </h1>
              <p className={cn(
                "mt-2 max-w-2xl mx-auto",
                currentTheme.text.tertiary
              )}>
                Let's get started by adding your first customer. This will help you track conversations, deals, and build your sales pipeline.
              </p>
            </div>
          </div>

          {/* Welcome message */}
          <div className={cn(
            "border rounded-xl p-6 mb-8",
            theme === 'light'
              ? "bg-blue-50 border-blue-200"
              : "bg-blue-900/20 border-blue-800"
          )}>
            <div className="flex items-start space-x-4">
              <div className={cn(
                "p-3 rounded-full flex-shrink-0",
                theme === 'light' ? "bg-blue-100" : "bg-blue-800"
              )}>
                <User className={cn(
                  "h-6 w-6",
                  theme === 'light' ? "text-blue-600" : "text-blue-400"
                )} />
              </div>
              <div>
                <h3 className={cn(
                  "text-lg font-semibold mb-2",
                  theme === 'light' ? "text-blue-900" : "text-blue-100"
                )}>
                  Start Building Your Customer Base
                </h3>
                <p className={cn(
                  "text-sm",
                  theme === 'light' ? "text-blue-700" : "text-blue-300"
                )}>
                  Adding your first customer is the first step toward growing your business. 
                  Once added, you'll be able to track deals, schedule follow-ups, and manage your entire sales pipeline.
                </p>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className={cn(
            "rounded-2xl shadow-xl border p-8",
            currentTheme.background.card,
            currentTheme.border.primary
          )}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {error && (
                <div className={cn(
                  "p-4 border rounded-lg",
                  theme === 'light'
                    ? "bg-red-50 border-red-200"
                    : "bg-red-900/20 border-red-800"
                )}>
                  <p className={cn(
                    "text-sm",
                    theme === 'light' ? "text-red-600" : "text-red-400"
                  )}>{error}</p>
                </div>
              )}

              {/* Personal Information */}
              <div className="space-y-6">
                <h3 className={cn(
                  "text-lg font-semibold flex items-center",
                  currentTheme.text.primary
                )}>
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
                <h3 className={cn(
                  "text-lg font-semibold flex items-center",
                  currentTheme.text.primary
                )}>
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
                    <label className={cn(
                      "block text-sm font-medium mb-2 flex items-center",
                      currentTheme.text.secondary
                    )}>
                      <Globe className="h-4 w-4 mr-2 text-gray-400" />
                      How did you connect?
                    </label>
                    <select
                      {...register('source')}
                      className={cn(
                        "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200",
                        theme === 'light'
                          ? "border-gray-300 bg-white text-gray-900"
                          : "border-gray-600 bg-gray-700 text-white"
                      )}
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
                <h3 className={cn(
                  "text-lg font-semibold flex items-center",
                  currentTheme.text.primary
                )}>
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
                <h3 className={cn(
                  "text-lg font-semibold flex items-center",
                  currentTheme.text.primary
                )}>
                  <FileText className="h-5 w-5 mr-2 text-blue-500" />
                  Additional Information
                </h3>
                
                <div>
                  <label className={cn(
                    "block text-sm font-medium mb-2",
                    currentTheme.text.secondary
                  )}>
                    Notes
                  </label>
                  <textarea
                    {...register('notes')}
                    rows={4}
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors duration-200",
                      theme === 'light'
                        ? "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                        : "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                    )}
                    placeholder="Describe the task details, objectives, and any specific requirements..."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className={cn(
                "flex justify-end pt-6 border-t",
                currentTheme.border.secondary
              )}>
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
          <div className={cn(
            "absolute -top-40 -right-32 w-80 h-80 rounded-full blur-3xl opacity-30",
            theme === 'light' ? "bg-blue-200" : "bg-blue-900"
          )}></div>
          <div className={cn(
            "absolute -bottom-40 -left-32 w-80 h-80 rounded-full blur-3xl opacity-30",
            theme === 'light' ? "bg-purple-200" : "bg-purple-900"
          )}></div>
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