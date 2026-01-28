import { useState } from 'react'
import { useMyTenant } from '@/hooks/useMyTenant'
import { useLeaveAllocations, useLeaveBalances, useLeaveTypes, useBulkCreateAllocations, type LeaveAllocation } from '@/hooks/hr'
import { PieChart, Plus, Users, Calendar, RefreshCw } from 'lucide-react'

export default function AllocationsPage() {
  const { tenant } = useMyTenant()
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear())

  const { data: allocationsData, isLoading } = useLeaveAllocations({
    tenant_id: tenant?.id || 0,
    year: yearFilter,
  })

  const { data: balancesData } = useLeaveBalances(tenant?.id || null)
  const { data: leaveTypes } = useLeaveTypes(tenant?.id || null)
  const { mutate: bulkCreate, isPending: isBulkCreating } = useBulkCreateAllocations()

  const allocations = allocationsData?.allocations || []
  const balances = balancesData || []

  const handleBulkCreate = (data: { leave_type_id: number; days: number }) => {
    if (tenant?.id) {
      bulkCreate({
        tenant_id: tenant.id,
        ...data,
      })
      setShowBulkModal(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Allocations de congés
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Gérez les soldes de congés des employés
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(Number(e.target.value))}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
          >
            {[yearFilter - 1, yearFilter, yearFilter + 1].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            onClick={() => setShowBulkModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg"
          >
            <Users className="w-4 h-4" />
            Allocation groupée
          </button>
        </div>
      </div>

      {/* Résumé des soldes par type */}
      {balances.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Soldes moyens par type de congé
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {leaveTypes?.map(type => {
              const typeBalances = balances.filter(b => b.leave_type_id === type.id)
              const avgBalance = typeBalances.length > 0
                ? typeBalances.reduce((sum, b) => sum + b.remaining_leaves, 0) / typeBalances.length
                : 0
              return (
                <div key={type.id} className="text-center">
                  <div
                    className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2"
                    style={{ backgroundColor: `${type.color || '#6b7280'}20` }}
                  >
                    <Calendar className="w-5 h-5" style={{ color: type.color || '#6b7280' }} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {avgBalance.toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{type.name}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl h-16" />
          ))}
        </div>
      )}

      {/* Liste des allocations */}
      {!isLoading && allocations.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Allocations {yearFilter}
            </h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 text-left text-sm text-gray-500 dark:text-gray-400">
                <th className="px-4 py-3 font-medium">Employé</th>
                <th className="px-4 py-3 font-medium">Type de congé</th>
                <th className="px-4 py-3 font-medium">Jours alloués</th>
                <th className="px-4 py-3 font-medium">Période</th>
                <th className="px-4 py-3 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {allocations.map(alloc => (
                <tr key={alloc.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {alloc.employee_name}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-1 text-xs rounded-full"
                      style={{
                        backgroundColor: `${alloc.leave_type_color || '#6b7280'}20`,
                        color: alloc.leave_type_color || '#6b7280',
                      }}
                    >
                      {alloc.leave_type_name}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                    {alloc.number_of_days} jours
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {alloc.date_from && alloc.date_to ? (
                      <>
                        {new Date(alloc.date_from).toLocaleDateString('fr-FR')} - {new Date(alloc.date_to).toLocaleDateString('fr-FR')}
                      </>
                    ) : (
                      'Année entière'
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      alloc.state === 'validate'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {alloc.state_label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty */}
      {!isLoading && allocations.length === 0 && (
        <div className="text-center py-12">
          <PieChart className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucune allocation pour {yearFilter}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Créez des allocations pour attribuer des jours de congés aux employés
          </p>
          <button
            onClick={() => setShowBulkModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg"
          >
            <Users className="w-4 h-4" />
            Allocation groupée
          </button>
        </div>
      )}

      {/* Modal allocation groupée */}
      {showBulkModal && leaveTypes && (
        <BulkAllocationModal
          leaveTypes={leaveTypes}
          onClose={() => setShowBulkModal(false)}
          onSave={handleBulkCreate}
          isLoading={isBulkCreating}
        />
      )}
    </div>
  )
}

function BulkAllocationModal({
  leaveTypes,
  onClose,
  onSave,
  isLoading,
}: {
  leaveTypes: any[]
  onClose: () => void
  onSave: (data: { leave_type_id: number; days: number }) => void
  isLoading: boolean
}) {
  const [formData, setFormData] = useState({
    leave_type_id: leaveTypes[0]?.id || 0,
    days: 25,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Allocation groupée
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Attribuer automatiquement des jours de congés à tous les employés actifs
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type de congé
            </label>
            <select
              value={formData.leave_type_id}
              onChange={(e) => setFormData({ ...formData, leave_type_id: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
            >
              {leaveTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre de jours
            </label>
            <input
              type="number"
              min="1"
              value={formData.days}
              onChange={(e) => setFormData({ ...formData, days: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white rounded-lg"
            >
              {isLoading ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
