import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { CustomerListItem } from '@/types'

interface CustomersResponse {
  data: {
    customers: CustomerListItem[]
    total: number
  }
}

export function useCustomers(params?: { limit?: number; offset?: number; search?: string }) {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => api.getCustomers(params) as Promise<CustomersResponse>,
  })
}
