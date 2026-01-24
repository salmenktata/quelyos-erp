import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

export interface PaymentTransaction {
  id: number
  reference: string
  provider_reference: string
  amount: number
  currency: string
  state: string
  state_label: string
  provider: {
    id: number | null
    name: string
  }
  partner: {
    id: number | null
    name: string
    email: string
  }
  order: {
    id: number
    name: string
  } | null
  create_date: string | null
  last_state_change: string | null
}

export interface PaymentStats {
  total: number
  done: number
  pending: number
  error: number
  canceled: number
  total_amount: number
}

export function usePaymentTransactions(params?: {
  limit?: number
  offset?: number
  state?: string
  search?: string
}) {
  return useQuery({
    queryKey: ['payment-transactions', params],
    queryFn: () => api.getPaymentTransactions(params),
  })
}

export function usePaymentTransaction(id: number) {
  return useQuery({
    queryKey: ['payment-transaction', id],
    queryFn: () => api.getPaymentTransaction(id),
    enabled: !!id,
  })
}
