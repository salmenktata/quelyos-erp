import { Routes, Route, Navigate } from 'react-router-dom'
import { SaasLayout } from './layouts/SaasLayout'
import { Dashboard } from './pages/Dashboard'
import Login from './pages/Login'

// POS pages
import POSDashboard from './pages/pos/POSDashboard'
import POSTerminal from './pages/pos/POSTerminal'
import POSRush from './pages/pos/POSRush'
import POSKiosk from './pages/pos/POSKiosk'
import POSMobile from './pages/pos/POSMobile'
import POSKDS from './pages/pos/POSKDS'
import POSCustomerDisplay from './pages/pos/POSCustomerDisplay'
import POSSessionOpen from './pages/pos/POSSessionOpen'
import POSOrders from './pages/pos/POSOrders'
import POSSessions from './pages/pos/POSSessions'
import POSClickCollect from './pages/pos/POSClickCollect'
import POSAnalytics from './pages/pos/POSAnalytics'
import POSReportsSales from './pages/pos/reports/sales/page'
import POSReportsPayments from './pages/pos/reports/payments/page'
import POSSettings from './pages/pos/settings/page'
import POSSettingsTerminals from './pages/pos/settings/terminals/page'
import POSSettingsPayments from './pages/pos/settings/payments/page'
import POSSettingsReceipts from './pages/pos/settings/receipts/page'

// Store pages
import StoreDashboard from './pages/store/StoreDashboard'
import Products from './pages/store/Products'
import ProductDetail from './pages/store/ProductDetail'
import ProductForm from './pages/store/ProductForm'
import ProductImport from './pages/store/ProductImport'
import Orders from './pages/store/Orders'
import OrderDetail from './pages/store/OrderDetail'
import Categories from './pages/store/Categories'
import Attributes from './pages/store/Attributes'
import Collections from './pages/store/Collections'
import Bundles from './pages/store/Bundles'
import Coupons from './pages/store/Coupons'
import CouponForm from './pages/store/CouponForm'

// Stock pages
import ReorderingRules from './pages/stock/ReorderingRules'
import StockValuationPage from './pages/stock/valuation/page'
import StockTurnoverPage from './pages/stock/turnover/page'
import StockSettingsLayoutWrapper from './pages/stock/settings/SettingsLayoutWrapper'
import StockSettingsOverviewPage from './pages/stock/settings/page'
import AlertsSettingsPage from './pages/stock/settings/alerts/page'
import ReorderingSettingsPage from './pages/stock/settings/reordering/page'
import UnitsSettingsPage from './pages/stock/settings/units/page'
import ValuationSettingsPage from './pages/stock/settings/valuation/page'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<SaasLayout />}>
        {/* Root redirects to POS dashboard */}
        <Route index element={<Navigate to="/pos" replace />} />

        {/* POS routes */}
        <Route path="/pos" element={<POSDashboard />} />
        <Route path="/pos/terminal" element={<POSTerminal />} />
        <Route path="/pos/rush" element={<POSRush />} />
        <Route path="/pos/kiosk" element={<POSKiosk />} />
        <Route path="/pos/mobile" element={<POSMobile />} />
        <Route path="/pos/kds" element={<POSKDS />} />
        <Route path="/pos/customer-display" element={<POSCustomerDisplay />} />
        <Route path="/pos/session/open" element={<POSSessionOpen />} />
        <Route path="/pos/orders" element={<POSOrders />} />
        <Route path="/pos/sessions" element={<POSSessions />} />
        <Route path="/pos/click-collect" element={<POSClickCollect />} />
        <Route path="/pos/analytics" element={<POSAnalytics />} />
        <Route path="/pos/reports/sales" element={<POSReportsSales />} />
        <Route path="/pos/reports/payments" element={<POSReportsPayments />} />
        <Route path="/pos/settings" element={<POSSettings />} />
        <Route path="/pos/settings/terminals" element={<POSSettingsTerminals />} />
        <Route path="/pos/settings/payments" element={<POSSettingsPayments />} />
        <Route path="/pos/settings/receipts" element={<POSSettingsReceipts />} />

        {/* Store routes */}
        <Route path="/store" element={<StoreDashboard />} />
        <Route path="/store/products" element={<Products />} />
        <Route path="/store/products/new" element={<ProductForm />} />
        <Route path="/store/products/:id" element={<ProductDetail />} />
        <Route path="/store/products/:id/edit" element={<ProductForm />} />
        <Route path="/store/products/import" element={<ProductImport />} />
        <Route path="/store/orders" element={<Orders />} />
        <Route path="/store/orders/:id" element={<OrderDetail />} />
        <Route path="/store/categories" element={<Categories />} />
        <Route path="/store/attributes" element={<Attributes />} />
        <Route path="/store/collections" element={<Collections />} />
        <Route path="/store/bundles" element={<Bundles />} />
        <Route path="/store/coupons" element={<Coupons />} />
        <Route path="/store/coupons/new" element={<CouponForm />} />

        {/* Stock routes */}
        <Route path="/stock" element={<Dashboard />} />
        <Route path="/stock/reordering-rules" element={<ReorderingRules />} />
        <Route path="/stock/valuation" element={<StockValuationPage />} />
        <Route path="/stock/turnover" element={<StockTurnoverPage />} />
        <Route path="/stock/settings" element={<StockSettingsLayoutWrapper />}>
          <Route index element={<StockSettingsOverviewPage />} />
          <Route path="alerts" element={<AlertsSettingsPage />} />
          <Route path="reordering" element={<ReorderingSettingsPage />} />
          <Route path="units" element={<UnitsSettingsPage />} />
          <Route path="valuation" element={<ValuationSettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/pos" replace />} />
      </Route>
    </Routes>
  )
}
