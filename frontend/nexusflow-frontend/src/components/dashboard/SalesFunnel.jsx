import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const SalesFunnel = ({ opportunities = [] }) => {
  // Calculate actual funnel data from opportunities
  const calculateFunnelData = () => {
    // Count opportunities by stage
    const stageCounts = {
      'prospect': 0,
      'qualified': 0,
      'proposal': 0,
      'negotiation': 0,
      'closed_won': 0
    }

    // Count each opportunity by stage
    opportunities.forEach(opportunity => {
      if (stageCounts.hasOwnProperty(opportunity.stage)) {
        stageCounts[opportunity.stage]++
      }
    })

    // Map to chart data with proper names and colors
    return [
      { 
        stage: 'New Lead', 
        value: stageCounts.prospect, 
        fill: '#3b82f6',
        stageKey: 'prospect'
      },
      { 
        stage: 'Needs', 
        value: stageCounts.qualified, 
        fill: '#6366f1',
        stageKey: 'qualified'
      },
      { 
        stage: 'Price Discussion', 
        value: stageCounts.proposal, 
        fill: '#8b5cf6',
        stageKey: 'proposal'
      },
      { 
        stage: 'Final Review', 
        value: stageCounts.negotiation, 
        fill: '#a855f7',
        stageKey: 'negotiation'
      },
      { 
        stage: 'Won!', 
        value: stageCounts.closed_won, 
        fill: '#10b981',
        stageKey: 'closed_won'
      }
    ]
  }

  const chartData = calculateFunnelData()

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Deals: <span className="font-medium">{data.value}</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {data.stage === 'Won!' ? 'Celebrate these wins!' : 
             data.stage === 'New Lead' ? 'New opportunities to pursue' :
             `Working through ${data.stage.toLowerCase()}`}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Sales Funnel
        </h3>
        <div className="text-right">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Value</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            ${(opportunities.reduce((sum, opp) => sum + (parseFloat(opp.value) || 0), 0) / 1000).toFixed(1)}K
          </div>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
          No deal data available
        </div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="stage" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default SalesFunnel