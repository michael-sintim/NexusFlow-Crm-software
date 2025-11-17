import React from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { useUIStore } from '../store/uiStore'

const localizer = momentLocalizer(moment)

const CalendarView = ({ currentView, currentDate, onEventClick, onSlotClick, events = [] }) => {
  const { theme } = useUIStore()

  // Theme-based styles
  const themeStyles = {
    light: {
      background: {
        primary: 'bg-white',
        page: 'bg-gray-50'
      },
      text: {
        primary: 'text-gray-900',
        secondary: 'text-gray-600'
      }
    },
    dark: {
      background: {
        primary: 'bg-gray-900',
        page: 'bg-gray-900'
      },
      text: {
        primary: 'text-white',
        secondary: 'text-gray-300'
      }
    }
  }

  const currentTheme = themeStyles[theme]

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
          backgroundColor: theme === 'light' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.2)'
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
          backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)'
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
    <div className={`h-full ${currentTheme.background.primary}`}>
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
          color: ${theme === 'light' ? '#111827' : '#f9fafb'};
          border-bottom: 1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'};
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
          background-color: ${theme === 'light' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.2)'};
        }

        .rbc-custom-calendar .rbc-off-range-bg {
          background-color: ${theme === 'light' ? '#f9fafb' : '#1f2937'};
        }

        .rbc-custom-calendar .rbc-off-range {
          color: ${theme === 'light' ? '#9ca3af' : '#6b7280'};
        }

        .rbc-custom-calendar .rbc-button-link {
          color: ${theme === 'light' ? '#111827' : '#f9fafb'};
        }

        .rbc-custom-calendar .rbc-button-link:hover {
          color: ${theme === 'light' ? '#2563eb' : '#60a5fa'};
        }

        .rbc-custom-calendar .rbc-toolbar {
          padding: 1rem;
        }

        .rbc-custom-calendar .rbc-toolbar-label {
          font-size: 1.125rem;
          font-weight: 600;
          color: ${theme === 'light' ? '#111827' : '#f9fafb'};
        }

        .rbc-custom-calendar .rbc-btn {
          color: ${theme === 'light' ? '#4b5563' : '#9ca3af'};
        }

        .rbc-custom-calendar .rbc-btn:hover {
          color: ${theme === 'light' ? '#111827' : '#f9fafb'};
          background-color: ${theme === 'light' ? '#f3f4f6' : '#374151'};
        }

        .rbc-custom-calendar .rbc-active {
          background-color: ${theme === 'light' ? '#dbeafe' : '#1e3a8a'};
          color: ${theme === 'light' ? '#1e40af' : '#dbeafe'};
        }

        .rbc-custom-calendar .rbc-show-more {
          color: ${theme === 'light' ? '#2563eb' : '#60a5fa'};
        }

        .rbc-custom-calendar .rbc-show-more:hover {
          color: ${theme === 'light' ? '#1d4ed8' : '#93c5fd'};
        }
      `}</style>
    </div>
  )
}

export default CalendarView