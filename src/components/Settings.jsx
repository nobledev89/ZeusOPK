import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import { Save } from 'lucide-react'
import toast from 'react-hot-toast'

const Settings = () => {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState(null)

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
      // Convert settings object to array of upserts
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
        description: '' // Empty description for user-modified settings
      }))

      // Upsert each setting (insert if doesn't exist, update if exists)
      for (const update of updates) {
        const { error } = await supabase
          .from('app_settings')
          .upsert({ 
            key: update.key, 
            value: update.value,
            description: update.description 
          }, {
            onConflict: 'key'
          })

        if (error) {
          console.error(`Error saving setting "${update.key}":`, error)
          throw new Error(`Failed to save "${update.key}": ${error.message}`)
        }
      }

      // Verify settings were saved by fetching them back
      await fetchSettings()
      toast.success('Settings saved successfully and verified')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error(error.message || 'Failed to save settings. Please check console for details.')
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

  const handleTestAiConnection = async () => {
    const provider = (settings.ai_primary_provider || 'gemini').trim().toLowerCase()
    let apiKey = ''
    let model = ''
    let url = ''
    let requestOptions = null

    if (provider === 'openai') {
      apiKey = (settings.ai_openai_api_key || '').trim()
      model = (settings.ai_openai_model || 'gpt-4o-mini').trim()
      url = 'https://api.openai.com/v1/chat/completions'
      requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'You are a health check endpoint.' },
            { role: 'user', content: 'Reply with OK only.' }
          ],
          max_tokens: 8,
          temperature: 0
        })
      }
    } else if (provider === 'anthropic') {
      apiKey = (settings.ai_anthropic_api_key || '').trim()
      model = (settings.ai_anthropic_model || 'claude-3-5-haiku-latest').trim()
      url = 'https://api.anthropic.com/v1/messages'
      requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model,
          max_tokens: 8,
          temperature: 0,
          messages: [
            { role: 'user', content: 'Reply with OK only.' }
          ]
        })
      }
    } else {
      apiKey = (settings.ai_gemini_api_key || '').trim()
      model = (settings.ai_gemini_model || 'gemini-2.5-flash').trim()
      url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`
      requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: 'Reply with OK only.' }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 8,
            temperature: 0,
          },
        }),
      }
    }

    if (!apiKey) {
      toast.error(`Please enter the ${provider} API key first`)
      return
    }

    setTestingConnection(true)
    setConnectionStatus(null)

    try {
      const response = await fetch(url, requestOptions)

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        const errorMessage = data?.error?.message || data?.message || `HTTP ${response.status}`
        setConnectionStatus({ ok: false, provider, model, message: errorMessage })
        toast.error(`${provider} connection failed: ${errorMessage}`)
        return
      }

      setConnectionStatus({ ok: true, provider, model, message: 'Connection successful' })
      toast.success(`${provider} connection successful (${model})`)
    } catch (error) {
      const errorMessage = error?.message || 'Network error while testing connection'
      setConnectionStatus({ ok: false, provider, model, message: errorMessage })
      toast.error(`${provider} connection failed: ${errorMessage}`)
    } finally {
      setTestingConnection(false)
    }
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

        {/* AI Chat Settings Section */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">AI Chat Settings</h2>
          <p className="text-sm text-gray-400 mb-6">
            Configure global AI chat integration. API keys are admin-controlled to manage costs and prevent abuse.
          </p>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Primary AI Provider
                </label>
                <p className="text-sm text-gray-400 mb-2">
                  Provider to try first for every AI reply
                </p>
                <select
                  value={settings.ai_primary_provider || 'gemini'}
                  onChange={(e) => handleChange('ai_primary_provider', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="gemini">Gemini</option>
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Enable Provider Fallback
                </label>
                <p className="text-sm text-gray-400 mb-2">
                  If primary provider fails, try the next configured providers
                </p>
                <div className="flex items-center h-10">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(settings.ai_enable_provider_fallback || 'true') === 'true'}
                      onChange={(e) => handleChange('ai_enable_provider_fallback', e.target.checked ? 'true' : 'false')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-300">
                      {(settings.ai_enable_provider_fallback || 'true') === 'true' ? 'Enabled' : 'Disabled'}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Provider Fallback Order
              </label>
              <p className="text-sm text-gray-400 mb-2">
                Comma-separated priority list (example: gemini,openai,anthropic)
              </p>
              <input
                type="text"
                placeholder="gemini,openai,anthropic"
                value={settings.ai_provider_priority || ''}
                onChange={(e) => handleChange('ai_provider_priority', e.target.value)}
                className="w-full md:w-1/2 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Allow &lt;NO_REPLY&gt; Responses
              </label>
              <p className="text-sm text-gray-400 mb-2">
                If disabled, providers are required to produce a reply and will fallback to next provider on &lt;NO_REPLY&gt;
              </p>
              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(settings.ai_allow_no_reply || 'false') === 'true'}
                    onChange={(e) => handleChange('ai_allow_no_reply', e.target.checked ? 'true' : 'false')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-300">
                    {(settings.ai_allow_no_reply || 'false') === 'true' ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Conversation Quality</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Enable Conversation Memory
                  </label>
                  <p className="text-sm text-gray-400 mb-2">
                    Include recent messages from the same player as context
                  </p>
                  <div className="flex items-center h-10">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(settings.ai_context_memory_enabled || 'true') === 'true'}
                        onChange={(e) => handleChange('ai_context_memory_enabled', e.target.checked ? 'true' : 'false')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      <span className="ml-3 text-sm font-medium text-gray-300">
                        {(settings.ai_context_memory_enabled || 'true') === 'true' ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Memory Messages
                  </label>
                  <p className="text-sm text-gray-400 mb-2">
                    Number of recent lines to include as context
                  </p>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={settings.ai_context_memory_messages || ''}
                    onChange={(e) => handleChange('ai_context_memory_messages', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Memory Max Chars Per Line
                  </label>
                  <p className="text-sm text-gray-400 mb-2">
                    Trim older context lines to this length
                  </p>
                  <input
                    type="number"
                    min="20"
                    max="300"
                    value={settings.ai_context_memory_max_chars || ''}
                    onChange={(e) => handleChange('ai_context_memory_max_chars', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Avoid Repetitive Phrasing
                  </label>
                  <p className="text-sm text-gray-400 mb-2">
                    Ask AI to vary openers and sentence style
                  </p>
                  <div className="flex items-center h-10">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(settings.ai_avoid_repetitive_phrasing || 'true') === 'true'}
                        onChange={(e) => handleChange('ai_avoid_repetitive_phrasing', e.target.checked ? 'true' : 'false')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      <span className="ml-3 text-sm font-medium text-gray-300">
                        {(settings.ai_avoid_repetitive_phrasing || 'true') === 'true' ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Allow Emojis In Replies
                  </label>
                  <p className="text-sm text-gray-400 mb-2">
                    If disabled, replies are plain text without emojis
                  </p>
                  <div className="flex items-center h-10">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(settings.ai_response_emojis_enabled || 'false') === 'true'}
                        onChange={(e) => handleChange('ai_response_emojis_enabled', e.target.checked ? 'true' : 'false')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      <span className="ml-3 text-sm font-medium text-gray-300">
                        {(settings.ai_response_emojis_enabled || 'false') === 'true' ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Gemini API Key */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Gemini API Key
              </label>
              <p className="text-sm text-gray-400 mb-2">
                Your Google Gemini API key for AI chat functionality (leave empty to disable AI globally)
              </p>
              <input
                type="password"
                placeholder="Enter API key or leave empty to disable"
                value={settings.ai_gemini_api_key || ''}
                onChange={(e) => handleChange('ai_gemini_api_key', e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-gray-500 mt-2">
                Use the test button below to verify this key and model before saving.
              </p>
            </div>

            {/* Gemini Model */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Gemini Model
              </label>
              <p className="text-sm text-gray-400 mb-2">
                Default Gemini model to use (e.g., gemini-2.5-flash)
              </p>
              <input
                type="text"
                placeholder="gemini-2.5-flash"
                value={settings.ai_gemini_model || ''}
                onChange={(e) => handleChange('ai_gemini_model', e.target.value)}
                className="w-full md:w-1/2 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="pt-2 border-t border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">OpenAI</h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    OpenAI API Key
                  </label>
                  <input
                    type="password"
                    placeholder="Enter OpenAI API key"
                    value={settings.ai_openai_api_key || ''}
                    onChange={(e) => handleChange('ai_openai_api_key', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    OpenAI Model
                  </label>
                  <input
                    type="text"
                    placeholder="gpt-4o-mini"
                    value={settings.ai_openai_model || ''}
                    onChange={(e) => handleChange('ai_openai_model', e.target.value)}
                    className="w-full md:w-1/2 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Anthropic</h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Anthropic API Key
                  </label>
                  <input
                    type="password"
                    placeholder="Enter Anthropic API key"
                    value={settings.ai_anthropic_api_key || ''}
                    onChange={(e) => handleChange('ai_anthropic_api_key', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Anthropic Model
                  </label>
                  <input
                    type="text"
                    placeholder="claude-3-5-haiku-latest"
                    value={settings.ai_anthropic_model || ''}
                    onChange={(e) => handleChange('ai_anthropic_model', e.target.value)}
                    className="w-full md:w-1/2 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={handleTestAiConnection}
                disabled={testingConnection}
                className="px-5 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-700 disabled:opacity-60 text-white rounded-lg border border-gray-600 transition-colors"
              >
                {testingConnection ? 'Testing Selected Provider...' : 'Test Selected Provider'}
              </button>
              {connectionStatus && (
                <p className={`mt-3 text-sm ${connectionStatus.ok ? 'text-green-400' : 'text-red-400'}`}>
                  {connectionStatus.ok
                    ? `Connected to ${connectionStatus.provider} using ${connectionStatus.model}.`
                    : `Connection failed for ${connectionStatus.provider} (${connectionStatus.model}): ${connectionStatus.message}`}
                </p>
              )}
            </div>

            {/* AI Timeout and Limits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Request Timeout (Seconds)
                </label>
                <p className="text-sm text-gray-400 mb-2">
                  Maximum time to wait for AI response
                </p>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={settings.ai_request_timeout_seconds || ''}
                  onChange={(e) => handleChange('ai_request_timeout_seconds', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Reply Delay (Seconds)
                </label>
                <p className="text-sm text-gray-400 mb-2">
                  Delay before sending reply (appear more human)
                </p>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={settings.ai_reply_delay_seconds || ''}
                  onChange={(e) => handleChange('ai_reply_delay_seconds', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Max Input Characters
                </label>
                <p className="text-sm text-gray-400 mb-2">
                  Maximum characters to accept from user messages
                </p>
                <input
                  type="number"
                  min="50"
                  max="1000"
                  value={settings.ai_max_input_chars || ''}
                  onChange={(e) => handleChange('ai_max_input_chars', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Max Reply Characters
                </label>
                <p className="text-sm text-gray-400 mb-2">
                  Maximum characters in AI replies
                </p>
                <input
                  type="number"
                  min="50"
                  max="500"
                  value={settings.ai_max_reply_chars || ''}
                  onChange={(e) => handleChange('ai_max_reply_chars', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Max Output Tokens
                </label>
                <p className="text-sm text-gray-400 mb-2">
                  Maximum tokens for AI generation
                </p>
                <input
                  type="number"
                  min="32"
                  max="500"
                  value={settings.ai_max_output_tokens || ''}
                  onChange={(e) => handleChange('ai_max_output_tokens', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Cooldown Per User (Seconds)
                </label>
                <p className="text-sm text-gray-400 mb-2">
                  Time between replies to the same user
                </p>
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={settings.ai_cooldown_seconds || ''}
                  onChange={(e) => handleChange('ai_cooldown_seconds', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Max Replies Per User
                </label>
                <p className="text-sm text-gray-400 mb-2">
                  Maximum AI replies per user per session
                </p>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={settings.ai_max_replies_per_user || ''}
                  onChange={(e) => handleChange('ai_max_replies_per_user', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* AI System Prompt */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Default System Prompt
              </label>
              <p className="text-sm text-gray-400 mb-2">
                Instructions for AI behavior (supports Tagalog/mixed language, informal responses)
              </p>
              <textarea
                rows="6"
                value={settings.ai_system_prompt || ''}
                onChange={(e) => handleChange('ai_system_prompt', e.target.value)}
                placeholder="You are a casual Ragnarok Online player chatting with others..."
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
              />
            </div>
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
