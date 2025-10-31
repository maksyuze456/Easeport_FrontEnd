import { useEffect, useRef, useState } from "react";
import { getWebSocketClient } from "../_lib/websocket";

interface AssignMessage {
  ticketId: string;
}

export function useAssignTicketWebSocket(onAssign: () => void) {
  const [isConnected, setIsConnected] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const subscriptionRef = useRef<any>(null);
  const onAssignRef = useRef(onAssign);

  useEffect(() => {
    onAssignRef.current = onAssign;
  }, [onAssign]);

  useEffect(() => {
    let isMounted = true;
    getWebSocketClient(apiUrl).then((client) => {
      if (!isMounted) return;

      setIsConnected(true);
      subscriptionRef.current = client.subscribe('/topic/assign', (message) => {
        const notification: AssignMessage = JSON.parse(message.body);
        console.log('Assigned ticket:', notification);
        onAssignRef.current?.();
      });
    });

    return () => {
      isMounted = false;
      subscriptionRef.current?.unsubscribe();
      console.log('Unsubscribed from /topic/assign');
    };
  }, [apiUrl]);

  return { isConnected };
}
