import React from 'react'
import { cn } from '../../lib/utils'

const ViewSwitcher = ({ currentView, onViewChange }) => {
  const views = [
    { id: 'month', label: 'Month' },
    { id: 'week', label: 'Week' },
    { id: 'day', label: 'Day' },
    { id: 'agenda', label: 'Agenda' }
  ]

  return (
    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
      {views.map((view) => (
        <button
          key={view.id}
          onClick={() => onViewChange(view.id)}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-md transition-colors",
            currentView === view.id
              ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          )}
        >
          {view.label}
        </button>
      ))}
    </div>
  )
}

export default ViewSwitcher