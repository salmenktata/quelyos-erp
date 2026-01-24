import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Badge, OdooImage, Skeleton } from '../components/common'
import { useAnalyticsStats } from '../hooks/useAnalytics'
import type { AnalyticsStats } from '../types'

type StockAlert = AnalyticsStats['stock_alerts'][number]

export default function Dashboard() {
  const { data: analyticsData, isLoading: isLoadingAnalytics } = useAnalyticsStats()
  const stockAlerts: StockAlert[] = analyticsData?.data?.stock_alerts || []
  const totals = analyticsData?.data?.totals

  const quickLinks = [
    {
      title: 'Produits',
      description: 'Gérer le catalogue de produits, catégories et stocks',
      href: '/products',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      ),
      color: 'blue',
    },
    {
      title: 'Commandes',
      description: 'Suivre et gérer les commandes clients',
      href: '/orders',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      color: 'green',
    },
    {
      title: 'Clients',
      description: 'Gérer les comptes clients et leur historique',
      href: '/customers',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      color: 'purple',
    },
    {
      title: 'Analytics',
      description: 'Analyser les ventes et performances',
      href: '/analytics',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      color: 'yellow',
    },
    {
      title: 'Coupons',
      description: 'Gérer les codes promo et réductions',
      href: '/coupons',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: 'red',
    },
    {
      title: 'Stock',
      description: 'Suivre les niveaux de stock et inventaire',
      href: '/stock',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
      color: 'indigo',
    },
  ]

  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
  }

  return (
    <Layout>
      <div className="p-8">
        {/* En-tête */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Bienvenue dans le Backoffice Quelyos
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Interface d'administration pour gérer votre ERP e-commerce
          </p>
        </div>

        {/* Accès rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200 hover:scale-105 active:scale-100"
            >
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                  colorClasses[link.color as keyof typeof colorClasses]
                }`}
              >
                {link.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {link.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{link.description}</p>
            </Link>
          ))}
        </div>

        {/* Alertes de stock */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Alertes de stock
            </h3>
            {totals && (totals.out_of_stock_products > 0 || totals.low_stock_products > 0) && (
              <div className="flex items-center gap-2">
                {totals.out_of_stock_products > 0 && (
                  <Badge variant="error" size="sm">
                    {totals.out_of_stock_products} en rupture
                  </Badge>
                )}
                {totals.low_stock_products > 0 && (
                  <Badge variant="warning" size="sm">
                    {totals.low_stock_products} stock faible
                  </Badge>
                )}
              </div>
            )}
          </div>

          {isLoadingAnalytics ? (
            <div className="space-y-3">
              <Skeleton height={60} />
              <Skeleton height={60} />
              <Skeleton height={60} />
            </div>
          ) : stockAlerts.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 mx-auto text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400">
                Tous les stocks sont corrects
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {stockAlerts.map((alert) => (
                <Link
                  key={alert.id}
                  to={`/products/${alert.id}/edit`}
                  className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                    alert.alert_level === 'critical'
                      ? 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800'
                      : 'bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 border border-amber-200 dark:border-amber-800'
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <OdooImage
                      src={alert.image}
                      alt={alert.name}
                      className="w-full h-full object-cover"
                      fallback={
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      }
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {alert.name}
                    </p>
                    {alert.default_code && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {alert.default_code}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={alert.alert_level === 'critical' ? 'error' : 'warning'}
                      size="sm"
                    >
                      {alert.alert_message}
                    </Badge>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
              {stockAlerts.length >= 10 && (
                <Link
                  to="/stock"
                  className="block text-center text-sm text-indigo-600 dark:text-indigo-400 hover:underline py-2"
                >
                  Voir tous les produits en alerte →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* État du système */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            État du système
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400 font-medium">API Backend</span>
              <Badge variant={analyticsData?.success ? 'success' : 'warning'} size="sm">
                {analyticsData?.success ? 'Opérationnel' : 'À vérifier'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Base de données</span>
              <Badge variant={analyticsData?.success ? 'success' : 'warning'} size="sm">
                {analyticsData?.success ? 'Connectée' : 'À vérifier'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Frontend</span>
              <Badge variant="success" size="sm">
                Opérationnel
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
