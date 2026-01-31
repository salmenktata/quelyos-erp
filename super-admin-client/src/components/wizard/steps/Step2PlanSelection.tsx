import { InstallConfig } from '@/hooks/useInstallWizard'
import { Check } from 'lucide-react'

interface Step2PlanSelectionProps {
  config: InstallConfig
  updateConfig: (field: keyof InstallConfig, value: unknown) => void
}

const plans = [
  {
    code: 'starter' as const,
    name: 'Starter',
    price: '49€',
    period: '/mois',
    limits: {
      users: 5,
      products: 1000,
      orders: 500,
    },
    features: [
      'Boutique e-commerce complète',
      'Dashboard de gestion',
      'Gestion stock basique',
      'Support email',
    ],
  },
  {
    code: 'pro' as const,
    name: 'Pro',
    price: '99€',
    period: '/mois',
    recommended: true,
    limits: {
      users: 20,
      products: 10000,
      orders: 5000,
    },
    features: [
      'Tout Starter +',
      'Module CRM avancé',
      'Module Marketing',
      'Gestion multi-entrepôts',
      'Support prioritaire',
      'Rapports avancés',
    ],
  },
  {
    code: 'enterprise' as const,
    name: 'Enterprise',
    price: '299€',
    period: '/mois',
    limits: {
      users: 'Illimité',
      products: 'Illimité',
      orders: 'Illimité',
    },
    features: [
      'Tout Pro +',
      'Tous les modules activés',
      'Instance dédiée isolée',
      'Support 24/7',
      'API avancée',
      'SLA garanti',
      'Personnalisation avancée',
    ],
  },
]

export function Step2PlanSelection({ config, updateConfig }: Step2PlanSelectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Choisissez votre plan
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Sélectionnez le plan adapté à vos besoins
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(plan => {
          const isSelected = config.plan_code === plan.code

          return (
            <button
              key={plan.code}
              onClick={() => updateConfig('plan_code', plan.code)}
              className={`
                relative p-6 rounded-lg border-2 transition-all text-left
                ${
                  isSelected
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-teal-400 dark:hover:border-teal-600'
                }
              `}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-teal-600 dark:bg-teal-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Recommandé
                  </span>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {plan.name}
                </h3>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {plan.price}
                  </span>
                  <span className="ml-1 text-gray-600 dark:text-gray-400">
                    {plan.period}
                  </span>
                </div>
              </div>

              <div className="mb-4 space-y-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <div>
                    <span className="font-medium">Utilisateurs:</span> {plan.limits.users}
                  </div>
                  <div>
                    <span className="font-medium">Produits:</span> {plan.limits.products}
                  </div>
                  <div>
                    <span className="font-medium">Commandes/mois:</span> {plan.limits.orders}
                  </div>
                </div>
              </div>

              <ul className="space-y-2">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Check className="h-4 w-4 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {isSelected && (
                <div className="absolute top-4 right-4">
                  <div className="bg-teal-600 dark:bg-teal-500 rounded-full p-1">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
