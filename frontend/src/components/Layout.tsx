import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Store, Home } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const cartItemsCount = useCartStore((state) => state.items.length)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Store className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Quelyos</span>
            </Link>

            <nav className="flex items-center gap-6">
              <Link
                to="/"
                className="flex items-center gap-1 text-gray-600 hover:text-blue-600"
              >
                <Home className="w-5 h-5" />
                <span>Accueil</span>
              </Link>
              <Link
                to="/products"
                className="flex items-center gap-1 text-gray-600 hover:text-blue-600"
              >
                <Store className="w-5 h-5" />
                <span>Produits</span>
              </Link>
              <Link
                to="/cart"
                className="flex items-center gap-1 text-gray-600 hover:text-blue-600 relative"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Panier</span>
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-center text-gray-500 text-sm">
            &copy; 2026 Quelyos ERP. Tous droits reserves.
          </p>
        </div>
      </footer>
    </div>
  )
}
