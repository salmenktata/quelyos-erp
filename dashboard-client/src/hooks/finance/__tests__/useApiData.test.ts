import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useApiData, clearApiCache, clearCacheKey } from '../useApiData'

describe('useApiData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearApiCache()
  })

  it('fetches data on mount by default', async () => {
    const mockData = { id: 1, name: 'Test' }
    const fetcher = vi.fn().mockResolvedValue(mockData)

    const { result } = renderHook(() => useApiData({ fetcher }))

    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBeNull()

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockData)
    expect(result.current.error).toBeNull()
    expect(fetcher).toHaveBeenCalledOnce()
  })

  it('does not fetch on mount when fetchOnMount is false', async () => {
    const fetcher = vi.fn().mockResolvedValue({ id: 1 })

    const { result } = renderHook(() =>
      useApiData({ fetcher, fetchOnMount: false })
    )

    expect(result.current.loading).toBe(false)
    expect(result.current.data).toBeNull()
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('handles fetch errors', async () => {
    const error = new Error('Network error')
    const fetcher = vi.fn().mockRejectedValue(error)
    const onError = vi.fn()

    const { result } = renderHook(() =>
      useApiData({ fetcher, onError })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toEqual(error)
    expect(result.current.data).toBeNull()
    expect(onError).toHaveBeenCalledWith(error)
  })

  it('handles non-Error rejections', async () => {
    const fetcher = vi.fn().mockRejectedValue('string error')

    const { result } = renderHook(() => useApiData({ fetcher }))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toBe('string error')
  })

  it('calls onSuccess callback on successful fetch', async () => {
    const mockData = { id: 1, name: 'Test' }
    const fetcher = vi.fn().mockResolvedValue(mockData)
    const onSuccess = vi.fn()

    renderHook(() => useApiData({ fetcher, onSuccess }))

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockData)
    })
  })

  it('uses cache when cacheKey is provided', async () => {
    const mockData = { id: 1, name: 'Cached' }
    const fetcher = vi.fn().mockResolvedValue(mockData)

    // First render — fetches
    const { result: result1 } = renderHook(() =>
      useApiData({ fetcher, cacheKey: 'test-cache' })
    )

    await waitFor(() => {
      expect(result1.current.loading).toBe(false)
    })

    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(result1.current.data).toEqual(mockData)

    // Second render with same cache key — uses cache
    const { result: result2 } = renderHook(() =>
      useApiData({ fetcher, cacheKey: 'test-cache' })
    )

    await waitFor(() => {
      expect(result2.current.loading).toBe(false)
    })

    // Fetcher should not have been called again (cache hit)
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(result2.current.data).toEqual(mockData)
  })

  it('refetch calls fetchData again', async () => {
    const mockData = { id: 1, name: 'First' }
    const fetcher = vi.fn().mockResolvedValue(mockData)

    const { result } = renderHook(() =>
      useApiData({ fetcher })
    )

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData)
    })

    expect(fetcher).toHaveBeenCalledTimes(1)

    // Refetch (no cache key, so no cache interference)
    await act(async () => {
      await result.current.refetch()
    })

    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('mutate updates data and cache', async () => {
    const mockData = { id: 1, name: 'Original' }
    const fetcher = vi.fn().mockResolvedValue(mockData)

    const { result } = renderHook(() =>
      useApiData({ fetcher, cacheKey: 'mutate-test' })
    )

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData)
    })

    const newData = { id: 1, name: 'Mutated' }
    act(() => {
      result.current.mutate(newData)
    })

    expect(result.current.data).toEqual(newData)
  })

  it('reset clears data, error, and cache', async () => {
    const mockData = { id: 1, name: 'To Reset' }
    const fetcher = vi.fn().mockResolvedValue(mockData)

    const { result } = renderHook(() =>
      useApiData({ fetcher, cacheKey: 'reset-test' })
    )

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData)
    })

    act(() => {
      result.current.reset()
    })

    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  it('clearApiCache clears all entries', async () => {
    const fetcher = vi.fn().mockResolvedValue({ id: 1 })

    const { result } = renderHook(() =>
      useApiData({ fetcher, cacheKey: 'clear-all' })
    )

    await waitFor(() => {
      expect(result.current.data).toEqual({ id: 1 })
    })

    clearApiCache()

    // New render should fetch again (no cache)
    const fetcher2 = vi.fn().mockResolvedValue({ id: 2 })
    const { result: result2 } = renderHook(() =>
      useApiData({ fetcher: fetcher2, cacheKey: 'clear-all' })
    )

    await waitFor(() => {
      expect(result2.current.loading).toBe(false)
    })

    expect(fetcher2).toHaveBeenCalledOnce()
  })

  it('clearCacheKey clears a specific entry', async () => {
    const fetcher = vi.fn().mockResolvedValue({ id: 1 })

    const { result } = renderHook(() =>
      useApiData({ fetcher, cacheKey: 'specific-key' })
    )

    await waitFor(() => {
      expect(result.current.data).toEqual({ id: 1 })
    })

    clearCacheKey('specific-key')

    const fetcher2 = vi.fn().mockResolvedValue({ id: 2 })
    const { result: result2 } = renderHook(() =>
      useApiData({ fetcher: fetcher2, cacheKey: 'specific-key' })
    )

    await waitFor(() => {
      expect(result2.current.loading).toBe(false)
    })

    expect(fetcher2).toHaveBeenCalledOnce()
  })
})
