import { MODULES, type Module } from '@/config/modules'

export function useDetectModule(
  _accessibleModules: Module[],
  pathname: string
): Module {
  if (pathname.startsWith('/store')) return MODULES[1] || MODULES[0]
  if (pathname.startsWith('/stock')) return MODULES[2] || MODULES[0]
  return MODULES[0]
}
