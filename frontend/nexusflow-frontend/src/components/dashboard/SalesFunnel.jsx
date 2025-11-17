import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useDataStore } from '../../store/dataStore'
import { useUIStore } from '../../store/uiStore'
import { cn } from '../../lib/utils'

const SalesFunnel = () => {
  const { opportunities, pipelineData, fetchPipelineData } = useDataStore()
  const { theme } = useUIStore()

  // Theme-based styles
  const themeStyles = {
    light: {
      background: {
        primary: 'bg-white',
        secondary: 'bg-gray-50',
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

  const calculateFunnelData = () => {
    if (pipelineData && pipelineData.length > 0) {
      return pipelineData.map(stage => ({
        stage: stage.name,
        value: stage.count,
        amount: stage.value,
        percentage: stage.percentage,
        fill: getStageColor(stage.stage),
        stageKey: stage.stage
      }))
    }
    
    const stageCounts = {
      'prospect': 0,
      'qualified': 0,
      'proposal': 0,
      'negotiation': 0,
      'closed_won': 0,
      'closed_lost': 0
    }

    const stageAmounts = {
      'prospect': 0,
      'qualified': 0,
      'proposal': 0,
      'negotiation': 0,
      'closed_won': 0,
      'closed_lost': 0
    }

    opportunities.forEach(opportunity => {
      const stage = opportunity.stage
      if (stageCounts.hasOwnProperty(stage)) {
        stageCounts[stage]++
        stageAmounts[stage] += parseFloat(opportunity.value) || 0
      }
    })

    return [
      { 
        stage: 'New Lead', 
        value: stageCounts.prospect,
        amount: stageAmounts.prospect,
        fill: '#3b82f6',
        stageKey: 'prospect'
      },
      { 
        stage: 'Qualified', 
        value: stageCounts.qualified,
        amount: stageAmounts.qualified,
        fill: '#6366f1',
        stageKey: 'qualified'
      },
      { 
        stage: 'Proposal', 
        value: stageCounts.proposal,
        amount: stageAmounts.proposal,
        fill: '#8b5cf6',
        stageKey: 'proposal'
      },
      { 
        stage: 'Negotiation', 
        value: stageCounts.negotiation,
        amount: stageAmounts.negotiation,
        fill: '#a855f7',
        stageKey: 'negotiation'
      },
      { 
        stage: 'Won!', 
        value: stageCounts.closed_won,
        amount: stageAmounts.closed_won,
        fill: '#10b981',
        stageKey: 'closed_won'
      }
    ].filter(item => item.value > 0)
  }

  const getStageColor = (stage) => {
    const colors = {
      'prospect': '#3b82f6',
      'qualified': '#6366f1',
      'proposal': '#8b5cf6',
      'negotiation': '#a855f7',
      'closed_won': '#10b981',
      'closed_lost': '#ef4444'
    }
    return colors[stage] || '#6b7280'
  }

  const chartData = calculateFunnelData()
  const totalValue = chartData.reduce((sum, stage) => sum + (stage.amount || 0), 0)
  const totalDeals = chartData.reduce((sum, stage) => sum + (stage.value || 0), 0)

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className={cn(
          "p-3 rounded-lg shadow-lg border",
          currentTheme.background.primary,
          currentTheme.border.primary
        )}>
          <p className={cn(
            "font-medium",
            currentTheme.text.primary
          )}>{label}</p>
          <p className={cn(
            "text-sm",
            currentTheme.text.secondary
          )}>
            Deals: <span className="font-medium">{data.value}</span>
          </p>
          {data.amount > 0 && (
            <p className={cn(
              "text-sm",
              currentTheme.text.secondary
            )}>
              Value: <span className="font-medium">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                }).format(data.amount)}
              </span>
            </p>
          )}
          {data.percentage && (
            <p className={cn(
              "text-sm",
              currentTheme.text.secondary
            )}>
              Pipeline: <span className="font-medium">{data.percentage}%</span>
            </p>
          )}
          <p className={cn(
            "text-xs mt-1",
            currentTheme.text.tertiary
          )}>
            {data.stage === 'Won!' ? '🎉 Celebrate these wins!' : 
             data.stage === 'New Lead' ? '📥 New opportunities to pursue' :
             `🔄 Working through ${data.stage.toLowerCase()}`}
          </p>
        </div>
      )
    }
    return null
  }

  const wonDeals = chartData.find(stage => stage.stageKey === 'closed_won')?.value || 0
  const totalPipelineDeals = chartData
    .filter(stage => !['closed_won', 'closed_lost'].includes(stage.stageKey))
    .reduce((sum, stage) => sum + stage.value, 0)
  
  const conversionRate = totalPipelineDeals > 0 ? (wonDeals / totalPipelineDeals * 100) : 0

  return (
    <div className={cn(
      "rounded-xl p-6 shadow-sm border",
      currentTheme.background.primary,
      currentTheme.border.primary
    )}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className={cn(
            "text-lg font-semibold",
            currentTheme.text.primary
          )}>
            Sales Funnel
          </h3>
          <p className={cn(
            "text-sm mt-1",
            currentTheme.text.tertiary
          )}>
            {conversionRate > 0 ? `${conversionRate.toFixed(1)}% conversion rate` : 'Track your deal progression'}
          </p>
        </div>
        <div className="text-right">
          <div className={cn(
            "text-sm",
            currentTheme.text.tertiary
          )}>Total Pipeline</div>
          <div className={cn(
            "text-lg font-semibold",
            currentTheme.text.primary
          )}>
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
            }).format(totalValue)}
          </div>
          <div className={cn(
            "text-xs",
            currentTheme.text.tertiary
          )}>
            {totalDeals} deals
          </div>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className={cn(
          "h-80 flex flex-col items-center justify-center",
          currentTheme.text.tertiary
        )}>
          <div className="text-lg mb-2">No deal data available</div>
          <div className="text-sm text-center">
            <p>Your sales funnel will appear here once you</p>
            <p>add opportunities to your pipeline.</p>
          </div>
          <button 
            onClick={fetchPipelineData}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Refresh Data
          </button>
        </div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" horizontal={false} />
              <XAxis 
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fill: theme === 'light' ? '#6b7280' : '#9ca3af', fontSize: 12 }}
                tickFormatter={(value) => value}
              />
              <YAxis 
                dataKey="stage"
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{ fill: theme === 'light' ? '#6b7280' : '#9ca3af', fontSize: 12 }}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                radius={[0, 4, 4, 0]}
                background={{ fill: theme === 'light' ? '#f3f4f6' : '#374151', radius: 4 }}
              />
            </BarChart>
          </ResponsiveContainer>
          
          {/* Stage progression indicator */}
          <div className={cn(
            "mt-4 flex justify-between items-center text-xs",
            currentTheme.text.tertiary
          )}>
            <span>New Lead</span>
            <span>→</span>
            <span>Client Needs</span>
            <span>→</span>
            <span>Negotiation</span>
            <span>→</span>
            <span>• Final Review</span>
            <span>→</span>
            <span className="text-green-600 font-medium">Won!</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default SalesFunnel