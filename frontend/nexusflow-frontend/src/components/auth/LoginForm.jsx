import React from 'react'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import Input from '../ui/Input'
import Button from '../ui/Button'

const LoginForm = () => {
  const { login, isLoading, error } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = React.useState(false)
  const [formData, setFormData] = React.useState({
    email: '', // CHANGED BACK to 'email' to match your backend
    password: ''
  })

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
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">NF</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sign in to your NexusFlow account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            <Input
              label="Email" // CHANGED BACK to "Email"
              type="email" // CHANGED BACK to "email"
              name="email" // CHANGED BACK to "email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              leftIcon={<Mail className="h-4 w-4 text-gray-400" />} // CHANGED BACK to Mail icon
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
              className="w-full bg-gradient-to-r from-primary-500 to-purple-600 hover:from-primary-600 hover:to-purple-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5"
              size="lg"
            >
              Sign In
            </Button>

            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">
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