/**
 * Logique de validation pour TransactionFormPage
 * Extrait de la fonction addTransaction
 */

import type { TransactionFormData } from './transactionFormReducer'

export interface ValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Valide les données du formulaire de transaction
 */
export function validateTransactionForm(formData: TransactionFormData): ValidationResult {
  const { status, scheduledFor } = formData

  // Vérifier que la date planifiée est fournie pour les statuts PLANNED/SCHEDULED
  const requiresSchedule = status === 'PLANNED' || status === 'SCHEDULED'
  if (requiresSchedule && !scheduledFor) {
    return {
      isValid: false,
      error:
        'La date planifiée est obligatoire pour les transactions planifiées ou programmées.',
    }
  }

  return {
    isValid: true,
  }
}

/**
 * Prépare le payload pour l'API à partir des données du formulaire
 */
export function prepareTransactionPayload(formData: TransactionFormData) {
  const { amount, accountId, paymentFlowId, status, occurredAt, scheduledFor, tags, description, categoryId } = formData

  // Parser les tags (séparés par virgules)
  const parsedTags =
    tags
      ?.split(',')
      .map((t) => t.trim())
      .filter(Boolean) || []

  return {
    amount: parseFloat(amount),
    accountId: Number(accountId),
    paymentFlowId: paymentFlowId || undefined,
    status,
    occurredAt,
    scheduledFor: scheduledFor || undefined,
    tags: parsedTags.length > 0 ? parsedTags : undefined,
    description: description || undefined,
    categoryId: categoryId ? Number(categoryId) : undefined,
  }
}
