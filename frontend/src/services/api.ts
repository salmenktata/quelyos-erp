import axios from 'axios'
import { ApiResponse, Product, Category } from '@/types'

const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const api = {
  // Health
  health: async () => {
    const response = await apiClient.get('/health')
    return response.data
  },

  // Products
  getProducts: async (params?: {
    limit?: number
    offset?: number
    category?: string
    search?: string
  }): Promise<ApiResponse<Product[]>> => {
    const response = await apiClient.get('/products', { params })
    return response.data
  },

  getProduct: async (id: number): Promise<ApiResponse<Product>> => {
    const response = await apiClient.get(`/products/${id}`)
    return response.data
  },

  // Categories
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    const response = await apiClient.get('/categories')
    return response.data
  },

  // Auth
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password })
    return response.data
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout')
    return response.data
  },

  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post('/auth/refresh', {
      refresh_token: refreshToken,
    })
    return response.data
  },

  // Cart & Orders
  getCart: async () => {
    const response = await apiClient.get('/cart')
    return response.data
  },

  addToCart: async (productId: number, quantity: number) => {
    const response = await apiClient.post('/cart', {
      product_id: productId,
      quantity,
    })
    return response.data
  },

  checkout: async (data: {
    shipping_address: string
    payment_method: string
  }) => {
    const response = await apiClient.post('/checkout', data)
    return response.data
  },

  getOrders: async () => {
    const response = await apiClient.get('/orders')
    return response.data
  },

  getOrder: async (id: number) => {
    const response = await apiClient.get(`/orders/${id}`)
    return response.data
  },
}
