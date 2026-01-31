import { Outlet } from 'react-router-dom'
import { Breadcrumbs } from '../../../components/common'

export default function SettingsLayout() {
  return (
    
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: 'CRM', href: '/' },
            { label: 'Paramètres', href: '/crm/settings' },
          ]}
        />
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Paramètres CRM
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Configuration et personnalisation du module CRM
          </p>
        </div>

        <div className="flex gap-6">
          <nav className="w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <ul className="space-y-2">
                <li>
                  <a href="/crm/settings/stages" className="block px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                    Étapes du pipeline
                  </a>
                </li>
                <li>
                  <a href="/crm/settings/categories" className="block px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                    Catégories clients
                  </a>
                </li>
                <li>
                  <a href="/crm/settings/pricelists" className="block px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                    Listes de prix
                  </a>
                </li>
                <li>
                  <a href="/crm/settings/scoring" className="block px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                    Scoring prospects
                  </a>
                </li>
              </ul>
            </div>
          </nav>

          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </div>
    
  )
}
