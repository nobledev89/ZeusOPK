import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import { Plus, Edit, Trash2, X, ChevronUp, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

const GameServers = () => {
  const [servers, setServers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingServer, setEditingServer] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    fetchServers()
  }, [])

  const fetchServers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('game_servers')
        .select('*')
        .order('display_order')

      if (error) throw error

      setServers(data || [])
    } catch (error) {
      console.error('Error fetching servers:', error)
      toast.error('Failed to load game servers')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (serverId) => {
    if (!window.confirm('Are you sure you want to delete this server? This action cannot be undone.')) {
      return
    }

    try {
      // Check if any users are using this server
      const { data: users, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('selected_server_id', serverId)
        .limit(1)

      if (checkError) throw checkError

      if (users && users.length > 0) {
        toast.error('Cannot delete server: Users have selected it')
        return
      }

      const { error } = await supabase
        .from('game_servers')
        .delete()
        .eq('id', serverId)

      if (error) throw error

      toast.success('Server deleted successfully')
      fetchServers()
    } catch (error) {
      console.error('Error deleting server:', error)
      toast.error('Failed to delete server')
    }
  }

  const handleToggleActive = async (serverId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('game_servers')
        .update({ is_active: !currentStatus })
        .eq('id', serverId)

      if (error) throw error

      toast.success(`Server ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
      fetchServers()
    } catch (error) {
      console.error('Error toggling server status:', error)
      toast.error('Failed to update server status')
    }
  }

  const handleReorder = async (serverId, direction) => {
    const serverIndex = servers.findIndex(s => s.id === serverId)
    if (serverIndex === -1) return
    
    const newIndex = direction === 'up' ? serverIndex - 1 : serverIndex + 1
    if (newIndex < 0 || newIndex >= servers.length) return

    const newServers = [...servers]
    const [removed] = newServers.splice(serverIndex, 1)
    newServers.splice(newIndex, 0, removed)

    // Update display_order for all servers
    try {
      const updates = newServers.map((server, index) => 
        supabase
          .from('game_servers')
          .update({ display_order: index + 1 })
          .eq('id', server.id)
      )

      await Promise.all(updates)
      toast.success('Server order updated')
      fetchServers()
    } catch (error) {
      console.error('Error reordering servers:', error)
      toast.error('Failed to reorder servers')
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Game Servers</h1>
          <p className="text-gray-400">Manage available game servers</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Server</span>
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-750">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Server Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Master Server
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Server Index
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                    <div className="animate-pulse">Loading servers...</div>
                  </td>
                </tr>
              ) : servers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                    No game servers found
                  </td>
                </tr>
              ) : (
                servers.map((server, index) => (
                  <tr key={server.id} className="hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm text-gray-300">{server.display_order}</span>
                        <div className="flex flex-col">
                          <button
                            onClick={() => handleReorder(server.id, 'up')}
                            disabled={index === 0}
                            className="text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleReorder(server.id, 'down')}
                            disabled={index === servers.length - 1}
                            className="text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-white">{server.server_name}</div>
                      {server.description && (
                        <div className="text-xs text-gray-400 mt-1">{server.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{server.master_server}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{server.server_index}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(server.id, server.is_active)}
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          server.is_active
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {server.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setEditingServer(server)}
                          className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                          title="Edit Server"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(server.id)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Delete Server"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingServer) && (
        <ServerModal
          server={editingServer}
          onClose={() => {
            setShowAddModal(false)
            setEditingServer(null)
          }}
          onSuccess={() => {
            setShowAddModal(false)
            setEditingServer(null)
            fetchServers()
          }}
        />
      )}
    </div>
  )
}

// Server Modal Component
const ServerModal = ({ server, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    server_name: server?.server_name || '',
    master_server: server?.master_server || '',
    server_index: server?.server_index || 0,
    description: server?.description || '',
    is_active: server?.is_active ?? true,
    display_order: server?.display_order || 1
  })
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setProcessing(true)

    try {
      if (server) {
        // Update existing server
        const { error } = await supabase
          .from('game_servers')
          .update(formData)
          .eq('id', server.id)

        if (error) throw error

        toast.success('Server updated successfully')
      } else {
        // Create new server
        const { error } = await supabase
          .from('game_servers')
          .insert([formData])

        if (error) throw error

        toast.success('Server created successfully')
      }

      onSuccess()
    } catch (error) {
      console.error('Error saving server:', error)
      toast.error('Failed to save server')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">
            {server ? 'Edit Server' : 'Add New Server'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Server Name *
            </label>
            <input
              type="text"
              required
              value={formData.server_name}
              onChange={(e) => setFormData({ ...formData, server_name: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., North America East"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Master Server *
            </label>
            <input
              type="text"
              required
              value={formData.master_server}
              onChange={(e) => setFormData({ ...formData, master_server: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., ms.server.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Server Index *
            </label>
            <input
              type="number"
              required
              min="0"
              value={formData.server_index}
              onChange={(e) => setFormData({ ...formData, server_index: parseInt(e.target.value) })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Brief description of this server"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Display Order *
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
            />
            <label htmlFor="is_active" className="ml-2 text-sm text-gray-300">
              Active (visible to users)
            </label>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              type="submit"
              disabled={processing}
              className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              {processing ? 'Saving...' : server ? 'Update Server' : 'Create Server'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default GameServers
