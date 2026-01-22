import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { Product } from '@/types'
import ProductCard from '@/components/ProductCard'
import { Loader2 } from 'lucide-react'

export default function ProductsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.getProducts(),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Erreur lors du chargement des produits</p>
      </div>
    )
  }

  const products: Product[] = data?.data || []

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nos Produits</h1>

      {products.length === 0 ? (
        <p className="text-gray-500 text-center py-12">Aucun produit disponible</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
