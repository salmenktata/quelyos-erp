import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { SubscriptionCreateData } from '@/types'

export function useSubscriptions(params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['subscriptions', params],
    queryFn: () => api.getSubscriptions(params),
  })
}

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => api.getSubscriptionPlans(),
  })
}

export function useCurrentSubscription() {
  return useQuery({
    queryKey: ['current-subscription'],
    queryFn: () => api.getCurrentSubscription(),
  })
}

export function useCreateSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SubscriptionCreateData) => api.createSubscription(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['current-subscription'] })
    },
  })
}

export function useUpgradeSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (planId: number) => api.upgradeSubscription(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['current-subscription'] })
    },
  })
}

export function useCancelSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => api.cancelSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['current-subscription'] })
    },
  })
}

export function useCheckQuota() {
  return useMutation({
    mutationFn: (resourceType: 'users' | 'products' | 'orders') => api.checkQuota(resourceType),
  })
}
