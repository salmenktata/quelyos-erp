import { Link } from 'react-router-dom'
import { ArrowRight, ShoppingBag, Smartphone, BarChart3 } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Bienvenue sur Quelyos ERP
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Plateforme omnicanal pour le retail: POS, E-commerce et Mobile unifies
          en temps reel.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Voir les produits
          <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <ShoppingBag className="w-12 h-12 text-blue-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">POS Integre</h3>
          <p className="text-gray-600">
            Point de vente connecte en temps reel avec votre inventaire.
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <Smartphone className="w-12 h-12 text-blue-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Application Mobile</h3>
          <p className="text-gray-600">
            Application native pour vos clients, generee automatiquement.
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <BarChart3 className="w-12 h-12 text-blue-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Analytics</h3>
          <p className="text-gray-600">
            Tableau de bord en temps reel pour suivre vos performances.
          </p>
        </div>
      </section>
    </div>
  )
}
