import React from 'react'
import { Mail, Phone, Building, Calendar, MoreVertical, Edit, Trash2 } from 'lucide-react'
import { formatDate } from '../../lib/utils'
import { useDataStore } from '../../store/dataStore'

const ContactCard = ({ contact }) => {
  const { updateLastContacted } = useDataStore()

  const handleUpdateLastContacted = async () => {
    try {
      await updateLastContacted(contact.id)
    } catch (error) {
      console.error('Failed to update last contacted:', error)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-lg">
            {contact.first_name[0]}{contact.last_name[0]}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {contact.first_name} {contact.last_name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
              {contact.title || 'No title'}
            </p>
          </div>
        </div>
        
        <div className="relative">
          <button className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <Mail className="h-4 w-4 mr-2" />
          <span className="truncate">{contact.email}</span>
        </div>
        
        {contact.phone_number && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Phone className="h-4 w-4 mr-2" />
            <span>{contact.phone_number}</span>
          </div>
        )}
        
        {contact.company_name && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Building className="h-4 w-4 mr-2" />
            <span className="truncate">{contact.company_name}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <Calendar className="h-3 w-3 mr-1" />
          {contact.last_contacted ? (
            <span>Contacted {formatDate(contact.last_contacted)}</span>
          ) : (
            <span>Never contacted</span>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={handleUpdateLastContacted}
            className="px-3 py-1 text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
          >
            Contacted
          </button>
        </div>
      </div>
    </div>
  )
}

export default ContactCard