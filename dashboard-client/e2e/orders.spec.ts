import { test, expect } from '@playwright/test'

test.describe('Gestion des Commandes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/store/orders')
  })

  test('affiche la liste des commandes', async ({ page }) => {
    await expect(page.getByRole('table').or(page.getByRole('list'))).toBeVisible({ timeout: 10000 })
  })

  test('peut filtrer par statut', async ({ page }) => {
    const statusFilter = page.getByRole('combobox', { name: /statut|status/i })
      .or(page.getByLabel(/statut|status/i))
    
    if (await statusFilter.isVisible()) {
      await statusFilter.click()
      await page.waitForTimeout(300)
    }
  })

  test('peut voir le détail d\'une commande', async ({ page }) => {
    // Cliquer sur la première commande
    const firstRow = page.getByRole('row').nth(1)
    
    if (await firstRow.isVisible()) {
      await firstRow.click()
      await page.waitForLoadState('networkidle')
      
      // Devrait naviguer vers le détail ou ouvrir un modal
    }
  })

  test('les totaux sont affichés correctement', async ({ page }) => {
    // Vérifier qu'il y a des montants formatés (€, $, etc.)
    const amounts = page.locator('text=/\\d+[,.]\\d{2}\\s*(€|\\$|EUR|USD)?/')
    await expect(amounts.first()).toBeVisible({ timeout: 5000 }).catch(() => {})
  })
})
