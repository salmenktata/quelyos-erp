import { createContext, useContext, ReactNode } from 'react'
import { useToast as useToastHook } from '../hooks/useToast'
import { ToastContainer } from '../components/common/Toast'

interface ToastContextType {
  success: (message: string, duration?: number) => string
  error: (message: string, duration?: number) => string
  warning: (message: string, duration?: number) => string
  info: (message: string, duration?: number) => string
  clearAll: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const toast = useToastHook()

  return (
    <ToastContext.Provider
      value={{
        success: toast.success,
        error: toast.error,
        warning: toast.warning,
        info: toast.info,
        clearAll: toast.clearAll,
      }}
    >
      {children}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} position="top-right" />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
