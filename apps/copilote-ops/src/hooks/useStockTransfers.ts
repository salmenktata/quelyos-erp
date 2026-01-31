/**
 * Hook pour les transferts de stock
 */
import { useState, useCallback } from 'react'

export interface StockTransfer {
  id: number
  reference: string
  sourceWarehouse: string
  destWarehouse: string
  status: 'draft' | 'confirmed' | 'in_transit' | 'done' | 'cancelled'
  scheduledDate: string
  lines: Array<{ productName: string; quantity: number }>
}

export function useStockTransfers() {
  const [isLoading] = useState(false)
  const [data] = useState<StockTransfer[]>([])
  const refresh = useCallback(() => { /* API */ }, [])
  return { data, isLoading, error: null, refresh }
}

export function useCreateTransfer() {
  const mutateAsync = useCallback(async (_data: Partial<StockTransfer>) => { /* API */ }, [])
  return { mutate: mutateAsync, mutateAsync, isLoading: false, isPending: false }
}

export function useStockLocations() {
  const [isLoading] = useState(false)
  const [data] = useState<Array<{ id: number; name: string }>>([])
  return { data, isLoading, error: null }
}
