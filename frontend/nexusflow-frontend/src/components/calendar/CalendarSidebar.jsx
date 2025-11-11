import React from 'react'
import MiniCalendar from './MiniCalendar'
import UpcomingEvents from './UpcomingEvents'
import EventFilters from './EventsFilter'

const CalendarSidebar = ({ currentDate, onDateSelect, onEventCreate }) => {
  return (
    <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
      {/* Mini Calendar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <MiniCalendar 
          currentDate={currentDate}
          onDateSelect={onDateSelect}
        />
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={onEventCreate}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
        >
          <span className="text-sm font-medium">Create Quick Event</span>
        </button>
      </div>

      {/* Upcoming Events */}
      <div className="flex-1 overflow-hidden">
        <UpcomingEvents />
      </div>

      {/* Event Filters */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <EventFilters />
      </div>
    </div>
  )
}

export default CalendarSidebar