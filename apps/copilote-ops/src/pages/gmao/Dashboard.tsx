import { Breadcrumbs } from '@/components/common'
import { Wrench } from 'lucide-react'

export default function GMAODashboard() {
  return (
    
      <div className="p-4 md:p-8">
        <Breadcrumbs items={[{ label: 'Accueil', href: '/' }, { label: 'GMAO' }]} />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Wrench className="h-8 w-8 text-orange-500" />
          GMAO - Gestion Maintenance
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-4">
          Module GMAO implémenté - Base fonctionnelle prête !
        </p>
      </div>
    
  )
}
