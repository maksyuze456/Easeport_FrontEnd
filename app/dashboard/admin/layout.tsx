'use client';

import { Container, Grid } from '@mantine/core';
import { NavbarSegmented } from '../../_components/NavbarSegmented';
import { EmployeeProvider } from '../../_context/EmployeeProvider';



type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <EmployeeProvider>
      <Container my="md" fluid>
        <Grid gutter="md">
          {/* Navbar column */}
          <Grid.Col span={{ base: 12, sm: 3, md: 2 }}>
            <NavbarSegmented/>
          </Grid.Col>

          {/* Main content column */}
          <Grid.Col span={{ base: 12, sm: 9, md: 10 }}>
            {children}
          </Grid.Col>
        </Grid>
      </Container>
    </EmployeeProvider>
  );
}
