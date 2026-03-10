import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import { formatDate, formatSubscriptionStatus } from '../utils/formatters'
import { Search, Eye, Ban, ShieldOff } from 'lucide-react'
import toast from 'react-hot-toast'
import UserDetails from './UserDetails'

const UserList = () => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [searchTerm, statusFilter, users])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (usersError) throw usersError

      // Fetch subscription tiers
      const { data: tiersData, error: tiersError } = await supabase
        .from('subscription_tiers')
        .select('id, name')

      if (tiersError) throw tiersError

      // Fetch game servers
      const { data: serversData, error: serversError } = await supabase
        .from('game_servers')
        .select('id, server_name')

      if (serversError) throw serversError

      // Create lookup maps
      const tiersMap = {}
      tiersData?.forEach(tier => {
        tiersMap[tier.id] = tier
      })

      const serversMap = {}
      serversData?.forEach(server => {
        serversMap[server.id] = server
      })

      // Combine the data
      const enrichedUsers = usersData.map(user => ({
        ...user,
        subscription_tiers: user.subscription_tier_id ? tiersMap[user.subscription_tier_id] : null,
        game_servers: user.server_id ? serversMap[user.server_id] : null
      }))

      setUsers(enrichedUsers)
      setFilteredUsers(enrichedUsers)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.hwid && user.hwid.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => {
        if (statusFilter === 'banned') return user.is_banned
        if (statusFilter === 'active') return user.subscription_status === 'active' && !user.is_banned
        if (statusFilter === 'trial') return user.subscription_status === 'trial' && !user.is_banned
        if (statusFilter === 'expired') return user.subscription_status === 'expired' && !user.is_banned
        return true
      })
    }

    setFilteredUsers(filtered)
  }

  const handleBanUser = async (userId, currentBanStatus) => {
    const action = currentBanStatus ? 'unban' : 'ban'
    const reason = currentBanStatus ? null : prompt('Enter ban reason:')
    
    if (!currentBanStatus && !reason) return

    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          is_banned: !currentBanStatus,
          ban_reason: reason 
        })
        .eq('id', userId)

      if (error) throw error

      // Log the action
      await supabase.from('audit_logs').insert({
        user_id: userId,
        action: `user_${action}`,
        details: { reason },
        ip_address: 'admin_portal'
      })

      toast.success(`User ${action}ned successfully`)
      fetchUsers()
    } catch (error) {
      console.error(`Error ${action}ning user:`, error)
      toast.error(`Failed to ${action} user`)
    }
  }

  const handleViewDetails = (user) => {
    setSelectedUser(user)
    setShowDetails(true)
  }

  const handleCloseDetails = () => {
    setShowDetails(false)
    setSelectedUser(null)
    fetchUsers() // Refresh data
  }

  if (showDetails && selectedUser) {
    return <UserDetails user={selectedUser} onClose={handleCloseDetails} />
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
        <p className="text-gray-400">Manage all registered users</p>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Search Users</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by username or HWID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Users</option>
              <option value="trial">Trial</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="banned">Banned</option>
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-400">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
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
                  Server
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                    <div className="animate-pulse">Loading users...</div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const statusInfo = formatSubscriptionStatus(user.is_banned ? 'banned' : user.subscription_status)
                  return (
                    <tr key={user.id} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{user.username}</div>
                        {user.hwid && (
                          <div className="text-xs text-gray-500 font-mono">{user.hwid.substring(0, 16)}...</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full bg-${statusInfo.color}-500/20 text-${statusInfo.color}-400`}>
                          {statusInfo.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {user.subscription_tiers?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {user.game_servers?.server_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {user.last_login ? formatDate(user.last_login) : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewDetails(user)}
                            className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleBanUser(user.id, user.is_banned)}
                            className={`p-2 ${user.is_banned ? 'text-green-400 hover:bg-green-500/20' : 'text-red-400 hover:bg-red-500/20'} rounded-lg transition-colors`}
                            title={user.is_banned ? 'Unban User' : 'Ban User'}
                          >
                            {user.is_banned ? <ShieldOff className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                          </button>
                        </div>
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

export default UserList
