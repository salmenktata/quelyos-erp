import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export interface LowStockAlert {
  id: number
  name: string
  sku: string
  current_stock: number
  threshold: number
  diff: number
  image_url: string | null
  list_price: number
  category: string
}

export interface HighStockAlert {
  id: number
  name: string
  sku: string
  current_stock: number
  threshold: number
  diff: number
  image_url: string | null
  list_price: number
  category: string
}

// Hook pour les alertes de stock bas
export function useLowStockAlerts(params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['low-stock-alerts', params],
    queryFn: () => api.getLowStockAlerts(params),
    refetchInterval: 60000, // Rafraîchir toutes les minutes
  })
}

// Hook pour les alertes de surstock
export function useHighStockAlerts(params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['high-stock-alerts', params],
    queryFn: () => api.getHighStockAlerts(params),
    refetchInterval: 60000, // Rafraîchir toutes les minutes
  })
}

// Hook pour lister tous les produits avec leur stock
export function useStockProducts(params?: { limit?: number; offset?: number; search?: string }) {
  return useQuery({
    queryKey: ['stock-products', params],
    queryFn: () => api.getStockProducts(params),
  })
}

// Hook pour mettre à jour le stock d'un produit
export function useUpdateProductStock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) =>
      api.updateProductStock(productId, quantity),
    onSuccess: () => {
      // Invalider les requêtes liées au stock pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['stock-products'] })
      queryClient.invalidateQueries({ queryKey: ['low-stock-alerts'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

// Hook pour préparer un inventaire physique
export function usePrepareInventory() {
  return useMutation({
    mutationFn: (params?: { category_id?: number; search?: string }) =>
      api.prepareInventory(params),
  })
}

// Hook pour valider un inventaire physique (ajustements en masse)
export function useValidateInventory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (adjustments: Array<{ product_id: number; new_qty: number }>) =>
      api.validateInventory(adjustments),
    onSuccess: () => {
      // Invalider toutes les requêtes stock après validation inventaire
      queryClient.invalidateQueries({ queryKey: ['stock-products'] })
      queryClient.invalidateQueries({ queryKey: ['low-stock-alerts'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

// Hook pour lister les mouvements de stock
export function useStockMoves(params?: { limit?: number; offset?: number; product_id?: number }) {
  return useQuery({
    queryKey: ['stock-moves', params],
    queryFn: () => api.getStockMoves(params),
  })
}

// Hook pour exporter le stock en CSV
export function useExportStock() {
  return useMutation({
    mutationFn: (filters: { date_from?: string; date_to?: string }) =>
      api.exportStockCSV(filters),
  })
}

// Hook pour mettre à jour le stock d'une variante
export function useUpdateVariantStock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productId, variantId, quantity }: { productId: number; variantId: number; quantity: number }) =>
      api.updateVariantStock(productId, variantId, quantity),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['stock-products'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['product-variants', variables.productId] })
    },
  })
}

// Hook pour récupérer les variantes d'un produit
export function useProductVariants(productId: number | null) {
  return useQuery({
    queryKey: ['product-variants', productId],
    queryFn: () => api.getProductVariants(productId!),
    enabled: !!productId,
  })
}

// ==================== OCA STOCK HOOKS ====================

// Hook pour lister les raisons de changement de stock (OCA)
export function useStockChangeReasons() {
  return useQuery({
    queryKey: ['stock-change-reasons'],
    queryFn: () => api.getStockChangeReasons(),
  })
}

// Hook pour ajuster le stock avec une raison (OCA)
export function useAdjustStockWithReason() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: {
      product_id: number
      location_id: number
      new_quantity: number
      reason_id?: number
      notes?: string
    }) => api.adjustStockWithReason(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-products'] })
      queryClient.invalidateQueries({ queryKey: ['stock-moves'] })
      queryClient.invalidateQueries({ queryKey: ['low-stock-alerts'] })
    },
  })
}

// Hook pour lister les inventaires OCA
export function useStockInventoriesOCA(params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['stock-inventories-oca', params],
    queryFn: () => api.getStockInventoriesOCA(params),
  })
}

// Hook pour lister les emplacements verrouillés (OCA)
export function useLocationLocks() {
  return useQuery({
    queryKey: ['location-locks'],
    queryFn: () => api.getLocationLocks(),
  })
}

// Hook pour verrouiller/déverrouiller un emplacement (OCA)
export function useLockLocation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ locationId, lock }: { locationId: number; lock: boolean }) =>
      api.lockLocation(locationId, lock),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['location-locks'] })
      queryClient.invalidateQueries({ queryKey: ['stock-locations'] })
    },
  })
}
