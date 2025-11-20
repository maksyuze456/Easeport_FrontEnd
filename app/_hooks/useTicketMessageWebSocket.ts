import { useEffect, useRef, useState } from "react";
import { getWebSocketClient } from "../_lib/websocket";
import { useAuthContext } from "../_context/AuthProvider";

interface Message {
  ticketId: string;
}

export function useTicketMessageWebSocket(onAssign: () => void) {
  const [isConnected, setIsConnected] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const subscriptionRef = useRef<any>(null);
  const onAssignRef = useRef(onAssign);
  const { loggedInUser } = useAuthContext();
  useEffect(() => {
    onAssignRef.current = onAssign;
  }, [onAssign]);

  useEffect(() => {
    let isMounted = true;
    getWebSocketClient(apiUrl).then((client) => {
      if (!isMounted) return;
      setIsConnected(true);
      subscriptionRef.current = client.subscribe(`/user/${loggedInUser?.username}/ticket-messages`, (message) => {
        const notification: Message = JSON.parse(message.body);
        console.log('Ticket message:', notification);
        onAssignRef.current?.();
      });
    });

    return () => {
      isMounted = false;
      subscriptionRef.current?.unsubscribe();
      console.log('Unsubscribed from /ticket-messages');
    };
  }, [apiUrl]);

  return { isConnected };
}
