import React from 'react'
import EventForm from './EventForm'

const EventModal = ({ isOpen, onClose, event, onSave }) => {
  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <EventForm 
          event={event}
          onSave={onSave}
          onCancel={onClose}
        />
      </div>
    </div>
  )
}

export default EventModal