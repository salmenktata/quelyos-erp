import { useState, useCallback } from 'react'

export function useExportCustomers() {
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const exportCSV = useCallback(async (_search?: string): Promise<boolean> => {
    setIsExporting(true)
    setError(null)
    try {
      // Stub: export not yet implemented
      await new Promise((resolve) => setTimeout(resolve, 500))
      return true
    } catch (_err) {
      setError('Export failed')
      return false
    } finally {
      setIsExporting(false)
    }
  }, [])

  const exportCustomers = exportCSV

  return { exportCSV, exportCustomers, isExporting, error }
}
