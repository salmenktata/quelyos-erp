import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

interface CustomerDetail {
  id: number
  name: string
  email: string
  phone?: string
  mobile?: string
  street?: string
  city?: string
  zip?: string
  country?: string
  orders_count?: number
  total_spent?: number
  create_date?: string
  [key: string]: unknown
}

interface CustomerResponse {
  customer: CustomerDetail
}

export function useCustomer(id: number) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => api.getCustomer(id) as Promise<CustomerResponse>,
    enabled: !!id,
  })
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: {
        name?: string
        email?: string
        phone?: string
        mobile?: string
        street?: string
        city?: string
        zip?: string
      }
    }) => api.updateCustomer(id, data) as Promise<{ success: boolean }>,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}
