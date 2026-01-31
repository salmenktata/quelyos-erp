/**
 * Hook pour les notifications toast
 */
import { useCallback } from 'react'

export function useToast() {
  const success = useCallback((message: string) => {
    void message
    // Will be connected to toast context
  }, [])

  const error = useCallback((message: string) => {
    void message
  }, [])

  const info = useCallback((message: string) => {
    void message
  }, [])

  return { success, error, info }
}
