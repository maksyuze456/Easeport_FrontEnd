'use client';

import { Loader, ScrollArea } from "@mantine/core";
import { IconMessages, IconMessageOff } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { TicketMessage, Ticket } from "../../types";
import { MessageBubble } from "./MessageBubble";
import { ReplyForm } from "./ReplyForm";
import styles from "./ConversationPanel.module.css";

type ConversationPanelProps = {
  ticket: Ticket | undefined;
  conversation: TicketMessage[] | undefined;
  currentUsername: string;
  isLoading: boolean;
  onSendMessage: (payload: { message: string; replyToId?: number }) => Promise<void>;
};

export function ConversationPanel({
  ticket,
  conversation,
  currentUsername,
  isLoading,
  onSendMessage,
}: ConversationPanelProps) {
  const [replyTo, setReplyTo] = useState<TicketMessage | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const isClosed = ticket?.status?.toLowerCase() === "closed";
  const messageCount = conversation?.length || 0;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation]);

  const handleReply = (message: TicketMessage) => {
    setReplyTo(message);
  };

  const handleCancelReply = () => {
    setReplyTo(null);
  };

  const findRepliedToMessage = (message: TicketMessage) => {
    return conversation?.find((m) => m.emailMessageId === message.inReplyTo);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <h2 className={styles.headerTitle}>
          <IconMessages size={20} aria-hidden="true" />
          Conversation
          {messageCount > 0 && (
            <span className={styles.messageCount}>({messageCount})</span>
          )}
        </h2>
      </header>

      {/* Messages List */}
      <ScrollArea className={styles.messagesList} offsetScrollbars>
        {isLoading ? (
          <div className={styles.loading} role="status">
            <Loader size="sm" aria-label="Loading messages" />
          </div>
        ) : !conversation || conversation.length === 0 ? (
          <div className={styles.emptyState} role="status">
            <IconMessageOff size={40} className={styles.emptyIcon} aria-hidden="true" />
            <p className={styles.emptyText}>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {conversation.map((message) => (
              <MessageBubble
                key={message.ticketMessageId}
                message={message}
                isCurrentUser={message.sender === currentUsername}
                repliedTo={findRepliedToMessage(message)}
                isClosed={isClosed}
                onReply={handleReply}
              />
            ))}
            <div ref={bottomRef} aria-hidden="true" />
          </>
        )}
      </ScrollArea>

      {/* Reply Form */}
      <ReplyForm
        isClosed={isClosed}
        replyTo={replyTo}
        onSendMessage={onSendMessage}
        onCancelReply={handleCancelReply}
      />
    </div>
  );
}
