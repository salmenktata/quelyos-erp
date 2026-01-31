import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { backendRpc } from '@/lib/backend-rpc'
export { useStockLocations } from "./useStockLocations"
import type { StockTransfer } from '@/types/stock'
import { logger } from '@quelyos/logger'

interface UseStockTransfersParams {
  warehouse_id?: number
  state?: string
  limit?: number
  offset?: number
}

export function useStockTransfers(params?: UseStockTransfersParams) {
  const query = useQuery({
    queryKey: ['stock', 'transfers', params],
    queryFn: async () => {
      const response = await backendRpc('/api/ecommerce/stock/transfers', params || {})
      if (!response.success) {
        logger.error('[useStockTransfers] API error:', response.error)
        throw new Error(response.error || 'Échec du chargement des transferts')
      }
      return (response.data as any)?.transfers || response.data || []
    },
    staleTime: 2 * 60 * 1000,
  })

  return {
    ...query,
    data: query.data || [],
    isPending: query.isPending,
  }
}

export function useCreateTransfer() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (params: Partial<StockTransfer>) => {
      const response = await backendRpc('/api/ecommerce/stock/transfers/create', params)
      if (!response.success) {
        throw new Error(response.error || 'Échec de la création du transfert')
      }
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock', 'transfers'] })
      logger.info('[useCreateTransfer] Transfer created')
    },
  })

  return {
    mutate: (data: Partial<StockTransfer>) => mutation.mutate(data),
    mutateAsync: async (data: Partial<StockTransfer>) => mutation.mutateAsync(data),
    isPending: mutation.isPending,
    isLoading: mutation.isPending,
  }
}

export function useValidateTransfer() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (transferId: number) => {
      const response = await backendRpc(`/api/ecommerce/stock/transfers/${transferId}/validate`, {})
      if (!response.success) {
        throw new Error(response.error || 'Échec de la validation')
      }
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock', 'transfers'] })
    },
  })

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isLoading: mutation.isPending,
  }
}

export function useCancelTransfer() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (transferId: number) => {
      const response = await backendRpc(`/api/ecommerce/stock/transfers/${transferId}/cancel`, {})
      if (!response.success) {
        throw new Error(response.error || 'Échec de l\'annulation')
      }
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock', 'transfers'] })
    },
  })

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isLoading: mutation.isPending,
  }
}

// Export compatibility
export { useStockTransfers as useStockTransfersList }
