import React from 'react'
import { cn } from '../../lib/utils'
import { useUIStore } from '../../store/uiStore'

const Input = React.forwardRef(({ 
  className, 
  type = 'text',
  error,
  label,
  helperText,
  ...props 
}, ref) => {
  const { theme } = useUIStore()

  // Theme-based styles
  const themeStyles = {
    light: {
      background: {
        primary: 'bg-white',
        secondary: 'bg-gray-50',
      },
      border: {
        primary: 'border-gray-300',
        secondary: 'border-gray-200'
      },
      text: {
        primary: 'text-gray-900',
        secondary: 'text-gray-700',
        tertiary: 'text-gray-500'
      }
    },
    dark: {
      background: {
        primary: 'bg-gray-700',
        secondary: 'bg-gray-600',
      },
      border: {
        primary: 'border-gray-600',
        secondary: 'border-gray-500'
      },
      text: {
        primary: 'text-white',
        secondary: 'text-gray-300',
        tertiary: 'text-gray-400'
      }
    }
  }

  const currentTheme = themeStyles[theme]

  return (
    <div className="space-y-2">
      {label && (
        <label className={cn(
          "block text-sm font-medium",
          currentTheme.text.secondary
        )}>
          {label}
        </label>
      )}
      
      <input
        type={type}
        ref={ref}
        className={cn(
          "w-full px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors",
          error 
            ? cn(
                theme === 'light'
                  ? "border-red-300 bg-red-50"
                  : "border-red-600 bg-red-900/20",
                "text-red-900 dark:text-red-100"
              )
            : cn(
                currentTheme.border.primary,
                currentTheme.background.primary,
                currentTheme.text.primary
              ),
          className
        )}
        {...props}
      />
      
      {(error || helperText) && (
        <p className={cn(
          "text-sm",
          error 
            ? "text-red-600 dark:text-red-400" 
            : currentTheme.text.tertiary
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input