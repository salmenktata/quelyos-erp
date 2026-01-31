import { useEffect, useCallback, useRef } from 'react'

export interface ChannelMessage {
  event: string
  data: Record<string, unknown>
}

/**
 * Stub websocket hook - real-time updates not yet implemented.
 * Returns a no-op channel listener.
 */
export function useChannel(channelName: string, callback: (message: ChannelMessage) => void) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  const subscribe = useCallback(() => {
    // No-op: WebSocket not connected in this SaaS yet
  }, [])

  useEffect(() => {
    subscribe()
  }, [subscribe])

  return { connected: false }
}
