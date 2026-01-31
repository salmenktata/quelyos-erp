export interface TenantConfig {
  id: number
  name: string
  domain: string
  logo_url?: string
  primary_color?: string
  secondary_color?: string
  contact_email?: string
  contact_phone?: string
  active: boolean
}

export interface TenantFormData {
  name: string
  domain: string
  logo_url?: string
  primary_color?: string
  secondary_color?: string
  contact_email?: string
  contact_phone?: string
}
