export interface Product {
  id: number
  name: string
  description: string
  price: number
  currency: string
  stock: number
  sku: string
  barcode: string
  category: string
  image_url: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Category {
  id: number
  name: string
  parent_id: number | null
  parent_name: string | null
}

export interface ApiResponse<T> {
  data: T
  meta?: {
    total: number
    limit: number
    offset: number
    has_more: boolean
  }
}

export interface User {
  id: number
  name: string
  email: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface Order {
  id: number
  name: string
  date: string
  status: 'draft' | 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  currency: string
  items: OrderItem[]
}

export interface OrderItem {
  product_id: number
  product_name: string
  quantity: number
  price: number
  subtotal: number
}
