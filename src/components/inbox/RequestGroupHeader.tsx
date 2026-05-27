"use client";

import { Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { StatusIcon } from "@/components/ui/StatusIcon";
import type { RequestStatus } from "@/types";

// ─────────────────────────────────────────────
// RequestGroupHeader — 40px group divider row.
// Shows status icon + label + count.
// "+" button appears on hover to add to group.
// ─────────────────────────────────────────────

const STATUS_LABELS: Record<RequestStatus, string> = {
  new:      "New",
  triaged:  "Triaged",
  archived: "Archived",
};

interface RequestGroupHeaderProps {
  status: RequestStatus;
  count: number;
  onAddToGroup?: () => void;
  statusLabels?: Partial<Record<RequestStatus, string>>;
}

export function RequestGroupHeader({
  status,
  count,
  onAddToGroup,
  statusLabels,
}: RequestGroupHeaderProps) {
  return (
    <div
      role="rowgroup"
      className={cn(
        "group flex items-center gap-2 h-[40px] px-4",
        "border-b border-[var(--color-border-subtle)]",
        "select-none",
      )}
    >
      <StatusIcon status={status} size={14} />

      <span className="text-[13px] font-medium text-[var(--color-text-secondary)]">
        {statusLabels?.[status] ?? STATUS_LABELS[status]}
      </span>

      <span className="text-[12px] text-[var(--color-text-muted)] tabular-nums">
        {count}
      </span>

      <div className="flex-1" />

      {onAddToGroup && (
        <button
          onClick={onAddToGroup}
          className={cn(
            "flex items-center justify-center h-5 w-5 rounded",
            "text-[var(--color-text-muted)]",
            "opacity-0 group-hover:opacity-100 transition-opacity",
            "hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-secondary)]",
            "focus-visible:outline-2 focus-visible:outline-[var(--color-brand)] focus-visible:opacity-100",
          )}
          aria-label={`Add item to ${STATUS_LABELS[status]}`}
        >
          <Plus size={13} />
        </button>
      )}
    </div>
  );
}
