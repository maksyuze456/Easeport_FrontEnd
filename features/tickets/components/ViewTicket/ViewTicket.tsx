'use client';

import { Ticket } from "../../types";
import {
  Badge,
  Table,
  Text,
} from "@mantine/core";

import {
  priorityColors,
  ticketStatusColors,
} from "../TicketsTable/TicketsTable";

export default function ViewTicket({
  ticket,
}: {
  ticket: Ticket;
  userId?: number;
  onSuccess?: (res: { message: string }) => void;
  onCloseTicket?: (res: { message: string }) => void;
}) {
  return (
    <Table.ScrollContainer minWidth={400}>
      <Table
        horizontalSpacing="xs"
        verticalSpacing="xs"
        style={{ tableLayout: "fixed" }}
      >
        <colgroup>
          <col style={{ width: "400px" }} />
          <col />
        </colgroup>

        <Table.Tbody>
          {/* Subject */}
          <Table.Tr>
            <Table.Td>
              <Text fz="sm" fw={500}>
                Subject
              </Text>
            </Table.Td>
            <Table.Td>
              <Text fz="sm">{ticket.subject}</Text>
            </Table.Td>
          </Table.Tr>

          {/* Sender */}
          <Table.Tr>
            <Table.Td>
              <Text fz="sm" fw={500}>
                Sender
              </Text>
            </Table.Td>
            <Table.Td>
              <Text fz="sm">{ticket.from}</Text>
            </Table.Td>
          </Table.Tr>

          {/* Name */}
          <Table.Tr>
            <Table.Td>
              <Text fz="sm" fw={500}>
                Name
              </Text>
            </Table.Td>
            <Table.Td>
              <Text fz="sm">{ticket.name}</Text>
            </Table.Td>
          </Table.Tr>

          {/* Type */}
          <Table.Tr>
            <Table.Td>
              <Text fz="sm" fw={500}>
                Type
              </Text>
            </Table.Td>
            <Table.Td>
              <Text fz="sm">{ticket.type}</Text>
            </Table.Td>
          </Table.Tr>

          {/* Queue */}
          <Table.Tr>
            <Table.Td>
              <Text fz="sm" fw={500}>
                Queue
              </Text>
            </Table.Td>
            <Table.Td>
              <Text fz="sm">{ticket.queueType}</Text>
            </Table.Td>
          </Table.Tr>

          {/* Priority */}
          <Table.Tr>
            <Table.Td>
              <Text fz="sm" fw={500}>
                Priority
              </Text>
            </Table.Td>
            <Table.Td>
              <Badge
                color={priorityColors[ticket.priority.toLowerCase()]}
                variant="light"
              >
                {ticket.priority}
              </Badge>
            </Table.Td>
          </Table.Tr>

          {/* Status */}
          <Table.Tr>
            <Table.Td>
              <Text fz="sm" fw={500}>
                Status
              </Text>
            </Table.Td>
            <Table.Td>
              <Badge
                color={ticketStatusColors[ticket.status.toLowerCase()]}
                variant="light"
              >
                {ticket.status}
              </Badge>
            </Table.Td>
          </Table.Tr>

          {/* Body */}
          <Text fz="sm" ml="xs" mt="xs" fw={500}>
            Body
          </Text>
          <Table.Tr>
            <Table.Td>
              <Text fz="sm">{ticket.body}</Text>
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
