import { useState } from 'react'
import { Layout } from '../components/Layout'
import { useStockProducts, useUpdateProductStock } from '../hooks/useStock'

export default function Stock() {
  const [page, setPage] = useState(0)
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

  const updateStock = useUpdateProductStock()

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
      alert('Veuillez entrer une quantité valide')
      return
    }

    try {
      await updateStock.mutateAsync({ productId, quantity: qty })
      setEditingId(null)
      setEditingQty('')
    } catch (err) {
      console.error('Erreur lors de la mise à jour du stock:', err)
      alert('Erreur lors de la mise à jour du stock')
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingQty('')
  }

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
      case 'low_stock':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
      case 'out_of_stock':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
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

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion du Stock</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Visualiser et gérer les stocks de produits
          </p>
        </div>

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
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Rechercher
            </button>
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setSearchInput('')
                  setPage(0)
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Réinitialiser
              </button>
            )}
          </form>

          {data?.data && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {data.data.total} produit{data.data.total > 1 ? 's' : ''}
                {search && ` pour "${search}"`}
              </div>
              {data.data.products && (
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {data.data.products.filter((p) => p.stock_status === 'in_stock').length} en
                      stock
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-yellow-500"></span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {data.data.products.filter((p) => p.stock_status === 'low_stock').length}{' '}
                      faible
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {data.data.products.filter((p) => p.stock_status === 'out_of_stock').length}{' '}
                      rupture
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
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-4">Chargement...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600 dark:text-red-400">
              Erreur lors du chargement des stocks
            </div>
          ) : data?.data.products && data.data.products.length > 0 ? (
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
                    {data.data.products.map((product) => (
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
                          <span
                            className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStockStatusColor(
                              product.stock_status
                            )}`}
                          >
                            {getStockStatusLabel(product.stock_status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {editingId === product.id ? (
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleSaveStock(product.id)}
                                disabled={updateStock.isPending}
                                className="text-green-600 dark:text-green-400 hover:text-green-900 transition-colors disabled:opacity-50"
                              >
                                {updateStock.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                disabled={updateStock.isPending}
                                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 transition-colors disabled:opacity-50"
                              >
                                Annuler
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEditStock(product.id, product.qty_available)}
                              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 transition-colors"
                            >
                              Ajuster
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data.data.total > limit && (
                <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Affichage {page * limit + 1} à {Math.min((page + 1) * limit, data.data.total)}{' '}
                    sur {data.data.total}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Précédent
                    </button>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={(page + 1) * limit >= data.data.total}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Suivant
                    </button>
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
      </div>
    </Layout>
  )
}
