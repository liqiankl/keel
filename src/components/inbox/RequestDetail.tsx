"use client";

import { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  X,
  Maximize2,
  ThumbsUp,
  Tag,
  Clock,
  User,
  Layers,
  Target,
  ExternalLink,
  BarChart2,
  Trash2,
} from "lucide-react";
import { TEAMS } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/store/useAppStore";
import { StatusDropdown } from "./StatusDropdown";
import { SourceBadge } from "./SourceBadge";
import { PrioritySignalBadge } from "./PrioritySignalBadge";
import { formatFullDate, formatRelativeDate, getInitials, avatarColor } from "@/lib/format";
import type { FeatureRequest, RequestStatus, PrioritySignal } from "@/types";
import { PRIORITY_CONFIG } from "@/lib/constants";
import { useInboxStore } from "@/store/useInboxStore";

// ─────────────────────────────────────────────
// RequestDetail — right-hand slide-in panel.
// Shows full request context with inline
// status change and tag editing.
// ─────────────────────────────────────────────

interface RequestDetailProps {
  request: FeatureRequest;
  displayId: string;
  onClose: () => void;
  onStatusChange: (id: string, status: RequestStatus) => void;
  onTagsChange: (id: string, tags: string[]) => void;
  onSendToPrioritize?: (id: string) => void;
  onSendToIdeas?: (id: string, teamId: string) => void;
  onDelete?: (id: string) => void;
  allowedStatuses?: RequestStatus[];
  statusLabels?: Partial<Record<RequestStatus, string>>;
  hideTags?: boolean;
}

export function RequestDetail({
  request,
  displayId,
  onClose,
  onStatusChange,
  onTagsChange,
  onSendToPrioritize,
  onSendToIdeas,
  onDelete,
  allowedStatuses,
  statusLabels,
  hideTags = false,
}: RequestDetailProps) {
  const [newTag, setNewTag] = useState("");
  const workspaceName = useAppStore((s) => s.workspace.name);
  const updateRequest = useInboxStore((s) => s.updateRequest);

  function handlePriorityChange(signal: PrioritySignal) {
    updateRequest(request.id, { prioritySignal: signal });
  }

  function handleAddTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter" && e.key !== ",") return;
    e.preventDefault();
    const tag = newTag.trim().toLowerCase().replace(/,/g, "");
    if (tag && !request.tags.includes(tag)) {
      onTagsChange(request.id, [...request.tags, tag]);
    }
    setNewTag("");
  }

  function handleRemoveTag(tag: string) {
    onTagsChange(request.id, request.tags.filter((t) => t !== tag));
  }

  const voteCount = request.votes.length;

  return (
    <aside
      className={cn(
        "flex flex-col h-full overflow-hidden",
        "border-l border-[var(--color-border-subtle)]",
        "bg-[var(--color-bg-surface)]",
      )}
      aria-label="Request detail"
    >
      {/* ── Panel header ── */}
      <div className="keel-topbar-height flex items-center gap-2 px-4 border-b border-[var(--color-border-subtle)] flex-shrink-0">
        {/* Breadcrumb */}
        <span className="text-[13px] text-[var(--color-text-muted)] flex items-center gap-1.5">
          <span className="font-medium text-[var(--color-brand)]">{workspaceName}</span>
          <span>›</span>
          <span className="font-mono">{displayId}</span>
        </span>

        <div className="flex-1" />

        <button
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded",
            "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]",
            "hover:bg-[var(--color-bg-hover)] transition-colors",
          )}
          aria-label="Expand to full page"
          title="Expand"
        >
          <Maximize2 size={18} />
        </button>
        <button
          onClick={onClose}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded",
            "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]",
            "hover:bg-[var(--color-bg-hover)] transition-colors",
            "focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]",
          )}
          aria-label="Close detail panel"
        >
          <X size={19} />
        </button>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto">
        {/* Title section */}
        <div className="px-5 pt-5 pb-4 border-b border-[var(--color-border-subtle)]">
          <h2 className="text-[16px] font-semibold text-[var(--color-text-primary)] leading-snug mb-3">
            {request.title}
          </h2>

          {/* Status + source row */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* <StatusDropdown
              requestId={request.id}
              currentStatus={request.status}
              onChange={onStatusChange}
              allowedStatuses={allowedStatuses}
              statusLabels={statusLabels}
              showLabel
            /> */}
            <SourceBadge source={request.source} />
            <PrioritySignalBadge signal={request.prioritySignal} showLabel onChange={handlePriorityChange} />
          </div>
        </div>

        {/* Metadata grid */}
        <div className="px-5 py-4 space-y-3 border-b border-[var(--color-border-subtle)]">
          <MetaRow icon={<User size={18} />} label="Submitted by">
            <div className="flex items-center gap-2">
              <div
                className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-semibold text-white flex-shrink-0"
                style={{ backgroundColor: avatarColor(request.submittedBy) }}
              >
                {getInitials(request.submittedBy)}
              </div>
              <span className="text-[14px] text-[var(--color-text-primary)]">
                {request.submittedBy}
              </span>
            </div>
          </MetaRow>

          <MetaRow icon={<Clock size={18} />} label="Submitted">
            <span className="text-[14px] text-[var(--color-text-primary)]">
              {formatFullDate(request.submittedAt)}
            </span>
          </MetaRow>

          {request.productArea && (
            <MetaRow icon={<Layers size={18} />} label="Product area">
              <span className="text-[14px] text-[var(--color-text-primary)]">
                {request.productArea}
              </span>
            </MetaRow>
          )}

          <MetaRow icon={<ThumbsUp size={18} />} label="Votes">
            <span className="text-[14px] text-[var(--color-text-primary)]">
              {voteCount} {voteCount === 1 ? "vote" : "votes"}
            </span>
          </MetaRow>

          {!hideTags && (
            <MetaRow icon={<Tag size={18} />} label="Tags">
              <div className="flex flex-wrap gap-1.5 items-center">
                {request.tags.map((tag) => (
                  <span
                    key={tag}
                    className={cn(
                      "inline-flex items-center gap-1 rounded px-2 h-[20px]",
                      "text-[12px] bg-[var(--color-bg-elevated)]",
                      "border border-[var(--color-border-subtle)]",
                      "text-[var(--color-text-secondary)]",
                    )}
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      aria-label={`Remove tag ${tag}`}
                      className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] ml-0.5"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Add tag…"
                  className={cn(
                    "h-[20px] text-[11px] bg-transparent border-none outline-none",
                    "text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]",
                    "min-w-[60px] w-[80px]",
                  )}
                  aria-label="Add a tag, press Enter to confirm"
                />
              </div>
            </MetaRow>
          )}
        </div>

        {/* Description */}
        {request.description && (
          <section className="px-5 py-4 border-b border-[var(--color-border-subtle)]">
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
              Description
            </h3>
            <p className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">
              {request.description}
            </p>
          </section>
        )}

        {/* Business context */}
        {request.businessContext && (
          <section className="px-5 py-4 border-b border-[var(--color-border-subtle)]">
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
              Business Context
            </h3>
            <p className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed">
              {request.businessContext}
            </p>
          </section>
        )}

        {/* Votes breakdown */}
        {request.votes.length > 0 && (
          <section className="px-5 py-4 border-b border-[var(--color-border-subtle)]">
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
              Stakeholder Votes · {voteCount}
            </h3>
            <ul className="space-y-3" role="list">
              {request.votes.map((vote, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <div
                    className="h-[22px] w-[22px] rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-semibold text-white mt-0.5"
                    style={{ backgroundColor: avatarColor(vote.stakeholderName) }}
                    aria-hidden="true"
                  >
                    {getInitials(vote.stakeholderName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-[var(--color-text-primary)]">
                        {vote.stakeholderName}
                      </span>
                      <span className="text-[12px] text-[var(--color-text-muted)]">
                        {formatRelativeDate(vote.votedAt)}
                      </span>
                    </div>
                    {vote.comment && (
                      <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5 leading-relaxed">
                        {vote.comment}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Supporting links */}
        {request.supportingLinks.length > 0 && (
          <section className="px-5 py-4 border-b border-[var(--color-border-subtle)]">
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
              Links
            </h3>
            <ul className="space-y-1.5">
              {request.supportingLinks.map((link, idx) => (
                <li key={idx}>
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[13px] text-[var(--color-brand)] hover:underline"
                  >
                    <ExternalLink size={16} />
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Bottom spacer */}
        <div className="h-6" />
      </div>

      {/* ── Footer actions ── */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-[var(--color-border-subtle)] flex gap-2">
        {onSendToIdeas && request.status !== "archived" && (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button variant="primary" size="sm" className="flex-1 gap-1.5">
                <Layers size={15} />
                Send to Ideas
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className={cn(
                  "z-50 min-w-[170px] rounded-lg border border-[var(--color-border-strong)]",
                  "bg-[var(--color-bg-elevated)] shadow-xl py-1",
                )}
                sideOffset={6}
                align="start"
              >
                <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                  Choose team
                </p>
                {TEAMS.map((team) => (
                  <DropdownMenu.Item
                    key={team.id}
                    onSelect={() => onSendToIdeas(request.id, team.id)}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 text-[13px] cursor-pointer outline-none",
                      "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]",
                    )}
                  >
                    <div
                      className="h-5 w-5 rounded flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
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
        {onSendToPrioritize && request.status !== "archived" && (
          <Button
            variant="primary"
            size="sm"
            className="flex-1 gap-1.5"
            onClick={() => onSendToPrioritize(request.id)}
          >
            <BarChart2 size={18} />
            Send to Prioritization
          </Button>
        )}
        {!onSendToPrioritize && request.status === "new" && (
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={() => onStatusChange(request.id, "triaged")}
          >
            Move to Triaged
          </Button>
        )}
        {request.status !== "archived" && (!allowedStatuses || allowedStatuses.includes("archived")) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onStatusChange(request.id, "archived")}
          >
            Archive
          </Button>
        )}
        {request.status === "archived" && (
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={() => onStatusChange(request.id, "new")}
          >
            Restore
          </Button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(request.id)}
            title="Delete idea"
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md flex-shrink-0",
              "text-[var(--color-text-muted)] hover:text-[var(--color-danger)]",
              "hover:bg-[var(--color-danger)]/10 transition-colors",
            )}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </aside>
  );
}

// ── MetaRow helper ─────────────────────────

function MetaRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-0 min-h-[24px]">
      <div className="flex items-center gap-1.5 w-32 flex-shrink-0 pt-0.5">
        <span className="text-[var(--color-text-muted)]" aria-hidden="true">
          {icon}
        </span>
        <span className="text-[13px] text-[var(--color-text-muted)]">{label}</span>
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
