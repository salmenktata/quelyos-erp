/**
 * Stub component for PaymentFlowManager
 * TODO: Implement actual payment flow management
 */

interface PaymentFlowManagerProps {
  accountId: number
  accountName: string
}

export function PaymentFlowManager({ accountId, accountName }: PaymentFlowManagerProps) {
  return (
    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
      <p className="text-slate-400 text-sm">
        Gestion des flux de paiement pour {accountName} (ID: {accountId})
      </p>
      <p className="text-slate-500 text-xs mt-2">
        Fonctionnalité en cours de développement
      </p>
    </div>
  )
}
