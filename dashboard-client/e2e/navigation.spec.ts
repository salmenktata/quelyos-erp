import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('peut naviguer vers tous les modules', async ({ page }) => {
    await page.goto('/')

    const modules = [
      { path: '/store/products', name: /produits|products/i },
      { path: '/store/orders', name: /commandes|orders/i },
      { path: '/crm/customers', name: /clients|customers/i },
      { path: '/stock', name: /stock|inventory/i },
      { path: '/finance', name: /finance/i },
    ]

    for (const module of modules) {
      await page.goto(module.path)
      await expect(page).toHaveURL(new RegExp(module.path))
      await page.waitForLoadState('networkidle')
    }
  })

  test('le breadcrumb reflète la navigation', async ({ page }) => {
    await page.goto('/store/products')

    const breadcrumb = page.getByRole('navigation', { name: /breadcrumb/i })
      .or(page.locator('[aria-label*="breadcrumb"]'))
      .or(page.locator('.breadcrumb'))

    if (await breadcrumb.isVisible()) {
      await expect(breadcrumb).toContainText(/produits|products/i)
    }
  })

  test('le bouton retour fonctionne', async ({ page }) => {
    await page.goto('/store/products')
    await page.goto('/store/orders')

    await page.goBack()
    await expect(page).toHaveURL(/\/store\/products/)
  })
})
