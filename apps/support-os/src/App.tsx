import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { SaasLayout } from './layouts/SaasLayout'
import { Dashboard } from './pages/Dashboard'

const Tickets = lazy(() => import('./pages/support/Tickets'))
const TicketDetail = lazy(() => import('./pages/support/TicketDetail'))
const NewTicket = lazy(() => import('./pages/support/NewTicket'))
const Customers = lazy(() => import('./pages/crm/Customers'))
const CustomerDetail = lazy(() => import('./pages/crm/CustomerDetail'))
const Login = lazy(() => import('./pages/Login'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<SaasLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="support/tickets" element={<Tickets />} />
          <Route path="support/tickets/new" element={<NewTicket />} />
          <Route path="support/tickets/:id" element={<TicketDetail />} />
          <Route path="support/customers" element={<Customers />} />
          <Route path="support/customers/:id" element={<CustomerDetail />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
