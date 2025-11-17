import React from 'react'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import ViewSwitcher from './ViewSwitcher'
import CalendarFilters from './CalendarFilter'
import { useUIStore } from '../store/uiStore'

const CalendarToolbar = ({ 
  currentView, 
  onViewChange, 
  currentDate, 
  onDateChange, 
  onCreateEvent 
}) => {
  const { theme } = useUIStore()

  // Theme-based styles
  const themeStyles = {
    light: {
      background: {
        primary: 'bg-white',
        secondary: 'bg-gray-50'
      },
      border: {
        primary: 'border-gray-200',
        secondary: 'border-gray-300'
      },
      text: {
        primary: 'text-gray-900',
        secondary: 'text-gray-600',
        tertiary: 'text-gray-500'
      }
    },
    dark: {
      background: {
        primary: 'bg-gray-800',
        secondary: 'bg-gray-750'
      },
      border: {
        primary: 'border-gray-700',
        secondary: 'border-gray-600'
      },
      text: {
        primary: 'text-white',
        secondary: 'text-gray-300',
        tertiary: 'text-gray-400'
      }
    }
  }

  const currentTheme = themeStyles[theme]

  const navigate = (action) => {
    let newDate = new Date(currentDate)
    
    switch (action) {
      case 'PREV':
        if (currentView === 'month') {
          newDate.setMonth(newDate.getMonth() - 1)
        } else if (currentView === 'week') {
          newDate.setDate(newDate.getDate() - 7)
        } else {
          newDate.setDate(newDate.getDate() - 1)
        }
        break
      case 'NEXT':
        if (currentView === 'month') {
          newDate.setMonth(newDate.getMonth() + 1)
        } else if (currentView === 'week') {
          newDate.setDate(newDate.getDate() + 7)
        } else {
          newDate.setDate(newDate.getDate() + 1)
        }
        break
      case 'TODAY':
        newDate = new Date()
        break
      default:
        return
    }
    
    onDateChange(newDate)
  }

  const formatDate = () => {
    if (currentView === 'month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    } else if (currentView === 'week') {
      const startOfWeek = new Date(currentDate)
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      
      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    } else {
      return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    }
  }

  return (
    <div className={`flex items-center justify-between p-4 border-b ${currentTheme.border.primary} ${currentTheme.background.primary}`}>
      {/* Left Section - Navigation */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('TODAY')}
          className={`px-4 py-2 text-sm font-medium ${currentTheme.text.secondary} ${currentTheme.background.primary} border ${currentTheme.border.secondary} rounded-lg hover:${currentTheme.background.secondary} transition-colors`}
        >
          Today
        </button>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('PREV')}
            className={`p-2 ${currentTheme.text.tertiary} hover:${currentTheme.text.primary} hover:${currentTheme.background.secondary} rounded-lg transition-colors`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => navigate('NEXT')}
            className={`p-2 ${currentTheme.text.tertiary} hover:${currentTheme.text.primary} hover:${currentTheme.background.secondary} rounded-lg transition-colors`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        
        <h2 className={`text-xl font-semibold ${currentTheme.text.primary} min-w-[200px]`}>
          {formatDate()}
        </h2>
      </div>

      {/* Center Section - View Switcher */}
      <div className="flex-1 flex justify-center">
        <ViewSwitcher 
          currentView={currentView}
          onViewChange={onViewChange}
        />
      </div>

      {/* Right Section - Actions & Filters */}
      <div className="flex items-center space-x-4">
        <CalendarFilters />
        
        <button
          onClick={onCreateEvent}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm font-medium">New Event</span>
        </button>
      </div>
    </div>
  )
}

export default CalendarToolbar