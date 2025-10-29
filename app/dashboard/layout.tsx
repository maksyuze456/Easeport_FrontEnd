'use client';

import { AppShell, Center, Loader } from '@mantine/core';
import { AuthProvider, useAuthContext } from "../_context/AuthProvider";
import { NavbarSegmented } from "../../components/NavBarSegmented/NavbarSegmented";
import { NavbarSimple } from "../../components/NavbarSimple/NavbarSimple";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { HeaderSimple } from '../../components/HeaderSimple/HeaderSimple';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardContent>{children}</DashboardContent>
    </AuthProvider>
  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { loggedInUser, loading } = useAuthContext();
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
      </AppShell.Main>
    </AppShell>
  );
}
