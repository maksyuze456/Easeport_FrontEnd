'use client';

import { Button, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconSend, IconX, IconLock } from "@tabler/icons-react";
import { useRef, useEffect } from "react";
import { TicketMessage } from "../../types";
import styles from "./ConversationPanel.module.css";

type ReplyFormProps = {
  isClosed: boolean;
  replyTo: TicketMessage | null;
  onSendMessage: (payload: { message: string; replyToId?: number }) => Promise<void>;
  onCancelReply: () => void;
};

export function ReplyForm({
  isClosed,
  replyTo,
  onSendMessage,
  onCancelReply,
}: ReplyFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const form = useForm({
    mode: "controlled",
    initialValues: {
      message: "",
    },
    validate: {
      message: (value) =>
        value.trim().length === 0 ? "Message cannot be empty" : null,
    },
  });

  useEffect(() => {
    if (replyTo && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyTo]);

  const handleSubmit = async (values: typeof form.values) => {
    if (isClosed) return;

    await onSendMessage({
      message: values.message,
      replyToId: replyTo?.ticketMessageId,
    });

    form.reset();
    onCancelReply();
  };

  if (isClosed) {
    return (
      <div className={styles.closedBanner} role="status">
        <IconLock size={16} aria-hidden="true" />
        <span>This ticket is closed. No new messages can be sent.</span>
      </div>
    );
  }

  return (
    <div className={styles.replyForm}>
      {replyTo && (
        <div className={styles.replyPreview}>
          <div className={styles.replyPreviewContent}>
            <div className={styles.replyPreviewLabel}>
              Replying to {replyTo.sender}
            </div>
            <div className={styles.replyPreviewBody}>{replyTo.body}</div>
          </div>
          <button
            type="button"
            className={styles.cancelReplyButton}
            onClick={onCancelReply}
            aria-label="Cancel reply"
          >
            <IconX size={16} />
          </button>
        </div>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <div className={styles.textareaWrapper}>
          <Textarea
            ref={textareaRef}
            placeholder="Type your message..."
            minRows={3}
            maxRows={8}
            autosize
            {...form.getInputProps("message")}
            aria-label="Message input"
            classNames={{ input: styles.textarea }}
          />
        </div>

        <div className={styles.formActions}>
          <Button
            type="submit"
            leftSection={<IconSend size={16} />}
            radius="md"
            aria-label="Send message"
          >
            Send Message
          </Button>
        </div>
      </form>
    </div>
  );
}
