import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTicketsByStatusRq,
  getMyTicketsRq,
  getTicketByIdRq,
  assignTicketRq,
  setAnswerRq,
  sendAnswerRq,
  closeTicketRq,
} from "../tickets";
import { getConversation } from "../ticketConversation";
import { TicketStatus } from "../../../../_types/tickets";
import { Message } from "../../../../_types/message";

// ---------------------------
// Queries
// ---------------------------

export function useTicketsByStatus(status: TicketStatus) {
  return useQuery({
    queryKey: ["tickets", status],
    queryFn: () => getTicketsByStatusRq(status),
    staleTime: 60 * 1000
  });
}

export function useMyTickets(status: TicketStatus) {
  return useQuery({
    queryKey: ["myTickets", status],
    queryFn: () => getMyTicketsRq(status),
  });
}

export function useTicketById(ticketId: number) {
  return useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: () => getTicketByIdRq(ticketId),
    enabled: !!ticketId,
  });
}

export function useConversationById(ticketId: number) {
  return useQuery({
    queryKey: ["conversation", ticketId],
    queryFn: () => getConversation(ticketId),
    enabled: !!ticketId,
  });
}

// ---------------------------
// Mutations
// ---------------------------

export function useAssignTicket() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: assignTicketRq,
    onSuccess: (_, ticketId) => {
      qc.invalidateQueries({ queryKey: ["tickets"] });
      qc.invalidateQueries({ queryKey: ["myTickets"] });
      qc.invalidateQueries({ queryKey: ["ticket", ticketId] });
    },
  });
}

export function useSetAnswer() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ answer, ticketId }: { answer: Message; ticketId: number }) =>
      setAnswerRq(answer, ticketId),

    onSuccess: (_, { ticketId }) => {
      qc.invalidateQueries({ queryKey: ["tickets"] });
      qc.invalidateQueries({ queryKey: ["myTickets"] });
      qc.invalidateQueries({ queryKey: ["ticket", ticketId] });
    },
  });
}

export function useSendAnswer() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      ticketId,
      ticketMessageId,
    }: {
      ticketId: number;
      ticketMessageId?: number;
    }) => sendAnswerRq(ticketId, ticketMessageId),

    onSuccess: (_, { ticketId }) => {
      qc.invalidateQueries({ queryKey: ["conversation", ticketId] });
      qc.invalidateQueries({ queryKey: ["ticket", ticketId] });
    },
  });
}

export function useCloseTicket() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId }: { ticketId: number }) =>
      closeTicketRq(ticketId),

    onSuccess: (_, ticketId) => {
      qc.invalidateQueries({ queryKey: ["tickets"] });
      qc.invalidateQueries({ queryKey: ["myTickets"] });
      qc.invalidateQueries({ queryKey: ["ticket", ticketId] });
      qc.invalidateQueries({ queryKey: ["conversation", ticketId] });
    },
  });
}
