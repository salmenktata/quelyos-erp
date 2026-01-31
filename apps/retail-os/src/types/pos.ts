/**
 * Types TypeScript pour le module Point de Vente (POS)
 */

// ============================================================================
// CONFIGURATION & TERMINAUX
// ============================================================================

export interface POSPaymentMethod {
  id: number
  name: string
  code: string
  type: 'cash' | 'card' | 'digital' | 'check' | 'voucher' | 'other'
  icon: string
  allowSplit: boolean
  openDrawer: boolean
  requiresOnline: boolean
}

export interface POSCurrency {
  id: number
  symbol: string
  code: string
  decimalPlaces: number
}

export interface POSConfig {
  id: number
  name: string
  code: string
  isKiosk: boolean
  currency: POSCurrency | null
  warehouse: {
    id: number
    name: string
  } | null
  paymentMethods: POSPaymentMethod[]
  options: {
    allowManualDiscount: boolean
    maxDiscountPercent: number
    requireCustomer: boolean
    allowOrderNotes: boolean
    barcodeScanner: boolean
    cashDrawer: boolean
  }
  receipt: {
    printer: 'none' | 'browser' | 'epson' | 'star'
    header: string
    footer: string
  }
  hasOpenSession: boolean
  currentSessionId: number | null
}

// ============================================================================
// SESSIONS
// ============================================================================

export type POSSessionState = 'opening' | 'opened' | 'closing' | 'closed'

export interface POSSession {
  id: number
  name: string
  state: POSSessionState
  configId: number
  configName: string
  userId: number
  userName: string
  currency: {
    symbol: string
    code: string
  } | null
  openingCash: number
  closingCash: number | null
  theoreticalClosingCash: number
  cashDifference: number
  orderCount: number
  totalAmount: number
  totalCash: number
  totalCard: number
  totalDigital: number
  totalReturns: number
  openedAt: string | null
  closedAt: string | null
}

export interface POSSessionSummary {
  id: number
  name: string
  state: POSSessionState
  userName: string
  orderCount: number
  totalAmount: number
  openedAt: string | null
}

// ============================================================================
// PRODUITS
// ============================================================================

export interface POSProduct {
  id: number
  name: string
  sku: string
  barcode: string
  price: number
  listPrice: number
  stockQuantity: number
  categoryId: number
  categoryName: string
  imageUrl: string | null
  taxIds: number[]
  type: 'consu' | 'service' | 'product'
}

export interface POSCategory {
  id: number
  name: string
  completeName: string
  parentId: number | null
}

// ============================================================================
// PANIER
// ============================================================================

export interface POSCartLine {
  id: string // UUID temporaire
  productId: number
  productName: string
  sku: string
  imageUrl: string | null
  quantity: number
  priceUnit: number
  discount: number
  priceSubtotal: number
  taxIds: number[]
  note?: string
}

export interface POSCustomer {
  id: number
  name: string
  email: string
  phone: string
  loyaltyPoints?: number
}

// ============================================================================
// COMMANDES
// ============================================================================

export type POSOrderState = 'draft' | 'paid' | 'done' | 'invoiced' | 'cancelled' | 'refunded'

export interface POSOrderLine {
  id: number
  productId: number
  productName: string
  sku: string
  quantity: number
  priceUnit: number
  discount: number
  priceSubtotal: number
  note?: string
}

export interface POSPayment {
  id: number
  methodId: number
  methodCode: string
  methodName: string
  amount: number
  transactionId?: string
}

export interface POSOrder {
  id: number
  reference: string
  state: POSOrderState
  sessionId: number
  customerId: number | null
  customerName: string | null
  lines: POSOrderLine[]
  payments: POSPayment[]
  amountUntaxed: number
  amountTax: number
  amountTotal: number
  discountType: 'percent' | 'fixed' | null
  discountValue: number
  discountAmount: number
  amountPaid: number
  amountReturn: number
  note: string | null
  offlineId: string | null
  isOfflineOrder: boolean
  createdAt: string | null
  paidAt: string | null
}

export interface POSOrderSummary {
  id: number
  reference: string
  state: POSOrderState
  customerName: string
  itemCount: number
  amountTotal: number
  paidAt: string | null
}

// ============================================================================
// OFFLINE
// ============================================================================

export interface OfflineOrder {
  id: string // UUID local
  sessionId: number
  customerId: number | null
  lines: OfflineOrderLine[]
  payments: OfflinePayment[]
  discountType: 'percent' | 'fixed' | null
  discountValue: number
  total: number
  note?: string
  createdAt: string
  isPaid: boolean
  syncStatus: 'pending' | 'syncing' | 'synced' | 'error'
  syncError?: string
  serverId?: number
}

export interface OfflineOrderLine {
  offlineLineId: string
  productId: number
  productName: string
  quantity: number
  priceUnit: number
  discount: number
  taxIds: number[]
  note?: string
}

export interface OfflinePayment {
  paymentMethodId: number
  amount: number
}

// ============================================================================
// DASHBOARD & RAPPORTS
// ============================================================================

export interface POSDashboardKPIs {
  totalSales: number
  orderCount: number
  averageBasket: number
  uniqueCustomers: number
}

export interface POSDashboard {
  kpis: POSDashboardKPIs
  activeSessions: POSSessionSummary[]
  topProducts: {
    name: string
    quantity: number
    amount: number
  }[]
  period: {
    from: string
    to: string
  }
}

export interface POSZReport {
  session: POSSession
  paymentsByMethod: {
    method: string
    count: number
    amount: number
  }[]
  topProducts: {
    name: string
    quantity: number
    amount: number
  }[]
  generatedAt: string
}

// ============================================================================
// API RESPONSES
// ============================================================================

export interface POSApiResponse<T = unknown> {
  success: boolean
  error?: string
  errorCode?: string
  data?: T
}
