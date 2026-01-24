import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { useProducts, useDeleteProduct } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'

export default function Products() {
  const [page, setPage] = useState(0)
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>()
  const limit = 20

  const { data: productsData, isLoading, error } = useProducts({
    limit,
    offset: page * limit,
    category_id: categoryFilter,
  })

  const { data: categoriesData } = useCategories()
  const deleteProductMutation = useDeleteProduct()

  const products = productsData?.data?.products || []
  const total = productsData?.data?.total || 0
  const totalPages = Math.ceil(total / limit)

  const categories = categoriesData?.data?.categories || []

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le produit "${name}" ?`)) {
      try {
        await deleteProductMutation.mutateAsync(id)
      } catch (error) {
        alert('Erreur lors de la suppression du produit')
      }
    }
  }

  return (
    <Layout>
      <div className="p-8">
        {/* En-tête */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Produits</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {total} produit{total > 1 ? 's' : ''} au total
            </p>
          </div>
          <Link
            to="/products/create"
            className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouveau produit
          </Link>
        </div>

        {/* Filtres */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filtrer par catégorie
              </label>
              <select
                id="category-filter"
                value={categoryFilter || ''}
                onChange={(e) => {
                  setCategoryFilter(e.target.value ? Number(e.target.value) : undefined)
                  setPage(0)
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none"
              >
                <option value="">Toutes les catégories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            {categoryFilter && (
              <button
                onClick={() => {
                  setCategoryFilter(undefined)
                  setPage(0)
                }}
                className="mt-7 text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 text-sm font-medium"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement des produits...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-600">Erreur lors du chargement des produits</p>
            </div>
          ) : products.length === 0 ? (
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
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Aucun produit
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Commencez par créer votre premier produit
              </p>
              <Link
                to="/products/create"
                className="inline-block bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
              >
                Créer un produit
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Produit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Catégorie
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Prix
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              {product.image ? (
                                <img
                                  className="h-10 w-10 rounded object-cover"
                                  src={product.image}
                                  alt={product.name}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{product.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {product.category ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300">
                              {product.category.name}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400 dark:text-gray-500">Sans catégorie</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {product.price.toFixed(2)} €
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            to={`/products/${product.id}/edit`}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-4"
                          >
                            Modifier
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                            disabled={deleteProductMutation.isPending}
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Page <span className="font-medium">{page + 1}</span> sur{' '}
                    <span className="font-medium">{totalPages}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Précédent
                    </button>
                    <button
                      onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                      disabled={page >= totalPages - 1}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}
