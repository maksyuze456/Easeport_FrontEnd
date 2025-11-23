'use client';

import { useSearchParams, useRouter } from "next/navigation";
import { Group, Center, Button } from "@mantine/core";
import TicketsTable from "../_TicketsTable/TicketsTable";
import { TicketStatus } from "../../../_types/tickets";
import {
  IconPencil
} from '@tabler/icons-react';
import { useMyTickets } from "../../../api/routes/tickets/hooks/useTicketQueries";

export default function MyTicketsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawStatus = searchParams.get("status");
  const validStatuses: TicketStatus[] = ['Open', 'Reviewing', 'Closed'];

  
  const status: TicketStatus =
  rawStatus && validStatuses.includes(rawStatus as TicketStatus)
  ? (rawStatus as TicketStatus)
  : 'Reviewing';


  const myTicketsQuery = useMyTickets(status);
    const { data, isLoading, refetch } = myTicketsQuery;

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
            data={data}
            isLoading={isLoading}
            onUpdate={handleUpdate}
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
          <TicketsTable ticketStatus={status} onUpdate={handleUpdate} isLoading={isLoading} data={data}
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