import React from 'react'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { cn } from '../../lib/utils'
import { useUIStore } from '../../store/uiStore'

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  className 
}) => {
  const [mounted, setMounted] = React.useState(false)
  const { theme } = useUIStore()

  // Theme-based styles
  const themeStyles = {
    light: {
      background: {
        primary: 'bg-white',
        secondary: 'bg-gray-50',
      },
      border: {
        primary: 'border-gray-100',
        secondary: 'border-gray-200'
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

  React.useEffect(() => {
    setMounted(true)
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  }

  if (!mounted || !isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={cn(
        "relative rounded-xl shadow-xl w-full max-h-[90vh] overflow-auto",
        currentTheme.background.primary,
        sizes[size],
        className
      )}>
        {/* Header */}
        {title && (
          <div className={cn(
            "flex items-center justify-between p-6 border-b",
            currentTheme.border.secondary
          )}>
            <h2 className={cn(
              "text-lg font-semibold",
              currentTheme.text.primary
            )}>
              {title}
            </h2>
            <button
              onClick={onClose}
              className={cn(
                "p-1 rounded-lg transition-colors",
                theme === 'light' 
                  ? "hover:bg-gray-100" 
                  : "hover:bg-gray-700"
              )}
            >
              <X className={cn(
                "h-5 w-5",
                currentTheme.text.primary
              )} />
            </button>
          </div>
        )}
        
        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default Modal