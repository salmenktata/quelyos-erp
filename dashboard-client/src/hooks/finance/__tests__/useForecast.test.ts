import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useForecast } from '../useForecast'

// Mock the finance API
vi.mock('@/lib/finance/api', () => ({
  api: vi.fn(),
  AuthenticationError: class extends Error {
    constructor(msg = 'Auth required') {
      super(msg)
      this.name = 'AuthenticationError'
    }
  },
}))

import { api } from '@/lib/finance/api'

// Mock for enhanced API (90+ days) — returns currentBalance, projectedBalance, forecast[]
const mockEnhancedResponse = {
  currentBalance: 10000,
  projectedBalance: 12000,
  futureImpact: 2000,
  forecast: [
    {
      date: '2025-01-01',
      credit: 500,
      debit: 200,
      plannedCredit: 100,
      plannedDebit: 50,
      balance: 10350,
    },
    {
      date: '2025-01-02',
      credit: 300,
      debit: 150,
      plannedCredit: 80,
      plannedDebit: 30,
      balance: 10550,
    },
  ],
  perAccount: [],
  events: [],
}

// Mock for standard API (< 90 days)
const mockStandardResponse = {
  days: 30,
  baseBalance: 10000,
  projectedBalance: 11000,
  futureImpact: 1000,
  daily: [
    {
      date: '2025-01-01',
      credit: 500,
      debit: 200,
      plannedCredit: 100,
      plannedDebit: 50,
      balance: 10350,
    },
    {
      date: '2025-01-02',
      credit: 300,
      debit: 150,
      plannedCredit: 80,
      plannedDebit: 30,
      balance: 10550,
    },
  ],
  perAccount: [],
  events: [],
}

describe('useForecast', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('fetches forecast on mount with default horizon (90)', async () => {
    vi.mocked(api).mockResolvedValue(mockEnhancedResponse)

    const { result } = renderHook(() => useForecast())

    expect(result.current.loading).toBe(true)
    expect(result.current.selectedDays).toBe(90)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.forecast).toBeTruthy()
    expect(result.current.error).toBeNull()
    // For 90 days, the enhanced API is used
    expect(api).toHaveBeenCalledWith(
      expect.stringContaining('/reporting/forecast-enhanced')
    )
  })

  it('uses standard API for short horizons (< 90)', async () => {
    vi.mocked(api).mockResolvedValue(mockStandardResponse)

    const { result } = renderHook(() =>
      useForecast({ initialHorizon: 30 })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(api).toHaveBeenCalledWith('/dashboard/forecast?days=30')
  })

  it('handles API errors', async () => {
    vi.mocked(api).mockRejectedValue(new Error('API down'))

    const { result } = renderHook(() => useForecast())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('API down')
    expect(result.current.forecast).toBeNull()
  })

  it('handles non-Error rejections', async () => {
    vi.mocked(api).mockRejectedValue('unknown error')

    const { result } = renderHook(() => useForecast())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Impossible de charger la projection.')
  })

  it('computes confidence zones from forecast data', async () => {
    vi.mocked(api).mockResolvedValue(mockStandardResponse)

    const { result } = renderHook(() => useForecast({ initialHorizon: 30 }))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.confidenceZones.length).toBeGreaterThan(0)
    // Each zone should have required properties
    const zone = result.current.confidenceZones[0]
    expect(zone).toHaveProperty('date')
    expect(zone).toHaveProperty('predicted')
    expect(zone).toHaveProperty('upperBound')
    expect(zone).toHaveProperty('lowerBound')
    expect(zone).toHaveProperty('optimistic')
    expect(zone).toHaveProperty('pessimistic')
  })

  it('computes risk indicator', async () => {
    vi.mocked(api).mockResolvedValue(mockStandardResponse)

    const { result } = renderHook(() => useForecast({ initialHorizon: 30 }))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.riskIndicator).toBeTruthy()
    expect(result.current.riskIndicator).toHaveProperty('level')
    expect(result.current.riskIndicator).toHaveProperty('score')
    expect(result.current.riskIndicator).toHaveProperty('alerts')
    expect(['low', 'medium', 'high', 'critical']).toContain(
      result.current.riskIndicator!.level
    )
  })

  it('handles what-if simulation', async () => {
    vi.mocked(api).mockResolvedValue(mockEnhancedResponse)

    const { result } = renderHook(() => useForecast())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const scenarios = [
      { id: 'hire', type: 'expense' as const, label: 'New hire', description: 'New hire cost', icon: null, enabled: true, value: 3000, unit: '€' as const, min: 0, max: 10000, step: 100, defaultValue: 3000 },
    ]

    act(() => {
      result.current.handleSimulate(scenarios)
    })

    expect(result.current.whatIfScenarios).toEqual(scenarios)
    // Should persist to localStorage
    expect(localStorage.getItem('whatIfScenarios')).toBeTruthy()
  })

  it('resets simulation and clears localStorage', async () => {
    vi.mocked(api).mockResolvedValue(mockEnhancedResponse)

    const { result } = renderHook(() => useForecast())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.handleSimulate([
        { id: 'client', type: 'revenue' as const, label: 'New client', description: 'New client revenue', icon: null, enabled: true, value: 5000, unit: '€' as const, min: 0, max: 20000, step: 500, defaultValue: 5000 },
      ])
    })

    act(() => {
      result.current.handleResetSimulation()
    })

    expect(result.current.whatIfScenarios).toEqual([])
    expect(localStorage.getItem('whatIfScenarios')).toBeNull()
  })

  it('changes horizon and refetches', async () => {
    vi.mocked(api).mockResolvedValue(mockStandardResponse)

    const { result } = renderHook(() =>
      useForecast({ initialHorizon: 30 })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(api).toHaveBeenCalledWith('/dashboard/forecast?days=30')

    act(() => {
      result.current.setSelectedDays(90)
    })

    await waitFor(() => {
      expect(result.current.selectedDays).toBe(90)
    })

    // Should fetch with the new horizon (90+ uses enhanced API)
    expect(api).toHaveBeenCalledWith(expect.stringContaining('forecast'))
  })

  it('refetch re-fetches with current horizon', async () => {
    vi.mocked(api).mockResolvedValue(mockStandardResponse)

    const { result } = renderHook(() =>
      useForecast({ initialHorizon: 30 })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const callCountBefore = vi.mocked(api).mock.calls.length

    await act(async () => {
      await result.current.refetch()
    })

    expect(vi.mocked(api).mock.calls.length).toBeGreaterThan(callCountBefore)
  })

  it('returns empty confidence zones when no forecast', () => {
    vi.mocked(api).mockResolvedValue(mockEnhancedResponse)

    const { result } = renderHook(() => useForecast())

    // Before fetch completes
    expect(result.current.confidenceZones).toEqual([])
    expect(result.current.riskIndicator).toBeNull()
  })
})
