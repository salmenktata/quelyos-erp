/**
 * Reducer pour l'état du formulaire TransactionFormPage
 * Consolide 7 useState en un seul état centralisé
 */

export interface TransactionFormData {
  amount: string
  accountId: string
  paymentFlowId: number | null
  status: 'CONFIRMED' | 'PLANNED' | 'SCHEDULED' | 'PENDING' | 'CANCELLED'
  occurredAt: string
  scheduledFor: string
  tags: string
  description: string
  categoryId: string
}

export interface DuplicateMatch {
  transactionId: number
  description: string
  amount: number
  date: string
  similarity_score: number
  description_similarity: number
  amount_proximity: number
  date_proximity: number
}

export interface TransactionFormState {
  formData: TransactionFormData
  loading: boolean
  error: string | null
  editingId: number | null
  // Duplicate detection
  showDuplicateModal: boolean
  duplicateMatches: DuplicateMatch[]
  pendingTransaction: unknown | null
}

export const initialTransactionFormData: TransactionFormData = {
  amount: '',
  accountId: '',
  paymentFlowId: null,
  status: 'CONFIRMED',
  occurredAt: new Date().toISOString().slice(0, 10),
  scheduledFor: '',
  tags: '',
  description: '',
  categoryId: '',
}

export const initialTransactionFormState: TransactionFormState = {
  formData: initialTransactionFormData,
  loading: false,
  error: null,
  editingId: null,
  showDuplicateModal: false,
  duplicateMatches: [],
  pendingTransaction: null,
}

export type TransactionFormAction =
  | { type: 'SET_FORM_DATA'; payload: Partial<TransactionFormData> }
  | { type: 'RESET_FORM_DATA' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_EDITING_ID'; payload: number | null }
  | { type: 'SET_FORM_FOR_EDIT'; payload: TransactionFormData & { editingId: number } }
  | { type: 'SHOW_DUPLICATE_MODAL'; payload: { matches: DuplicateMatch[]; pendingTransaction: unknown } }
  | { type: 'HIDE_DUPLICATE_MODAL' }
  | { type: 'CONFIRM_DUPLICATE' }
  | { type: 'IGNORE_DUPLICATE' }

export function transactionFormReducer(
  state: TransactionFormState,
  action: TransactionFormAction
): TransactionFormState {
  switch (action.type) {
    case 'SET_FORM_DATA':
      return {
        ...state,
        formData: {
          ...state.formData,
          ...action.payload,
        },
      }

    case 'RESET_FORM_DATA':
      return {
        ...state,
        formData: initialTransactionFormData,
        editingId: null,
        error: null,
      }

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      }

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      }

    case 'SET_EDITING_ID':
      return {
        ...state,
        editingId: action.payload,
      }

    case 'SET_FORM_FOR_EDIT':
      return {
        ...state,
        formData: {
          amount: action.payload.amount,
          accountId: action.payload.accountId,
          paymentFlowId: action.payload.paymentFlowId,
          status: action.payload.status,
          occurredAt: action.payload.occurredAt,
          scheduledFor: action.payload.scheduledFor,
          tags: action.payload.tags,
          description: action.payload.description,
          categoryId: action.payload.categoryId,
        },
        editingId: action.payload.editingId,
      }

    case 'SHOW_DUPLICATE_MODAL':
      return {
        ...state,
        showDuplicateModal: true,
        duplicateMatches: action.payload.matches,
        pendingTransaction: action.payload.pendingTransaction,
        loading: false,
      }

    case 'HIDE_DUPLICATE_MODAL':
      return {
        ...state,
        showDuplicateModal: false,
        duplicateMatches: [],
        pendingTransaction: null,
      }

    case 'CONFIRM_DUPLICATE':
      return {
        ...state,
        showDuplicateModal: false,
        duplicateMatches: [],
        pendingTransaction: null,
        formData: initialTransactionFormData,
      }

    case 'IGNORE_DUPLICATE':
      return {
        ...state,
        showDuplicateModal: false,
        duplicateMatches: [],
        pendingTransaction: null,
        formData: initialTransactionFormData,
      }

    default:
      return state
  }
}
