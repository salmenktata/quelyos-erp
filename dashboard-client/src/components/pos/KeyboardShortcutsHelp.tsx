/**
 * Modal d'aide des raccourcis clavier POS
 * Affiche tous les raccourcis disponibles
 */

import { X, Keyboard } from 'lucide-react'
import type { POSKeyboardShortcut } from '../../hooks/pos/usePOSKeyboard'

interface KeyboardShortcutsHelpProps {
  isOpen: boolean
  onClose: () => void
  shortcuts: POSKeyboardShortcut[]
}

export function KeyboardShortcutsHelp({ isOpen, onClose, shortcuts }: KeyboardShortcutsHelpProps) {
  if (!isOpen) return null

  // Grouper les raccourcis par catégorie
  const groups = [
    {
      title: 'Navigation',
      keys: ['F1', 'F2', 'F3', 'F5'],
    },
    {
      title: 'Panier',
      keys: ['F4', 'F6', '+', '-', 'Del'],
    },
    {
      title: 'Paiement',
      keys: ['F7', 'F8'],
    },
    {
      title: 'Session',
      keys: ['F9', 'F10', 'F11', 'F12'],
    },
    {
      title: 'Général',
      keys: ['Escape'],
    },
  ]

  const getShortcutsByKeys = (keys: string[]) => {
    return shortcuts.filter(s => keys.includes(s.key))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-teal-500 to-teal-600">
          <div className="flex items-center gap-3">
            <Keyboard className="h-6 w-6 text-white" />
            <h2 className="text-xl font-bold text-white">Raccourcis Clavier</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-6">
            {groups.map((group) => {
              const groupShortcuts = getShortcutsByKeys(group.keys)
              if (groupShortcuts.length === 0) return null

              return (
                <div key={group.title}>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    {group.title}
                  </h3>
                  <div className="space-y-2">
                    {groupShortcuts.map((shortcut) => (
                      <div
                        key={shortcut.key}
                        className={`flex items-center justify-between p-2 rounded-lg ${
                          shortcut.enabled
                            ? 'bg-gray-50 dark:bg-gray-900'
                            : 'bg-gray-50/50 dark:bg-gray-900/50 opacity-50'
                        }`}
                      >
                        <span className="text-gray-700 dark:text-gray-300">
                          {shortcut.description}
                        </span>
                        <kbd className="px-2.5 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-mono font-semibold shadow-sm">
                          {shortcut.label}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Tips */}
          <div className="mt-6 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl">
            <h4 className="font-semibold text-teal-700 dark:text-teal-300 mb-2">
              Conseils
            </h4>
            <ul className="text-sm text-teal-600 dark:text-teal-400 space-y-1">
              <li>• Utilisez <kbd className="px-1.5 py-0.5 bg-teal-100 dark:bg-teal-800 rounded text-xs">F8</kbd> pour accéder rapidement au paiement</li>
              <li>• <kbd className="px-1.5 py-0.5 bg-teal-100 dark:bg-teal-800 rounded text-xs">F9</kbd> suspend le panier pour servir un autre client</li>
              <li>• Le scanner code-barres ajoute automatiquement les produits</li>
              <li>• Appuyez sur <kbd className="px-1.5 py-0.5 bg-teal-100 dark:bg-teal-800 rounded text-xs">?</kbd> ou <kbd className="px-1.5 py-0.5 bg-teal-100 dark:bg-teal-800 rounded text-xs">F1</kbd> pour afficher cette aide</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Appuyez sur <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">Échap</kbd> pour fermer
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Barre de raccourcis rapides affichée en bas de l'écran terminal
 */
export function KeyboardShortcutsBar() {
  const quickShortcuts = [
    { key: 'F2', label: 'Recherche' },
    { key: 'F4', label: 'Remise' },
    { key: 'F7', label: 'Espèces' },
    { key: 'F8', label: 'Payer' },
    { key: 'F9', label: 'Suspendre' },
    { key: 'F12', label: 'Fermer' },
  ]

  return (
    <div className="flex items-center justify-center gap-4 py-2 px-4 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      {quickShortcuts.map((shortcut) => (
        <div key={shortcut.key} className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs font-mono font-semibold">
            {shortcut.key}
          </kbd>
          <span className="text-xs text-gray-500 dark:text-gray-500">
            {shortcut.label}
          </span>
        </div>
      ))}
      <div className="flex items-center gap-1.5 ml-4 pl-4 border-l border-gray-300 dark:border-gray-700">
        <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs font-mono font-semibold">
          ?
        </kbd>
        <span className="text-xs text-gray-500 dark:text-gray-500">
          Aide
        </span>
      </div>
    </div>
  )
}
