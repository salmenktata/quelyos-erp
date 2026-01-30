#!/usr/bin/env node

/**
 * Script de correction automatique des violations dark/light mode
 * Applique les patterns obligatoires définis dans CLAUDE.md
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const srcDir = join(__dirname, '..', 'src')

// Stats
let filesProcessed = 0
let filesModified = 0
let totalFixes = 0

// Fonction récursive pour lister tous les fichiers TSX/JSX
function getAllTsxFiles(dir, fileList = []) {
  const files = readdirSync(dir)

  files.forEach(file => {
    const filePath = join(dir, file)

    if (statSync(filePath).isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('dist') && !file.includes('.next')) {
        getAllTsxFiles(filePath, fileList)
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      fileList.push(filePath)
    }
  })

  return fileList
}

/**
 * Corrige les patterns de classes Tailwind pour dark mode
 */
function fixDarkModePatterns(content, filePath) {
  let modified = false
  let fixes = 0

  // Pattern 1: bg-white sans dark:bg-
  // Cherche className="..." ou className=`...` ou className={'...'}
  const bgWhiteRegex = /(className=["'{`](?:[^"'`]*\s)?)(bg-white)(\s[^"'`]*["'`}]|["'`}])/g

  content = content.replace(bgWhiteRegex, (match, prefix, bgWhite, suffix) => {
    // Vérifier si dark:bg- est déjà présent dans cette className
    if (!match.includes('dark:bg-')) {
      modified = true
      fixes++
      // Ajouter dark:bg-gray-800 après bg-white
      return `${prefix}${bgWhite} dark:bg-gray-800${suffix}`
    }
    return match
  })

  // Pattern 2: text-gray-900 sans dark:text-white
  const textGray900Regex = /(className=["'{`](?:[^"'`]*\s)?)(text-gray-900)(\s[^"'`]*["'`}]|["'`}])/g

  content = content.replace(textGray900Regex, (match, prefix, textClass, suffix) => {
    if (!match.includes('dark:text-white')) {
      modified = true
      fixes++
      return `${prefix}${textClass} dark:text-white${suffix}`
    }
    return match
  })

  // Pattern 3: text-gray-700 dans les labels → text-gray-900 dark:text-white
  if (/<label/.test(content)) {
    const labelTextGray700Regex = /(className=["'{`](?:[^"'`]*\s)?)(text-gray-700)(\s[^"'`]*["'`}]|["'`}])/g

    content = content.replace(labelTextGray700Regex, (match, prefix, textClass, suffix) => {
      // Vérifier si c'est dans un contexte de label (approximation)
      if (!match.includes('dark:text-')) {
        modified = true
        fixes++
        return `${prefix}text-gray-900 dark:text-white${suffix}`
      }
      return match
    })
  }

  // Pattern 4: inputs/select/textarea avec bg-white sans dark:bg-
  if (/<input|<select|<textarea/.test(content)) {
    // Déjà géré par Pattern 1 ci-dessus
  }

  // Pattern 5: border-gray-200 sans dark:border-gray-700 (warning seulement, mais corrigeons quand même)
  const borderGray200Regex = /(className=["'{`](?:[^"'`]*\s)?)(border-gray-200)(\s[^"'`]*["'`}]|["'`}])/g

  content = content.replace(borderGray200Regex, (match, prefix, borderClass, suffix) => {
    if (!match.includes('dark:border-')) {
      modified = true
      fixes++
      return `${prefix}${borderClass} dark:border-gray-700${suffix}`
    }
    return match
  })

  if (modified) {
    filesModified++
    totalFixes += fixes
    console.log(`✓ ${filePath.replace(srcDir, '')} - ${fixes} fix${fixes > 1 ? 'es' : ''}`)
  }

  return { content, modified }
}

// Main
console.log('🔧 Correction automatique des patterns dark/light mode...\n')

const allFiles = getAllTsxFiles(srcDir)

allFiles.forEach(file => {
  filesProcessed++
  const content = readFileSync(file, 'utf-8')
  const { content: newContent, modified } = fixDarkModePatterns(content, file)

  if (modified) {
    writeFileSync(file, newContent, 'utf-8')
  }
})

console.log('\n📊 Résumé :')
console.log(`   Fichiers analysés : ${filesProcessed}`)
console.log(`   Fichiers modifiés : ${filesModified}`)
console.log(`   Total corrections : ${totalFixes}`)
console.log('\n✨ Terminé ! Exécutez `pnpm test` pour vérifier.')
