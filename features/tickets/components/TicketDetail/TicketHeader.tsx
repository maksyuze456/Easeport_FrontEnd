'use client';

import { ActionIcon, Tooltip } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { Ticket } from "../../types";
import { StatusBadge } from "../shared/StatusBadge/StatusBadge";
import { PriorityIcon } from "../shared/PriorityIcon/PriorityIcon";
import styles from "./TicketDetail.module.css";

type TicketHeaderProps = {
  ticket: Ticket;
  onBack: () => void;
};

export function TicketHeader({ ticket, onBack }: TicketHeaderProps) {
  return (
    <header className={styles.header} role="banner">
      {/* Back button row - closer to navbar */}
      <div className={styles.backRow}>
        <Tooltip label="Back to Tickets" position="right" withArrow>
          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            onClick={onBack}
            aria-label="Go back to tickets list"
            className={styles.backButton}
          >
            <IconArrowLeft size={20} />
          </ActionIcon>
        </Tooltip>
      </div>

      {/* Title and metadata */}
      <div className={styles.headerContent}>
        <h1 className={styles.headerTitle}>{ticket.subject}</h1>

        <div className={styles.headerMeta}>
          <span className={styles.ticketId} aria-label="Ticket ID">
            #{ticket.id}
          </span>
          <div className={styles.headerBadges}>
            <StatusBadge status={ticket.status} size="md" />
            <PriorityIcon priority={ticket.priority} size="md" />
          </div>
        </div>
      </div>
    </header>
  );
}
