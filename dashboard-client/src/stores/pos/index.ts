/**
 * Exports des stores POS
 */

export {
  usePOSCartStore,
  selectCartIsEmpty,
  selectCartTotal,
  selectCartItemCount,
  selectHasSuspendedCarts,
} from './posCartStore'

export {
  usePOSSessionStore,
  selectActiveSession,
  selectActiveConfig,
  selectConnectionStatus,
  selectIsOnline,
} from './posSessionStore'

export {
  usePOSOfflineStore,
  syncOfflineOrders,
  selectPendingOrders,
  selectSyncedOrders,
  selectFailedOrders,
  selectHasPendingOrders,
} from './posOfflineStore'
