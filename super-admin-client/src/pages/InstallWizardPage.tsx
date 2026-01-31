/**
 * Wizard Installation One-Click
 *
 * Fonctionnalités :
 * - Création tenant guidée en 5 étapes
 * - Provisioning infrastructure backend automatique
 * - Génération données seed optionnelle
 * - Polling temps réel progression
 * - Accès direct instance créée
 */

import { InstallWizard } from '@/components/wizard'
import { Sparkles } from 'lucide-react'

export function InstallWizardPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-5xl mx-auto mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="h-8 w-8 text-teal-600 dark:text-teal-400" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Installation Guidée
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Créez une nouvelle instance complète en quelques clics
        </p>
      </div>

      <InstallWizard />
    </div>
  )
}
