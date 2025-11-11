import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils'

const MiniCalendar = ({ currentDate, onDateSelect }) => {
  const [viewDate, setViewDate] = React.useState(currentDate)

  const navigateMonth = (direction) => {
    const newDate = new Date(viewDate)
    newDate.setMonth(newDate.getMonth() + direction)
    setViewDate(newDate)
  }

  const goToToday = () => {
    const today = new Date()
    setViewDate(today)
    onDateSelect(today)
  }

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const isToday = (day) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      viewDate.getMonth() === today.getMonth() &&
      viewDate.getFullYear() === today.getFullYear()
    )
  }

  const isSelected = (day) => {
    return (
      day === currentDate.getDate() &&
      viewDate.getMonth() === currentDate.getMonth() &&
      viewDate.getFullYear() === currentDate.getFullYear()
    )
  }

  const handleDateClick = (day) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
    onDateSelect(newDate)
  }

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(viewDate)
    const firstDay = getFirstDayOfMonth(viewDate)
    const days = []

    // Previous month days
    const prevMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1)
    const prevMonthDays = getDaysInMonth(prevMonth)
    
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push(
        <div
          key={`prev-${i}`}
          className="p-2 text-center text-gray-400 dark:text-gray-600"
        >
          {prevMonthDays - i}
        </div>
      )
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const today = isToday(day)
      const selected = isSelected(day)
      
      days.push(
        <button
          key={`current-${day}`}
          onClick={() => handleDateClick(day)}
          className={cn(
            "p-2 text-center rounded-lg transition-colors",
            today && "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 font-medium",
            selected && "bg-primary-600 text-white font-medium",
            !today && !selected && "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
          )}
        >
          {day}
        </button>
      )
    }

    return days
  }

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={goToToday}
            className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Today
          </button>
          <button
            onClick={() => navigateMonth(1)}
            className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div
            key={day}
            className="p-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {renderCalendarDays()}
      </div>
    </div>
  )
}

export default MiniCalendar 