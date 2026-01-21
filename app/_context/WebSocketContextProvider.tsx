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
import SockJS from "sockjs-client";

type WsContextType = {
  client: Client | null;
  connected: boolean;
  subscribe: (topic: string, callback: (msg: string) => void) => () => void;
  disconnect: () => void;
};

const WsContext = createContext<WsContextType>({
  client: null,
  connected: false,
  subscribe: () => () => {},
  disconnect: () => {},
});

export const useWebSocket = () => useContext(WsContext);

export function WebSocketContextProvider({ children }: { children: ReactNode }) {
  const clientRef = useRef<Client | null>(null);
  const [connected, setConnected] = useState(false);

  const subscribedTopics = useRef<Set<string>>(new Set());
  const subscriptions = useRef<Map<string, ((msg: string) => void)[]>>(
    new Map()
  );

  // Create the WebSocket client ONCE safely
  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(`${process.env.NEXT_PUBLIC_API_URL}/ws`),
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (msg) => console.log("[STOMP]", msg),

      onConnect: () => {
        console.log("[WS] Connected.");
        setConnected(true);

        // Re-subscribe to all previously requested topics
        subscriptions.current.forEach((callbacks, topic) => {
          if (!subscribedTopics.current.has(topic)) {
            client.subscribe(topic, (msg) => {
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

    clientRef.current = client;
    client.activate();

    return () => {
      console.log("[WS] Cleaning up WebSocket on unmount...");
      client.deactivate();
      clientRef.current = null;
      subscribedTopics.current.clear();
      subscriptions.current.clear();
    };
  }, []);

  // Subscribe function
  const subscribe = (topic: string, callback: (msg: string) => void) => {
    if (!subscriptions.current.has(topic)) {
      subscriptions.current.set(topic, []);
    }

    subscriptions.current.get(topic)!.push(callback);

    const client = clientRef.current;

    // Subscribe on STOMP only once per topic
    if (client && client.connected && !subscribedTopics.current.has(topic)) {
      client.subscribe(topic, (msg) => {
        subscriptions.current.get(topic)?.forEach((fn) => fn(msg.body));
      });
      subscribedTopics.current.add(topic);
    }

    // Cleanup: remove callback from topic
    return () => {
      const list = subscriptions.current.get(topic);
      if (!list) return;

      const idx = list.indexOf(callback);
      if (idx >= 0) list.splice(idx, 1);

      // Optional: fully remove STOMP subscription if no listeners remain
    };
  };

  // Manual disconnect
  const disconnect = () => {
    const client = clientRef.current;
    if (!client) return;

    console.log("[WS] Manual disconnect requested...");
    client.deactivate();
    clientRef.current = null;
    subscriptions.current.clear();
    subscribedTopics.current.clear();
    setConnected(false);
  };

  return (
    <WsContext.Provider
      value={{
        client: clientRef.current,
        connected,
        subscribe,
        disconnect,
      }}
    >
      {children}
    </WsContext.Provider>
  );
}