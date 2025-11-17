import React, { useState } from 'react'
import { Bell, Search, Moon, Sun, LogOut, X } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useAuth } from '../../hooks/useAuth'
import { useDataStore } from '../../store/dataStore'

const Header = () => {
  const { theme } = useUIStore()
  const { theme: currentTheme, toggleTheme } = useUIStore()
  const { user, logout } = useAuth()
  const { unreadCount, notifications } = useDataStore()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const themeStyles = {
    light: {
      background: {
        primary: 'bg-white',
        secondary: 'bg-gray-100',
        modal: 'bg-white',
        overlay: 'bg-black/50'
      },
      border: {
        primary: 'border-gray-200',
        secondary: 'border-gray-300'
      },
      text: {
        primary: 'text-gray-900',
        secondary: 'text-gray-600',
        tertiary: 'text-gray-500'
      },
      button: {
        hover: 'hover:bg-gray-100'
      }
    },
    dark: {
      background: {
        primary: 'bg-gray-800',
        secondary: 'bg-gray-700',
        modal: 'bg-gray-800',
        overlay: 'bg-black/50'
      },
      border: {
        primary: 'border-gray-700',
        secondary: 'border-gray-600'
      },
      text: {
        primary: 'text-white',
        secondary: 'text-gray-400',
        tertiary: 'text-gray-500'
      },
      button: {
        hover: 'hover:bg-gray-700'
      }
    }
  }

  const styles = themeStyles[theme]

  const handleLogoutClick = () => {
    setShowLogoutModal(true)
  }

  const handleConfirmLogout = () => {
    setShowLogoutModal(false)
    logout()
  }

  const handleCancelLogout = () => {
    setShowLogoutModal(false)
  }

  const getUserInitials = () => {
    if (!user) return 'U'
    const first = user.first_name?.[0] || ''
    const last = user.last_name?.[0] || ''
    return `${first}${last}`.toUpperCase() || 'U'
  }

  const getFullName = () => {
    if (!user) return 'User'
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User'
  }

  return (
    <>
      <header className={`${styles.background.primary} border-b ${styles.border.primary} px-6 py-4`}>
        <div className="flex items-center justify-between">
          {/* Left Section - Search */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className={`pl-10 pr-4 py-2 border ${styles.border.secondary} rounded-lg ${styles.background.primary} ${styles.text.primary} focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64`}
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${styles.button.hover} transition-colors`}
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button className={`p-2 rounded-lg ${styles.button.hover} transition-colors`}>
                <Bell className="h-5 w-5" />
              </button>
            </div>

            {/* User Menu */}
            <div className={`flex items-center space-x-3 border-l ${styles.border.primary} pl-4`}>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-700 rounded-full flex items-center justify-center text-white font-medium text-sm">
                  {getUserInitials()}
                </div>
                <div className="hidden md:block text-left">
                  <p className={`text-sm font-medium ${styles.text.primary}`}>
                    {getFullName()}
                  </p>
                  <p className={`text-xs ${styles.text.secondary} capitalize`}>
                    {user?.role || 'User'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleLogoutClick}
                className={`p-2 rounded-lg ${styles.button.hover} transition-colors ${styles.text.secondary} hover:${styles.text.primary}`}
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className={`fixed inset-0 ${styles.background.overlay} flex items-center justify-center z-50`}>
          <div className={`${styles.background.modal} rounded-lg shadow-lg p-6 max-w-sm w-full mx-4`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-semibold ${styles.text.primary}`}>
                Confirm Logout
              </h2>
              <button
                onClick={handleCancelLogout}
                className={`p-1 rounded-lg ${styles.button.hover} transition-colors`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <p className={`${styles.text.secondary} mb-6`}>
              Are you sure you want to logout? You will need to login again to access your account.
            </p>

            {/* Modal Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleCancelLogout}
                className={`flex-1 px-4 py-2 border ${styles.border.secondary} ${styles.text.secondary} rounded-lg ${styles.button.hover} transition-colors font-medium`}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Header