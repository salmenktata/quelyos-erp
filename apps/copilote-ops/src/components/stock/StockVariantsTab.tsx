import { SkeletonTable } from '@/components/common'
import { VariantStockTable } from './VariantStockTable'
import { ArrowLeft, LayoutGrid, Package } from 'lucide-react'

interface StockVariantsTabProps {
  selectedProduct: { id: number; name: string } | null
  variantsData: { data?: { variants?: unknown[] } } | undefined
  isLoadingVariants: boolean
  onBack: () => void
  onRefetchVariants: () => void
  onGoToProducts: () => void
}

export function StockVariantsTab({
  selectedProduct,
  variantsData,
  isLoadingVariants,
  onBack,
  onRefetchVariants,
  onGoToProducts,
}: StockVariantsTabProps) {
  if (selectedProduct) {
    return (
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              Retour aux produits
            </button>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Variantes de : {selectedProduct.name}
            </h2>
          </div>
        </div>

        {/* Variants table */}
        {isLoadingVariants ? (
          <SkeletonTable rows={5} columns={7} />
        ) : variantsData?.data?.variants && variantsData.data.variants.length > 0 ? (
          <VariantStockTable
            productId={selectedProduct.id}
            variants={variantsData.data.variants as Parameters<typeof VariantStockTable>[0]['variants']}
            onStockUpdated={onRefetchVariants}
          />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <LayoutGrid className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Aucune variante
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {`Ce produit n'a pas de variantes configurées.`}
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
      <LayoutGrid className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" aria-hidden="true" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Sélectionnez un produit
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        {`Revenez à l'onglet "Tous les Produits" et cliquez sur "Voir variantes" pour un produit.`}
      </p>
      <button
        onClick={onGoToProducts}
        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
      >
        <Package className="h-5 w-5" aria-hidden="true" />
        Aller aux produits
      </button>
    </div>
  )
}
