"use client";

import { X, CheckCircle, Archive, CircleDot, Tag } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import type { RequestStatus } from "@/types";

// ─────────────────────────────────────────────
// BulkActionBar — appears when ≥1 rows are
// selected. Floats above the list content.
// ─────────────────────────────────────────────

interface BulkActionBarProps {
  selectedCount: number;
  onBulkStatus: (status: RequestStatus) => void;
  onBulkTag: (tag: string) => void;
  onClearSelection: () => void;
}

export function BulkActionBar({
  selectedCount,
  onBulkStatus,
  onBulkTag,
  onClearSelection,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-2 flex-shrink-0",
        "border-b border-[var(--color-border-subtle)]",
        "bg-[var(--color-bg-elevated)]",
      )}
      role="toolbar"
      aria-label={`${selectedCount} item${selectedCount !== 1 ? "s" : ""} selected`}
    >
      {/* Count */}
      <span className="text-[13px] font-medium text-[var(--color-text-primary)] min-w-max">
        {selectedCount} selected
      </span>

      <div className="h-4 w-px bg-[var(--color-border-subtle)]" aria-hidden="true" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        <BulkButton
          icon={<CircleDot size={13} />}
          label="Mark new"
          onClick={() => onBulkStatus("new")}
        />
        <BulkButton
          icon={<CheckCircle size={13} />}
          label="Triage"
          onClick={() => onBulkStatus("triaged")}
        />
        <BulkButton
          icon={<Archive size={13} />}
          label="Archive"
          onClick={() => onBulkStatus("archived")}
        />
        <BulkButton
          icon={<Tag size={13} />}
          label="Add tag"
          onClick={() => onBulkTag("tag")}
        />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Clear */}
      <button
        onClick={onClearSelection}
        className={cn(
          "flex items-center gap-1.5 text-[12px] text-[var(--color-text-muted)]",
          "hover:text-[var(--color-text-secondary)] transition-colors",
          "focus-visible:outline-2 focus-visible:outline-[var(--color-brand)] rounded",
        )}
        aria-label="Clear selection"
      >
        <X size={12} />
        Clear
      </button>
    </div>
  );
}

function BulkButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="gap-1.5 text-[12px] text-[var(--color-text-secondary)] h-7"
    >
      {icon}
      {label}
    </Button>
  );
}
