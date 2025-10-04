'use client';

import { Container, Grid } from '@mantine/core';
import { NavbarSegmented } from '../../_components/NavBarSegmented/NavbarSegmented';
import { EmployeeProvider } from '../../_context/EmployeeProvider';

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <EmployeeProvider>
     {children}
    </EmployeeProvider>
  );
}