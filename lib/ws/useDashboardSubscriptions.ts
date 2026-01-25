"use client"

import { useEffect } from "react"
import { useWebSocket } from "../../context/WebSocketContext"
import { useQueryClient } from "@tanstack/react-query"
import { Message } from "../../app/_types/message"
import { getConversation } from "../../app/api/routes/tickets/ticketConversation"

export function useDashboardWsSubscriptions(userId?: number) {
    const { subscribe, disconnect } = useWebSocket()
    const queryClient = useQueryClient()

    useEffect(() => {
        if (!userId) return

        const unsubs = [
            subscribe("/topic/new-ticket", () => {
                queryClient.invalidateQueries({ queryKey: ["tickets", "Open"] })
            }),
            subscribe("/topic/assign", () => {
                queryClient.invalidateQueries({ queryKey: ["tickets", "Open"] })
            }),

            subscribe("/user/queue/assign", () => {
                queryClient.invalidateQueries({ queryKey: ["myTickets", "Reviewing"] })
                queryClient.refetchQueries({ queryKey: ["myTickets", "Reviewing"] })
            }),

            subscribe("/user/queue/notifications", () => {
                queryClient.invalidateQueries({
                    queryKey: ["notifications", userId],
                })
            }),
            subscribe("/user/queue/ticket-messages", (msg) => {
                const message: Message = JSON.parse(msg)
                const ticketId = Number.parseInt(message.message)

                queryClient.invalidateQueries({
                    queryKey: ["conversation", ticketId],
                })
                queryClient.refetchQueries({ queryKey: ["conversation", ticketId] })
            })
        ]

        return () => {
            unsubs.forEach((u) => u())
        }
    }, [userId])
}