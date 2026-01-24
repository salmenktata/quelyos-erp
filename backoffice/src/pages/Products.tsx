import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout'
import {
  useProducts,
  useDeleteProduct,
  useArchiveProduct,
  useDuplicateProduct,
  useExportProducts,
  useImportProducts,
} from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'
import {
  Button,
  Badge,
  Modal,
  Breadcrumbs,
  SkeletonTable,
  OdooImage,
  Input,
  ImportProductsModal,
} from '../components/common'
import { useToast } from '../hooks/useToast'
import { ToastContainer } from '../components/common/Toast'
import type { ProductsQueryParams } from '../types'

type SortField = 'name' | 'price' | 'qty_available' | 'default_code'
type SortOrder = 'asc' | 'desc'

export default function Products() {
  const [page, setPage] = useState(0)
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>()
  const [stockStatusFilter, setStockStatusFilter] = useState<
    'in_stock' | 'low_stock' | 'out_of_stock' | undefined
  >()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [sortBy, setSortBy] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [deleteModal, setDeleteModal] = useState<{ id: number; name: string } | null>(null)
  const [duplicateModal, setDuplicateModal] = useState<{
    id: number
    name: string
    newName: string
  } | null>(null)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [includeArchived, setIncludeArchived] = useState(false)
  const [priceMin, setPriceMin] = useState<string>('')
  const [priceMax, setPriceMax] = useState<string>('')
  const limit = 20

  const toast = useToast()

  const queryParams: ProductsQueryParams = {
    limit,
    offset: page * limit,
    category_id: categoryFilter,
    search: searchQuery || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
    stock_status: stockStatusFilter,
    include_archived: includeArchived,
    price_min: priceMin ? Number(priceMin) : undefined,
    price_max: priceMax ? Number(priceMax) : undefined,
  }

  const { data: productsData, isLoading, error } = useProducts(queryParams)
  const { data: categoriesData } = useCategories()
  const deleteProductMutation = useDeleteProduct()
  const duplicateProductMutation = useDuplicateProduct()
  const exportProductsMutation = useExportProducts()
  const importProductsMutation = useImportProducts()
  const archiveProductMutation = useArchiveProduct()

  const products = (productsData?.data?.products || []) as import('../types').Product[]
  const total = (productsData?.data?.total || 0) as number
  const totalPages = Math.ceil(total / limit)

  const categories = (categoriesData?.data?.categories || []) as import('../types').Category[]

  // Recherche avec debounce
  const handleSearch = useCallback(() => {
    setSearchQuery(searchInput)
    setPage(0)
  }, [searchInput])

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const clearSearch = () => {
    setSearchInput('')
    setSearchQuery('')
    setPage(0)
  }

  // Tri
  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
    setPage(0)
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      )
    }
    return sortOrder === 'asc' ? (
      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    )
  }

  // Suppression
  const handleDeleteConfirm = async () => {
    if (!deleteModal) return

    try {
      await deleteProductMutation.mutateAsync(deleteModal.id)
      toast.success(`Le produit "${deleteModal.name}" a été supprimé avec succès`)
      setDeleteModal(null)
    } catch {
      toast.error('Erreur lors de la suppression du produit')
    }
  }

  // Duplication
  const handleDuplicateConfirm = async () => {
    if (!duplicateModal) return

    try {
      const result = await duplicateProductMutation.mutateAsync({
        id: duplicateModal.id,
        name: duplicateModal.newName,
      })
      toast.success(result.data?.message || 'Produit dupliqué avec succès')
      setDuplicateModal(null)
    } catch {
      toast.error('Erreur lors de la duplication du produit')
    }
  }

  // Export CSV
  const handleExport = async () => {
    try {
      const result = await exportProductsMutation.mutateAsync({
        category_id: categoryFilter,
        search: searchQuery || undefined,
      })

      if (!result.success || !result.data) {
        throw new Error('Export failed')
      }

      const { products: exportData, columns } = result.data

      // Créer le CSV
      const headers = columns.map((c) => c.label).join(';')
      const rows = exportData.map((p) =>
        columns.map((c) => {
          const value = p[c.key as keyof typeof p]
          // Échapper les points-virgules et guillemets
          const str = String(value ?? '')
          return str.includes(';') || str.includes('"')
            ? `"${str.replace(/"/g, '""')}"`
            : str
        }).join(';')
      )

      const csvContent = [headers, ...rows].join('\n')
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `produits_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      URL.revokeObjectURL(url)

      toast.success(`${exportData.length} produits exportés avec succès`)
    } catch {
      toast.error('Erreur lors de l\'export des produits')
    }
  }

  // Badge statut stock
  const getStockBadge = (status: string, qty: number) => {
    switch (status) {
      case 'in_stock':
        return <Badge variant="success">{qty} en stock</Badge>
      case 'low_stock':
        return <Badge variant="warning">{qty} (stock faible)</Badge>
      case 'out_of_stock':
        return <Badge variant="error">Rupture</Badge>
      default:
        return <Badge variant="neutral">{qty}</Badge>
    }
  }

  // Réinitialiser tous les filtres
  const resetFilters = () => {
    setCategoryFilter(undefined)
    setStockStatusFilter(undefined)
    setSearchInput('')
    setSearchQuery('')
    setSortBy('name')
    setSortOrder('asc')
    setPriceMin('')
    setPriceMax('')
    setPage(0)
  }

  const hasActiveFilters = categoryFilter || stockStatusFilter || searchQuery || priceMin || priceMax

  return (
    <Layout>
      <div className="p-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Tableau de bord', href: '/dashboard' },
            { label: 'Produits' },
          ]}
        />

        {/* En-tête */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Produits</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {total} produit{total > 1 ? 's' : ''} au total
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => setImportModalOpen(true)}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m4-8l-4-4m0 0L16 8m-4-4v12"
                  />
                </svg>
              }
            >
              Importer CSV
            </Button>
            <Button
              variant="secondary"
              onClick={handleExport}
              loading={exportProductsMutation.isPending}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              }
            >
              Exporter CSV
            </Button>
            <Link to="/products/create">
              <Button
                variant="primary"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                }
              >
                Nouveau produit
              </Button>
            </Link>
          </div>
        </div>

        {/* Filtres et Recherche */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Recherche */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rechercher
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Nom, SKU ou description..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  icon={
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                />
                <Button variant="primary" onClick={handleSearch}>
                  Rechercher
                </Button>
                {searchQuery && (
                  <Button variant="ghost" onClick={clearSearch}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                )}
              </div>
            </div>

            {/* Filtre catégorie */}
            <div>
              <label
                htmlFor="category-filter"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Catégorie
              </label>
              <select
                id="category-filter"
                value={categoryFilter || ''}
                onChange={(e) => {
                  setCategoryFilter(e.target.value ? Number(e.target.value) : undefined)
                  setPage(0)
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none"
              >
                <option value="">Toutes</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtre statut stock */}
            <div>
              <label
                htmlFor="stock-filter"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Statut stock
              </label>
              <select
                id="stock-filter"
                value={stockStatusFilter || ''}
                onChange={(e) => {
                  setStockStatusFilter(
                    e.target.value as 'in_stock' | 'low_stock' | 'out_of_stock' | undefined || undefined
                  )
                  setPage(0)
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none"
              >
                <option value="">Tous</option>
                <option value="in_stock">En stock</option>
                <option value="low_stock">Stock faible</option>
                <option value="out_of_stock">Rupture</option>
              </select>
            </div>
          </div>

          {/* Filtres de prix */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label
                htmlFor="price-min"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Prix minimum (€)
              </label>
              <input
                id="price-min"
                type="number"
                step="0.01"
                min="0"
                value={priceMin}
                onChange={(e) => {
                  setPriceMin(e.target.value)
                  setPage(0)
                }}
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="price-max"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Prix maximum (€)
              </label>
              <input
                id="price-max"
                type="number"
                step="0.01"
                min="0"
                value={priceMax}
                onChange={(e) => {
                  setPriceMax(e.target.value)
                  setPage(0)
                }}
                placeholder="1000.00"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Options supplémentaires */}
          <div className="mt-4 flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeArchived}
                onChange={(e) => {
                  setIncludeArchived(e.target.checked)
                  setPage(0)
                }}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Inclure les produits archivés
              </span>
            </label>
          </div>

          {/* Filtres actifs */}
          {hasActiveFilters && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Filtres actifs :</span>
              {searchQuery && (
                <Badge variant="info">Recherche: "{searchQuery}"</Badge>
              )}
              {categoryFilter && (
                <Badge variant="info">
                  Catégorie: {categories.find((c) => c.id === categoryFilter)?.name}
                </Badge>
              )}
              {stockStatusFilter && (
                <Badge variant="info">
                  Stock: {stockStatusFilter === 'in_stock' ? 'En stock' : stockStatusFilter === 'low_stock' ? 'Faible' : 'Rupture'}
                </Badge>
              )}
              {priceMin && (
                <Badge variant="info">Prix min: {priceMin} €</Badge>
              )}
              {priceMax && (
                <Badge variant="info">Prix max: {priceMax} €</Badge>
              )}
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Réinitialiser
              </Button>
            </div>
          )}
        </div>

        {/* Tableau */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {isLoading ? (
            <SkeletonTable rows={5} columns={6} />
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-600 dark:text-red-400 mb-2">
                Erreur lors du chargement des produits
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {error instanceof Error ? error.message : 'Erreur inconnue'}
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center">
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
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Aucun produit
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {hasActiveFilters
                  ? 'Aucun produit ne correspond à vos critères'
                  : 'Commencez par créer votre premier produit'}
              </p>
              {hasActiveFilters ? (
                <Button variant="secondary" onClick={resetFilters}>
                  Réinitialiser les filtres
                </Button>
              ) : (
                <Link to="/products/create">
                  <Button variant="primary">Créer un produit</Button>
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('name')}
                          className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                          Produit
                          <SortIcon field="name" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('default_code')}
                          className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                          SKU
                          <SortIcon field="default_code" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Catégorie
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('price')}
                          className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                          Prix
                          <SortIcon field="price" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('qty_available')}
                          className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                          Stock
                          <SortIcon field="qty_available" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {products.map((product) => (
                      <tr
                        key={product.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 shrink-0">
                              <OdooImage
                                src={product.image}
                                alt={product.name}
                                className="h-10 w-10 rounded object-cover"
                                fallback={
                                  <div className="h-10 w-10 rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                    <svg
                                      className="w-6 h-6 text-gray-400"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                      />
                                    </svg>
                                  </div>
                                }
                              />
                            </div>
                            <div className="ml-4">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-medium ${product.active === false ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>
                                  {product.name}
                                </span>
                                {product.active === false && (
                                  <Badge variant="neutral">Archivé</Badge>
                                )}
                              </div>
                              {product.variant_count && product.variant_count > 1 && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {product.variant_count} variantes
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                            {product.default_code || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {product.category ? (
                            <Badge variant="info">{product.category.name}</Badge>
                          ) : (
                            <span className="text-sm text-gray-400 dark:text-gray-500">
                              Sans catégorie
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {product.price.toFixed(2)} €
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStockBadge(product.stock_status, product.qty_available)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setDuplicateModal({
                                  id: product.id,
                                  name: product.name,
                                  newName: `${product.name} (copie)`,
                                })
                              }
                              title="Dupliquer"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async () => {
                                try {
                                  const isArchived = product.active === false
                                  await archiveProductMutation.mutateAsync({
                                    id: product.id,
                                    archive: !isArchived,
                                  })
                                  toast.success(
                                    isArchived
                                      ? `"${product.name}" a été désarchivé`
                                      : `"${product.name}" a été archivé`
                                  )
                                } catch {
                                  toast.error('Erreur lors de l\'archivage du produit')
                                }
                              }}
                              disabled={archiveProductMutation.isPending}
                              title={product.active === false ? 'Désarchiver' : 'Archiver'}
                            >
                              {product.active === false ? (
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                                  />
                                </svg>
                              )}
                            </Button>
                            <Link to={`/products/${product.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                Modifier
                              </Button>
                            </Link>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() =>
                                setDeleteModal({ id: product.id, name: product.name })
                              }
                              disabled={deleteProductMutation.isPending}
                            >
                              Supprimer
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Affichage{' '}
                    <span className="font-medium">{page * limit + 1}</span>-
                    <span className="font-medium">
                      {Math.min((page + 1) * limit, total)}
                    </span>{' '}
                    sur <span className="font-medium">{total}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                    >
                      Précédent
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                      disabled={page >= totalPages - 1}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal de confirmation de suppression */}
        <Modal
          isOpen={!!deleteModal}
          onClose={() => setDeleteModal(null)}
          onConfirm={handleDeleteConfirm}
          title="Supprimer le produit"
          description={`Êtes-vous sûr de vouloir supprimer le produit "${deleteModal?.name}" ? Cette action est irréversible.`}
          confirmText="Supprimer"
          cancelText="Annuler"
          variant="danger"
          loading={deleteProductMutation.isPending}
        />

        {/* Modal de duplication */}
        <Modal
          isOpen={!!duplicateModal}
          onClose={() => setDuplicateModal(null)}
          onConfirm={handleDuplicateConfirm}
          title="Dupliquer le produit"
          confirmText="Dupliquer"
          cancelText="Annuler"
          loading={duplicateProductMutation.isPending}
        >
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Une copie du produit "{duplicateModal?.name}" sera créée.
            </p>
            <Input
              label="Nom du nouveau produit"
              value={duplicateModal?.newName || ''}
              onChange={(e) =>
                setDuplicateModal(
                  duplicateModal ? { ...duplicateModal, newName: e.target.value } : null
                )
              }
              placeholder="Nom du produit"
            />
          </div>
        </Modal>

        {/* Modal d'import CSV */}
        <ImportProductsModal
          isOpen={importModalOpen}
          onClose={() => setImportModalOpen(false)}
          onImport={async (data) => {
            const result = await importProductsMutation.mutateAsync(data)
            if (result.success && result.data) {
              const { summary } = result.data
              if (summary.created_count > 0 || summary.updated_count > 0) {
                toast.success(
                  `Import terminé : ${summary.created_count} créé(s), ${summary.updated_count} mis à jour`
                )
              }
              return result.data
            }
            throw new Error(result.error || 'Erreur lors de l\'import')
          }}
          loading={importProductsMutation.isPending}
        />

        {/* ToastContainer */}
        <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} position="top-right" />
      </div>
    </Layout>
  )
}
