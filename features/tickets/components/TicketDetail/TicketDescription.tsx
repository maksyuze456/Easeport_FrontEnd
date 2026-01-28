'use client';

import { IconFileDescription } from "@tabler/icons-react";
import { Ticket } from "../../types";
import styles from "./TicketDetail.module.css";

type TicketDescriptionProps = {
  ticket: Ticket;
};

export function TicketDescription({ ticket }: TicketDescriptionProps) {
  return (
    <section className={styles.description} aria-label="Ticket description">
      <header className={styles.descriptionHeader}>
        <IconFileDescription size={20} aria-hidden="true" />
        <h2 className={styles.descriptionTitle}>Description</h2>
      </header>
      <div className={styles.descriptionBody}>{ticket.body}</div>
    </section>
  );
}
