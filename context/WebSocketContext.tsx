"use client"

import { createContext, useContext } from "react"
import { wsClient } from "../lib/ws/wsClient"

type WsContextType = {
  subscribe: (topic: string, cb: (msg: string) => void) => () => void
  disconnect: () => void
}

const WsContext = createContext<WsContextType | null>(null)

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  return (
    <WsContext.Provider
      value={{
        subscribe: wsClient.subscribe.bind(wsClient),
        disconnect: wsClient.disconnect.bind(wsClient)
      }}
    >
      {children}
    </WsContext.Provider>
  )
}

export function useWebSocket() {
  const ctx = useContext(WsContext)
  if (!ctx) throw new Error("WebSocketContext missing")
  return ctx
}