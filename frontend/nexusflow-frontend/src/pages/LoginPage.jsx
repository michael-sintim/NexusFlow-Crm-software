import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useUIStore } from '../store/uiStore'
import LoginForm from '../components/auth/LoginForm'
import SignupForm from '../components/auth/SignupForm'

const LoginPage = () => {
  const { theme } = useUIStore()
  const { isAuthenticated } = useAuth()
  const [isLogin, setIsLogin] = React.useState(true)

  // Theme-based background gradients
  const backgroundGradient = theme === 'light' 
    ? 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    : 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className={`h-dvh ${backgroundGradient} flex items-center justify-center p-4`}>
      <div className="w-full max-w-md">
        {isLogin ? (
          <LoginForm onToggleMode={() => setIsLogin(false)} />
        ) : (
          <SignupForm onToggleMode={() => setIsLogin(true)} />
        )}
      </div>
      
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className={`absolute -top-40 -right-32 w-80 h-80 ${theme === 'light' ? 'bg-blue-200' : 'bg-blue-900'} rounded-full blur-3xl opacity-30`}></div>
        <div className={`absolute -bottom-40 -left-32 w-80 h-80 ${theme === 'light' ? 'bg-purple-200' : 'bg-purple-900'} rounded-full blur-3xl opacity-30`}></div>
      </div>
    </div>
  )
}

export default LoginPage