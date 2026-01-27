/**
 * Page de gestion du verrouillage d'emplacements (OCA)
 * Module OCA: stock_location_lockdown
 */

import { useState } from 'react'
import { Layout } from '../../components/Layout'
import { Breadcrumbs, Badge } from '../../components/common'
import { useLocationLocks, useLockLocation } from '../../hooks/useStock'
import { AlertCircle, Lock, Unlock } from 'lucide-react'
import type { LocationLock } from '@/types/stock'
import { logger } from '@quelyos/logger'

export default function LocationLocks() {
  const { data, isLoading, error, refetch } = useLocationLocks()
  const { mutate: lockLocation, isPending: isLocking } = useLockLocation()
  const [processingId, setProcessingId] = useState<number | null>(null)

  const locks = data?.success ? data.data.locks : []
  const isModuleInstalled = data?.success !== false || data?.error_code !== 'MODULE_NOT_INSTALLED'

  const handleToggleLock = (locationId: number, currentLockState: boolean, locationName: string) => {
    const action = currentLockState ? 'déverrouiller' : 'verrouiller'
    if (!confirm(`Voulez-vous ${action} l'emplacement "${locationName}" ?`)) {
      return
    }

    setProcessingId(locationId)
    lockLocation(
      { locationId, lock: !currentLockState },
      {
        onSuccess: () => {
          refetch()
          setProcessingId(null)
          logger.info('[LocationLocks] Location lock toggled')
        },
        onError: (error: any) => {
          alert(error.message || `Erreur lors du ${action}`)
          setProcessingId(null)
        },
      }
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: 'Stock', href: '/stock' },
            { label: 'Verrouillage Emplacements', href: '/stock/location-locks' },
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Verrouillage Emplacements</h1>
            <p className="mt-1 text-sm text-gray-500">
              Module OCA stock_location_lockdown - Bloquer les mouvements pendant inventaire
            </p>
          </div>
        </div>

        {!isModuleInstalled && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-yellow-800">Module OCA non installé</h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Le module OCA "stock_location_lockdown" n'est pas installé. Installez-le pour utiliser cette fonctionnalité.
                </p>
                <p className="mt-2 text-sm text-yellow-700">
                  <code className="bg-yellow-100 px-2 py-1 rounded">./scripts/install-oca-stock.sh</code>
                </p>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">Erreur: {error.message}</p>
          </div>
        )}

        {!isLoading && !error && isModuleInstalled && (
          <>
            <div className="bg-white shadow rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Total: <span className="font-medium text-gray-900">{locks.length}</span> emplacements verrouillés
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Emplacement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chemin complet
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      État
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {locks.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                        Aucun emplacement verrouillé. Verrouillez des emplacements pour bloquer les mouvements pendant un inventaire.
                      </td>
                    </tr>
                  )}
                  {locks.map((lock: LocationLock) => (
                    <tr key={lock.location_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {lock.location_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {lock.complete_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="warning">
                          <Lock className="h-3 w-3 mr-1" />
                          Verrouillé
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => handleToggleLock(lock.location_id, lock.blocked, lock.location_name)}
                          disabled={isLocking && processingId === lock.location_id}
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                          {isLocking && processingId === lock.location_id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></div>
                          ) : (
                            <Unlock className="h-4 w-4" />
                          )}
                          Déverrouiller
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {!isLoading && !error && isModuleInstalled && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Astuce :</strong> Verrouillez les emplacements pendant l'inventaire pour empêcher tout mouvement de stock.
              Cela garantit la cohérence des comptages. Pensez à déverrouiller après l'inventaire.
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
}
