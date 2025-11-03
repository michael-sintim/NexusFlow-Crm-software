import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Users, Target, MessageCircle, FileText, Handshake, CheckCircle, XCircle } from 'lucide-react'
import StageColumn from './StageColumn'

const DealBoard = ({ opportunities }) => {
  const stages = [
    { 
      key: 'prospect', 
      name: 'New Lead', 
      color: 'bg-blue-500', 
      gradient: 'from-blue-500 to-blue-600',
      icon: MessageCircle,
      description: 'New leads - just started talking'
    },
    { 
      key: 'qualified', 
      name: 'Needs', 
      color: 'bg-purple-500', 
      gradient: 'from-purple-500 to-purple-600',
      icon: Users,
      description: 'Understanding what they need'
    },
    { 
      key: 'proposal', 
      name: 'Price Discussion', 
      color: 'bg-yellow-500', 
      gradient: 'from-yellow-500 to-yellow-600',
      icon: FileText,
      description: 'Talking costs and budget'
    },
    { 
      key: 'negotiation', 
      name: 'Final Review', 
      color: 'bg-orange-500', 
      gradient: 'from-orange-500 to-orange-600',
      icon: Handshake,
      description: 'They\'re making final decision'
    },
    { 
      key: 'closed_won', 
      name: 'Won!', 
      color: 'bg-green-500', 
      gradient: 'from-green-500 to-green-600',
      icon: CheckCircle,
      description: 'Celebrate - deal is closed!'
    },
    { 
      key: 'closed_lost', 
      name: 'Lost', 
      color: 'bg-red-600', 
      gradient: 'from-gray-400 to-gray-500',
      icon: XCircle,
      description: 'Learn for next time'
    },
  ]

  const getOpportunitiesByStage = (stage) => {
    return opportunities.filter(opp => opp.stage === stage)
  }

  // Calculate total metrics
  const totalValue = opportunities.reduce((sum, opp) => sum + parseFloat(opp.value || 0), 0)
  const wonValue = opportunities
    .filter(opp => opp.stage === 'closed_won')
    .reduce((sum, opp) => sum + parseFloat(opp.value || 0), 0)
  
  const activeDeals = opportunities.filter(opp => !opp.stage.includes('closed'))

  return (
    <div className="w-full space-y-6">
      {/* Quick Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">All Potential Deals</p>
              <p className="text-2xl font-bold mt-1">${(totalValue / 1000).toFixed(1)}K</p>
              <p className="text-blue-100 text-xs mt-1">{opportunities.length} total deals</p>
            </div>
            <TrendingUp className="h-8 w-8 opacity-80" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Deals You've Won</p>
              <p className="text-2xl font-bold mt-1">${(wonValue / 1000).toFixed(1)}K</p>
              <p className="text-green-100 text-xs mt-1">Celebrate your success!</p>
            </div>
            <Target className="h-8 w-8 opacity-80" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Deals in Progress</p>
              <p className="text-2xl font-bold mt-1">{activeDeals.length}</p>
              <p className="text-purple-100 text-xs mt-1">Working on right now</p>
            </div>
            <Users className="h-8 w-8 opacity-80" />
          </div>
        </motion.div>
      </div>

      {/* Simple Instructions
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full">
            <Handshake className="h-4 w-4 text-blue-600 dark:text-blue-300" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              How this works:
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Drag deals from left to right as they move forward. Click any deal to see details.
            </p>
          </div>
        </div> 
      </div> */}

      {/* Deal Stages Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
        {stages.map((stage, index) => {
          const stageOpportunities = getOpportunitiesByStage(stage.key)
          const IconComponent = stage.icon
          const stageValue = stageOpportunities.reduce((sum, opp) => sum + parseFloat(opp.value || 0), 0)
          
          return (
            <motion.div
              key={stage.key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-600 h-full flex flex-col">
                {/* Stage Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${stage.color} bg-opacity-10`}>
                      <IconComponent className={`h-4 w-4 ${stage.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {stage.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {stageOpportunities.length} deals
                      </p>
                    </div>
                  </div>
                  <div className={`w-2 h-2 ${stage.color} rounded-full`} />
                </div>

                {/* Stage Value */}
                {stageValue > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      ${(stageValue / 1000).toFixed(1)}K
                    </p>
                  </div>
                )}

                {/* What this stage means */}
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-4 flex-1">
                  {stage.description}
                </p>

                {/* Deal Preview */}
                <div className="space-y-2 mt-auto">
                  {stageOpportunities.slice(0, 3).map((opportunity, oppIndex) => (
                    <motion.div
                      key={opportunity.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (index * 0.1) + (oppIndex * 0.05) }}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {opportunity.company_name || opportunity.contact?.company || 'Unknown Company'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          ${opportunity.value ? (opportunity.value / 1000).toFixed(0) + 'K' : 'TBD'}
                        </p>
                      </div>
                      {opportunity.probability && (
                        <div className={`text-xs px-1.5 py-0.5 rounded ${
                          opportunity.probability >= 70 ? 'bg-green-100 text-green-800' :
                          opportunity.probability >= 40 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {opportunity.probability}%
                        </div>
                      )}
                    </motion.div>
                  ))}
                  
                  {stageOpportunities.length > 3 && (
                    <div className="text-center py-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      +{stageOpportunities.length - 3} more deals
                    </div>
                  )}
                  
                  {stageOpportunities.length === 0 && (
                    <div className="text-center py-4 text-gray-400 dark:text-gray-500 ">
                      <p className="text-xs">No deals here yet</p>
                      {/* <p className="text-xs mt-1">Drag deals here as they progress</p> */}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Action Footer */}
      <div className="flex justify-center pt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
        >
          <Users className="h-4 w-4" />
          <span>Add New Deal</span>
        </motion.button>
      </div>
    </div>
  )
}

export default DealBoard