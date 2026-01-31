/**
 * Composant Fidélité Client POS
 * Affiche les points fidélité et permet leur utilisation
 */

import { useState } from 'react'
import {
  Award,
  Star,
  Gift,
  TrendingUp,
  ChevronRight,
  X,
  Sparkles,
  Percent,
} from 'lucide-react'

// Types
export interface LoyaltyCustomer {
  id: number
  name: string
  email?: string
  phone?: string
  loyaltyPoints: number
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum'
  totalSpent: number
  ordersCount: number
  memberSince: string
}

export interface LoyaltyReward {
  id: number
  name: string
  description: string
  pointsCost: number
  type: 'discount_percent' | 'discount_fixed' | 'free_product' | 'gift'
  value: number // Pourcentage ou montant selon type
}

interface CustomerLoyaltyProps {
  customer: LoyaltyCustomer | null
  orderTotal: number
  onSelectCustomer: () => void
  onApplyReward: (reward: LoyaltyReward) => void
  onUsePoints: (points: number, discount: number) => void
}

// Configuration fidélité
const POINTS_PER_TND = 1 // 1 point par TND dépensé
const POINTS_VALUE = 0.01 // 1 point = 0.01 TND

// Récompenses disponibles
const availableRewards: LoyaltyReward[] = [
  {
    id: 1,
    name: '5% de réduction',
    description: 'Sur votre commande',
    pointsCost: 500,
    type: 'discount_percent',
    value: 5,
  },
  {
    id: 2,
    name: '10% de réduction',
    description: 'Sur votre commande',
    pointsCost: 1000,
    type: 'discount_percent',
    value: 10,
  },
  {
    id: 3,
    name: '5 TND offerts',
    description: 'Réduction immédiate',
    pointsCost: 500,
    type: 'discount_fixed',
    value: 5,
  },
  {
    id: 4,
    name: '10 TND offerts',
    description: 'Réduction immédiate',
    pointsCost: 900,
    type: 'discount_fixed',
    value: 10,
  },
]

// Couleurs des tiers
const tierColors = {
  bronze: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-300 dark:border-orange-700',
  },
  silver: {
    bg: 'bg-gray-100 dark:bg-gray-700',
    text: 'text-gray-700 dark:text-gray-300',
    border: 'border-gray-300 dark:border-gray-600',
  },
  gold: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-700 dark:text-yellow-300',
    border: 'border-yellow-300 dark:border-yellow-700',
  },
  platinum: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-300 dark:border-purple-700',
  },
}

const tierNames = {
  bronze: 'Bronze',
  silver: 'Argent',
  gold: 'Or',
  platinum: 'Platine',
}

export function CustomerLoyaltyCard({ customer, onSelectCustomer, onApplyReward, onUsePoints, orderTotal }: CustomerLoyaltyProps) {
  const [showRewards, setShowRewards] = useState(false)
  const [customPoints, setCustomPoints] = useState('')

  if (!customer) {
    return (
      <button
        onClick={onSelectCustomer}
        className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-teal-500 dark:hover:border-teal-400 transition-colors group"
      >
        <div className="flex items-center justify-center gap-3 text-gray-500 dark:text-gray-400 group-hover:text-teal-600 dark:group-hover:text-teal-400">
          <Award className="h-6 w-6" />
          <span className="font-medium">Sélectionner un client fidélité</span>
          <ChevronRight className="h-5 w-5" />
        </div>
      </button>
    )
  }

  const tier = tierColors[customer.loyaltyTier]
  const pointsToEarn = Math.floor(orderTotal * POINTS_PER_TND)
  const maxPointsToUse = Math.min(customer.loyaltyPoints, Math.floor(orderTotal / POINTS_VALUE))

  const handleUseCustomPoints = () => {
    const points = parseInt(customPoints)
    if (points > 0 && points <= maxPointsToUse) {
      const discount = points * POINTS_VALUE
      onUsePoints(points, discount)
      setCustomPoints('')
    }
  }

  return (
    <div className={`rounded-xl border-2 ${tier.border} overflow-hidden`}>
      {/* Header client */}
      <div className={`${tier.bg} p-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${tier.bg} border-2 ${tier.border} flex items-center justify-center`}>
              <Star className={`h-5 w-5 ${tier.text}`} />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{customer.name}</p>
              <p className={`text-sm ${tier.text}`}>
                Membre {tierNames[customer.loyaltyTier]}
              </p>
            </div>
          </div>
          <button
            onClick={onSelectCustomer}
            className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Points */}
      <div className="p-3 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Points disponibles</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {customer.loyaltyPoints.toLocaleString()}
              <span className="text-sm font-normal text-gray-400 ml-1">pts</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">À gagner</p>
            <p className="text-lg font-semibold text-green-600 dark:text-green-400">
              +{pointsToEarn} pts
            </p>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setShowRewards(!showRewards)}
            className="flex items-center justify-center gap-2 py-2 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors text-sm font-medium"
          >
            <Gift className="h-4 w-4" />
            Récompenses
          </button>
          <button
            onClick={() => {
              if (maxPointsToUse >= 100) {
                onUsePoints(100, 100 * POINTS_VALUE)
              }
            }}
            disabled={maxPointsToUse < 100}
            className="flex items-center justify-center gap-2 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            <Sparkles className="h-4 w-4" />
            -100 pts
          </button>
        </div>
      </div>

      {/* Panneau récompenses */}
      {showRewards && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-900">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Récompenses disponibles
          </h4>
          <div className="space-y-2">
            {availableRewards.map((reward) => {
              const canRedeem = customer.loyaltyPoints >= reward.pointsCost
              return (
                <button
                  key={reward.id}
                  onClick={() => canRedeem && onApplyReward(reward)}
                  disabled={!canRedeem}
                  className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                    canRedeem
                      ? 'bg-white dark:bg-gray-800 hover:bg-teal-50 dark:hover:bg-teal-900/20 cursor-pointer'
                      : 'bg-gray-100 dark:bg-gray-800 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {reward.type === 'discount_percent' ? (
                      <Percent className="h-4 w-4 text-teal-500" />
                    ) : (
                      <Gift className="h-4 w-4 text-purple-500" />
                    )}
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {reward.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {reward.description}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${canRedeem ? 'text-teal-600 dark:text-teal-400' : 'text-gray-400'}`}>
                    {reward.pointsCost} pts
                  </span>
                </button>
              )
            })}
          </div>

          {/* Utiliser points personnalisés */}
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Ou utiliser un montant personnalisé (max {maxPointsToUse} pts)
            </p>
            <div className="flex gap-2">
              <input
                type="number"
                value={customPoints}
                onChange={(e) => setCustomPoints(e.target.value)}
                placeholder="Nb. points"
                max={maxPointsToUse}
                className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
              />
              <button
                onClick={handleUseCustomPoints}
                disabled={!customPoints || parseInt(customPoints) <= 0 || parseInt(customPoints) > maxPointsToUse}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Appliquer
              </button>
            </div>
            {customPoints && parseInt(customPoints) > 0 && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                = {(parseInt(customPoints) * POINTS_VALUE).toFixed(2)} TND de réduction
              </p>
            )}
          </div>
        </div>
      )}

      {/* Stats client (optionnel, collapsé par défaut) */}
      <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{customer.ordersCount} commandes</span>
          <span>{customer.totalSpent.toFixed(2)} TND dépensés</span>
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-green-500" />
            Fidèle
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * Modal de recherche client avec fidélité
 */
interface CustomerSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectCustomer: (customer: LoyaltyCustomer) => void
}

// Mock customers pour démo
const mockCustomers: LoyaltyCustomer[] = [
  {
    id: 1,
    name: 'Ahmed Ben Salem',
    email: 'ahmed@email.com',
    phone: '+216 98 123 456',
    loyaltyPoints: 2450,
    loyaltyTier: 'gold',
    totalSpent: 1250.50,
    ordersCount: 32,
    memberSince: '2023-06-15',
  },
  {
    id: 2,
    name: 'Fatma Trabelsi',
    email: 'fatma@email.com',
    loyaltyPoints: 890,
    loyaltyTier: 'silver',
    totalSpent: 450.00,
    ordersCount: 12,
    memberSince: '2024-01-20',
  },
  {
    id: 3,
    name: 'Mohamed Gharbi',
    phone: '+216 55 987 654',
    loyaltyPoints: 5200,
    loyaltyTier: 'platinum',
    totalSpent: 3200.00,
    ordersCount: 78,
    memberSince: '2022-03-10',
  },
]

export function CustomerSearchModal({ isOpen, onClose, onSelectCustomer }: CustomerSearchModalProps) {
  const [search, setSearch] = useState('')

  if (!isOpen) return null

  const filteredCustomers = mockCustomers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search)
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Rechercher un client
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nom, email ou téléphone..."
            autoFocus
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-gray-900 dark:text-white placeholder-gray-500"
          />
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filteredCustomers.map((customer) => {
            const tier = tierColors[customer.loyaltyTier]
            return (
              <button
                key={customer.id}
                onClick={() => {
                  onSelectCustomer(customer)
                  onClose()
                }}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <div className={`w-10 h-10 rounded-full ${tier.bg} border-2 ${tier.border} flex items-center justify-center`}>
                  <Star className={`h-5 w-5 ${tier.text}`} />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900 dark:text-white">{customer.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {customer.email || customer.phone}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-teal-600 dark:text-teal-400">
                    {customer.loyaltyPoints} pts
                  </p>
                  <p className={`text-xs ${tier.text}`}>
                    {tierNames[customer.loyaltyTier]}
                  </p>
                </div>
              </button>
            )
          })}

          {filteredCustomers.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Aucun client trouvé
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
