import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useUserCurrencyPreference,
  useAvailableCurrencies,
  useExchangeRates,
} from '../useCurrencyData'

// Mock api
vi.mock('@/lib/api', () => ({
  api: {
    request: vi.fn(),
  },
}))

import { api } from '@/lib/api'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useCurrencyData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useUserCurrencyPreference', () => {
    it('fetches user currency preference', async () => {
      const mockPreference = {
        displayCurrency: 'EUR',
        baseCurrency: 'EUR',
        isCustom: false,
      }
      vi.mocked(api.request).mockResolvedValue(mockPreference)

      const { result } = renderHook(() => useUserCurrencyPreference(), {
        wrapper: createWrapper(),
      })

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(mockPreference)
      expect(api.request).toHaveBeenCalledWith('/currencies/user/currency-preference')
    })

    it('handles API error', async () => {
      vi.mocked(api.request).mockRejectedValue(new Error('Unauthorized'))

      const { result } = renderHook(() => useUserCurrencyPreference(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeTruthy()
    })
  })

  describe('useAvailableCurrencies', () => {
    it('fetches available currencies', async () => {
      const mockCurrencies = {
        currencies: [
          { code: 'EUR', symbol: '\u20ac', name: 'Euro' },
          { code: 'USD', symbol: '$', name: 'US Dollar' },
          { code: 'GBP', symbol: '\u00a3', name: 'British Pound' },
        ],
        defaultCurrency: 'EUR',
      }
      vi.mocked(api.request).mockResolvedValue(mockCurrencies)

      const { result } = renderHook(() => useAvailableCurrencies(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(mockCurrencies)
      expect(result.current.data?.currencies).toHaveLength(3)
      expect(api.request).toHaveBeenCalledWith('/currencies')
    })

    it('handles empty currencies list', async () => {
      vi.mocked(api.request).mockResolvedValue({
        currencies: [],
        defaultCurrency: 'EUR',
      })

      const { result } = renderHook(() => useAvailableCurrencies(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data?.currencies).toEqual([])
    })
  })

  describe('useExchangeRates', () => {
    it('fetches exchange rates', async () => {
      const mockRates = {
        baseCurrency: 'EUR',
        rates: {
          USD: 1.08,
          GBP: 0.86,
          JPY: 162.5,
        },
      }
      vi.mocked(api.request).mockResolvedValue(mockRates)

      const { result } = renderHook(() => useExchangeRates(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(mockRates)
      expect(result.current.data?.baseCurrency).toBe('EUR')
      expect(result.current.data?.rates.USD).toBe(1.08)
      expect(api.request).toHaveBeenCalledWith('/currencies/exchange-rates')
    })

    it('handles API error gracefully', async () => {
      vi.mocked(api.request).mockRejectedValue(new Error('Rate limit exceeded'))

      const { result } = renderHook(() => useExchangeRates(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.data).toBeUndefined()
    })
  })
})
