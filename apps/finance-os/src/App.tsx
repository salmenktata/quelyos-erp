import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { SaasLayout } from './layouts/SaasLayout'
import { useAuth } from './lib/finance/compat/auth'

// Lazy-loaded pages
const Login = lazy(() => import('./pages/Login'))
const FinanceDashboard = lazy(() => import('./pages/FinanceDashboard'))

// Comptes
const AccountsPage = lazy(() => import('./pages/accounts/page'))
const AccountDetailPage = lazy(() => import('./pages/accounts/[id]/page'))
const AccountNewPage = lazy(() => import('./pages/accounts/new/page'))
const PortfoliosPage = lazy(() => import('./pages/portfolios/page'))

// Transactions
const ExpensesPage = lazy(() => import('./pages/expenses/page'))
const ExpenseNewPage = lazy(() => import('./pages/expenses/new/page'))
const IncomesPage = lazy(() => import('./pages/incomes/page'))
const IncomeNewPage = lazy(() => import('./pages/incomes/new/page'))

// Planification
const BudgetsPage = lazy(() => import('./pages/budgets/page'))
const BudgetDetailPage = lazy(() => import('./pages/budgets/[id]/page'))
const BudgetNewPage = lazy(() => import('./pages/budgets/new/page'))
const ForecastPage = lazy(() => import('./pages/forecast/page'))
const ScenariosPage = lazy(() => import('./pages/scenarios/page'))
const PaymentPlanningPage = lazy(() => import('./pages/payment-planning/page'))

// Rapports
const ReportingHubPage = lazy(() => import('./pages/reporting/page'))
const CashflowPage = lazy(() => import('./pages/reporting/cashflow/page'))
const ForecastsReportPage = lazy(() => import('./pages/reporting/forecasts/page'))
const ByCategoryPage = lazy(() => import('./pages/reporting/by-category/page'))
const ByAccountPage = lazy(() => import('./pages/reporting/by-account/page'))
const ByFlowPage = lazy(() => import('./pages/reporting/by-flow/page'))
const ByPortfolioPage = lazy(() => import('./pages/reporting/by-portfolio/page'))
const ProfitabilityPage = lazy(() => import('./pages/reporting/profitability/page'))
const EbitdaPage = lazy(() => import('./pages/reporting/ebitda/page'))
const DsoPage = lazy(() => import('./pages/reporting/dso/page'))
const BfrPage = lazy(() => import('./pages/reporting/bfr/page'))
const BreakevenPage = lazy(() => import('./pages/reporting/breakeven/page'))
const ForecastReportPage = lazy(() => import('./pages/reporting/forecast/page'))
const DataQualityPage = lazy(() => import('./pages/reporting/data-quality/page'))

// Configuration
const CategoriesPage = lazy(() => import('./pages/categories/page'))
const SuppliersPage = lazy(() => import('./pages/suppliers/page'))
const SupplierNewPage = lazy(() => import('./pages/suppliers/new/page'))
const ChartsPage = lazy(() => import('./pages/charts/page'))
const AlertsPage = lazy(() => import('./pages/alerts/page'))
const ImportPage = lazy(() => import('./pages/import/page'))
const ArchivesPage = lazy(() => import('./pages/archives/page'))

// Paramètres
const SettingsPage = lazy(() => import('./pages/settings/page'))
const SettingsLayout = lazy(() => import('./pages/settings/layout'))
const SettingsCategoriesPage = lazy(() => import('./pages/settings/categories/page'))
const SettingsDevisePage = lazy(() => import('./pages/settings/devise/page'))
const SettingsFluxPage = lazy(() => import('./pages/settings/flux/page'))
const SettingsTvaPage = lazy(() => import('./pages/settings/tva/page'))
const SettingsSecurityPage = lazy(() => import('./pages/settings/security/page'))
const SettingsNotificationsPage = lazy(() => import('./pages/settings/notifications/page'))
const SettingsBillingPage = lazy(() => import('./pages/settings/billing/page'))
const SettingsIntegrationsPage = lazy(() => import('./pages/settings/integrations/page'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
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
          <Route index element={<FinanceDashboard />} />

          {/* Comptes */}
          <Route path="accounts" element={<AccountsPage />} />
          <Route path="accounts/new" element={<AccountNewPage />} />
          <Route path="accounts/:id" element={<AccountDetailPage />} />
          <Route path="portfolios" element={<PortfoliosPage />} />

          {/* Transactions */}
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="expenses/new" element={<ExpenseNewPage />} />
          <Route path="incomes" element={<IncomesPage />} />
          <Route path="incomes/new" element={<IncomeNewPage />} />

          {/* Planification */}
          <Route path="budgets" element={<BudgetsPage />} />
          <Route path="budgets/new" element={<BudgetNewPage />} />
          <Route path="budgets/:id" element={<BudgetDetailPage />} />
          <Route path="forecast" element={<ForecastPage />} />
          <Route path="scenarios" element={<ScenariosPage />} />
          <Route path="payment-planning" element={<PaymentPlanningPage />} />

          {/* Rapports */}
          <Route path="reporting" element={<ReportingHubPage />} />
          <Route path="reporting/cashflow" element={<CashflowPage />} />
          <Route path="reporting/forecasts" element={<ForecastsReportPage />} />
          <Route path="reporting/forecast" element={<ForecastReportPage />} />
          <Route path="reporting/by-category" element={<ByCategoryPage />} />
          <Route path="reporting/by-account" element={<ByAccountPage />} />
          <Route path="reporting/by-flow" element={<ByFlowPage />} />
          <Route path="reporting/by-portfolio" element={<ByPortfolioPage />} />
          <Route path="reporting/profitability" element={<ProfitabilityPage />} />
          <Route path="reporting/ebitda" element={<EbitdaPage />} />
          <Route path="reporting/dso" element={<DsoPage />} />
          <Route path="reporting/bfr" element={<BfrPage />} />
          <Route path="reporting/breakeven" element={<BreakevenPage />} />
          <Route path="reporting/data-quality" element={<DataQualityPage />} />

          {/* Configuration */}
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="suppliers" element={<SuppliersPage />} />
          <Route path="suppliers/new" element={<SupplierNewPage />} />
          <Route path="charts" element={<ChartsPage />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="import" element={<ImportPage />} />
          <Route path="archives" element={<ArchivesPage />} />

          {/* Paramètres */}
          <Route path="settings" element={<SettingsLayout />}>
            <Route index element={<SettingsPage />} />
            <Route path="categories" element={<SettingsCategoriesPage />} />
            <Route path="devise" element={<SettingsDevisePage />} />
            <Route path="flux" element={<SettingsFluxPage />} />
            <Route path="tva" element={<SettingsTvaPage />} />
            <Route path="security" element={<SettingsSecurityPage />} />
            <Route path="notifications" element={<SettingsNotificationsPage />} />
            <Route path="billing" element={<SettingsBillingPage />} />
            <Route path="integrations" element={<SettingsIntegrationsPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
