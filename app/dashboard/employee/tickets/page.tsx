'use client';

import { useSearchParams, useRouter } from "next/navigation";
import { Group, Center, Button } from "@mantine/core";
import TicketsTable from "../_TicketsTable/TicketsTable";
import { TicketStatus, useTickets } from '../../../_context/TicketProvider';
import { useEffect } from 'react';
import { useTicketWebSocket } from "@/app/_hooks/useTicketWebSocket";
import { useAssignTicketWebSocket } from "@/app/_hooks/useAssignTicketWebSocket";

export default function TicketsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const rawStatus = searchParams.get("status");
    const validStatuses: TicketStatus[] = ['Open', 'Reviewing', 'Closed'];
    const { refetch } = useTickets();


    const status: TicketStatus = 
        rawStatus && validStatuses.includes(rawStatus as TicketStatus)
    ? (rawStatus as TicketStatus)
    : 'Open';

    useEffect(() => {
        refetch(status);
    }, [status]);

    const { isConnected: isTicketConnected } = useTicketWebSocket(() => {
      console.log("New ticket arrived boi.");
      refetch('Open');
    })
    const { isConnected: isAssignConnected } = useAssignTicketWebSocket(() => {
      console.log("Someone assigned ticket")
      refetch('Open');
    });


    const handleWhenTicketAssigned = async () => {
        await refetch(status);
        router.push("/dashboard/employee/tickets");
    };


    return(
        <div style={{ padding: "16px" }}>
      <Group mb="md">
        
        <Button
          variant="default"
          onClick={() => router.push("/dashboard/employee/tickets?status=Open")}
        >
          Open
        </Button>
        <Button
          variant="default"
          onClick={() => router.push("/dashboard/employee/tickets?status=Closed")}
        >
          Closed
        </Button>
      </Group>

      <Center>
        {status === 'Open' && (
          <TicketsTable ticketStatus={status} onUpdate={handleWhenTicketAssigned}/>
        )}
        {status === 'Closed' && (
          <TicketsTable ticketStatus={status} onUpdate={handleWhenTicketAssigned}/>
        )}
      </Center>
    </div>
    );
}