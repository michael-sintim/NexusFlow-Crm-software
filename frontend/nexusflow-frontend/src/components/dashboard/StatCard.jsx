import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '../../lib/utils'

const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', // 'positive', 'negative', 'neutral'
  icon: Icon,
  color = 'primary',
  format = 'number'
}) => {
  const colors = {
    primary: 'from-primary-500 to-primary-600',
    green: 'from-green-500 to-green-600',
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  }

  const changeIcons = {
    positive: <TrendingUp className="h-4 w-4" />,
    negative: <TrendingDown className="h-4 w-4" />,
    neutral: <Minus className="h-4 w-4" />,
  }

  const changeColors = {
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400',
  }

  const formatValue = (val) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
      }).format(val)
    }
    if (format === 'percent') {
      return `${val}%`
    }
    return val.toLocaleString()
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 pr-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 leading-tight">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
            {formatValue(value)}
          </p>
        </div>

        {Icon && (
          <div className={cn(
            "p-3 rounded-2xl bg-gradient-to-br text-white flex items-center justify-center shrink-0",
            colors[color]
          )}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      {change !== undefined && (
        <div className={cn("flex items-center text-sm mt-3", changeColors[changeType])}>
          {changeIcons[changeType]}
          <span className="ml-1 font-medium">{Math.abs(change)}%</span>
          <span className="ml-1 text-gray-500 dark:text-gray-400">
            from last period
          </span>
        </div>
      )}
    </div>
  )
}

export default StatCard
