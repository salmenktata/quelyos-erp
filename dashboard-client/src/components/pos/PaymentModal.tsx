/**
 * Modal de paiement POS avec pavé numérique
 */

import { useState, useEffect } from 'react'
import { X, Banknote, CreditCard, Wallet, Check, Loader2 } from 'lucide-react'
import type { POSPaymentMethod } from '../../types/pos'

interface PaymentModalProps {
  isOpen: boolean
  total: number
  paymentMethods: POSPaymentMethod[]
  isProcessing: boolean
  onClose: () => void
  onConfirm: (payments: { payment_method_id: number; amount: number }[]) => void
}

export function PaymentModal({
  isOpen,
  total,
  paymentMethods,
  isProcessing,
  onClose,
  onConfirm,
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<POSPaymentMethod | null>(null)
  const [amount, setAmount] = useState('')
  const [payments, setPayments] = useState<{ method: POSPaymentMethod; amount: number }[]>([])

  const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0)
  const remaining = total - paidAmount
  const change = paidAmount > total ? paidAmount - total : 0

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setSelectedMethod(paymentMethods.find(m => m.code === 'cash') || paymentMethods[0] || null)
      setAmount(total.toFixed(2))
      setPayments([])
    }
  }, [isOpen, total, paymentMethods])

  if (!isOpen) return null

  const handleNumPadClick = (value: string) => {
    if (value === 'C') {
      setAmount('')
    } else if (value === 'CE') {
      setAmount(prev => prev.slice(0, -1))
    } else if (value === '.') {
      if (!amount.includes('.')) {
        setAmount(prev => prev + '.')
      }
    } else {
      // Limit to 2 decimal places
      if (amount.includes('.') && amount.split('.')[1].length >= 2) return
      setAmount(prev => prev + value)
    }
  }

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toFixed(2))
  }

  const handleAddPayment = () => {
    if (!selectedMethod || !amount || parseFloat(amount) <= 0) return

    const paymentAmount = parseFloat(amount)
    setPayments(prev => [...prev, { method: selectedMethod, amount: paymentAmount }])
    setAmount('')
  }

  const handleConfirm = () => {
    // Add current amount if any
    const allPayments = [...payments]
    if (amount && parseFloat(amount) > 0 && selectedMethod) {
      allPayments.push({ method: selectedMethod, amount: parseFloat(amount) })
    }

    if (allPayments.length === 0) return

    onConfirm(allPayments.map(p => ({
      payment_method_id: p.method.id,
      amount: p.amount,
    })))
  }

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'cash': return Banknote
      case 'card': return CreditCard
      case 'digital': return Wallet
      default: return Banknote
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Paiement
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="flex">
          {/* Left: Amount and NumPad */}
          <div className="flex-1 p-4 border-r border-gray-200 dark:border-gray-700">
            {/* Amount display */}
            <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 mb-4">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Montant reçu</div>
              <div className="text-4xl font-bold text-gray-900 dark:text-white text-right">
                {amount || '0.00'} <span className="text-lg">TND</span>
              </div>
            </div>

            {/* Quick amounts */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[10, 20, 50, 100].map((quickAmount) => (
                <button
                  key={quickAmount}
                  onClick={() => handleQuickAmount(quickAmount)}
                  className="py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium transition-colors"
                >
                  {quickAmount}
                </button>
              ))}
            </div>

            {/* NumPad */}
            <div className="grid grid-cols-3 gap-2">
              {['7', '8', '9', '4', '5', '6', '1', '2', '3', 'C', '0', '.'].map((key) => (
                <button
                  key={key}
                  onClick={() => handleNumPadClick(key)}
                  className={`
                    py-4 text-xl font-semibold rounded-xl transition-colors
                    ${key === 'C'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                    }
                  `}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Payment methods and summary */}
          <div className="w-64 p-4 flex flex-col">
            {/* Payment methods */}
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Mode de paiement
              </div>
              <div className="space-y-2">
                {paymentMethods.map((method) => {
                  const Icon = getMethodIcon(method.type)
                  const isSelected = selectedMethod?.id === method.id
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method)}
                      className={`
                        w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all
                        ${isSelected
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }
                      `}
                    >
                      <Icon className={`h-5 w-5 ${isSelected ? 'text-teal-600' : 'text-gray-400'}`} />
                      <span className={`font-medium ${isSelected ? 'text-teal-600 dark:text-teal-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        {method.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Summary */}
            <div className="flex-1">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Total</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{total.toFixed(2)} TND</span>
                </div>
                {paidAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Payé</span>
                    <span className="font-semibold text-green-600">{paidAmount.toFixed(2)} TND</span>
                  </div>
                )}
                {remaining > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Reste</span>
                    <span className="font-semibold text-orange-600">{remaining.toFixed(2)} TND</span>
                  </div>
                )}
                {change > 0 && (
                  <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-gray-700 dark:text-gray-300">Rendu</span>
                    <span className="font-bold text-xl text-teal-600 dark:text-teal-400">{change.toFixed(2)} TND</span>
                  </div>
                )}
              </div>
            </div>

            {/* Confirm button */}
            <button
              onClick={handleConfirm}
              disabled={isProcessing || (!amount && payments.length === 0)}
              className="mt-4 w-full py-4 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white font-semibold rounded-xl text-lg transition-colors flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <Check className="h-5 w-5" />
                  Valider
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
