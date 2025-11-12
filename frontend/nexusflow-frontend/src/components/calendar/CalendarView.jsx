import React from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const localizer = momentLocalizer(moment)

const CalendarView = ({ currentView, currentDate, onEventClick, onSlotClick, events = [] }) => {
  // Safe events handling - ensure events is always an array
  const safeEvents = React.useMemo(() => {
    if (!events || !Array.isArray(events)) {
      console.warn('❌ Invalid events data, using empty array')
      return []
    }
    return events
  }, [events])

  // Safe transformation of events to react-big-calendar format
  const calendarEvents = React.useMemo(() => {
    return safeEvents
      .map((event) => {
        try {
          // Validate and parse dates
          const startDate = event.start_time ? new Date(event.start_time) : new Date()
          const endDate = event.end_time ? new Date(event.end_time) : new Date(startDate.getTime() + 60 * 60 * 1000)
          
          // Ensure end date is after start date
          const validEndDate = endDate > startDate ? endDate : new Date(startDate.getTime() + 60 * 60 * 1000)

          return {
            id: event.id || `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: event.title || 'Untitled Event',
            start: startDate,
            end: validEndDate,
            allDay: event.all_day || false,
            resource: event
          }
        } catch (error) {
          console.warn('❌ Error processing event:', event, error)
          return null
        }
      })
      .filter(event => event !== null) // Remove invalid events
  }, [safeEvents])

  const handleSelectEvent = (event) => {
    if (onEventClick && event.resource) {
      onEventClick(event.resource)
    }
  }

  const handleSelectSlot = (slotInfo) => {
    if (onSlotClick) {
      onSlotClick({
        start: slotInfo.start,
        end: slotInfo.end,
        slots: slotInfo.slots,
        action: slotInfo.action
      })
    }
  }

  const eventStyleGetter = (event) => {
    const backgroundColor = event.resource?.color || '#3788d8'
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        border: 'none',
        color: 'white',
        fontSize: '12px',
        fontWeight: '500',
        opacity: 0.9,
        cursor: 'pointer'
      }
    }
  }

  const dayPropGetter = (date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const currentDate = new Date(date)
    currentDate.setHours(0, 0, 0, 0)
    
    if (currentDate.getTime() === today.getTime()) {
      return {
        style: {
          backgroundColor: 'rgba(59, 130, 246, 0.1)'
        }
      }
    }
    return {}
  }

  const slotPropGetter = (date) => {
    const hours = date.getHours()
    if (hours < 9 || hours > 17) {
      return {
        style: {
          backgroundColor: 'rgba(0, 0, 0, 0.02)'
        }
      }
    }
    return {}
  }

  // Custom components for better styling
  const components = {
    event: ({ event }) => (
      <div className="rbc-event-content">
        <div className="font-medium truncate">{event.title}</div>
        {!event.allDay && (
          <div className="text-xs opacity-90">
            {moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-full bg-white dark:bg-gray-900">
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        view={currentView}
        date={currentDate}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable
        style={{ height: '100%' }}
        eventPropGetter={eventStyleGetter}
        dayPropGetter={dayPropGetter}
        slotPropGetter={slotPropGetter}
        components={components}
        views={['month', 'week', 'day', 'agenda']}
        step={30}
        showMultiDayTimes
        popup
        scrollToTime={new Date(1970, 1, 1, 8)} // Start at 8 AM
        min={new Date(1970, 1, 1, 8, 0, 0)} // 8 AM
        max={new Date(1970, 1, 1, 20, 0, 0)} // 8 PM
        className="rbc-custom-calendar"
      />

      <style jsx>{`
        .rbc-custom-calendar {
          font-family: inherit;
          font-size: 0.875rem;
        }

        .rbc-custom-calendar .rbc-header {
          padding: 0.5rem 0.25rem;
          font-weight: 600;
          color: #111827;
          border-bottom: 1px solid #e5e7eb;
        }

        .rbc-custom-calendar .rbc-date-cell {
          text-align: center;
          padding: 0.25rem;
        }

        .rbc-custom-calendar .rbc-event {
          padding: 0.25rem;
          cursor: pointer;
          border: none;
        }

        .rbc-custom-calendar .rbc-event:focus {
          outline: none;
        }

        .rbc-custom-calendar .rbc-today {
          background-color: rgba(59, 130, 246, 0.1);
        }

        .rbc-custom-calendar .rbc-off-range-bg {
          background-color: #f9fafb;
        }

        .rbc-custom-calendar .rbc-off-range {
          color: #9ca3af;
        }

        .rbc-custom-calendar .rbc-button-link {
          color: #111827;
        }

        .rbc-custom-calendar .rbc-button-link:hover {
          color: #2563eb;
        }

        .rbc-custom-calendar .rbc-toolbar {
          padding: 1rem;
        }

        .rbc-custom-calendar .rbc-toolbar-label {
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
        }

        .rbc-custom-calendar .rbc-btn {
          color: #4b5563;
        }

        .rbc-custom-calendar .rbc-btn:hover {
          color: #111827;
          background-color: #f3f4f6;
        }

        .rbc-custom-calendar .rbc-active {
          background-color: #dbeafe;
          color: #1e40af;
        }

        .rbc-custom-calendar .rbc-show-more {
          color: #2563eb;
        }

        .rbc-custom-calendar .rbc-show-more:hover {
          color: #1d4ed8;
        }

        /* Dark mode styles */
        .dark .rbc-custom-calendar .rbc-header {
          color: #f9fafb;
          border-bottom-color: #374151;
        }

        .dark .rbc-custom-calendar .rbc-today {
          background-color: rgba(59, 130, 246, 0.2);
        }

        .dark .rbc-custom-calendar .rbc-off-range-bg {
          background-color: #1f2937;
        }

        .dark .rbc-custom-calendar .rbc-off-range {
          color: #6b7280;
        }

        .dark .rbc-custom-calendar .rbc-button-link {
          color: #f9fafb;
        }

        .dark .rbc-custom-calendar .rbc-button-link:hover {
          color: #60a5fa;
        }

        .dark .rbc-custom-calendar .rbc-toolbar-label {
          color: #f9fafb;
        }

        .dark .rbc-custom-calendar .rbc-btn {
          color: #9ca3af;
        }

        .dark .rbc-custom-calendar .rbc-btn:hover {
          color: #f9fafb;
          background-color: #374151;
        }

        .dark .rbc-custom-calendar .rbc-active {
          background-color: #1e3a8a;
          color: #dbeafe;
        }

        .dark .rbc-custom-calendar .rbc-show-more {
          color: #60a5fa;
        }

        .dark .rbc-custom-calendar .rbc-show-more:hover {
          color: #93c5fd;
        }
      `}</style>
    </div>
  )
}

export default CalendarView