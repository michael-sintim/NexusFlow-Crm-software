import React, { useState } from 'react'
import { X, Calendar, Clock } from 'lucide-react'
import { useUIStore } from '../store/uiStore'

const QuickEventModal = ({ isOpen, onClose, onSave, defaultStart, defaultEnd }) => {
  const { theme } = useUIStore()
  const [formData, setFormData] = useState({
    title: '',
    start_time: defaultStart ? defaultStart.toISOString().slice(0, 16) : '',
    end_time: defaultEnd ? defaultEnd.toISOString().slice(0, 16) : '',
    event_type: 'meeting'
  })

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
        secondary: 'bg-gray-700'
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

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.title.trim()) {
      onSave(formData)
      onClose()
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const eventTypes = [
    { value: 'meeting', label: 'Meeting' },
    { value: 'call', label: 'Call' },
    { value: 'task', label: 'Task' },
    { value: 'reminder', label: 'Reminder' }
  ]

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className={`${currentTheme.background.primary} rounded-lg w-full max-w-sm`}>
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className={`flex items-center justify-between p-4 border-b ${currentTheme.border.primary}`}>
            <h3 className={`text-lg font-semibold ${currentTheme.text.primary}`}>
              Quick Event
            </h3>
            <button
              type="button"
              onClick={onClose}
              className={`${currentTheme.text.tertiary} hover:${currentTheme.text.secondary}`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <div className="p-4 space-y-4">
            <div>
              <label className={`block text-sm font-medium ${currentTheme.text.secondary} mb-2`}>
                What are you planning?
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Event title"
                className={`w-full px-3 py-2 border ${currentTheme.border.secondary} rounded-lg ${currentTheme.background.primary} ${currentTheme.text.primary} placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-sm font-medium ${currentTheme.text.secondary} mb-2`}>
                  Start
                </label>
                <input
                  type="datetime-local"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${currentTheme.border.secondary} rounded-lg ${currentTheme.background.primary} ${currentTheme.text.primary} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${currentTheme.text.secondary} mb-2`}>
                  End
                </label>
                <input
                  type="datetime-local"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${currentTheme.border.secondary} rounded-lg ${currentTheme.background.primary} ${currentTheme.text.primary} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${currentTheme.text.secondary} mb-2`}>
                Type
              </label>
              <select
                name="event_type"
                value={formData.event_type}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${currentTheme.border.secondary} rounded-lg ${currentTheme.background.primary} ${currentTheme.text.primary} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              >
                {eventTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className={`flex justify-end space-x-3 p-4 border-t ${currentTheme.border.primary}`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-sm font-medium ${currentTheme.text.secondary} ${currentTheme.background.primary} border ${currentTheme.border.secondary} rounded-lg hover:${currentTheme.background.secondary} transition-colors`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default QuickEventModal