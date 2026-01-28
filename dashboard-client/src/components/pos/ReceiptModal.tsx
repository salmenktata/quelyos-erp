/**
 * Modal d'affichage et impression du ticket de caisse
 */

import { useRef } from 'react'
import { X, Printer, Download, Mail, CheckCircle } from 'lucide-react'
import type { POSOrder, POSConfig } from '../../types/pos'

interface ReceiptModalProps {
  isOpen: boolean
  order: POSOrder
  config: POSConfig
  onClose: () => void
}

export function ReceiptModal({
  isOpen,
  order,
  config,
  onClose,
}: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow && receiptRef.current) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Ticket ${order.reference}</title>
            <style>
              body { font-family: monospace; padding: 20px; max-width: 300px; margin: 0 auto; }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .mb-2 { margin-bottom: 8px; }
              .mb-4 { margin-bottom: 16px; }
              .border-t { border-top: 1px dashed #000; padding-top: 8px; margin-top: 8px; }
              .border-b { border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 8px; }
              .flex { display: flex; justify-content: space-between; }
              .font-bold { font-weight: bold; }
              .text-sm { font-size: 12px; }
              .text-lg { font-size: 18px; }
            </style>
          </head>
          <body>
            ${receiptRef.current.innerHTML}
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const handleDownloadPDF = () => {
    // TODO: Generate PDF using jsPDF or similar
    handlePrint()
  }

  const handleSendEmail = () => {
    // TODO: Send receipt via email
    alert('Fonctionnalité à venir : envoi par email')
  }

  if (!isOpen) return null

  const change = order.amountPaid - order.amountTotal

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">Paiement réussi</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{order.reference}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Receipt preview */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <div
            ref={receiptRef}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 font-mono text-sm"
          >
            {/* Header */}
            <div className="text-center mb-4 border-b border-dashed border-gray-300 dark:border-gray-600 pb-4">
              {config.receipt.header ? (
                <pre className="whitespace-pre-wrap text-gray-900 dark:text-white">
                  {config.receipt.header}
                </pre>
              ) : (
                <>
                  <p className="font-bold text-gray-900 dark:text-white">{config.name}</p>
                  <p className="text-gray-500 dark:text-gray-400">Point de Vente</p>
                </>
              )}
            </div>

            {/* Order info */}
            <div className="mb-4 text-gray-600 dark:text-gray-400">
              <p>Ticket: {order.reference}</p>
              <p>Date: {order.paidAt ? new Date(order.paidAt).toLocaleString('fr-FR') : '-'}</p>
              {order.customerName && <p>Client: {order.customerName}</p>}
            </div>

            {/* Items */}
            <div className="border-t border-b border-dashed border-gray-300 dark:border-gray-600 py-3 mb-3">
              {order.lines.map((line) => (
                <div key={line.id} className="mb-2">
                  <div className="flex justify-between text-gray-900 dark:text-white">
                    <span className="flex-1 truncate">{line.productName}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>{line.quantity} x {line.priceUnit.toFixed(2)}</span>
                    <span>{line.priceSubtotal.toFixed(2)}</span>
                  </div>
                  {line.discount > 0 && (
                    <div className="text-green-600 dark:text-green-400 text-xs">
                      Remise: -{line.discount}%
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-1 mb-3">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Sous-total HT</span>
                <span>{order.amountUntaxed.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>TVA</span>
                <span>{order.amountTax.toFixed(2)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Remise</span>
                  <span>-{order.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white border-t border-dashed border-gray-300 dark:border-gray-600 pt-2">
                <span>TOTAL TTC</span>
                <span>{order.amountTotal.toFixed(2)} TND</span>
              </div>
            </div>

            {/* Payments */}
            <div className="border-t border-dashed border-gray-300 dark:border-gray-600 pt-3 mb-3">
              {order.payments.map((payment) => (
                <div key={payment.id} className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{payment.methodName}</span>
                  <span>{payment.amount.toFixed(2)}</span>
                </div>
              ))}
              {change > 0 && (
                <div className="flex justify-between font-bold text-gray-900 dark:text-white mt-1">
                  <span>RENDU</span>
                  <span>{change.toFixed(2)} TND</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="text-center mt-4 border-t border-dashed border-gray-300 dark:border-gray-600 pt-4 text-gray-500 dark:text-gray-400">
              {config.receipt.footer ? (
                <pre className="whitespace-pre-wrap">{config.receipt.footer}</pre>
              ) : (
                <p>Merci de votre visite !</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
          >
            <Printer className="h-4 w-4" />
            Imprimer
          </button>
          <button
            onClick={handleDownloadPDF}
            className="p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            title="Télécharger PDF"
          >
            <Download className="h-5 w-5" />
          </button>
          <button
            onClick={handleSendEmail}
            className="p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            title="Envoyer par email"
          >
            <Mail className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
