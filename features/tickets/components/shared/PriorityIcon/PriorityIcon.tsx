'use client';

import { Badge, MantineColor, Group, Text } from "@mantine/core";
import {
  IconAlertTriangle,
  IconAlertCircle,
  IconInfoCircle,
} from "@tabler/icons-react";

export const priorityColors: Record<string, MantineColor> = {
  high: "red",
  medium: "orange",
  low: "yellow",
};

const priorityIcons: Record<string, React.ReactNode> = {
  high: <IconAlertTriangle size={14} />,
  medium: <IconAlertCircle size={14} />,
  low: <IconInfoCircle size={14} />,
};

type PriorityIconProps = {
  priority: string;
  showLabel?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "filled" | "light" | "outline" | "dot" | "transparent" | "white" | "default" | "gradient";
};

export function PriorityIcon({
  priority,
  showLabel = true,
  size = "sm",
  variant = "light",
}: PriorityIconProps) {
  const normalizedPriority = priority.toLowerCase();
  const color = priorityColors[normalizedPriority] || "gray";
  const icon = priorityIcons[normalizedPriority];

  return (
    <Badge
      color={color}
      variant={variant}
      size={size}
      radius="sm"
      leftSection={icon}
      aria-label={`Priority: ${priority}`}
    >
      {showLabel && priority}
    </Badge>
  );
}
