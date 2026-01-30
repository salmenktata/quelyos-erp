import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TenantProvider } from './contexts/TenantContext'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: Error) => {
        // Ne pas retry les erreurs 4xx (client errors)
        const status = (error as Error & { response?: { status?: number } })?.response?.status
        if (status && status >= 400 && status < 500) {
          return false
        }
        // Retry max 3 fois pour 5xx (server errors) et network errors
        return failureCount < 3
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false, // Pas de retry automatique pour mutations
    }
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TenantProvider>
          <App />
        </TenantProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
