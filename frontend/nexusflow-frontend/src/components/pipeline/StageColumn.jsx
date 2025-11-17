import React from 'react'
import { motion } from 'framer-motion'
import { useUIStore } from '../../store/uiStore'
import OpportunityCard from './OpportunityCard'
import { formatCurrency } from '../../lib/utils'

const StageColumn = ({ stage, opportunities }) => {
  const { theme } = useUIStore()
  const totalValue = opportunities.reduce((sum, opp) => sum + parseFloat(opp.value), 0)

  const themeStyles = {
    light: {
      background: {
        primary: 'bg-gray-50'
      },
      text: {
        primary: 'text-gray-900',
        secondary: 'text-gray-500',
        tertiary: 'text-gray-400'
      }
    },
    dark: {
      background: {
        primary: 'bg-gray-800/50'
      },
      text: {
        primary: 'text-white',
        secondary: 'text-gray-400',
        tertiary: 'text-gray-500'
      }
    }
  }

  const currentTheme = themeStyles[theme]

  return (
    <div className={`${currentTheme.background.primary} rounded-xl p-4 h-full`}>
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 ${stage.color} rounded-full`} />
          <div>
            <h3 className={`font-semibold ${currentTheme.text.primary}`}>
              {stage.name}
            </h3>
            <p className={`text-sm ${currentTheme.text.secondary}`}>
              {opportunities.length} deals
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-sm font-medium ${currentTheme.text.primary}`}>
            {formatCurrency(totalValue)}
          </p>
          <p className={`text-xs ${currentTheme.text.secondary}`}>
            Total value
          </p>
        </div>
      </div>

      {/* Opportunities List */}
      <div className="space-y-3">
        {opportunities.map((opportunity, index) => (
          <motion.div
            key={opportunity.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <OpportunityCard opportunity={opportunity} />
          </motion.div>
        ))}
        
        {opportunities.length === 0 && (
          <div className={`text-center py-8 ${currentTheme.text.tertiary}`}>
            <p className="text-sm">No opportunities</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default StageColumn