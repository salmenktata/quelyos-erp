/**
 * Hook pour la gestion des entrepôts
 */
import { useState, useCallback } from 'react'

export interface Warehouse {
  id: number
  name: string
  code: string
  address?: string
  active: boolean
}

export type CreateWarehouseData = Partial<Warehouse>

export function useWarehouses() {
  const [isLoading] = useState(false)
  const [data] = useState<Warehouse[]>([])
  const refresh = useCallback(() => { /* API */ }, [])
  return { data, isLoading, error: null, refresh }
}

export function useCreateWarehouse() {
  const mutate = useCallback(async (_data: CreateWarehouseData) => { /* API */ }, [])
  return { mutate, isLoading: false }
}
