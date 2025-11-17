import React from 'react'
import { useUIStore } from '../store/uiStore'
import UpcomingEvents from '../components/calendar/UpcomingEvents'

const UpcomingEventsPage = () => {
  const { theme } = useUIStore()

  // Theme-based styles
  const themeStyles = {
    light: {
      background: {
        page: 'bg-gray-50'
      },
      text: {
        primary: 'text-gray-900'
      }
    },
    dark: {
      background: {
        page: 'bg-gray-900'
      },
      text: {
        primary: 'text-white'
      }
    }
  }

  const currentTheme = themeStyles[theme]

  return (
    <div className={`min-h-screen ${currentTheme.background.page} p-6`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-3xl font-bold ${currentTheme.text.primary}`}>Upcoming Events</h1>
      </div>
      
      <UpcomingEvents />
    </div>
  )
}

export default UpcomingEventsPage