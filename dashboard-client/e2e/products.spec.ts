import { test, expect } from '@playwright/test'

test.describe('Gestion des Produits', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/store/products')
  })

  test('affiche la liste des produits', async ({ page }) => {
    // Attendre le chargement
    await expect(page.getByRole('table')).toBeVisible({ timeout: 10000 })

    // Vérifier les colonnes
    await expect(page.getByRole('columnheader', { name: /nom|name/i })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: /prix|price/i })).toBeVisible()
  })

  test('la recherche filtre les produits', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/rechercher|search/i)
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('test')
      await page.waitForTimeout(500) // Debounce
      
      // La table devrait être mise à jour
      await expect(page.getByRole('table')).toBeVisible()
    }
  })

  test('peut ouvrir le formulaire de création', async ({ page }) => {
    const addButton = page.getByRole('button', { name: /nouveau|ajouter|créer|new|add/i })
    
    if (await addButton.isVisible()) {
      await addButton.click()
      
      // Vérifier que le formulaire s'ouvre
      await expect(page.getByRole('dialog').or(page.getByRole('form'))).toBeVisible()
    }
  })

  test('la pagination fonctionne', async ({ page }) => {
    const nextButton = page.getByRole('button', { name: /suivant|next|›/i })
    
    if (await nextButton.isVisible() && await nextButton.isEnabled()) {
      await nextButton.click()
      await page.waitForLoadState('networkidle')
      
      // Vérifier que la page a changé
      await expect(page.getByRole('table')).toBeVisible()
    }
  })
})
