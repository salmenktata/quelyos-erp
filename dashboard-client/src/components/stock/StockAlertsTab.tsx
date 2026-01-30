import { Link } from 'react-router-dom'
import { Badge, Button } from '@/components/common'
import { AlertTriangle, ShoppingBag } from 'lucide-react'

interface StockAlert {
  id: number
  name: string
  sku: string
  category: string
  image_url: string | null
  current_stock: number
  threshold: number
  diff: number
  list_price: number
}

interface StockAlertsTabProps {
  alerts: StockAlert[]
  alertsTotal: number
  highAlerts: StockAlert[]
  highAlertsTotal: number
  page: number
  limit: number
  isLoading: boolean
  formatPrice: (price: number) => string
  getAlertSeverity: (diff: number) => 'error' | 'warning'
  onPageChange: (page: number) => void
}

function AlertTable({ alerts, formatPrice, getAlertSeverity, isHighStock }: {
  alerts: StockAlert[]
  formatPrice: (price: number) => string
  getAlertSeverity?: (diff: number) => 'error' | 'warning'
  isHighStock?: boolean
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Produit</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Référence</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Catégorie</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock actuel</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {isHighStock ? 'Seuil max' : 'Seuil'}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Prix</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {alerts.map((alert) => (
            <tr key={alert.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  {alert.image_url ? (
                    <img src={alert.image_url} alt={alert.name} className="w-12 h-12 rounded object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <ShoppingBag className="h-6 w-6 text-gray-400" aria-hidden="true" />
                    </div>
                  )}
                  <div>
                    <Link to={`/products/${alert.id}`} className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                      {alert.name}
                    </Link>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-900 dark:text-white font-mono">{alert.sku || '-'}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-600 dark:text-gray-400">{alert.category || '-'}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={isHighStock ? 'warning' : (getAlertSeverity?.(alert.diff) || 'error')}>
                  {alert.current_stock} unités
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-900 dark:text-white">{alert.threshold} unités</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{formatPrice(alert.list_price)}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function StockAlertsTab({
  alerts,
  alertsTotal,
  highAlerts,
  highAlertsTotal,
  page,
  limit,
  isLoading,
  formatPrice,
  getAlertSeverity,
  onPageChange,
}: StockAlertsTabProps) {
  return (
    <>
      {/* Alert banner */}
      {!isLoading && alertsTotal > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="shrink-0">
              <AlertTriangle className="h-12 w-12 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                {alertsTotal} produit{alertsTotal > 1 ? 's' : ''} en stock bas
              </h3>
              <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                {`Ces produits sont sous le seuil d'alerte et nécessitent un réapprovisionnement.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Low stock alerts */}
      {alerts.length > 0 && (
        <>
          <AlertTable alerts={alerts} formatPrice={formatPrice} getAlertSeverity={getAlertSeverity} />

          {/* Pagination */}
          {alertsTotal > limit && (
            <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Affichage {page * limit + 1} à {Math.min((page + 1) * limit, alertsTotal)} sur {alertsTotal}
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => onPageChange(Math.max(0, page - 1))} disabled={page === 0}>
                  Précédent
                </Button>
                <Button variant="secondary" size="sm" onClick={() => onPageChange(page + 1)} disabled={(page + 1) * limit >= alertsTotal}>
                  Suivant
                </Button>
              </div>
            </div>
          )}

          {/* High Stock Alerts Section */}
          {highAlerts.length > 0 && (
            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 px-6">
                Alertes Surstock ({highAlertsTotal})
              </h3>
              <AlertTable alerts={highAlerts} formatPrice={formatPrice} isHighStock />
            </div>
          )}
        </>
      )}

      {/* Only High Stock Alerts if no low stock */}
      {alerts.length === 0 && highAlerts.length > 0 && (
        <div className="px-6 py-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Alertes Surstock ({highAlertsTotal})
          </h3>
          <AlertTable alerts={highAlerts} formatPrice={formatPrice} isHighStock />
        </div>
      )}
    </>
  )
}
