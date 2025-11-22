'use client';

import { useSearchParams, useRouter } from "next/navigation";
import { Group, Center, Button } from "@mantine/core";
import TicketsTable from "../_TicketsTable/TicketsTable";
import { TicketStatus } from "../../../_types/tickets";
import { useTicketsRq } from "../../../api/routes/tickets/hooks/useTickets";

export default function TicketsPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { getTicketsByStatus } = useTicketsRq();

  // derive status from URL
  const rawStatus = params.get("status");
  const valid: TicketStatus[] = ["Open", "Reviewing", "Closed"];

  const status: TicketStatus =
    rawStatus && valid.includes(rawStatus as TicketStatus)
      ? (rawStatus as TicketStatus)
      : "Open";

  // query for tickets automatically re-fetches when `status` changes
  const { data, isLoading, refetch } = getTicketsByStatus(status);

  // called only when ticket is assigned
  const handleWhenTicketAssigned = () => {
    // mutation already invalidates -> this refetch is optional
    refetch();
    router.push(`/dashboard/employee/tickets?status=${status}`);
  };

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
            ticketStatus={status}
            onUpdate={handleWhenTicketAssigned}
          />
        )}
      </Center>
    </div>
  );
}
