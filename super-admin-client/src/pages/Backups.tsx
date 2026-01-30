/**
 * Gestion des Backups
 *
 * Fonctionnalités :
 * - Liste des backups (global + par tenant)
 * - Déclenchement backup manuel
 * - Téléchargement backup
 * - Restauration (avec confirmation)
 * - Statut backup auto
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Database,
  Download,
  RotateCcw,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Loader2,
  Settings,
  Calendar,
  Save,
} from 'lucide-react'
import { api } from '@/lib/api/gateway'
import { BackupsResponseSchema, BackupScheduleSchema, validateApiResponse } from '@/lib/validators'
import type { Backup, BackupsResponse, BackupSchedule } from '@/lib/validators'
import { ConfirmModal } from '@/components/common/ConfirmModal'
import { useToast } from '@/hooks/useToast'

const DEFAULT_SCHEDULE: BackupSchedule = {
  enabled: false,
  frequency: 'daily',
  day_of_week: 1,
  day_of_month: 1,
  hour: 2,
  minute: 0,
  backup_type: 'full',
  retention_count: 7,
}

export function Backups() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [restoreTarget, setRestoreTarget] = useState<Backup | null>(null)
  const [backupType, setBackupType] = useState<'full' | 'incremental'>('full')
  const [showSchedulePanel, setShowSchedulePanel] = useState(false)
  const [schedule, setSchedule] = useState<BackupSchedule>(DEFAULT_SCHEDULE)

  const { data, isLoading } = useQuery({
    queryKey: ['super-admin-backups'],
    queryFn: async () => {
      const response = await api.request<BackupsResponse>({
        method: 'GET',
        path: '/api/super-admin/backups',
      })
      const validated = validateApiResponse(BackupsResponseSchema, response.data)
      // Sync schedule state with server data if available
      if (validated.schedule) {
        setSchedule(validated.schedule)
      }
      return validated
    },
    refetchInterval: 30000,
  })

  const triggerBackup = useMutation({
    mutationFn: async (type: 'full' | 'incremental') => {
      return api.request({
        method: 'POST',
        path: '/api/super-admin/backups/trigger',
        body: { type },
      })
    },
    onSuccess: () => {
      toast.success('Backup déclenché avec succès')
      queryClient.invalidateQueries({ queryKey: ['super-admin-backups'] })
    },
    onError: () => {
      toast.error('Erreur lors du déclenchement du backup')
    },
  })

  const restoreBackup = useMutation({
    mutationFn: async (backupId: number) => {
      return api.request({
        method: 'POST',
        path: `/api/super-admin/backups/${backupId}/restore`,
      })
    },
    onSuccess: () => {
      toast.success('Restauration lancée avec succès')
      setRestoreTarget(null)
      queryClient.invalidateQueries({ queryKey: ['super-admin-backups'] })
    },
    onError: () => {
      toast.error('Erreur lors de la restauration')
    },
  })

  const saveSchedule = useMutation({
    mutationFn: async (newSchedule: BackupSchedule) => {
      return api.request({
        method: 'POST',
        path: '/api/super-admin/backups/schedule',
        body: newSchedule,
      })
    },
    onSuccess: () => {
      toast.success('Programmation sauvegardée')
      queryClient.invalidateQueries({ queryKey: ['super-admin-backups'] })
      queryClient.invalidateQueries({ queryKey: ['super-admin-backup-schedule'] })
    },
    onError: () => {
      toast.error('Erreur lors de la sauvegarde')
    },
  })

  const backups = data?.data || []

  const getStatusIcon = (status: Backup['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />
    }
  }

  const getTypeLabel = (type: Backup['type']) => {
    switch (type) {
      case 'full':
        return 'Complet'
      case 'incremental':
        return 'Incrémental'
      case 'tenant':
        return 'Tenant'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Backups</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {backups.length} backups • Dernier auto:{' '}
            {data?.last_auto_backup
              ? new Date(data.last_auto_backup).toLocaleString('fr-FR')
              : 'Aucun'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSchedulePanel(!showSchedulePanel)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition ${
              showSchedulePanel
                ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-teal-500'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Programmer
          </button>
          <select
            value={backupType}
            onChange={(e) => setBackupType(e.target.value as 'full' | 'incremental')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="full">Backup Complet</option>
            <option value="incremental">Backup Incrémental</option>
          </select>
          <button
            onClick={() => triggerBackup.mutate(backupType)}
            disabled={triggerBackup.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition disabled:opacity-50"
          >
            {triggerBackup.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Lancer Backup
          </button>
        </div>
      </div>

      {/* Schedule Panel */}
      {showSchedulePanel && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Programmation Backup Automatique
              </h2>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {schedule.enabled ? 'Activé' : 'Désactivé'}
              </span>
              <div
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  schedule.enabled ? 'bg-teal-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
                onClick={() => setSchedule({ ...schedule, enabled: !schedule.enabled })}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    schedule.enabled ? 'translate-x-5' : ''
                  }`}
                />
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Fréquence */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fréquence
              </label>
              <select
                value={schedule.frequency}
                onChange={(e) =>
                  setSchedule({ ...schedule, frequency: e.target.value as BackupSchedule['frequency'] })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="daily">Quotidien</option>
                <option value="weekly">Hebdomadaire</option>
                <option value="monthly">Mensuel</option>
              </select>
            </div>

            {/* Jour de la semaine (si hebdomadaire) */}
            {schedule.frequency === 'weekly' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Jour
                </label>
                <select
                  value={schedule.day_of_week}
                  onChange={(e) => setSchedule({ ...schedule, day_of_week: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value={1}>Lundi</option>
                  <option value={2}>Mardi</option>
                  <option value={3}>Mercredi</option>
                  <option value={4}>Jeudi</option>
                  <option value={5}>Vendredi</option>
                  <option value={6}>Samedi</option>
                  <option value={0}>Dimanche</option>
                </select>
              </div>
            )}

            {/* Jour du mois (si mensuel) */}
            {schedule.frequency === 'monthly' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Jour du mois
                </label>
                <select
                  value={schedule.day_of_month}
                  onChange={(e) => setSchedule({ ...schedule, day_of_month: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {Array.from({ length: 28 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Heure */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Heure
              </label>
              <div className="flex gap-2">
                <select
                  value={schedule.hour}
                  onChange={(e) => setSchedule({ ...schedule, hour: parseInt(e.target.value) })}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i.toString().padStart(2, '0')}h
                    </option>
                  ))}
                </select>
                <select
                  value={schedule.minute}
                  onChange={(e) => setSchedule({ ...schedule, minute: parseInt(e.target.value) })}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {[0, 15, 30, 45].map((m) => (
                    <option key={m} value={m}>
                      {m.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Type de backup */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <select
                value={schedule.backup_type}
                onChange={(e) =>
                  setSchedule({ ...schedule, backup_type: e.target.value as 'full' | 'incremental' })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="full">Complet</option>
                <option value="incremental">Incrémental</option>
              </select>
            </div>

            {/* Rétention */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rétention (backups)
              </label>
              <input
                type="number"
                min={1}
                max={365}
                value={schedule.retention_count}
                onChange={(e) =>
                  setSchedule({ ...schedule, retention_count: parseInt(e.target.value) || 7 })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => saveSchedule.mutate(schedule)}
              disabled={saveSchedule.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition disabled:opacity-50"
            >
              {saveSchedule.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Sauvegarder
            </button>
          </div>
        </div>
      )}

      {/* Info Card */}
      {data?.next_scheduled_backup && typeof data.next_scheduled_backup === 'string' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="text-blue-800 dark:text-blue-200">
            Prochain backup automatique :{' '}
            {new Date(data.next_scheduled_backup).toLocaleString('fr-FR')}
          </span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : backups.length === 0 ? (
          <div className="p-12 text-center">
            <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Aucun backup disponible</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Fichier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Taille
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {backups.map((backup) => (
                  <tr key={backup.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">{getStatusIcon(backup.status)}</td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-900 dark:text-white">
                      {backup.filename}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          backup.type === 'full'
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                            : backup.type === 'incremental'
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {getTypeLabel(backup.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {backup.tenant_name || 'Global'}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-600 dark:text-gray-400">
                      {backup.size_mb.toFixed(1)} MB
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(backup.created_at).toLocaleString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {backup.status === 'completed' && backup.download_url && (
                          <a
                            href={backup.download_url}
                            className="p-2 text-gray-500 hover:text-teal-600 dark:text-gray-400 dark:hover:text-teal-400"
                            title="Télécharger"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                        {backup.status === 'completed' && (
                          <button
                            onClick={() => setRestoreTarget(backup)}
                            className="p-2 text-gray-500 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400"
                            title="Restaurer"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                        {backup.status === 'failed' && backup.error_message && (
                          <span
                            className="p-2 text-red-500 cursor-help"
                            title={backup.error_message}
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Restore Confirmation Modal */}
      {restoreTarget && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setRestoreTarget(null)}
          onConfirm={() => restoreBackup.mutate(restoreTarget.id)}
          title="Confirmer la restauration"
          message={`Êtes-vous sûr de vouloir restaurer le backup "${restoreTarget.filename}" ? Cette action est irréversible et écrasera les données actuelles.`}
          confirmText="Restaurer"
          variant="danger"
          isLoading={restoreBackup.isPending}
        />
      )}
    </div>
  )
}
