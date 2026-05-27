"use client";

import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ThumbsUp, BarChart2, Trash2, Layers } from "lucide-react";
import { cn } from "@/lib/cn";
import { StatusDropdown } from "./StatusDropdown";
import { SourceBadge } from "./SourceBadge";
import { PrioritySignalBadge } from "./PrioritySignalBadge";
import { formatRelativeDate, formatSubmittedDate, getInitials, avatarColor } from "@/lib/format";
import { TEAMS } from "@/lib/constants";
import type { FeatureRequest, RequestStatus } from "@/types";

// ─────────────────────────────────────────────
// RequestRow — 36px compact row, Linear density.
//
// Column layout (left → right):
//   checkbox (20) | signal (16) | id (60) | status (28) |
//   title (flex) | source (64) | votes (32) | date (52) | avatar (24)
//
// Hover: reveals date + avatar, shows checkbox
// Selected: checkbox visible, bg-selected
// Focused (keyboard): ring outline
// ─────────────────────────────────────────────

interface RequestRowProps {
  request: FeatureRequest;
  displayId: string;
  isOpen: boolean;
  isChecked: boolean;
  isFocused: boolean;
  onOpen: (id: string) => void;
  onCheck: (id: string) => void;
  onStatusChange: (id: string, status: RequestStatus) => void;
  onSendToPrioritize?: (id: string) => void;
  onSendToIdeas?: (id: string, teamId: string) => void;
  onDelete?: (id: string) => void;
  rowRef?: (el: HTMLElement | null) => void;
  allowedStatuses?: RequestStatus[];
  statusLabels?: Partial<Record<RequestStatus, string>>;
  hideStatusIcon?: boolean;
}

export const RequestRow = React.memo(function RequestRow({
  request,
  displayId,
  isOpen,
  isChecked,
  isFocused,
  onOpen,
  onCheck,
  onStatusChange,
  onSendToPrioritize,
  onSendToIdeas,
  onDelete,
  rowRef,
  allowedStatuses,
  statusLabels,
  hideStatusIcon,
}: RequestRowProps) {
  const voteCount = request.votes.length;
  const initials = getInitials(request.submittedBy);
  const bgColor = avatarColor(request.submittedBy);

  function handleRowClick() {
    onOpen(request.id);
  }

  function handleCheckboxClick(e: React.MouseEvent) {
    e.stopPropagation();
    onCheck(request.id);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      onOpen(request.id);
    }
    if (e.key === " ") {
      e.preventDefault();
      onCheck(request.id);
    }
  }

  return (
    <div
      ref={rowRef}
      role="row"
      tabIndex={0}
      aria-selected={isOpen}
      onClick={handleRowClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "group relative flex items-center h-[36px] px-4 cursor-pointer select-none",
        "border-b border-[var(--color-border-subtle)] last:border-b-0",
        "transition-colors duration-75 outline-none",
        isOpen
          ? "bg-[var(--color-bg-selected)]"
          : "hover:bg-[var(--color-bg-hover)]",
        isFocused && !isOpen &&
          "outline-2 outline-[var(--color-brand)] outline-offset-[-2px] rounded-sm",
      )}
    >
      {/* ── Checkbox (hidden until hover/checked) ── */}
      <div
        className="flex-shrink-0 flex items-center justify-center w-5 mr-1"
        onClick={handleCheckboxClick}
        role="button"
        aria-label={isChecked ? "Deselect request" : "Select request"}
        tabIndex={-1}
      >
        <div
          className={cn(
            "h-[14px] w-[14px] rounded border flex items-center justify-center",
            "transition-all duration-100",
            isChecked
              ? "bg-[var(--color-brand)] border-[var(--color-brand)]"
              : "border-[var(--color-border-strong)] opacity-0 group-hover:opacity-100",
          )}
          aria-hidden="true"
        >
          {isChecked && (
            <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
              <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </div>

      {/* ── Priority signal dot ── */}
      <PrioritySignalBadge signal={request.prioritySignal} className="mr-2 flex-shrink-0" />

      {/* ── Display ID ── */}
      <span className="font-mono text-[12px] text-[var(--color-text-muted)] w-[60px] flex-shrink-0 tabular-nums">
        {displayId}
      </span>

      {/* ── Status icon (dropdown) ── */}
      {!hideStatusIcon && (
        <div className="flex-shrink-0 h-full flex items-center mr-2 w-6">
          <StatusDropdown
            requestId={request.id}
            currentStatus={request.status}
            onChange={onStatusChange}
            allowedStatuses={allowedStatuses}
            statusLabels={statusLabels}
          />
        </div>
      )}

      {/* ── Title ── */}
      <span
        className={cn(
          "flex-1 text-[13px] truncate mr-3",
          isOpen
            ? "text-[var(--color-text-primary)] font-medium"
            : "text-[var(--color-text-primary)]",
        )}
      >
        {request.title}
      </span>

      {/* ── Source badge ── */}
      <div className="flex-shrink-0 mr-3 w-[60px] flex justify-end">
        <SourceBadge source={request.source} />
      </div>

      {/* ── Vote count ── */}
      <div
        className="flex-shrink-0 flex items-center gap-1 w-8 justify-end mr-3"
        aria-label={`${voteCount} vote${voteCount !== 1 ? "s" : ""}`}
      >
        {voteCount > 0 ? (
          <>
            <ThumbsUp size={10} className="text-[var(--color-text-muted)]" />
            <span className="text-[12px] text-[var(--color-text-muted)] tabular-nums">
              {voteCount}
            </span>
          </>
        ) : (
          <span className="text-[12px] text-transparent tabular-nums">0</span>
        )}
      </div>

      {/* ── Submitted date ── */}
      <span
        className={cn(
          "flex-shrink-0 text-[12px] text-[var(--color-text-muted)] w-[64px] text-right mr-2",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-100",
          isOpen && "opacity-100",
        )}
        aria-label={`Submitted ${formatSubmittedDate(request.submittedAt)}`}
        title={`Submitted ${formatSubmittedDate(request.submittedAt)}`}
      >
        {formatSubmittedDate(request.submittedAt)}
      </span>

      {/* ── Submitter avatar ── */}
      <div
        className={cn(
          "flex-shrink-0 h-[20px] w-[20px] rounded-full flex items-center justify-center",
          "text-[10px] font-semibold text-white",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-100",
          isOpen && "opacity-100",
        )}
        style={{ backgroundColor: bgColor }}
        aria-label={`Submitted by ${request.submittedBy}`}
        title={request.submittedBy}
      >
        {initials}
      </div>

      {/* ── Send to Ideas (hover action) ── */}
      {onSendToIdeas && (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              title="Send to Ideas"
              aria-label="Send to Ideas"
              className={cn(
                "flex-shrink-0 ml-2 h-[22px] px-1.5 rounded flex items-center gap-1 text-[11px]",
                "opacity-0 group-hover:opacity-100 transition-opacity duration-100",
                "text-[var(--color-text-muted)] hover:text-[var(--color-brand)] hover:bg-[var(--color-bg-hover)]",
                isOpen && "opacity-100",
              )}
            >
              <Layers size={12} />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "z-50 min-w-[160px] rounded-lg border border-[var(--color-border-strong)]",
                "bg-[var(--color-bg-elevated)] shadow-xl py-1",
              )}
              sideOffset={4}
            >
              <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                Send to Ideas
              </p>
              {TEAMS.map((team) => (
                <DropdownMenu.Item
                  key={team.id}
                  onSelect={() => onSendToIdeas(request.id, team.id)}
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

      {/* ── Send to Prioritization (hover action) ── */}
      {onSendToPrioritize && (
        <button
          onClick={(e) => { e.stopPropagation(); onSendToPrioritize(request.id); }}
          title="Send to Prioritization"
          aria-label="Send to Prioritization"
          className={cn(
            "flex-shrink-0 ml-2 h-[22px] w-[22px] rounded flex items-center justify-center",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-100",
            "text-[var(--color-text-muted)] hover:text-[var(--color-brand)] hover:bg-[var(--color-bg-hover)]",
            isOpen && "opacity-100",
          )}
        >
          <BarChart2 size={12} />
        </button>
      )}

      {/* ── Delete (hover action) ── */}
      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(request.id); }}
          title="Delete idea"
          aria-label="Delete idea"
          className={cn(
            "flex-shrink-0 ml-1 h-[22px] w-[22px] rounded flex items-center justify-center",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-100",
            "text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10",
            isOpen && "opacity-100",
          )}
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
});
