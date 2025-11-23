'use client';

import { useSearchParams, useRouter } from "next/navigation";
import { Group, Center, Button } from "@mantine/core";
import TicketsTable from "../_TicketsTable/TicketsTable";
import { TicketStatus } from "../../../_types/tickets";
import { useTicketsByStatus, useAssignTicket } from "../../../api/routes/tickets/hooks/useTicketQueries";
import { useWebSocket } from "../../../_context/WebSocketContextProvider";
import { useEffect } from "react";
import { Message } from "../../../_types/message";

export default function TicketsPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { subscribe } = useWebSocket();
  // derive status from URL
  const rawStatus = params.get("status");
  const valid: TicketStatus[] = ["Open", "Reviewing", "Closed"];


  const status: TicketStatus =
    rawStatus && valid.includes(rawStatus as TicketStatus)
      ? (rawStatus as TicketStatus)
      : "Open";

  const ticketsQuery = useTicketsByStatus(status);
  const { data, isLoading, refetch } = ticketsQuery;
  const assignMutation = useAssignTicket();

  const handleAssign = async (ticketId: number) => {

    const res: Message = await assignMutation.mutateAsync(ticketId)
    console.log(res.message);

  };
  // Web socket subscriptions
  /*  
  useEffect(() => {
    subscribe("/topic/new-ticket", () => refetch());
    subscribe("/topic/assign", () => refetch());
  }, []);
  
  */


  return (
    <div style={{ padding: "16px" }}>
      <Group mb="md">
        <Button
          variant="default"
          onClick={() =>
            router.push("/dashboard/employee/tickets?status=Open")
          }
        >
          Open
        </Button>

        <Button
          variant="default"
          onClick={() =>
            router.push("/dashboard/employee/tickets?status=Closed")
          }
        >
          Closed
        </Button>
      </Group>

      <Center>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <TicketsTable
            data={data}
            isLoading={isLoading}
            onAssign={handleAssign}
          />
        )}
      </Center>
    </div>
  );
}
