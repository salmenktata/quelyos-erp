/**
 * Configuration des méthodes de paiement POS
 *
 * Fonctionnalités :
 * - Liste des méthodes de paiement disponibles
 * - Activation/désactivation par méthode
 * - Ajout de nouvelles méthodes
 * - Configuration des terminaux de paiement
 * - Gestion des commissions par méthode
 */

import { Banknote, CreditCard, Wallet, Plus } from 'lucide-react'
import { Breadcrumbs, Button, PageNotice } from '../../../../components/common'
import { posNotices } from '../../../../lib/notices/pos-notices'

const defaultMethods = [
  { name: 'Espèces', icon: Banknote, code: 'cash', enabled: true },
  { name: 'Carte Bancaire', icon: CreditCard, code: 'card', enabled: false },
  { name: 'Paiement Digital', icon: Wallet, code: 'digital', enabled: false },
]

export default function POSSettingsPayments() {
  return (
    
      <div className="p-4 md:p-8 space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'POS', href: '/pos' },
            { label: 'Paramètres', href: '/pos/settings' },
            { label: 'Paiements' },
          ]}
        />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Méthodes de Paiement
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Moyens de paiement acceptés en caisse
            </p>
          </div>
          <Button variant="primary" icon={<Plus className="h-4 w-4" />}>
            Ajouter
          </Button>
        </div>

        {/* PageNotice */}
        <PageNotice config={posNotices.payments} className="mb-6" />

        {/* Payment methods list */}
        <div className="space-y-3">
          {defaultMethods.map((method) => {
            const Icon = method.icon
            return (
              <div
                key={method.code}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{method.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Code: {method.code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={method.enabled} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600"></div>
                  </label>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    
  )
}
