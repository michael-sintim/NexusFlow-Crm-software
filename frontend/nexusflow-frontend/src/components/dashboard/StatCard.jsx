import React from 'react'
import { TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react'
import { cn } from '../../lib/utils'

const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', // 'positive', 'negative', 'neutral'
  icon: Icon,
  color = 'primary',
  format = 'number',
  trendDescription = 'from last period',
  showTrend = true
}) => {
  const colorSchemes = {
    primary: {
      gradient: 'from-primary-500 via-primary-600 to-primary-700',
      light: 'bg-primary-50 dark:bg-primary-900/20',
      border: 'border-primary-100 dark:border-primary-800',
      glow: 'shadow-primary-500/10'
    },
    green: {
      gradient: 'from-green-500 via-green-600 to-green-700',
      light: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-100 dark:border-green-800',
      glow: 'shadow-green-500/10'
    },
    blue: {
      gradient: 'from-blue-500 via-blue-600 to-blue-700',
      light: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-100 dark:border-blue-800',
      glow: 'shadow-blue-500/10'
    },
    purple: {
      gradient: 'from-purple-500 via-purple-600 to-purple-700',
      light: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-100 dark:border-purple-800',
      glow: 'shadow-purple-500/10'
    },
    orange: {
      gradient: 'from-orange-500 via-orange-600 to-orange-700',
      light: 'bg-orange-50 dark:bg-orange-900/20',
      border: 'border-orange-100 dark:border-orange-800',
      glow: 'shadow-orange-500/10'
    },
  }

  const changeConfig = {
    positive: {
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-900/30',
      border: 'border-green-200 dark:border-green-800',
      glow: 'shadow-green-500/20'
    },
    negative: {
      icon: TrendingDown,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/30',
      border: 'border-red-200 dark:border-red-800',
      glow: 'shadow-red-500/20'
    },
    neutral: {
      icon: Minus,
      color: 'text-gray-600 dark:text-gray-400',
      bg: 'bg-gray-50 dark:bg-gray-800',
      border: 'border-gray-200 dark:border-gray-700',
      glow: 'shadow-gray-500/20'
    },
  }

  const formatValue = (val) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: val >= 1000000 ? 1 : 0,
      }).format(val)
    }
    if (format === 'percent') {
      return `${val}%`
    }
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(1)}M`
    }
    if (val >= 1000) {
      return `${(val / 1000).toFixed(0)}K`
    }
    return val.toLocaleString()
  }

  const CurrentChangeConfig = changeConfig[changeType]
  const CurrentColorScheme = colorSchemes[color]
  const ChangeIcon = CurrentChangeConfig.icon

  return (
    <div className={cn(
      "group relative bg-white dark:bg-gray-900 rounded-2xl p-6 border transition-all duration-500 hover:scale-[1.02] h-full flex flex-col justify-between",
      "shadow-sm hover:shadow-2xl backdrop-blur-sm",
      CurrentColorScheme.border,
      "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/50 before:to-transparent before:dark:from-gray-800/50 before:pointer-events-none"
    )}>
      {/* Animated background gradient */}
      <div className={cn(
        "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
        CurrentColorScheme.gradient
      )} />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1 pr-4">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3 tracking-wide uppercase">
              {title}
            </p>
            <p className={cn(
              "font-bold text-gray-900 dark:text-white leading-none tracking-tight",
              format === 'currency' && value >= 1000000 ? "text-2xl" : "text-3xl",
              "bg-gradient-to-r bg-clip-text text-transparent",
              "from-gray-900 via-gray-800 to-gray-900",
              "dark:from-white dark:via-gray-200 dark:to-white"
            )}>
              {formatValue(value)}
            </p>
          </div>

          {Icon && (
            <div className={cn(
              "relative p-3 rounded-xl bg-gradient-to-br text-white flex items-center justify-center shrink-0",
              "shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110",
              CurrentColorScheme.gradient,
              CurrentColorScheme.glow
            )}>
              <Icon className="h-5 w-5" />
              {/* Icon glow effect */}
              <div className="absolute inset-0 rounded-xl bg-white/20 blur-sm" />
            </div>
          )}
        </div>

        {/* Trend Indicator */}
        {showTrend && change !== undefined && (
          <div className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300",
            "group-hover:shadow-md backdrop-blur-sm",
            CurrentChangeConfig.bg,
            CurrentChangeConfig.border,
            CurrentChangeConfig.glow
          )}>
            <div className={cn(
              "flex items-center justify-center w-6 h-6 rounded-full",
              CurrentChangeConfig.bg
            )}>
              <ChangeIcon className={cn("h-3 w-3", CurrentChangeConfig.color)} />
            </div>
            
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <span className={cn(
                "text-sm font-semibold tracking-wide",
                CurrentChangeConfig.color
              )}>
                {change > 0 ? '+' : ''}{change}%
              </span>
              
              {changeType === 'positive' && change > 15 && (
                <Sparkles className="h-3 w-3 text-yellow-500" />
              )}
              
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide truncate ml-1">
                {trendDescription}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Subtle hover effect border */}
      <div className={cn(
        "absolute inset-0 rounded-2xl border-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
        CurrentColorScheme.border.replace('100', '200').replace('800', '600')
      )} />

      {/* Corner accents */}
      <div className={cn(
        "absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
        CurrentColorScheme.gradient
      )} />
      <div className={cn(
        "absolute bottom-0 left-0 w-8 h-8 bg-gradient-to-tr rounded-bl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
        CurrentColorScheme.gradient
      )} />
    </div>
  )
}

export default StatCard