"use client";

import { Client } from "@stomp/stompjs";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { WsBus } from "../_lib/ws/wsBus";
import { WsTransport, StompTransport } from "../_lib/ws/stompTransport";

type WsContextType = {
  connected: boolean;
  subscribe: (topic: string, callback: (msg: string) => void) => () => void;
  disconnect: () => void;
};

const WsContext = createContext<WsContextType | null>(null);

export const useWebSocket = () => {
  const ctx = useContext(WsContext)
  if (!ctx) throw new Error("WsContext not found")
  return ctx
}

export function WebSocketContextProvider({
  children,
  transport,
  bus,
}: {
  children: ReactNode
  transport?: WsTransport
  bus?: WsBus
}) {
  const wsBusRef = useRef(bus ?? new WsBus())
  const transportRef = useRef<WsTransport | null>(null)

  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const wsTransport =
      transport ??
      new StompTransport(`${process.env.NEXT_PUBLIC_API_URL}/ws`)

    transportRef.current = wsTransport

    // Bridge transport → bus
    wsTransport.onMessage((topic, payload) => {
      wsBusRef.current.dispatch(topic, payload)
    })

    wsTransport.connect()
    setConnected(true)

    return () => {
      wsTransport.disconnect()
      setConnected(false)
    }
  }, [transport])

  const subscribe = (topic: string, cb: (msg: string) => void) => {
    const unsubscribe = wsBusRef.current.subscribe(topic, cb)
    transportRef.current?.subscribe(topic)
    return unsubscribe
  }

  const disconnect = () => {
    transportRef.current?.disconnect()
    setConnected(false)
  }



  return (
    <WsContext.Provider
      value={{
        connected,
        subscribe,
        disconnect,
      }}
    >
      {children}
    </WsContext.Provider>
  );
}