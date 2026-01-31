import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { SaasLayout } from './layouts/SaasLayout'
import { useAuth } from './lib/sales/compat/auth'

// Lazy-loaded pages
const Login = lazy(() => import('./pages/Login'))

// CRM
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })))
const Pipeline = lazy(() => import('./pages/crm/Pipeline'))
const Leads = lazy(() => import('./pages/crm/Leads'))
const LeadDetail = lazy(() => import('./pages/crm/LeadDetail'))
const Customers = lazy(() => import('./pages/crm/Customers'))
const CustomerDetail = lazy(() => import('./pages/crm/CustomerDetail'))
const CustomerCategories = lazy(() => import('./pages/crm/CustomerCategories'))

// CRM Settings
const CrmSettingsLayoutWrapper = lazy(() => import('./pages/crm/settings/SettingsLayoutWrapper'))
const CrmSettingsPage = lazy(() => import('./pages/crm/settings/page'))
const CrmSettingsStages = lazy(() => import('./pages/crm/settings/stages/page'))
const CrmSettingsPricelists = lazy(() => import('./pages/crm/settings/pricelists/page'))
const CrmSettingsCategories = lazy(() => import('./pages/crm/settings/categories/page'))
const CrmSettingsScoring = lazy(() => import('./pages/crm/settings/scoring/page'))

// Marketing
const MarketingDashboard = lazy(() => import('./pages/marketing/MarketingDashboard'))
const Campaigns = lazy(() => import('./pages/marketing/campaigns/page'))
const CampaignNew = lazy(() => import('./pages/marketing/campaigns/new/page'))
const CampaignDetail = lazy(() => import('./pages/marketing/campaigns/[id]/page'))
const EmailPage = lazy(() => import('./pages/marketing/email/page'))
const EmailTemplates = lazy(() => import('./pages/marketing/email/templates/page'))
const SmsPage = lazy(() => import('./pages/marketing/sms/page'))
const Contacts = lazy(() => import('./pages/marketing/contacts/page'))
const ContactDetail = lazy(() => import('./pages/marketing/contacts/[id]/page'))
const MarketingSettingsLayout = lazy(() => import('./pages/marketing/settings/layout'))
const MarketingSettingsPage = lazy(() => import('./pages/marketing/settings/page'))
const MarketingSettingsEmail = lazy(() => import('./pages/marketing/settings/email/page'))
const MarketingSettingsSms = lazy(() => import('./pages/marketing/settings/sms/page'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
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
          {/* CRM */}
          <Route index element={<Navigate to="/crm" replace />} />
          <Route path="crm" element={<Dashboard />} />
          <Route path="crm/pipeline" element={<Pipeline />} />
          <Route path="crm/leads" element={<Leads />} />
          <Route path="crm/leads/:id" element={<LeadDetail />} />
          <Route path="crm/customers" element={<Customers />} />
          <Route path="crm/customers/:id" element={<CustomerDetail />} />
          <Route path="crm/customer-categories" element={<CustomerCategories />} />

          {/* CRM Settings */}
          <Route path="crm/settings" element={<CrmSettingsLayoutWrapper />}>
            <Route index element={<CrmSettingsPage />} />
            <Route path="stages" element={<CrmSettingsStages />} />
            <Route path="pricelists" element={<CrmSettingsPricelists />} />
            <Route path="categories" element={<CrmSettingsCategories />} />
            <Route path="scoring" element={<CrmSettingsScoring />} />
          </Route>

          {/* Marketing */}
          <Route path="marketing" element={<MarketingDashboard />} />
          <Route path="marketing/campaigns" element={<Campaigns />} />
          <Route path="marketing/campaigns/new" element={<CampaignNew />} />
          <Route path="marketing/campaigns/:id" element={<CampaignDetail />} />
          <Route path="marketing/email" element={<EmailPage />} />
          <Route path="marketing/email/templates" element={<EmailTemplates />} />
          <Route path="marketing/sms" element={<SmsPage />} />
          <Route path="marketing/contacts" element={<Contacts />} />
          <Route path="marketing/contacts/:id" element={<ContactDetail />} />

          {/* Marketing Settings */}
          <Route path="marketing/settings" element={<MarketingSettingsLayout />}>
            <Route index element={<MarketingSettingsPage />} />
            <Route path="email" element={<MarketingSettingsEmail />} />
            <Route path="sms" element={<MarketingSettingsSms />} />
          </Route>

          <Route path="*" element={<Navigate to="/crm" replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
