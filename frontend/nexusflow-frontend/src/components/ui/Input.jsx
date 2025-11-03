import React from 'react'
import { cn } from '../../lib/utils'

const Input = React.forwardRef(({ 
  className, 
  type = 'text',
  error,
  label,
  helperText,
  ...props 
}, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      
      <input
        type={type}
        ref={ref}
        className={cn(
          "w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors",
          error 
            ? "border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20" 
            : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
          className
        )}
        {...props}
      />
      
      {(error || helperText) && (
        <p className={cn(
          "text-sm",
          error ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400"
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input