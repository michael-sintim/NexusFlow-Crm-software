import React from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const localizer = momentLocalizer(moment)

const CalendarView = ({ currentView, currentDate, onEventClick, onSlotClick }) => {
  // Mock events - replace with real data from your API
  const events = [
    {
      id: '1',
      title: 'Team Meeting',
      start: new Date(2024, 0, 15, 10, 0),
      end: new Date(2024, 0, 15, 11, 0),
      resource: {
        event_type: 'meeting',
        status: 'scheduled',
        color: '#3788d8'
      }
    },
    {
      id: '2',
      title: 'Client Call',
      start: new Date(2024, 0, 16, 14, 0),
      end: new Date(2024, 0, 16, 15, 0),
      resource: {
        event_type: 'call',
        status: 'scheduled',
        color: '#10b981'
      }
    }
  ]

  const handleSelectEvent = (event) => {
    onEventClick(event)
  }

  const handleSelectSlot = (slotInfo) => {
    onSlotClick({
      start: slotInfo.start,
      end: slotInfo.end
    })
  }

  const eventStyleGetter = (event) => {
    const backgroundColor = event.resource?.color || '#3788d8'
    const style = {
      backgroundColor,
      borderRadius: '4px',
      border: 'none',
      color: 'white',
      fontSize: '12px',
      fontWeight: '500'
    }
    return { style }
  }

  return (
    <div className="h-full [&_.rbc-calendar]:font-inherit [&_.rbc-calendar]:text-sm">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        view={currentView}
        date={currentDate}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable
        style={{ height: '100%' }}
        eventPropGetter={eventStyleGetter}
        views={['month', 'week', 'day', 'agenda']}
        step={30}
        showMultiDayTimes
        popup
        // Custom class names for styling
        className="[&_.rbc-header]:px-1 [&_.rbc-header]:py-2 [&_.rbc-header]:font-semibold 
                   [&_.rbc-header]:text-gray-900 [&_.rbc-header]:dark:text-gray-100 
                   [&_.rbc-header]:border-b [&_.rbc-header]:border-gray-200 [&_.rbc-header]:dark:border-gray-700
                   
                   [&_.rbc-date-cell]:text-center [&_.rbc-date-cell]:p-1
                   
                   [&_.rbc-event]:p-1 [&_.rbc-event]:cursor-pointer
                   [&_.rbc-event]:focus:outline-none
                   
                   [&_.rbc-today]:bg-blue-50 [&_.rbc-today]:dark:bg-blue-900/20
                   
                   [&_.rbc-off-range-bg]:bg-gray-50 [&_.rbc-off-range-bg]:dark:bg-gray-800
                   
                   [&_.rbc-off-range]:text-gray-400 [&_.rbc-off-range]:dark:text-gray-600
                   
                   [&_.rbc-button-link]:text-gray-900 [&_.rbc-button-link]:dark:text-gray-100
                   [&_.rbc-button-link]:hover:text-blue-600 [&_.rbc-button-link]:dark:hover:text-blue-400
                   
                   [&_.rbc-toolbar]:px-4 [&_.rbc-toolbar]:py-3
                   [&_.rbc-toolbar-label]:text-lg [&_.rbc-toolbar-label]:font-semibold
                   [&_.rbc-toolbar-label]:text-gray-900 [&_.rbc-toolbar-label]:dark:text-gray-100
                   
                   [&_.rbc-btn]:text-gray-600 [&_.rbc-btn]:dark:text-gray-400
                   [&_.rbc-btn]:hover:text-gray-900 [&_.rbc-btn]:dark:hover:text-gray-100
                   [&_.rbc-btn]:hover:bg-gray-100 [&_.rbc-btn]:dark:hover:bg-gray-700
                   
                   [&_.rbc-active]:bg-blue-100 [&_.rbc-active]:dark:bg-blue-800
                   [&_.rbc-active]:text-blue-800 [&_.rbc-active]:dark:text-blue-200
                   
                   [&_.rbc-show-more]:text-blue-600 [&_.rbc-show-more]:dark:text-blue-400
                   [&_.rbc-show-more]:hover:text-blue-800 [&_.rbc-show-more]:dark:hover:text-blue-300
                   
                   [&_.rbc-time-view]:border-gray-200 [&_.rbc-time-view]:dark:border-gray-700
                   
                   [&_.rbc-time-header]:border-gray-200 [&_.rbc-time-header]:dark:border-gray-700
                   
                   [&_.rbc-time-content]:border-gray-200 [&_.rbc-time-content]:dark:border-gray-700
                   
                   [&_.rbc-timeslot-group]:border-gray-200 [&_.rbc-timeslot-group]:dark:border-gray-700
                   
                   [&_.rbc-day-slot_.rbc-time-slot]:border-gray-100 [&_.rbc-day-slot_.rbc-time-slot]:dark:border-gray-800
                   
                   [&_.rbc-agenda-view_table]:border-gray-200 [&_.rbc-agenda-view_table]:dark:border-gray-700
                   
                   [&_.rbc-agenda-date-cell]:text-gray-600 [&_.rbc-agenda-date-cell]:dark:text-gray-400
                   
                   [&_.rbc-agenda-time-cell]:text-gray-600 [&_.rbc-agenda-time-cell]:dark:text-gray-400"
      />
    </div>
  )
}

export default CalendarView