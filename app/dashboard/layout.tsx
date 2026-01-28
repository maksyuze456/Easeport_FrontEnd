'use client';

import { AppShell, Center, Loader, Notification } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useAuthContext } from "../_context/AuthProvider";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IconCheck } from '@tabler/icons-react';

import { createPortal } from "react-dom";
import { HeaderSimple, NavbarSimple, NavbarSegmented } from '../../shared/components/layout';
import { useNotifications } from '../../features/notifications';
import { logout } from '../../features/auth';
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
  const [responseMessage, setResponseMessage] = useState<{ message: string } | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const { data: notifications, isLoading: notificationsLoading, refetch: refetchNotifications } = useNotifications(loggedInUser?.id);
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !loggedInUser) {
      router.replace('/login');
    }
  }, [authLoading, loggedInUser, router]);

  const onLogout = async () => {
    let res = await logout();
    disconnect()
    router.push("/login");
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
        collapsed: { mobile: !mobileOpened },
      }}
      header={{ height: 60 }}
    >
      <AppShell.Header>
        <HeaderSimple
          notifications={notifications}
          notificationsLoading={notificationsLoading}
          mobileOpened={mobileOpened}
          toggleMobile={toggleMobile}
        />
      </AppShell.Header>

      <AppShell.Navbar>
        {loggedInUser.role === "ROLE_ADMIN" && <NavbarSegmented onLogout={onLogout} closeMobile={closeMobile} />}
        {loggedInUser.role === "ROLE_USER" && <NavbarSimple onLogout={onLogout} closeMobile={closeMobile} />}
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
