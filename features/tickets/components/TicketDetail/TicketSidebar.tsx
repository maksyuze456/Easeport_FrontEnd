'use client';

import { Button } from "@mantine/core";
import {
  IconMail,
  IconUser,
  IconCategory,
  IconStack2,
  IconLanguage,
  IconAlertCircle,
  IconCircleCheck,
  IconX,
} from "@tabler/icons-react";
import { Ticket } from "../../types";
import { StatusBadge } from "../shared/StatusBadge/StatusBadge";
import { PriorityIcon } from "../shared/PriorityIcon/PriorityIcon";
import styles from "./TicketDetail.module.css";

type TicketSidebarProps = {
  ticket: Ticket;
  isClosed: boolean;
  onCloseTicket: () => Promise<void>;
};

export function TicketSidebar({
  ticket,
  isClosed,
  onCloseTicket,
}: TicketSidebarProps) {
  const detailItems = [
    {
      icon: <IconMail size={16} />,
      label: "Sender Email",
      value: ticket.from,
    },
    {
      icon: <IconUser size={16} />,
      label: "Sender Name",
      value: ticket.name,
    },
    {
      icon: <IconCategory size={16} />,
      label: "Type",
      value: ticket.type,
    },
    {
      icon: <IconStack2 size={16} />,
      label: "Queue",
      value: ticket.queueType,
    },
    {
      icon: <IconLanguage size={16} />,
      label: "Language",
      value: ticket.language || "N/A",
    },
  ];

  return (
    <aside className={styles.sidebar} aria-label="Ticket details sidebar">
      {/* Status & Priority Card */}
      <div className={styles.sidebarCard}>
        <h3 className={styles.sidebarTitle}>Status & Priority</h3>

        <div className={styles.sidebarItem}>
          <div className={styles.sidebarItemIcon}>
            <IconCircleCheck size={16} aria-hidden="true" />
          </div>
          <div className={styles.sidebarItemContent}>
            <span className={styles.sidebarItemLabel}>Current Status</span>
            <StatusBadge status={ticket.status} size="md" />
          </div>
        </div>

        <div className={styles.sidebarItem}>
          <div className={styles.sidebarItemIcon}>
            <IconAlertCircle size={16} aria-hidden="true" />
          </div>
          <div className={styles.sidebarItemContent}>
            <span className={styles.sidebarItemLabel}>Priority Level</span>
            <PriorityIcon priority={ticket.priority} size="md" />
          </div>
        </div>
      </div>

      {/* Details Card */}
      <div className={styles.sidebarCard}>
        <h3 className={styles.sidebarTitle}>Details</h3>

        {detailItems.map((item) => (
          <div key={item.label} className={styles.sidebarItem}>
            <div className={styles.sidebarItemIcon}>{item.icon}</div>
            <div className={styles.sidebarItemContent}>
              <span className={styles.sidebarItemLabel}>{item.label}</span>
              <span className={styles.sidebarItemValue}>{item.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Actions Card */}
      <div className={styles.actionsCard}>
        <h3 className={styles.actionsTitle}>Actions</h3>

        <div className={styles.actionsGroup}>
          <Button
            variant="light"
            color="red"
            fullWidth
            leftSection={<IconX size={16} />}
            onClick={onCloseTicket}
            disabled={isClosed}
            aria-label={isClosed ? "Ticket is already closed" : "Close this ticket"}
          >
            {isClosed ? "Ticket Closed" : "Close Ticket"}
          </Button>
        </div>
      </div>
    </aside>
  );
}
