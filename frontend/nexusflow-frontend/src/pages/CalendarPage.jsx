import React, { useState, useEffect } from 'react'
import CalendarView from '../components/calendar/CalendarView'
import CalendarToolbar from '../components/calendar/CalendarToolbar'
import EventModal from '../components/calendar/Eventsmodal'
import { useDataStore } from '../store/dataStore'

const CalendarPage = () => {
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [currentView, setCurrentView] = useState('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showSuccess, setShowSuccess] = useState(false)

  const {
    calendarEvents,
    calendarEventsLoading,
    calendarEventsError,
    fetchCalendarEvents,
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent
  } = useDataStore()

  useEffect(() => {
    fetchCalendarEvents()
  }, [fetchCalendarEvents])

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
      console.log('💾 Saving event:', eventData)
      
      if (selectedEvent) {
        console.log('✏️ Updating existing event with ID:', selectedEvent.id)
        await updateCalendarEvent(selectedEvent.id, eventData)
      } else {
        console.log('🆕 Creating new event')
        await createCalendarEvent(eventData)
        
        // Show success image for new events only
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      }
      
      console.log('🎉 Event saved successfully')
      handleCloseModal()
      
    } catch (err) {
      console.error('❌ Failed to save event:', err)
      console.log('Error response:', err.response)
      alert('Failed to save event. Please try again.')
    }
  }

  const handleDeleteEvent = async (eventId) => {
    try {
      await deleteCalendarEvent(eventId)
      handleCloseModal()
    } catch (err) {
      console.error('❌ Failed to delete event:', err)
      alert('Failed to delete event. Please try again.')
    }
  }

  // Success Image Component
  const SuccessImage = () => (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl">
        <div className="w-20 h-20 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Event Created!
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Your event has been successfully added to the calendar.
        </p>
        <button
          onClick={() => setShowSuccess(false)}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  )

  if (calendarEventsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading calendar events...</div>
      </div>
    )
  }

  if (calendarEventsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500 text-lg">{calendarEventsError}</div>
        <button 
          onClick={fetchCalendarEvents}
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
          onRefresh={fetchCalendarEvents}
        />
      </div>
      
      <div className="flex-1 overflow-hidden">
        <CalendarView 
          currentView={currentView}
          currentDate={currentDate}
          onEventClick={handleEditEvent}
          onSlotClick={handleCreateEvent}
          events={calendarEvents}
        />
      </div>

      <EventModal 
        isOpen={isEventModalOpen}
        onClose={handleCloseModal}
        event={selectedEvent}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />

      {/* Success Image Modal */}
      {showSuccess && <SuccessImage />}
    </div>
  )
}

export default CalendarPage