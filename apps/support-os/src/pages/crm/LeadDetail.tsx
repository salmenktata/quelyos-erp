import { useParams } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { Breadcrumbs } from '../../components/common'

/**
 * Page de détail d'un prospect
 */
export default function LeadDetail() {
  const { id } = useParams<{ id: string }>()

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: 'CRM', href: '/' },
            { label: 'Prospects', href: '/crm/leads' },
            { label: `Lead #${id}`, href: `/crm/leads/${id}` },
          ]}
        />

        <div className="mt-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Détail du prospect #{id}
          </h1>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mt-6">
          <p className="text-gray-600 dark:text-gray-400">
            Détails du prospect à implémenter
          </p>
        </div>
      </div>
    </Layout>
  )
}
