// CalendarPage.jsx - Updated API calls
import React, { useState, useEffect } from 'react'
import CalendarView from '../components/calendar/CalendarView'
import CalendarToolbar from '../components/calendar/CalendarToolbar'
import EventModal from '../components/calendar/Eventsmodal'
import { calendarAPI } from '../services/api'

const CalendarPage = () => {
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [currentView, setCurrentView] = useState('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Fetching events from /api/calendar/events/...')
      
      const response = await calendarAPI.getEvents()
      console.log('Backend response:', response)
      setEvents(response.data || [])
      
    } catch (err) {
      console.error('Failed to fetch events:', err)
      console.log('Error details:', err.response)
      setError('Failed to load calendar events')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = () => {
    setSelectedEvent(null)
    setIsEventModalOpen(true)
  }

  const handleEditEvent = (event) => {
    setSelectedEvent(event)
    setIsEventModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsEventModalOpen(false)
    setSelectedEvent(null)
  }

  const handleSaveEvent = async (eventData) => {
    try {
      console.log('Saving event:', eventData)
      
      let savedEvent
      
      if (selectedEvent) {
        // Update existing event
        const response = await calendarAPI.updateEvent(selectedEvent.id, eventData)
        savedEvent = response.data
        setEvents(events.map(event => 
          event.id === selectedEvent.id ? savedEvent : event
        ))
      } else {
        // Create new event
        const response = await calendarAPI.createEvent(eventData)
        savedEvent = response.data
        setEvents([...events, savedEvent])
      }
      
      console.log('Event saved successfully:', savedEvent)
      handleCloseModal()
      
    } catch (err) {
      console.error('Failed to save event:', err)
      alert('Failed to save event. Please try again.')
    }
  }

  const handleDeleteEvent = async (eventId) => {
    try {
      await calendarAPI.deleteEvent(eventId)
      setEvents(events.filter(event => event.id !== eventId))
      handleCloseModal()
    } catch (err) {
      console.error('Failed to delete event:', err)
      alert('Failed to delete event. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading calendar events...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500 text-lg">{error}</div>
        <button 
          onClick={fetchEvents}
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-shrink-0">
        <CalendarToolbar 
          currentView={currentView}
          onViewChange={setCurrentView}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onCreateEvent={handleCreateEvent}
          onRefresh={fetchEvents}
        />
      </div>
      
      <div className="flex-1 overflow-hidden">
        <CalendarView 
          currentView={currentView}
          currentDate={currentDate}
          onEventClick={handleEditEvent}
          onSlotClick={handleCreateEvent}
          events={events}
        />
      </div>

      <EventModal 
        isOpen={isEventModalOpen}
        onClose={handleCloseModal}
        event={selectedEvent}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />
    </div>
  )
}

export default CalendarPage