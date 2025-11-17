import React, { useState, useEffect } from 'react'
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Grid,
  List,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  X,
  Search,
  Clock,
  MapPin,
  Users,
  Phone,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { useDataStore } from '../store/dataStore'
import { useUIStore } from '../store/uiStore'
import EventForm from '../components/calendar/EventForm'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

const CalendarPage = () => {
  const { theme } = useUIStore()
  const { 
    calendarEvents, 
    fetchCalendarEvents, 
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    calendarEventsLoading,
    calendarEventsError 
  } = useDataStore()

  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState('month')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showEventForm, setShowEventForm] = useState(false)
  const [showEventDetails, setShowEventDetails] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [eventToEdit, setEventToEdit] = useState(null)
  const [eventToDelete, setEventToDelete] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showDayEventsModal, setShowDayEventsModal] = useState(false)
  const [dayEvents, setDayEvents] = useState([])
  const [selectedDay, setSelectedDay] = useState(null)

  // Theme-based styles
  const themeStyles = {
    light: {
      background: {
        primary: 'bg-white',
        secondary: 'bg-gray-50',
        overlay: 'bg-black bg-opacity-50',
        modal: 'bg-white',
        input: 'bg-white',
        section: 'bg-gray-50',
        page: 'bg-gray-50'
      },
      border: {
        primary: 'border-gray-200',
        secondary: 'border-gray-300',
        input: 'border-gray-300',
        calendar: 'border-gray-100'
      },
      text: {
        primary: 'text-gray-900',
        secondary: 'text-gray-600',
        tertiary: 'text-gray-500',
        label: 'text-gray-700'
      },
      button: {
        secondary: 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200',
        cancel: 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200',
        outline: 'border-gray-300 text-gray-700 hover:bg-gray-50'
      }
    },
    dark: {
      background: {
        primary: 'bg-gray-800',
        secondary: 'bg-gray-750',
        overlay: 'bg-black bg-opacity-50',
        modal: 'bg-gray-800',
        input: 'bg-gray-700',
        section: 'bg-gray-750',
        page: 'bg-gray-900'
      },
      border: {
        primary: 'border-gray-700',
        secondary: 'border-gray-600',
        input: 'border-gray-600',
        calendar: 'border-gray-700'
      },
      text: {
        primary: 'text-white',
        secondary: 'text-gray-300',
        tertiary: 'text-gray-400',
        label: 'text-gray-300'
      },
      button: {
        secondary: 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600',
        cancel: 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600',
        outline: 'border-gray-600 text-gray-300 hover:bg-gray-700'
      }
    }
  }

  const currentTheme = themeStyles[theme]

  useEffect(() => {
    const params = getFetchParams()
    fetchCalendarEvents(params)
  }, [currentDate, view, fetchCalendarEvents])

  const getFetchParams = () => {
    const params = {}
    
    if (view === 'month') {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      params.start_date = startOfMonth.toISOString().split('T')[0]
      params.end_date = endOfMonth.toISOString().split('T')[0]
    } else if (view === 'week') {
      const startOfWeek = new Date(currentDate)
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      params.start_date = startOfWeek.toISOString().split('T')[0]
      params.end_date = endOfWeek.toISOString().split('T')[0]
    } else if (view === 'day') {
      const startOfDay = new Date(currentDate)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(currentDate)
      endOfDay.setHours(23, 59, 59, 999)
      params.start_date = startOfDay.toISOString()
      params.end_date = endOfDay.toISOString()
    }
    
    return params
  }

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate)
    
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + direction)
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + (direction * 7))
    } else if (view === 'day') {
      newDate.setDate(newDate.getDate() + direction)
    }
    
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const handleCreateEvent = (date = null) => {
    setEventToEdit(null)
    setShowEventForm(true)
  }

  const handleEditEvent = (event) => {
    setEventToEdit(event)
    setShowEventForm(true)
    setShowEventDetails(false)
  }

  const handleViewEvent = (event) => {
    setSelectedEvent(event)
    setShowEventDetails(true)
  }

  const handleDeleteClick = (event) => {
    setEventToDelete(event)
    setShowDeleteConfirm(true)
    setShowEventDetails(false)
  }

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return

    try {
      await deleteCalendarEvent(eventToDelete.id)
      
      setSuccessMessage('Event deleted successfully!')
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      
      setShowDeleteConfirm(false)
      setEventToDelete(null)
      setSelectedEvent(null)
      
      const params = getFetchParams()
      await fetchCalendarEvents(params)
      
    } catch (err) {
      console.error('❌ Failed to delete event:', err)
      alert('Failed to delete event. Please try again.')
    }
  }

  const handleSaveEvent = async (eventData) => {
    try {
      console.log('💾 Saving event:', eventData)
      
      if (eventToEdit) {
        console.log('✏️ Updating existing event with ID:', eventToEdit.id)
        await updateCalendarEvent(eventToEdit.id, eventData)
        
        setSuccessMessage('Event updated successfully!')
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      } else {
        console.log('🆕 Creating new event')
        await createCalendarEvent(eventData)
        
        setSuccessMessage('Event created successfully!')
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      }
      
      console.log('🎉 Event saved successfully')
      setShowEventForm(false)
      setEventToEdit(null)
      
      const params = getFetchParams()
      await fetchCalendarEvents(params)
      
    } catch (err) {
      console.error('❌ Failed to save event:', err)
      console.log('Error response:', err.response)
      
      let errorMessage = 'Failed to save event. Please try again.'
      if (err.response?.data) {
        if (typeof err.response.data === 'object') {
          const errors = Object.entries(err.response.data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('\n')
          errorMessage = `Validation errors:\n${errors}`
        } else {
          errorMessage = err.response.data
        }
      }
      
      alert(errorMessage)
    }
  }

  const handleCloseModal = () => {
    setShowEventForm(false)
    setShowEventDetails(false)
    setShowDeleteConfirm(false)
    setShowDayEventsModal(false)
    setEventToEdit(null)
    setEventToDelete(null)
    setSelectedEvent(null)
    setSelectedDay(null)
    setDayEvents([])
  }

  const handleShowDayEvents = (day, events) => {
    setSelectedDay(day)
    setDayEvents(events)
    setShowDayEventsModal(true)
  }

  const filteredEvents = React.useMemo(() => {
    let events = calendarEvents || []

    if (filterType !== 'all') {
      events = events.filter(event => event.event_type === filterType)
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      events = events.filter(event => 
        event.title?.toLowerCase().includes(searchLower) ||
        event.description?.toLowerCase().includes(searchLower) ||
        event.location?.toLowerCase().includes(searchLower)
      )
    }

    return events
  }, [calendarEvents, filterType, searchTerm])

  const getEventsForView = () => {
    if (view === 'list') {
      return filteredEvents.sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
    }
    return filteredEvents
  }

  const renderCalendarView = () => {
    const viewProps = {
      currentDate,
      events: getEventsForView(),
      onEventClick: handleViewEvent,
      onCreateEvent: handleCreateEvent,
      onShowDayEvents: handleShowDayEvents,
      theme: currentTheme
    }

    switch (view) {
      case 'month':
        return <MonthView {...viewProps} />
      case 'week':
        return <WeekView {...viewProps} />
      case 'day':
        return <DayView {...viewProps} />
      case 'list':
        return <ListView 
          {...viewProps}
          onEditEvent={handleEditEvent}
          onDeleteEvent={handleDeleteClick}
        />
      default:
        return <MonthView {...viewProps} />
    }
  }

  const SuccessModal = () => (
    <div className={`fixed inset-0 flex items-center justify-center z-50 ${currentTheme.background.overlay}`}>
      <div className={`${currentTheme.background.modal} rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl`}>
        <div className="w-20 h-20 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className={`text-xl font-bold ${currentTheme.text.primary} mb-2`}>
          Success!
        </h3>
        <p className={`${currentTheme.text.secondary} mb-4`}>
          {successMessage}
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

  const DeleteConfirmationModal = () => (
    <div className={`fixed inset-0 ${currentTheme.background.overlay} flex items-center justify-center p-4 z-50`}>
      <div className={`${currentTheme.background.modal} rounded-xl shadow-xl w-full max-w-md`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${currentTheme.text.primary}`}>
                Delete Event
              </h2>
              <p className={`text-sm ${currentTheme.text.secondary}`}>
                This action cannot be undone
              </p>
            </div>
          </div>
          
          <p className={`${currentTheme.text.secondary} mb-6`}>
            Are you sure you want to delete <strong>"{eventToDelete?.title}"</strong>? This event will be permanently removed.
          </p>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleCloseModal}
              className={currentTheme.text.secondary}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteEvent}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Event
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  const DayEventsModal = () => (
    <div className={`fixed inset-0 ${currentTheme.background.overlay} flex items-center justify-center p-4 z-50`}>
      <div className={`${currentTheme.background.modal} rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden`}>
        <div className={`flex justify-between items-center p-6 border-b ${currentTheme.border.primary}`}>
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-6 w-6 text-blue-500" />
            <div>
              <h2 className={`text-xl font-bold ${currentTheme.text.primary}`}>
                Events for {selectedDay?.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </h2>
              <p className={`text-sm ${currentTheme.text.secondary}`}>
                {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={handleCloseModal}
            className={`p-2 hover:${currentTheme.background.secondary} rounded-lg transition-colors ${currentTheme.text.tertiary} hover:${currentTheme.text.primary}`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-4">
            {dayEvents.map((event, index) => (
              <div
                key={index}
                onClick={() => {
                  handleViewEvent(event)
                  handleCloseModal()
                }}
                className={`p-4 rounded-lg border-l-4 cursor-pointer transition-all hover:shadow-md ${
                  getEventColorClasses(event.event_type, true)
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className={`font-semibold ${currentTheme.text.primary}`}>
                      {event.title}
                    </h4>
                    <div className={`flex items-center gap-4 mt-2 text-sm ${currentTheme.text.secondary}`}>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatTime(event.start_time)} - {formatTime(event.end_time)}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </div>
                      )}
                    </div>
                    {event.description && (
                      <p className={`text-sm ${currentTheme.text.secondary} mt-2 line-clamp-2`}>
                        {event.description}
                      </p>
                    )}
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    event.status === 'completed' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : event.status === 'cancelled'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                  }`}>
                    {event.status?.replace('_', ' ') || 'scheduled'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  if (calendarEventsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className={`text-lg ${currentTheme.text.primary}`}>Loading calendar events...</div>
      </div>
    )
  }

  if (calendarEventsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500 text-lg">{calendarEventsError}</div>
        <button 
          onClick={() => fetchCalendarEvents(getFetchParams())}
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${currentTheme.background.page} p-6`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className={`text-3xl font-bold ${currentTheme.text.primary} flex items-center gap-3`}>
                <CalendarIcon className="h-8 w-8 text-blue-600" />
                Calendar
              </h1>
              <p className={`${currentTheme.text.secondary} mt-2`}>
                Manage your schedule and events
              </p>
            </div>
            
            <Button
              onClick={() => handleCreateEvent()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Event
            </Button>
          </div>
        </div>

        {showSuccess && <SuccessModal />}

        <div className={`${currentTheme.background.primary} rounded-xl p-6 shadow-sm border ${currentTheme.border.primary} mb-6`}>
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant={view === 'month' ? 'primary' : 'outline'}
                onClick={() => setView('month')}
                size="sm"
              >
                <Grid className="h-4 w-4 mr-2" />
                Month
              </Button>
              <Button
                variant={view === 'week' ? 'primary' : 'outline'}
                onClick={() => setView('week')}
                size="sm"
              >
                Week
              </Button>
              <Button
                variant={view === 'day' ? 'primary' : 'outline'}
                onClick={() => setView('day')}
                size="sm"
              >
                Day
              </Button>
              <Button
                variant={view === 'list' ? 'primary' : 'outline'}
                onClick={() => setView('list')}
                size="sm"
              >
                <List className="h-4 w-4 mr-2" />
                List
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigateDate(-1)}
                size="sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                onClick={goToToday}
                size="sm"
              >
                Today
              </Button>
              
              <h2 className={`text-lg font-semibold ${currentTheme.text.primary} min-w-48 text-center`}>
                {view === 'month' && currentDate.toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric'
                })}
                {view === 'week' && `Week of ${getWeekStartDate(currentDate).toLocaleDateString()}`}
                {view === 'day' && currentDate.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
                {view === 'list' && 'All Events'}
              </h2>
              
              <Button
                variant="outline"
                onClick={() => navigateDate(1)}
                size="sm"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
                className="w-48"
                theme={theme}
              />
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={`px-3 py-2 border ${currentTheme.border.input} rounded-lg ${currentTheme.background.input} ${currentTheme.text.primary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="all">All Events</option>
                <option value="meeting">Meetings</option>
                <option value="call">Calls</option>
                <option value="appointment">Appointments</option>
                <option value="deadline">Deadlines</option>
                <option value="task">Tasks</option>
              </select>
            </div>
          </div>
        </div>

        {!calendarEventsLoading && !calendarEventsError && (
          <div className={`${currentTheme.background.primary} rounded-xl shadow-sm border ${currentTheme.border.primary} overflow-hidden`}>
            {renderCalendarView()}
          </div>
        )}

        {showEventForm && (
          <EventForm
            event={eventToEdit}
            onSave={handleSaveEvent}
            onCancel={handleCloseModal}
            preloadDate={currentDate}
          />
        )}

        {showEventDetails && selectedEvent && (
          <EventDetailsModal
            event={selectedEvent}
            onEdit={() => handleEditEvent(selectedEvent)}
            onDelete={() => handleDeleteClick(selectedEvent)}
            onClose={handleCloseModal}
            theme={currentTheme}
          />
        )}

        {showDeleteConfirm && <DeleteConfirmationModal />}

        {showDayEventsModal && <DayEventsModal />}
      </div>
    </div>
  )
}

const MonthView = ({ currentDate, events, onEventClick, onCreateEvent, onShowDayEvents, theme }) => {
  const MAX_VISIBLE_EVENTS = 3

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getEventsForDay = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    return events.filter(event => {
      const eventStart = new Date(event.start_time)
      const eventEnd = new Date(event.end_time)
      const currentDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const nextDay = new Date(currentDay)
      nextDay.setDate(currentDay.getDate() + 1)
      
      return eventStart < nextDay && eventEnd > currentDay
    })
  }

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`prev-${i}`} className={`p-2 border ${theme.border.calendar} ${theme.background.secondary}`}></div>
      )
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDay(day)
      const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString()
      const visibleEvents = dayEvents.slice(0, MAX_VISIBLE_EVENTS)
      const hiddenEventsCount = dayEvents.length - MAX_VISIBLE_EVENTS
      
      days.push(
        <div
          key={day}
          className={`p-2 border ${theme.border.calendar} min-h-32 cursor-pointer ${
            isToday ? 'bg-blue-50 dark:bg-blue-900/20' : `${theme.background.primary} hover:${theme.background.secondary}`
          }`}
          onClick={() => {
            const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            onCreateEvent(clickedDate)
          }}
        >
          <div className={`text-sm font-medium mb-2 ${
            isToday ? 'text-blue-600 dark:text-blue-400' : theme.text.primary
          }`}>
            {day}
          </div>
          <div className="space-y-1">
            {visibleEvents.map((event, index) => {
              const eventStart = new Date(event.start_time)
              const isStartDay = eventStart.getDate() === day && eventStart.getMonth() === currentDate.getMonth()
              
              return (
                <div
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation()
                    onEventClick(event)
                  }}
                  className={`text-xs p-1 rounded cursor-pointer truncate ${
                    getEventColorClasses(event.event_type)
                  } ${isStartDay ? '' : 'ml-2'}`}
                  title={event.title}
                >
                  {isStartDay && `${formatTime(event.start_time)} `}{event.title}
                </div>
              )
            })}
            {hiddenEventsCount > 0 && (
              <div
                onClick={(e) => {
                  e.stopPropagation()
                  const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                  onShowDayEvents(clickedDate, dayEvents)
                }}
                className="text-xs p-1 rounded cursor-pointer bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 text-center"
              >
                +{hiddenEventsCount} more
              </div>
            )}
          </div>
        </div>
      )
    }

    return days
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-7 gap-0">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className={`p-3 text-center font-semibold ${theme.text.primary} border-b ${theme.border.primary}`}>
            {day}
          </div>
        ))}
        {renderCalendarDays()}
      </div>
    </div>
  )
}

const WeekView = ({ currentDate, events, onEventClick, onCreateEvent, onShowDayEvents, theme }) => {
  const MAX_VISIBLE_EVENTS = 2

  const days = []
  const startOfWeek = getWeekStartDate(currentDate)

  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek)
    day.setDate(startOfWeek.getDate() + i)
    days.push(day)
  }

  const getEventsForDay = (day) => {
    return events.filter(event => {
      const eventStart = new Date(event.start_time)
      const eventEnd = new Date(event.end_time)
      const startOfDay = new Date(day)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(day)
      endOfDay.setHours(23, 59, 59, 999)
      
      return eventStart <= endOfDay && eventEnd >= startOfDay
    })
  }

  const getEventsForTimeSlot = (day, hour) => {
    return events.filter(event => {
      const eventStart = new Date(event.start_time)
      const eventEnd = new Date(event.end_time)
      const slotStart = new Date(day)
      slotStart.setHours(hour, 0, 0, 0)
      const slotEnd = new Date(day)
      slotEnd.setHours(hour + 1, 0, 0, 0)
      
      return eventStart < slotEnd && eventEnd > slotStart
    })
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-8 gap-0">
        <div className={`border-r ${theme.border.primary}`}></div>
        {days.map((day, index) => {
          const dayEvents = getEventsForDay(day)
          const visibleEvents = dayEvents.slice(0, MAX_VISIBLE_EVENTS)
          const hiddenEventsCount = dayEvents.length - MAX_VISIBLE_EVENTS
          
          return (
            <div 
              key={index} 
              className={`p-3 text-center border-b border-r ${theme.border.primary} cursor-pointer hover:${theme.background.secondary}`}
              onClick={() => onCreateEvent(day)}
            >
              <div className={`text-sm font-semibold ${theme.text.primary}`}>
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className={`text-lg font-bold ${
                day.toDateString() === new Date().toDateString() 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : theme.text.primary
              }`}>
                {day.getDate()}
              </div>
              
              {visibleEvents.length > 0 && (
                <div className="mt-2 space-y-1">
                  {visibleEvents.map((event, eventIndex) => (
                    <div
                      key={eventIndex}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEventClick(event)
                      }}
                      className={`text-xs p-1 rounded cursor-pointer truncate ${
                        getEventColorClasses(event.event_type)
                      }`}
                      title={event.title}
                    >
                      {formatTime(event.start_time)} {event.title}
                    </div>
                  ))}
                  {hiddenEventsCount > 0 && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation()
                        onShowDayEvents(day, dayEvents)
                      }}
                      className="text-xs p-1 rounded cursor-pointer bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 text-center"
                    >
                      +{hiddenEventsCount} more
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
        
        {Array.from({ length: 14 }, (_, i) => i + 7).map(hour => (
          <React.Fragment key={hour}>
            <div className={`p-2 text-right text-sm ${theme.text.tertiary} border-r ${theme.border.primary}`}>
              {hour}:00
            </div>
            {days.map((day, dayIndex) => {
              const dayEvents = getEventsForTimeSlot(day, hour)
              
              return (
                <div 
                  key={dayIndex} 
                  className={`p-2 border-b border-r ${theme.border.primary} min-h-16 cursor-pointer hover:${theme.background.secondary}`}
                  onClick={() => {
                    const clickedDateTime = new Date(day)
                    clickedDateTime.setHours(hour, 0, 0, 0)
                    onCreateEvent(clickedDateTime)
                  }}
                >
                  {dayEvents.map((event, eventIndex) => (
                    <div
                      key={eventIndex}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEventClick(event)
                      }}
                      className={`text-xs p-1 rounded cursor-pointer mb-1 ${
                        getEventColorClasses(event.event_type)
                      }`}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              )
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

const DayView = ({ currentDate, events, onEventClick, onCreateEvent, theme }) => {
  const dayEvents = events.filter(event => {
    const eventStart = new Date(event.start_time)
    const eventEnd = new Date(event.end_time)
    
    const startOfDay = new Date(currentDate)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(currentDate)
    endOfDay.setHours(23, 59, 59, 999)
    
    return eventStart <= endOfDay && eventEnd >= startOfDay
  })

  const sortedEvents = dayEvents.sort((a, b) => 
    new Date(a.start_time) - new Date(b.start_time)
  )

  return (
    <div className="p-6">
      <div className="text-center mb-6">
        <h3 className={`text-2xl font-bold ${theme.text.primary}`}>
          {currentDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
          })}
        </h3>
      </div>
      
      <div className="space-y-4 max-w-2xl mx-auto">
        {sortedEvents.length > 0 ? (
          sortedEvents.map((event, index) => {
            const eventStart = new Date(event.start_time)
            const eventEnd = new Date(event.end_time)
            
            return (
              <div
                key={index}
                onClick={() => onEventClick(event)}
                className={`p-4 rounded-lg border-l-4 cursor-pointer transition-all hover:shadow-md ${
                  getEventColorClasses(event.event_type, true)
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className={`font-semibold ${theme.text.primary}`}>
                      {event.title}
                    </h4>
                    <div className={`flex items-center gap-4 mt-2 text-sm ${theme.text.secondary}`}>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatTime(event.start_time)} - {formatTime(event.end_time)}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </div>
                      )}
                    </div>
                    {event.description && (
                      <p className={`text-sm ${theme.text.secondary} mt-2 line-clamp-2`}>
                        {event.description}
                      </p>
                    )}
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    event.status === 'completed' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : event.status === 'cancelled'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                  }`}>
                    {event.status?.replace('_', ' ') || 'scheduled'}
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div 
            className={`text-center py-12 cursor-pointer hover:${theme.background.secondary} rounded-lg`}
            onClick={() => onCreateEvent(currentDate)}
          >
            <CalendarIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className={theme.text.tertiary}>No events scheduled for this day</p>
            <p className={`text-sm ${theme.text.tertiary} mt-2`}>Click to create an event</p>
          </div>
        )}
      </div>
    </div>
  )
}

const ListView = ({ events, onEventClick, onEditEvent, onDeleteEvent, theme }) => {
  const [selectedEvent, setSelectedEvent] = useState(null)

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'meeting': return <Users className="h-4 w-4" />
      case 'call': return <Phone className="h-4 w-4" />
      case 'appointment': return <CheckCircle className="h-4 w-4" />
      default: return <CalendarIcon className="h-4 w-4" />
    }
  }

  return (
    <div className="p-6">
      <div className="space-y-3">
        {events.length > 0 ? (
          events.map((event, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-4 border ${theme.border.primary} rounded-lg hover:${theme.background.secondary} transition-colors`}
            >
              <div 
                className="flex items-center gap-4 flex-1 cursor-pointer"
                onClick={() => onEventClick(event)}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  getEventColorClasses(event.event_type, false)
                }`}>
                  {getEventIcon(event.event_type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold ${theme.text.primary} truncate`}>
                    {event.title}
                  </h4>
                  <div className={`flex items-center gap-4 mt-1 text-sm ${theme.text.secondary}`}>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(event.start_time).toLocaleString()}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  event.status === 'completed' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : event.status === 'cancelled'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                }`}>
                  {event.status?.replace('_', ' ') || 'scheduled'}
                </span>

                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedEvent(selectedEvent?.id === event.id ? null : event)
                    }}
                    className={`p-1 hover:${theme.background.secondary} rounded`}
                  >
                    <MoreVertical className="h-4 w-4 text-gray-500" />
                  </button>

                  {selectedEvent?.id === event.id && (
                    <div className={`absolute right-0 top-8 ${theme.background.primary} border ${theme.border.primary} rounded-lg shadow-lg z-10 min-w-32`}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onEventClick(event)
                          setSelectedEvent(null)
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:${theme.background.secondary} flex items-center gap-2 ${theme.text.primary}`}
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onEditEvent(event)
                          setSelectedEvent(null)
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:${theme.background.secondary} flex items-center gap-2 ${theme.text.primary}`}
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteEvent(event)
                          setSelectedEvent(null)
                        }}
                        className={`w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2`}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <CalendarIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className={theme.text.tertiary}>No events found</p>
          </div>
        )}
      </div>
    </div>
  )
}

const EventDetailsModal = ({ event, onEdit, onDelete, onClose, theme }) => {
  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'meeting': return <Users className="h-5 w-5 text-blue-500" />
      case 'call': return <Phone className="h-5 w-5 text-purple-500" />
      case 'appointment': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'deadline': return <Clock className="h-5 w-5 text-red-500" />
      default: return <CalendarIcon className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className={`fixed inset-0 ${theme.background.overlay} flex items-center justify-center p-4 z-50`}>
      <div className={`${theme.background.modal} rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden`}>
        <div className={`flex justify-between items-center p-6 border-b ${theme.border.primary}`}>
          <div className="flex items-center gap-3">
            {getEventIcon(event.event_type)}
            <div>
              <h2 className={`text-xl font-bold ${theme.text.primary}`}>
                {event.title}
              </h2>
              <p className={`text-sm ${theme.text.secondary} capitalize`}>
                {event.event_type} • {event.status?.replace('_', ' ') || 'scheduled'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 hover:${theme.background.secondary} rounded-lg`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-semibold ${theme.text.primary} mb-2`}>
                  Date & Time
                </label>
                <div className={`flex items-center gap-2 ${theme.text.secondary}`}>
                  <Clock className="h-4 w-4" />
                  {new Date(event.start_time).toLocaleString()} 
                  {event.end_time && ` - ${new Date(event.end_time).toLocaleTimeString()}`}
                </div>
              </div>

              {event.location && (
                <div>
                  <label className={`block text-sm font-semibold ${theme.text.primary} mb-2`}>
                    Location
                  </label>
                  <div className={`flex items-center gap-2 ${theme.text.secondary}`}>
                    <MapPin className="h-4 w-4" />
                    {event.location}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className={`block text-sm font-semibold ${theme.text.primary} mb-2`}>
                Description
              </label>
              <p className={theme.text.secondary}>
                {event.description || 'No description provided.'}
              </p>
            </div>
          </div>

          <div className={`flex justify-end gap-3 pt-6 border-t ${theme.border.primary}`}>
            <Button
              variant="outline"
              onClick={onDelete}
              className="text-red-600 dark:text-red-400 border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button
              onClick={onEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Event
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

const getEventColorClasses = (eventType, isBorder = false) => {
  const baseClasses = isBorder ? 'border-l-4' : ''
  
  switch (eventType) {
    case 'meeting':
      return `${baseClasses} bg-blue-100 text-blue-800 border-blue-500 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-400`
    case 'call':
      return `${baseClasses} bg-purple-100 text-purple-800 border-purple-500 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-400`
    case 'appointment':
      return `${baseClasses} bg-green-100 text-green-800 border-green-500 dark:bg-green-900/30 dark:text-green-300 dark:border-green-400`
    case 'deadline':
      return `${baseClasses} bg-red-100 text-red-800 border-red-500 dark:bg-red-900/30 dark:text-red-300 dark:border-red-400`
    case 'task':
      return `${baseClasses} bg-orange-100 text-orange-800 border-orange-500 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-400`
    default:
      return `${baseClasses} bg-gray-100 text-gray-800 border-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-400`
  }
}

const formatTime = (dateString) => {
  if (!dateString) return 'All day'
  const date = new Date(dateString)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const getWeekStartDate = (date) => {
  const startOfWeek = new Date(date)
  startOfWeek.setDate(date.getDate() - date.getDay())
  return startOfWeek
}

export default CalendarPage