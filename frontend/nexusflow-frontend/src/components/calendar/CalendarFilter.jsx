import React, { useState } from 'react'
import { Filter, X } from 'lucide-react'
import { useUIStore } from '../store/uiStore'

const CalendarFilters = () => {
  const { theme } = useUIStore()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    eventType: 'all',
    status: 'all',
    assignedTo: 'all'
  })

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

  const eventTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'meeting', label: 'Meetings' },
    { value: 'call', label: 'Calls' },
    { value: 'deadline', label: 'Deadlines' },
    { value: 'task', label: 'Tasks' },
    { value: 'reminder', label: 'Reminders' }
  ]

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      eventType: 'all',
      status: 'all',
      assignedTo: 'all'
    })
  }

  const hasActiveFilters = filters.eventType !== 'all' || filters.status !== 'all'

  const getButtonClasses = () => {
    const baseClasses = "flex items-center space-x-2 px-3 py-2 border rounded-lg transition-colors"
    
    if (hasActiveFilters) {
      return `${baseClasses} border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300`
    }
    
    return `${baseClasses} ${currentTheme.border.secondary} ${currentTheme.text.secondary} hover:${currentTheme.background.secondary}`
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsFilterOpen(!isFilterOpen)}
        className={getButtonClasses()}
      >
        <Filter className="h-4 w-4" />
        <span className="text-sm font-medium">Filter</span>
        {hasActiveFilters && (
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        )}
      </button>

      {isFilterOpen && (
        <div className={`absolute right-0 top-12 w-80 ${currentTheme.background.primary} border ${currentTheme.border.primary} rounded-lg shadow-lg z-50 p-4`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${currentTheme.text.primary}`}>Filters</h3>
            <button
              onClick={() => setIsFilterOpen(false)}
              className={`${currentTheme.text.tertiary} hover:${currentTheme.text.secondary} transition-colors`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Event Type Filter */}
            <div>
              <label className={`block text-sm font-medium ${currentTheme.text.secondary} mb-2`}>
                Event Type
              </label>
              <select
                value={filters.eventType}
                onChange={(e) => handleFilterChange('eventType', e.target.value)}
                className={`w-full px-3 py-2 border ${currentTheme.border.secondary} rounded-lg ${currentTheme.background.primary} ${currentTheme.text.primary} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
              >
                {eventTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className={`block text-sm font-medium ${currentTheme.text.secondary} mb-2`}>
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className={`w-full px-3 py-2 border ${currentTheme.border.secondary} rounded-lg ${currentTheme.background.primary} ${currentTheme.text.primary} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
              >
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-2">
              <button
                onClick={clearFilters}
                className={`px-3 py-2 text-sm ${currentTheme.text.tertiary} hover:${currentTheme.text.primary} hover:${currentTheme.background.secondary} rounded-lg transition-colors`}
              >
                Clear All
              </button>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CalendarFilters