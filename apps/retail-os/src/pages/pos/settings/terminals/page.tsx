/**
 * Configuration des terminaux POS
 *
 * Fonctionnalités :
 * - Liste des terminaux configurés
 * - Création de nouveaux terminaux
 * - Association entrepôt par terminal
 * - Configuration des droits d'accès
 * - Gestion du mode kiosque
 */

import { Monitor, Plus } from 'lucide-react'
import { Layout } from '../../../../components/Layout'
import { Breadcrumbs, Button, PageNotice } from '../../../../components/common'
import { posNotices } from '../../../../lib/notices/pos-notices'

export default function POSSettingsTerminals() {
  return (
    <Layout>
      <div className="p-4 md:p-8 space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'POS', href: '/pos' },
            { label: 'Paramètres', href: '/pos/settings' },
            { label: 'Terminaux' },
          ]}
        />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Terminaux
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Configuration des points de vente
            </p>
          </div>
          <Button variant="primary" icon={<Plus className="h-4 w-4" />}>
            Nouveau Terminal
          </Button>
        </div>

        {/* PageNotice */}
        <PageNotice config={posNotices.terminals} className="mb-6" />

        {/* Placeholder */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col items-center justify-center text-center">
            <Monitor className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Aucun terminal configuré
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mb-4">
              Créez votre premier terminal POS pour commencer à vendre.
            </p>
            <Button variant="primary" icon={<Plus className="h-4 w-4" />}>
              Créer un Terminal
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
