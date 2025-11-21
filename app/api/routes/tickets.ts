// api/tickets.ts

import { Ticket, TicketStatus } from "../../_types/tickets";
import { Message } from "../../_types/message";
import { client } from "../client";
import { normalizeResponse, ApiResult } from "../utils/response";

export async function getTicketsByStatus(
    status: TicketStatus
): Promise<ApiResult<Ticket[]>> {
    const { data } = await client.get(`/tickets/getAllByStatus/${status}`);
    return normalizeResponse<Ticket[]>(data);
}

export async function getTicketById(
    ticketId: number
): Promise<ApiResult<Ticket>> {
    const { data } = await client.get(`/tickets/${ticketId}`);
    return normalizeResponse<Ticket>(data);
}

export async function getMyTickets(
    status: TicketStatus
): Promise<ApiResult<Ticket[]>> {
    const { data } = await client.get("/tickets/employeeTickets", {
        params: { status },
    });
    return normalizeResponse<Ticket[]>(data);
}

export async function assignTicket(
    ticketId: number
): Promise<ApiResult<Message>> {
    const { data } = await client.post(`/tickets/assign/${ticketId}`);
    return normalizeResponse<Message>(data);
}

export async function setAnswer(
    answer: Message,
    ticketId: number
): Promise<ApiResult<Message>> {
    const { data } = await client.post(`/tickets/setAnswer/${ticketId}`, answer);
    return normalizeResponse<Message>(data);
}

export async function sendAnswer(
    ticketId: number,
    ticketMessageId?: number
): Promise<ApiResult<Message>> {
    const url = ticketMessageId
        ? `/tickets/sendAnswer/${ticketId}/reply/${ticketMessageId}`
        : `/tickets/sendAnswer/${ticketId}`;

    const { data } = await client.post(url);
    return normalizeResponse<Message>(data);
}

export async function closeTicket(
    ticketId: number
): Promise<ApiResult<Message>> {
    const { data } = await client.put(`/tickets/close/${ticketId}`);
    return normalizeResponse<Message>(data);
}
