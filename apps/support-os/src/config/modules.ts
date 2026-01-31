import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  HelpCircle,
  Users,
  Settings,
  BarChart3,
  MessageSquare,
  Clock,
  Tag,
} from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

export type ModuleId = 'support' | 'crm'

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
// SUPPORT MODULE
// ============================================================================

export const SUPPORT_MODULE: Module = {
  id: 'support',
  name: 'Support',
  shortName: 'Support',
  icon: MessageSquare,
  color: 'text-purple-600',
  bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  description: 'Helpdesk & Support client',
  basePath: '/',
  sections: [
    {
      title: 'Tableau de bord',
      items: [
        { name: 'Vue d\'ensemble', path: '/', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Assistance',
      items: [
        { name: 'Mes Tickets', path: '/support/tickets', icon: Ticket },
        { name: 'Créer un Ticket', path: '/support/tickets/new', icon: PlusCircle },
        { name: 'FAQ', path: '/support/faq', icon: HelpCircle },
      ],
    },
    {
      title: 'Clients',
      items: [
        { name: 'Liste clients', path: '/support/customers', icon: Users },
      ],
    },
    {
      title: 'Suivi',
      items: [
        { name: 'Statistiques', path: '/support/stats', icon: BarChart3 },
        { name: 'Historique', path: '/support/history', icon: Clock },
        { name: 'Tags', path: '/support/tags', icon: Tag },
      ],
    },
    {
      title: 'Configuration',
      items: [
        { name: 'Paramètres', path: '/support/settings', icon: Settings },
      ],
    },
  ],
}

export const MODULES: Module[] = [SUPPORT_MODULE]
