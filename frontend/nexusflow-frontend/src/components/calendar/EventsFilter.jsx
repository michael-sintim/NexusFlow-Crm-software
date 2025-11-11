import React from 'react'
import { Filter } from 'lucide-react'

const EventFilters = () => {
  const quickFilters = [
    { label: 'All Events', value: 'all', count: 12 },
    { label: 'Meetings', value: 'meeting', count: 5 },
    { label: 'Calls', value: 'call', count: 3 },
    { label: 'Deadlines', value: 'deadline', count: 2 },
    { label: 'My Events', value: 'mine', count: 8 }
  ]

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
        <Filter className="h-4 w-4" />
        <span>Quick Filters</span>
      </h3>
      
      <div className="space-y-2">
        {quickFilters.map((filter) => (
          <button
            key={filter.value}
            className="w-full flex items-center justify-between p-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <span>{filter.label}</span>
            <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-600 rounded-full">
              {filter.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default EventFilters