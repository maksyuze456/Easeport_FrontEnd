import { Ticket, TicketStatus, TicketMessage } from "../types";
import { client } from "../../../lib/api/axiosClient";

export async function getTicketsByStatus(
  status: TicketStatus
): Promise<Ticket[]> {
  const { data } = await client.get(`/tickets/getAllByStatus/${status}`);
  return data as Ticket[];
}

export async function getTicketById(ticketId: number): Promise<Ticket> {
  const { data } = await client.get(`/tickets/${ticketId}`);
  return data as Ticket;
}

export async function getMyTickets(status: TicketStatus): Promise<Ticket[]> {
  const { data } = await client.get("/tickets/employeeTickets", {
    params: { status },
  });
  return data as Ticket[];
}

export async function assignTicket(ticketId: number): Promise<{ message: string }> {
  const { data } = await client.post(`/tickets/assign/${ticketId}`);
  return data as { message: string };
}

export async function setAnswer(
  answer: { message: string },
  ticketId: number
): Promise<{ message: string }> {
  const { data } = await client.post(`/tickets/setAnswer/${ticketId}`, answer);
  return data as { message: string };
}

export async function sendAnswer(
  ticketId: number,
  ticketMessageId?: number
): Promise<{ message: string }> {
  const url = ticketMessageId
    ? `/tickets/sendAnswer/${ticketId}/reply/${ticketMessageId}`
    : `/tickets/sendAnswer/${ticketId}`;

  const { data } = await client.post(url);
  return data as { message: string };
}

export async function closeTicket(ticketId: number): Promise<{ message: string }> {
  const { data } = await client.put(`/tickets/close/${ticketId}`);
  return data as { message: string };
}

export async function getConversation(ticketId: number): Promise<TicketMessage[]> {
  const { data } = await client.get(`/ticketMessages/getConversation/${ticketId}`);
  return data as TicketMessage[];
}
