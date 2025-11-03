import React from 'react'
import { Plus, Search, Filter } from 'lucide-react'
import { useDataStore } from '../store/dataStore'
import ContactList from '../components/contacts/ContactList'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useNavigate } from 'react-router-dom'

const ContactsPage = () => {
  const { contacts, fetchContacts, isLoading, error } = useDataStore()
  const [searchTerm, setSearchTerm] = React.useState('')
  const navigate = useNavigate()

  React.useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  // Safely handle contacts data - ensure it's always an array
  const contactsArray = React.useMemo(() => {
    if (!contacts) return []
    if (Array.isArray(contacts)) return contacts
    if (contacts.results && Array.isArray(contacts.results)) return contacts.results
    if (contacts.data && Array.isArray(contacts.data)) return contacts.data
    return []
  }, [contacts])

  const filteredContacts = contactsArray.filter(contact =>
    contact?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact?.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Customers
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Loading Customers...
            </p>
          </div>
          <Button disabled className="mt-4 sm:mt-0 opacity-50">
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>
        
        {/* Loading skeleton */}
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Customers
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Failed to load Customers
            </p>
          </div>
          <Button 
            onClick={fetchContacts}
            className="mt-4 sm:mt-0"
          >
            Retry
          </Button>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-400 mb-2">
            Error Loading Customers
          </h3>
          <p className="text-red-600 dark:text-red-300">
            {typeof error === 'string' ? error : 'Please try again'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Customers
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {contactsArray.length === 0 
              ? "No customers yet. Add your first customers to get started!" 
              : `Managing ${contactsArray.length} contact${contactsArray.length === 1 ? '' : 's'}`
            }
          </p>
        </div>
        
        <Button
          onClick={() => navigate('/contacts/new')}
          className="mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Customers
        </Button>
      </div>

      {/* Search and Filters - Only show when there are contacts */}
      {contactsArray.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search Customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="h-4 w-4 text-gray-400" />}
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      )}

      {/* Contacts List */}
      <ContactList contacts={filteredContacts} />
    </div>
  )
}

export default ContactsPage