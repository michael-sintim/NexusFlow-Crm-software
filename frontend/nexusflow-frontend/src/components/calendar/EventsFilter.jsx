import React from 'react'
import { Filter } from 'lucide-react'
import { useUIStore } from '../store/uiStore'

const EventFilters = () => {
  const { theme } = useUIStore()

  // Theme-based styles
  const themeStyles = {
    light: {
      background: {
        secondary: 'bg-gray-50'
      },
      text: {
        primary: 'text-gray-900',
        secondary: 'text-gray-600'
      }
    },
    dark: {
      background: {
        secondary: 'bg-gray-700'
      },
      text: {
        primary: 'text-white',
        secondary: 'text-gray-400'
      }
    }
  }

  const currentTheme = themeStyles[theme]

  const quickFilters = [
    { label: 'All Events', value: 'all', count: 12 },
    { label: 'Meetings', value: 'meeting', count: 5 },
    { label: 'Calls', value: 'call', count: 3 },
    { label: 'Deadlines', value: 'deadline', count: 2 },
    { label: 'My Events', value: 'mine', count: 8 }
  ]

  return (
    <div>
      <h3 className={`text-sm font-semibold ${currentTheme.text.primary} mb-3 flex items-center space-x-2`}>
        <Filter className="h-4 w-4" />
        <span>Quick Filters</span>
      </h3>
      
      <div className="space-y-2">
        {quickFilters.map((filter) => (
          <button
            key={filter.value}
            className={`w-full flex items-center justify-between p-2 text-sm ${currentTheme.text.secondary} hover:${currentTheme.text.primary} hover:${currentTheme.background.secondary} rounded-lg transition-colors`}
          >
            <span>{filter.label}</span>
            <span className={`px-2 py-1 text-xs ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-600'} rounded-full`}>
              {filter.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default EventFilters