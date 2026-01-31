import { InstallConfig } from '@/hooks/useInstallWizard'
import { Building, Mail, User, Globe } from 'lucide-react'

interface Step1TenantInfoProps {
  config: InstallConfig
  updateConfig: (field: keyof InstallConfig, value: unknown) => void
}

export function Step1TenantInfo({ config, updateConfig }: Step1TenantInfoProps) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isEmailValid = config.admin_email === '' || emailRegex.test(config.admin_email)
  const isNameValid = config.name === '' || config.name.length >= 2
  const isAdminNameValid = config.admin_name === '' || config.admin_name.length >= 2

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Informations de base
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Configurez les informations principales de votre nouvelle instance
        </p>
      </div>

      {/* Nom boutique */}
      <div>
        <label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Building className="h-4 w-4" />
          Nom de la boutique
        </label>
        <input
          type="text"
          id="name"
          value={config.name}
          onChange={e => updateConfig('name', e.target.value)}
          placeholder="Ma Boutique"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
        {!isNameValid && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            Le nom doit contenir au moins 2 caractères
          </p>
        )}
      </div>

      {/* Domain auto-généré */}
      <div>
        <label htmlFor="domain" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Globe className="h-4 w-4" />
          Domaine
        </label>
        <input
          type="text"
          id="domain"
          value={config.domain}
          readOnly
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Généré automatiquement depuis le nom de la boutique
        </p>
      </div>

      {/* Email admin */}
      <div>
        <label htmlFor="admin_email" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Mail className="h-4 w-4" />
          Email administrateur
        </label>
        <input
          type="email"
          id="admin_email"
          value={config.admin_email}
          onChange={e => updateConfig('admin_email', e.target.value)}
          placeholder="admin@example.com"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
        {!isEmailValid && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            Veuillez entrer une adresse email valide
          </p>
        )}
      </div>

      {/* Nom admin */}
      <div>
        <label htmlFor="admin_name" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <User className="h-4 w-4" />
          Nom administrateur
        </label>
        <input
          type="text"
          id="admin_name"
          value={config.admin_name}
          onChange={e => updateConfig('admin_name', e.target.value)}
          placeholder="Jean Dupont"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
        {!isAdminNameValid && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            Le nom doit contenir au moins 2 caractères
          </p>
        )}
      </div>
    </div>
  )
}
