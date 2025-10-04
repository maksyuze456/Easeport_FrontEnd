'use client';

import { Container, Grid } from '@mantine/core';
import { NavbarSimple } from '../../_components/NavbarSimple/NavbarSimple';
import { AuthProvider } from '../../_context/AuthProvider';
import { TicketProvider } from '../../_context/TicketProvider';


type EmployeeLayoutProps = {
    children: React.ReactNode;
}

export default function EmployeeLayout({children}: EmployeeLayoutProps) {
    return (
        <TicketProvider>
            {children}
        </TicketProvider>
    )
}