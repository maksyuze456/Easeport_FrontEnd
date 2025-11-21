"use client";

import { TicketConversationProvider } from "../../_context/TicketConversationProvider";
import { TicketProvider } from "../../_context/TicketProvider";
import { WebSocketContextProvider } from "../../_context/WebSocketContextProvider";

type EmployeeLayoutProps = {
  children: React.ReactNode;
};
export default function EmployeeLayout({ children }: EmployeeLayoutProps) {
  return (
    <WebSocketContextProvider>
      <TicketProvider>
        <TicketConversationProvider>{children}</TicketConversationProvider>
      </TicketProvider>
    </WebSocketContextProvider>
  );
}
