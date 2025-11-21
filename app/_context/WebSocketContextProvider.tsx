"use client";

import { Client } from "@stomp/stompjs";
import {
  createContext,
  ReactNode,
  useContext,
  useRef,
  useState,
} from "react";
import SockJS from "sockjs-client";

type WsContextType = {
  client: Client | null;
  connected: boolean;
  subscribe: (topic: string, callback: (msg: string) => void) => () => void;
  disconnect: () => Promise<void>;
};

const WsContext = createContext<WsContextType>({
  client: null,
  connected: false,
  subscribe: () => () => { },
  disconnect: async () => { },
});

export const useWebSocket = () => useContext(WsContext);

let stompClient: Client | null = null;

export const WebSocketContextProvider = ({ children }: { children: ReactNode }) => {

  const [connected, setConnected] = useState(false);
  const subscribedTopics = useRef<Set<string>>(new Set());
  const subscriptions = useRef<Map<string, ((msg: string) => void)[]>>(
    new Map()
  );

  const subscribe = (topic: string, callback: (msg: string) => void) => {

    // Initialize callback array for this topic if it doesn't exist
    if (!subscriptions.current.has(topic)) {
      subscriptions.current.set(topic, []);
    }

    // Add the callback to the array
    subscriptions.current.get(topic)!.push(callback);

    // Only subscribe to STOMP topic once
    if (
      stompClient &&
      stompClient.connected &&
      !subscribedTopics.current.has(topic)
    ) {
      stompClient.subscribe(topic, (msg) => {
        subscriptions.current.get(topic)?.forEach((fn) => fn(msg.body));
      });
      subscribedTopics.current.add(topic);
    }

    // Return unsubscribe function
    return () => {
      const callbacks = subscriptions.current.get(topic);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  };

  if (!stompClient) {

    console.log("[WS] Initializing WebSocket client…");
    stompClient = new Client({
      webSocketFactory: () => new SockJS(`${process.env.NEXT_PUBLIC_API_URL}/ws`),
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (msg) => console.log("[STOMP]", msg),

      onConnect: () => {
        console.log("[WS] Connected.");
        setConnected(true);
        subscriptions.current.forEach((callbacks, topic) => {
          if (!subscribedTopics.current.has(topic)) {
            stompClient!.subscribe(topic, (msg) => {
              callbacks.forEach((fn) => fn(msg.body));
            });
            subscribedTopics.current.add(topic);
          }
        });
      },

      onStompError: (frame) => {
        console.error("[WS] STOMP Error:", frame);
      },

      onWebSocketClose: () => {
        console.warn("[WS] Socket closed");
        setConnected(false);
      },
    });

    stompClient.activate();
  }

  const disconnect = async () => {

    if (stompClient) {

      console.log("[WS] Disconnecting WebSocket...");

      try {
        await stompClient.deactivate();
        console.log("[WS] WebSocket deactivated");
      } catch (err) {
        console.error("[WS] Error deactivating:", err);
      }

      subscriptions.current.clear();
      subscribedTopics.current.clear();
      stompClient = null;
      setConnected(false);
    }
  };

  return (
    <WsContext.Provider
      value={{
        subscribe: subscribe,
        client: stompClient,
        connected: connected,
        disconnect: disconnect,
      }}
    >
      {children}
    </WsContext.Provider>
  );
};
