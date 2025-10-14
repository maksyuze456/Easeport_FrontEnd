'use client';

import { useForm } from "@mantine/form";
import { Answer, Message, Ticket, useTickets, } from "../../../../_context/TicketProvider";
import { Badge, Table, Text, Textarea , Flex, Button } from '@mantine/core';
import { priorityColors, ticketStatusColors } from "../../_TicketsTable/TicketsTable";
import { IconX, IconCheck } from '@tabler/icons-react';
import { useRouter } from "next/navigation";
import { useState } from 'react';


export default function ViewTicket({
    ticket, userId, onSuccess, onCloseTicket
}: {
    ticket: Ticket, 
    userId?: number,
    onSuccess?: (res: Answer) => void;
    onCloseTicket?: (res: Message) => void;  
}) {
  const router = useRouter();
  const { setAnswer, refetchSingleTicket, closeTicket } = useTickets();
  const checkIcon = <IconCheck size={20} />;
  const xIcon = <IconX size={20} />;
  const isClosed = ticket.status?.toLowerCase() === 'closed';

  const form = useForm({
    mode: 'controlled',
    initialValues: {
      message: ticket.answer || ""
    }
  });

  const handleSubmit = async (values: typeof form.values, e?: React.FormEvent) => {
    e?.preventDefault();
    if (isClosed) return;
    try {
      const answer: Answer = form.getValues();
      const resMessage = await setAnswer(answer, ticket.id);
      refetchSingleTicket(ticket.id);

      if(onSuccess) {
        onSuccess(resMessage);
      }

    } catch (err) {
      console.log(err);
    }
  };

  const handleCloseTicket = async(ticketId: number) => {

    try {
        const res = await closeTicket(ticketId);

        refetchSingleTicket(ticketId);

        if(onCloseTicket) {
            onCloseTicket(res);
        }


    } catch(err) {
        console.log(err as Message);
    }
    
  };

  let row;

  if (ticket) {
    row = () => (
    <>
      <Table.Tr>
        <Table.Td>
          <Text fz="sm" fw={500}>Subject</Text>
        </Table.Td>
        <Table.Td>
            <Text fz="sm">{ticket.subject}</Text>
        </Table.Td>
      </Table.Tr>
      <Table.Tr>
        <Table.Td>
          <Text fz="sm" fw={500}>Sender</Text>
        </Table.Td>
        <Table.Td>
          <Text fz="sm">{ticket.from}</Text>
        </Table.Td>
      </Table.Tr>
      <Table.Tr>
        <Table.Td>
          <Text fz="sm" fw={500}>Name</Text>
        </Table.Td>
        <Table.Td>
          <Text fz="sm">{ticket.name}</Text>
        </Table.Td>
      </Table.Tr>
      <Table.Tr>
        <Table.Td>
          <Text fz="sm" fw={500}>Type</Text>
        </Table.Td>
        <Table.Td>
          <Text fz="sm">{ticket.type}</Text>
        </Table.Td>
      </Table.Tr>
      <Table.Tr>
        <Table.Td>
          <Text fz="sm" fw={500}>Queue</Text>
        </Table.Td>
        <Table.Td>
          <Text fz="sm">{ticket.queueType}</Text>
        </Table.Td>
      </Table.Tr>
      <Table.Tr>
        <Table.Td>
          <Text fz="sm" fw={500}>Priority</Text>
        </Table.Td>
        <Table.Td>
          <Badge color={priorityColors[ticket.priority.toLowerCase()]} variant="light">
            {ticket.priority}
          </Badge>
        </Table.Td>
      </Table.Tr>
      <Table.Tr>
        <Table.Td>
          <Text fz="sm" fw={500}>Status</Text>
        </Table.Td>
        <Table.Td>
          <Badge color={ticketStatusColors[ticket.status.toLowerCase()]} variant="light">
            {ticket.status}
          </Badge>
        </Table.Td>
      </Table.Tr>
      <Text fz="sm" ml={"xs"} mt={"xs"} fw={500}>Body</Text>
      <Table.Tr>
        <Table.Td >
          <Text fz="sm">{ticket.body}</Text>
        </Table.Td>
      </Table.Tr>
      <Text fz="sm" ml={"xs"} mt={"xs"} fw={500}>Answer</Text>
      <Table.Tr>
        <Table.Td colSpan={2}>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Textarea
                styles={{
                    input: { 
                    width: "100%", 
                    height: "200px",
                    resize: "vertical" // optional: allow vertical resizing
                    },
                    wrapper: { 
                    width: "100%" 
                    }
                }}
                required
                placeholder="Enter answer"
                key={form.key('message')}
                {...form.getInputProps('message')}
                disabled={isClosed}
                />
                <Flex
                    justify="space-around"
                >
                    <Button type="submit"  mt="xl" size="s" radius="md" disabled={isClosed}>
                    Update
                    </Button>
                    <Button
                        variant="default" 
                        mt="xl" 
                        size="s" 
                        radius="md"
                        color="black"
                        onClick={() => handleCloseTicket(ticket.id)}
                        disabled={isClosed}
                        >
                    Close
                    </Button>
                </Flex>
            </form>
        </Table.Td>
      </Table.Tr>
    </>
  );} else {
    row = () => (
        <Table.Tr>
            <Table.Td>
                <Text fz="sm" fw={500}>Nothing to view</Text>
            </Table.Td>
        </Table.Tr>
    );
  }

  return (
    <>
      <Table.ScrollContainer minWidth={400}>
        <Table horizontalSpacing="xs" verticalSpacing="xs" style={{ tableLayout: 'fixed' }}>
            <colgroup>
                <col style={{ width: '400px' }} />
                <col />
            </colgroup>
          <Table.Tbody>
            {row()}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </>
  );
}
