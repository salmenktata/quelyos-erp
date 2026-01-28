import { useState } from 'react'
import { useMyTenant } from '@/hooks/useMyTenant'
import { Settings, Clock, Calendar, Users, Bell, FileText } from 'lucide-react'

export default function HRSettingsPage() {
  const { tenant } = useMyTenant()
  const [activeTab, setActiveTab] = useState('general')

  const tabs = [
    { id: 'general', label: 'Général', icon: Settings },
    { id: 'attendance', label: 'Présences', icon: Clock },
    { id: 'leaves', label: 'Congés', icon: Calendar },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Paramètres RH
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Configurez le module Ressources Humaines
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'general' && <GeneralSettings />}
      {activeTab === 'attendance' && <AttendanceSettings />}
      {activeTab === 'leaves' && <LeavesSettings />}
      {activeTab === 'notifications' && <NotificationsSettings />}
    </div>
  )
}

function GeneralSettings() {
  return (
    <div className="space-y-6">
      <SettingsCard title="Matricules employés">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Préfixe matricule
            </label>
            <input
              type="text"
              defaultValue="EMP-"
              className="w-full max-w-xs px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
            />
            <p className="mt-1 text-sm text-gray-500">Ex: EMP-00001</p>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="autoMatricule" className="rounded" defaultChecked />
            <label htmlFor="autoMatricule" className="text-sm text-gray-700 dark:text-gray-300">
              Générer automatiquement les matricules
            </label>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Contrats">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input type="checkbox" id="contractAlert" className="rounded" defaultChecked />
            <label htmlFor="contractAlert" className="text-sm text-gray-700 dark:text-gray-300">
              Alerter avant expiration des contrats
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Délai d'alerte (jours)
            </label>
            <input
              type="number"
              defaultValue={30}
              className="w-32 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </SettingsCard>
    </div>
  )
}

function AttendanceSettings() {
  return (
    <div className="space-y-6">
      <SettingsCard title="Horaires de travail">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Début de journée
            </label>
            <input
              type="time"
              defaultValue="08:00"
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fin de journée
            </label>
            <input
              type="time"
              defaultValue="17:00"
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Modes de pointage">
        <div className="space-y-3">
          {[
            { id: 'manual', label: 'Pointage manuel', desc: 'Via le dashboard' },
            { id: 'kiosk', label: 'Kiosk', desc: 'Borne de pointage' },
            { id: 'badge', label: 'Badge NFC', desc: 'Lecteur de badges' },
            { id: 'gps', label: 'GPS', desc: 'Pointage géolocalisé' },
          ].map(mode => (
            <div key={mode.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{mode.label}</p>
                <p className="text-xs text-gray-500">{mode.desc}</p>
              </div>
              <input type="checkbox" className="rounded" defaultChecked={mode.id === 'manual'} />
            </div>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard title="Heures supplémentaires">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input type="checkbox" id="autoOvertime" className="rounded" defaultChecked />
            <label htmlFor="autoOvertime" className="text-sm text-gray-700 dark:text-gray-300">
              Calculer automatiquement les heures supplémentaires
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Seuil journalier (heures)
            </label>
            <input
              type="number"
              defaultValue={8}
              className="w-32 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </SettingsCard>
    </div>
  )
}

function LeavesSettings() {
  return (
    <div className="space-y-6">
      <SettingsCard title="Approbation des congés">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Workflow d'approbation par défaut
            </label>
            <select className="w-full max-w-xs px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white">
              <option value="no_validation">Sans validation</option>
              <option value="manager">Manager uniquement</option>
              <option value="hr">RH uniquement</option>
              <option value="both">Manager puis RH</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="allowPastDates" className="rounded" />
            <label htmlFor="allowPastDates" className="text-sm text-gray-700 dark:text-gray-300">
              Autoriser les demandes rétroactives
            </label>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Soldes de congés">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input type="checkbox" id="carryOver" className="rounded" defaultChecked />
            <label htmlFor="carryOver" className="text-sm text-gray-700 dark:text-gray-300">
              Autoriser le report des jours non utilisés
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Maximum de jours reportables
            </label>
            <input
              type="number"
              defaultValue={5}
              className="w-32 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date limite de report
            </label>
            <select className="w-full max-w-xs px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white">
              <option value="march">31 Mars</option>
              <option value="june">30 Juin</option>
              <option value="year_end">31 Décembre</option>
            </select>
          </div>
        </div>
      </SettingsCard>
    </div>
  )
}

function NotificationsSettings() {
  return (
    <div className="space-y-6">
      <SettingsCard title="Notifications email">
        <div className="space-y-3">
          {[
            { id: 'leave_request', label: 'Nouvelle demande de congé', to: 'Manager' },
            { id: 'leave_approved', label: 'Congé approuvé', to: 'Employé' },
            { id: 'leave_refused', label: 'Congé refusé', to: 'Employé' },
            { id: 'contract_expiring', label: 'Contrat expirant', to: 'RH' },
            { id: 'birthday', label: 'Anniversaire employé', to: 'Équipe' },
          ].map(notif => (
            <div key={notif.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{notif.label}</p>
                <p className="text-xs text-gray-500">Destinataire: {notif.to}</p>
              </div>
              <input type="checkbox" className="rounded" defaultChecked />
            </div>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard title="Rappels automatiques">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input type="checkbox" id="dailyAbsence" className="rounded" defaultChecked />
            <label htmlFor="dailyAbsence" className="text-sm text-gray-700 dark:text-gray-300">
              Rapport quotidien des absences (09h00)
            </label>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="weeklyReport" className="rounded" defaultChecked />
            <label htmlFor="weeklyReport" className="text-sm text-gray-700 dark:text-gray-300">
              Rapport hebdomadaire RH (Lundi 08h00)
            </label>
          </div>
        </div>
      </SettingsCard>
    </div>
  )
}

function SettingsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      {children}
    </div>
  )
}
