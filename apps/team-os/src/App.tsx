import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { SaasLayout } from './layouts/SaasLayout'
import { useAuth } from './lib/team/compat/auth'

// Lazy-loaded pages
const Login = lazy(() => import('./pages/Login'))
const HRDashboard = lazy(() => import('./pages/hr/page'))

// Personnel
const EmployeesPage = lazy(() => import('./pages/hr/employees/page'))
const EmployeeDetailPage = lazy(() => import('./pages/hr/employees/[id]/page'))
const EmployeeNewPage = lazy(() => import('./pages/hr/employees/new/page'))
const DepartmentsPage = lazy(() => import('./pages/hr/departments/page'))
const JobsPage = lazy(() => import('./pages/hr/jobs/page'))
const ContractsPage = lazy(() => import('./pages/hr/contracts/page'))
const ContractNewPage = lazy(() => import('./pages/hr/contracts/new/page'))

// Leaves
const LeavesPage = lazy(() => import('./pages/hr/leaves/page'))
const LeavesCalendarPage = lazy(() => import('./pages/hr/leaves/calendar/page'))
const AllocationsPage = lazy(() => import('./pages/hr/leaves/allocations/page'))
const LeaveTypesPage = lazy(() => import('./pages/hr/leaves/types/page'))

// Attendance
const AttendancePage = lazy(() => import('./pages/hr/attendance/page'))

// Appraisals
const AppraisalsPage = lazy(() => import('./pages/hr/appraisals/page'))
const AppraisalDetailPage = lazy(() => import('./pages/hr/appraisals/[id]/page'))
const SkillsPage = lazy(() => import('./pages/hr/skills/page'))

// Settings
const HRSettingsPage = lazy(() => import('./pages/hr/settings/page'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-600" />
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-600" />
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
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected */}
        <Route
          element={
            <ProtectedRoute>
              <SaasLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HRDashboard />} />

          {/* Personnel */}
          <Route path="hr/employees" element={<EmployeesPage />} />
          <Route path="hr/employees/new" element={<EmployeeNewPage />} />
          <Route path="hr/employees/:id" element={<EmployeeDetailPage />} />
          <Route path="hr/departments" element={<DepartmentsPage />} />
          <Route path="hr/jobs" element={<JobsPage />} />
          <Route path="hr/contracts" element={<ContractsPage />} />
          <Route path="hr/contracts/new" element={<ContractNewPage />} />

          {/* Leaves */}
          <Route path="hr/leaves" element={<LeavesPage />} />
          <Route path="hr/leaves/calendar" element={<LeavesCalendarPage />} />
          <Route path="hr/leaves/allocations" element={<AllocationsPage />} />
          <Route path="hr/leaves/types" element={<LeaveTypesPage />} />

          {/* Attendance */}
          <Route path="hr/attendance" element={<AttendancePage />} />

          {/* Appraisals */}
          <Route path="hr/appraisals" element={<AppraisalsPage />} />
          <Route path="hr/appraisals/:id" element={<AppraisalDetailPage />} />
          <Route path="hr/skills" element={<SkillsPage />} />

          {/* Settings */}
          <Route path="hr/settings" element={<HRSettingsPage />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
