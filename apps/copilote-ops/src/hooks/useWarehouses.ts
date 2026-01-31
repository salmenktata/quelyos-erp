import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { backendRpc } from '@/lib/backend-rpc'
import type { Warehouse, CreateWarehouseParams, UpdateWarehouseParams } from '@/types/stock'
import { logger } from '@quelyos/logger'

interface UseWarehousesParams {
  active_only?: boolean
  active?: boolean
}

export function useWarehouses(params?: UseWarehousesParams) {
  const query = useQuery({
    queryKey: ['stock', 'warehouses', params],
    queryFn: async () => {
      const response = await backendRpc('/api/ecommerce/stock/warehouses', params || {})
      if (!response.success) {
        logger.error('[useWarehouses] API error:', response.error)
        throw new Error(response.error || 'Échec du chargement des entrepôts')
      }
      return (response.data as any)?.warehouses || response.data || []
    },
    staleTime: 5 * 60 * 1000,
  })

  return {
    ...query,
    data: query.data || [],
    isPending: query.isPending,
  }
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (params: CreateWarehouseParams) => {
      const response = await backendRpc('/api/ecommerce/stock/warehouses/create', params)
      if (!response.success) {
        throw new Error(response.error || 'Échec de la création de l\'entrepôt')
      }
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock', 'warehouses'] })
      logger.info('[useCreateWarehouse] Warehouse created')
    },
  })

  return {
    mutate: (data: CreateWarehouseParams, options?: any) => mutation.mutate(data, options),
    mutateAsync: async (data: CreateWarehouseParams) => mutation.mutateAsync(data),
    isPending: mutation.isPending,
    isLoading: mutation.isPending,
  }
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (params: { id: number; data: UpdateWarehouseParams }) => {
      const response = await backendRpc(`/api/ecommerce/stock/warehouses/${params.id}/update`, params.data)
      if (!response.success) {
        throw new Error(response.error || 'Échec de la mise à jour')
      }
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock', 'warehouses'] })
    },
  })

  return {
    mutate: (id: number, data: UpdateWarehouseParams, options?: any) => mutation.mutate({ id, data }, options),
    mutateAsync: async (id: number, data: UpdateWarehouseParams) => mutation.mutateAsync({ id, data }),
    isPending: mutation.isPending,
    isLoading: mutation.isPending,
  }
}

export type CreateWarehouseData = CreateWarehouseParams
