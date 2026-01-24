import { Layout } from '../components/Layout'

export default function Payments() {
  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Paiements</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gérer les transactions de paiement
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
          <div className="max-w-md mx-auto">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Gestion des paiements
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Cette fonctionnalité sera disponible prochainement. Elle permettra de visualiser et
              gérer toutes les transactions de paiement.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-left">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                Fonctionnalités à venir :
              </p>
              <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                <li>• Liste de toutes les transactions</li>
                <li>• Détails des paiements (méthode, montant, statut)</li>
                <li>• Gestion des remboursements</li>
                <li>• Historique et rapports</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
