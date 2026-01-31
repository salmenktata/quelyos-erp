import { useState } from 'react'

export interface InstallConfig {
  // Step 1
  name: string
  domain: string
  admin_email: string
  admin_name: string

  // Step 2
  plan_code: 'starter' | 'pro' | 'enterprise'

  // Step 3
  generate_seed: boolean
  seed_volumetry?: 'minimal' | 'standard' | 'large'
  seed_modules?: string[]
  seed_enable_relations?: boolean
  seed_enable_unsplash?: boolean
}

export function useInstallWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [config, setConfig] = useState<InstallConfig>({
    name: '',
    domain: '',
    admin_email: '',
    admin_name: '',
    plan_code: 'starter',
    generate_seed: true,
    seed_volumetry: 'standard',
    seed_modules: ['store', 'stock', 'crm', 'marketing', 'finance', 'pos', 'support', 'hr'],
    seed_enable_relations: true,
    seed_enable_unsplash: true,
  })

  const updateConfig = (field: keyof InstallConfig, value: unknown) => {
    setConfig(prev => ({ ...prev, [field]: value }))

    // Auto-génération domain depuis name
    if (field === 'name' && typeof value === 'string') {
      const slug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setConfig(prev => ({ ...prev, domain: `${slug}.quelyos.com` }))
    }
  }

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 5))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1: {
        // Validation email format basique
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return (
          config.name.length >= 2 &&
          config.admin_name.length >= 2 &&
          emailRegex.test(config.admin_email)
        )
      }
      case 2:
        return !!config.plan_code
      case 3:
        return !config.generate_seed || (!!config.seed_modules && config.seed_modules.length > 0)
      case 4:
        return true
      case 5:
        return true
      default:
        return false
    }
  }

  return {
    currentStep,
    config,
    updateConfig,
    nextStep,
    prevStep,
    validateCurrentStep,
  }
}
