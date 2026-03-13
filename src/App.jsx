import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import UserList from './components/UserList'
import SessionsList from './components/SessionsList'
import SubscriptionTiers from './components/SubscriptionTiers'
import GameServers from './components/GameServers'
import AuditLogs from './components/AuditLogs'
import Settings from './components/Settings'
import Documentation from './components/Documentation'
import Downloads from './components/Downloads'
import PublicLayout from './components/PublicLayout'
import LandingPage from './components/LandingPage'

function AdminRoute({ isAuthenticated, onLogout }) {
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <Layout onLogout={onLogout}>
      <Outlet />
    </Layout>
  )
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated
    const authenticated = localStorage.getItem('admin_authenticated')
    setIsAuthenticated(authenticated === 'true')
    setLoading(false)
  }, [])

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated')
    setIsAuthenticated(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/admin/login"
          element={isAuthenticated ? <Navigate to="/admin" replace /> : <Login onLogin={handleLogin} />}
        />

        <Route
          path="/admin"
          element={<AdminRoute isAuthenticated={isAuthenticated} onLogout={handleLogout} />}
        >
          <Route index element={<Dashboard />} />
          <Route path="users" element={<UserList />} />
          <Route path="sessions" element={<SessionsList />} />
          <Route path="tiers" element={<SubscriptionTiers />} />
          <Route path="servers" element={<GameServers />} />
          <Route path="logs" element={<AuditLogs />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route
          path="/"
          element={
            <PublicLayout>
              <LandingPage />
            </PublicLayout>
          }
        />
        <Route
          path="/docs"
          element={
            <PublicLayout>
              <Documentation />
            </PublicLayout>
          }
        />
        <Route
          path="/downloads"
          element={
            <PublicLayout>
              <Downloads />
            </PublicLayout>
          }
        />
        <Route path="/documentation" element={<Navigate to="/docs" replace />} />
        <Route path="/login" element={<Navigate to="/admin/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #374151',
          },
        }}
      />
    </Router>
  )
}

export default App
