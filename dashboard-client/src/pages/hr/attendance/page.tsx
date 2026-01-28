import { useState } from 'react'
import { useMyTenant } from '@/hooks/useMyTenant'
import { useTodayAttendance, useCheckIn, useCheckOut } from '@/hooks/hr'
import { Clock, UserCheck, UserX, Users, RefreshCw } from 'lucide-react'

export default function AttendancePage() {
  const { tenant } = useMyTenant()
  const { data: todayData, isLoading, refetch } = useTodayAttendance(tenant?.id || null)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Présences
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {todayData?.date ? new Date(todayData.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : "Aujourd'hui"}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          title="Effectif total"
          value={todayData?.totalEmployees || 0}
          icon={Users}
          color="gray"
        />
        <KPICard
          title="Présents aujourd'hui"
          value={todayData?.presentToday || 0}
          icon={UserCheck}
          color="emerald"
        />
        <KPICard
          title="Actuellement sur site"
          value={todayData?.currentlyIn || 0}
          icon={Clock}
          color="cyan"
        />
        <KPICard
          title="Absents"
          value={todayData?.absent || 0}
          icon={UserX}
          color="red"
        />
      </div>

      {/* Liste des présences */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Pointages du jour
          </h3>
        </div>

        {isLoading && (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto" />
          </div>
        )}

        {!isLoading && todayData?.attendances && todayData.attendances.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr className="text-left text-sm text-gray-500 dark:text-gray-400">
                  <th className="px-4 py-3 font-medium">Employé</th>
                  <th className="px-4 py-3 font-medium">Entrée</th>
                  <th className="px-4 py-3 font-medium">Sortie</th>
                  <th className="px-4 py-3 font-medium">Durée</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {todayData.attendances.map((att) => (
                  <tr key={att.id}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{att.employee_name}</p>
                        <p className="text-sm text-gray-500">{att.employee_number}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {att.check_in ? new Date(att.check_in).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {att.check_out ? new Date(att.check_out).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {att.worked_hours ? `${att.worked_hours.toFixed(1)}h` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {att.check_out ? (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded-full">
                          Terminé
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full">
                          En cours
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && (!todayData?.attendances || todayData.attendances.length === 0) && (
          <div className="p-8 text-center">
            <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Aucun pointage pour aujourd'hui
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function KPICard({ title, value, icon: Icon, color }: {
  title: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  color: 'gray' | 'emerald' | 'cyan' | 'red'
}) {
  const colors = {
    gray: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    cyan: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}
