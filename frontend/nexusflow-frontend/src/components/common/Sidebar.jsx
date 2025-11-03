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
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <div className="fixed inset-y-0 py-2 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="flex items-center space-x-3 p-4 border-b border-gray-200   dark:border-gray-700">
        <div className="w-8 h-8 bg-gradient-to-r from-primary-500  to-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm ">NF</span>
        </div>
        <span className="text-xl font-bold  text-gray-900 dark:text-white ">
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
    </div>
  )
}

export default Sidebar