import React from 'react'
import { Outlet } from 'react-router-dom'
import { useUIStore } from '../store/uiStore'
import Sidebar from './Sidebar'
import Header from './Header'

const Layout = () => {
  const { theme } = useUIStore()

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

  return (
    <div className={`flex h-screen ${currentTheme.background.page}`}>
      <Sidebar />
      
      <div className="flex-1 flex flex-col ml-64">
        <Header />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout