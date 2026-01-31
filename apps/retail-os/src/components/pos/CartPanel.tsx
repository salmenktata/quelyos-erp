/**
 * Panneau panier POS avec gestion des quantités
 */

import { Trash2, Minus, Plus, User, Percent, ShoppingCart } from 'lucide-react'
import type { POSCartLine, POSCustomer } from '../../types/pos'

interface CartPanelProps {
  lines: POSCartLine[]
  customer: POSCustomer | null
  subtotal: number
  discountAmount: number
  total: number
  itemCount: number
  onUpdateQuantity: (lineId: string, quantity: number) => void
  onRemoveLine: (lineId: string) => void
  onSelectCustomer: () => void
  onApplyDiscount: () => void
  onCheckout: () => void
  onClearCart: () => void
}

export function CartPanel({
  lines,
  customer,
  subtotal,
  discountAmount,
  total,
  itemCount,
  onUpdateQuantity,
  onRemoveLine,
  onSelectCustomer,
  onApplyDiscount,
  onCheckout,
  onClearCart,
}: CartPanelProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            <span className="font-semibold text-gray-900 dark:text-white">Panier</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {itemCount} {itemCount > 1 ? 'articles' : 'article'}
            </span>
            {lines.length > 0 && (
              <button
                onClick={onClearCart}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                title="Vider le panier"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Customer selection */}
        <button
          onClick={onSelectCustomer}
          className="mt-3 w-full flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
        >
          <User className="h-4 w-4 text-gray-400" />
          {customer ? (
            <span className="text-gray-900 dark:text-white font-medium">{customer.name}</span>
          ) : (
            <span className="text-gray-500">Ajouter un client</span>
          )}
        </button>
      </div>

      {/* Cart items */}
      <div className="flex-1 overflow-y-auto">
        {lines.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <ShoppingCart className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-gray-400 dark:text-gray-500">Panier vide</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Ajoutez des produits</p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {lines.map((line) => (
              <CartLineItem
                key={line.id}
                line={line}
                onUpdateQuantity={(qty) => onUpdateQuantity(line.id, qty)}
                onRemove={() => onRemoveLine(line.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Totals and actions */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Sous-total</span>
          <span className="text-gray-900 dark:text-white">{subtotal.toFixed(2)} TND</span>
        </div>

        {/* Discount */}
        {discountAmount > 0 && (
          <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
            <span>Remise</span>
            <span>-{discountAmount.toFixed(2)} TND</span>
          </div>
        )}

        {/* Total */}
        <div className="flex justify-between text-xl font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
          <span className="text-gray-900 dark:text-white">Total</span>
          <span className="text-teal-600 dark:text-teal-400">{total.toFixed(2)} TND</span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={onApplyDiscount}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Percent className="h-4 w-4" />
            Remise
          </button>
        </div>

        <button
          onClick={onCheckout}
          disabled={lines.length === 0}
          className="w-full py-4 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-lg transition-colors flex items-center justify-center gap-2"
        >
          💳 Payer {total.toFixed(2)} TND
        </button>
      </div>
    </div>
  )
}

interface CartLineItemProps {
  line: POSCartLine
  onUpdateQuantity: (quantity: number) => void
  onRemove: () => void
}

function CartLineItem({ line, onUpdateQuantity, onRemove }: CartLineItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Product image */}
      <div className="w-12 h-12 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
        {line.imageUrl ? (
          <img src={line.imageUrl} alt={line.productName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ShoppingCart className="h-5 w-5" />
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {line.productName}
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {line.priceUnit.toFixed(2)} TND
          {line.discount > 0 && (
            <span className="text-green-600 dark:text-green-400 ml-1">-{line.discount}%</span>
          )}
        </p>
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onUpdateQuantity(line.quantity - 1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Minus className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </button>
        <span className="w-8 text-center font-medium text-gray-900 dark:text-white">
          {line.quantity}
        </span>
        <button
          onClick={() => onUpdateQuantity(line.quantity + 1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Line total and remove */}
      <div className="flex flex-col items-end gap-1">
        <span className="font-medium text-gray-900 dark:text-white">
          {line.priceSubtotal.toFixed(2)}
        </span>
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
