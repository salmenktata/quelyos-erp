/**
 * Import types - stub for finance module
 */

export type FieldType = 'date' | 'amount' | 'description' | 'category' | 'type' | 'account' | 'reference'

export interface ImportField {
  value: FieldType
  label: string
  required?: boolean
  description?: string
}

export interface ColumnMapping {
  columnIndex: number
  headerName: string
  confidence: number
}

export interface DetectedColumns {
  [key: string]: ColumnMapping
}

export interface CurrentMappings {
  [key: string]: ColumnMapping | undefined
}

export interface ImportPreview {
  rows: Record<string, unknown>[]
  headers: string[]
  mappings: ColumnMapping[]
}

export interface ImportResult {
  success: boolean
  imported: number
  errors: string[]
}

export interface ColumnMappingTableProps {
  detectedColumns: DetectedColumns
  previewData: Record<string, unknown>[]
  currentMappings: CurrentMappings
  onMappingChange: (fieldType: FieldType, mapping: ColumnMapping | null) => void
  requiredFields: FieldType[]
}

export const TARGET_FIELDS: ImportField[] = [
  { value: 'date', label: 'Date', required: true, description: 'Date de la transaction' },
  { value: 'amount', label: 'Montant', required: true, description: 'Montant' },
  { value: 'description', label: 'Description', required: false, description: 'Description' },
  { value: 'category', label: 'Catégorie', required: false, description: 'Catégorie' },
  { value: 'type', label: 'Type', required: true, description: 'Type (credit/debit)' },
  { value: 'account', label: 'Compte', required: false, description: 'Compte' },
  { value: 'reference', label: 'Référence', required: false, description: 'Référence' },
]

export const IMPORT_FIELDS = TARGET_FIELDS

// Additional component props
export interface FileUploadZoneProps {
  onFileSelect: (file: File) => void
  isLoading?: boolean
  accept?: string
  maxSize?: number
}

export interface ImportSummaryProps {
  totalRows: number
  validRows: number
  errorRows: number
  errors: Array<{ row: number; message: string }>
  warnings: Array<{ row: number; message: string }>
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export interface ImportWizardStepsProps {
  currentStep: number
  steps: Array<{ id: string; label: string; completed: boolean }>
  onStepClick?: (stepIndex: number) => void
}
