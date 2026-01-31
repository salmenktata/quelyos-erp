import { useCallback } from 'react'

interface ToastApi {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

export function useToast(): ToastApi {
  const success = useCallback((message: string) => {
    console.info(`[Toast:success] ${message}`)
  }, [])

  const error = useCallback((message: string) => {
    console.error(`[Toast:error] ${message}`)
  }, [])

  const info = useCallback((message: string) => {
    console.info(`[Toast:info] ${message}`)
  }, [])

  return { success, error, info }
}
