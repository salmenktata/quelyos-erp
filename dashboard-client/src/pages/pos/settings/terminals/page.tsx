/**
 * Configuration des terminaux POS
 */

import { Monitor, Plus, Settings } from 'lucide-react'

export default function POSSettingsTerminals() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Terminaux
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Configuration des points de vente
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg">
          <Plus className="h-4 w-4" />
          Nouveau Terminal
        </button>
      </div>

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
          <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg">
            <Plus className="h-4 w-4" />
            Créer un Terminal
          </button>
        </div>
      </div>
    </div>
  )
}
