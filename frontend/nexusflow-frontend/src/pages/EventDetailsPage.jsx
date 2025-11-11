import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Trash2, Calendar, Clock, User, MapPin } from 'lucide-react'
import { calendarAPI } from '../services/api'

const EventDetailsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (id) {
      fetchEventDetails()
    }
  }, [id])

  const fetchEventDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Use actual API call
      const response = await calendarAPI.getEvent(id)
      
      if (response.data) {
        setEvent(response.data)
      } else {
        setError('Event not found')
      }
    } catch (error) {
      console.error('Error fetching event details:', error)
      setError(error.response?.data?.message || 'Failed to load event details')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    navigate(`/calendar?edit=${id}`)
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await calendarAPI.deleteEvent(id)
        navigate('/calendar')
      } catch (error) {
        console.error('Error deleting event:', error)
        alert('Failed to delete event. Please try again.')
      }
    }
  }

  const handleRetry = () => {
    fetchEventDetails()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading event details...</p>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {error || 'Event Not Found'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error ? 'Failed to load event details' : 'The event you\'re looking for doesn\'t exist.'}
          </p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button 
              onClick={() => navigate('/calendar')}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Back to Calendar
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Format event data safely
  const formatEventType = (type) => {
    if (!type) return 'Event'
    return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')
  }

  const formatUserName = (user) => {
    if (!user) return 'Unknown'
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown'
  }

  const formatCompanyName = (customer) => {
    if (!customer) return ''
    return customer.company_name || customer.name || ''
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Unknown'
    try {
      return new Date(dateString).toLocaleString()
    } catch {
      return 'Invalid date'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => navigate('/calendar')}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Calendar</span>
          </button>
          
          <div className="flex space-x-3">
            <button 
              onClick={handleEdit}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </button>
            <button 
              onClick={handleDelete}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Event Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Color Header */}
          <div 
            className="h-2" 
            style={{ backgroundColor: event.color || '#3788d8' }}
          ></div>
          
          <div className="p-6">
            {/* Title and Type */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {event.title || 'Untitled Event'}
                </h1>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  {formatEventType(event.event_type)}
                </span>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                event.status === 'completed' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                event.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
              }`}>
                {event.status ? event.status.charAt(0).toUpperCase() + event.status.slice(1) : 'Scheduled'}
              </span>
            </div>

            {/* Description */}
            {event.description && (
              <div className="mb-6">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Time Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Time Details</span>
                </h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Start:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {formatDateTime(event.start_time)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">End:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {formatDateTime(event.end_time)}
                    </span>
                  </div>
                  {event.all_day && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">All Day:</span>
                      <span className="text-gray-900 dark:text-white font-medium">Yes</span>
                    </div>
                  )}
                  {event.reminder_minutes > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Reminder:</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {event.reminder_minutes} minutes before
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* People & Relations */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>People & Relations</span>
                </h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Assigned To:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {formatUserName(event.assigned_to)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Created By:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {formatUserName(event.created_by)}
                    </span>
                  </div>
                  {event.customer && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Customer:</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {formatCompanyName(event.customer)}
                      </span>
                    </div>
                  )}
                  {event.opportunity && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Opportunity:</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {event.opportunity.title || event.opportunity.name || 'Unknown Opportunity'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {event.created_at && (
                  <>
                    Created: {formatDateTime(event.created_at)}
                    {event.updated_at && ' • '}
                  </>
                )}
                {event.updated_at && (
                  <>Last Updated: {formatDateTime(event.updated_at)}</>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetailsPage