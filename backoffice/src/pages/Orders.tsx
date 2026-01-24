import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { useOrders } from '../hooks/useOrders'

export default function Orders() {
  const [page, setPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const limit = 20

  const { data, isLoading, error } = useOrders({
    limit,
    offset: page * limit,
    status: statusFilter || undefined,
  })

  const getStatusColor = (state: string) => {
    switch (state) {
      case 'draft':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800'
      case 'sent':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800'
      case 'sale':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800'
      case 'done':
        return 'bg-indigo-100 text-indigo-800'
      case 'cancel':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800'
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800'
    }
  }

  const getStatusLabel = (state: string) => {
    switch (state) {
      case 'draft':
        return 'Brouillon'
      case 'sent':
        return 'Envoyé'
      case 'sale':
        return 'Confirmé'
      case 'done':
        return 'Terminé'
      case 'cancel':
        return 'Annulé'
      default:
        return state
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price)
  }

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Commandes</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Gérer et suivre toutes les commandes</p>
        </div>

        {/* Filtres */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Statut:</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(0)
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            >
              <option value="">Tous</option>
              <option value="draft">Brouillon</option>
              <option value="sent">Envoyé</option>
              <option value="sale">Confirmé</option>
              <option value="done">Terminé</option>
              <option value="cancel">Annulé</option>
            </select>

            {data?.data && (
              <span className="text-sm text-gray-600 dark:text-gray-400 ml-auto">
                {data.data.total} commande{data.data.total > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Liste des commandes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-4">Chargement...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600 dark:text-red-400">
              Erreur lors du chargement des commandes
            </div>
          ) : data?.data.orders && data.data.orders.length > 0 ? (
            <>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                      N° Commande
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                  {data.data.orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:bg-gray-900 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{order.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{formatDate(order.date_order)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {order.customer ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {order.customer.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-500">{order.customer.email}</div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatPrice(order.amount_total)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            order.state
                          )}`}
                        >
                          {getStatusLabel(order.state)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/orders/${order.id}`}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 transition-colors"
                        >
                          Voir détails
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

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
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Précédent
                    </button>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={(page + 1) * limit >= data.data.total}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center text-gray-600 dark:text-gray-400">Aucune commande trouvée</div>
          )}
        </div>
      </div>
    </Layout>
  )
}
