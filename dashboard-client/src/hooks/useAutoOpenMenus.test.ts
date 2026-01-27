import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useAutoOpenMenus } from './useAutoOpenMenus'
import type { Module } from '@/config/modules'

// Mock module pour les tests
const createMockModule = (sections: any[]): Module => ({
  id: 'finance',
  name: 'Finance',
  shortName: 'Finance',
  icon: () => null,
  color: 'text-emerald-600',
  bgColor: 'bg-emerald-100',
  description: 'Test module',
  basePath: '/finance',
  sections
})

describe('useAutoOpenMenus', () => {
  describe('Auto-ouverture des menus', () => {
    it('devrait ouvrir le menu contenant un item actif', () => {
      const openMenu = vi.fn()
      const isActive = (path: string) => path === '/finance/transactions'

      const module = createMockModule([
        {
          title: 'Principal',
          items: [
            {
              name: 'Transactions',
              icon: () => null,
              subItems: [
                { name: 'Toutes', path: '/finance/transactions' },
                { name: 'Dépenses', path: '/finance/expenses' }
              ]
            }
          ]
        }
      ])

      renderHook(() => useAutoOpenMenus(module, '/finance/transactions', isActive, openMenu))

      expect(openMenu).toHaveBeenCalledWith('Transactions')
      expect(openMenu).toHaveBeenCalledTimes(1)
    })

    it('ne devrait pas ouvrir de menu si aucun item n\'est actif', () => {
      const openMenu = vi.fn()
      const isActive = (path: string) => path === '/finance/budgets'

      const module = createMockModule([
        {
          title: 'Principal',
          items: [
            {
              name: 'Transactions',
              icon: () => null,
              subItems: [
                { name: 'Toutes', path: '/finance/transactions' },
                { name: 'Dépenses', path: '/finance/expenses' }
              ]
            }
          ]
        }
      ])

      renderHook(() => useAutoOpenMenus(module, '/finance/budgets', isActive, openMenu))

      expect(openMenu).not.toHaveBeenCalled()
    })

    it('devrait ouvrir plusieurs menus si plusieurs items sont actifs', () => {
      const openMenu = vi.fn()
      const isActive = (path: string) =>
        path === '/finance/transactions' || path === '/finance/reporting'

      const module = createMockModule([
        {
          title: 'Principal',
          items: [
            {
              name: 'Transactions',
              icon: () => null,
              subItems: [
                { name: 'Toutes', path: '/finance/transactions' },
                { name: 'Dépenses', path: '/finance/expenses' }
              ]
            },
            {
              name: 'Rapports',
              icon: () => null,
              subItems: [
                { name: 'Hub', path: '/finance/reporting' },
                { name: 'Vue d\'ensemble', path: '/finance/reporting/overview' }
              ]
            }
          ]
        }
      ])

      renderHook(() => useAutoOpenMenus(module, '/finance/transactions', isActive, openMenu))

      expect(openMenu).toHaveBeenCalledWith('Transactions')
      expect(openMenu).toHaveBeenCalledWith('Rapports')
      expect(openMenu).toHaveBeenCalledTimes(2)
    })
  })

  describe('Gestion des items sans subItems', () => {
    it('ne devrait pas crasher avec des items sans subItems', () => {
      const openMenu = vi.fn()
      const isActive = (path: string) => path === '/finance/budgets'

      const module = createMockModule([
        {
          title: 'Principal',
          items: [
            {
              name: 'Budgets',
              path: '/finance/budgets',
              icon: () => null
              // Pas de subItems
            }
          ]
        }
      ])

      expect(() => {
        renderHook(() => useAutoOpenMenus(module, '/finance/budgets', isActive, openMenu))
      }).not.toThrow()

      expect(openMenu).not.toHaveBeenCalled()
    })

    it('devrait gérer un mix d\'items avec et sans subItems', () => {
      const openMenu = vi.fn()
      const isActive = (path: string) => path === '/finance/transactions'

      const module = createMockModule([
        {
          title: 'Principal',
          items: [
            {
              name: 'Budgets',
              path: '/finance/budgets',
              icon: () => null
            },
            {
              name: 'Transactions',
              icon: () => null,
              subItems: [
                { name: 'Toutes', path: '/finance/transactions' }
              ]
            }
          ]
        }
      ])

      renderHook(() => useAutoOpenMenus(module, '/finance/transactions', isActive, openMenu))

      expect(openMenu).toHaveBeenCalledWith('Transactions')
      expect(openMenu).toHaveBeenCalledTimes(1)
    })
  })

  describe('Gestion des subItems sans path', () => {
    it('ne devrait pas ouvrir le menu si subItems n\'ont pas de path', () => {
      const openMenu = vi.fn()
      const isActive = (path: string) => path === '/finance/transactions'

      const module = createMockModule([
        {
          title: 'Principal',
          items: [
            {
              name: 'Rapports',
              icon: () => null,
              subItems: [
                { name: 'Séparateur', separator: true }, // Pas de path
                { name: 'Hub', path: '/finance/reporting' }
              ]
            }
          ]
        }
      ])

      renderHook(() => useAutoOpenMenus(module, '/finance/transactions', isActive, openMenu))

      expect(openMenu).not.toHaveBeenCalled()
    })

    it('devrait ignorer les séparateurs et traiter uniquement les paths valides', () => {
      const openMenu = vi.fn()
      const isActive = (path: string) => path === '/finance/reporting'

      const module = createMockModule([
        {
          title: 'Principal',
          items: [
            {
              name: 'Rapports',
              icon: () => null,
              subItems: [
                { name: 'Tableau de bord', separator: true },
                { name: 'Hub', path: '/finance/reporting' },
                { name: 'Analyses', separator: true }
              ]
            }
          ]
        }
      ])

      renderHook(() => useAutoOpenMenus(module, '/finance/reporting', isActive, openMenu))

      expect(openMenu).toHaveBeenCalledWith('Rapports')
      expect(openMenu).toHaveBeenCalledTimes(1)
    })
  })

  describe('Reactivity', () => {
    it('devrait réagir au changement de pathname', () => {
      const openMenu = vi.fn()
      const isActive = vi.fn((path: string) => path === '/finance/transactions')

      const module = createMockModule([
        {
          title: 'Principal',
          items: [
            {
              name: 'Transactions',
              icon: () => null,
              subItems: [
                { name: 'Toutes', path: '/finance/transactions' }
              ]
            },
            {
              name: 'Rapports',
              icon: () => null,
              subItems: [
                { name: 'Hub', path: '/finance/reporting' }
              ]
            }
          ]
        }
      ])

      const { rerender } = renderHook(
        ({ pathname, activeCheck }) => useAutoOpenMenus(module, pathname, activeCheck, openMenu),
        { initialProps: { pathname: '/finance/transactions', activeCheck: isActive } }
      )

      expect(openMenu).toHaveBeenCalledWith('Transactions')

      openMenu.mockClear()
      const newIsActive = vi.fn((path: string) => path === '/finance/reporting')

      rerender({ pathname: '/finance/reporting', activeCheck: newIsActive })

      expect(openMenu).toHaveBeenCalledWith('Rapports')
    })

    it('devrait réagir au changement de module', () => {
      const openMenu = vi.fn()
      const isActive = (path: string) => path === '/finance/transactions'

      const financeModule = createMockModule([
        {
          title: 'Principal',
          items: [
            {
              name: 'Transactions',
              icon: () => null,
              subItems: [
                { name: 'Toutes', path: '/finance/transactions' }
              ]
            }
          ]
        }
      ])

      const storeModule: Module = {
        id: 'store',
        name: 'Boutique',
        shortName: 'Boutique',
        icon: () => null,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100',
        description: 'E-commerce',
        basePath: '/store',
        sections: [
          {
            title: 'Gestion',
            items: [
              {
                name: 'Produits',
                icon: () => null,
                subItems: [
                  { name: 'Tous', path: '/store/products' }
                ]
              }
            ]
          }
        ]
      }

      const { rerender } = renderHook(
        ({ module }) => useAutoOpenMenus(module, '/finance/transactions', isActive, openMenu),
        { initialProps: { module: financeModule } }
      )

      expect(openMenu).toHaveBeenCalledWith('Transactions')

      openMenu.mockClear()

      rerender({ module: storeModule })

      // Ne devrait plus ouvrir Transactions car module changé
      expect(openMenu).not.toHaveBeenCalledWith('Transactions')
    })
  })

  describe('Parcours de sections multiples', () => {
    it('devrait parcourir toutes les sections du module', () => {
      const openMenu = vi.fn()
      const isActive = (path: string) =>
        path === '/finance/transactions' || path === '/finance/categories'

      const module = createMockModule([
        {
          title: 'Principal',
          items: [
            {
              name: 'Transactions',
              icon: () => null,
              subItems: [
                { name: 'Toutes', path: '/finance/transactions' }
              ]
            }
          ]
        },
        {
          title: 'Configuration',
          items: [
            {
              name: 'Paramètres',
              icon: () => null,
              subItems: [
                { name: 'Catégories', path: '/finance/categories' }
              ]
            }
          ]
        }
      ])

      renderHook(() => useAutoOpenMenus(module, '/finance/transactions', isActive, openMenu))

      expect(openMenu).toHaveBeenCalledWith('Transactions')
      expect(openMenu).toHaveBeenCalledWith('Paramètres')
      expect(openMenu).toHaveBeenCalledTimes(2)
    })
  })
})
