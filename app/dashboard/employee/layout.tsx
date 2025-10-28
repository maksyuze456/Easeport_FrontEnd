'use client';

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