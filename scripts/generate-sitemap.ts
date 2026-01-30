#!/usr/bin/env tsx

/**
 * Script génération automatique Sitemap
 *
 * Scanne les 4 applications et génère super-admin-client/src/config/sitemap.ts
 *
 * Usage:
 *   pnpm generate-sitemap
 *   pnpm generate-sitemap --dry-run  # Preview sans écrire
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, relative } from 'path'
import { globbySync } from 'globby'

const ROOT_DIR = join(__dirname, '..')
const DRY_RUN = process.argv.includes('--dry-run')

interface RouteInfo {
  path: string
  name: string
  description?: string
  module?: string
  type?: 'static' | 'dynamic'
}

interface AppConfig {
  id: string
  name: string
  baseUrl: string
  port: number
  icon: string
  color: string
  bgColor: string
  darkBgColor: string
}

// ============================================================================
// Configuration Apps
// ============================================================================

const APPS_CONFIG: AppConfig[] = [
  {
    id: 'vitrine-quelyos',
    name: 'Vitrine Quelyos',
    baseUrl: 'http://localhost:3000',
    port: 3000,
    icon: 'Globe',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50',
    darkBgColor: 'dark:bg-blue-900/20',
  },
  {
    id: 'dashboard-client',
    name: 'Dashboard Client',
    baseUrl: 'http://localhost:5175',
    port: 5175,
    icon: 'LayoutDashboard',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50',
    darkBgColor: 'dark:bg-emerald-900/20',
  },
  {
    id: 'super-admin-client',
    name: 'Super Admin Client',
    baseUrl: 'http://localhost:5176',
    port: 5176,
    icon: 'ShieldCheck',
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-50',
    darkBgColor: 'dark:bg-teal-900/20',
  },
  {
    id: 'vitrine-client',
    name: 'Boutique E-commerce',
    baseUrl: 'http://localhost:3001',
    port: 3001,
    icon: 'ShoppingBag',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50',
    darkBgColor: 'dark:bg-purple-900/20',
  },
]

// ============================================================================
// Scanner Vitrine Quelyos (Next.js 14)
// ============================================================================

function scanVitrineQuelyos(): RouteInfo[] {
  console.log('📡 Scanning Vitrine Quelyos...')
  const appDir = join(ROOT_DIR, 'vitrine-quelyos/app')

  if (!statSync(appDir, { throwIfNoEntry: false })) {
    console.warn('⚠️  vitrine-quelyos/app not found, skipping')
    return []
  }

  const pages = globbySync('**/page.tsx', { cwd: appDir, absolute: false })

  const routes = pages.map(page => {
    // Convert file path to route
    // app/page.tsx → /
    // app/about/page.tsx → /about
    // app/finance/features/[slug]/page.tsx → /finance/features/[slug]
    let route = page.replace(/\/page\.tsx$/, '').replace(/^/, '/')
    if (route === '/') route = '/'
    else route = route.replace(/\/$/, '')

    // Extract name from file (simple heuristic)
    const segments = route.split('/').filter(Boolean)
    const name = segments.length === 0
      ? 'Accueil'
      : segments[segments.length - 1]
          .replace(/\[.*?\]/g, '') // Remove [slug]
          .replace(/-/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase())

    const isDynamic = /\[/.test(route)

    return {
      path: route,
      name,
      type: isDynamic ? 'dynamic' as const : 'static' as const,
    }
  })

  console.log(`  ✅ Found ${routes.length} routes`)
  return routes.sort((a, b) => a.path.localeCompare(b.path))
}

// ============================================================================
// Scanner Dashboard Client (React Router + modules.ts)
// ============================================================================

function scanDashboardClient(): RouteInfo[] {
  console.log('📡 Scanning Dashboard Client...')
  const modulesPath = join(ROOT_DIR, 'dashboard-client/src/config/modules.ts')

  if (!statSync(modulesPath, { throwIfNoEntry: false })) {
    console.warn('⚠️  dashboard-client/src/config/modules.ts not found, skipping')
    return []
  }

  const routes: RouteInfo[] = []

  // Parse modules.ts (simple regex extraction, not AST)
  const content = readFileSync(modulesPath, 'utf-8')

  // Extract module definitions
  const moduleMatches = content.matchAll(/{\s*id:\s*'(\w+)',\s*name:\s*'([^']+)'/g)
  const modules = Array.from(moduleMatches).map(m => ({ id: m[1], name: m[2] }))

  // Extract paths from items
  const pathMatches = content.matchAll(/{\s*name:\s*'([^']+)',\s*path:\s*'([^']+)'/g)

  for (const match of pathMatches) {
    const [, name, path] = match

    // Try to infer module from path
    const moduleId = path.split('/')[1] // /finance/accounts → finance
    const module = modules.find(m => m.id === moduleId)

    routes.push({
      path,
      name,
      module: module?.name,
      type: /:|[\[]/.test(path) ? 'dynamic' : 'static',
    })
  }

  console.log(`  ✅ Found ${routes.length} routes`)
  return routes.sort((a, b) => a.path.localeCompare(b.path))
}

// ============================================================================
// Scanner Super Admin Client (Layout navigation)
// ============================================================================

function scanSuperAdminClient(): RouteInfo[] {
  console.log('📡 Scanning Super Admin Client...')
  const layoutPath = join(ROOT_DIR, 'super-admin-client/src/components/Layout.tsx')

  if (!statSync(layoutPath, { throwIfNoEntry: false })) {
    console.warn('⚠️  super-admin-client Layout.tsx not found, skipping')
    return []
  }

  const content = readFileSync(layoutPath, 'utf-8')

  // Extract navigation array
  const navMatch = content.match(/const navigation = \[([\s\S]*?)\]/m)
  if (!navMatch) {
    console.warn('⚠️  Could not parse navigation array')
    return []
  }

  const routes: RouteInfo[] = []
  const itemMatches = navMatch[1].matchAll(/{\s*name:\s*'([^']+)',\s*path:\s*'([^']+)'/g)

  for (const match of itemMatches) {
    const [, name, path] = match
    routes.push({
      path,
      name,
      type: /:|[\[]/.test(path) ? 'dynamic' : 'static',
    })
  }

  console.log(`  ✅ Found ${routes.length} routes`)
  return routes.sort((a, b) => a.path.localeCompare(b.path))
}

// ============================================================================
// Scanner Vitrine Client (Next.js 16 - E-commerce)
// ============================================================================

function scanVitrineClient(): RouteInfo[] {
  console.log('📡 Scanning Vitrine Client (E-commerce)...')
  const appDir = join(ROOT_DIR, 'vitrine-client/src/app')

  if (!statSync(appDir, { throwIfNoEntry: false })) {
    console.warn('⚠️  vitrine-client/src/app not found, skipping')
    return []
  }

  const pages = globbySync('**/page.tsx', { cwd: appDir, absolute: false })

  const routes = pages.map(page => {
    // Convert file path to route
    let route = page
      .replace(/\/page\.tsx$/, '')
      .replace(/^\(.*?\)\//, '') // Remove route groups (shop)
      .replace(/^/, '/')

    if (route === '/') route = '/'
    else route = route.replace(/\/$/, '')

    // Extract name
    const segments = route.split('/').filter(Boolean)
    const name = segments.length === 0
      ? 'Accueil'
      : segments[segments.length - 1]
          .replace(/\[.*?\]/g, '')
          .replace(/-/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase())

    const isDynamic = /\[/.test(route)

    return {
      path: route,
      name,
      type: isDynamic ? 'dynamic' as const : 'static' as const,
    }
  })

  console.log(`  ✅ Found ${routes.length} routes`)
  return routes.sort((a, b) => a.path.localeCompare(b.path))
}

// ============================================================================
// Génération fichier sitemap.ts
// ============================================================================

function generateSitemapFile(appsData: Record<string, RouteInfo[]>) {
  console.log('\n📝 Generating sitemap.ts...')

  const totalRoutes = Object.values(appsData).reduce((acc, routes) => acc + routes.length, 0)

  const content = `import { Globe, LayoutDashboard, ShieldCheck, ShoppingBag, type LucideIcon } from 'lucide-react'

/**
 * Configuration Sitemap Multi-Apps
 *
 * ⚠️  FICHIER GÉNÉRÉ AUTOMATIQUEMENT
 * Ne pas modifier manuellement - Utiliser \`pnpm generate-sitemap\`
 *
 * Total routes: ${totalRoutes}
 * Généré le: ${new Date().toISOString()}
 */

export interface AppRoute {
  path: string
  name: string
  description?: string
  module?: string
  type?: 'static' | 'dynamic'
}

export interface AppSection {
  id: string
  name: string
  baseUrl: string
  port: number
  icon: LucideIcon
  color: string
  bgColor: string
  darkBgColor: string
  routes: AppRoute[]
}

export const sitemapData: AppSection[] = [
${APPS_CONFIG.map(app => `  {
    id: '${app.id}',
    name: '${app.name}',
    baseUrl: '${app.baseUrl}',
    port: ${app.port},
    icon: ${app.icon},
    color: '${app.color}',
    bgColor: '${app.bgColor}',
    darkBgColor: '${app.darkBgColor}',
    routes: [
${appsData[app.id]?.map(route =>
  `      { path: '${route.path}', name: '${route.name}'${route.module ? `, module: '${route.module}'` : ''}${route.type ? `, type: '${route.type}'` : ''} },`
).join('\n') || ''}
    ],
  }`).join(',\n')}
]

// Statistiques globales
export const getSitemapStats = () => {
  const totalRoutes = sitemapData.reduce((acc, app) => acc + app.routes.length, 0)
  const appStats = sitemapData.map(app => ({
    id: app.id,
    name: app.name,
    count: app.routes.length,
  }))

  return {
    totalRoutes,
    totalApps: sitemapData.length,
    appStats,
  }
}

// Détecter type route (static vs dynamic)
export function getRouteType(path: string): 'static' | 'dynamic' {
  return /\\[|:/.test(path) ? 'dynamic' : 'static'
}

// Extraire modules uniques (Dashboard Client)
export function getDashboardModules(): string[] {
  const dashboardApp = sitemapData.find(app => app.id === 'dashboard-client')
  if (!dashboardApp) return []

  const modules = new Set<string>()
  dashboardApp.routes.forEach(route => {
    if (route.module) {
      modules.add(route.module)
    }
  })

  return Array.from(modules).sort()
}

// Enrichir routes avec type auto-détecté
export const enrichedSitemapData = sitemapData.map(app => ({
  ...app,
  routes: app.routes.map(route => ({
    ...route,
    type: route.type || getRouteType(route.path),
  })),
}))
`

  return content
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log('🚀 Sitemap Generator V2\n')

  // Scanner toutes les apps
  const appsData: Record<string, RouteInfo[]> = {
    'vitrine-quelyos': scanVitrineQuelyos(),
    'dashboard-client': scanDashboardClient(),
    'super-admin-client': scanSuperAdminClient(),
    'vitrine-client': scanVitrineClient(),
  }

  // Statistiques
  const totalRoutes = Object.values(appsData).reduce((acc, routes) => acc + routes.length, 0)
  console.log(`\n📊 Total: ${totalRoutes} routes`)
  Object.entries(appsData).forEach(([app, routes]) => {
    console.log(`   - ${app}: ${routes.length} routes`)
  })

  // Générer fichier
  const content = generateSitemapFile(appsData)
  const outputPath = join(ROOT_DIR, 'super-admin-client/src/config/sitemap.ts')

  if (DRY_RUN) {
    console.log('\n🔍 DRY RUN - Preview:\n')
    console.log(content.slice(0, 500) + '...\n')
    console.log(`Would write to: ${outputPath}`)
  } else {
    writeFileSync(outputPath, content, 'utf-8')
    console.log(`\n✅ Generated: ${relative(ROOT_DIR, outputPath)}`)
  }

  console.log('\n✨ Done!')
}

main().catch(err => {
  console.error('❌ Error:', err)
  process.exit(1)
})
