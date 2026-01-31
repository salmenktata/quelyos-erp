import {
  LayoutDashboard, Boxes, ClipboardList, ArrowRightLeft, Truck,
  Warehouse, MapPin, RefreshCw, Layers, Shuffle, Settings,
  UsersRound, Briefcase, FileText, Calendar, PieChart, Tag,
  Award, ClipboardCheck,
} from 'lucide-react'

export type ModuleId = 'stock' | 'hr'

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

export const STOCK_MODULE: Module = {
  id: 'stock',
  name: 'Stock',
  shortName: 'Stock',
  icon: Boxes,
  color: 'text-orange-600',
  bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  description: 'Inventaire & Logistique',
  basePath: '/stock',
  sections: [
    {
      title: 'Inventaire',
      items: [
        { name: 'Stock', path: '/stock', icon: Boxes },
        { name: 'Inventaire Physique', path: '/stock/inventory', icon: ClipboardList },
        { name: 'Mouvements', path: '/stock/moves', icon: ArrowRightLeft },
        { name: 'Transferts', path: '/stock/transfers', icon: Truck },
        { name: 'Entrepôts', path: '/stock/warehouses', icon: Warehouse },
        { name: 'Emplacements', path: '/stock/locations', icon: MapPin },
        { name: 'Règles Réapprovisionnement', path: '/stock/reordering-rules', icon: RefreshCw },
      ],
    },
    {
      title: 'Analyse',
      items: [
        { name: 'Valorisation', path: '/stock/valuation', icon: Layers },
        { name: 'Rotation', path: '/stock/turnover', icon: Shuffle },
      ],
    },
    {
      title: 'Configuration',
      items: [
        { name: 'Paramètres', path: '/stock/settings', icon: Settings },
      ],
    },
  ],
}

export const HR_MODULE: Module = {
  id: 'hr',
  name: 'RH',
  shortName: 'RH',
  icon: UsersRound,
  color: 'text-orange-600',
  bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  description: 'Ressources Humaines',
  basePath: '/hr',
  sections: [
    {
      title: 'Tableau de bord',
      items: [
        { name: 'Vue d\'ensemble', path: '/hr', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Personnel',
      items: [
        { name: 'Employés', path: '/hr/employees', icon: UsersRound },
        { name: 'Départements', path: '/hr/departments', icon: Boxes },
        { name: 'Postes', path: '/hr/jobs', icon: Briefcase },
        { name: 'Contrats', path: '/hr/contracts', icon: FileText },
      ],
    },
    {
      title: 'Congés & Absences',
      items: [
        { name: 'Demandes', path: '/hr/leaves', icon: Calendar },
        { name: 'Calendrier', path: '/hr/leaves/calendar', icon: Calendar },
        { name: 'Allocations', path: '/hr/leaves/allocations', icon: PieChart },
        { name: 'Types de congés', path: '/hr/leaves/types', icon: Tag },
      ],
    },
    {
      title: 'Présences',
      items: [
        { name: 'Pointage', path: '/hr/attendance', icon: ClipboardCheck },
      ],
    },
    {
      title: 'Évaluations',
      items: [
        { name: 'Entretiens', path: '/hr/appraisals', icon: ClipboardList },
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

export const MODULES: Module[] = [STOCK_MODULE, HR_MODULE]
