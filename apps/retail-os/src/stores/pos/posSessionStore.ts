/**
 * Store Zustand pour la session POS active
 * Gère l'état de la session courante et la connexion
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { POSSession, POSConfig } from '../../types/pos'

// ============================================================================
// TYPES
// ============================================================================

type ConnectionStatus = 'online' | 'offline' | 'reconnecting'

interface SessionState {
  // Session active
  session: POSSession | null
  config: POSConfig | null

  // État connexion
  connectionStatus: ConnectionStatus
  lastSyncAt: string | null

  // Actions session
  setSession: (session: POSSession | null) => void
  setConfig: (config: POSConfig | null) => void
  updateSessionTotals: (totals: Partial<POSSession>) => void
  clearSession: () => void

  // Actions connexion
  setConnectionStatus: (status: ConnectionStatus) => void
  setLastSyncAt: (date: string) => void

  // Getters
  isSessionOpen: () => boolean
  canMakeSales: () => boolean
}

// ============================================================================
// STORE
// ============================================================================

export const usePOSSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      // État initial
      session: null,
      config: null,
      connectionStatus: 'online',
      lastSyncAt: null,

      // Définir la session
      setSession: (session) => {
        set({ session })
      },

      // Définir la configuration
      setConfig: (config) => {
        set({ config })
      },

      // Mettre à jour les totaux de la session (après une vente)
      updateSessionTotals: (totals) => {
        set((state) => {
          if (!state.session) return state
          return {
            session: {
              ...state.session,
              ...totals,
            },
          }
        })
      },

      // Effacer la session
      clearSession: () => {
        set({
          session: null,
          config: null,
        })
      },

      // Statut connexion
      setConnectionStatus: (status) => {
        set({ connectionStatus: status })
      },

      // Dernière synchronisation
      setLastSyncAt: (date) => {
        set({ lastSyncAt: date })
      },

      // Vérifier si session ouverte
      isSessionOpen: () => {
        const { session } = get()
        return session !== null && session.state === 'opened'
      },

      // Vérifier si on peut faire des ventes
      canMakeSales: () => {
        const { session, connectionStatus } = get()
        // On peut vendre si session ouverte ET (online OU offline avec support)
        return (
          session !== null &&
          session.state === 'opened' &&
          (connectionStatus === 'online' || connectionStatus === 'offline')
        )
      },
    }),
    {
      name: 'pos-session-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        session: state.session,
        config: state.config,
        lastSyncAt: state.lastSyncAt,
      }),
    }
  )
)

// ============================================================================
// SELECTORS
// ============================================================================

export const selectActiveSession = (state: SessionState) => state.session
export const selectActiveConfig = (state: SessionState) => state.config
export const selectConnectionStatus = (state: SessionState) => state.connectionStatus
export const selectIsOnline = (state: SessionState) => state.connectionStatus === 'online'
