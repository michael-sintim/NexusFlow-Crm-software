import React from 'react'
import { cn } from '../../lib/utils'
import { useUIStore } from '../store/uiStore'

const ViewSwitcher = ({ currentView, onViewChange }) => {
  const { theme } = useUIStore()

  const views = [
    { id: 'month', label: 'Month' },
    { id: 'week', label: 'Week' },
    { id: 'day', label: 'Day' },
    { id: 'agenda', label: 'Agenda' }
  ]

  // Theme-based styles
  const themeStyles = {
    light: {
      background: {
        container: 'bg-gray-100',
        active: 'bg-white',
        hover: 'hover:text-gray-900'
      },
      text: {
        active: 'text-gray-900',
        inactive: 'text-gray-600',
        hover: 'hover:text-gray-900'
      },
      border: {
        shadow: 'shadow-sm'
      }
    },
    dark: {
      background: {
        container: 'bg-gray-700',
        active: 'bg-gray-600',
        hover: 'hover:text-white'
      },
      text: {
        active: 'text-white',
        inactive: 'text-gray-400',
        hover: 'hover:text-white'
      },
      border: {
        shadow: 'shadow-sm'
      }
    }
  }

  const currentTheme = themeStyles[theme]

  return (
    <div className={cn(
      "flex rounded-lg p-1",
      currentTheme.background.container
    )}>
      {views.map((view) => (
        <button
          key={view.id}
          onClick={() => onViewChange(view.id)}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-md transition-colors",
            currentView === view.id
              ? cn(
                  currentTheme.background.active,
                  currentTheme.text.active,
                  currentTheme.border.shadow
                )
              : cn(
                  currentTheme.text.inactive,
                  currentTheme.text.hover
                )
          )}
        >
          {view.label}
        </button>
      ))}
    </div>
  )
}

export default ViewSwitcher