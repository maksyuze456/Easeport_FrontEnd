import { useEffect, useRef, useState } from "react";
import { getWebSocketClient } from "../_lib/websocket";

interface Message {
  message: string
}

export function useTicketWebSocket(onNewTicket: () => void) {
  const [isConnected, setIsConnected] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const subscriptionRef = useRef<any>(null);
  
  const onNewTicketRef = useRef(onNewTicket);
    
  useEffect(() => {
    onNewTicketRef.current = onNewTicket;
  }, [onNewTicket]);

  useEffect(() => {
    let isMounted = true;
    getWebSocketClient(apiUrl).then((client) => {
      if (!isMounted) return; 

      setIsConnected(true);
      console.log('Fetching latest tickets on connection...');
      onNewTicketRef.current();

      
      subscriptionRef.current = client.subscribe('/topic/new-ticket', (message) => {
        console.log("Incoming ticket");
        const notification: Message = JSON.parse(message.body);
        console.log('New ticket received:', notification);
        onNewTicketRef.current();
      });
    });

    return () => {
      isMounted = false;
      
      subscriptionRef.current?.unsubscribe();
      console.log('Unsubscribed from topic');
    };
  }, [apiUrl]);

  return { isConnected };
}