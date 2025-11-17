import React from 'react'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useUIStore } from '../../store/uiStore'
import { useNavigate } from 'react-router-dom'
import Input from '../ui/Input'
import Button from '../ui/Button'

const LoginForm = () => {
  const { theme } = useUIStore()
  const { login, isLoading, error } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = React.useState(false)
  const [formData, setFormData] = React.useState({
    email: '',
    password: ''
  })

  const themeStyles = {
    light: {
      background: {
        primary: 'bg-white',
        page: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50',
        error: 'bg-red-50'
      },
      border: {
        primary: 'border-gray-200',
        error: 'border-red-200'
      },
      text: {
        primary: 'text-gray-900',
        secondary: 'text-gray-600',
        error: 'text-red-600'
      }
    },
    dark: {
      background: {
        primary: 'bg-gray-800',
        page: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900',
        error: 'bg-red-900/20'
      },
      border: {
        primary: 'border-gray-700',
        error: 'border-red-800'
      },
      text: {
        primary: 'text-white',
        secondary: 'text-gray-400',
        error: 'text-red-400'
      }
    }
  }

  const currentTheme = themeStyles[theme]

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      console.log('🔐 Attempting login...', formData)
      
      // Clear any existing tokens first
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      
      console.log('📤 Sending login data:', formData)
      
      const result = await login(formData)
      console.log('✅ Login successful:', result)
      
      // Check if tokens were stored
      console.log('📦 After login - localStorage:')
      console.log('   access_token:', localStorage.getItem('access_token'))
      console.log('   refresh_token:', localStorage.getItem('refresh_token'))
      console.log('   user:', localStorage.getItem('user'))
      
      // Test if we can make an API call
      setTimeout(() => {
        testAPIAuth()
      }, 1000)
      
      navigate('/dashboard')
    } catch (err) {
      console.error('❌ Login failed:', err)
      console.log('📦 After failed login - localStorage:')
      console.log('   access_token:', localStorage.getItem('access_token'))
      console.log('   refresh_token:', localStorage.getItem('refresh_token'))
    }
  }

  // Test function to verify authentication works
  const testAPIAuth = async () => {
    try {
      const token = localStorage.getItem('access_token')
      console.log('🧪 Testing API with token:', token ? 'Present' : 'Missing')
      
      if (!token) {
        console.error('❌ No token available for API test')
        return
      }
      
      // Updated to match your actual backend endpoints
      const response = await fetch('http://localhost:8000/api/me/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      console.log('API Test Status:', response.status, response.statusText)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ API test successful! User data:', data)
      } else {
        const errorText = await response.text()
        console.error('❌ API test failed:', errorText)
      }
    } catch (error) {
      console.error('❌ API test error:', error)
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="h-dvh flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className={`${currentTheme.background.primary} rounded-2xl shadow-xl border ${currentTheme.border.primary} p-8`}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">NF</span>
            </div>
            <h1 className={`text-3xl font-bold ${currentTheme.text.primary} mb-2`}>
              Welcome back
            </h1>
            <p className={currentTheme.text.secondary}>
              Sign in to your NexusFlow account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className={`p-4 ${currentTheme.background.error} border ${currentTheme.border.error} rounded-lg`}>
                <p className={`${currentTheme.text.error} text-sm`}>{error}</p>
              </div>
            )}

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              leftIcon={<Mail className="h-4 w-4 text-gray-400" />}
              theme={theme}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                leftIcon={<Lock className="h-4 w-4 text-gray-400" />}
                theme={theme}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <Button
              type="submit"
              loading={isLoading}
              className="w-full bg-purple-700 hover:bg-purple-800 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5"
              size="lg"
            >
              Sign In
            </Button>

            <div className="text-center">
              <p className={currentTheme.text.secondary}>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors duration-200 cursor-pointer hover:underline"
                >
                  Sign up
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginForm