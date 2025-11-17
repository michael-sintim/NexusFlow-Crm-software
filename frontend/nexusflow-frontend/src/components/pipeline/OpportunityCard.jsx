import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, User, TrendingUp, MoreVertical } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { formatCurrency, formatDate } from '../../lib/utils'

const OpportunityCard = ({ opportunity }) => {
  const { theme } = useUIStore()
  
  const themeStyles = {
    light: {
      background: {
        primary: 'bg-white',
        hover: 'hover:bg-gray-50'
      },
      border: {
        primary: 'border-gray-200'
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
        hover: 'hover:bg-gray-700/50'
      },
      border: {
        primary: 'border-gray-700'
      },
      text: {
        primary: 'text-white',
        secondary: 'text-gray-300',
        tertiary: 'text-gray-400'
      }
    }
  }

  const currentTheme = themeStyles[theme]

  const probabilityColor = opportunity.probability >= 70 
    ? 'text-green-600 dark:text-green-400' 
    : opportunity.probability >= 40 
    ? 'text-yellow-600 dark:text-yellow-400'
    : 'text-gray-600 dark:text-gray-400'

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${currentTheme.background.primary} rounded-lg p-4 shadow-sm border ${currentTheme.border.primary} cursor-pointer hover:shadow-md transition-all duration-200 group ${currentTheme.background.hover}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h4 className={`font-semibold ${currentTheme.text.primary} text-sm leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors`}>
          {opportunity.title}
        </h4>
        <button className={`p-1 rounded ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-gray-700'} transition-colors opacity-0 group-hover:opacity-100`}> 
          <MoreVertical className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* Contact Info */}
      <div className={`flex items-center text-xs ${currentTheme.text.secondary} mb-2`}>
        <User className="h-3 w-3 mr-1" />
        <span>{opportunity.contact_details?.first_name} {opportunity.contact_details?.last_name}</span>
      </div>

      {/* Value and Probability */}
      <div className="flex items-center justify-between mb-3">
        <div className={`text-sm font-semibold ${currentTheme.text.primary}`}>
          {formatCurrency(opportunity.value)}
        </div>
        <div className={`flex items-center text-xs font-medium ${probabilityColor}`}>
          <TrendingUp className="h-3 w-3 mr-1" />
          {opportunity.probability}%
        </div>
      </div>

      {/* Progress Bar */}
      <div className={`w-full ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'} rounded-full h-2 mb-3`}>
        <div
          className="bg-primary-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${opportunity.probability}%` }}
        />
      </div>

      {/* Footer */}
      <div className={`flex items-center justify-between text-xs ${currentTheme.text.tertiary}`}>
        <div className="flex items-center">
          <Calendar className="h-3 w-3 mr-1" />
          {opportunity.expected_close_date ? (
            <span>{formatDate(opportunity.expected_close_date)}</span>
          ) : (
            <span>No date</span>
          )}
        </div>
        <span className="capitalize">{opportunity.owner_name?.split(' ')[0]}</span>
      </div>
    </motion.div>
  )
}

export default OpportunityCard