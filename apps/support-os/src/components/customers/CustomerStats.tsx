import { Users, DollarSign, ShoppingCart } from 'lucide-react'

interface CustomerStatsProps {
  totalCustomers: number
  totalRevenue: number
  avgBasket: number
}

export function CustomerStats({ totalCustomers, totalRevenue, avgBasket }: CustomerStatsProps) {
  const stats = [
    { label: 'Total clients', value: totalCustomers.toLocaleString('fr-FR'), icon: Users, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
    { label: 'CA total', value: `${totalRevenue.toLocaleString('fr-FR')} \u20AC`, icon: DollarSign, color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
    { label: 'Panier moyen', value: `${avgBasket.toLocaleString('fr-FR')} \u20AC`, icon: ShoppingCart, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
