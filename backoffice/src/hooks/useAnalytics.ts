import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

export function useAnalyticsStats() {
  return useQuery({
    queryKey: ['analytics-stats'],
    queryFn: () => api.getAnalyticsStats(),
    refetchInterval: 60000, // Rafraîchir toutes les 60 secondes
  })
}
