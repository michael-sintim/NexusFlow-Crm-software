import React from 'react'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useUIStore } from '../../store/uiStore'
import { useNavigate } from 'react-router-dom'
import Input from '../ui/Input'
import Button from '../ui/Button'

const SignupForm = () => {
  const { theme } = useUIStore()
  const { register, isLoading, error, clearError } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = React.useState(false)
  const [formErrors, setFormErrors] = React.useState({})
  const [formData, setFormData] = React.useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password2: ''
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

  // Clear errors when form data changes
  React.useEffect(() => {
    if (error) {
      clearError()
    }
    setFormErrors({})
  }, [formData, clearError])

  const validateForm = () => {
    const errors = {}
    
    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required'
    }
    
    if (!formData.last_name.trim()) {
      errors.last_name = 'Last name is required'
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid'
    }
    
    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }
    
    if (!formData.password2) {
      errors.password2 = 'Please confirm your password'
    } else if (formData.password !== formData.password2) {
      errors.password2 = 'Passwords do not match'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Clear previous errors
    clearError()
    setFormErrors({})
    
    // Client-side validation
    if (!validateForm()) {
      return
    }
    
    try {
      console.log('Attempting registration with:', formData)
      await register(formData)
      console.log('Registration successful, redirecting to dashboard...')
      navigate('/')
    } catch (err) {
      console.error('Registration error in form:', err)
      // Error is handled by the store, no need to do anything here
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear specific error when user types in that field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const goToLogin = () => {
    navigate('/login')
  }

  // Format error message for display
  const getErrorMessage = () => {
    if (!error) return null
    
    // If it's a detailed error from the backend, show it
    if (typeof error === 'object') {
      return 'Registration failed. Please check your information.'
    }
    
    // If it's a string error, show it directly
    if (typeof error === 'string') {
      return error.includes('Failed') || error.includes('error') || error.includes('Error') 
        ? error 
        : `Registration failed: ${error}`
    }
    
    // Default message
    return 'Registration failed. Please try again.'
  }

  const errorMessage = getErrorMessage()

  return (
    <div className={`min-h-screen ${currentTheme.background.page} flex items-center justify-center p-4`}>
      <div className="w-full max-w-md">
        <div className={`${currentTheme.background.primary} rounded-2xl shadow-xl border ${currentTheme.border.primary} p-8`}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">NF</span>
            </div>
            <h1 className={`text-3xl font-bold ${currentTheme.text.primary} mb-2`}>
              Create account
            </h1>
            <p className={currentTheme.text.secondary}>
              Get started with NexusFlow CRM
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMessage && (
              <div className={`p-4 ${currentTheme.background.error} border ${currentTheme.border.error} rounded-lg`}>
                <p className={`${currentTheme.text.error} text-sm font-medium`}>
                  {errorMessage}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                placeholder="First name"
                leftIcon={<User className="h-4 w-4 text-gray-400" />}
                error={formErrors.first_name}
                theme={theme}
              />
              <Input
                label="Last Name"
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                placeholder="Last name"
                error={formErrors.last_name}
                theme={theme}
              />
            </div>

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              leftIcon={<Mail className="h-4 w-4 text-gray-400" />}
              error={formErrors.email}
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
                placeholder="Create a password"
                leftIcon={<Lock className="h-4 w-4 text-gray-400" />}
                error={formErrors.password}
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

            <Input
              label="Confirm Password"
              type="password"
              name="password2"
              value={formData.password2}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
              leftIcon={<Lock className="h-4 w-4 text-gray-400" />}
              error={formErrors.password2}
              theme={theme}
            />

            <Button
              type="submit"
              loading={isLoading}
              disabled={isLoading}
              className="w-full bg-purple-700 cursor-pointer hover:bg-purple-800 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              size="lg"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className={currentTheme.text.secondary}>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={goToLogin}
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors duration-200 cursor-pointer hover:underline"
                >
                  Sign in
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className={`absolute -top-40 -right-32 w-80 h-80 ${theme === 'light' ? 'bg-blue-200' : 'bg-blue-900'} rounded-full blur-3xl opacity-30`}></div>
        <div className={`absolute -bottom-40 -left-32 w-80 h-80 ${theme === 'light' ? 'bg-purple-200' : 'bg-purple-900'} rounded-full blur-3xl opacity-30`}></div>
      </div>
    </div>
  )
}

export default SignupForm