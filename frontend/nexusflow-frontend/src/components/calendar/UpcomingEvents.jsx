import React from 'react'
import { Clock, User, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const UpcomingEvents = () => {
  const navigate = useNavigate()

  // Mock data - replace with real API data
  const upcomingEvents = [
    {
      id: '1',
      title: 'Team Standup',
      start_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
      event_type: 'meeting',
      assigned_to: { first_name: 'John', last_name: 'Doe' },
      color: '#3788d8'
    },
    {
      id: '2',
      title: 'Client Presentation',
      start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
      event_type: 'meeting',
      assigned_to: { first_name: 'Jane', last_name: 'Smith' },
      color: '#10b981'
    },
    {
      id: '3',
      title: 'Project Deadline',
      start_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      event_type: 'deadline',
      assigned_to: { first_name: 'Mike', last_name: 'Johnson' },
      color: '#f59e0b'
    }
  ]

  const handleEventClick = (eventId) => {
    navigate(`/calendar/event/${eventId}`)
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow'
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Upcoming Events
      </h3>
      
      <div className="space-y-3">
        {upcomingEvents.map((event) => (
          <button
            key={event.id}
            onClick={() => handleEventClick(event.id)}
            className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
          >
            <div className="flex items-start space-x-3">
              <div 
                className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                style={{ backgroundColor: event.color }}
              ></div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400">
                  {event.title}
                </h4>
                
                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(event.start_time)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <User className="h-3 w-3" />
                    <span>
                      {event.assigned_to.first_name} {event.assigned_to.last_name}
                    </span>
                  </div>
                </div>
                
                <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                  {formatDate(event.start_time)}
                </div>
              </div>
            </div>
          </button>
        ))}
        
        {upcomingEvents.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No upcoming events</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default UpcomingEvents