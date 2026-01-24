import { Layout } from '../components/Layout'

export default function Featured() {
  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Produits mis en avant
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gérer les produits affichés en page d'accueil
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
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Produits vedette
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Cette fonctionnalité sera disponible prochainement. Elle permettra de sélectionner
              les produits à mettre en avant sur la page d'accueil de la boutique.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-left">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                Fonctionnalités à venir :
              </p>
              <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                <li>• Sélectionner les produits vedette</li>
                <li>• Définir l'ordre d'affichage</li>
                <li>• Prévisualisation temps réel</li>
                <li>• Gestion par catégories</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
