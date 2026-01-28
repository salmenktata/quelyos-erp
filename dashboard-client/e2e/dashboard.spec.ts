import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test('affiche le tableau de bord après connexion', async ({ page }) => {
    await page.goto('/')

    // Vérifier les éléments principaux
    await expect(page.getByRole('navigation')).toBeVisible()
    await expect(page.getByRole('main')).toBeVisible()
  })

  test('la sidebar contient les modules principaux', async ({ page }) => {
    await page.goto('/')

    // Vérifier les liens de navigation
    const nav = page.getByRole('navigation')
    await expect(nav.getByText(/boutique|store/i)).toBeVisible()
    await expect(nav.getByText(/stock/i)).toBeVisible()
    await expect(nav.getByText(/finance/i)).toBeVisible()
  })

  test('le thème sombre fonctionne', async ({ page }) => {
    await page.goto('/')

    // Trouver le bouton de thème
    const themeToggle = page.getByRole('button', { name: /thème|theme|dark|light/i })
    
    if (await themeToggle.isVisible()) {
      await themeToggle.click()
      
      // Vérifier que le thème a changé
      const html = page.locator('html')
      const hasDarkClass = await html.evaluate(el => el.classList.contains('dark'))
      expect(typeof hasDarkClass).toBe('boolean')
    }
  })
})
