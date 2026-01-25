import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Button, Breadcrumbs } from '../components/common'
import { useSubscriptionPlans, useCreateSubscription } from '../hooks/useSubscriptions'
import { useToast } from '../contexts/ToastContext'
import { CheckIcon } from '@heroicons/react/24/outline'
import type { SubscriptionCreateData } from '@/types'

/**
 * Page de création d'abonnement
 * Permet de sélectionner un plan et un cycle de facturation
 */
export default function SubscriptionForm() {
  const navigate = useNavigate()
  const toast = useToast()

  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const { data: plansData, isLoading: isLoadingPlans } = useSubscriptionPlans()
  const createSubscription = useCreateSubscription()

  const plans = plansData?.data || []

  // Sélectionner le plan "Pro" par défaut si disponible
  useEffect(() => {
    if (plans.length > 0 && !selectedPlanId) {
      const proPlan = plans.find((p: any) => p.code === 'pro')
      if (proPlan) {
        setSelectedPlanId(proPlan.id)
      } else {
        setSelectedPlanId(plans[0].id)
      }
    }
  }, [plans, selectedPlanId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedPlanId) {
      toast.error('Veuillez sélectionner un plan')
      return
    }

    const data: SubscriptionCreateData = {
      plan_id: selectedPlanId,
      billing_cycle: billingCycle,
    }

    try {
      const result = await createSubscription.mutateAsync(data)

      if (result.success) {
        toast.success('Abonnement créé avec succès')
        navigate('/subscriptions')
      } else {
        toast.error(result.error || 'Erreur lors de la création de l\'abonnement')
      }
    } catch (error) {
      toast.error('Erreur lors de la création de l\'abonnement')
    }
  }

  const selectedPlan = plans.find((p: any) => p.id === selectedPlanId)
  const price = billingCycle === 'monthly' ? selectedPlan?.price_monthly : selectedPlan?.price_yearly

  return (
    <Layout>
      <div className="p-4 md:p-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Tableau de bord', href: '/dashboard' },
            { label: 'Abonnements', href: '/subscriptions' },
            { label: 'Nouvel abonnement' },
          ]}
        />

        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Créer un abonnement
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Sélectionnez un plan pour démarrer une période d'essai de 14 jours
          </p>
        </div>

        {isLoadingPlans ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement des plans...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="max-w-6xl mx-auto space-y-8">
              {/* Sélection du cycle de facturation */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Cycle de facturation
                </h2>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setBillingCycle('monthly')}
                    className={`flex-1 px-6 py-4 border-2 rounded-lg text-left transition-all ${
                      billingCycle === 'monthly'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">Mensuel</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Paiement chaque mois
                        </div>
                      </div>
                      {billingCycle === 'monthly' && (
                        <CheckIcon className="h-6 w-6 text-blue-600" />
                      )}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBillingCycle('yearly')}
                    className={`flex-1 px-6 py-4 border-2 rounded-lg text-left transition-all relative ${
                      billingCycle === 'yearly'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="absolute -top-3 right-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-semibold px-2 py-1 rounded-full">
                      Économisez 17%
                    </div>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">Annuel</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Paiement annuel
                        </div>
                      </div>
                      {billingCycle === 'yearly' && (
                        <CheckIcon className="h-6 w-6 text-blue-600" />
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {/* Sélection du plan */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Choisir un plan
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {plans.map((plan: any) => {
                    const isSelected = plan.id === selectedPlanId
                    const planPrice =
                      billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly

                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={`relative p-6 border-2 rounded-xl text-left transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        {plan.is_popular && (
                          <div className="absolute -top-3 left-6 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                            Le plus populaire
                          </div>
                        )}

                        {isSelected && (
                          <div className="absolute top-4 right-4">
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                              <CheckIcon className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}

                        <div className="mb-4">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {plan.name}
                          </h3>
                          {plan.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {plan.description}
                            </p>
                          )}
                        </div>

                        <div className="mb-6">
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-gray-900 dark:text-white">
                              {planPrice}€
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              /{billingCycle === 'monthly' ? 'mois' : 'an'}
                            </span>
                          </div>
                          {billingCycle === 'yearly' && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              soit {(planPrice / 12).toFixed(2)}€/mois
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-start gap-2">
                            <CheckIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {plan.max_users === 0 ? 'Utilisateurs illimités' : `${plan.max_users} utilisateur${plan.max_users > 1 ? 's' : ''}`}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {plan.max_products === 0 ? 'Produits illimités' : `${plan.max_products} produits`}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {plan.max_orders_per_year === 0 ? 'Commandes illimitées' : `${plan.max_orders_per_year} commandes/an`}
                            </span>
                          </div>
                          {plan.features.map((feature: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-2">
                              <CheckIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {feature}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Support : {' '}
                            {plan.support_level === 'email_48h' && 'Email (48h)'}
                            {plan.support_level === 'email_chat_24h' && 'Email + Chat (24h)'}
                            {plan.support_level === 'dedicated_2h' && 'Dédié (2h)'}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Récapitulatif */}
              {selectedPlan && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Récapitulatif
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-300">Plan sélectionné</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {selectedPlan.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-300">Cycle</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {billingCycle === 'monthly' ? 'Mensuel' : 'Annuel'}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-blue-200 dark:border-blue-800">
                      <span className="text-gray-700 dark:text-gray-300">Montant</span>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {price}€ {billingCycle === 'monthly' ? '/mois' : '/an'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Période d'essai de 14 jours gratuits</strong>
                      <br />
                      Vous ne serez pas débité avant la fin de la période d'essai. Vous pouvez
                      annuler à tout moment.
                    </p>
                  </div>
                </div>
              )}

              {/* Boutons d'action */}
              <div className="flex gap-4 justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/subscriptions')}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!selectedPlanId || createSubscription.isPending}
                >
                  {createSubscription.isPending ? 'Création...' : 'Démarrer la période d\'essai'}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </Layout>
  )
}
