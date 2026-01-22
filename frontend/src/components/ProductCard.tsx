import { Product } from '@/types'
import { useCartStore } from '@/stores/cartStore'
import { ShoppingCart, Check } from 'lucide-react'
import { useState } from 'react'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)
  const [added, setAdded] = useState(false)

  const handleAddToCart = () => {
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition">
      <div className="aspect-square bg-gray-100">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg'
          }}
        />
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-500 mb-1">{product.category}</p>
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-blue-600">
              {product.price.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500 ml-1">{product.currency}</span>
          </div>
          <span
            className={`text-xs px-2 py-1 rounded ${
              product.stock > 0
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {product.stock > 0 ? `${product.stock} en stock` : 'Rupture'}
          </span>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`w-full mt-4 py-2 rounded-lg flex items-center justify-center gap-2 transition ${
            added
              ? 'bg-green-600 text-white'
              : product.stock > 0
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {added ? (
            <>
              <Check className="w-5 h-5" />
              Ajoute!
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" />
              Ajouter au panier
            </>
          )}
        </button>
      </div>
    </div>
  )
}
