/**
 * Palette de couleurs pour affichage dynamique
 */

const PALETTE = [
  '#EA580C', '#2563EB', '#059669', '#7C3AED',
  '#DB2777', '#0891B2', '#CA8A04', '#DC2626',
  '#4F46E5', '#0D9488', '#9333EA', '#E11D48',
]

export function colorIndexToHex(index: number): string {
  return PALETTE[index % PALETTE.length]
}

export function getColorForId(id: number | string): string {
  const numId = typeof id === 'string' ? id.length : id
  return PALETTE[numId % PALETTE.length]
}

export const moduleColors = {
  stock: '#EA580C',
  hr: '#EA580C',
} as const
