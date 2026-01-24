import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

export function useDeliveryMethods() {
  return useQuery({
    queryKey: ['delivery-methods'],
    queryFn: () => api.getDeliveryMethods(),
  })
}
