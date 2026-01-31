import {
  LayoutDashboard,
  Users,
  UserPlus,
  Target,
  Kanban,
  FileText,
  CreditCard,
  Tag,
  Settings,
  Megaphone,
  MessageSquare,
} from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

export type ModuleId = 'crm' | 'marketing'

export interface SubMenuItem {
  name: string
  path?: string
  badge?: string
  separator?: boolean
  icon?: React.ComponentType<{ className?: string }>
}

export interface MenuItem {
  name: string
  path?: string
  icon: React.ComponentType<{ className?: string }>
  subItems?: SubMenuItem[]
}

export interface MenuSection {
  title: string
  items: MenuItem[]
}

export interface Module {
  id: ModuleId
  name: string
  shortName: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  description: string
  basePath: string
  sections: MenuSection[]
}

// ============================================================================
// CRM MODULE
// ============================================================================

export const CRM_MODULE: Module = {
  id: 'crm',
  name: 'CRM',
  shortName: 'CRM',
  icon: Target,
  color: 'text-blue-600',
  bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  description: 'Gestion commerciale & Pipeline',
  basePath: '/crm',
  sections: [
    {
      title: 'Tableau de bord',
      items: [
        { name: 'Vue d\'ensemble', path: '/crm', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Pipeline',
      items: [
        { name: 'Pipeline', path: '/crm/pipeline', icon: Kanban },
        { name: 'Leads', path: '/crm/leads', icon: UserPlus },
      ],
    },
    {
      title: 'Clients',
      items: [
        { name: 'Clients', path: '/crm/customers', icon: Users },
        { name: 'Cat\u00E9gories clients', path: '/crm/customer-categories', icon: Tag },
      ],
    },
    {
      title: 'Facturation',
      items: [
        { name: 'Factures', path: '/crm/invoices', icon: FileText },
        { name: 'Paiements', path: '/crm/payments', icon: CreditCard },
      ],
    },
    {
      title: 'Configuration',
      items: [
        { name: 'Param\u00E8tres', path: '/crm/settings', icon: Settings },
      ],
    },
  ],
}

// ============================================================================
// MARKETING MODULE
// ============================================================================

export const MARKETING_MODULE: Module = {
  id: 'marketing',
  name: 'Marketing',
  shortName: 'Marketing',
  icon: Megaphone,
  color: 'text-pink-600',
  bgColor: 'bg-pink-100 dark:bg-pink-900/30',
  description: 'Campagnes Email & SMS',
  basePath: '/marketing',
  sections: [
    {
      title: 'Tableau de bord',
      items: [
        { name: 'Vue d\'ensemble', path: '/marketing', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Campagnes',
      items: [
        { name: 'Toutes les campagnes', path: '/marketing/campaigns', icon: Megaphone },
        { name: 'Emails', path: '/marketing/email', icon: FileText },
        { name: 'SMS', path: '/marketing/sms', icon: MessageSquare },
        { name: 'Templates', path: '/marketing/email/templates', icon: FileText },
      ],
    },
    {
      title: 'Audiences',
      items: [
        { name: 'Listes de contacts', path: '/marketing/contacts', icon: Users },
      ],
    },
    {
      title: 'Configuration',
      items: [
        { name: 'Param\u00E8tres', path: '/marketing/settings', icon: Settings },
      ],
    },
  ],
}

export const MODULES: Module[] = [CRM_MODULE, MARKETING_MODULE]
