import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTicketsByStatus,
  getMyTickets,
  getTicketById,
  assignTicket,
  setAnswer,
  sendAnswer,
  closeTicket,
  getConversation,
} from "../api/tickets";
import { TicketStatus } from "../types";

// ---------------------------
// Queries
// ---------------------------

export function useTicketsByStatus(status: TicketStatus) {
  return useQuery({
    queryKey: ["tickets", status],
    queryFn: () => getTicketsByStatus(status),
    staleTime: 60 * 1000,
  });
}

export function useMyTickets(status: TicketStatus) {
  return useQuery({
    queryKey: ["myTickets", status],
    queryFn: () => getMyTickets(status),
    staleTime: 60 * 1000,
  });
}

export function useTicketById(ticketId: number) {
  return useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: () => getTicketById(ticketId),
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
    mutationFn: assignTicket,
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
    mutationFn: ({ answer, ticketId }: { answer: { message: string }; ticketId: number }) =>
      setAnswer(answer, ticketId),

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
    }) => sendAnswer(ticketId, ticketMessageId),

    onSuccess: (_, { ticketId }) => {
      qc.invalidateQueries({ queryKey: ["conversation", ticketId] });
      qc.invalidateQueries({ queryKey: ["ticket", ticketId] });
    },
  });
}

export function useCloseTicket() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId }: { ticketId: number }) => closeTicket(ticketId),

    onSuccess: (_, { ticketId }) => {
      qc.invalidateQueries({ queryKey: ["tickets"] });
      qc.invalidateQueries({ queryKey: ["myTickets"] });
      qc.invalidateQueries({ queryKey: ["ticket", ticketId] });
      qc.invalidateQueries({ queryKey: ["conversation", ticketId] });
    },
  });
}
