import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export function useInvoices(params?: {
  limit?: number
  offset?: number
  state?: string
  search?: string
}) {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: () => api.getInvoices(params),
  })
}

export function useInvoice(id: number) {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => api.getInvoice(id),
    enabled: !!id,
  })
}

export function useCreateInvoiceFromOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderId: number) => api.createInvoiceFromOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

export function usePostInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (invoiceId: number) => api.postInvoice(invoiceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoice'] })
    },
  })
}
