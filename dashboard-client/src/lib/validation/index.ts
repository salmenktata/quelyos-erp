/**
 * Module de validation pour Quelyos Dashboard
 *
 * @example
 * import { productSchema, useZodForm } from '@/lib/validation'
 *
 * const form = useZodForm(productSchema)
 */

// Schémas
export * from './schemas'

// Hooks
export { useZodForm, useValidation, useAsyncValidation, formatValidationErrors, getFirstError } from './hooks'
export type { ValidationError } from './hooks'
