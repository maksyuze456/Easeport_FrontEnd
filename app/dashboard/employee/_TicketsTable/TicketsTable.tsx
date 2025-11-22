"use client";

import {
  IconDots,
  IconPencil,
  IconBriefcase2,
} from "@tabler/icons-react";
import {
  ActionIcon,
  Badge,
  Group,
  Menu,
  Table,
  Text,
} from "@mantine/core";

import { Ticket, TicketStatus } from "../../../_types/tickets";
import { useWebSocket } from "../../../_context/WebSocketContextProvider";
import { useTicketsRq } from "../../../api/routes/tickets/hooks/useTickets";
import { useEffect } from "react";

type TicketsTableProps = {
  ticketStatus: TicketStatus;
  myTickets?: Ticket[] | null;
  onUpdate: () => void;
  menuActions?: {
    label: string;
    icon: React.ReactNode;
    onClick: (ticket: Ticket) => void;
  }[];
};

export const priorityColors: Record<string, string> = {
  high: "red",
  medium: "orange",
  low: "yellow",
};

export const ticketStatusColors: Record<string, string> = {
  open: "green",
  closed: "grey",
  reviewing: "yellow",
};

export default function TicketsTable({
  ticketStatus,
  myTickets,
  onUpdate,
  menuActions,
}: TicketsTableProps) {
  const { subscribe } = useWebSocket();
  const { getTicketsByStatus, assignTicket } = useTicketsRq();

  const { data, isLoading, refetch } = getTicketsByStatus(ticketStatus);

  // websocket triggers refresh
  // invalidate or refetch → both work, we'll keep refetch since you already use it
  useEffect(() => {
    subscribe("/topic/new-ticket", () => refetch());
    subscribe("/topic/assign", () => refetch());
  }, []);

  const ticketsToShow = myTickets ?? data ?? [];

  if (isLoading) return <div>Loading...</div>;

  const rows = ticketsToShow.map((ticket) => (
    <Table.Tr key={ticket.id}>
      <Table.Td>
        <Group gap="sm">
          <div>
            <Text fz="sm" fw={500}>{ticket.subject}</Text>
            <Text c="dimmed" fz="xs">subject</Text>
          </div>
        </Group>
      </Table.Td>

      <Table.Td>
        <Text fz="sm">{ticket.from}</Text>
        <Text fz="xs" c="dimmed">sender</Text>
      </Table.Td>

      <Table.Td>
        <Text fz="sm">{ticket.type}</Text>
        <Text fz="xs" c="dimmed">type</Text>
      </Table.Td>

      <Table.Td>
        <Text fz="sm">{ticket.queueType}</Text>
        <Text fz="xs" c="dimmed">queue</Text>
      </Table.Td>

      <Table.Td>
        <Badge color={priorityColors[ticket.priority.toLowerCase()]} variant="light">
          {ticket.priority}
        </Badge>
        <Text fz="xs" c="dimmed">priority</Text>
      </Table.Td>

      <Table.Td>
        <Badge color={ticketStatusColors[ticket.status.toLowerCase()]} variant="light">
          {ticket.status}
        </Badge>
        <Text fz="xs" c="dimmed">status</Text>
      </Table.Td>

      <Table.Td>
        <Group gap={0} justify="flex-end">
          <ActionIcon variant="subtle" color="gray">
            <IconPencil size={16} stroke={1.5} />
          </ActionIcon>

          <Menu transitionProps={{ transition: "pop" }} withArrow position="bottom-end" withinPortal>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray">
                <IconDots size={16} stroke={1.5} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              {(
                menuActions ?? [
                  {
                    label: "Accept ticket",
                    icon: <IconBriefcase2 size={16} />,
                    onClick: () => {
                      assignTicket.mutate(ticket.id, {
                        onSuccess: () => onUpdate(),
                      });
                    },
                  },
                ]
              ).map((action) => (
                <Menu.Item
                  key={action.label}
                  leftSection={action.icon}
                  onClick={() => action.onClick(ticket)}
                >
                  {action.label}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Table.ScrollContainer minWidth={800}>
      <Table verticalSpacing="md">
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}