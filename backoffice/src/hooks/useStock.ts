import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export function useStockProducts(params?: { limit?: number; offset?: number; search?: string }) {
  return useQuery({
    queryKey: ['stock-products', params],
    queryFn: () => api.getStockProducts(params),
  })
}

export function useUpdateProductStock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) =>
      api.updateProductStock(productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-products'] })
    },
  })
}
