/**
 * Page Paramètres Globaux (Temporaire - Phase 1)
 *
 * Cette page redirige temporairement vers les paramètres Finance existants.
 * Migration complète prévue en Phase 2 (après refonte menu Finance).
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { Settings } from 'lucide-react'

export default function GlobalSettingsPage() {
  const navigate = useNavigate()

  useEffect(() => {
    // Redirection automatique vers les paramètres Finance (temporaire)
    const timer = setTimeout(() => {
      navigate('/finance/settings', { replace: true })
    }, 2000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <Layout>
      <div className="p-4 md:p-8 space-y-6">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="rounded-lg bg-indigo-100 dark:bg-indigo-900/30 p-4 mb-6">
            <Settings className="h-12 w-12 text-indigo-600 dark:text-indigo-400 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Redirection en cours...
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
            Les paramètres globaux sont temporairement accessibles depuis les paramètres Finance.
            Migration complète en cours.
          </p>
        </div>
      </div>
    </Layout>
  )
}
