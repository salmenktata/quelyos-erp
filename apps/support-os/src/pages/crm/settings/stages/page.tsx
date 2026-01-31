import { Plus } from 'lucide-react'

export default function StagesSettings() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Étapes du pipeline
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Configurez les étapes de votre processus de vente
            </p>
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-5 w-5 mr-2" />
            Nouvelle étape
          </button>
        </div>
      </div>
      <div className="p-6">
        <p className="text-gray-600 dark:text-gray-400">
          Gestion des étapes du pipeline à implémenter
        </p>
      </div>
    </div>
  )
}
