import React from 'react'
import { Moon, Sun, Bell, User, Shield, Database } from 'lucide-react'
import { useUIStore } from '../store/uiStore'
import { useAuth } from '../hooks/useAuth'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { authAPI } from '../services/api'

const SettingsPage = () => {
  const { theme } = useUIStore()
  const { theme: currentTheme, toggleTheme } = useUIStore()
  const { user, logout, updateProfile } = useAuth()
  const [activeTab, setActiveTab] = React.useState('profile')
  const [loading, setLoading] = React.useState(false)
  const [msg, setMsg] = React.useState('')
  const [emailNotifs, setEmailNotifs] = React.useState(true)
  
  const [profile, setProfile] = React.useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || ''
  })
  
  const [passwords, setPasswords] = React.useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })

  // Theme-based styles
  const themeStyles = {
    light: {
      background: {
        primary: 'bg-white',
        secondary: 'bg-gray-50',
        page: 'bg-gray-50',
        active: 'bg-primary-50',
        error: 'bg-red-50',
        success: 'bg-green-50'
      },
      border: {
        primary: 'border-gray-200',
        secondary: 'border-gray-300',
        active: 'border-primary-600',
        error: 'border-red-200',
        success: 'border-green-200'
      },
      text: {
        primary: 'text-gray-900',
        secondary: 'text-gray-600',
        tertiary: 'text-gray-500',
        label: 'text-gray-700',
        error: 'text-red-800',
        success: 'text-green-800'
      },
      button: {
        background: 'bg-gray-100',
        hover: 'hover:bg-gray-200'
      }
    },
    dark: {
      background: {
        primary: 'bg-gray-800',
        secondary: 'bg-gray-700/50',
        page: 'bg-gray-900',
        active: 'bg-primary-900/20',
        error: 'bg-red-900/20',
        success: 'bg-green-900/20'
      },
      border: {
        primary: 'border-gray-700',
        secondary: 'border-gray-600',
        active: 'border-primary-400',
        error: 'border-red-800',
        success: 'border-green-800'
      },
      text: {
        primary: 'text-white',
        secondary: 'text-gray-300',
        tertiary: 'text-gray-400',
        label: 'text-gray-300',
        error: 'text-red-400',
        success: 'text-green-400'
      },
      button: {
        background: 'bg-gray-700',
        hover: 'hover:bg-gray-600'
      }
    }
  }

  const styles = themeStyles[theme]

  React.useEffect(() => {
    setProfile({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || ''
    })
  }, [user])

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'preferences', name: 'Preferences', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'integrations', name: 'Integrations', icon: Database },
  ]

  const handleProfileSave = async () => {
    setLoading(true)
    setMsg('')
    try {
      await updateProfile(profile)
      setMsg('Profile updated successfully')
    } catch (err) {
      setMsg(err.response?.data?.detail || 'Failed to update profile')
    }
    setLoading(false)
  }

  const handlePasswordChange = async () => {
    if (passwords.new_password !== passwords.confirm_password) {
      setMsg('Passwords do not match')
      return
    }
    
    setLoading(true)
    setMsg('')
    try {
      await authAPI.changePassword(passwords)
      setMsg('Password changed successfully')
      setPasswords({ current_password: '', new_password: '', confirm_password: '' })
      
      setTimeout(() => {
        logout()
      }, 2000)
      
    } catch (err) {
      const errData = err.response?.data
      setMsg(errData?.current_password?.[0] || errData?.new_password?.[0] || errData?.confirm_password?.[0] || errData?.detail || 'Failed to change password')
    }
    setLoading(false)
  }

  const handleThemeToggle = () => {
    toggleTheme()
  }

  const handleNotifToggle = () => {
    setEmailNotifs(!emailNotifs)
  }

  const hasProfileChanges = () => {
    return (
      profile.first_name !== user?.first_name ||
      profile.last_name !== user?.last_name ||
      profile.email !== user?.email
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${styles.text.primary}`}>Settings</h1>
        <p className={`${styles.text.secondary} mt-2`}>
          Manage your account settings and preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => {setActiveTab(tab.id); setMsg('')}}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? `${styles.background.active} ${styles.text.primary} border-r-2 ${styles.border.active}`
                      : `${styles.text.secondary} hover:${styles.background.secondary} hover:${styles.text.primary}`
                  }`}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="flex-1">
          {msg && (
            <div className={`mb-4 p-3 rounded-lg ${
              msg.includes('success') 
                ? `${styles.background.success} ${styles.text.success}` 
                : `${styles.background.error} ${styles.text.error}`
            }`}>
              {msg}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className={`${styles.background.primary} rounded-xl p-6 shadow-sm border ${styles.border.primary}`}>
              <h3 className={`text-lg font-semibold ${styles.text.primary} mb-6`}>
                Profile Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="First Name"
                  value={profile.first_name}
                  onChange={(e) => setProfile({...profile, first_name: e.target.value})}
                  placeholder="Enter your first name"
                  theme={theme}
                />
                <Input
                  label="Last Name"
                  value={profile.last_name}
                  onChange={(e) => setProfile({...profile, last_name: e.target.value})}
                  placeholder="Enter your last name"
                  theme={theme}
                />
                <Input
                  label="Email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  placeholder="Enter your email"
                  theme={theme}
                />
                <div className="flex flex-col">
                  <label className={`text-sm font-medium ${styles.text.label} mb-2`}>
                    Role
                  </label>
                  <div className={`px-3 py-2 ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-700'} rounded-lg ${styles.text.tertiary}`}>
                    {user?.role || 'N/A'}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button 
                  onClick={handleProfileSave} 
                  disabled={loading || !hasProfileChanges()}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className={`${styles.background.primary} rounded-xl p-6 shadow-sm border ${styles.border.primary} space-y-6`}>
              <h3 className={`text-lg font-semibold ${styles.text.primary}`}>
                Preferences
              </h3>

              <div className={`flex items-center justify-between p-4 border ${styles.border.primary} rounded-lg`}>
                <div>
                  <p className={`font-medium ${styles.text.primary}`}>Theme</p>
                  <p className={`text-sm ${styles.text.secondary}`}>
                    Switch between light and dark mode
                  </p>
                </div>
                <button
                  onClick={handleThemeToggle}
                  className={`p-2 rounded-lg ${styles.button.background} ${styles.button.hover} transition-colors`}
                >
                  {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </button>
              </div>

              <div className={`flex items-center justify-between p-4 border ${styles.border.primary} rounded-lg`}>
                <div>
                  <p className={`font-medium ${styles.text.primary}`}>
                    Email Notifications
                  </p>
                  <p className={`text-sm ${styles.text.secondary}`}>
                    Receive email updates for important activities
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={emailNotifs}
                    onChange={handleNotifToggle}
                  />
                  <div className={`w-11 h-6 ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600`}></div>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className={`${styles.background.primary} rounded-xl p-6 shadow-sm border ${styles.border.primary}`}>
              <h3 className={`text-lg font-semibold ${styles.text.primary} mb-6`}>
                Security Settings
              </h3>
              
              <div className="space-y-6">
                <Input
                  label="Current Password"
                  type="password"
                  value={passwords.current_password}
                  onChange={(e) => setPasswords({...passwords, current_password: e.target.value})}
                  placeholder="Enter current password"
                  theme={theme}
                />
                <Input
                  label="New Password"
                  type="password"
                  value={passwords.new_password}
                  onChange={(e) => setPasswords({...passwords, new_password: e.target.value})}
                  placeholder="Enter new password"
                  theme={theme}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={passwords.confirm_password}
                  onChange={(e) => setPasswords({...passwords, confirm_password: e.target.value})}
                  placeholder="Confirm new password"
                  theme={theme}
                />
              </div>

              <div className="flex justify-end mt-6">
                <Button onClick={handlePasswordChange} disabled={loading}>
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className={`${styles.background.primary} rounded-xl p-6 shadow-sm border ${styles.border.primary}`}>
              <h3 className={`text-lg font-semibold ${styles.text.primary} mb-6`}>
                Integrations
              </h3>
              
              <div className="space-y-4">
                {['Google Calendar', 'Slack', 'Mailchimp', 'Stripe', 'Zapier'].map((integration) => (
                  <div key={integration} className={`flex items-center justify-between p-4 border ${styles.border.primary} rounded-lg`}>
                    <div>
                      <p className={`font-medium ${styles.text.primary}`}>{integration}</p>
                      <p className={`text-sm ${styles.text.secondary}`}>
                        Connect your {integration} account
                      </p>
                    </div>
                    <Button variant="outline" size="sm">Connect</Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SettingsPage