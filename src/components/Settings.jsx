import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import { Save } from 'lucide-react'
import toast from 'react-hot-toast'

const Settings = () => {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')

      if (error) throw error

      // Convert array to object for easier access
      const settingsObj = {}
      data.forEach(setting => {
        settingsObj[setting.key] = setting.value
      })

      setSettings(settingsObj)
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Convert settings object to array of updates
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value
      }))

      // Update each setting
      for (const update of updates) {
        const { error } = await supabase
          .from('app_settings')
          .update({ value: update.value })
          .eq('key', update.key)

        if (error) throw error
      }

      toast.success('Settings saved successfully')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-400">Loading settings...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">System Settings</h1>
        <p className="text-gray-400">Configure global application settings</p>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="space-y-6">
          {/* Default Trial Minutes */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Default Trial Duration (Minutes)
            </label>
            <p className="text-sm text-gray-400 mb-2">
              The default trial period duration for new users
            </p>
            <input
              type="number"
              min="0"
              value={settings.default_trial_minutes || ''}
              onChange={(e) => handleChange('default_trial_minutes', e.target.value)}
              className="w-full md:w-1/2 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Session Check Interval */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Session Check Interval (Minutes)
            </label>
            <p className="text-sm text-gray-400 mb-2">
              How often the system checks for inactive sessions
            </p>
            <input
              type="number"
              min="1"
              value={settings.session_check_interval_minutes || ''}
              onChange={(e) => handleChange('session_check_interval_minutes', e.target.value)}
              className="w-full md:w-1/2 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Maintenance Mode */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Maintenance Mode
            </label>
            <p className="text-sm text-gray-400 mb-2">
              Enable maintenance mode to prevent users from logging in
            </p>
            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenance_mode === 'true'}
                  onChange={(e) => handleChange('maintenance_mode', e.target.checked ? 'true' : 'false')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-300">
                  {settings.maintenance_mode === 'true' ? 'Enabled' : 'Disabled'}
                </span>
              </label>
            </div>
          </div>

          {/* Force Update Version */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Force Update Version
            </label>
            <p className="text-sm text-gray-400 mb-2">
              Minimum required application version (users with older versions will be forced to update)
            </p>
            <input
              type="text"
              placeholder="e.g., 1.0.0"
              value={settings.force_update_version || ''}
              onChange={(e) => handleChange('force_update_version', e.target.value)}
              className="w-full md:w-1/2 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Max Login Attempts */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Max Login Attempts
            </label>
            <p className="text-sm text-gray-400 mb-2">
              Maximum number of failed login attempts before account lockout
            </p>
            <input
              type="number"
              min="1"
              value={settings.max_login_attempts || ''}
              onChange={(e) => handleChange('max_login_attempts', e.target.value)}
              className="w-full md:w-1/2 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Session Timeout */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Session Timeout (Hours)
            </label>
            <p className="text-sm text-gray-400 mb-2">
              Automatically logout inactive users after this period
            </p>
            <input
              type="number"
              min="1"
              value={settings.session_timeout_hours || ''}
              onChange={(e) => handleChange('session_timeout_hours', e.target.value)}
              className="w-full md:w-1/2 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings
