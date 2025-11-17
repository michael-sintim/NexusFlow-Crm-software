import React from 'react'
import { useUIStore } from '../store/uiStore'
import UpcomingEvents from '../components/calendar/UpcomingEvents'

const UpcomingEventsPage = () => {
  const { theme } = useUIStore()

  // Theme-based styles
  const themeStyles = {
    light: {
      text: {
        primary: 'text-gray-900'
      }
    },
    dark: {
      text: {
        primary: 'text-white'
      }
    }
  }

  const currentTheme = themeStyles[theme]

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-3xl font-bold ${currentTheme.text.primary}`}>Upcoming Events</h1>
      </div>
      
      <UpcomingEvents />
    </div>
  )
}

export default UpcomingEventsPage