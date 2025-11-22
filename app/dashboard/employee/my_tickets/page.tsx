'use client';

import { useSearchParams, useRouter } from "next/navigation";
import { Group, Center, Button } from "@mantine/core";
import TicketsTable from "../_TicketsTable/TicketsTable";
import { TicketStatus } from "../../../_types/tickets";
import {
  IconPencil
} from '@tabler/icons-react';
import { useTicketsRq } from "../../../api/routes/tickets/hooks/useTickets";

export default function MyTicketsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawStatus = searchParams.get("status");
  const validStatuses: TicketStatus[] = ['Open', 'Reviewing', 'Closed'];
  const { getMyTicketsByStatus } = useTicketsRq();
  
  const status: TicketStatus =
  rawStatus && validStatuses.includes(rawStatus as TicketStatus)
  ? (rawStatus as TicketStatus)
  : 'Reviewing';

  const { data, isLoading, refetch } = getMyTicketsByStatus(status);


  const handleUpdate = async () => {
    refetch();
    router.push("/dashboard/employee/my_tickets");
  };


  return (
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
            myTickets={data}
            menuActions={[
              {
                label: "Details", icon: <IconPencil size={16} />, onClick: (ticket) => {
                  router.push(`/dashboard/employee/tickets/${ticket.id}`);
                }
              }
            ]}
          />
        )}
        {status === 'Closed' && (
          <TicketsTable ticketStatus={status} onUpdate={handleUpdate} myTickets={data}
            menuActions={[
              {
                label: "Details", icon: <IconPencil size={16} />, onClick: (ticket) => {
                  router.push(`/dashboard/employee/tickets/${ticket.id}`);
                }
              }
            ]}
          />
        )}
      </Center>
    </div>
  );
}