import { FINANCE_MODULE, type Module } from '@/config/modules'

export function useDetectModule(
  _accessibleModules: Module[],
  _pathname: string
): Module {
  return FINANCE_MODULE
}
