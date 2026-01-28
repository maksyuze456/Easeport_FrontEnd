'use client';

import { Badge, MantineColor } from "@mantine/core";

export const statusColors: Record<string, MantineColor> = {
  open: "green",
  closed: "gray",
  reviewing: "yellow",
};

type StatusBadgeProps = {
  status: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "filled" | "light" | "outline" | "dot" | "transparent" | "white" | "default" | "gradient";
};

export function StatusBadge({ status, size = "sm", variant = "light" }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();
  const color = statusColors[normalizedStatus] || "gray";

  return (
    <Badge
      color={color}
      variant={variant}
      size={size}
      radius="sm"
      aria-label={`Status: ${status}`}
    >
      {status}
    </Badge>
  );
}
