/**
 * Types pour les flux de paiement (Payment Flows)
 */

// Types de catégorie de transaction
export type TransactionCategory = 'income' | 'expense' | 'transfer' | 'recurring'

// Types de méthode de paiement
export type PaymentMethod = 'CASH' | 'CARD' | 'CHECK' | 'TRANSFER' | 'MOBILE' | 'OTHER' | 'DIRECT_DEBIT' | 'WIRE_TRANSFER' | 'BILL_OF_EXCHANGE' | 'PROMISSORY_NOTE' | 'BANK_CHARGE'

// Union des deux pour compatibilité
export type FlowType = TransactionCategory | PaymentMethod

export interface PaymentFlow {
  id: number
  name: string
  type: FlowType
  amount?: number
  frequency?: string
  description?: string
  active?: boolean
  accountId?: number
}

export type CreatePaymentFlowRequest = {
  name: string
  type: string
  amount?: number
  frequency?: string
  description?: string
}

export type UpdatePaymentFlowRequest = Partial<CreatePaymentFlowRequest>
