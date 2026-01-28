import { test as setup, expect } from '@playwright/test'

const authFile = 'e2e/.auth/user.json'

/**
 * Setup: Authentification avant les tests
 * Crée un fichier de session réutilisable
 */
setup('authenticate', async ({ page }) => {
  // Aller à la page de login
  await page.goto('/login')

  // Remplir le formulaire
  await page.getByLabel(/email|login/i).fill('admin')
  await page.getByLabel(/password|mot de passe/i).fill('admin')

  // Soumettre
  await page.getByRole('button', { name: /connexion|login|se connecter/i }).click()

  // Attendre la redirection vers le dashboard
  await expect(page).toHaveURL(/\/(dashboard|home)?$/, { timeout: 15000 })

  // Vérifier qu'on est connecté
  await expect(page.getByText(/bienvenue|dashboard|accueil/i)).toBeVisible()

  // Sauvegarder la session
  await page.context().storageState({ path: authFile })
})
