import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { backendRpc } from '@/lib/backend-rpc'
import { buildLocationTree } from '@/lib/stock/tree-utils'
import type { StockLocation, CreateLocationParams, UpdateLocationParams } from '@/types/stock'
import { logger } from '@quelyos/logger'
import { useMemo } from 'react'

interface UseLocationsTreeParams {
  warehouse_id?: number
  warehouseId?: number
  usage?: 'internal' | 'view'
  active?: boolean
  internal_only?: boolean
}

export function useLocationsTree(params?: UseLocationsTreeParams) {
  const warehouse_id = params?.warehouse_id || params?.warehouseId

  const query = useQuery({
    queryKey: ['stock', 'locations', 'tree', warehouse_id, params],
    queryFn: async () => {
      try {
        const response = await backendRpc('/api/ecommerce/stock/locations/tree', { 
          warehouse_id,
          internal_only: params?.internal_only,
        })
        if (!response.success) {
          logger.error('[useLocationsTree] API error:', response.error)
          throw new Error(response.error || 'Échec du chargement des emplacements')
        }
        return ((response.data as any)?.locations as StockLocation[]) || []
      } catch (error) {
        logger.error('[useLocationsTree] Fetch error:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  const tree = useMemo(() => {
    if (!query.data) return []
    return buildLocationTree(query.data)
  }, [query.data])

  return {
    ...query,
    data: query.data || [],
    tree,
    locations: query.data || [],
    isPending: query.isPending,
    isLoading: query.isPending,
    error: query.error,
  }
}

export function useStockLocations(params?: UseLocationsTreeParams) {
  return useLocationsTree(params)
}

export function useCreateLocation() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (params: CreateLocationParams | Partial<StockLocation>) => {
      const response = await backendRpc('/api/ecommerce/stock/locations/create', params)
      if (!response.success) {
        throw new Error(response.error || 'Échec de la création de l\'emplacement')
      }
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock', 'locations'] })
      logger.info('[useCreateLocation] Location created successfully')
    },
    onError: (error) => {
      logger.error('[useCreateLocation] Error:', error)
    },
  })

  return {
    mutate: (data: Partial<StockLocation>, options?: any) => mutation.mutate(data, options),
    mutateAsync: async (data: Partial<StockLocation>) => mutation.mutateAsync(data),
    isPending: mutation.isPending,
    isLoading: mutation.isPending,
  }
}

export function useUpdateLocation() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (params: { id: number; data: Partial<StockLocation> }) => {
      const response = await backendRpc(`/api/ecommerce/stock/locations/${params.id}/update`, params.data)
      if (!response.success) {
        throw new Error(response.error || 'Échec de la mise à jour de l\'emplacement')
      }
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock', 'locations'] })
      logger.info('[useUpdateLocation] Location updated successfully')
    },
    onError: (error) => {
      logger.error('[useUpdateLocation] Error:', error)
    },
  })

  return {
    mutate: (id: number, data: Partial<StockLocation>, options?: any) => mutation.mutate({ id, data }, options),
    mutateAsync: async (id: number, data: Partial<StockLocation>) => mutation.mutateAsync({ id, data }),
    isPending: mutation.isPending,
    isLoading: mutation.isPending,
  }
}

export function useArchiveLocation() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (locationId: number) => {
      const response = await backendRpc(`/api/ecommerce/stock/locations/${locationId}/archive`, {})
      if (!response.success) {
        throw new Error(response.error || 'Échec de l\'archivage de l\'emplacement')
      }
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock', 'locations'] })
      logger.info('[useArchiveLocation] Location archived successfully')
    },
    onError: (error) => {
      logger.error('[useArchiveLocation] Error:', error)
    },
  })

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isLoading: mutation.isPending,
  }
}

export function useMoveLocation() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({ id, new_parent_id }: { id: number; new_parent_id: number }) => {
      const response = await backendRpc(`/api/ecommerce/stock/locations/${id}/move`, { new_parent_id })
      if (!response.success) {
        throw new Error(response.error || 'Échec du déplacement de l\'emplacement')
      }
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock', 'locations'] })
      logger.info('[useMoveLocation] Location moved successfully')
    },
    onError: (error) => {
      logger.error('[useMoveLocation] Error:', error)
    },
  })

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isLoading: mutation.isPending,
  }
}
