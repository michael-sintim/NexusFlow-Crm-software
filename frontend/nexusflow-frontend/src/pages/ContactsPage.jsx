import React from 'react'
import { Plus, Search, Filter, X, Calendar, ChevronDown } from 'lucide-react'
import { useDataStore } from '../store/dataStore'
import { useUIStore } from '../store/uiStore'
import ContactList from '../components/contacts/ContactList'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useNavigate } from 'react-router-dom'

const ContactsPage = () => {
  const { theme } = useUIStore()
  const { contacts, fetchContacts, isLoading, error } = useDataStore()
  const [searchTerm, setSearchTerm] = React.useState('')
  const [showFilters, setShowFilters] = React.useState(false)
  const [filters, setFilters] = React.useState({
    status: '',
    company: '',
    dateRange: { from: '', to: '' }
  })
  const [filterError, setFilterError] = React.useState('')
  const navigate = useNavigate()

  // Theme-based styles
  const themeStyles = {
    light: {
      background: {
        primary: 'bg-white',
        secondary: 'bg-gray-50',
        page: 'bg-gray-50',
        error: 'bg-red-50',
        warning: 'bg-yellow-50'
      },
      border: {
        primary: 'border-gray-200',
        secondary: 'border-gray-300',
        error: 'border-red-200',
        warning: 'border-yellow-200'
      },
      text: {
        primary: 'text-gray-900',
        secondary: 'text-gray-600',
        tertiary: 'text-gray-500',
        error: 'text-red-800',
        warning: 'text-yellow-800'
      }
    },
    dark: {
      background: {
        primary: 'bg-gray-800',
        secondary: 'bg-gray-750',
        page: 'bg-gray-900',
        error: 'bg-red-900/20',
        warning: 'bg-yellow-900/20'
      },
      border: {
        primary: 'border-gray-700',
        secondary: 'border-gray-600',
        error: 'border-red-800',
        warning: 'border-yellow-800'
      },
      text: {
        primary: 'text-white',
        secondary: 'text-gray-300',
        tertiary: 'text-gray-400',
        error: 'text-red-400',
        warning: 'text-yellow-400'
      }
    }
  }

  const currentTheme = themeStyles[theme]

  React.useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  // ADD THIS NEW HANDLER - This will refresh contacts after updates
  const handleContactUpdate = React.useCallback(async () => {
    console.log('ContactsPage: Refreshing contacts after update')
    await fetchContacts()
  }, [fetchContacts])

  // Safely handle contacts data - ensure it's always an array
  const contactsArray = React.useMemo(() => {
    if (!contacts) return []
    if (Array.isArray(contacts)) return contacts
    if (contacts.results && Array.isArray(contacts.results)) return contacts.results
    if (contacts.data && Array.isArray(contacts.data)) return contacts.data
    return []
  }, [contacts])

  // Get unique companies for filter dropdown
  const uniqueCompanies = React.useMemo(() => {
    try {
      const companies = contactsArray
        .map(contact => contact?.company_name)
        .filter(company => company && company.trim() !== '')
        .filter((company, index, arr) => arr.indexOf(company) === index)
      return companies.sort()
    } catch (err) {
      console.error('Error extracting companies:', err)
      return []
    }
  }, [contactsArray])

  // Apply filters to contacts with error handling
  const filteredContacts = React.useMemo(() => {
    try {
      return contactsArray.filter(contact => {
        // Search term filter
        const matchesSearch = searchTerm.trim() === '' || 
          contact?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact?.company_name?.toLowerCase().includes(searchTerm.toLowerCase())

        // Status filter - contacted vs not contacted (using contacted boolean field)
        const matchesStatus = !filters.status || 
          (filters.status === 'contacted' && contact?.contacted === true) ||
          (filters.status === 'not_contacted' && contact?.contacted === false)

        // Company filter
        const matchesCompany = !filters.company || 
          contact?.company_name === filters.company

        // Date range filter with validation
        let matchesDateRange = true
        if (filters.dateRange.from || filters.dateRange.to) {
          try {
            const contactDate = contact?.created_at ? new Date(contact.created_at) : null
            if (contactDate) {
              const fromDate = filters.dateRange.from ? new Date(filters.dateRange.from) : null
              const toDate = filters.dateRange.to ? new Date(filters.dateRange.to) : null
              
              if (fromDate && toDate && fromDate > toDate) {
                setFilterError('Invalid date range: "From" date cannot be after "To" date')
                matchesDateRange = false
              } else {
                matchesDateRange = (!fromDate || contactDate >= fromDate) && 
                                 (!toDate || contactDate <= toDate)
              }
            } else {
              matchesDateRange = false
            }
          } catch (dateError) {
            console.error('Date parsing error:', dateError)
            setFilterError('Invalid date format')
            matchesDateRange = false
          }
        }

        return matchesSearch && matchesStatus && matchesCompany && matchesDateRange
      })
    } catch (filterError) {
      console.error('Error applying filters:', filterError)
      setFilterError('Error applying filters. Please try again.')
      return contactsArray
    }
  }, [contactsArray, searchTerm, filters])

  // Check if we have active filters
  const hasActiveFilters = filters.status !== '' || 
    filters.company !== '' || 
    filters.dateRange.from !== '' || 
    filters.dateRange.to !== ''

  // Check if we have search results
  const hasSearchResults = searchTerm.trim() !== '' && filteredContacts.length === 0
  
  // Check if we have filter results (no search term but active filters with no results)
  const hasFilterResults = searchTerm.trim() === '' && hasActiveFilters && filteredContacts.length === 0
  
  const hasContacts = contactsArray.length > 0

  // Filter handlers with error handling
  const handleStatusFilter = (status) => {
    try {
      setFilters(prev => ({ ...prev, status }))
      setFilterError('')
    } catch (err) {
      console.error('Error setting status filter:', err)
      setFilterError('Error applying status filter')
    }
  }

  const handleCompanyFilter = (company) => {
    try {
      setFilters(prev => ({ ...prev, company }))
      setFilterError('')
    } catch (err) {
      console.error('Error setting company filter:', err)
      setFilterError('Error applying company filter')
    }
  }

  const handleDateFilter = (field, value) => {
    try {
      setFilters(prev => ({
        ...prev,
        dateRange: { ...prev.dateRange, [field]: value }
      }))
      setFilterError('')
    } catch (err) {
      console.error('Error setting date filter:', err)
      setFilterError('Error applying date filter')
    }
  }

  const clearAllFilters = () => {
    try {
      setFilters({
        status: '',
        company: '',
        dateRange: { from: '', to: '' }
      })
      setFilterError('')
      setSearchTerm('')
    } catch (err) {
      console.error('Error clearing filters:', err)
      setFilterError('Error clearing filters')
    }
  }

  const clearSingleFilter = (filterType) => {
    try {
      setFilters(prev => {
        if (filterType === 'status') return { ...prev, status: '' }
        if (filterType === 'company') return { ...prev, company: '' }
        if (filterType === 'dateRange') return { ...prev, dateRange: { from: '', to: '' } }
        return prev
      })
      setFilterError('')
    } catch (err) {
      console.error('Error clearing single filter:', err)
      setFilterError('Error clearing filter')
    }
  }

  const validateDateRange = () => {
    if (filters.dateRange.from && filters.dateRange.to) {
      const fromDate = new Date(filters.dateRange.from)
      const toDate = new Date(filters.dateRange.to)
      
      if (fromDate > toDate) {
        setFilterError('Invalid date range: "From" date cannot be after "To" date')
        return false
      }
    }
    setFilterError('')
    return true
  }

  // Generate filter description for error message
  const getFilterDescription = () => {
    const filterParts = []
    
    if (filters.status) {
      filterParts.push(`Status: ${filters.status === 'contacted' ? 'Contacted' : 'Not Contacted'}`)
    }
    
    if (filters.company) {
      filterParts.push(`Company: ${filters.company}`)
    }
    
    if (filters.dateRange.from || filters.dateRange.to) {
      const from = filters.dateRange.from || 'Any'
      const to = filters.dateRange.to || 'Any'
      filterParts.push(`Date: ${from} to ${to}`)
    }
    
    return filterParts.join(', ')
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen ${currentTheme.background.page} p-6`}>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${currentTheme.text.primary}`}>
                Customers
              </h1>
              <p className={`${currentTheme.text.secondary} mt-2`}>
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
              <div key={n} className={`h-20 ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'} rounded-lg`}></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className={`min-h-screen ${currentTheme.background.page} p-6`}>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${currentTheme.text.primary}`}>
                Customers
              </h1>
              <p className={`${currentTheme.text.secondary} mt-2`}>
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
          
          <div className={`${currentTheme.background.error} border ${currentTheme.border.error} rounded-lg p-6 text-center`}>
            <h3 className={`text-lg font-medium ${currentTheme.text.error} mb-2`}>
              Error Loading Customers
            </h3>
            <p className={currentTheme.text.error}>
              {typeof error === 'string' ? error : 'Please try again'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${currentTheme.background.page} p-6`}>
      <div className="space-y-6">
        {/* Header - Only show Add Button when there are contacts or during search */}
        {(hasContacts || hasSearchResults || hasFilterResults) && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${currentTheme.text.primary}`}>
                Customers
              </h1>
              <p className={`${currentTheme.text.secondary} mt-2`}>
                {hasSearchResults 
                  ? `No results for "${searchTerm}"` 
                  : hasFilterResults
                  ? `No results for selected filters`
                  : `Showing ${filteredContacts.length} of ${contactsArray.length} contact${contactsArray.length === 1 ? '' : 's'}`
                }
                {hasActiveFilters && !hasFilterResults && ' (filtered)'}
              </p>
            </div>
            
            <Button
              onClick={() => navigate('/contacts/new')}
              className="mt-4 sm:mt-0 bg-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Customers
            </Button>
          </div>
        )}

        {/* Search and Filters - Only show when there are contacts */}
        {hasContacts && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search Customers by name, email, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search className="h-4 w-4 text-gray-400" />}
                />
              </div>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowFilters(!showFilters)
                  setFilterError('')
                }}
                className={`relative ${hasActiveFilters ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-2 bg-blue-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {Object.values(filters).filter(val => 
                      typeof val === 'object' ? Object.values(val).some(v => v !== '') : val !== ''
                    ).length}
                  </span>
                )}
                <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearAllFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>

            {/* Filter Error Message */}
            {filterError && (
              <div className={`${currentTheme.background.error} border ${currentTheme.border.error} rounded-lg p-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className={`${currentTheme.text.error} text-sm`}>{filterError}</span>
                  </div>
                  <button 
                    onClick={() => setFilterError('')}
                    className={currentTheme.text.error}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Active Filters Display */}
            {hasActiveFilters && !filterError && !hasFilterResults && (
              <div className="flex flex-wrap gap-2">
                {filters.status && (
                  <div className={`flex items-center gap-1 ${theme === 'light' ? 'bg-blue-100' : 'bg-blue-900/30'} px-3 py-1 rounded-full text-sm`}>
                    Status: {filters.status === 'contacted' ? 'Contacted' : 'Not Contacted'}
                    <button 
                      onClick={() => clearSingleFilter('status')} 
                      className="ml-1 hover:text-red-500 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {filters.company && (
                  <div className={`flex items-center gap-1 ${theme === 'light' ? 'bg-blue-100' : 'bg-blue-900/30'} px-3 py-1 rounded-full text-sm`}>
                    Company: {filters.company}
                    <button 
                      onClick={() => clearSingleFilter('company')} 
                      className="ml-1 hover:text-red-500 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {(filters.dateRange.from || filters.dateRange.to) && (
                  <div className={`flex items-center gap-1 ${theme === 'light' ? 'bg-blue-100' : 'bg-blue-900/30'} px-3 py-1 rounded-full text-sm`}>
                    Date: {filters.dateRange.from || 'Any'} to {filters.dateRange.to || 'Any'}
                    <button 
                      onClick={() => clearSingleFilter('dateRange')} 
                      className="ml-1 hover:text-red-500 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Filters Panel */}
            {showFilters && (
              <div className={`${currentTheme.background.primary} border ${currentTheme.border.primary} rounded-lg p-6 space-y-6 shadow-lg`}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Status Filter */}
                  <div>
                    <label className={`block text-sm font-medium ${currentTheme.text.secondary} mb-2`}>
                      Contact Status
                    </label>
                    <select 
                      value={filters.status}
                      onChange={(e) => handleStatusFilter(e.target.value)}
                      className={`w-full border ${currentTheme.border.secondary} rounded-md px-3 py-2 ${currentTheme.background.primary} ${currentTheme.text.primary} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    >
                      <option value="">All Status</option>
                      <option value="contacted">Contacted</option>
                      <option value="not_contacted">Not Contacted</option>
                    </select>
                  </div>

                  {/* Company Filter */}
                  <div>
                    <label className={`block text-sm font-medium ${currentTheme.text.secondary} mb-2`}>
                      Company
                    </label>
                    <select 
                      value={filters.company}
                      onChange={(e) => handleCompanyFilter(e.target.value)}
                      className={`w-full border ${currentTheme.border.secondary} rounded-md px-3 py-2 ${currentTheme.background.primary} ${currentTheme.text.primary} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    >
                      <option value="">All Companies</option>
                      {uniqueCompanies.map(company => (
                        <option key={company} value={company}>{company}</option>
                      ))}
                    </select>
                  </div>

                  {/* Date Range Filter */}
                  <div>
                    <label className={`block text-sm font-medium ${currentTheme.text.secondary} mb-2`}>
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Created Date
                    </label>
                    <div className="space-y-2">
                      <Input
                        type="date"
                        value={filters.dateRange.from}
                        onChange={(e) => handleDateFilter('from', e.target.value)}
                        placeholder="From date"
                        onBlur={validateDateRange}
                      />
                      <Input
                        type="date"
                        value={filters.dateRange.to}
                        onChange={(e) => handleDateFilter('to', e.target.value)}
                        placeholder="To date"
                        onBlur={validateDateRange}
                      />
                    </div>
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className={`text-sm ${currentTheme.text.tertiary}`}>
                    {filteredContacts.length} contacts match your filters
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={clearAllFilters}
                      disabled={!hasActiveFilters}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reset Filters
                    </Button>
                    <Button 
                      onClick={() => setShowFilters(false)}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Contact not found message for search */}
        {hasSearchResults && (
          <div className={`${currentTheme.background.warning} border ${currentTheme.border.warning} rounded-lg p-6 text-center`}>
            <h3 className={`text-lg font-medium ${currentTheme.text.warning} mb-2`}>
              Contact not found
            </h3>
            <p className={currentTheme.text.warning}>
              No customers found matching "{searchTerm}". Please try a different search term.
            </p>
          </div>
        )}

        {/* Contact not found message for filters */}
        {hasFilterResults && (
          <div className={`${currentTheme.background.warning} border ${currentTheme.border.warning} rounded-lg p-6 text-center`}>
            <h3 className={`text-lg font-medium ${currentTheme.text.warning} mb-2`}>
              Contact not found
            </h3>
            <p className={currentTheme.text.warning}>
              No customers found matching your filter criteria: {getFilterDescription()}. Please try different filters.
            </p>
          </div>
        )}

        {/* Contacts List - Only show when we have contacts and no active search/filter with no results */}
        {!hasSearchResults && !hasFilterResults && (
          <ContactList 
            contacts={filteredContacts} 
            onContactUpdate={handleContactUpdate}
          />
        )}
      </div>
    </div>
  )
}

export default ContactsPage