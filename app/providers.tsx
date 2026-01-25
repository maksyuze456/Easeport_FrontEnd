'use client';

import React, { useEffect } from 'react';
import { wsClient } from '../lib/ws/wsClient';
import { WebSocketProvider } from '../context/WebSocketContext';
import { useAuth } from './api/routes/auth';

export default function Providers({ children }: { children: React.ReactNode }) {

  const { data: loggedInUser } = useAuth();

  useEffect(() => {
    if (loggedInUser) {
      wsClient.connect();
    }

  }, [loggedInUser])

  return (
    <WebSocketProvider>
      {children}
    </WebSocketProvider>
  );
}
