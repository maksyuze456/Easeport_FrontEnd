// api/tickets.ts

import { Ticket, TicketStatus } from "../../../_types/tickets";
import { Message } from "../../../_types/message";
import { client } from "../../client";
import { normalizeResponse, ApiResult } from "../../utils/response";

export async function getTicketsByStatus(
    status: TicketStatus
): Promise<ApiResult<Ticket[]>> {
    const { data } = await client.get(`/tickets/getAllByStatus/${status}`);
    return normalizeResponse<Ticket[]>(data);
}

export async function getTicketsByStatusRq(
    status: TicketStatus
): Promise<Ticket[]> {
    const { data } = await client.get(`/tickets/getAllByStatus/${status}`);
    return <Ticket[]>(data);
}

export async function getTicketById(
    ticketId: number
): Promise<ApiResult<Ticket>> {
    const { data } = await client.get(`/tickets/${ticketId}`);
    return normalizeResponse<Ticket>(data);
}

export async function getTicketByIdRq(
    ticketId: number
): Promise<Ticket> {
    const { data } = await client.get(`/tickets/${ticketId}`);
    return <Ticket>(data);
}

export async function getMyTickets(
    status: TicketStatus
): Promise<ApiResult<Ticket[]>> {
    const { data } = await client.get("/tickets/employeeTickets", {
        params: { status },
    });
    return normalizeResponse<Ticket[]>(data);
}

export async function getMyTicketsRq(
    status: TicketStatus
): Promise<Ticket[]> {
    const { data } = await client.get("/tickets/employeeTickets", {
        params: { status },
    });
    return <Ticket[]>(data);
}

export async function assignTicket(
    ticketId: number
): Promise<ApiResult<Message>> {
    const { data } = await client.post(`/tickets/assign/${ticketId}`);
    return normalizeResponse<Message>(data);
}

export async function assignTicketRq(
    ticketId: number
): Promise<Message> {
    const { data } = await client.post(`/tickets/assign/${ticketId}`);
    return data as Message;
}

export async function setAnswer(
    answer: Message,
    ticketId: number
): Promise<ApiResult<Message>> {
    try {
        const response = await client.post(`/tickets/setAnswer/${ticketId}`, answer);
        return normalizeResponse<Message>(response.data, response.status);
    } catch (err: any) {
        return normalizeResponse<Message>(
            err.response?.data,
            err.response?.status
        );
    }
}

export async function setAnswerRq(
    answer: Message,
    ticketId: number
): Promise<Message> {

        const { data } = await client.post(`/tickets/setAnswer/${ticketId}`, answer);
        return <Message>(data);

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

export async function sendAnswerRq(
    ticketId: number,
    ticketMessageId?: number
): Promise<Message> {
    const url = ticketMessageId
        ? `/tickets/sendAnswer/${ticketId}/reply/${ticketMessageId}`
        : `/tickets/sendAnswer/${ticketId}`;

    const { data } = await client.post(url);
    return <Message>(data);
}

export async function closeTicket(
    ticketId: number
): Promise<ApiResult<Message>> {
    const { data } = await client.put(`/tickets/close/${ticketId}`);
    return normalizeResponse<Message>(data);
}

export async function closeTicketRq(
    ticketId: number
): Promise<Message> {
    const { data } = await client.put(`/tickets/close/${ticketId}`);
    return <Message>(data);
}
