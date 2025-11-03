import React from 'react'
import UpcomingEvents from '../components/calendar/UpcomingEvents'

const UpcomingEventsPage = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Upcoming Events</h1>
      </div>
      
      <UpcomingEvents />
    </div>
  )
}

export default UpcomingEventsPage