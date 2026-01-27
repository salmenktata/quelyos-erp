/**
 * Types pour les flux de paiement (Payment Flows)
 */

export interface PaymentFlow {
  id: number
  name: string
  type: string
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
