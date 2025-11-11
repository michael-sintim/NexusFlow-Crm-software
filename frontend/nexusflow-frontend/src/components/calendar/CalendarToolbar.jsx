import React from 'react'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import ViewSwitcher from './ViewSwitcher'
import CalendarFilters from './CalendarFilter'


const CalendarToolbar = ({ 
  currentView, 
  onViewChange, 
  currentDate, 
  onDateChange, 
  onCreateEvent 
}) => {
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
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* Left Section - Navigation */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('TODAY')}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          Today
        </button>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('PREV')}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => navigate('NEXT')}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white min-w-[200px]">
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
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm font-medium">New Event</span>
        </button>
      </div>
    </div>
  )
}

export default CalendarToolbar