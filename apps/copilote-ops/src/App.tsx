import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { SaasLayout } from './layouts/SaasLayout'
import { useAuth } from './lib/copilote/compat/auth'

// Lazy-loaded pages
const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })))

// Stock
const ReorderingRules = lazy(() => import('./pages/stock/ReorderingRules'))

// HR
const HRDashboard = lazy(() => import('./pages/hr/page'))
const LeavesPage = lazy(() => import('./pages/hr/leaves/page'))
const LeavesCalendarPage = lazy(() => import('./pages/hr/leaves/calendar/page'))
const AllocationsPage = lazy(() => import('./pages/hr/leaves/allocations/page'))
const LeaveTypesPage = lazy(() => import('./pages/hr/leaves/types/page'))
const HRSettingsPage = lazy(() => import('./pages/hr/settings/page'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          element={
            <ProtectedRoute>
              <SaasLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route index element={<Dashboard />} />

          {/* Stock */}
          <Route path="stock" element={<Dashboard />} />
          <Route path="stock/reordering-rules" element={<ReorderingRules />} />

          {/* HR */}
          <Route path="hr" element={<HRDashboard />} />
          <Route path="hr/leaves" element={<LeavesPage />} />
          <Route path="hr/leaves/calendar" element={<LeavesCalendarPage />} />
          <Route path="hr/leaves/allocations" element={<AllocationsPage />} />
          <Route path="hr/leaves/types" element={<LeaveTypesPage />} />
          <Route path="hr/settings" element={<HRSettingsPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
