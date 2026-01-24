// Types pour l'API Quelyos

export interface ApiResponse<T = unknown> {
  success: boolean
  error?: string
  data?: T
}

// ==================== PRODUCTS ====================

export interface Product {
  id: number
  name: string
  price: number
  standard_price?: number
  default_code: string
  barcode?: string
  image: string | null
  slug: string
  qty_available: number
  virtual_available?: number
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock'
  weight?: number
  active?: boolean
  create_date?: string | null
  variant_count?: number
  category: {
    id: number
    name: string
  } | null
}

export interface ProductTax {
  id: number
  name: string
  amount: number
  amount_type: 'percent' | 'fixed' | 'group' | 'division'
  price_include: boolean
}

export interface ProductTag {
  id: number
  name: string
  color: number
}

export interface ProductDetail extends Product {
  description: string
  description_purchase?: string
  volume?: number
  product_length?: number
  product_width?: number
  product_height?: number
  detailed_type?: 'consu' | 'service' | 'product'
  uom_id?: number | null
  uom_name?: string | null
  images?: ProductImage[]
  taxes?: ProductTax[]
  product_tag_ids?: ProductTag[]
}

export interface UnitOfMeasure {
  id: number
  name: string
  category_id: number
  category_name: string
  uom_type: 'bigger' | 'reference' | 'smaller'
  factor: number
}

export interface ProductType {
  value: 'consu' | 'service' | 'product'
  label: string
  description: string
}

export interface ProductImage {
  id: number
  name: string
  url: string
  sequence: number
}

export interface ProductAttribute {
  id: number
  name: string
  display_type: string
  create_variant: string
  values: ProductAttributeValue[]
}

export interface ProductAttributeValue {
  id: number
  name: string
  html_color?: string | null
  sequence: number
}

export interface ProductAttributeLine {
  id: number
  attribute_id: number
  attribute_name: string
  display_type: string
  values: Array<{ id: number; name: string; html_color?: string | null }>
}

export interface ProductVariant {
  id: number
  name: string
  display_name: string
  default_code: string
  barcode: string
  list_price: number
  standard_price: number
  qty_available: number
  image: string | null
  images?: Array<{ id: number; name: string; url: string; sequence: number }>
  image_count?: number
  attribute_values: Array<{
    id: number
    name: string
    attribute_id: number
    attribute_name: string
  }>
}

export interface ProductsQueryParams {
  limit?: number
  offset?: number
  category_id?: number
  search?: string
  sort_by?: 'name' | 'price' | 'qty_available' | 'create_date' | 'default_code'
  sort_order?: 'asc' | 'desc'
  stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock'
  include_archived?: boolean
  price_min?: number
  price_max?: number
  attribute_value_ids?: number[]  // Filtrer par valeurs d'attributs (couleur, taille, etc.)
}

export interface ProductCreateData {
  name: string
  price: number
  description?: string
  category_id?: number
  default_code?: string
  barcode?: string
  standard_price?: number
  weight?: number
  product_length?: number
  product_width?: number
  product_height?: number
  taxes_id?: number[]
  product_tag_ids?: number[]
}

export interface ProductUpdateData {
  name?: string
  price?: number
  description?: string
  category_id?: number | null
  default_code?: string
  barcode?: string
  standard_price?: number
  weight?: number
  product_length?: number
  product_width?: number
  product_height?: number
  active?: boolean
  taxes_id?: number[]
  product_tag_ids?: number[]
}

// ==================== CATEGORIES ====================

export interface Category {
  id: number
  name: string
  complete_name?: string
  parent_id: number | null
  parent_name: string | null
  product_count?: number
  total_product_count?: number
  child_count?: number
  children?: Category[]
}

export interface CategoriesQueryParams {
  limit?: number
  offset?: number
  search?: string
  include_tree?: boolean
}

export interface CategoriesResponse {
  categories: Category[]
  total: number
  limit: number
  offset: number
}

// ==================== ORDERS ====================

export interface Order {
  id: number
  name: string
  date_order: string | null
  state: 'draft' | 'sent' | 'sale' | 'done' | 'cancel'
  amount_total: number
  customer: {
    id: number
    name: string
    email: string
  } | null
  lines_count?: number
}

export interface OrderLine {
  id: number
  product: {
    id: number
    name: string
    image: string
  }
  quantity: number
  price_unit: number
  price_subtotal: number
  price_total: number
}

export interface OrderDetail extends Omit<Order, 'lines_count'> {
  amount_untaxed: number
  amount_tax: number
  customer: {
    id: number
    name: string
    email: string
    phone: string
    street: string
    city: string
    zip: string
    country: string
  } | null
  lines: OrderLine[]
}

// ==================== CART ====================

export interface Cart {
  id: number
  lines: OrderLine[]
  amount_untaxed: number
  amount_tax: number
  amount_total: number
  lines_count: number
}

// ==================== CUSTOMERS ====================

export interface Customer {
  id: number
  name: string
  email: string
  phone: string
  mobile: string
  street: string
  street2: string
  city: string
  zip: string
  state: string
  country: string
  country_id: number | null
}

export interface CustomerListItem {
  id: number
  name: string
  email: string
  phone: string
  mobile: string
  street: string
  city: string
  zip: string
  country: string
  orders_count: number
  total_spent: number
  create_date: string | null
}

export interface Address {
  id: number
  name: string
  type: 'delivery' | 'invoice'
  street: string
  street2: string
  city: string
  zip: string
  state: string
  country: string
  phone: string
}

// ==================== AUTH ====================

export interface User {
  id: number
  name: string
  email: string
  phone: string
}

export interface LoginResponse {
  success: boolean
  session_id?: string
  user?: User
  error?: string
}

export interface SessionResponse {
  authenticated: boolean
  user?: User
}

// ==================== COUPONS ====================

export interface Coupon {
  id: number
  name: string
  active: boolean
  program_type: string
  trigger: string
  applies_on: string
  date_from: string | null
  date_to: string | null
  limit_usage: boolean
  max_usage: number
  reward?: {
    reward_type: string
    discount: number
    discount_mode: 'percent' | 'fixed'
  }
}

export interface CouponCreate {
  name: string
  code: string
  discount_type: 'percent' | 'fixed'
  discount_value: number
  date_from?: string
  date_to?: string
  max_usage?: number
}

// ==================== STOCK ====================

export interface StockProduct {
  id: number
  name: string
  sku: string | null
  image: string
  image_url?: string | null  // Alias pour image
  category: string
  list_price?: number  // Prix de vente
  qty_available: number
  virtual_available: number
  incoming_qty: number
  outgoing_qty: number
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock'
}

export interface StockMove {
  id: number
  product: {
    id: number
    name: string
  }
  quantity: number
  location_src: string
  location_dest: string
  date: string | null
  state: string
  reference: string
}

// ==================== DELIVERY ====================

export interface DeliveryMethod {
  id: number
  name: string
  delivery_type: string
  fixed_price: number
  free_over: boolean | number
  active?: boolean
}

// ==================== ANALYTICS ====================

export interface AnalyticsStats {
  totals: {
    products: number
    customers: number
    orders: number
    confirmed_orders: number
    pending_orders: number
    out_of_stock_products: number
    low_stock_products: number
    revenue: number
  }
  recent_orders: Array<{
    id: number
    name: string
    date_order: string | null
    state: string
    amount_total: number
    customer: {
      id: number
      name: string
    } | null
  }>
  top_products: Array<{
    id: number
    name: string
    qty_sold: number
    revenue: number
  }>
  stock_alerts: Array<{
    id: number
    name: string
    default_code: string
    qty_available: number
    alert_level: 'critical' | 'warning'
    alert_message: string
    image: string | null
  }>
}

export interface RevenueChartData {
  period: string
  revenue: number
  orders: number
}

export interface OrdersChartData {
  period: string
  total: number
  confirmed: number
  pending: number
  cancelled: number
}

export interface ConversionFunnelData {
  stage: string
  count: number
  percentage: number
  color: string
}

export interface TopCategoryData {
  id: number
  name: string
  qty_sold: number
  revenue: number
}

export interface AnalyticsChartParams {
  period?: '7d' | '30d' | '12m' | 'custom'
  start_date?: string
  end_date?: string
  group_by?: 'day' | 'month'
}

// ==================== INVOICES ====================

export interface InvoiceLine {
  id: number
  product_id: number | null
  product_name: string
  name: string
  quantity: number
  price_unit: number
  price_subtotal: number
  price_total: number
  tax_ids: number[]
}

export interface Invoice {
  id: number
  name: string
  partner_id: number
  partner_name: string
  invoice_date: string | null
  invoice_date_due: string | null
  amount_untaxed: number
  amount_tax: number
  amount_total: number
  amount_residual: number
  state: 'draft' | 'posted' | 'cancel'
  payment_state: 'not_paid' | 'in_payment' | 'paid' | 'partial' | 'reversed'
  invoice_line_ids?: InvoiceLine[]
}

export interface InvoicesQueryParams {
  limit?: number
  offset?: number
  search?: string
  partner_id?: number
  state?: 'draft' | 'posted' | 'cancel'
  payment_state?: 'not_paid' | 'in_payment' | 'paid' | 'partial' | 'reversed'
  date_from?: string
  date_to?: string
}

export interface InvoiceStats {
  total_invoices: number
  total_revenue: number
  unpaid_amount: number
  overdue_count: number
}

// ==================== ABANDONED CARTS ====================

export interface AbandonedCartItem {
  product_name: string
  quantity: number
  price: number
}

export interface AbandonedCart {
  id: number
  name: string
  partner_id: number | null
  partner_name: string
  partner_email: string | null
  write_date: string | null
  hours_ago: number
  amount_total: number
  lines_count: number
  items: AbandonedCartItem[]
}

export interface AbandonedCartsQueryParams {
  limit?: number
  offset?: number
  hours_threshold?: number
  search?: string
}

export interface CartRecoveryStats {
  period: string
  abandoned_count: number
  abandoned_value: number
  recovered_count: number
  recovered_value: number
  recovery_rate: number
}

// ==================== ORDER TRACKING ====================

export interface OrderTracking {
  picking_id: number
  picking_name: string
  state: string
  state_label: string
  carrier_id: number | null
  carrier_name: string | null
  carrier_tracking_ref: string
  carrier_tracking_url: string
}

export interface OrderHistoryTrackingValue {
  field: string
  field_desc: string
  old_value: string
  new_value: string
}

export interface OrderHistoryItem {
  id: number
  date: string | null
  author: string
  body: string
  message_type: string
  subtype: string | null
  tracking_values: OrderHistoryTrackingValue[]
}

// ==================== PAGINATION ====================

export interface PaginatedData<T> {
  total: number
  limit: number
  offset: number
  [key: string]: T[] | number
}

export interface PaginatedResponse<T> {
  success: boolean
  data: PaginatedData<T>
  error?: string
}

export interface ShippingTrackingInfo {
  status: 'tracked' | 'no_tracking'
  message?: string
  tracking_ref?: string
  carrier_name?: string
  carrier_code?: string
  tracking_url?: string
  shipment_date?: string
  tracking_info?: OrderTracking[]
}

// ==================== SUBSCRIPTIONS ====================

export interface SubscriptionPlan {
  id: number
  name: string
  code: 'starter' | 'pro' | 'enterprise'
  price_monthly: number
  price_yearly: number
  max_users: number
  max_products: number
  max_orders_per_year: number
  support_level: 'email_48h' | 'email_chat_24h' | 'dedicated_2h'
  features: string[]
  description?: string
  is_popular: boolean
  display_order: number
}

export interface SubscriptionUsage {
  current: number
  limit: number
  is_limit_reached: boolean
  percentage: number
}

export interface Subscription {
  id: number
  name: string
  partner: {
    id: number
    name: string
    email: string
  }
  plan: {
    id: number
    name: string
    code: string
  }
  state: 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired'
  billing_cycle: 'monthly' | 'yearly'
  start_date: string | null
  trial_end_date: string | null
  next_billing_date: string | null
  end_date: string | null
  usage: {
    users: SubscriptionUsage
    products: SubscriptionUsage
    orders: SubscriptionUsage
  }
  stripe_subscription_id?: string
  stripe_customer_id?: string
}

export interface SubscriptionListItem {
  id: number
  name: string
  partner_name: string
  partner_email: string
  plan_name: string
  plan_code: string
  state: 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired'
  billing_cycle: 'monthly' | 'yearly'
  start_date: string | null
  next_billing_date: string | null
  current_users_count: number
  max_users: number
  current_products_count: number
  max_products: number
  current_orders_count: number
  max_orders_per_year: number
}

export interface SubscriptionCreateData {
  plan_id: number
  billing_cycle: 'monthly' | 'yearly'
}
