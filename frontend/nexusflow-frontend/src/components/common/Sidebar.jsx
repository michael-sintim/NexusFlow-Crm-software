import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  CheckSquare,
  BarChart3,
  Settings,
  Calendar,
  Clock,
} from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { cn } from '../../lib/utils'

const Sidebar = () => {
  const { theme } = useUIStore()

  const themeStyles = {
    light: {
      background: {
        primary: 'bg-white',
        secondary: 'bg-gray-50',
        gradient: 'from-primary-50 to-blue-50'
      },
      border: {
        primary: 'border-gray-200'
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
        secondary: 'bg-gray-700',
        gradient: 'from-gray-700 to-gray-800'
      },
      border: {
        primary: 'border-gray-700'
      },
      text: {
        primary: 'text-white',
        secondary: 'text-gray-400',
        tertiary: 'text-gray-500'
      }
    }
  }

  const currentTheme = themeStyles[theme]

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Customers', href: '/contacts', icon: Users },
    { name: 'Revenue', href: '/pipeline', icon: TrendingUp },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <div className={`fixed inset-y-0 py-2 left-0 z-50 w-64 ${currentTheme.background.primary} border-r ${currentTheme.border.primary} flex flex-col`}>
      {/* Logo */}
      <div className={`flex items-center space-x-3 p-4 border-b ${currentTheme.border.primary}`}>
        <div className="w-8 h-8 bg-purple-700 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">NF</span>
        </div>
        <span className={`text-xl font-bold ${currentTheme.text.primary}`}>
          NexusFlow
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center px-3 py-3 rounded-lg transition-colors group",
                isActive
                  ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-r-2 border-primary-600"
                  : `${currentTheme.text.secondary} hover:${theme === 'light' ? 'bg-gray-50' : 'bg-gray-700/50'} hover:${currentTheme.text.primary}`
              )
            }
          >
            <item.icon className="h-5 w-5 mr-3" />
            <span className="font-medium">
              {item.name}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Quick Calendar Stats */}
      <div className={`p-4 border-t ${currentTheme.border.primary}`}>
        <div className={`bg-gradient-to-r ${currentTheme.background.gradient} rounded-lg p-3`}>
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="h-4 w-4 text-primary-600 dark:text-primary-400" />
            <span className={`text-sm font-medium ${currentTheme.text.primary}`}>
              Today
            </span>
          </div>
          <div className={`text-2xl font-bold ${currentTheme.text.primary} mb-1`}>
            {new Date().getDate()}
          </div>
          <div className={`text-xs ${currentTheme.text.tertiary}`}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              year: 'numeric' 
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar