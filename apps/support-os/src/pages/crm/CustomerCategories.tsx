import { Layout } from '../../components/Layout'
import { Breadcrumbs } from '../../components/common'
import { Plus } from 'lucide-react'

/**
 * Page de gestion des catégories de clients
 */
export default function CustomerCategories() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: 'CRM', href: '/' },
            { label: 'Catégories clients', href: '/crm/categories' },
          ]}
        />


        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Catégories de clients
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Segmentez et organisez votre base clients
            </p>
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-5 w-5 mr-2" />
            Nouvelle catégorie
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <p className="text-gray-600 dark:text-gray-400">
            Gestion des catégories clients à implémenter
          </p>
        </div>
      </div>
    </Layout>
  )
}
