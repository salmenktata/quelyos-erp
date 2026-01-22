import { useCartStore } from '@/stores/cartStore'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Votre panier est vide
        </h2>
        <p className="text-gray-500 mb-6">
          Decouvrez nos produits et ajoutez-les au panier.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Voir les produits
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mon Panier</h1>
        <button
          onClick={clearCart}
          className="text-red-600 hover:text-red-700 text-sm"
        >
          Vider le panier
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="bg-white rounded-lg border p-4 flex gap-4"
            >
              <img
                src={item.product.image_url}
                alt={item.product.name}
                className="w-24 h-24 object-cover rounded-lg bg-gray-100"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {item.product.name}
                </h3>
                <p className="text-blue-600 font-medium">
                  {item.product.price.toFixed(2)} {item.product.currency}
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() =>
                      updateQuantity(item.product.id, item.quantity - 1)
                    }
                    className="p-1 rounded border hover:bg-gray-50"
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() =>
                      updateQuantity(item.product.id, item.quantity + 1)
                    }
                    className="p-1 rounded border hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  {(item.product.price * item.quantity).toFixed(2)}{' '}
                  {item.product.currency}
                </p>
                <button
                  onClick={() => removeItem(item.product.id)}
                  className="text-red-500 hover:text-red-600 mt-2"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg border p-6 h-fit">
          <h2 className="text-lg font-semibold mb-4">Resume de commande</h2>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-600">
              <span>Sous-total</span>
              <span>{total().toFixed(2)} TND</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Livraison</span>
              <span>Calcule au checkout</span>
            </div>
          </div>
          <div className="border-t pt-4 mb-6">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>{total().toFixed(2)} TND</span>
            </div>
          </div>
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition">
            Commander
          </button>
        </div>
      </div>
    </div>
  )
}
