const Stats = ({ stats, loading }) => {
  const statCards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers || 0,
      color: 'bg-blue-500',
      icon: '👥'
    },
    {
      label: 'Active Subscriptions',
      value: stats?.activeSubscriptions || 0,
      color: 'bg-green-500',
      icon: '✓'
    },
    {
      label: 'Trial Users',
      value: stats?.trialUsers || 0,
      color: 'bg-yellow-500',
      icon: '⏱️'
    },
    {
      label: 'Banned Users',
      value: stats?.bannedUsers || 0,
      color: 'bg-red-500',
      icon: '🚫'
    },
    {
      label: 'Active Sessions',
      value: stats?.activeSessions || 0,
      color: 'bg-purple-500',
      icon: '🔌'
    },
    {
      label: 'Expired Subscriptions',
      value: stats?.expiredSubscriptions || 0,
      color: 'bg-orange-500',
      icon: '⚠️'
    }
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-700 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
              <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
            </div>
            <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Stats
