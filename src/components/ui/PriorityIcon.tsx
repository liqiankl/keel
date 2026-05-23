"use client";

import { cn } from "@/lib/cn";
import type { Priority } from "@/types";

// ─────────────────────────────────────────────
// PriorityIcon — bar-chart metaphor.
// Each level shows different bar heights.
// Shape + color for WCAG AA compliance.
// ─────────────────────────────────────────────

interface PriorityIconProps {
  priority: Priority;
  size?: number;
  className?: string;
}

const PRIORITY_COLORS: Record<Priority, string> = {
  urgent: "var(--color-priority-urgent)",
  high:   "var(--color-priority-high)",
  medium: "var(--color-priority-medium)",
  low:    "var(--color-priority-low)",
  none:   "var(--color-priority-none)",
};

const PRIORITY_LABELS: Record<Priority, string> = {
  urgent: "Urgent priority",
  high:   "High priority",
  medium: "Medium priority",
  low:    "Low priority",
  none:   "No priority",
};

// Bar heights [bar1, bar2, bar3] as fractions of 10
const BAR_HEIGHTS: Record<Priority, [number, number, number]> = {
  urgent: [10, 10, 10],
  high:   [4, 7, 10],
  medium: [4, 7, 3],
  low:    [4, 3, 3],
  none:   [3, 3, 3],
};

export function PriorityIcon({
  priority,
  size = 14,
  className,
}: PriorityIconProps) {
  const color  = PRIORITY_COLORS[priority];
  const label  = PRIORITY_LABELS[priority];
  const [h1, h2, h3] = BAR_HEIGHTS[priority];
  const dashed = priority === "none";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      className={cn("flex-shrink-0", className)}
      aria-label={label}
      role="img"
    >
      {/* Three vertical bars, right-aligned */}
      <rect
        x="0" y={12 - h1} width="2.5" height={h1} rx="0.5"
        fill={color}
        opacity={dashed ? 0.4 : 1}
      />
      <rect
        x="4.5" y={12 - h2} width="2.5" height={h2} rx="0.5"
        fill={color}
        opacity={dashed ? 0.4 : 1}
      />
      <rect
        x="9" y={12 - h3} width="2.5" height={h3} rx="0.5"
        fill={color}
        opacity={dashed ? 0.4 : 1}
      />
    </svg>
  );
}
