import { Layout } from '../components/Layout'
import { useDeliveryMethods } from '../hooks/useDelivery'

export default function DeliveryMethods() {
  const { data, isLoading, error } = useDeliveryMethods()

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Méthodes de livraison
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gérer les options de livraison disponibles
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-4">Chargement...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600 dark:text-red-400">
              Erreur lors du chargement des méthodes de livraison
            </div>
          ) : data?.data?.delivery_methods && data.data.delivery_methods.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {data.data.delivery_methods.map((method) => (
                <div
                  key={method.id}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {method.name}
                      </h3>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Type :</span>{' '}
                          {method.delivery_type === 'fixed'
                            ? 'Prix fixe'
                            : method.delivery_type === 'base_on_rule'
                            ? 'Basé sur des règles'
                            : method.delivery_type}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Prix :</span>{' '}
                          {formatPrice(method.fixed_price)}
                        </p>
                        {method.free_over && typeof method.free_over === 'number' && (
                          <p className="text-sm text-green-600 dark:text-green-400">
                            Gratuit au-dessus de {formatPrice(method.free_over)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Aucune méthode de livraison
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Configurez des méthodes de livraison dans Odoo pour les afficher ici.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex">
            <svg
              className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Configuration dans Odoo
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                Pour ajouter ou modifier des méthodes de livraison, accédez à <strong>Inventaire → Configuration → Méthodes de livraison</strong> dans Odoo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
