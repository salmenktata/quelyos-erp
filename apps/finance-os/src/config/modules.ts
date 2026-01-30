import {
  LayoutDashboard,
  BarChart3,
  Wallet,
  PieChart,
  TrendingUp,
  Coins,
  FolderOpen,
  Users,
  Bell,
  Calendar,
  Upload,
  Archive,
  Settings,
  Tag,
  Briefcase,
  ArrowDownCircle,
  ArrowUpCircle,
  GitBranch,
  Waves,
  CreditCard,
} from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

export type ModuleId = 'finance'

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
// FINANCE MODULE
// ============================================================================

export const FINANCE_MODULE: Module = {
  id: 'finance',
  name: 'Finance',
  shortName: 'Finance',
  icon: Wallet,
  color: 'text-emerald-600',
  bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
  description: 'Trésorerie & Budgets',
  basePath: '/',
  sections: [
    {
      title: 'Tableau de bord',
      items: [
        { name: 'Vue d\'ensemble', path: '/', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Comptes',
      items: [
        { name: 'Tous les comptes', path: '/accounts', icon: Wallet },
        { name: 'Portefeuilles', path: '/portfolios', icon: Briefcase },
      ],
    },
    {
      title: 'Transactions',
      items: [
        { name: 'Dépenses', path: '/expenses', icon: ArrowDownCircle },
        { name: 'Revenus', path: '/incomes', icon: ArrowUpCircle },
      ],
    },
    {
      title: 'Planification',
      items: [
        { name: 'Budgets', path: '/budgets', icon: PieChart },
        { name: 'Trésorerie', path: '/forecast', icon: TrendingUp },
        { name: 'Scénarios', path: '/scenarios', icon: GitBranch },
        { name: 'Échéancier', path: '/payment-planning', icon: Calendar },
      ],
    },
    {
      title: 'Rapports',
      items: [
        { name: 'Hub Rapports', path: '/reporting', icon: BarChart3 },
        {
          name: 'Trésorerie',
          path: '/reporting/cashflow',
          icon: Waves,
          subItems: [
            { name: 'Prévisions', path: '/reporting/forecasts', icon: TrendingUp },
            { name: 'DSO', path: '/reporting/dso', icon: Calendar },
            { name: 'BFR', path: '/reporting/bfr', icon: BarChart3 },
          ],
        },
        { name: 'Par catégorie', path: '/reporting/by-category', icon: FolderOpen },
        { name: 'Par compte', path: '/reporting/by-account', icon: CreditCard },
        { name: 'Par flux', path: '/reporting/by-flow', icon: Waves },
        { name: 'Par portefeuille', path: '/reporting/by-portfolio', icon: Briefcase },
        { name: 'Rentabilité', path: '/reporting/profitability', icon: TrendingUp },
        { name: 'EBITDA', path: '/reporting/ebitda', icon: BarChart3 },
        { name: 'Seuil de rentabilité', path: '/reporting/breakeven', icon: TrendingUp },
        { name: 'Qualité données', path: '/reporting/data-quality', icon: BarChart3 },
      ],
    },
    {
      title: 'Configuration',
      items: [
        { name: 'Catégories', path: '/categories', icon: Tag },
        { name: 'Fournisseurs', path: '/suppliers', icon: Users },
        { name: 'Plan Comptable', path: '/charts', icon: Coins },
        { name: 'Alertes', path: '/alerts', icon: Bell },
        { name: 'Import', path: '/import', icon: Upload },
        { name: 'Archives', path: '/archives', icon: Archive },
        { name: 'Paramètres', path: '/settings', icon: Settings },
      ],
    },
  ],
}

export const MODULES: Module[] = [FINANCE_MODULE]
