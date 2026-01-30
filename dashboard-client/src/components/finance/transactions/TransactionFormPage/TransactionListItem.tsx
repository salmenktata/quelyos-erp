/**
 * Item de liste de transaction
 * Extrait de TransactionFormPage.tsx pour réduire la complexité
 */

type Transaction = {
  id: number
  amount: number
  type: 'credit' | 'debit'
  accountId: number
  occurredAt: string
  scheduledFor?: string | null
  status?: 'PLANNED' | 'CONFIRMED' | 'SCHEDULED' | 'CANCELED'
  tags?: string[]
  description?: string | null
  account?: { id: number; name?: string }
  category?: { id: number; name: string; kind: 'INCOME' | 'EXPENSE' } | null
}

interface ConfigType {
  amountColor: string
  amountPrefix: string
}

interface TransactionListItemProps {
  transaction: Transaction
  config: ConfigType
  currency: string
  statusOptions: Array<{ value: string; label: string }>
  deletingId: number | null
  onEdit: (tx: Transaction) => void
  onDelete: (id: number) => void
}

export function TransactionListItem({
  transaction,
  config,
  currency,
  statusOptions,
  deletingId,
  onEdit,
  onDelete,
}: TransactionListItemProps) {
  return (
    <div className="flex items-start justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3">
      <div className="space-y-1">
        <div className="font-medium">
          {transaction.account?.name || `Compte #${transaction.accountId}`}
        </div>
        <div className="text-xs text-indigo-100/70">
          {new Date(transaction.occurredAt).toLocaleDateString('fr-FR')}
        </div>
        {transaction.scheduledFor && (
          <div className="text-xs text-indigo-100/70">
            Prévu le {new Date(transaction.scheduledFor).toLocaleDateString('fr-FR')}
          </div>
        )}
        {transaction.category && (
          <div className="text-[11px] inline-flex items-center rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-indigo-50">
            {transaction.category.name}
          </div>
        )}
        {transaction.status && (
          <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide">
            {statusOptions.find((s) => s.value === transaction.status)?.label ||
              transaction.status}
          </span>
        )}
        {transaction.tags && transaction.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {transaction.tags.map((tag: string) => (
              <span
                key={tag}
                className="rounded-full bg-white/10 px-2 py-1 text-[11px] text-indigo-100"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {transaction.description && (
          <p className="text-sm text-indigo-50/80 whitespace-pre-wrap">{transaction.description}</p>
        )}
      </div>
      <div className={`${config.amountColor} font-semibold text-right`}>
        {config.amountPrefix}
        {transaction.amount} {currency}
        <div className="mt-2 flex flex-wrap justify-end gap-2 text-xs">
          <button
            onClick={() => onEdit(transaction)}
            className="rounded-lg border border-white/20 px-3 py-1 text-indigo-50 hover:border-white/40"
          >
            Modifier
          </button>
          <button
            onClick={() => onDelete(transaction.id)}
            className="rounded-lg border border-red-300/40 px-3 py-1 text-red-100 hover:border-red-300/70 disabled:opacity-60"
            disabled={deletingId === transaction.id}
          >
            {deletingId === transaction.id ? 'Suppression...' : 'Supprimer'}
          </button>
        </div>
      </div>
    </div>
  )
}
