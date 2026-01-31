import { InstallConfig } from '@/hooks/useInstallWizard'
import { Database, AlertTriangle } from 'lucide-react'

interface Step3SeedConfigProps {
  config: InstallConfig
  updateConfig: (field: keyof InstallConfig, value: unknown) => void
}

const modules = [
  { id: 'store', name: 'Boutique', description: 'Produits, catégories, variantes' },
  { id: 'stock', name: 'Stock', description: 'Entrepôts, mouvements, inventaire' },
  { id: 'crm', name: 'CRM', description: 'Clients, opportunités, leads' },
  { id: 'marketing', name: 'Marketing', description: 'Campagnes, newsletters' },
  { id: 'finance', name: 'Finance', description: 'Factures, paiements, comptabilité' },
  { id: 'pos', name: 'Point de Vente', description: 'Caisses, sessions, tickets' },
  { id: 'support', name: 'Support', description: 'Tickets, FAQ, SLA' },
  { id: 'hr', name: 'RH', description: 'Employés, contrats, présences' },
]

const volumetries = [
  { id: 'minimal', name: 'Minimal', description: '~200 enregistrements', count: '200' },
  { id: 'standard', name: 'Standard', description: '~2000 enregistrements', count: '2K', recommended: true },
  { id: 'large', name: 'Large', description: '~5000 enregistrements', count: '5K', warning: true },
]

export function Step3SeedConfig({ config, updateConfig }: Step3SeedConfigProps) {
  const handleModuleToggle = (moduleId: string) => {
    const currentModules = config.seed_modules || []
    const newModules = currentModules.includes(moduleId)
      ? currentModules.filter(m => m !== moduleId)
      : [...currentModules, moduleId]
    updateConfig('seed_modules', newModules)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Configuration des données de test
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Personnalisez la génération de données pour votre instance
        </p>
      </div>

      {/* Toggle principal */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-3">
          <Database className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              Générer des données de test
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Pré-remplir votre instance avec des données fictives
            </div>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={config.generate_seed}
            onChange={e => updateConfig('generate_seed', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600 dark:peer-checked:bg-teal-500"></div>
        </label>
      </div>

      {config.generate_seed && (
        <>
          {/* Warning */}
          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Les données générées sont fictives et peuvent être supprimées ultérieurement depuis le backoffice.
            </p>
          </div>

          {/* Volumétrie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Volumétrie
            </label>
            <div className="grid grid-cols-3 gap-4">
              {volumetries.map(vol => (
                <button
                  key={vol.id}
                  onClick={() => updateConfig('seed_volumetry', vol.id)}
                  className={`
                    relative p-4 rounded-lg border-2 transition-all
                    ${
                      config.seed_volumetry === vol.id
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-teal-400 dark:hover:border-teal-600'
                    }
                  `}
                >
                  {vol.recommended && (
                    <div className="absolute -top-2 right-2">
                      <span className="bg-teal-600 dark:bg-teal-500 text-white text-xs font-semibold px-2 py-0.5 rounded">
                        Recommandé
                      </span>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {vol.count}
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      {vol.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {vol.description}
                    </div>
                  </div>
                  {vol.warning && (
                    <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                      Génération plus longue
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Modules */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Modules à générer
            </label>
            <div className="grid grid-cols-2 gap-3">
              {modules.map(module => {
                const isChecked = config.seed_modules?.includes(module.id) || false

                return (
                  <label
                    key={module.id}
                    className={`
                      flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all
                      ${
                        isChecked
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleModuleToggle(module.id)}
                      className="mt-1 h-4 w-4 text-teal-600 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        {module.name}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {module.description}
                      </div>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Options avancées */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Options avancées
            </label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 cursor-pointer hover:border-gray-400 dark:hover:border-gray-500">
                <input
                  type="checkbox"
                  checked={config.seed_enable_relations || false}
                  onChange={e => updateConfig('seed_enable_relations', e.target.checked)}
                  className="h-4 w-4 text-teal-600 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    Générer les relations entre entités
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Créer des liens réalistes entre produits, clients, commandes, etc.
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 cursor-pointer hover:border-gray-400 dark:hover:border-gray-500">
                <input
                  type="checkbox"
                  checked={config.seed_enable_unsplash || false}
                  onChange={e => updateConfig('seed_enable_unsplash', e.target.checked)}
                  className="h-4 w-4 text-teal-600 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    Images haute qualité (Unsplash)
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Utiliser des photos professionnelles pour les produits
                  </div>
                </div>
              </label>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
