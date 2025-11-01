'use client';

import { useSearchParams, useRouter } from "next/navigation";
import { Group, Center, Button } from "@mantine/core";
import TicketsTable from "../_TicketsTable/TicketsTable";
import { TicketStatus, useTickets } from '../../../_context/TicketProvider';
import { useEffect } from 'react';
import {
  IconPencil
} from '@tabler/icons-react';

export default function MyTicketsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const rawStatus = searchParams.get("status");
    const validStatuses: TicketStatus[] = ['Open', 'Reviewing', 'Closed'];
    const { myTickets, refetchMyTickets } = useTickets();


    const status: TicketStatus = 
        rawStatus && validStatuses.includes(rawStatus as TicketStatus)
    ? (rawStatus as TicketStatus)
    : 'Reviewing';

    useEffect(() => {
        refetchMyTickets(status);
    }, [status]);


    const handleUpdate = async () => {
        await refetchMyTickets(status);
        router.push("/dashboard/employee/my_tickets");
    };


    return(
        <div style={{ padding: "16px" }}>
      <Group mb="md">
        
        <Button
          variant="default"
          onClick={() => router.push("/dashboard/employee/my_tickets?status=Reviewing")}
        >
          Reviewing
        </Button>
        <Button
          variant="default"
          onClick={() => router.push("/dashboard/employee/my_tickets?status=Closed")}
        >
          Closed
        </Button>
      </Group>

      <Center>
        {status === 'Reviewing' && (
          <TicketsTable 
          ticketStatus={status} 
          onUpdate={handleUpdate} 
          myTickets={myTickets}
          menuActions={[
            { label: "Details", icon: <IconPencil size={16} />, onClick: (ticket) => {
              router.push(`/dashboard/employee/tickets/${ticket.id}`);
            } }
          ]}
          />
        )}
        {status === 'Closed' && (
          <TicketsTable ticketStatus={status} onUpdate={handleUpdate} myTickets={myTickets}
          menuActions={[
            { label: "Details", icon: <IconPencil size={16} />, onClick: (ticket) => {
              router.push(`/dashboard/employee/tickets/${ticket.id}`);
            } }
          ]}
          />
        )}
      </Center>
    </div>
    );
}