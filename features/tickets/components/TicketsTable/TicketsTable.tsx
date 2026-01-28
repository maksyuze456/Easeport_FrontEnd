"use client";

import { useState } from "react";
import {
  IconDots,
  IconPencil,
  IconBriefcase2,
  IconChevronDown,
} from "@tabler/icons-react";
import {
  ActionIcon,
  Badge,
  Group,
  Menu,
  Table,
  Text,
  Loader,
  Skeleton,
} from "@mantine/core";

import { Ticket, TicketStatus } from "../../types";
import styles from "./TicketsTable.module.css";

type TicketsTableProps = {
  ticketStatus?: TicketStatus;
  data: Ticket[] | undefined;
  isLoading: boolean;
  onUpdate?: () => void;
  onAssign?: (ticketId: number) => Promise<void>;
  menuActions?: {
    label: string;
    icon: React.ReactNode;
    onClick: (ticket: Ticket) => void;
  }[];
};

export const priorityColors: Record<string, string> = {
  high: "red",
  medium: "orange",
  low: "yellow",
};

export const ticketStatusColors: Record<string, string> = {
  open: "green",
  closed: "grey",
  reviewing: "yellow",
};

// Mobile Card Component
function TicketCard({
  ticket,
  onAssign,
  menuActions,
}: {
  ticket: Ticket;
  onAssign?: (ticketId: number) => Promise<void>;
  menuActions?: TicketsTableProps["menuActions"];
}) {
  const [expanded, setExpanded] = useState(false);

  const defaultActions = [
    {
      label: "Accept ticket",
      icon: <IconBriefcase2 size={16} />,
      onClick: () => {
        onAssign && onAssign(ticket.id);
      },
    },
  ];

  const actions = menuActions ?? defaultActions;

  return (
    <article className={styles.ticketCard} aria-label={`Ticket: ${ticket.subject}`}>
      {/* Header with badges and actions */}
      <div className={styles.cardHeader}>
        <div className={styles.cardBadges}>
          <Badge
            color={priorityColors[ticket.priority.toLowerCase()]}
            variant="light"
            size="sm"
            aria-label={`Priority: ${ticket.priority}`}
          >
            {ticket.priority}
          </Badge>
          <Badge
            color={ticketStatusColors[ticket.status.toLowerCase()]}
            variant="light"
            size="sm"
            aria-label={`Status: ${ticket.status}`}
          >
            {ticket.status}
          </Badge>
        </div>

        <div className={styles.cardActions}>
          <ActionIcon
            variant="subtle"
            color="gray"
            className={styles.actionButton}
            aria-label="Edit ticket"
          >
            <IconPencil size={18} stroke={1.5} />
          </ActionIcon>

          <Menu
            transitionProps={{ transition: "pop" }}
            withArrow
            position="bottom-end"
            withinPortal
          >
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="gray"
                className={styles.actionButton}
                aria-label="More actions"
              >
                <IconDots size={18} stroke={1.5} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              {actions.map((action) => (
                <Menu.Item
                  key={action.label}
                  leftSection={action.icon}
                  onClick={() => action.onClick(ticket)}
                >
                  {action.label}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        </div>
      </div>

      {/* Main content */}
      <div className={styles.cardContent}>
        <h3 className={styles.cardSubject}>{ticket.subject}</h3>

        <div className={styles.cardMeta}>
          <div className={styles.cardMetaItem}>
            <span className={styles.cardMetaLabel}>From</span>
            <span className={styles.cardMetaValue}>{ticket.from}</span>
          </div>
          <div className={styles.cardMetaItem}>
            <span className={styles.cardMetaLabel}>Type</span>
            <span className={styles.cardMetaValue}>{ticket.type}</span>
          </div>
        </div>

        {/* Expandable details */}
        {expanded && (
          <div className={styles.cardDetails}>
            <div className={styles.cardMeta}>
              <div className={styles.cardMetaItem}>
                <span className={styles.cardMetaLabel}>Queue</span>
                <span className={styles.cardMetaValue}>{ticket.queueType}</span>
              </div>
              <div className={styles.cardMetaItem}>
                <span className={styles.cardMetaLabel}>Language</span>
                <span className={styles.cardMetaValue}>{ticket.language}</span>
              </div>
              <div className={styles.cardMetaItem}>
                <span className={styles.cardMetaLabel}>ID</span>
                <span className={styles.cardMetaValue}>#{ticket.id}</span>
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          className={styles.expandButton}
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-label={expanded ? "Show less details" : "Show more details"}
        >
          <span>{expanded ? "Less" : "More"}</span>
          <IconChevronDown
            size={16}
            className={`${styles.expandIcon} ${expanded ? styles.expandIconRotated : ""}`}
          />
        </button>
      </div>
    </article>
  );
}

// Loading skeleton for mobile cards
function MobileCardSkeleton() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonHeader}>
        <Group gap="xs">
          <Skeleton height={22} width={60} radius="sm" />
          <Skeleton height={22} width={50} radius="sm" />
        </Group>
        <Group gap="xs">
          <Skeleton height={32} width={32} radius="sm" />
          <Skeleton height={32} width={32} radius="sm" />
        </Group>
      </div>
      <div className={styles.skeletonContent}>
        <Skeleton height={20} width="80%" radius="sm" />
        <Skeleton height={14} width="60%" radius="sm" mt={8} />
        <Skeleton height={14} width="40%" radius="sm" mt={4} />
      </div>
    </div>
  );
}

export default function TicketsTable({
  data,
  isLoading,
  onAssign,
  menuActions,
}: TicketsTableProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className={styles.container}>
        {/* Desktop loading */}
        <div className={styles.desktopTable}>
          <div className={styles.loadingContainer}>
            <Loader size="md" />
          </div>
        </div>
        {/* Mobile loading */}
        <div className={styles.mobileCards}>
          <MobileCardSkeleton />
          <MobileCardSkeleton />
          <MobileCardSkeleton />
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <p className={styles.emptyStateText}>No tickets found</p>
        </div>
      </div>
    );
  }

  // Desktop table rows
  const rows = data.map((ticket) => (
    <Table.Tr key={ticket.id} className={styles.tableRow}>
      <Table.Td className={styles.tableCell}>
        <div className={styles.tableCellContent}>
          <Text fz="sm" fw={500} className={styles.tableCellPrimary}>
            {ticket.subject}
          </Text>
          <Text c="dimmed" fz="xs" className={styles.tableCellSecondary}>
            subject
          </Text>
        </div>
      </Table.Td>

      <Table.Td className={styles.tableCell}>
        <div className={styles.tableCellContent}>
          <Text fz="sm" className={styles.tableCellPrimary}>
            {ticket.from}
          </Text>
          <Text fz="xs" c="dimmed" className={styles.tableCellSecondary}>
            sender
          </Text>
        </div>
      </Table.Td>

      <Table.Td className={styles.tableCell}>
        <div className={styles.tableCellContent}>
          <Text fz="sm" className={styles.tableCellPrimary}>
            {ticket.type}
          </Text>
          <Text fz="xs" c="dimmed" className={styles.tableCellSecondary}>
            type
          </Text>
        </div>
      </Table.Td>

      <Table.Td className={styles.tableCell}>
        <div className={styles.tableCellContent}>
          <Text fz="sm" className={styles.tableCellPrimary}>
            {ticket.queueType}
          </Text>
          <Text fz="xs" c="dimmed" className={styles.tableCellSecondary}>
            queue
          </Text>
        </div>
      </Table.Td>

      <Table.Td className={styles.tableCell}>
        <Badge
          color={priorityColors[ticket.priority.toLowerCase()]}
          variant="light"
        >
          {ticket.priority}
        </Badge>
        <Text fz="xs" c="dimmed" className={styles.tableCellSecondary}>
          priority
        </Text>
      </Table.Td>

      <Table.Td className={styles.tableCell}>
        <Badge
          color={ticketStatusColors[ticket.status.toLowerCase()]}
          variant="light"
        >
          {ticket.status}
        </Badge>
        <Text fz="xs" c="dimmed" className={styles.tableCellSecondary}>
          status
        </Text>
      </Table.Td>

      <Table.Td className={styles.tableCell}>
        <Group gap={0} justify="flex-end">
          <ActionIcon variant="subtle" color="gray" aria-label="Edit ticket">
            <IconPencil size={16} stroke={1.5} />
          </ActionIcon>

          <Menu
            transitionProps={{ transition: "pop" }}
            withArrow
            position="bottom-end"
            withinPortal
          >
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" aria-label="More actions">
                <IconDots size={16} stroke={1.5} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              {(
                menuActions ?? [
                  {
                    label: "Accept ticket",
                    icon: <IconBriefcase2 size={16} />,
                    onClick: () => {
                      onAssign && onAssign(ticket.id);
                    },
                  },
                ]
              ).map((action) => (
                <Menu.Item
                  key={action.label}
                  leftSection={action.icon}
                  onClick={() => action.onClick(ticket)}
                >
                  {action.label}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <div className={styles.container}>
      {/* Desktop Table View */}
      <div className={styles.desktopTable}>
        <Table.ScrollContainer minWidth={800}>
          <Table verticalSpacing="md">
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </div>

      {/* Mobile Card View */}
      <div className={styles.mobileCards} role="list" aria-label="Tickets list">
        {data.map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            onAssign={onAssign}
            menuActions={menuActions}
          />
        ))}
      </div>
    </div>
  );
}
