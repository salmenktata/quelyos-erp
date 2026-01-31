/**
 * Hook pour récupérer le tenant courant
 * Stub pour copilote-ops (single-tenant par défaut)
 */
import { useState } from 'react'

export interface Tenant {
  id: number
  name: string
  slug: string
  domain?: string
}

export function useMyTenant() {
  const [tenant] = useState<Tenant>({
    id: 1,
    name: 'Default',
    slug: 'default',
  })

  return {
    tenant,
    isLoading: false,
    error: null,
  }
}
