"use client";

import { TicketProvider } from "../../_context/TicketProvider";
import { WebSocketContextProvider } from "../../_context/WebSocketContextProvider";

type EmployeeLayoutProps = {
  children: React.ReactNode;
};
export default function EmployeeLayout({ children }: EmployeeLayoutProps) {
  return (
    <WebSocketContextProvider>
      <TicketProvider>
        {children}
      </TicketProvider>
    </WebSocketContextProvider>
  );
}
