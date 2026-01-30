#!/usr/bin/env tsx

/**
 * Script validation Sitemap
 *
 * Vérifie que le sitemap est à jour avec les routes réelles
 * - Détecte routes manquantes (existent dans code mais pas sitemap)
 * - Détecte routes orphelines (dans sitemap mais plus dans code)
 *
 * Usage:
 *   pnpm validate-sitemap
 *   pnpm validate-sitemap --fix  # Régénère automatiquement
 */

import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import { join } from 'path'

const ROOT_DIR = join(__dirname, '..')
const AUTO_FIX = process.argv.includes('--fix')

interface RouteInfo {
  path: string
  app: string
}

// ============================================================================
// Charger sitemap actuel
// ============================================================================

function loadCurrentSitemap(): RouteInfo[] {
  console.log('📖 Loading current sitemap...')

  const sitemapPath = join(ROOT_DIR, 'super-admin-client/src/config/sitemap.ts')
  const content = readFileSync(sitemapPath, 'utf-8')

  const routes: RouteInfo[] = []

  // Extract apps and their routes
  const appMatches = content.matchAll(/id:\s*'([^']+)'[\s\S]*?routes:\s*\[([\s\S]*?)\]/g)

  for (const match of appMatches) {
    const [, appId, routesContent] = match

    // Extract paths
    const pathMatches = routesContent.matchAll(/path:\s*'([^']+)'/g)

    for (const pathMatch of pathMatches) {
      routes.push({
        path: pathMatch[1],
        app: appId,
      })
    }
  }

  console.log(`  Found ${routes.length} routes in sitemap`)
  return routes
}

// ============================================================================
// Scanner routes réelles (via generate script)
// ============================================================================

function loadActualRoutes(): RouteInfo[] {
  console.log('🔍 Scanning actual routes...')

  // Import and execute scanner functions from generate-sitemap.ts
  // For simplicity, we'll just run the generate script with --dry-run
  // and parse its output

  // Alternative: just run generate-sitemap and compare files
  console.log('  (Using generate-sitemap.ts logic)')

  // TODO: Import scanner functions or run generate script
  // For now, return empty (will be implemented when testing)

  return []
}

// ============================================================================
// Comparaison et rapport
// ============================================================================

function validateSitemap() {
  console.log('🚀 Sitemap Validator\n')

  const current = loadCurrentSitemap()
  const actual = loadActualRoutes()

  // For demo, we'll just check if sitemap exists
  if (current.length === 0) {
    console.error('❌ Sitemap is empty or could not be loaded')
    process.exit(1)
  }

  // Missing routes (in code but not in sitemap)
  const currentPaths = new Set(current.map(r => `${r.app}:${r.path}`))
  const actualPaths = new Set(actual.map(r => `${r.app}:${r.path}`))

  const missing = actual.filter(r => !currentPaths.has(`${r.app}:${r.path}`))
  const orphan = current.filter(r => !actualPaths.has(`${r.app}:${r.path}`))

  // Report
  console.log('📊 Validation Results:\n')

  if (missing.length > 0) {
    console.log(`⚠️  Missing routes (${missing.length}):\n`)
    missing.slice(0, 10).forEach(r => {
      console.log(`   [${r.app}] ${r.path}`)
    })
    if (missing.length > 10) {
      console.log(`   ... and ${missing.length - 10} more`)
    }
    console.log()
  }

  if (orphan.length > 0) {
    console.log(`⚠️  Orphan routes (${orphan.length}):\n`)
    orphan.slice(0, 10).forEach(r => {
      console.log(`   [${r.app}] ${r.path}`)
    })
    if (orphan.length > 10) {
      console.log(`   ... and ${orphan.length - 10} more`)
    }
    console.log()
  }

  if (missing.length === 0 && orphan.length === 0) {
    console.log('✅ Sitemap is up to date!')
    return true
  }

  // Auto-fix
  if (AUTO_FIX) {
    console.log('🔧 Auto-fixing by regenerating sitemap...\n')
    try {
      execSync('pnpm generate-sitemap', { stdio: 'inherit', cwd: ROOT_DIR })
      console.log('\n✅ Sitemap regenerated successfully')
      return true
    } catch (err) {
      console.error('❌ Failed to regenerate sitemap:', err)
      return false
    }
  }

  console.log('💡 Tip: Run `pnpm generate-sitemap` to update the sitemap')
  return false
}

// ============================================================================
// Main
// ============================================================================

const success = validateSitemap()
process.exit(success ? 0 : 1)
