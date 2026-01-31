import { useMemo } from 'react'
import { MODULES, type Module } from '@/config/modules'

/**
 * Detects active module from the URL pathname.
 * Sales-OS only has 'crm' and 'marketing' modules.
 */
export function useDetectModule(
  accessibleModules: Module[],
  pathname: string
): Module {
  return useMemo(() => {
    if (pathname.startsWith('/marketing'))
      return accessibleModules.find(m => m.id === 'marketing') || accessibleModules[0] || MODULES[0]

    // Default to CRM for /crm, /, or any other path
    return accessibleModules.find(m => m.id === 'crm') || accessibleModules[0] || MODULES[0]
  }, [accessibleModules, pathname])
}
