import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  FileText,
  CalendarOff,
  Calendar,
  Gift,
  Tag,
  Clock,
  Star,
  Award,
  Settings,
} from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

export type ModuleId = 'hr'

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
// HR MODULE
// ============================================================================

export const HR_MODULE: Module = {
  id: 'hr',
  name: 'Ressources Humaines',
  shortName: 'RH',
  icon: Users,
  color: 'text-cyan-600',
  bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
  description: 'Gestion du personnel',
  basePath: '/',
  sections: [
    {
      title: 'Tableau de bord',
      items: [
        { name: 'Vue d\'ensemble', path: '/', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Personnel',
      items: [
        { name: 'Employés', path: '/hr/employees', icon: Users },
        { name: 'Départements', path: '/hr/departments', icon: Building2 },
        { name: 'Postes', path: '/hr/jobs', icon: Briefcase },
        { name: 'Contrats', path: '/hr/contracts', icon: FileText },
      ],
    },
    {
      title: 'Congés',
      items: [
        { name: 'Demandes', path: '/hr/leaves', icon: CalendarOff },
        { name: 'Calendrier', path: '/hr/leaves/calendar', icon: Calendar },
        { name: 'Allocations', path: '/hr/leaves/allocations', icon: Gift },
        { name: 'Types', path: '/hr/leaves/types', icon: Tag },
      ],
    },
    {
      title: 'Présences',
      items: [
        { name: 'Pointage', path: '/hr/attendance', icon: Clock },
      ],
    },
    {
      title: 'Évaluations',
      items: [
        { name: 'Entretiens', path: '/hr/appraisals', icon: Star },
        { name: 'Compétences', path: '/hr/skills', icon: Award },
      ],
    },
    {
      title: 'Configuration',
      items: [
        { name: 'Paramètres', path: '/hr/settings', icon: Settings },
      ],
    },
  ],
}

export const ALL_MODULES: Module[] = [HR_MODULE]
export const MODULES = ALL_MODULES

export function getModuleById(id: ModuleId): Module | undefined {
  return ALL_MODULES.find((m) => m.id === id)
}
