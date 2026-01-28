'use client';

import { Ticket } from "../../types";
import styles from "./TicketDetail.module.css";

type TicketMetadataProps = {
  ticket: Ticket;
};

export function TicketMetadata({ ticket }: TicketMetadataProps) {
  const metadataItems = [
    { label: "Sender", value: ticket.from },
    { label: "Name", value: ticket.name },
    { label: "Type", value: ticket.type },
    { label: "Queue", value: ticket.queueType },
    { label: "Language", value: ticket.language || "N/A" },
  ];

  return (
    <section className={styles.metadata} aria-label="Ticket metadata">
      {metadataItems.map((item) => (
        <div key={item.label} className={styles.metadataItem}>
          <span className={styles.metadataLabel}>{item.label}</span>
          <span className={styles.metadataValue}>{item.value}</span>
        </div>
      ))}
    </section>
  );
}
