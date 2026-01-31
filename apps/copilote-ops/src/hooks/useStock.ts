/**
 * Wrapper compatibility layer for Stock hooks
 * Adapts TanStack Query returns to component expectations
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { backendRpc } from '@/lib/backend-rpc'
import type { StockLocation, Warehouse, StockTransfer, Product } from '@/types/stock'
import { logger } from '@quelyos/logger'

// ══════════════════════════════════════════════════════════════════════
// PRODUCTS
// ══════════════════════════════════════════════════════════════════════

interface UseStockProductsParams {
  warehouse_id?: number
  category_id?: number
  search?: string
  limit?: number
  offset?: number
}

export function useStockProducts(params?: UseStockProductsParams) {
  const query = useQuery({
    queryKey: ['stock', 'products', params],
    queryFn: async () => {
      const response = await backendRpc('/api/ecommerce/stock/products', params || {})
      if (!response.success) {
        throw new Error(response.error || 'Erreur chargement produits')
      }
      return response.data as { data: Product[]; total: number }
    },
  })

  return {
    ...query,
    data: query.data,
    products: query.data?.data || [],
    total: query.data?.total || 0,
    isPending: query.isPending,
  }
}

// ══════════════════════════════════════════════════════════════════════
// STOCK ITEMS
// ══════════════════════════════════════════════════════════════════════

export interface StockItem {
  id: number
  product_id: number
  name: string
  sku: string
  qty_available: number
  location_id: number
  location_name: string
}

export function useStockItems(params?: { warehouse_id?: number }) {
  const query = useQuery({
    queryKey: ['stock', 'items', params],
    queryFn: async () => {
      const response = await backendRpc('/api/ecommerce/stock/items', params || {})
      if (!response.success) {
        throw new Error(response.error || 'Erreur chargement stock')
      }
      return response.data as StockItem[]
    },
  })

  return {
    ...query,
    data: query.data || [],
    isPending: query.isPending,
  }
}

// ══════════════════════════════════════════════════════════════════════
// STOCK ADJUSTMENT
// ══════════════════════════════════════════════════════════════════════

export function useAdjustStock() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({ productId, qty }: { productId: number; qty: number }) => {
      const response = await backendRpc('/api/ecommerce/stock/adjust', {
        product_id: productId,
        quantity: qty,
      })
      if (!response.success) {
        throw new Error(response.error || 'Erreur ajustement stock')
      }
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] })
    },
  })

  return {
    mutate: (productId: number, qty: number, options?: any) => mutation.mutate({ productId, qty }, options),
    mutateAsync: async (productId: number, qty: number) => mutation.mutateAsync({ productId, qty }),
    isPending: mutation.isPending,
    isLoading: mutation.isPending,
  }
}

// ══════════════════════════════════════════════════════════════════════
// STOCK EXPORT
// ══════════════════════════════════════════════════════════════════════

export function useExportStock() {
  const mutation = useMutation({
    mutationFn: async (params: { warehouse_id?: number; format?: string; date_from?: string; date_to?: string }) => {
      const response = await backendRpc('/api/ecommerce/stock/export', params)
      if (!response.success) {
        throw new Error(response.error || 'Erreur export stock')
      }
      return response
    },
  })

  return {
    mutate: (params: { warehouse_id?: number; format?: string; date_from?: string; date_to?: string }, options?: any) => mutation.mutate(params, options),
    mutateAsync: async (params: { warehouse_id?: number; format?: string; date_from?: string; date_to?: string }) => {
      return mutation.mutateAsync(params)
    },
    data: mutation.data,
    total: 0,
    isPending: mutation.isPending,
    isLoading: mutation.isPending,
  }
}

// ══════════════════════════════════════════════════════════════════════
// VARIANT STOCK
// ══════════════════════════════════════════════════════════════════════

export function useUpdateVariantStock() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({ variantId, qty }: { variantId: number; qty: number }) => {
      const response = await backendRpc(`/api/ecommerce/products/variants/${variantId}/stock`, {
        quantity: qty,
      })
      if (!response.success) {
        throw new Error(response.error || 'Erreur mise à jour stock variante')
      }
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  return {
    mutate: (variantId: number, qty: number, options?: any) => mutation.mutate({ variantId, qty }, options),
    mutateAsync: async (variantId: number, qty: number) => mutation.mutateAsync({ variantId, qty }),
    isPending: mutation.isPending,
    isLoading: mutation.isPending,
  }
}

export function useUpdateProductStock() { 
  return useAdjustStock() 
}
