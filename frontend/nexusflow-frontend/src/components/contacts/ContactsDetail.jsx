import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Mail, Phone, Building, Calendar, User, Globe, FileText, Trash2 } from 'lucide-react'
import { useDataStore } from '../../store/dataStore'
import Button from '../ui/Button'

const ContactDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { 
    currentContact, 
    fetchContact, 
    deleteContact, 
    contactsLoading, 
    contactsError,
    clearCurrentContact
  } = useDataStore()
  
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  React.useEffect(() => {
    const loadContact = async () => {
      try {
        setIsLoading(true)
        setError(null)
        await fetchContact(id)
      } catch (error) {
        console.error('Error loading contact:', error)
        setError('Failed to load contact details. Please try again.')
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

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${currentContact?.first_name} ${currentContact?.last_name}? This action cannot be undone.`)) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteContact(id)
      navigate('/contacts')
    } catch (error) {
      console.error('Failed to delete contact:', error)
      setError('Failed to delete contact. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = () => {
    navigate(`/contacts/${id}/edit`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 mb-6">
            <Button
              variant="outline"
              onClick={() => navigate('/contacts')}
              disabled
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Contacts
            </Button>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 animate-pulse">
            <div className="flex items-center space-x-6 mb-8">
              <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="space-y-2 flex-1">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !currentContact) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="w-full px-4 sm:px-6 lg:px-8">
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
              {error || 'Contact Not Found'}
            </h3>
            <p className="text-red-600 dark:text-red-300 mb-6">
              {error ? error : 'The contact you are looking for does not exist or has been deleted.'}
            </p>
            <Button onClick={() => navigate('/contacts')}>
              Return to Contacts
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const fullName = `${currentContact.first_name} ${currentContact.last_name}`
  const initials = `${currentContact.first_name[0]}${currentContact.last_name[0]}`.toUpperCase()

  const formatSource = (source) => {
    return source.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/contacts')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Contacts
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
                Contact Details
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Viewing information for {fullName}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={isDeleting || contactsLoading}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? 'Deleting...' : 'Delete Contact'}
            </Button>
            <Button
              onClick={handleEdit}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Contact
            </Button>
          </div>
        </div>

        {/* Contact Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header with Avatar */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {initials}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{fullName}</h2>
                <p className="text-blue-100 mt-1">{currentContact.title || 'No title specified'}</p>
                {currentContact.company_name && (
                  <p className="text-blue-100 flex items-center mt-1">
                    <Building className="h-4 w-4 mr-2" />
                    {currentContact.company_name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-500" />
                  Personal Information
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-start py-3 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</span>
                    <span className="text-sm text-gray-900 dark:text-white text-right">
                      {fullName}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-start py-3 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</span>
                    <div className="text-right">
                      <div className="flex items-center justify-end space-x-2 text-sm text-gray-900 dark:text-white">
                        <Mail className="h-4 w-4" />
                        <span>{currentContact.email}</span>
                      </div>
                    </div>
                  </div>
                  
                  {currentContact.phone_number && (
                    <div className="flex justify-between items-start py-3 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</span>
                      <div className="text-right">
                        <div className="flex items-center justify-end space-x-2 text-sm text-gray-900 dark:text-white">
                          <Phone className="h-4 w-4" />
                          <span>{currentContact.phone_number}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Building className="h-5 w-5 mr-2 text-blue-500" />
                  Professional Information
                </h3>
                
                <div className="space-y-4">
                  {currentContact.company_name && (
                    <div className="flex justify-between items-start py-3 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Company</span>
                      <div className="text-right">
                        <div className="flex items-center justify-end space-x-2 text-sm text-gray-900 dark:text-white">
                          <Building className="h-4 w-4" />
                          <span>{currentContact.company_name}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {currentContact.title && (
                    <div className="flex justify-between items-start py-3 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Job Title</span>
                      <span className="text-sm text-gray-900 dark:text-white">{currentContact.title}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start py-3 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Source</span>
                    <div className="text-right">
                      <div className="flex items-center justify-end space-x-2 text-sm text-gray-900 dark:text-white">
                        <Globe className="h-4 w-4" />
                        <span className="capitalize">{formatSource(currentContact.source)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            {currentContact.notes && (
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
                  <FileText className="h-5 w-5 mr-2 text-blue-500" />
                  Notes
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {currentContact.notes}
                  </p>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activity</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Last Contacted</div>
                    <div className="text-gray-900 dark:text-white">
                      {currentContact.last_contacted 
                        ? new Date(currentContact.last_contacted).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'Never contacted'
                      }
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Created</div>
                    <div className="text-gray-900 dark:text-white">
                      {new Date(currentContact.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Last Updated</div>
                    <div className="text-gray-900 dark:text-white">
                      {new Date(currentContact.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactDetailPage