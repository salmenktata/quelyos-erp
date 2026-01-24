import { useState } from 'react'
import { Layout } from '../components/Layout'
import { useStockProducts, useStockMoves, useUpdateProductStock } from '../hooks/useStock'
import { Badge, Button, Breadcrumbs, SkeletonTable } from '../components/common'
import { useToast } from '../hooks/useToast'
import { ToastContainer } from '../components/common/Toast'
import type { StockProduct, StockMove } from '../types'

type ActiveTab = 'products' | 'movements'

export default function Stock() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('products')
  const [page, setPage] = useState(0)
  const [movesPage, setMovesPage] = useState(0)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingQty, setEditingQty] = useState('')
  const limit = 20

  const { data, isLoading, error } = useStockProducts({
    limit,
    offset: page * limit,
    search: search || undefined,
  })

  const {
    data: movesData,
    isLoading: movesLoading,
    error: movesError,
  } = useStockMoves({
    limit,
    offset: movesPage * limit,
  })

  const updateStock = useUpdateProductStock()
  const toast = useToast()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(0)
  }

  const handleEditStock = (productId: number, currentQty: number) => {
    setEditingId(productId)
    setEditingQty(currentQty.toString())
  }

  const handleSaveStock = async (productId: number) => {
    const qty = parseFloat(editingQty)
    if (isNaN(qty) || qty < 0) {
      toast.error('Veuillez entrer une quantité valide')
      return
    }

    try {
      await updateStock.mutateAsync({ productId, quantity: qty })
      toast.success('Stock mis à jour avec succès')
      setEditingId(null)
      setEditingQty('')
    } catch (err) {
      console.error('Erreur lors de la mise à jour du stock:', err)
      toast.error('Erreur lors de la mise à jour du stock')
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingQty('')
  }

  const getStockStatusVariant = (status: string): 'success' | 'warning' | 'error' | 'neutral' => {
    switch (status) {
      case 'in_stock':
        return 'success'
      case 'low_stock':
        return 'warning'
      case 'out_of_stock':
        return 'error'
      default:
        return 'neutral'
    }
  }

  const getStockStatusLabel = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'En stock'
      case 'low_stock':
        return 'Stock faible'
      case 'out_of_stock':
        return 'Rupture'
      default:
        return status
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getMoveTypeLabel = (src: string, dest: string) => {
    if (src.includes('Virtual') || src.includes('Vendors')) {
      return { label: 'Entrée', variant: 'success' as const }
    }
    if (dest.includes('Virtual') || dest.includes('Customers')) {
      return { label: 'Sortie', variant: 'error' as const }
    }
    return { label: 'Transfert', variant: 'info' as const }
  }

  const products = (data?.data?.products || []) as StockProduct[]
  const productsTotal = data?.data?.total || 0
  const moves = (movesData?.data?.moves || []) as StockMove[]
  const movesTotal = movesData?.data?.total || 0

  return (
    <Layout>
      <div className="p-8">
        <Breadcrumbs
          items={[
            { label: 'Tableau de bord', href: '/dashboard' },
            { label: 'Gestion du Stock' },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion du Stock</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Visualiser et gérer les stocks de produits
          </p>
        </div>

        {/* Onglets */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'products'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                Produits
                {productsTotal > 0 && (
                  <Badge variant="neutral">{productsTotal}</Badge>
                )}
              </div>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('movements')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'movements'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
                Mouvements
                {movesTotal > 0 && (
                  <Badge variant="neutral">{movesTotal}</Badge>
                )}
              </div>
            </button>
          </nav>
        </div>

        {/* Onglet Produits */}
        {activeTab === 'products' && (
          <>
            {/* Barre de recherche */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
              <form onSubmit={handleSearch} className="flex items-center space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Rechercher par nom de produit ou SKU..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                </div>
                <Button type="submit" variant="primary">
                  Rechercher
                </Button>
                {search && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setSearch('')
                      setSearchInput('')
                      setPage(0)
                    }}
                  >
                    Réinitialiser
                  </Button>
                )}
              </form>

              {data?.data && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {productsTotal} produit{productsTotal > 1 ? 's' : ''}
                    {search && ` pour "${search}"`}
                  </div>
                  {products.length > 0 && (
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {products.filter((p) => p.stock_status === 'in_stock').length} en stock
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-block w-3 h-3 rounded-full bg-yellow-500"></span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {products.filter((p) => p.stock_status === 'low_stock').length} faible
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {products.filter((p) => p.stock_status === 'out_of_stock').length} rupture
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Liste des produits */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              {isLoading ? (
                <SkeletonTable rows={5} columns={7} />
              ) : error ? (
                <div className="p-8 text-center text-red-600 dark:text-red-400">
                  Erreur lors du chargement des stocks
                </div>
              ) : products.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Produit
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            SKU
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Catégorie
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Stock actuel
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Stock virtuel
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Statut
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {products.map((product) => (
                          <tr
                            key={product.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-10 h-10 rounded object-cover mr-3"
                                  onError={(e) => {
                                    e.currentTarget.src =
                                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40"%3E%3Crect width="40" height="40" fill="%23ddd"/%3E%3C/svg%3E'
                                  }}
                                />
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {product.name}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {product.sku || '-'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {product.category || '-'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {editingId === product.id ? (
                                <input
                                  type="number"
                                  value={editingQty}
                                  onChange={(e) => setEditingQty(e.target.value)}
                                  className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                                  autoFocus
                                />
                              ) : (
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {product.qty_available}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {product.virtual_available}
                              </div>
                              {(product.incoming_qty > 0 || product.outgoing_qty > 0) && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {product.incoming_qty > 0 && `+${product.incoming_qty} entrant`}
                                  {product.incoming_qty > 0 && product.outgoing_qty > 0 && ' / '}
                                  {product.outgoing_qty > 0 && `-${product.outgoing_qty} sortant`}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={getStockStatusVariant(product.stock_status)}>
                                {getStockStatusLabel(product.stock_status)}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              {editingId === product.id ? (
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handleSaveStock(product.id)}
                                    loading={updateStock.isPending}
                                    disabled={updateStock.isPending}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Sauvegarder
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCancelEdit}
                                    disabled={updateStock.isPending}
                                  >
                                    Annuler
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditStock(product.id, product.qty_available)}
                                >
                                  Ajuster
                                </Button>
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
              ) : (
                <div className="p-8 text-center">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Aucun produit trouvé
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {search
                      ? 'Essayez de modifier vos critères de recherche.'
                      : 'Aucun produit dans le catalogue.'}
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Onglet Mouvements */}
        {activeTab === 'movements' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            {movesLoading ? (
              <SkeletonTable rows={5} columns={6} />
            ) : movesError ? (
              <div className="p-8 text-center text-red-600 dark:text-red-400">
                Erreur lors du chargement de l'historique des mouvements
              </div>
            ) : moves.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Produit
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Quantité
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Origine → Destination
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Référence
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {moves.map((move) => {
                        const moveType = getMoveTypeLabel(move.location_src, move.location_dest)
                        return (
                          <tr
                            key={move.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {formatDate(move.date)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {move.product.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={moveType.variant}>{moveType.label}</Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div
                                className={`text-sm font-medium ${
                                  moveType.label === 'Entrée'
                                    ? 'text-green-600 dark:text-green-400'
                                    : moveType.label === 'Sortie'
                                    ? 'text-red-600 dark:text-red-400'
                                    : 'text-gray-900 dark:text-white'
                                }`}
                              >
                                {moveType.label === 'Entrée' ? '+' : moveType.label === 'Sortie' ? '-' : ''}
                                {move.quantity}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                <span className="block truncate max-w-[150px]" title={move.location_src}>
                                  {move.location_src}
                                </span>
                                <span className="text-gray-400 dark:text-gray-500">↓</span>
                                <span className="block truncate max-w-[150px]" title={move.location_dest}>
                                  {move.location_dest}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {move.reference || '-'}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {movesTotal > limit && (
                  <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      Affichage {movesPage * limit + 1} à{' '}
                      {Math.min((movesPage + 1) * limit, movesTotal)} sur {movesTotal}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setMovesPage(Math.max(0, movesPage - 1))}
                        disabled={movesPage === 0}
                      >
                        Précédent
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setMovesPage(movesPage + 1)}
                        disabled={(movesPage + 1) * limit >= movesTotal}
                      >
                        Suivant
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-8 text-center">
                <svg
                  className="w-16 h-16 mx-auto text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Aucun mouvement de stock
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  L'historique des mouvements de stock apparaîtra ici.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ToastContainer */}
        <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} position="top-right" />
      </div>
    </Layout>
  )
}
