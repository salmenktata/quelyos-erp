import { Users } from 'lucide-react'

interface CustomerEmptyProps {
  hasSearch: boolean
  onResetSearch?: () => void
}

export function CustomerEmpty({ hasSearch, onResetSearch }: CustomerEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
        {hasSearch ? 'Aucun client trouv\u00E9' : 'Aucun client'}
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {hasSearch
          ? 'Essayez de modifier vos crit\u00E8res de recherche'
          : 'Les clients apparaitront ici'}
      </p>
      {hasSearch && onResetSearch && (
        <button
          onClick={onResetSearch}
          className="mt-4 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
        >
          Effacer la recherche
        </button>
      )}
    </div>
  )
}
