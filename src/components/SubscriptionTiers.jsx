import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import { formatCurrency } from '../utils/formatters'
import { Plus, Edit, Trash2, Check, X, ChevronUp, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

const SubscriptionTiers = () => {
  const [tiers, setTiers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingTier, setEditingTier] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    fetchTiers()
  }, [])

  const fetchTiers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('subscription_tiers')
        .select('*')
        .order('display_order')

      if (error) throw error

      setTiers(data || [])
    } catch (error) {
      console.error('Error fetching tiers:', error)
      toast.error('Failed to load subscription tiers')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (tierId) => {
    if (!window.confirm('Are you sure you want to delete this tier? This action cannot be undone.')) {
      return
    }

    try {
      // Check if any users are using this tier
      const { data: users, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('subscription_tier_id', tierId)
        .limit(1)

      if (checkError) throw checkError

      if (users && users.length > 0) {
        toast.error('Cannot delete tier: Users are currently assigned to it')
        return
      }

      const { error } = await supabase
        .from('subscription_tiers')
        .delete()
        .eq('id', tierId)

      if (error) throw error

      toast.success('Tier deleted successfully')
      fetchTiers()
    } catch (error) {
      console.error('Error deleting tier:', error)
      toast.error('Failed to delete tier')
    }
  }

  const handleToggleActive = async (tierId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('subscription_tiers')
        .update({ is_active: !currentStatus })
        .eq('id', tierId)

      if (error) throw error

      toast.success(`Tier ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
      fetchTiers()
    } catch (error) {
      console.error('Error toggling tier status:', error)
      toast.error('Failed to update tier status')
    }
  }

  const handleReorder = async (tierId, direction) => {
    const tierIndex = tiers.findIndex(t => t.id === tierId)
    if (tierIndex === -1) return
    
    const newIndex = direction === 'up' ? tierIndex - 1 : tierIndex + 1
    if (newIndex < 0 || newIndex >= tiers.length) return

    const newTiers = [...tiers]
    const [removed] = newTiers.splice(tierIndex, 1)
    newTiers.splice(newIndex, 0, removed)

    // Update display_order for all tiers
    try {
      const updates = newTiers.map((tier, index) => 
        supabase
          .from('subscription_tiers')
          .update({ display_order: index + 1 })
          .eq('id', tier.id)
      )

      await Promise.all(updates)
      toast.success('Tier order updated')
      fetchTiers()
    } catch (error) {
      console.error('Error reordering tiers:', error)
      toast.error('Failed to reorder tiers')
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Subscription Tiers</h1>
          <p className="text-gray-400">Manage subscription plans and pricing</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Tier</span>
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
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Max Bots
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Price (Monthly)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Price (Lifetime)
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
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                    <div className="animate-pulse">Loading tiers...</div>
                  </td>
                </tr>
              ) : tiers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                    No subscription tiers found
                  </td>
                </tr>
              ) : (
                tiers.map((tier, index) => (
                  <tr key={tier.id} className="hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm text-gray-300">{tier.display_order}</span>
                        <div className="flex flex-col">
                          <button
                            onClick={() => handleReorder(tier.id, 'up')}
                            disabled={index === 0}
                            className="text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleReorder(tier.id, 'down')}
                            disabled={index === tiers.length - 1}
                            className="text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{tier.name}</div>
                      {tier.description && (
                        <div className="text-xs text-gray-400 mt-1">{tier.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{tier.max_bots}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {formatCurrency(tier.price_monthly)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {formatCurrency(tier.price_lifetime)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(tier.id, tier.is_active)}
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          tier.is_active
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {tier.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setEditingTier(tier)}
                          className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                          title="Edit Tier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tier.id)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Delete Tier"
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
      {(showAddModal || editingTier) && (
        <TierModal
          tier={editingTier}
          onClose={() => {
            setShowAddModal(false)
            setEditingTier(null)
          }}
          onSuccess={() => {
            setShowAddModal(false)
            setEditingTier(null)
            fetchTiers()
          }}
        />
      )}
    </div>
  )
}

// Tier Modal Component
const TierModal = ({ tier, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: tier?.name || '',
    description: tier?.description || '',
    max_bots: tier?.max_bots || 1,
    price_monthly: tier?.price_monthly || 0,
    price_lifetime: tier?.price_lifetime || 0,
    is_active: tier?.is_active ?? true,
    display_order: tier?.display_order || 1
  })
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setProcessing(true)

    try {
      if (tier) {
        // Update existing tier
        const { error } = await supabase
          .from('subscription_tiers')
          .update(formData)
          .eq('id', tier.id)

        if (error) throw error

        toast.success('Tier updated successfully')
      } else {
        // Create new tier
        const { error } = await supabase
          .from('subscription_tiers')
          .insert([formData])

        if (error) throw error

        toast.success('Tier created successfully')
      }

      onSuccess()
    } catch (error) {
      console.error('Error saving tier:', error)
      toast.error('Failed to save tier')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">
            {tier ? 'Edit Tier' : 'Add New Tier'}
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
              Tier Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., Basic, Premium, Ultimate"
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
              placeholder="Brief description of this tier"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Max Bots *
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.max_bots}
              onChange={(e) => setFormData({ ...formData, max_bots: parseInt(e.target.value) })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Monthly Price *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price_monthly}
                onChange={(e) => setFormData({ ...formData, price_monthly: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Lifetime Price *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price_lifetime}
                onChange={(e) => setFormData({ ...formData, price_lifetime: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
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
              {processing ? 'Saving...' : tier ? 'Update Tier' : 'Create Tier'}
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

export default SubscriptionTiers
