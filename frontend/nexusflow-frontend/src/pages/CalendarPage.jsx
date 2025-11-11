import React, { useState } from 'react'
import CalendarView from '../components/calendar/CalendarView'
import CalendarToolbar from '../components/calendar/CalendarToolbar'
import EventModal from '../components/calendar/Eventsmodal'

const CalendarPage = () => {
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [currentView, setCurrentView] = useState('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState([]) // ← ADD THIS STATE

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

  const handleSaveEvent = (eventData) => {
    console.log('Saving event:', eventData)
    
    if (selectedEvent) {
      // Update existing event
      setEvents(events.map(event => 
        event.id === selectedEvent.id 
          ? { ...selectedEvent, ...eventData }
          : event
      ))
    } else {
      // Create new event
      const newEvent = {
        id: Date.now().toString(), // Generate unique ID
        ...eventData
      }
      setEvents([...events, newEvent])
    }
    
    handleCloseModal()
  }

  return (
    <div className="flex flex-col h-screen ">
      {/* Calendar Toolbar - Full Width */}
      <div className="flex-shrink-0">
        <CalendarToolbar 
          currentView={currentView}
          onViewChange={setCurrentView}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onCreateEvent={handleCreateEvent}
        />
      </div>
      
      {/* Main Calendar - Full Width */}
      <div className="flex-1 overflow-hidden">
        <CalendarView 
          currentView={currentView}
          currentDate={currentDate}
          onEventClick={handleEditEvent}
          onSlotClick={handleCreateEvent}
          events={events} // ← PASS EVENTS TO CALENDAR VIEW
        />
      </div>

      {/* Event Modal */}
      <EventModal 
        isOpen={isEventModalOpen}
        onClose={handleCloseModal}
        event={selectedEvent}
        onSave={handleSaveEvent}
      />
    </div>
  )
}

export default CalendarPage