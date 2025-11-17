import React from 'react'
import { cn } from '../../lib/utils'
import { useUIStore } from '../../store/uiStore'

const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  className,
  loading = false,
  disabled,
  ...props
}, ref) => {
  const { theme } = useUIStore()

  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: cn(
      'bg-primary-500 hover:bg-primary-600 text-white focus:ring-primary-500 shadow-sm',
      theme === 'dark' && 'focus:ring-offset-gray-800'
    ),
    secondary: cn(
      theme === 'light' 
        ? 'bg-gray-100 hover:bg-gray-200 text-gray-900 focus:ring-gray-500' 
        : 'bg-gray-700 hover:bg-gray-600 text-white focus:ring-gray-500',
      theme === 'dark' && 'focus:ring-offset-gray-800'
    ),
    outline: cn(
      theme === 'light'
        ? 'border border-gray-300 hover:bg-gray-50 text-gray-700 focus:ring-primary-500'
        : 'border border-gray-600 hover:bg-gray-700 text-gray-300 focus:ring-primary-500',
      theme === 'dark' && 'focus:ring-offset-gray-800'
    ),
    ghost: cn(
      theme === 'light'
        ? 'hover:bg-gray-100 text-gray-700 focus:ring-gray-500'
        : 'hover:bg-gray-700 text-gray-300 focus:ring-gray-500',
      theme === 'dark' && 'focus:ring-offset-gray-800'
    ),
    danger: cn(
      'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500 shadow-sm',
      theme === 'dark' && 'focus:ring-offset-gray-800'
    ),
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  }

  return (
    <button
      ref={ref}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  )
})

Button.displayName = 'Button'

export default Button