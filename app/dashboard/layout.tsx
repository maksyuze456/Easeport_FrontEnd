'use client';

import { AppShell, Center, Loader, Notification } from '@mantine/core';
import { AuthProvider, useAuthContext } from "../_context/AuthProvider";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IconCheck } from '@tabler/icons-react';

import { createPortal } from "react-dom";
import { Message } from '../_types/message';
import { HeaderSimple } from '../_components/HeaderSimple/HeaderSimple';
import { NavbarSimple } from '../_components/NavbarSimple/NavbarSimple';
import { NavbarSegmented } from '../_components/NavBarSegmented/NavbarSegmented';
import { useWebSocket, WebSocketContextProvider } from '../_context/WebSocketContextProvider';
import { useQueryClient } from '@tanstack/react-query';
import { getMyTicketsRq, getTicketsByStatusRq } from '../api/routes/tickets/tickets';
import { NotificationType } from '../_types/notifications';
import { useNotifications } from '../api/routes/notifications/hooks/useNotificationsQueries';
import { getConversation } from '../api/routes/tickets/ticketConversation';


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <WebSocketContextProvider>
      <DashboardContent>{children}</DashboardContent>
    </WebSocketContextProvider>


  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  // 1. ALL HOOKS MUST RUN FIRST
  const { data: loggedInUser, isLoading: authLoading } = useAuthContext();
  const [responseMessage, setResponseMessage] = useState<Message | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const { data: notifications, isLoading: notificationsLoading, refetch: refetchNotifications } = useNotifications(loggedInUser?.id);


  const router = useRouter();
  const queryClient = useQueryClient();
  const { subscribe, disconnect } = useWebSocket();

  useEffect(() => {
    if (!authLoading && !loggedInUser) {
      router.replace('/login');
    }
  }, [authLoading, loggedInUser, router]);

  // WebSocket subscriptions
  useEffect(() => {
    if (!loggedInUser) {
      return;
    }

    const unsubNew = subscribe("/topic/new-ticket", () => {
      queryClient.invalidateQueries({ queryKey: ["tickets", "Open"] });
      queryClient.fetchQuery({
        queryKey: ["tickets", "Open"],
        queryFn: () => getTicketsByStatusRq("Open"),
      });
    });

    const unsubAssign = subscribe("/topic/assign", () => {
      queryClient.invalidateQueries({ queryKey: ["tickets", "Open"] });
      queryClient.fetchQuery({
        queryKey: ["tickets", "Open"],
        queryFn: () => getTicketsByStatusRq("Open"),
      });
    });

    const unsubPersonalAssign = subscribe("/user/queue/assign", () => {
      queryClient.invalidateQueries({ queryKey: ["myTickets", "Reviewing"] });
      queryClient.fetchQuery({
        queryKey: ["myTickets", "Reviewing"],
        queryFn: () => getMyTicketsRq("Reviewing"),
      });
    });

    const unsubNotifications = subscribe("/user/queue/notifications", (msg) => {
      const message: Message = JSON.parse(msg);
      const notificationType: NotificationType = message.message as NotificationType;
      console.log(notificationType);

      queryClient.invalidateQueries({ queryKey: ["notifications", loggedInUser.id] });
      refetchNotifications();
    });

    const unsubMessages = subscribe("/user/queue/ticket-messages", (msg) => {
      const message: Message = JSON.parse(msg);
      const ticketId: number = Number.parseInt(message.message);
      console.log("Message in ticket: " + ticketId);

      queryClient.invalidateQueries({ queryKey: ["conversation", ticketId] });
      queryClient.fetchQuery({
        queryKey: ["conversation", ticketId],
        queryFn: () => getConversation(ticketId),
      });
    });

    return () => {
      unsubNew();
      unsubAssign();
      unsubPersonalAssign();
      unsubNotifications();
      unsubMessages();
    };
  }, [loggedInUser, subscribe, queryClient, refetchNotifications]);

  // Disconnect websocket when user logs out
  useEffect(() => {
    if (!loggedInUser) {
      disconnect();
    }
  }, [loggedInUser, disconnect]);

  // 2. NOW YOU CAN SAFELY DO CONDITIONAL RETURNS
  if (authLoading) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    );
  }

  if (!loggedInUser) {
    return null;
  }

  // 3. NORMAL RENDER
  return (
    <AppShell
      withBorder
      padding="md"
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: true },
      }}
      header={{ height: 60 }}
    >
      <AppShell.Header>
        <HeaderSimple notifications={notifications} notificationsLoading={notificationsLoading} />
      </AppShell.Header>

      <AppShell.Navbar>
        {loggedInUser.role === "ROLE_ADMIN" && <NavbarSegmented />}
        {loggedInUser.role === "ROLE_USER" && <NavbarSimple />}
      </AppShell.Navbar>

      <AppShell.Main>
        {children}

        {showNotification &&
          createPortal(
            <div
              style={{
                position: "fixed",
                bottom: 20,
                right: 20,
                zIndex: 1000,
              }}
            >
              <Notification
                icon={<IconCheck size={20} />}
                color="teal"
                title="All good!"
                onClose={() => setShowNotification(false)}
              >
                {responseMessage?.message || "Response saved successfully"}
              </Notification>
            </div>,
            document.body
          )}
      </AppShell.Main>
    </AppShell>
  );
}
