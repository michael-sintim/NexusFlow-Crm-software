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
import { cn } from '../../lib/utils'

const Sidebar = () => {
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
    <div className="fixed inset-y-0 py-2 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="flex items-center space-x-3 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="w-8 h-8  bg-purple-700 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">NF</span>
        </div>
        <span className="text-xl font-bold text-gray-900 dark:text-white">
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
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
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
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="h-4 w-4 text-primary-600 dark:text-primary-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Today
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {new Date().getDate()}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
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