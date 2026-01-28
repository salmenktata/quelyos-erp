/**
 * WebSocket Module pour Quelyos Dashboard
 *
 * @example
 * import { wsClient, useWebSocket, useChannel } from '@/lib/websocket'
 *
 * // Dans un composant
 * function OrdersList() {
 *   const { isConnected } = useWebSocket()
 *
 *   useChannel('orders', (message) => {
 *     if (message.event === 'new_order') {
 *       refetchOrders()
 *     }
 *   })
 *
 *   return <div>...</div>
 * }
 */

export { wsClient, useWebSocketStore } from './WebSocketClient'
export type { WSMessage, WSMessageType, WSConnectionState, MessageHandler } from './WebSocketClient'

export {
  useWebSocket,
  useChannel,
  usePublish,
  useWebSocketMessage,
  useNotifications,
  useStockUpdates,
  useOrderUpdates,
  useSyncedState,
  usePresence,
} from './hooks'
