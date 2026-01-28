/**
 * Rapports de ventes POS
 */

import { BarChart3, TrendingUp, Calendar } from 'lucide-react'

export default function POSReportsSales() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Rapports de Ventes
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Analyse des performances POS
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300">
            <Calendar className="h-4 w-4" />
            Ce mois
          </button>
        </div>
      </div>

      {/* Placeholder */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col items-center justify-center text-center">
          <BarChart3 className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Rapports en développement
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">
            Graphiques de ventes, tendances, top produits et analyse par période seront disponibles ici.
          </p>
        </div>
      </div>
    </div>
  )
}
