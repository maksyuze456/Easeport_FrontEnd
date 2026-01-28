'use client';

import { TicketMessage } from "../../types";
import styles from "./ConversationPanel.module.css";

type MessageBubbleProps = {
  message: TicketMessage;
  isCurrentUser: boolean;
  repliedTo?: TicketMessage;
  isClosed: boolean;
  onReply: (message: TicketMessage) => void;
};

export function MessageBubble({
  message,
  isCurrentUser,
  repliedTo,
  isClosed,
  onReply,
}: MessageBubbleProps) {
  const formattedTime = new Date(message.localDateTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const formattedDate = new Date(message.localDateTime).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className={`${styles.messageWrapper} ${
        isCurrentUser ? styles.messageWrapperOwn : styles.messageWrapperOther
      }`}
    >
      <article
        className={styles.message}
        aria-label={`Message from ${message.sender}`}
      >
        {repliedTo && (
          <div className={styles.replyContext}>
            <div className={styles.replyLabel}>
              Replying to {repliedTo.sender}
            </div>
            <div className={styles.replyBody}>{repliedTo.body}</div>
          </div>
        )}

        <div
          className={`${styles.messageBubble} ${
            isCurrentUser ? styles.messageBubbleOwn : styles.messageBubbleOther
          }`}
        >
          <div className={styles.messageHeader}>
            <span className={styles.messageSender}>{message.sender}</span>

            {!isClosed && (
              <button
                type="button"
                className={`${styles.replyButton} ${
                  isCurrentUser
                    ? styles.replyButtonOwn
                    : styles.replyButtonOther
                }`}
                onClick={() => onReply(message)}
                aria-label={`Reply to message from ${message.sender}`}
              >
                Reply
              </button>
            )}
          </div>

          <div className={styles.messageBody}>{message.body}</div>

          <div className={styles.messageTime}>
            {formattedDate} at {formattedTime}
          </div>
        </div>
      </article>
    </div>
  );
}
