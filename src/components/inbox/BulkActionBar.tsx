"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { X, CheckCircle, Archive, CircleDot, Tag, BarChart2, Layers } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { TEAMS } from "@/lib/constants";
import type { RequestStatus } from "@/types";

// ─────────────────────────────────────────────
// BulkActionBar — appears when ≥1 rows are
// selected. Floats above the list content.
// ─────────────────────────────────────────────

interface BulkActionBarProps {
  selectedCount: number;
  onBulkStatus?: (status: RequestStatus) => void;
  onBulkTag?: () => void;
  onClearSelection: () => void;
  onSendToPrioritize?: () => void;
  onSendToIdeas?: (teamId: string) => void;
}

export function BulkActionBar({
  selectedCount,
  onBulkStatus,
  onBulkTag,
  onClearSelection,
  onSendToPrioritize,
  onSendToIdeas,
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
        {onSendToIdeas && (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button variant="primary" size="sm" className="gap-1.5 text-[12px] h-7">
                <Layers size={13} />
                Send to Ideas
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className={cn(
                  "z-50 min-w-[160px] rounded-lg border border-[var(--color-border-strong)]",
                  "bg-[var(--color-bg-elevated)] shadow-xl py-1",
                )}
                sideOffset={4}
              >
                <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                  Choose team
                </p>
                {TEAMS.map((team) => (
                  <DropdownMenu.Item
                    key={team.id}
                    onSelect={() => onSendToIdeas(team.id)}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-1.5 text-[13px] cursor-pointer outline-none",
                      "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]",
                    )}
                  >
                    <div
                      className="h-4 w-4 rounded flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: team.color }}
                    >
                      {team.name.charAt(0)}
                    </div>
                    {team.name}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        )}
        {onSendToPrioritize && (
          <BulkButton
            icon={<BarChart2 size={13} />}
            label="Send to Prioritization"
            onClick={onSendToPrioritize}
            highlight
          />
        )}
        {onBulkStatus && (
          <>
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
          </>
        )}
        {onBulkTag && (
          <BulkButton
            icon={<Tag size={13} />}
            label="Add tag"
            onClick={onBulkTag}
          />
        )}
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
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  highlight?: boolean;
}) {
  return (
    <Button
      variant={highlight ? "primary" : "ghost"}
      size="sm"
      onClick={onClick}
      className={cn(
        "gap-1.5 text-[12px] h-7",
        !highlight && "text-[var(--color-text-secondary)]",
      )}
    >
      {icon}
      {label}
    </Button>
  );
}
