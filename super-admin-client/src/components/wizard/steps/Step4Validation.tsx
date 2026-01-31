import { InstallConfig } from '@/hooks/useInstallWizard'
import { Building, CreditCard, Database, Mail, User, Globe, AlertTriangle } from 'lucide-react'

interface Step4ValidationProps {
  config: InstallConfig
}

const planNames = {
  starter: 'Starter',
  pro: 'Pro',
  enterprise: 'Enterprise',
}

const volumetryNames = {
  minimal: 'Minimal (~200 enregistrements)',
  standard: 'Standard (~2000 enregistrements)',
  large: 'Large (~5000 enregistrements)',
}

const moduleNames: Record<string, string> = {
  store: 'Boutique',
  stock: 'Stock',
  crm: 'CRM',
  marketing: 'Marketing',
  finance: 'Finance',
  pos: 'Point de Vente',
  support: 'Support',
  hr: 'RH',
}

export function Step4Validation({ config }: Step4ValidationProps) {
  const isLargeVolumetry = config.generate_seed && config.seed_volumetry === 'large'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Validation et lancement
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Vérifiez votre configuration avant de lancer l&apos;installation
        </p>
      </div>

      {/* Warning volumétrie Large */}
      {isLargeVolumetry && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-700 dark:text-amber-300">
            <div className="font-medium mb-1">Volumétrie importante sélectionnée</div>
            <div>
              La génération de 5000+ enregistrements peut prendre plusieurs minutes. Vous pourrez suivre la progression en temps réel.
            </div>
          </div>
        </div>
      )}

      {/* Récapitulatif */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
        {/* Informations tenant */}
        <div className="p-6">
          <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-4">
            <Building className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            Informations de base
          </h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600 dark:text-gray-400">Nom de la boutique</dt>
              <dd className="text-sm font-medium text-gray-900 dark:text-white">{config.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Globe className="h-4 w-4" />
                Domaine
              </dt>
              <dd className="text-sm font-medium text-gray-900 dark:text-white">{config.domain}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="h-4 w-4" />
                Email administrateur
              </dt>
              <dd className="text-sm font-medium text-gray-900 dark:text-white">{config.admin_email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <User className="h-4 w-4" />
                Nom administrateur
              </dt>
              <dd className="text-sm font-medium text-gray-900 dark:text-white">{config.admin_name}</dd>
            </div>
          </dl>
        </div>

        {/* Plan */}
        <div className="p-6">
          <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-4">
            <CreditCard className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            Plan sélectionné
          </h3>
          <div className="text-sm">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 font-medium">
              {planNames[config.plan_code]}
            </span>
          </div>
        </div>

        {/* Seed data */}
        <div className="p-6">
          <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-4">
            <Database className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            Données de test
          </h3>
          {config.generate_seed ? (
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600 dark:text-gray-400">Volumétrie</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">
                  {config.seed_volumetry ? volumetryNames[config.seed_volumetry] : 'Non définie'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600 dark:text-gray-400 mb-2">Modules activés</dt>
                <dd className="flex flex-wrap gap-2">
                  {config.seed_modules?.map(moduleId => (
                    <span
                      key={moduleId}
                      className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      {moduleNames[moduleId] || moduleId}
                    </span>
                  ))}
                </dd>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4 text-sm">
                  <div className={`flex items-center gap-2 ${config.seed_enable_relations ? 'text-teal-600 dark:text-teal-400' : 'text-gray-400 dark:text-gray-600'}`}>
                    <div className={`h-4 w-4 rounded border ${config.seed_enable_relations ? 'bg-teal-600 dark:bg-teal-500 border-teal-600 dark:border-teal-500' : 'border-gray-300 dark:border-gray-600'}`}>
                      {config.seed_enable_relations && (
                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    Relations entre entités
                  </div>
                  <div className={`flex items-center gap-2 ${config.seed_enable_unsplash ? 'text-teal-600 dark:text-teal-400' : 'text-gray-400 dark:text-gray-600'}`}>
                    <div className={`h-4 w-4 rounded border ${config.seed_enable_unsplash ? 'bg-teal-600 dark:bg-teal-500 border-teal-600 dark:border-teal-500' : 'border-gray-300 dark:border-gray-600'}`}>
                      {config.seed_enable_unsplash && (
                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    Images Unsplash
                  </div>
                </div>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Aucune donnée de test ne sera générée
            </p>
          )}
        </div>
      </div>

      {/* Note finale */}
      <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
        <p className="text-sm text-teal-700 dark:text-teal-300">
          <span className="font-medium">Prêt à lancer l&apos;installation ?</span> Le processus commencera immédiatement après validation.
          {config.generate_seed && (
            <> Vous pourrez suivre la progression du provisioning et de la génération des données en temps réel.</>
          )}
        </p>
      </div>
    </div>
  )
}
