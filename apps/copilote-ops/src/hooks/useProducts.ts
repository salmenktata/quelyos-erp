/**
 * Hook pour la liste des produits
 */
import { useState } from 'react'

export interface Product {
  id: number
  name: string
  sku: string
  price: number
  stockQuantity: number
}

export function useProducts() {
  const [isLoading] = useState(false)
  const [data] = useState<Product[]>([])
  return { data, isLoading, error: null }
}
