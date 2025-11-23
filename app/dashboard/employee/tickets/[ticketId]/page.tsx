'use client';

import React, { useEffect, useState } from "react";
import {
  Center,
  Notification,
  Text,
  Button,
  Box,
  LoadingOverlay,
} from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { createPortal } from "react-dom";
import { useParams, useRouter } from "next/navigation";

import { useAuthContext } from "../../../../_context/AuthProvider";
import { useWebSocket } from "../../../../_context/WebSocketContextProvider";

import ViewTicket from "./ViewTicket";
import ConversationTable from "./ViewConversation";

import {
  useTicketById,
  useConversationById,
  useCloseTicket,
  useSetAnswer,
  useSendAnswer,
} from "../../../../api/routes/tickets/hooks/useTicketQueries";

import { Answer, Message } from "../../../../_types/message";

export default function ViewTicketPage() {
  const params = useParams();
  const ticketId = Number(params.ticketId);
  const router = useRouter();
  const { subscribe } = useWebSocket();
  const { data: loggedInUser, isLoading: authLoading } = useAuthContext();

  const [responseMessage, setResponseMessage] = useState<Message | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  // Queries
  const {
    data: ticket,
    isLoading: isTicketLoading,
    refetch: refetchTicket,
  } = useTicketById(ticketId);

  const {
    data: conversation,
    isLoading: isConversationLoading,
    refetch: refetchConversation,
  } = useConversationById(ticketId);

  // Mutations
  const setAnswerMutation = useSetAnswer();
  const sendAnswerMutation = useSendAnswer();
  const closeTicketMutation = useCloseTicket();

  // WebSocket refresh
  useEffect(() => {
    const unsub = subscribe(`/user/queue/ticket-messages`, () => {
      if (!Number.isNaN(ticketId)) {
        refetchConversation();
      }
    });
    return unsub;
  }, [ticketId, subscribe, refetchConversation]);

  // Unified notification
  const pushNotification = (message: Message) => {
    setResponseMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  // Mutation wrappers
  const handleSendAnswer = async ({
    message,
    replyToId,
  }: {
    message: string;
    replyToId?: number;
  }) => {
    await setAnswerMutation.mutateAsync({
      answer: { message },
      ticketId,
    });

    const res = await sendAnswerMutation.mutateAsync({
      ticketId,
      ticketMessageId: replyToId,
    });

    pushNotification(res);
  };

  const handleCloseTicket = async () => {
    const res = await closeTicketMutation.mutateAsync({ ticketId });
    pushNotification(res);
  };

  return (
    <>
      <div style={{ padding: "16px" }}>
        <Button
          variant="default"
          onClick={() =>
            router.push(
              `/dashboard/employee/my_tickets?status=${ticket?.status}`
            )
          }
        >
          Back
        </Button>
      </div>

      <div
        style={{
          marginTop: "10px",
          padding: "16px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div style={{ flex: 1 }}>
          <Center>
            <Box
              pos="relative"
              style={{
                maxWidth: "600px",
                width: "100%",
                padding: "10px",
                border: "2px solid white",
                borderRadius: "10px",
                boxShadow: "0px 1px 5px 5px #eef0f3ff",
              }}
            >
              <LoadingOverlay
                visible={isTicketLoading}
                zIndex={1000}
                overlayProps={{ radius: "sm", blur: 2 }}
              />

              <Text fw={500} size="lg" ml="xs">
                Ticket
              </Text>

              {ticket && (
                <ViewTicket
                  ticket={ticket}
                  userId={loggedInUser?.id}
                  onSuccess={(msg) => pushNotification(msg)}
                  onCloseTicket={(msg) => pushNotification(msg)}
                />
              )}
            </Box>
          </Center>
        </div>

        <div style={{ flex: 1 }}>
          <ConversationTable
            ticket={ticket}
            conversation={conversation}
            isTicketLoading={isTicketLoading}
            isConversationLoading={isConversationLoading}
            onSendAnswer={handleSendAnswer}
            onCloseTicket={handleCloseTicket}
          />
        </div>

        {showNotification &&
          createPortal(
            <div
              style={{
                position: "fixed",
                bottom: 20,
                right: 20,
                zIndex: 1000,
              }}
            >
              <Notification
                icon={<IconCheck size={20} />}
                color="teal"
                title="All good!"
                onClose={() => setShowNotification(false)}
              >
                {responseMessage?.message || "Action completed successfully"}
              </Notification>
            </div>,
            document.body
          )}
      </div>
    </>
  );
}
