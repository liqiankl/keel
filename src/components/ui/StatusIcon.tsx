"use client";

import { cn } from "@/lib/cn";
import type { InitiativeStatus, RequestStatus } from "@/types";

// ─────────────────────────────────────────────
// StatusIcon — renders shape + color per state.
// Uses BOTH shape and fill (WCAG AA — never
// color as the sole signal).
// ─────────────────────────────────────────────

type Status = InitiativeStatus | RequestStatus;

interface StatusIconProps {
  status: Status;
  size?: number;
  className?: string;
  "aria-label"?: string;
}

export function StatusIcon({
  status,
  size = 14,
  className,
  "aria-label": ariaLabel,
}: StatusIconProps) {
  const label = ariaLabel ?? STATUS_META[status]?.label ?? status;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      className={cn("flex-shrink-0", className)}
      aria-label={label}
      role="img"
    >
      {renderShape(status)}
    </svg>
  );
}

const STATUS_META: Record<string, { label: string }> = {
  backlog:     { label: "Backlog" },
  todo:        { label: "Todo" },
  in_progress: { label: "In Progress" },
  done:        { label: "Done" },
  canceled:    { label: "Canceled" },
  new:         { label: "New" },
  triaged:     { label: "Triaged" },
  archived:    { label: "Archived" },
};

function renderShape(status: Status) {
  switch (status) {
    case "backlog":
      return (
        <circle
          cx="7" cy="7" r="6"
          stroke="var(--color-status-backlog)"
          strokeWidth="1.5"
          strokeDasharray="3 2"
          fill="none"
        />
      );

    case "new":
    case "todo":
      return (
        <circle
          cx="7" cy="7" r="6"
          stroke="var(--color-status-todo)"
          strokeWidth="1.5"
          fill="none"
        />
      );

    case "triaged":
      return (
        <>
          <circle
            cx="7" cy="7" r="6"
            stroke="var(--color-brand)"
            strokeWidth="1.5"
            fill="none"
          />
          <circle cx="7" cy="7" r="2.5" fill="var(--color-brand)" />
        </>
      );

    case "in_progress":
      return (
        <>
          <circle
            cx="7" cy="7" r="6"
            stroke="var(--color-status-in-progress)"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M7 1a6 6 0 0 1 0 12V7L7 1z"
            fill="var(--color-status-in-progress)"
          />
        </>
      );

    case "done":
      return (
        <>
          <circle cx="7" cy="7" r="7" fill="var(--color-status-done)" />
          <path
            d="M4.5 7l2 2 3-3"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      );

    case "canceled":
    case "archived":
      return (
        <>
          <circle
            cx="7" cy="7" r="6"
            stroke="var(--color-status-canceled)"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M5 5l4 4M9 5l-4 4"
            stroke="var(--color-status-canceled)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </>
      );

    default:
      return (
        <circle
          cx="7" cy="7" r="6"
          stroke="var(--color-text-muted)"
          strokeWidth="1.5"
          fill="none"
        />
      );
  }
}
