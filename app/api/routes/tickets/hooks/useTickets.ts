import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyTicketsRq, getTicketsByStatusRq, assignTicketRq, getTicketByIdRq, setAnswerRq, sendAnswerRq, closeTicketRq } from "../tickets";
import { getConversation } from "../ticketConversation";
import { TicketStatus } from "../../../../_types/tickets";
import { Message } from "../../../../_types/message";






export function useTicketsRq() {

    const queryClient = useQueryClient();

    const getTicketsByStatus = (status: TicketStatus) =>
        useQuery({
            queryKey: ["tickets", status],
            queryFn: ({ queryKey }) => getTicketsByStatusRq(queryKey[1] as TicketStatus)
        });

    const getMyTicketsByStatus = (status: TicketStatus) =>
        useQuery({
            queryKey: ["myTickets", status],
            queryFn: ({ queryKey }) => getMyTicketsRq(queryKey[1] as TicketStatus)
        });

    const assignTicket = useMutation({
        mutationFn: (ticketId: number) => assignTicketRq(ticketId),
        onSuccess: (_, ticketId) => {
            queryClient.invalidateQueries({ queryKey: ["tickets"] });
            queryClient.invalidateQueries({ queryKey: ["myTickets"] });
            queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
        },
    });

    const setAnswer = useMutation({
        mutationFn: ({ answer, ticketId }: { answer: Message, ticketId: number }) => setAnswerRq(answer, ticketId),
        onSuccess: (_, { ticketId }) => {
            queryClient.invalidateQueries({ queryKey: ["tickets"] });
            queryClient.invalidateQueries({ queryKey: ["myTickets"] });
            queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
        },
    });

    const getTicketById = (ticketId: number) =>
        useQuery({
            queryKey: ["ticket", ticketId],
            queryFn: ({ queryKey }) => getTicketByIdRq(queryKey[1] as number)
        });

    const getConversationById = (ticketId: number) =>
        useQuery({
            queryKey: ["conversation", ticketId],
            queryFn: ({ queryKey }) => getConversation(queryKey[1] as number)
        });

    const sendAnswer = useMutation({
        mutationFn: ({ ticketId, ticketMessageId }: { ticketId: number; ticketMessageId?: number }) =>
            sendAnswerRq(ticketId, ticketMessageId),

        onSuccess: (_, { ticketId }) => {
            queryClient.invalidateQueries({ queryKey: ["conversation", ticketId] });
            queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
        },
    });

    const closeTicket = useMutation({
        mutationFn: ({ ticketId }: { ticketId: number }) => closeTicketRq(ticketId),

        onSuccess: (_, ticketId) => {
            queryClient.invalidateQueries({ queryKey: ["tickets"] });
            queryClient.invalidateQueries({ queryKey: ["myTickets"] });
            queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
            queryClient.invalidateQueries({ queryKey: ["conversation", ticketId] });
        },
    });



    return {
        getTicketsByStatus,
        getMyTicketsByStatus,
        getConversationById,
        getTicketById,
        setAnswer,
        assignTicket,
        sendAnswer,
        closeTicket
    }

}
