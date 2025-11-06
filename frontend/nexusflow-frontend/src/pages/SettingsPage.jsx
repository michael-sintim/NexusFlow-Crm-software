import React from 'react'
import { Moon, Sun, Bell, User, Shield, Database } from 'lucide-react'
import { useUIStore } from '../store/uiStore'
import { useAuth } from '../hooks/useAuth'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { authAPI } from '../services/api' // Use your API service

const SettingsPage = () => {
  const { theme, toggleTheme } = useUIStore()
  const { user, logout } = useAuth()
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
      // Use your authAPI service - it already has the correct base URL
      await authAPI.updateProfile(profile)
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
      // Use your authAPI service - it already has the correct base URL
      await authAPI.changePassword(passwords)
      setMsg('Password changed successfully')
      setPasswords({ current_password: '', new_password: '', confirm_password: '' })
      
      // Log out user after password change (security best practice)
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
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
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-r-2 border-primary-600'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
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
            <div className={`mb-4 p-3 rounded-lg ${msg.includes('success') ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'}`}>
              {msg}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Profile Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="First Name"
                  value={profile.first_name}
                  onChange={(e) => setProfile({...profile, first_name: e.target.value})}
                  placeholder="Enter your first name"
                />
                <Input
                  label="Last Name"
                  value={profile.last_name}
                  onChange={(e) => setProfile({...profile, last_name: e.target.value})}
                  placeholder="Enter your last name"
                />
                <Input
                  label="Email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  placeholder="Enter your email"
                />
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role
                  </label>
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400">
                    {user?.role || 'N/A'}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button onClick={handleProfileSave} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Preferences
              </h3>

              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Theme</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Switch between light and dark mode
                  </p>
                </div>
                <button
                  onClick={handleThemeToggle}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Email Notifications
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
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
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Security Settings
              </h3>
              
              <div className="space-y-6">
                <Input
                  label="Current Password"
                  type="password"
                  value={passwords.current_password}
                  onChange={(e) => setPasswords({...passwords, current_password: e.target.value})}
                  placeholder="Enter current password"
                />
                <Input
                  label="New Password"
                  type="password"
                  value={passwords.new_password}
                  onChange={(e) => setPasswords({...passwords, new_password: e.target.value})}
                  placeholder="Enter new password"
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={passwords.confirm_password}
                  onChange={(e) => setPasswords({...passwords, confirm_password: e.target.value})}
                  placeholder="Confirm new password"
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
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Integrations
              </h3>
              
              <div className="space-y-4">
                {['Google Calendar', 'Slack', 'Mailchimp', 'Stripe', 'Zapier'].map((integration) => (
                  <div key={integration} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{integration}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
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