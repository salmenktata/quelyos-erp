import { Breadcrumbs } from '../../components/common'
import { Plus } from 'lucide-react'

/**
 * Page de gestion des prospects/leads
 * Affiche la liste des opportunités commerciales
 */
export default function Leads() {
  return (
    
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: 'CRM', href: '/' },
            { label: 'Prospects', href: '/crm/leads' },
          ]}
        />


        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Prospects
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Gérez vos opportunités commerciales
            </p>
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-5 w-5 mr-2" />
            Nouveau prospect
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <p className="text-gray-600 dark:text-gray-400">
            Liste des prospects à implémenter
          </p>
        </div>
      </div>
    
  )
}
