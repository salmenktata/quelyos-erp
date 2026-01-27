import { describe, it, expect, beforeEach } from 'vitest'
import {
  buildLocationTree,
  isDescendant,
  getNodePath,
  getNodePathNames,
  formatNodePath,
  flattenTree,
} from './tree-utils'
import type { StockLocation } from '@/types/stock'

describe('tree-utils', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  const mockLocations: StockLocation[] = [
    { id: 1, name: 'Entrepôt Principal', parent_id: null, barcode: 'WH-001' },
    { id: 2, name: 'Zone A', parent_id: 1, barcode: 'WH-A' },
    { id: 3, name: 'Zone B', parent_id: 1, barcode: 'WH-B' },
    { id: 4, name: 'Allée 1', parent_id: 2, barcode: 'WH-A1' },
    { id: 5, name: 'Allée 2', parent_id: 2, barcode: 'WH-A2' },
  ]

  describe('buildLocationTree', () => {
    it('devrait construire un arbre hiérarchique', () => {
      const tree = buildLocationTree(mockLocations)

      expect(tree).toHaveLength(1) // 1 racine
      expect(tree[0].id).toBe(1)
      expect(tree[0].children).toHaveLength(2) // Zone A et B
    })

    it('devrait calculer les niveaux correctement', () => {
      const tree = buildLocationTree(mockLocations)

      expect(tree[0].level).toBe(0) // Racine
      expect(tree[0].children![0].level).toBe(1) // Zone A
      expect(tree[0].children![0].children![0].level).toBe(2) // Allée 1
    })

    it('devrait trier alphabétiquement', () => {
      const tree = buildLocationTree(mockLocations)

      const zones = tree[0].children!
      expect(zones[0].name).toBe('Zone A')
      expect(zones[1].name).toBe('Zone B')
    })

    it('devrait calculer les chemins', () => {
      const tree = buildLocationTree(mockLocations)

      const zoneA = tree[0].children![0]
      const allee1 = zoneA.children![0]

      expect(zoneA.path).toEqual([1])
      expect(allee1.path).toEqual([1, 2])
    })
  })

  describe('isDescendant', () => {
    it('devrait retourner true si node est descendant', () => {
      const tree = buildLocationTree(mockLocations)
      const locationMap = new Map()
      flattenTree(tree).forEach((node) => locationMap.set(node.id, node))

      // Allée 1 (id: 4) est descendant de Zone A (id: 2)
      expect(isDescendant(4, 2, locationMap)).toBe(true)
    })

    it('devrait retourner false si node n\'est pas descendant', () => {
      const tree = buildLocationTree(mockLocations)
      const locationMap = new Map()
      flattenTree(tree).forEach((node) => locationMap.set(node.id, node))

      // Zone B (id: 3) n'est pas descendant de Zone A (id: 2)
      expect(isDescendant(3, 2, locationMap)).toBe(false)
    })

    it('devrait retourner true si nodeId === potentialAncestorId', () => {
      const tree = buildLocationTree(mockLocations)
      const locationMap = new Map()
      flattenTree(tree).forEach((node) => locationMap.set(node.id, node))

      expect(isDescendant(2, 2, locationMap)).toBe(true)
    })
  })

  describe('getNodePath', () => {
    it('devrait retourner le chemin complet', () => {
      const tree = buildLocationTree(mockLocations)
      const locationMap = new Map()
      flattenTree(tree).forEach((node) => locationMap.set(node.id, node))

      const path = getNodePath(4, locationMap) // Allée 1
      expect(path).toEqual([1, 2, 4]) // Entrepôt > Zone A > Allée 1
    })

    it('devrait retourner tableau vide pour node inexistant', () => {
      const tree = buildLocationTree(mockLocations)
      const locationMap = new Map()
      flattenTree(tree).forEach((node) => locationMap.set(node.id, node))

      const path = getNodePath(999, locationMap)
      expect(path).toEqual([])
    })
  })

  describe('getNodePathNames', () => {
    it('devrait retourner les noms du chemin', () => {
      const tree = buildLocationTree(mockLocations)
      const locationMap = new Map()
      flattenTree(tree).forEach((node) => locationMap.set(node.id, node))

      const names = getNodePathNames(4, locationMap) // Allée 1
      expect(names).toEqual(['Entrepôt Principal', 'Zone A', 'Allée 1'])
    })
  })

  describe('formatNodePath', () => {
    it('devrait formater le chemin avec séparateur', () => {
      const tree = buildLocationTree(mockLocations)
      const locationMap = new Map()
      flattenTree(tree).forEach((node) => locationMap.set(node.id, node))

      const formatted = formatNodePath(4, locationMap)
      expect(formatted).toBe('Entrepôt Principal / Zone A / Allée 1')
    })
  })

  describe('flattenTree', () => {
    it('devrait aplatir l\'arbre en liste', () => {
      const tree = buildLocationTree(mockLocations)
      const flat = flattenTree(tree)

      expect(flat).toHaveLength(5)
      expect(flat.map((n) => n.id)).toEqual([1, 2, 4, 5, 3])
    })
  })
})
