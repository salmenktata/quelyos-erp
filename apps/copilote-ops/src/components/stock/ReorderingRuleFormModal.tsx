import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { X, Package, Warehouse, TrendingUp, Info } from 'lucide-react'
import { useCreateReorderingRule, useUpdateReorderingRule } from '@/hooks/useReorderingRules'
import { useWarehouses } from '@/hooks/useWarehouses'
import { useProducts } from '@/hooks/useProducts'
import type { ReorderingRule } from '@/types/stock'
import { logger } from '@quelyos/logger'

// ═══════════════════════════════════════════════════════════════════════════
// SCHEMA DE VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

const schema = z.object({
  product_id: z.number().min(1, 'Sélectionnez un produit'),
  warehouse_id: z.number().min(1, 'Sélectionnez un entrepôt'),
  product_min_qty: z.number().min(0, 'Quantité minimum doit être ≥ 0'),
  product_max_qty: z.number().min(1, 'Quantité maximum doit être ≥ 1'),
  qty_multiple: z.number().min(1, 'Multiple doit être ≥ 1'),
}).refine(data => data.product_min_qty < data.product_max_qty, {
  message: 'Seuil minimum doit être inférieur au seuil maximum',
  path: ['product_max_qty']
})

type FormData = z.infer<typeof schema>

// ═══════════════════════════════════════════════════════════════════════════
// PROPS
// ═══════════════════════════════════════════════════════════════════════════

interface ReorderingRuleFormModalProps {
  isOpen: boolean
  onClose: () => void
  rule?: ReorderingRule
  onSuccess?: () => void
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

export function ReorderingRuleFormModal({
  isOpen,
  onClose,
  rule,
  onSuccess
}: ReorderingRuleFormModalProps) {
  const mode = rule ? 'edit' : 'create'

  const { mutate: createRule, isPending: isCreating } = useCreateReorderingRule()
  const { mutate: updateRule, isPending: isUpdating } = useUpdateReorderingRule()
  const { data: warehousesData } = useWarehouses({ active_only: true })
  const { data: productsData } = useProducts()

  const warehouses = warehousesData || []
  const products = productsData || []

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      product_id: rule?.product_id || undefined,
      warehouse_id: rule?.warehouse_id || undefined,
      product_min_qty: rule?.min_qty || 10,
      product_max_qty: rule?.max_qty || 50,
      qty_multiple: rule?.qty_multiple || 1,
    }
  })

  // Reset form quand la modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      form.reset({
        product_id: rule?.product_id || undefined,
        warehouse_id: rule?.warehouse_id || undefined,
        product_min_qty: rule?.min_qty || 10,
        product_max_qty: rule?.max_qty || 50,
        qty_multiple: rule?.qty_multiple || 1,
      })
    }
  }, [isOpen, rule, form])

  const selectedProductId = form.watch('product_id')
  const _selectedWarehouseId = form.watch('warehouse_id')
  const minQty = form.watch('product_min_qty')
  const maxQty = form.watch('product_max_qty')
  const multiple = form.watch('qty_multiple')

  // Récupérer le produit sélectionné
  const selectedProduct = useMemo(() => {
    return products.find(p => p.id === selectedProductId)
  }, [products, selectedProductId])

  // Simuler le stock actuel (dans une vraie implémentation, on ferait un appel API)
  const currentStock = rule?.current_stock || selectedProduct?.stockQuantity || 0

  // Calculer preview quantité à commander
  const willTrigger = currentStock < minQty
  const qtyToOrder = useMemo(() => {
    if (!willTrigger) return 0
    const qtyNeeded = maxQty - currentStock
    if (multiple > 1) {
      return Math.ceil(qtyNeeded / multiple) * multiple
    }
    return qtyNeeded
  }, [willTrigger, maxQty, currentStock, multiple])

  const onSubmit = (data: FormData) => {
    if (mode === 'create') {
      createRule(
        data,
        {
          onSuccess: () => {
            logger.info('[ReorderingRuleFormModal] Rule created')
            onClose()
            if (onSuccess) onSuccess()
          },
          onError: (error: Error) => {
            logger.error('[ReorderingRuleFormModal] Create error:', error)
            alert(error.message || 'Erreur lors de la création')
          }
        }
      )
    } else if (rule) {
      updateRule(
        {
          id: rule.id,
          min_qty: data.product_min_qty,
          max_qty: data.product_max_qty,
          qty_multiple: data.qty_multiple,
        },
        {
          onSuccess: () => {
            logger.info('[ReorderingRuleFormModal] Rule updated')
            onClose()
            if (onSuccess) onSuccess()
          },
          onError: (error: Error) => {
            logger.error('[ReorderingRuleFormModal] Update error:', error)
            alert(error.message || 'Erreur lors de la mise à jour')
          }
        }
      )
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {mode === 'create' ? 'Nouvelle règle de réapprovisionnement' : 'Modifier la règle'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Product & Warehouse */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Package className="h-4 w-4 inline mr-1" />
                Produit
              </label>
              <select
                {...form.register('product_id', { valueAsNumber: true })}
                disabled={mode === 'edit'}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
              >
                <option value="">Sélectionner...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
              {form.formState.errors.product_id && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {form.formState.errors.product_id.message}
                </p>
              )}
            </div>

            {/* Warehouse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Warehouse className="h-4 w-4 inline mr-1" />
                Entrepôt
              </label>
              <select
                {...form.register('warehouse_id', { valueAsNumber: true })}
                disabled={mode === 'edit'}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
              >
                <option value="">Sélectionner...</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
              {form.formState.errors.warehouse_id && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {form.formState.errors.warehouse_id.message}
                </p>
              )}
            </div>
          </div>

          {/* Quantities */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Min Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Seuil minimum
              </label>
              <input
                type="number"
                step="1"
                {...form.register('product_min_qty', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {form.formState.errors.product_min_qty && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {form.formState.errors.product_min_qty.message}
                </p>
              )}
            </div>

            {/* Max Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Seuil maximum
              </label>
              <input
                type="number"
                step="1"
                {...form.register('product_max_qty', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {form.formState.errors.product_max_qty && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {form.formState.errors.product_max_qty.message}
                </p>
              )}
            </div>

            {/* Multiple */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Multiple de commande
              </label>
              <input
                type="number"
                step="1"
                {...form.register('qty_multiple', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {form.formState.errors.qty_multiple && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {form.formState.errors.qty_multiple.message}
                </p>
              )}
            </div>
          </div>

          {/* Preview */}
          {selectedProduct && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 text-sm text-blue-800 dark:text-blue-300">
                  <p className="font-medium mb-2">Aperçu de la règle :</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Stock actuel : <strong>{currentStock}</strong></li>
                    <li>Seuil de déclenchement : <strong>{minQty}</strong></li>
                    <li>Quantité cible : <strong>{maxQty}</strong></li>
                    {willTrigger ? (
                      <li className="text-orange-600 dark:text-orange-400">
                        <TrendingUp className="h-4 w-4 inline mr-1" />
                        Cette règle serait déclenchée (stock {`<`} seuil)
                      </li>
                    ) : (
                      <li className="text-green-600 dark:text-green-400">
                        Stock suffisant, règle non déclenchée
                      </li>
                    )}
                    {willTrigger && (
                      <li>
                        Quantité à commander : <strong>{qtyToOrder}</strong>
                        {multiple > 1 && <span className="text-xs"> (arrondi au multiple de {multiple})</span>}
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating || isUpdating ? 'Enregistrement...' : mode === 'create' ? 'Créer' : 'Modifier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
