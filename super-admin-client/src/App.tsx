import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Layout } from './components/Layout'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Tenants } from './pages/Tenants'
import { Subscriptions } from './pages/Subscriptions'
import { Billing } from './pages/Billing'
import { Monitoring } from './pages/Monitoring'

function App() {
  const isAuthenticated = !!localStorage.getItem('session_id')

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <Login />
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="tenants" element={<Tenants />} />
            <Route path="subscriptions" element={<Subscriptions />} />
            <Route path="billing" element={<Billing />} />
            <Route path="monitoring" element={<Monitoring />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
