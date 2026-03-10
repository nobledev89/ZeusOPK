import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import { formatDate, formatTimeAgo, formatSubscriptionStatus, calculateTrialRemaining } from '../utils/formatters'
import { X, TrendingUp, Trash2, RefreshCw, Ban, ShieldOff, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

const UserDetails = ({ user, onClose }) => {
  const [userData, setUserData] = useState(user)
  const [sessions, setSessions] = useState([])
  const [bots, setBots] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [tiers, setTiers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  useEffect(() => {
    fetchUserDetails()
  }, [])

  const fetchUserDetails = async () => {
    setLoading(true)
    try {
      // Fetch user
      const { data: userDetail, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (userError) throw userError

      // Fetch subscription tier if user has one
      let tierData = null
      if (userDetail.subscription_tier_id) {
        const { data, error } = await supabase
          .from('subscription_tiers')
          .select('id, name, max_bots')
          .eq('id', userDetail.subscription_tier_id)
          .single()
        
        if (!error) tierData = data
      }

      // Fetch game server if user has one
      let serverData = null
      if (userDetail.server_id) {
        const { data, error } = await supabase
          .from('game_servers')
          .select('id, server_name')
          .eq('id', userDetail.server_id)
          .single()
        
        if (!error) serverData = data
      }

      // Combine the data
      setUserData({
        ...userDetail,
        subscription_tiers: tierData,
        game_servers: serverData
      })

      // Fetch sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (sessionsError) throw sessionsError
      setSessions(sessionsData || [])

      // Fetch bots
      const { data: botsData, error: botsError } = await supabase
        .from('user_bots')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (botsError) throw botsError
      setBots(botsData || [])

      // Fetch audit logs
      const { data: logsData, error: logsError } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (logsError) throw logsError
      setAuditLogs(logsData || [])

      // Fetch subscription tiers
      const { data: tiersData, error: tiersError } = await supabase
        .from('subscription_tiers')
        .select('*')
        .eq('is_active', true)
        .order('display_order')

      if (tiersError) throw tiersError
      setTiers(tiersData || [])
    } catch (error) {
      console.error('Error fetching user details:', error)
      toast.error('Failed to load user details')
    } finally {
      setLoading(false)
    }
  }

  const handleResetHWID = async () => {
    if (!window.confirm('Are you sure you want to reset this user\'s HWID? They will be able to login from a new machine.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ hwid: null })
        .eq('id', userData.id)

      if (error) throw error

      // Log the action
      await supabase.from('audit_logs').insert({
        user_id: userData.id,
        action: 'hwid_reset',
        details: { admin_action: true },
        ip_address: 'admin_portal'
      })

      toast.success('HWID reset successfully')
      fetchUserDetails()
    } catch (error) {
      console.error('Error resetting HWID:', error)
      toast.error('Failed to reset HWID')
    }
  }

  const handleDeleteUser = async () => {
    if (!window.confirm(`Are you sure you want to DELETE user "${userData.username}"? This action cannot be undone!`)) {
      return
    }

    const confirmText = prompt('Type "DELETE" to confirm:')
    if (confirmText !== 'DELETE') {
      toast.error('Deletion cancelled')
      return
    }

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userData.id)

      if (error) throw error

      toast.success('User deleted successfully')
      onClose()
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
    }
  }

  const handleBanToggle = async () => {
    const action = userData.is_banned ? 'unban' : 'ban'
    const reason = userData.is_banned ? null : prompt('Enter ban reason:')
    
    if (!userData.is_banned && !reason) return

    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          is_banned: !userData.is_banned,
          ban_reason: reason 
        })
        .eq('id', userData.id)

      if (error) throw error

      await supabase.from('audit_logs').insert({
        user_id: userData.id,
        action: `user_${action}`,
        details: { reason },
        ip_address: 'admin_portal'
      })

      toast.success(`User ${action}ned successfully`)
      fetchUserDetails()
    } catch (error) {
      console.error(`Error ${action}ning user:`, error)
      toast.error(`Failed to ${action} user`)
    }
  }

  const statusInfo = formatSubscriptionStatus(userData.is_banned ? 'banned' : userData.subscription_status)

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">User Details</h1>
          <p className="text-gray-400">{userData.username}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <button
          onClick={() => setShowUpgradeModal(true)}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <TrendingUp className="w-5 h-5" />
          <span>Upgrade</span>
        </button>
        <button
          onClick={handleResetHWID}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Reset HWID</span>
        </button>
        <button
          onClick={handleBanToggle}
          className={`flex items-center justify-center space-x-2 px-4 py-3 ${userData.is_banned ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white rounded-lg transition-colors`}
        >
          {userData.is_banned ? <ShieldOff className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
          <span>{userData.is_banned ? 'Unban' : 'Ban'}</span>
        </button>
        <button
          onClick={handleDeleteUser}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <Trash2 className="w-5 h-5" />
          <span>Delete</span>
        </button>
      </div>

      {/* User Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">User Information</h2>
          <div className="space-y-3">
            <div>
              <span className="text-gray-400 text-sm">Username:</span>
              <p className="text-white font-medium">{userData.username}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Status:</span>
              <p>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full bg-${statusInfo.color}-500/20 text-${statusInfo.color}-400`}>
                  {statusInfo.text}
                </span>
              </p>
            </div>
            {userData.is_banned && (
              <div>
                <span className="text-gray-400 text-sm">Ban Reason:</span>
                <p className="text-red-400">{userData.ban_reason || 'No reason provided'}</p>
              </div>
            )}
            <div>
              <span className="text-gray-400 text-sm">HWID:</span>
              <p className="text-white font-mono text-sm break-all">{userData.hwid || 'Not set'}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Last Login:</span>
              <p className="text-white">{userData.last_login ? formatDate(userData.last_login) : 'Never'}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Created:</span>
              <p className="text-white">{formatDate(userData.created_at)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Subscription Details</h2>
          <div className="space-y-3">
            <div>
              <span className="text-gray-400 text-sm">Current Tier:</span>
              <p className="text-white font-medium">{userData.subscription_tiers?.name || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Max Bots:</span>
              <p className="text-white">{userData.subscription_tiers?.max_bots || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Selected Server:</span>
              <p className="text-white">{userData.game_servers?.server_name || 'Not selected'}</p>
            </div>
            {userData.subscription_status === 'trial' && userData.trial_started_at && (
              <div>
                <span className="text-gray-400 text-sm">Trial Status:</span>
                <p className="text-yellow-400">
                  {calculateTrialRemaining(userData.trial_started_at, userData.trial_duration_minutes)}
                </p>
              </div>
            )}
            {userData.subscription_started_at && (
              <div>
                <span className="text-gray-400 text-sm">Started:</span>
                <p className="text-white">{formatDate(userData.subscription_started_at)}</p>
              </div>
            )}
            {userData.subscription_expires_at && (
              <div>
                <span className="text-gray-400 text-sm">Expires:</span>
                <p className="text-white">{formatDate(userData.subscription_expires_at)}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 mb-6">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Active Sessions ({sessions.length})</h2>
        </div>
        <div className="p-6">
          {sessions.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No active sessions</p>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div key={session.id} className="flex justify-between items-center p-4 bg-gray-750 rounded-lg">
                  <div>
                    <p className="text-white font-mono text-sm">{session.session_token.substring(0, 32)}...</p>
                    <p className="text-gray-400 text-sm">IP: {session.ip_address}</p>
                    <p className="text-gray-400 text-sm">Last heartbeat: {formatTimeAgo(session.last_heartbeat)}</p>
                  </div>
                  <span className="text-green-400 text-sm">Active</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* User Bots */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 mb-6">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">User Bots ({bots.length})</h2>
        </div>
        <div className="p-6">
          {bots.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No bots created</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {bots.map((bot) => (
                <div key={bot.id} className="p-4 bg-gray-750 rounded-lg">
                  <p className="text-white font-medium">{bot.bot_name}</p>
                  <p className={`text-sm ${bot.is_active ? 'text-green-400' : 'text-gray-400'}`}>
                    {bot.is_active ? 'Active' : 'Inactive'}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">Created: {formatDate(bot.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
        </div>
        <div className="p-6">
          {auditLogs.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 bg-gray-750 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-white font-medium">{log.action}</p>
                      {log.details && (
                        <p className="text-gray-400 text-sm mt-1">
                          {JSON.stringify(log.details)}
                        </p>
                      )}
                    </div>
                    <span className="text-gray-400 text-sm">{formatTimeAgo(log.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal
          user={userData}
          tiers={tiers}
          onClose={() => setShowUpgradeModal(false)}
          onSuccess={() => {
            setShowUpgradeModal(false)
            fetchUserDetails()
          }}
        />
      )}
    </div>
  )
}

// Upgrade Modal Component
const UpgradeModal = ({ user, tiers, onClose, onSuccess }) => {
  const [selectedTier, setSelectedTier] = useState('')
  const [duration, setDuration] = useState('1')
  const [customDate, setCustomDate] = useState('')
  const [processing, setProcessing] = useState(false)

  const handleUpgrade = async () => {
    if (!selectedTier) {
      toast.error('Please select a subscription tier')
      return
    }

    setProcessing(true)
    try {
      let expiresAt = null

      if (duration === 'lifetime') {
        expiresAt = null
      } else if (duration === 'custom') {
        if (!customDate) {
          toast.error('Please select a custom expiry date')
          return
        }
        expiresAt = new Date(customDate).toISOString()
      } else {
        const months = parseInt(duration)
        const expiry = new Date()
        expiry.setMonth(expiry.getMonth() + months)
        expiresAt = expiry.toISOString()
      }

      const { error } = await supabase
        .from('users')
        .update({
          subscription_tier_id: selectedTier,
          subscription_status: 'active',
          subscription_started_at: new Date().toISOString(),
          subscription_expires_at: expiresAt
        })
        .eq('id', user.id)

      if (error) throw error

      // Log the action
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'subscription_upgraded',
        details: { 
          tier_id: selectedTier, 
          duration: duration === 'custom' ? customDate : duration,
          expires_at: expiresAt 
        },
        ip_address: 'admin_portal'
      })

      toast.success('Subscription upgraded successfully')
      onSuccess()
    } catch (error) {
      console.error('Error upgrading subscription:', error)
      toast.error('Failed to upgrade subscription')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Upgrade Subscription</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Select Tier
            </label>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Choose a tier...</option>
              {tiers.map((tier) => (
                <option key={tier.id} value={tier.id}>
                  {tier.name} - {tier.max_bots} bots
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="1">1 Month</option>
              <option value="3">3 Months</option>
              <option value="6">6 Months</option>
              <option value="12">12 Months</option>
              <option value="lifetime">Lifetime</option>
              <option value="custom">Custom Date</option>
            </select>
          </div>

          {duration === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Expiry Date
              </label>
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}

          <div className="flex space-x-3 mt-6">
            <button
              onClick={handleUpgrade}
              disabled={processing}
              className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              {processing ? 'Processing...' : 'Upgrade'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDetails
