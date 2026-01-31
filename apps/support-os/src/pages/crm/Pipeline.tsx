import { Breadcrumbs } from '../../components/common'

/**
 * Page Pipeline CRM
 * Vue Kanban des opportunités par étape
 */
export default function Pipeline() {
  return (
    
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: 'CRM', href: '/' },
            { label: 'Pipeline', href: '/crm/pipeline' },
          ]}
        />


        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Pipeline commercial
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Vue Kanban de vos opportunités
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <p className="text-gray-600 dark:text-gray-400">
            Pipeline Kanban à implémenter
          </p>
        </div>
      </div>
    
  )
}
