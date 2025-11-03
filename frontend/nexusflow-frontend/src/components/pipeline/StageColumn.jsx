import React from 'react'
import { motion } from 'framer-motion'
import OpportunityCard from './OpportunityCard'
import { formatCurrency } from '../../lib/utils'

const StageColumn = ({ stage, opportunities }) => {
  const totalValue = opportunities.reduce((sum, opp) => sum + parseFloat(opp.value), 0)

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 ${stage.color} rounded-full`} />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {stage.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {opportunities.length} deals
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {formatCurrency(totalValue)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
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
          <div className="text-center py-8 text-gray-400 dark:text-gray-500">
            <p className="text-sm">No opportunities</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default StageColumn