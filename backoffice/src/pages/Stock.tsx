import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { useLowStockAlerts, useStockProducts, useUpdateProductStock } from '../hooks/useStock'
import { Badge, Button, Breadcrumbs, SkeletonTable, Input } from '../components/common'
import { useToast } from '../contexts/ToastContext'
import {
  ExclamationTriangleIcon,
  ShoppingBagIcon,
  CubeIcon,
  CheckIcon,
  XMarkIcon,
  PencilIcon,
} from '@heroicons/react/24/outline'
import type { StockProduct } from '../types'

type TabType = 'products' | 'alerts'

export default function Stock() {
  const [activeTab, setActiveTab] = useState<TabType>('products')
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [editingProductId, setEditingProductId] = useState<number | null>(null)
  const [editingQuantity, setEditingQuantity] = useState<string>('')
  const limit = 20

  const toast = useToast()

  // Queries
  const {
    data: productsData,
    isLoading: isLoadingProducts,
    error: errorProducts,
  } = useStockProducts({
    limit,
    offset: page * limit,
    search: search || undefined,
  })

  const {
    data: alertsData,
    isLoading: isLoadingAlerts,
    error: errorAlerts,
  } = useLowStockAlerts({
    limit,
    offset: page * limit,
  })

  const updateStockMutation = useUpdateProductStock()

  // Helpers
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price)
  }

  const getAlertSeverity = (diff: number): 'error' | 'warning' => {
    return diff > 5 ? 'warning' : 'error'
  }

  const getStockBadgeVariant = (
    status: 'in_stock' | 'low_stock' | 'out_of_stock'
  ): 'success' | 'warning' | 'error' => {
    if (status === 'in_stock') return 'success'
    if (status === 'low_stock') return 'warning'
    return 'error'
  }

  const getStockLabel = (status: 'in_stock' | 'low_stock' | 'out_of_stock') => {
    if (status === 'in_stock') return 'En stock'
    if (status === 'low_stock') return 'Stock faible'
    return 'Rupture'
  }

  // Actions
  const handleStartEdit = (productId: number, currentQty: number) => {
    setEditingProductId(productId)
    setEditingQuantity(currentQty.toString())
  }

  const handleCancelEdit = () => {
    setEditingProductId(null)
    setEditingQuantity('')
  }

  const handleSaveEdit = async (productId: number) => {
    const quantity = parseFloat(editingQuantity)

    if (isNaN(quantity) || quantity < 0) {
      toast.error('Quantité invalide')
      return
    }

    try {
      await updateStockMutation.mutateAsync({ productId, quantity })
      toast.success('Stock mis à jour avec succès')
      setEditingProductId(null)
      setEditingQuantity('')
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du stock')
    }
  }

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    setPage(0) // Reset pagination
    setSearch('') // Reset search
  }

  // Data
  const products = (productsData?.data?.products as StockProduct[]) || []
  const productsTotal = (productsData?.data?.total as number) || 0

  const alerts = alertsData?.data?.alerts || []
  const alertsTotal = alertsData?.data?.total || 0

  const isLoading = activeTab === 'products' ? isLoadingProducts : isLoadingAlerts
  const error = activeTab === 'products' ? errorProducts : errorAlerts

  return (
    <Layout>
      <div className="p-8">
        <Breadcrumbs
          items={[
            { label: 'Tableau de bord', href: '/dashboard' },
            { label: 'Stock' },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion du Stock</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Visualisez et gérez les niveaux de stock de vos produits
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => handleTabChange('products')}
                className={`
                  group inline-flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === 'products'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
              >
                <CubeIcon className="h-5 w-5" />
                Tous les Produits
                {productsTotal > 0 && (
                  <Badge variant="info" className="ml-2">
                    {productsTotal}
                  </Badge>
                )}
              </button>

              <button
                onClick={() => handleTabChange('alerts')}
                className={`
                  group inline-flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === 'alerts'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
              >
                <ExclamationTriangleIcon className="h-5 w-5" />
                Alertes Stock Bas
                {alertsTotal > 0 && (
                  <Badge variant="error" className="ml-2">
                    {alertsTotal}
                  </Badge>
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* Search bar (Products tab only) */}
        {activeTab === 'products' && (
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Rechercher un produit (nom ou SKU)..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(0) // Reset page when search changes
              }}
              className="max-w-md"
            />
          </div>
        )}

        {/* Alert banner (Alerts tab only) */}
        {activeTab === 'alerts' && !isLoading && alertsTotal > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                <ExclamationTriangleIcon className="h-12 w-12 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                  {alertsTotal} produit{alertsTotal > 1 ? 's' : ''} en stock bas
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                  Ces produits sont sous le seuil d'alerte et nécessitent un réapprovisionnement.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {isLoading ? (
            <SkeletonTable rows={10} columns={activeTab === 'products' ? 7 : 6} />
          ) : error ? (
            <div className="p-8 text-center text-red-600 dark:text-red-400">
              Erreur lors du chargement des données
            </div>
          ) : activeTab === 'products' && products.length > 0 ? (
            <>
              {/* Products Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Produit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Référence
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Catégorie
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Prix
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {products.map((product) => (
                      <tr
                        key={product.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-12 h-12 rounded object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <ShoppingBagIcon className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <Link
                                to={`/products/${product.id}`}
                                className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                              >
                                {product.name}
                              </Link>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 dark:text-white font-mono">
                            {product.sku || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {product.category || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingProductId === product.id ? (
                            <Input
                              type="number"
                              value={editingQuantity}
                              onChange={(e) => setEditingQuantity(e.target.value)}
                              className="w-24"
                              min="0"
                              step="1"
                              autoFocus
                            />
                          ) : (
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {product.qty_available} unités
                              </span>
                              {product.incoming_qty > 0 || product.outgoing_qty > 0 ? (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {product.incoming_qty > 0 && `+${product.incoming_qty} entrant`}
                                  {product.incoming_qty > 0 && product.outgoing_qty > 0 && ' / '}
                                  {product.outgoing_qty > 0 && `-${product.outgoing_qty} sortant`}
                                </span>
                              ) : null}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={getStockBadgeVariant(product.stock_status)}>
                            {getStockLabel(product.stock_status)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatPrice(product.list_price || 0)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingProductId === product.id ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleSaveEdit(product.id)}
                                disabled={updateStockMutation.isPending}
                                className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
                                title="Sauvegarder"
                              >
                                <CheckIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                disabled={updateStockMutation.isPending}
                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                                title="Annuler"
                              >
                                <XMarkIcon className="h-5 w-5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() =>
                                handleStartEdit(product.id, product.qty_available)
                              }
                              className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                              title="Modifier le stock"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {productsTotal > limit && (
                <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Affichage {page * limit + 1} à {Math.min((page + 1) * limit, productsTotal)}{' '}
                    sur {productsTotal}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                    >
                      Précédent
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={(page + 1) * limit >= productsTotal}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : activeTab === 'alerts' && alerts.length > 0 ? (
            <>
              {/* Alerts Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Produit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Référence
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Catégorie
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Stock actuel
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Seuil
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Prix
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {alerts.map((alert) => (
                      <tr
                        key={alert.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {alert.image_url ? (
                              <img
                                src={alert.image_url}
                                alt={alert.name}
                                className="w-12 h-12 rounded object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <ShoppingBagIcon className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <Link
                                to={`/products/${alert.id}`}
                                className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                              >
                                {alert.name}
                              </Link>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 dark:text-white font-mono">
                            {alert.sku || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {alert.category || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={getAlertSeverity(alert.diff)}>
                            {alert.current_stock} unités
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 dark:text-white">
                            {alert.threshold} unités
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatPrice(alert.list_price)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {alertsTotal > limit && (
                <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Affichage {page * limit + 1} à {Math.min((page + 1) * limit, alertsTotal)} sur{' '}
                    {alertsTotal}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                    >
                      Précédent
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={(page + 1) * limit >= alertsTotal}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {activeTab === 'products' ? 'Aucun produit trouvé' : 'Tout va bien !'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {activeTab === 'products'
                  ? search
                    ? 'Aucun produit ne correspond à votre recherche.'
                    : 'Aucun produit trouvé dans votre catalogue.'
                  : 'Aucun produit en stock bas pour le moment. Les niveaux de stock sont corrects.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
