'use client';

import React, { useState, Suspense, lazy } from "react";
import { Notification, LoadingOverlay, Skeleton } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { createPortal } from "react-dom";
import { useParams, useRouter } from "next/navigation";

import { useAuthContext } from "../../../../_context/AuthProvider";
import {
  useTicketById,
  useConversationById,
  useCloseTicket,
  useSetAnswer,
  useSendAnswer,
} from "../../../../../features/tickets";
import {
  TicketHeader,
  TicketMetadata,
  TicketDescription,
  TicketSidebar,
} from "../../../../../features/tickets/components/TicketDetail";
import { ConversationPanel } from "../../../../../features/tickets/components/ConversationPanel";
import styles from "../../../../../features/tickets/components/TicketDetail/TicketDetail.module.css";

export default function ViewTicketPage() {
  const params = useParams();
  const ticketId = Number(params.ticketId);
  const router = useRouter();
  const { data: loggedInUser } = useAuthContext();

  const [responseMessage, setResponseMessage] = useState<{ message: string } | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  // Queries
  const {
    data: ticket,
    isLoading: isTicketLoading,
  } = useTicketById(ticketId);

  const {
    data: conversation,
    isLoading: isConversationLoading,
  } = useConversationById(ticketId);

  // Mutations
  const setAnswerMutation = useSetAnswer();
  const sendAnswerMutation = useSendAnswer();
  const closeTicketMutation = useCloseTicket();

  const isClosed = ticket?.status?.toLowerCase() === "closed";

  // Unified notification
  const pushNotification = (message: { message: string }) => {
    setResponseMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  // Mutation wrappers
  const handleSendMessage = async ({
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

  const handleBack = () => {
    router.push(`/dashboard/employee/my_tickets?status=${ticket?.status || "Reviewing"}`);
  };

  // Loading skeleton
  if (isTicketLoading) {
    return (
      <main className={styles.container} role="main" aria-label="Loading ticket">
        <Skeleton height={80} radius="md" mb="md" />
        <Skeleton height={60} radius="md" mb="md" />
        <div className={styles.mainContent}>
          <div>
            <Skeleton height={200} radius="md" mb="md" />
          </div>
          <div>
            <Skeleton height={400} radius="md" />
          </div>
        </div>
      </main>
    );
  }

  if (!ticket) {
    return (
      <main className={styles.container} role="main">
        <div style={{ textAlign: "center", padding: "40px" }}>
          <h1>Ticket not found</h1>
          <p>The ticket you are looking for does not exist or has been removed.</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className={styles.container} role="main" aria-label={`Ticket #${ticket.id}: ${ticket.subject}`}>
        {/* Header with back button, title, status badges */}
        <TicketHeader ticket={ticket} onBack={handleBack} />

        {/* Metadata bar */}
        <TicketMetadata ticket={ticket} />

        {/* Main content grid: Description + Conversation | Sidebar */}
        <div className={styles.mainContent}>
          {/* Left column: Description & Conversation */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <TicketDescription ticket={ticket} />

            <ConversationPanel
              ticket={ticket}
              conversation={conversation}
              currentUsername={loggedInUser?.username || ""}
              isLoading={isConversationLoading}
              onSendMessage={handleSendMessage}
            />
          </div>

          {/* Right column: Sidebar */}
          <TicketSidebar
            ticket={ticket}
            isClosed={isClosed}
            onCloseTicket={handleCloseTicket}
          />
        </div>
      </main>

      {/* Notification Portal */}
      {showNotification &&
        createPortal(
          <div
            style={{
              position: "fixed",
              bottom: 24,
              right: 24,
              zIndex: 1000,
            }}
            role="status"
            aria-live="polite"
          >
            <Notification
              icon={<IconCheck size={20} />}
              color="teal"
              title="Success"
              onClose={() => setShowNotification(false)}
              withCloseButton
              radius="md"
              style={{
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              }}
            >
              {responseMessage?.message || "Action completed successfully"}
            </Notification>
          </div>,
          document.body
        )}
    </>
  );
}
