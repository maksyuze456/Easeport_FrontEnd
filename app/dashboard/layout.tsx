'use client';

import { AppShell, Center, Loader, Notification } from '@mantine/core';
import { useAuthContext } from "../_context/AuthProvider";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IconCheck } from '@tabler/icons-react';

import { createPortal } from "react-dom";
import { Message } from '../_types/message';
import { HeaderSimple } from '../_components/HeaderSimple/HeaderSimple';
import { NavbarSimple } from '../_components/NavbarSimple/NavbarSimple';
import { NavbarSegmented } from '../_components/NavBarSegmented/NavbarSegmented';
import { useNotifications } from '../api/routes/notifications/hooks/useNotificationsQueries';
import { useDashboardWsSubscriptions } from '../../lib/ws/useDashboardSubscriptions';
import { useWebSocket } from '../../context/WebSocketContext';


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardContent>{children}</DashboardContent>
  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { disconnect } = useWebSocket();
  const { data: loggedInUser, isLoading: authLoading } = useAuthContext();
  const [responseMessage, setResponseMessage] = useState<Message | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const { data: notifications, isLoading: notificationsLoading, refetch: refetchNotifications } = useNotifications(loggedInUser?.id);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !loggedInUser) {
      router.replace('/login');
    }
  }, [authLoading, loggedInUser, router]);

  const onLogout = () => {
    disconnect()
  }

  useDashboardWsSubscriptions(loggedInUser?.id)

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
        {loggedInUser.role === "ROLE_USER" && <NavbarSimple onLogout={onLogout} />}
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
