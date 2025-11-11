import React from 'react'
import { Calendar, Clock, User, MapPin, Tag, Edit, Trash2 } from 'lucide-react'

const EventDetails = ({ event, onEdit, onDelete, onClose }) => {
  if (!event) return null

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const getEventTypeColor = (eventType) => {
    const colors = {
      meeting: '#3788d8',
      call: '#10b981',
      deadline: '#f59e0b',
      task: '#ef4444',
      reminder: '#8b5cf6',
      other: '#6b7280'
    }
    return colors[eventType] || '#6b7280'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full mx-4">
      {/* Color Header */}
      <div 
        className="h-2 rounded-t-lg"
        style={{ backgroundColor: event.color || getEventTypeColor(event.event_type) }}
      ></div>

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {event.title}
            </h2>
            <div className="flex items-center space-x-2">
              <span 
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: `${event.color || getEventTypeColor(event.event_type)}20`,
                  color: event.color || getEventTypeColor(event.event_type)
                }}
              >
                {event.event_type}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                event.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                event.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              }`}>
                {event.status}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={onEdit}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <div className="mb-6">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {event.description}
            </p>
          </div>
        )}

        {/* Details */}
        <div className="space-y-4">
          {/* Time */}
          <div className="flex items-start space-x-3">
            <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-900 dark:text-white font-medium">
                {event.all_day ? 'All Day' : `${formatTime(event.start_time)} - ${formatTime(event.end_time)}`}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDateTime(event.start_time)}
              </p>
            </div>
          </div>

          {/* Assigned To */}
          {event.assigned_to && (
            <div className="flex items-start space-x-3">
              <User className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-900 dark:text-white font-medium">
                  {event.assigned_to.first_name} {event.assigned_to.last_name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Assigned to
                </p>
              </div>
            </div>
          )}

          {/* Customer */}
          {event.customer && (
            <div className="flex items-start space-x-3">
              <User className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-900 dark:text-white font-medium">
                  {event.customer.company_name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Customer
                </p>
              </div>
            </div>
          )}

          {/* Opportunity */}
          {event.opportunity && (
            <div className="flex items-start space-x-3">
              <Tag className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-900 dark:text-white font-medium">
                  {event.opportunity.title}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Opportunity
                </p>
              </div>
            </div>
          )}

          {/* Reminder */}
          {event.reminder_minutes > 0 && (
            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-900 dark:text-white font-medium">
                  {event.reminder_minutes} minutes before
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Reminder
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Created: {new Date(event.created_at).toLocaleDateString()}</span>
            <span>Updated: {new Date(event.updated_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetails