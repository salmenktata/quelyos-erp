/**
 * Hook pour les données de stock
 */
import { useState, useCallback } from 'react'

export interface StockItem {
  id: number
  productId: number
  productName: string
  sku: string
  stockQuantity: number
  availableQuantity: number
  warehouseId: number
  warehouseName: string
  locationId: number
  locationName: string
}

export function useStock() {
  const [isLoading] = useState(false)
  const [data] = useState<StockItem[]>([])
  const refresh = useCallback(() => { /* API */ }, [])
  return { data, isLoading, error: null, refresh }
}

export function useStockAdjustment() {
  const mutate = useCallback(async (_productId: number, _qty: number, _reason?: string) => { /* API */ }, [])
  return { mutate, isLoading: false }
}

export function useExportStock() {
  const mutate = useCallback(async () => { /* API */ }, [])
  return { mutate, isLoading: false }
}

export function useUpdateProductStock() {
  const mutate = useCallback(async (_productId: number, _qty: number) => { /* API */ }, [])
  return { mutate, isLoading: false }
}

export function useUpdateVariantStock() {
  const mutate = useCallback(async (_variantId: number, _qty: number) => { /* API */ }, [])
  return { mutate, isLoading: false }
}

export function useStockProducts() {
  const [isLoading] = useState(false)
  const [data] = useState<StockItem[]>([])
  return { data, isLoading, error: null }
}
