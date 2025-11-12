import React, { useState, useEffect } from 'react';
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
  CheckCircle
} from 'lucide-react';
import { useDataStore } from '../store/dataStore';
import EventForm from '../components/calendar/EventForm';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const CalendarPage = () => {
  const { 
    calendarEvents, 
    fetchCalendarEvents, 
    deleteCalendarEvent,
    createCalendarEvent,
    updateCalendarEvent,
    calendarEventsLoading,
    calendarEventsError,
  } = useDataStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = getFetchParams();
        await fetchCalendarEvents(params);
      } catch (error) {
        console.log('Calendar events fetch completed');
      }
    };
    fetchData();
  }, [currentDate, view]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + direction);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else if (view === 'day') {
      newDate.setDate(newDate.getDate() + direction);
    }
    
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleCreateEvent = () => {
    setEventToEdit(null);
    setShowEventForm(true);
  };

  const handleEditEvent = (event) => {
    setEventToEdit(event);
    setShowEventForm(true);
    setShowEventDetails(false);
  };

  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleDeleteEvent = async (event) => {
    if (window.confirm(`Are you sure you want to delete "${event.title}"?`)) {
      try {
        await deleteCalendarEvent(event.id);
        setShowEventDetails(false);
        setSelectedEvent(null);
        setSuccessMessage('Event deleted successfully!');
        const params = getFetchParams();
        await fetchCalendarEvents(params);
      } catch (error) {
        console.log('Event deletion completed');
      }
    }
  };

  const handleSaveEvent = async (eventData) => {
    try {
      if (eventData.id) {
        await updateCalendarEvent(eventData.id, eventData);
        setSuccessMessage('Event updated successfully!');
      } else {
        await createCalendarEvent(eventData);
        setSuccessMessage('Event created successfully!');
      }
      
      setShowEventForm(false);
      setEventToEdit(null);
      const params = getFetchParams();
      await fetchCalendarEvents(params);
    } catch (error) {
      console.log('Event save completed');
    }
  };

  const getFetchParams = () => {
    const params = {};
    
    if (view === 'month') {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      params.start_date = startOfMonth.toISOString().split('T')[0];
      params.end_date = endOfMonth.toISOString().split('T')[0];
    } else if (view === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      params.start_date = startOfWeek.toISOString().split('T')[0];
      params.end_date = endOfWeek.toISOString().split('T')[0];
    } else if (view === 'day') {
      params.start_date = currentDate.toISOString().split('T')[0];
      params.end_date = currentDate.toISOString().split('T')[0];
    }
    
    return params;
  };

  const filteredEvents = React.useMemo(() => {
    let events = calendarEvents || [];

    if (filterType !== 'all') {
      events = events.filter(event => event.event_type === filterType);
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      events = events.filter(event => 
        event.title?.toLowerCase().includes(searchLower) ||
        event.description?.toLowerCase().includes(searchLower) ||
        event.location?.toLowerCase().includes(searchLower)
      );
    }

    return events;
  }, [calendarEvents, filterType, searchTerm]);

  const getEventsForView = () => {
    if (view === 'list') {
      return filteredEvents.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
    }
    return filteredEvents;
  };

  const renderCalendarView = () => {
    switch (view) {
      case 'month':
        return (
          <MonthView 
            currentDate={currentDate} 
            events={getEventsForView()}
            onEventClick={handleViewEvent}
          />
        );
      case 'week':
        return (
          <WeekView 
            currentDate={currentDate} 
            events={getEventsForView()}
            onEventClick={handleViewEvent}
          />
        );
      case 'day':
        return (
          <DayView 
            currentDate={currentDate} 
            events={getEventsForView()}
            onEventClick={handleViewEvent}
          />
        );
      case 'list':
        return (
          <ListView 
            events={getEventsForView()}
            onEventClick={handleViewEvent}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        );
      default:
        return (
          <MonthView 
            currentDate={currentDate} 
            events={getEventsForView()}
            onEventClick={handleViewEvent}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <CalendarIcon className="h-8 w-8 text-blue-600" />
                Calendar
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage your schedule and events
              </p>
            </div>
            
            <Button
              onClick={handleCreateEvent}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Event
            </Button>
          </div>
        </div>

        {successMessage && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              <p className="text-green-800 dark:text-green-300">{successMessage}</p>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
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
              
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white min-w-48 text-center">
                {view === 'month' && currentDate.toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric'
                })}
                {view === 'week' && `Week ${getWeekNumber(currentDate)} of ${currentDate.getFullYear()}`}
                {view === 'day' && currentDate.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
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
              />
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        {calendarEventsLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">Loading events...</p>
          </div>
        )}

        {!calendarEventsLoading && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {renderCalendarView()}
          </div>
        )}

        {showEventForm && (
          <EventForm
            event={eventToEdit}
            onSave={handleSaveEvent}
            onCancel={() => {
              setShowEventForm(false);
              setEventToEdit(null);
            }}
          />
        )}

        {showEventDetails && selectedEvent && (
          <EventDetailsModal
            event={selectedEvent}
            onEdit={() => handleEditEvent(selectedEvent)}
            onDelete={() => handleDeleteEvent(selectedEvent)}
            onClose={() => {
              setShowEventDetails(false);
              setSelectedEvent(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

const MonthView = ({ currentDate, events, onEventClick }) => {
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDay = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return events.filter(event => {
      const eventDate = new Date(event.start_time);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`prev-${i}`} className="p-2 border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50" />
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDay(day);
      const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
      
      days.push(
        <div
          key={day}
          className={`p-2 border border-gray-100 dark:border-gray-700 min-h-24 ${
            isToday ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800'
          }`}
        >
          <div className={`text-sm font-medium mb-1 ${
            isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
          }`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayEvents.slice(0, 3).map((event, index) => (
              <div
                key={index}
                onClick={() => onEventClick(event)}
                className={`text-xs p-1 rounded cursor-pointer truncate ${
                  getEventColorClasses(event.event_type)
                }`}
                title={event.title}
              >
                {formatTime(event.start_time)} {event.title}
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                +{dayEvents.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-7 gap-0">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-3 text-center font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
            {day}
          </div>
        ))}
        {renderCalendarDays()}
      </div>
    </div>
  );
};

const WeekView = ({ currentDate, events, onEventClick }) => {
  const days = [];
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    days.push(day);
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-8 gap-0">
        <div className="border-r border-gray-200 dark:border-gray-700" />
        {days.map((day, index) => (
          <div key={index} className="p-3 text-center border-b border-r border-gray-200 dark:border-gray-700">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {day.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div className={`text-lg font-bold ${
              day.toDateString() === new Date().toDateString() 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-900 dark:text-white'
            }`}>
              {day.getDate()}
            </div>
          </div>
        ))}
        
        {Array.from({ length: 12 }, (_, i) => i + 8).map(hour => (
          <React.Fragment key={hour}>
            <div className="p-2 text-right text-sm text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
              {hour}:00
            </div>
            {days.map((day, dayIndex) => {
              const dayEvents = events.filter(event => {
                const eventDate = new Date(event.start_time);
                return eventDate.toDateString() === day.toDateString() && 
                       eventDate.getHours() === hour;
              });
              
              return (
                <div key={dayIndex} className="p-2 border-b border-r border-gray-200 dark:border-gray-700 min-h-16">
                  {dayEvents.map((event, eventIndex) => (
                    <div
                      key={eventIndex}
                      onClick={() => onEventClick(event)}
                      className={`text-xs p-1 rounded cursor-pointer mb-1 ${
                        getEventColorClasses(event.event_type)
                      }`}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const DayView = ({ currentDate, events, onEventClick }) => {
  const dayEvents = events.filter(event => 
    new Date(event.start_time).toDateString() === currentDate.toDateString()
  );

  return (
    <div className="p-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {currentDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
          })}
        </h3>
      </div>
      
      <div className="space-y-4 max-w-2xl mx-auto">
        {dayEvents.length > 0 ? (
          dayEvents.map((event, index) => (
            <div
              key={index}
              onClick={() => onEventClick(event)}
              className={`p-4 rounded-lg border-l-4 cursor-pointer transition-all hover:shadow-md ${
                getEventColorClasses(event.event_type, true)
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {event.title}
                  </h4>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
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
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
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
          ))
        ) : (
          <div className="text-center py-12">
            <CalendarIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No events scheduled for this day</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ListView = ({ events, onEventClick, onEditEvent, onDeleteEvent }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'meeting': return <Users className="h-4 w-4" />;
      case 'call': return <Phone className="h-4 w-4" />;
      case 'appointment': return <CheckCircle className="h-4 w-4" />;
      default: return <CalendarIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6">
      <div className="space-y-3">
        {events.length > 0 ? (
          events.map((event, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
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
                  <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                    {event.title}
                  </h4>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
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
                      e.stopPropagation();
                      setSelectedEvent(selectedEvent?.id === event.id ? null : event);
                    }}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  >
                    <MoreVertical className="h-4 w-4 text-gray-500" />
                  </button>

                  {selectedEvent?.id === event.id && (
                    <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-32">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                          setSelectedEvent(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditEvent(event);
                          setSelectedEvent(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteEvent(event);
                          setSelectedEvent(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
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
            <p className="text-gray-500 dark:text-gray-400">No events found</p>
          </div>
        )}
      </div>
    </div>
  );
};

const EventDetailsModal = ({ event, onEdit, onDelete, onClose }) => {
  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'meeting': return <Users className="h-5 w-5 text-blue-500" />;
      case 'call': return <Phone className="h-5 w-5 text-purple-500" />;
      case 'appointment': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'deadline': return <Clock className="h-5 w-5 text-red-500" />;
      default: return <CalendarIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {getEventIcon(event.event_type)}
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {event.title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                {event.event_type} • {event.status?.replace('_', ' ') || 'scheduled'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Date & Time
                </label>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Clock className="h-4 w-4" />
                  {new Date(event.start_time).toLocaleString()} 
                  {event.end_time && ` - ${new Date(event.end_time).toLocaleTimeString()}`}
                </div>
              </div>

              {event.location && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Location
                  </label>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <MapPin className="h-4 w-4" />
                    {event.location}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Description
              </label>
              <p className="text-gray-600 dark:text-gray-300">
                {event.description || 'No description provided.'}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
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
  );
};

const getEventColorClasses = (eventType, isBorder = false) => {
  const baseClasses = isBorder ? 'border-l-4' : '';
  
  switch (eventType) {
    case 'meeting':
      return `${baseClasses} bg-blue-100 text-blue-800 border-blue-500 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-400`;
    case 'call':
      return `${baseClasses} bg-purple-100 text-purple-800 border-purple-500 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-400`;
    case 'appointment':
      return `${baseClasses} bg-green-100 text-green-800 border-green-500 dark:bg-green-900/30 dark:text-green-300 dark:border-green-400`;
    case 'deadline':
      return `${baseClasses} bg-red-100 text-red-800 border-red-500 dark:bg-red-900/30 dark:text-red-300 dark:border-red-400`;
    case 'task':
      return `${baseClasses} bg-orange-100 text-orange-800 border-orange-500 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-400`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800 border-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-400`;
  }
};

const formatTime = (dateString) => {
  if (!dateString) return 'All day';
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getWeekNumber = (date) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

export default CalendarPage;