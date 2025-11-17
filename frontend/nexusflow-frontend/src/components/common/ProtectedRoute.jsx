import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useUIStore } from '../../store/uiStore'

const ProtectedRoute = ({ children }) => {
  const { theme } = useUIStore()
  const { isAuthenticated, isLoading } = useAuth()

  const themeStyles = {
    light: {
      background: {
        page: 'bg-gray-50'
      }
    },
    dark: {
      background: {
        page: 'bg-gray-900'
      }
    }
  }

  const currentTheme = themeStyles[theme]

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${currentTheme.background.page}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute