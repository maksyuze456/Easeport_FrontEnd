'use client';

import {
  Box,
  Paper,
  Text,
  ScrollArea,
  Button,
  Textarea,
  Flex,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useRef, useState } from "react";
import { IconX } from "@tabler/icons-react";
import { TicketMessage, Ticket } from "../../types";

type ConversationTableProps = {
  ticket: Ticket | undefined;
  conversation: TicketMessage[] | undefined;
  currentUsername: string;
  isTicketLoading: boolean;
  isConversationLoading: boolean;
  onSendAnswer: (payload: { message: string; replyToId?: number }) => Promise<void>;
  onCloseTicket: () => Promise<void>;
};

export default function ViewConversation({
  ticket,
  conversation,
  currentUsername,
  isTicketLoading,
  isConversationLoading,
  onSendAnswer,
  onCloseTicket,
}: ConversationTableProps) {
  const [replyTo, setReplyTo] = useState<TicketMessage | null>(null);
  const [showReplyHighlight, setShowReplyHighlight] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const currentUser = currentUsername || "";
  const isClosed = ticket?.status?.toLowerCase() === "closed";

  const form = useForm({
    mode: "controlled",
    initialValues: {
      message: "",
    },
  });

  // auto-scroll to bottom when conversation changes
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation]);

  // handle sending messages
  const handleSubmit = async (values: typeof form.values) => {
    if (isClosed) return;

    await onSendAnswer({
      message: values.message,
      replyToId: replyTo?.ticketMessageId,
    });

    form.reset();
    setReplyTo(null);
  };

  const handleReply = (message: TicketMessage) => {
    setReplyTo(message);
    setTimeout(() => setShowReplyHighlight(true), 10);
    setTimeout(() => textareaRef.current?.focus(), 80);
  };

  const cancelReply = () => {
    setShowReplyHighlight(false);
    setTimeout(() => setReplyTo(null), 180);
  };

  return (
    <Box style={{ height: "700px", padding: "16px" }}>
      <Paper shadow="xs" p="md">
        <Text fw={500} size="lg" mb="md">
          Conversation History
        </Text>

        <ScrollArea h={500} offsetScrollbars>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {conversation?.map((message) => {
              const isCurrentUser = message.sender === currentUser;

              // find parent message if this is a reply
              const repliedTo = conversation.find(
                (m) => m.emailMessageId === message.inReplyTo
              );

              return (
                <div
                  key={message.ticketMessageId}
                  style={{
                    display: "flex",
                    justifyContent: isCurrentUser ? "flex-end" : "flex-start",
                    width: "100%",
                  }}
                >
                  <div style={{ maxWidth: "70%" }}>
                    {repliedTo && (
                      <div
                        style={{
                          marginBottom: 6,
                          padding: "6px 8px",
                          borderLeft: "3px solid rgba(34,139,230,0.9)",
                          background: "#fbfdff",
                          borderRadius: 8,
                          color: "rgba(0,0,0,0.75)",
                          fontSize: 13,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <Text size="xs" c="dimmed">
                          In reply to {repliedTo.sender}:
                        </Text>
                        <Text
                          size="sm"
                          style={{
                            maxWidth: 420,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {repliedTo.body}
                        </Text>
                      </div>
                    )}

                    <Paper
                      shadow="sm"
                      p="sm"
                      style={{
                        backgroundColor: isCurrentUser ? "#E3F2FD" : "#F5F5F5",
                        borderRadius: "12px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Text size="sm" c="dimmed" mb={4}>
                          {message.sender}
                        </Text>

                        {!isClosed && (
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handleReply(message);
                            }}
                            style={{ textDecoration: "none", cursor: "pointer" }}
                          >
                            <Text size="sm" c="dimmed" mb={4}>
                              reply
                            </Text>
                          </a>
                        )}
                      </div>

                      <Text>{message.body}</Text>

                      <Text size="xs" c="dimmed" mt={4}>
                        {new Date(message.localDateTime).toLocaleTimeString()}
                      </Text>
                    </Paper>
                  </div>
                </div>
              );
            })}

            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        <Paper shadow="xs" p="md" mt="md">
          {replyTo && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px",
                borderLeft: "4px solid #228be6",
                marginBottom: "8px",
                background: "#f7fbff",
                borderRadius: 6,
                transition: "transform 180ms ease, opacity 180ms ease",
                transform: showReplyHighlight
                  ? "translateY(0)"
                  : "translateY(-6px)",
                opacity: showReplyHighlight ? 1 : 0,
              }}
            >
              <div style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                <Text size="xs" c="dimmed">
                  Replying to {replyTo.sender}
                </Text>
                <Text
                  size="sm"
                  style={{
                    maxWidth: 420,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {replyTo.body}
                </Text>
              </div>

              <button
                type="button"
                onClick={cancelReply}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
                aria-label="Cancel reply"
              >
                <IconX size={16} />
              </button>
            </div>
          )}

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Textarea
              styles={{
                input: { width: "100%", height: "100px", resize: "vertical" },
                wrapper: { width: "100%" },
              }}
              required
              placeholder="Type your response..."
              {...form.getInputProps("message")}
              ref={textareaRef}
              disabled={isClosed}
            />

            <Flex justify="flex-end" gap="md" mt="md">
              <Button
                variant="default"
                size="sm"
                radius="md"
                onClick={onCloseTicket}
                disabled={isClosed}
              >
                Close Ticket
              </Button>

              <Button
                type="submit"
                size="sm"
                radius="md"
                disabled={isClosed}
              >
                Send Response
              </Button>
            </Flex>
          </form>
        </Paper>
      </Paper>
    </Box>
  );
}
