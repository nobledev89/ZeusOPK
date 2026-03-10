import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import Stats from './Stats'
import { formatDate, formatSubscriptionStatus } from '../utils/formatters'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [recentUsers, setRecentUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch stats
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('subscription_status, is_banned')

      if (usersError) throw usersError

      const { data: sessions, error: sessionsError } = await supabase
        .from('sessions')
        .select('id')

      if (sessionsError) throw sessionsError

      // Calculate stats
      const totalUsers = users.length
      const activeSubscriptions = users.filter(u => u.subscription_status === 'active' && !u.is_banned).length
      const trialUsers = users.filter(u => u.subscription_status === 'trial' && !u.is_banned).length
      const bannedUsers = users.filter(u => u.is_banned).length
      const expiredSubscriptions = users.filter(u => u.subscription_status === 'expired' && !u.is_banned).length
      const activeSessions = sessions.length

      setStats({
        totalUsers,
        activeSubscriptions,
        trialUsers,
        bannedUsers,
        expiredSubscriptions,
        activeSessions
      })

      // Fetch recent users
      const { data: recent, error: recentError } = await supabase
        .from('users')
        .select('id, username, subscription_status, is_banned, created_at, subscription_tier_id')
        .order('created_at', { ascending: false })
        .limit(10)

      if (recentError) throw recentError

      // Fetch subscription tiers
      const { data: tiersData, error: tiersError } = await supabase
        .from('subscription_tiers')
        .select('id, name')

      if (tiersError) throw tiersError

      // Create lookup map
      const tiersMap = {}
      tiersData?.forEach(tier => {
        tiersMap[tier.id] = tier
      })

      // Enrich recent users with tier data
      const enrichedRecent = recent.map(user => ({
        ...user,
        subscription_tiers: user.subscription_tier_id ? tiersMap[user.subscription_tier_id] : null
      }))

      setRecentUsers(enrichedRecent)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Overview of Zeus OPK Manager system</p>
      </div>

      <Stats stats={stats} loading={loading} />

      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Recent Registrations</h2>
          <p className="text-sm text-gray-400 mt-1">Last 10 users who registered</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-750">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Registered
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-400">
                    <div className="animate-pulse">Loading...</div>
                  </td>
                </tr>
              ) : recentUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-400">
                    No users registered yet
                  </td>
                </tr>
              ) : (
                recentUsers.map((user) => {
                  const statusInfo = formatSubscriptionStatus(user.is_banned ? 'banned' : user.subscription_status)
                  return (
                    <tr key={user.id} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{user.username}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full bg-${statusInfo.color}-500/20 text-${statusInfo.color}-400`}>
                          {statusInfo.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          {user.subscription_tiers?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-400">{formatDate(user.created_at)}</div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
