'use client';


import { TicketConversationProvider } from '../../_context/TicketConversationProvider';
import { TicketProvider } from '../../_context/TicketProvider';


type EmployeeLayoutProps = {
    children: React.ReactNode;
}
export default function EmployeeLayout({children}: EmployeeLayoutProps) {
    return (
        <TicketProvider>
            <TicketConversationProvider>
            {children}
            </TicketConversationProvider>
        </TicketProvider>
    )
}