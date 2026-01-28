import { defineConfig, devices } from '@playwright/test'

/**
 * Configuration Playwright pour tests E2E Quelyos Dashboard
 */

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  expect: { timeout: 10000 },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5175',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },

  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/user.json' },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], storageState: 'e2e/.auth/user.json' },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'], storageState: 'e2e/.auth/user.json' },
      dependencies: ['setup'],
    },
  ],

  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5175',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
