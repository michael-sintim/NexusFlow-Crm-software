import React, { useState, useRef, useEffect } from 'react'
import { Mail, Phone, Building, Calendar, MoreVertical, Edit, Trash2, Eye } from 'lucide-react'
import { formatDate } from '../../lib/utils'
import { useDataStore } from '../../store/dataStore'
import { useUIStore } from '../../store/uiStore'
import { useNavigate } from 'react-router-dom'

const ContactCard = ({ contact, onUpdate }) => {
  const { theme } = useUIStore()
  const [showMenu, setShowMenu] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const menuRef = useRef(null)
  const { updateLastContacted, deleteContact } = useDataStore()
  const navigate = useNavigate()

  // Theme-based styles
  const themeStyles = {
    light: {
      background: {
        primary: 'bg-white',
        secondary: 'bg-gray-50',
        hover: 'hover:bg-gray-50'
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
        secondary: 'bg-gray-750',
        hover: 'hover:bg-gray-700'
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleUpdateLastContacted = async (e) => {
    e.stopPropagation()
    try {
      await updateLastContacted(contact.id)
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Failed to update last contacted:', error)
    }
  }

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!window.confirm(`Delete ${contact.first_name} ${contact.last_name}?`)) return
    
    setIsDeleting(true)
    try {
      await deleteContact(contact.id)
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Failed to delete contact:', error)
      alert('Failed to delete contact')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div 
      onClick={() => navigate(`/contacts/${contact.id}`)}
      className={`${currentTheme.background.primary} rounded-xl p-6 shadow-sm border ${currentTheme.border.primary} ${currentTheme.background.hover} transition-all duration-200 group cursor-pointer`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-lg">
            {contact.first_name[0]}{contact.last_name[0]}
          </div>
          <div>
            <h3 className={`font-semibold ${currentTheme.text.primary}`}>
              {contact.first_name} {contact.last_name}
            </h3>
            <p className={`text-sm ${currentTheme.text.secondary}`}>
              {contact.title || 'No title'}
            </p>
          </div>
        </div>
        
        <div className="relative" ref={menuRef}>
          <button 
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
            className={`p-1 rounded-lg ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-gray-700'} transition-colors opacity-0 group-hover:opacity-100`}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          
          {showMenu && (
            <div className={`absolute right-0 mt-2 w-48 ${currentTheme.background.primary} rounded-lg shadow-lg border ${currentTheme.border.primary} py-1 z-10`}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/contacts/${contact.id}`)
                }}
                className={`w-full px-4 py-2 text-left text-sm ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-gray-700'} flex items-center`}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/contacts/${contact.id}/edit`)
                }}
                className={`w-full px-4 py-2 text-left text-sm ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-gray-700'} flex items-center`}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={`w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 ${theme === 'light' ? 'hover:bg-red-50' : 'hover:bg-red-900/20'} flex items-center`}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className={`flex items-center text-sm ${currentTheme.text.secondary}`}>
          <Mail className="h-4 w-4 mr-2" />
          <span className="truncate">{contact.email}</span>
        </div>
        
        {contact.phone_number && (
          <div className={`flex items-center text-sm ${currentTheme.text.secondary}`}>
            <Phone className="h-4 w-4 mr-2" />
            <span>{contact.phone_number}</span>
          </div>
        )}
        
        {contact.company_name && (
          <div className={`flex items-center text-sm ${currentTheme.text.secondary}`}>
            <Building className="h-4 w-4 mr-2" />
            <span className="truncate">{contact.company_name}</span>
          </div>
        )}
      </div>

      <div className={`flex items-center justify-between pt-4 border-t ${currentTheme.border.primary}`}>
        <div className={`flex items-center text-xs ${currentTheme.text.tertiary}`}>
          <Calendar className="h-3 w-3 mr-1" />
          {contact.last_contacted ? (
            <span>Contacted {formatDate(contact.last_contacted)}</span>
          ) : (
            <span>Never contacted</span>
          )}
        </div>
        
        <button
          onClick={handleUpdateLastContacted}
          className={`px-3 py-1 text-xs ${theme === 'light' ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-blue-900/20 text-blue-400 hover:bg-blue-900/30'} rounded-lg transition-colors`}
        >
          Contacted
        </button>
      </div>
    </div>
  )
}

export default ContactCard