import React from 'react'
import MiniCalendar from './MiniCalendar'
import UpcomingEvents from './UpcomingEvents'
import EventFilters from './EventsFilter'
import { useUIStore } from '../store/uiStore'

const CalendarSidebar = ({ currentDate, onDateSelect, onEventCreate }) => {
  const { theme } = useUIStore()

  // Theme-based styles
  const themeStyles = {
    light: {
      background: {
        primary: 'bg-white',
        secondary: 'bg-gray-50'
      },
      border: {
        primary: 'border-gray-200',
        secondary: 'border-gray-300'
      },
      text: {
        primary: 'text-gray-900',
        secondary: 'text-gray-600'
      }
    },
    dark: {
      background: {
        primary: 'bg-gray-800',
        secondary: 'bg-gray-750'
      },
      border: {
        primary: 'border-gray-700',
        secondary: 'border-gray-600'
      },
      text: {
        primary: 'text-white',
        secondary: 'text-gray-300'
      }
    }
  }

  const currentTheme = themeStyles[theme]

  return (
    <div className={`w-80 border-l ${currentTheme.border.primary} ${currentTheme.background.primary} flex flex-col`}>
      {/* Mini Calendar */}
      <div className={`p-4 border-b ${currentTheme.border.primary}`}>
        <MiniCalendar 
          currentDate={currentDate}
          onDateSelect={onDateSelect}
        />
      </div>

      {/* Quick Actions */}
      <div className={`p-4 border-b ${currentTheme.border.primary}`}>
        <button
          onClick={onEventCreate}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <span className="text-sm font-medium">Create Quick Event</span>
        </button>
      </div>

      {/* Upcoming Events */}
      <div className="flex-1 overflow-hidden">
        <UpcomingEvents />
      </div>

      {/* Event Filters */}
      <div className={`p-4 border-t ${currentTheme.border.primary}`}>
        <EventFilters />
      </div>
    </div>
  )
}

export default CalendarSidebar