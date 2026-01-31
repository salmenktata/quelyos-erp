import { useCallback } from 'react'

interface ToastApi {
  addToast: (type: 'success' | 'error' | 'info', message: string) => void
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

export function useToast(): ToastApi {
  const addToast = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    console.info(`[Toast:${type}] ${message}`)
  }, [])

  const success = useCallback((message: string) => addToast('success', message), [addToast])
  const error = useCallback((message: string) => addToast('error', message), [addToast])
  const info = useCallback((message: string) => addToast('info', message), [addToast])

  return { addToast, success, error, info }
}
