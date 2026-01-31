import { useQuery, useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query'
import { backendRpc } from '@/lib/backend-rpc'
import type { ReorderingRule } from '@/types/stock'
import { logger } from '@quelyos/logger'

interface UseReorderingRulesParams {
  warehouse_id?: number
  warehouseId?: number
  active?: boolean
  triggered?: boolean
  status?: string
}

export function useReorderingRules(params?: UseReorderingRulesParams) {
  const warehouse_id = params?.warehouse_id || params?.warehouseId

  const query = useQuery({
    queryKey: ['stock', 'reordering-rules', warehouse_id, params],
    queryFn: async () => {
      try {
        const response = await backendRpc('/api/ecommerce/stock/reordering-rules', {
          warehouse_id,
          active: params?.active,
          triggered: params?.triggered,
        })

        if (!response.success) {
          logger.error('[useReorderingRules] API error:', response.error)
          throw new Error(response.error || 'Échec du chargement des règles')
        }

        return response.data as { rules: ReorderingRule[]; total: number }
      } catch (error) {
        logger.error('[useReorderingRules] Fetch error:', error)
        throw error
      }
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })

  return {
    ...query,
    data: query.data?.rules || [],
    rules: query.data?.rules || [],
    total: query.data?.total || 0,
    isPending: query.isPending,
    isLoading: query.isPending,
    error: query.error,
    refetch: query.refetch,
    refresh: query.refetch,
  }
}

export function useCreateReorderingRule() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (params: Partial<ReorderingRule>) => {
      const response = await backendRpc('/api/ecommerce/stock/reordering-rules/create', params)
      if (!response.success) {
        throw new Error(response.error || 'Échec de la création de la règle')
      }
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock', 'reordering-rules'] })
      logger.info('[useCreateReorderingRule] Rule created successfully')
    },
    onError: (error) => {
      logger.error('[useCreateReorderingRule] Error:', error)
    },
  })

  return {
    mutate: (data: Partial<ReorderingRule>, options?: UseMutationOptions<any, Error, Partial<ReorderingRule>>) => 
      mutation.mutate(data, options as any),
    mutateAsync: async (data: Partial<ReorderingRule>) => mutation.mutateAsync(data),
    isPending: mutation.isPending,
    isLoading: mutation.isPending,
  }
}

export function useUpdateReorderingRule() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (params: Partial<ReorderingRule> & { id: number }) => {
      const { id, ...data } = params
      const response = await backendRpc(`/api/ecommerce/stock/reordering-rules/${id}/update`, data)
      if (!response.success) {
        throw new Error(response.error || 'Échec de la mise à jour de la règle')
      }
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock', 'reordering-rules'] })
      logger.info('[useUpdateReorderingRule] Rule updated successfully')
    },
    onError: (error) => {
      logger.error('[useUpdateReorderingRule] Error:', error)
    },
  })

  return {
    mutate: (data: Partial<ReorderingRule> & { id: number }, options?: UseMutationOptions<any, Error, Partial<ReorderingRule> & { id: number }>) => 
      mutation.mutate(data, options as any),
    mutateAsync: async (data: Partial<ReorderingRule> & { id: number }) => {
      return mutation.mutateAsync(data)
    },
    isPending: mutation.isPending,
    isLoading: mutation.isPending,
  }
}

export function useDeleteReorderingRule() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (ruleId: number) => {
      const response = await backendRpc(`/api/ecommerce/stock/reordering-rules/${ruleId}/delete`, {})
      if (!response.success) {
        throw new Error(response.error || 'Échec de la suppression de la règle')
      }
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock', 'reordering-rules'] })
      logger.info('[useDeleteReorderingRule] Rule deleted successfully')
    },
    onError: (error) => {
      logger.error('[useDeleteReorderingRule] Error:', error)
    },
  })

  return {
    mutate: (id: number, options?: UseMutationOptions<any, Error, number>) => 
      mutation.mutate(id, options as any),
    mutateAsync: async (id: number) => mutation.mutateAsync(id),
    isPending: mutation.isPending,
    isLoading: mutation.isPending,
  }
}

export function useToggleReorderingRule() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      const response = await backendRpc(`/api/ecommerce/stock/reordering-rules/${id}/update`, { active })
      if (!response.success) {
        throw new Error(response.error || 'Échec de la modification de la règle')
      }
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock', 'reordering-rules'] })
      logger.info('[useToggleReorderingRule] Rule toggled successfully')
    },
    onError: (error) => {
      logger.error('[useToggleReorderingRule] Error:', error)
    },
  })

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isLoading: mutation.isPending,
  }
}
