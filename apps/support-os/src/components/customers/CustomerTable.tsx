import { Link } from 'react-router-dom'
import { ChevronUp, ChevronDown } from 'lucide-react'
import type { CustomerListItem } from '@/types'

type SortField = 'name' | 'email' | 'orders_count' | 'total_spent' | 'create_date'
type SortOrder = 'asc' | 'desc'

interface CustomerTableProps {
  customers: CustomerListItem[]
  sortField: SortField
  sortOrder: SortOrder
  onSort: (field: SortField) => void
}

function SortIcon({ field, sortField, sortOrder }: { field: SortField; sortField: SortField; sortOrder: SortOrder }) {
  if (field !== sortField) return null
  return sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
}

export function CustomerTable({ customers, sortField, sortOrder, onSort }: CustomerTableProps) {
  const columns: { field: SortField; label: string }[] = [
    { field: 'name', label: 'Nom' },
    { field: 'email', label: 'Email' },
    { field: 'orders_count', label: 'Commandes' },
    { field: 'total_spent', label: 'CA' },
    { field: 'create_date', label: 'Inscription' },
  ]

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            {columns.map((col) => (
              <th
                key={col.field}
                onClick={() => onSort(col.field)}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  <SortIcon field={col.field} sortField={sortField} sortOrder={sortOrder} />
                </span>
              </th>
            ))}
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {customers.map((customer) => (
            <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{customer.name}</td>
              <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{customer.email || '-'}</td>
              <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{customer.orders_count ?? 0}</td>
              <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                {(customer.total_spent ?? 0).toLocaleString('fr-FR')} {'\u20AC'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                {customer.create_date ? new Date(customer.create_date).toLocaleDateString('fr-FR') : '-'}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  to={`/support/customers/${customer.id}`}
                  className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
                >
                  Voir
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
