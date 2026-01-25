/**
 * Hook pour la gestion des tenants (boutiques/marques) dans le backoffice.
 *
 * Fournit:
 * - useTenants(): Liste tous les tenants
 * - useTenant(id): Récupère un tenant par ID
 * - useCreateTenant(): Crée un nouveau tenant
 * - useUpdateTenant(): Met à jour un tenant
 * - useDeleteTenant(): Archive un tenant
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { logger } from '@quelyos/logger'

// URL de l'API
const API_URL = import.meta.env.VITE_API_URL || ''

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface TenantColors {
  primary: string
  primaryDark: string
  primaryLight: string
  secondary: string
  secondaryDark: string
  secondaryLight: string
  accent: string
  background: string
  foreground: string
  muted: string
  mutedForeground: string
  border: string
  ring: string
}

export interface TenantTheme {
  colors: TenantColors
  typography: {
    fontFamily: 'inter' | 'roboto' | 'poppins' | 'montserrat' | 'open-sans' | 'lato'
  }
  darkMode: {
    enabled: boolean
    defaultDark: boolean
  }
}

export interface TenantConfig {
  id: number
  code: string
  name: string
  domain: string
  domains: string[]

  branding: {
    logoUrl: string
    faviconUrl: string
    slogan: string
    description: string
  }

  theme: TenantTheme

  contact: {
    email: string
    phone: string
    phoneFormatted: string
    whatsapp: string
  }

  social: {
    facebook?: string
    instagram?: string
    twitter?: string
    youtube?: string
    linkedin?: string
    tiktok?: string
  }

  seo: {
    title: string
    description: string
  }

  features: {
    wishlist: boolean
    comparison: boolean
    reviews: boolean
    newsletter: boolean
    guestCheckout: boolean
  }
}

export interface TenantFormData {
  name: string
  code: string
  domain: string
  domains?: string[]
  slogan?: string
  description?: string

  // Couleurs
  primary_color?: string
  primary_dark?: string
  primary_light?: string
  secondary_color?: string
  secondary_dark?: string
  secondary_light?: string
  accent_color?: string
  background_color?: string
  foreground_color?: string
  muted_color?: string
  muted_foreground?: string
  border_color?: string
  ring_color?: string

  // Typographie
  font_family?: string

  // Contact
  email?: string
  phone?: string
  whatsapp?: string

  // Social
  social?: Record<string, string>

  // SEO
  meta_title?: string
  meta_description?: string

  // Options
  enable_dark_mode?: boolean
  default_dark?: boolean
  feature_wishlist?: boolean
  feature_comparison?: boolean
  feature_reviews?: boolean
  feature_newsletter?: boolean
  feature_guest_checkout?: boolean

  // Assets (base64)
  logo?: string
  logo_filename?: string
  favicon?: string
  favicon_filename?: string

  // Status
  active?: boolean
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function getAuthHeaders(): HeadersInit {
  const sessionId = localStorage.getItem('session_id')
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (sessionId && sessionId !== 'null' && sessionId !== 'undefined') {
    headers['X-Session-Id'] = sessionId
  }

  return headers
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Liste tous les tenants
 */
export function useTenants(options?: { active?: boolean; search?: string }) {
  return useQuery<TenantConfig[]>({
    queryKey: ['tenants', options],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (options?.active !== undefined) {
        params.set('active', String(options.active))
      }
      if (options?.search) {
        params.set('search', options.search)
      }

      const url = `${API_URL}/api/ecommerce/tenant/list${params.toString() ? `?${params}` : ''}`

      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'omit',
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expirée. Veuillez vous reconnecter.')
        }
        if (response.status === 403) {
          throw new Error('Accès refusé. Droits administrateur requis.')
        }
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la récupération des tenants')
      }

      return data.tenants as TenantConfig[]
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  })
}

/**
 * Récupère un tenant par son ID
 */
export function useTenant(id: number | null) {
  return useQuery<TenantConfig>({
    queryKey: ['tenant', id],
    queryFn: async () => {
      if (!id) throw new Error('ID requis')

      const response = await fetch(`${API_URL}/api/ecommerce/tenant/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'omit',
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Tenant non trouvé')
        }
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la récupération du tenant')
      }

      return data.tenant as TenantConfig
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Crée un nouveau tenant
 */
export function useCreateTenant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: TenantFormData) => {
      const response = await fetch(`${API_URL}/api/ecommerce/tenant/create`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'omit',
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('Code ou domaine déjà utilisé')
        }
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la création')
      }

      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      logger.info('Tenant créé avec succès')
    },
    onError: (error) => {
      logger.error('Erreur création tenant:', error)
    },
  })
}

/**
 * Met à jour un tenant existant
 */
export function useUpdateTenant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<TenantFormData> }) => {
      const response = await fetch(`${API_URL}/api/ecommerce/tenant/${id}/update`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'omit',
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la mise à jour')
      }

      return result
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      queryClient.invalidateQueries({ queryKey: ['tenant', variables.id] })
      logger.info('Tenant mis à jour avec succès')
    },
    onError: (error) => {
      logger.error('Erreur mise à jour tenant:', error)
    },
  })
}

/**
 * Archive un tenant (soft delete)
 */
export function useDeleteTenant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`${API_URL}/api/ecommerce/tenant/${id}/delete`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'omit',
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la suppression')
      }

      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      logger.info('Tenant archivé avec succès')
    },
    onError: (error) => {
      logger.error('Erreur suppression tenant:', error)
    },
  })
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════

export const FONT_OPTIONS = [
  { value: 'inter', label: 'Inter' },
  { value: 'roboto', label: 'Roboto' },
  { value: 'poppins', label: 'Poppins' },
  { value: 'montserrat', label: 'Montserrat' },
  { value: 'open-sans', label: 'Open Sans' },
  { value: 'lato', label: 'Lato' },
] as const

export const DEFAULT_COLORS: TenantColors = {
  primary: '#01613a',
  primaryDark: '#004d2e',
  primaryLight: '#028a52',
  secondary: '#c9c18f',
  secondaryDark: '#b4ac7a',
  secondaryLight: '#ddd5a4',
  accent: '#f59e0b',
  background: '#ffffff',
  foreground: '#171717',
  muted: '#f5f5f5',
  mutedForeground: '#737373',
  border: '#e5e5e5',
  ring: '#01613a',
}
