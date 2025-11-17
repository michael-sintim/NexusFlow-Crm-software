import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Mail, Phone, Building, Calendar, User, Globe, FileText, Trash2 } from 'lucide-react'
import { useDataStore } from '../../store/dataStore'
import { useUIStore } from '../../store/uiStore'
import Button from '../ui/Button'
import { cn } from '../../lib/utils'

const ContactDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { theme } = useUIStore()
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

  // Theme-based styles
  const themeStyles = {
    light: {
      background: {
        primary: 'bg-white',
        secondary: 'bg-gray-50',
        page: 'bg-gray-50'
      },
      border: {
        primary: 'border-gray-200',
        secondary: 'border-gray-300'
      },
      text: {
        primary: 'text-gray-900',
        secondary: 'text-gray-600',
        tertiary: 'text-gray-500'
      }
    },
    dark: {
      background: {
        primary: 'bg-gray-800',
        secondary: 'bg-gray-750',
        page: 'bg-gray-900'
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
      <div className={cn(
        "min-h-screen py-8",
        currentTheme.background.page
      )}>
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
            <div className={cn(
              "h-8 rounded w-48 animate-pulse",
              theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'
            )}></div>
          </div>
          
          <div className={cn(
            "rounded-xl shadow-sm border p-8 animate-pulse",
            currentTheme.background.primary,
            currentTheme.border.primary
          )}>
            <div className="flex items-center space-x-6 mb-8">
              <div className={cn(
                "w-20 h-20 rounded-full",
                theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'
              )}></div>
              <div className="space-y-2 flex-1">
                <div className={cn(
                  "h-6 rounded w-64",
                  theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'
                )}></div>
                <div className={cn(
                  "h-4 rounded w-32",
                  theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'
                )}></div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="space-y-2">
                  <div className={cn(
                    "h-4 rounded w-24",
                    theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'
                  )}></div>
                  <div className={cn(
                    "h-6 rounded w-full",
                    theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'
                  )}></div>
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
      <div className={cn(
        "min-h-screen py-8",
        currentTheme.background.page
      )}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <Button
            variant="outline"
            onClick={() => navigate('/contacts')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Contacts
          </Button>
          
          <div className={cn(
            "border rounded-xl p-8 text-center",
            theme === 'light'
              ? "bg-red-50 border-red-200"
              : "bg-red-900/20 border-red-800"
          )}>
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
              theme === 'light' ? 'bg-red-100' : 'bg-red-800'
            )}>
              <User className={cn(
                "h-8 w-8",
                theme === 'light' ? 'text-red-600' : 'text-red-400'
              )} />
            </div>
            <h3 className={cn(
              "text-xl font-semibold mb-2",
              theme === 'light' ? 'text-red-800' : 'text-red-400'
            )}>
              {error || 'Contact Not Found'}
            </h3>
            <p className={cn(
              "mb-6",
              theme === 'light' ? 'text-red-600' : 'text-red-300'
            )}>
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
    <div className={cn(
      "min-h-screen py-8",
      currentTheme.background.page
    )}>
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
              <h1 className={cn(
                "text-3xl font-bold text-center",
                currentTheme.text.primary
              )}>
                Contact Details
              </h1>
              <p className={cn(
                "mt-1",
                currentTheme.text.secondary
              )}>
                Viewing information for {fullName}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={isDeleting || contactsLoading}
              className={cn(
                theme === 'light'
                  ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                  : "text-red-400 hover:text-red-300 hover:bg-red-900/20"
              )}
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
        <div className={cn(
          "rounded-xl shadow-sm border overflow-hidden",
          currentTheme.background.primary,
          currentTheme.border.primary
        )}>
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
                <h3 className={cn(
                  "text-lg font-semibold flex items-center",
                  currentTheme.text.primary
                )}>
                  <User className="h-5 w-5 mr-2 text-blue-500" />
                  Personal Information
                </h3>
                
                <div className="space-y-4">
                  <div className={cn(
                    "flex justify-between items-start py-3 border-b",
                    currentTheme.border.primary
                  )}>
                    <span className={cn(
                      "text-sm font-medium",
                      currentTheme.text.tertiary
                    )}>Full Name</span>
                    <span className={cn(
                      "text-sm text-right",
                      currentTheme.text.primary
                    )}>
                      {fullName}
                    </span>
                  </div>
                  
                  <div className={cn(
                    "flex justify-between items-start py-3 border-b",
                    currentTheme.border.primary
                  )}>
                    <span className={cn(
                      "text-sm font-medium",
                      currentTheme.text.tertiary
                    )}>Email</span>
                    <div className="text-right">
                      <div className={cn(
                        "flex items-center justify-end space-x-2 text-sm",
                        currentTheme.text.primary
                      )}>
                        <Mail className="h-4 w-4" />
                        <span>{currentContact.email}</span>
                      </div>
                    </div>
                  </div>
                  
                  {currentContact.phone_number && (
                    <div className={cn(
                      "flex justify-between items-start py-3 border-b",
                      currentTheme.border.primary
                    )}>
                      <span className={cn(
                        "text-sm font-medium",
                        currentTheme.text.tertiary
                      )}>Phone</span>
                      <div className="text-right">
                        <div className={cn(
                          "flex items-center justify-end space-x-2 text-sm",
                          currentTheme.text.primary
                        )}>
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
                <h3 className={cn(
                  "text-lg font-semibold flex items-center",
                  currentTheme.text.primary
                )}>
                  <Building className="h-5 w-5 mr-2 text-blue-500" />
                  Professional Information
                </h3>
                
                <div className="space-y-4">
                  {currentContact.company_name && (
                    <div className={cn(
                      "flex justify-between items-start py-3 border-b",
                      currentTheme.border.primary
                    )}>
                      <span className={cn(
                        "text-sm font-medium",
                        currentTheme.text.tertiary
                      )}>Company</span>
                      <div className="text-right">
                        <div className={cn(
                          "flex items-center justify-end space-x-2 text-sm",
                          currentTheme.text.primary
                        )}>
                          <Building className="h-4 w-4" />
                          <span>{currentContact.company_name}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {currentContact.title && (
                    <div className={cn(
                      "flex justify-between items-start py-3 border-b",
                      currentTheme.border.primary
                    )}>
                      <span className={cn(
                        "text-sm font-medium",
                        currentTheme.text.tertiary
                      )}>Job Title</span>
                      <span className={cn(
                        "text-sm",
                        currentTheme.text.primary
                      )}>{currentContact.title}</span>
                    </div>
                  )}
                  
                  <div className={cn(
                    "flex justify-between items-start py-3 border-b",
                    currentTheme.border.primary
                  )}>
                    <span className={cn(
                      "text-sm font-medium",
                      currentTheme.text.tertiary
                    )}>Source</span>
                    <div className="text-right">
                      <div className={cn(
                        "flex items-center justify-end space-x-2 text-sm",
                        currentTheme.text.primary
                      )}>
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
              <div className={cn(
                "mt-8 pt-8 border-t",
                currentTheme.border.primary
              )}>
                <h3 className={cn(
                  "text-lg font-semibold flex items-center mb-4",
                  currentTheme.text.primary
                )}>
                  <FileText className="h-5 w-5 mr-2 text-blue-500" />
                  Notes
                </h3>
                <div className={cn(
                  "rounded-lg p-4",
                  theme === 'light' ? 'bg-gray-50' : 'bg-gray-700'
                )}>
                  <p className={cn(
                    "whitespace-pre-wrap",
                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                  )}>
                    {currentContact.notes}
                  </p>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className={cn(
              "mt-8 pt-8 border-t",
              currentTheme.border.primary
            )}>
              <h3 className={cn(
                "text-lg font-semibold mb-4",
                currentTheme.text.primary
              )}>Activity</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className={cn(
                  "flex items-center space-x-2",
                  currentTheme.text.tertiary
                )}>
                  <Calendar className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Last Contacted</div>
                    <div className={currentTheme.text.primary}>
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
                
                <div className={cn(
                  "flex items-center space-x-2",
                  currentTheme.text.tertiary
                )}>
                  <Calendar className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Created</div>
                    <div className={currentTheme.text.primary}>
                      {new Date(currentContact.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
                
                <div className={cn(
                  "flex items-center space-x-2",
                  currentTheme.text.tertiary
                )}>
                  <Calendar className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Last Updated</div>
                    <div className={currentTheme.text.primary}>
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