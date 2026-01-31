import { Search, Download, X } from 'lucide-react'

interface CustomerFiltersProps {
  searchInput: string
  onSearchInputChange: (value: string) => void
  onSearch: (value: string) => void
  onReset: () => void
  onExportCSV: () => void
  isExporting: boolean
  totalCount?: number
  currentSearch: string
}

export function CustomerFilters({
  searchInput,
  onSearchInputChange,
  onSearch,
  onReset,
  onExportCSV,
  isExporting,
  totalCount,
  currentSearch,
}: CustomerFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
      <div className="flex-1 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch(searchInput)}
            placeholder="Rechercher un client..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
        {currentSearch && (
          <button
            onClick={onReset}
            className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {totalCount !== undefined && (
          <span className="text-sm text-gray-500 dark:text-gray-400">{totalCount} clients</span>
        )}
        <button
          onClick={onExportCSV}
          disabled={isExporting}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Exporter
        </button>
      </div>
    </div>
  )
}
