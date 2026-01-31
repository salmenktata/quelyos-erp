import {
  LayoutDashboard,
  ShoppingCart,
  Monitor,
  Zap,
  Tablet,
  Smartphone,
  ChefHat,
  MonitorPlay,
  DoorOpen,
  BarChart3,
  ClipboardList,
  Receipt,
  Package,
  Boxes,
  ArrowRightLeft,
  Truck,
  Warehouse,
  MapPin,
  RefreshCw,
  Layers,
  Shuffle,
  Settings,
  Tag,
  Sliders,
  BookOpen,
  Gift,
  CreditCard,
  Store,
} from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

export type ModuleId = 'pos' | 'store' | 'stock'

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
// POS MODULE
// ============================================================================

export const POS_MODULE: Module = {
  id: 'pos',
  name: 'Point de Vente',
  shortName: 'Caisse',
  icon: Monitor,
  color: 'text-red-600',
  bgColor: 'bg-red-100 dark:bg-red-900/30',
  description: 'Caisse & Terminaux',
  basePath: '/pos',
  sections: [
    {
      title: 'Caisse',
      items: [
        { name: 'Terminal', path: '/pos/terminal', icon: Monitor },
        { name: 'Mode Rush', path: '/pos/rush', icon: Zap },
        { name: 'Kiosque', path: '/pos/kiosk', icon: Tablet },
        { name: 'Mobile', path: '/pos/mobile', icon: Smartphone },
        { name: 'KDS Cuisine', path: '/pos/kds', icon: ChefHat },
        { name: 'Affichage Client', path: '/pos/customer-display', icon: MonitorPlay },
        { name: 'Ouvrir Session', path: '/pos/session/open', icon: DoorOpen },
      ],
    },
    {
      title: 'Gestion',
      items: [
        { name: 'Tableau de bord', path: '/pos', icon: LayoutDashboard },
        { name: 'Commandes', path: '/pos/orders', icon: ShoppingCart },
        { name: 'Sessions', path: '/pos/sessions', icon: ClipboardList },
        { name: 'Click & Collect', path: '/pos/click-collect', icon: Package },
      ],
    },
    {
      title: 'Rapports',
      items: [
        { name: 'Ventes', path: '/pos/reports/sales', icon: BarChart3 },
        { name: 'Paiements', path: '/pos/reports/payments', icon: CreditCard },
        { name: 'Analytics', path: '/pos/analytics', icon: BarChart3 },
      ],
    },
    {
      title: 'Configuration',
      items: [
        { name: 'Paramètres', path: '/pos/settings', icon: Settings },
        { name: 'Terminaux', path: '/pos/settings/terminals', icon: Monitor },
        { name: 'Paiements', path: '/pos/settings/payments', icon: CreditCard },
        { name: 'Tickets', path: '/pos/settings/receipts', icon: Receipt },
      ],
    },
  ],
}

// ============================================================================
// STORE MODULE (subset for retail)
// ============================================================================

export const STORE_MODULE: Module = {
  id: 'store',
  name: 'Boutique',
  shortName: 'Store',
  icon: Store,
  color: 'text-red-600',
  bgColor: 'bg-red-100 dark:bg-red-900/30',
  description: 'Catalogue & Commandes',
  basePath: '/store',
  sections: [
    {
      title: 'Tableau de bord',
      items: [
        { name: 'Vue d\'ensemble', path: '/store', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Ventes',
      items: [
        { name: 'Commandes', path: '/store/orders', icon: ShoppingCart },
      ],
    },
    {
      title: 'Catalogue',
      items: [
        { name: 'Produits', path: '/store/products', icon: Package },
        { name: 'Catégories', path: '/store/categories', icon: Tag },
        { name: 'Attributs', path: '/store/attributes', icon: Sliders },
        { name: 'Collections', path: '/store/collections', icon: BookOpen },
        { name: 'Bundles / Packs', path: '/store/bundles', icon: Gift },
        { name: 'Codes Promo', path: '/store/coupons', icon: Receipt },
      ],
    },
  ],
}

// ============================================================================
// STOCK MODULE
// ============================================================================

export const STOCK_MODULE: Module = {
  id: 'stock',
  name: 'Stock',
  shortName: 'Stock',
  icon: Boxes,
  color: 'text-red-600',
  bgColor: 'bg-red-100 dark:bg-red-900/30',
  description: 'Inventaire & Logistique',
  basePath: '/stock',
  sections: [
    {
      title: 'Inventaire',
      items: [
        { name: 'Stock', path: '/stock', icon: Boxes },
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

export const MODULES: Module[] = [POS_MODULE, STORE_MODULE, STOCK_MODULE]
