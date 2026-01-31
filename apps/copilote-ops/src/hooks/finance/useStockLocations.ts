/**
 * Hook pour les emplacements de stock
 */
import { useState, useCallback } from 'react'

export interface StockLocation {
  id: number
  name: string
  completeName: string
  warehouseId: number | null
  warehouseName: string
  parentId: number | null
  locationType: string
  usage: string
  stockQuantity: number
  active: boolean
}

export function useStockLocations() {
  const [isLoading] = useState(false)
  const [data] = useState<StockLocation[]>([])
  const refresh = useCallback(() => { /* API */ }, [])
  return { data, isLoading, error: null, refresh }
}

export function useCreateStockLocation() {
  const mutate = useCallback(async (_data: Partial<StockLocation>) => { /* API */ }, [])
  return { mutate, isLoading: false }
}

export function useUpdateStockLocation() {
  const mutate = useCallback(async (_id: number, _data: Partial<StockLocation>) => { /* API */ }, [])
  return { mutate, isLoading: false }
}

// Aliases
export const useCreateLocation = useCreateStockLocation
export const useUpdateLocation = useUpdateStockLocation

export function useLocationsTree() {
  const [isLoading] = useState(false)
  const [data] = useState<StockLocation[]>([])
  return { data, isLoading, error: null }
}
