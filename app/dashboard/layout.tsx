'use client';

import { AppShell, Center, Loader, Notification } from '@mantine/core';
import { AuthProvider, useAuthContext } from "../_context/AuthProvider";
import { NavbarSegmented } from "../../components/NavBarSegmented/NavbarSegmented";
import { NavbarSimple } from "../../components/NavbarSimple/NavbarSimple";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { IconCheck } from '@tabler/icons-react';
import { HeaderSimple } from '../../components/HeaderSimple/HeaderSimple';
import { createPortal } from "react-dom";
import { Message } from "../_context/TicketProvider"; 

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardContent>{children}</DashboardContent>
    </AuthProvider>
  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { loggedInUser, loading } = useAuthContext();
  const [responseMessage, setResponseMessage] = useState<Message | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const router = useRouter();


  if (loading) {
    return (
      <Center h="100vh">
        <Loader/>
      </Center>
    );
  };
  if(!loggedInUser) {
    return null;
  }

  return (
    <AppShell
      withBorder={true}
      padding="md"
      navbar={{
        width: 300, 
        breakpoint: 'sm',
        collapsed: { mobile: true }, 
      }}
      header={{
        height: 60
      }}      
    >
      <AppShell.Header>
        <HeaderSimple/>
      </AppShell.Header>
      <AppShell.Navbar>
        {loggedInUser.role === 'ROLE_ADMIN' && <NavbarSegmented />}
        {loggedInUser.role === 'ROLE_USER' && <NavbarSimple />}
      </AppShell.Navbar>
      <AppShell.Main>
        {children}
        {showNotification && createPortal(
                    <div style={{
                        position: 'fixed',
                        bottom: 20,
                        right: 20,
                        zIndex: 1000
                    }}>
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
