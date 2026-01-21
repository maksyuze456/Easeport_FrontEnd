import { useEffect } from "react"
import { useWebSocket } from "../_context/WebSocketContextProvider"
import { useQueryClient } from "@tanstack/react-query"
import {
  getMyTicketsRq,
  getTicketsByStatusRq,
} from "../api/routes/tickets/tickets"
import { getConversation } from "../api/routes/tickets/ticketConversation"
import { Message } from "../_types/message"
import { useNotifications } from "../api/routes/notifications/hooks/useNotificationsQueries"

export function useDashboardWsSubscriptions(userId?: number) {
  const { subscribe } = useWebSocket()
  const queryClient = useQueryClient()
  const { refetch: refetchNotifications } = useNotifications(userId)

  useEffect(() => {
    if (!userId) return

    const unsubscribers = [
      subscribe("/topic/new-ticket", () => {
        queryClient.invalidateQueries({ queryKey: ["tickets", "Open"] })
        queryClient.fetchQuery({
          queryKey: ["tickets", "Open"],
          queryFn: () => getTicketsByStatusRq("Open"),
        })
      }),

      subscribe("/topic/assign", () => {
        queryClient.invalidateQueries({ queryKey: ["tickets", "Open"] })
        queryClient.fetchQuery({
          queryKey: ["tickets", "Open"],
          queryFn: () => getTicketsByStatusRq("Open"),
        })
      }),

      subscribe("/user/queue/assign", () => {
        queryClient.invalidateQueries({ queryKey: ["myTickets", "Reviewing"] })
        queryClient.fetchQuery({
          queryKey: ["myTickets", "Reviewing"],
          queryFn: () => getMyTicketsRq("Reviewing"),
        })
      }),

      subscribe("/user/queue/notifications", (msg) => {
        const message: Message = JSON.parse(msg)
        queryClient.invalidateQueries({
          queryKey: ["notifications", userId],
        })
        refetchNotifications()
      }),

      subscribe("/user/queue/ticket-messages", (msg) => {
        const message: Message = JSON.parse(msg)
        const ticketId = Number.parseInt(message.message)

        queryClient.invalidateQueries({
          queryKey: ["conversation", ticketId],
        })
        queryClient.fetchQuery({
          queryKey: ["conversation", ticketId],
          queryFn: () => getConversation(ticketId),
        })
      }),
    ]

    return () => {
      unsubscribers.forEach((unsub) => unsub())
    }
  }, [userId, subscribe, queryClient, refetchNotifications])
}
