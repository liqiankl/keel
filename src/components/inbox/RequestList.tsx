"use client";

import { useMemo } from "react";
import { type LucideProps } from "lucide-react";
import { Inbox, CheckCircle, Archive, Layers } from "lucide-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import { RequestRow } from "./RequestRow";
import { RequestGroupHeader } from "./RequestGroupHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { buildDisplayIdMap } from "@/lib/format";
import { useKeyboardNav } from "@/hooks/useKeyboardNav";
import type { FeatureRequest, RequestStatus, FilterTab } from "@/types";

// ─────────────────────────────────────────────
// RequestList — renders groups of request rows.
//
// "active" tab: groups by New → Triaged
// all other tabs: flat list (single implicit group)
// ─────────────────────────────────────────────

interface RequestListProps {
  allRequests: FeatureRequest[];
  filteredRequests: FeatureRequest[];
  activeTab: FilterTab;
  openId: string | null;
  checkedIds: string[];
  focusedId: string | null;
  onOpen: (id: string) => void;
  onCheck: (id: string) => void;
  onStatusChange: (id: string, status: RequestStatus) => void;
  onFocus: (id: string | null) => void;
  onAddToGroup?: (status: RequestStatus) => void;
  onSendToPrioritize?: (id: string) => void;
  onSendToIdeas?: (id: string, teamId: string) => void;
  onDelete?: (id: string) => void;
  allowedStatuses?: RequestStatus[];
  statusLabels?: Partial<Record<RequestStatus, string>>;
  hideStatusIcon?: boolean;
  onSelectAll?: () => void;
}

type Group = { status: RequestStatus; items: FeatureRequest[] };

function groupRequests(tab: FilterTab, requests: FeatureRequest[]): Group[] {
  if (tab === "active") {
    const newItems     = requests.filter((r) => r.status === "new");
    const triagedItems = requests.filter((r) => r.status === "triaged");
    return [
      ...(newItems.length > 0     ? [{ status: "new"     as RequestStatus, items: newItems }]     : []),
      ...(triagedItems.length > 0 ? [{ status: "triaged" as RequestStatus, items: triagedItems }] : []),
    ];
  }
  // Other tabs: one group with the current status as header
  const status: RequestStatus =
    tab === "new" ? "new"
    : (tab === "triaged" || tab === "backlog") ? "triaged"
    : "archived";
  return requests.length > 0 ? [{ status, items: requests }] : [];
}

type IconType = ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;

const EMPTY_STATE_CONFIG: Record<FilterTab, {
  Icon: IconType;
  title: string;
  description: string;
  actionLabel: string;
}> = {
  all: {
    Icon: Inbox,
    title: "No requests yet",
    description: "Feature requests from customers, stakeholders, and your team will appear here.",
    actionLabel: "New request",
  },
  active: {
    Icon: Inbox,
    title: "Inbox is clear",
    description: "All requests have been triaged or archived. Submit a new request or check the archived tab.",
    actionLabel: "New request",
  },
  new: {
    Icon: CheckCircle,
    title: "No new requests",
    description: "All caught up. Every incoming request has been triaged.",
    actionLabel: "New request",
  },
  triaged: {
    Icon: Layers,
    title: "No triaged requests",
    description: "Review requests in the New tab and move them here once you've assessed them.",
    actionLabel: "Go to New",
  },
  archived: {
    Icon: Archive,
    title: "Nothing archived",
    description: "Requests you've closed or deprioritised will appear here.",
    actionLabel: "New request",
  },
  backlog: {
    Icon: Layers,
    title: "Backlog is empty",
    description: "Triaged ideas waiting to be picked up will appear here.",
    actionLabel: "Go to New",
  },
};

export function RequestList({
  allRequests,
  filteredRequests,
  activeTab,
  openId,
  checkedIds,
  focusedId,
  onOpen,
  onCheck,
  onStatusChange,
  onFocus,
  onAddToGroup,
  onSendToPrioritize,
  onSendToIdeas,
  onDelete,
  allowedStatuses,
  statusLabels,
  hideStatusIcon,
  onSelectAll,
}: RequestListProps) {
  // Stable display ID map based on all requests (not just filtered)
  const displayIdMap = useMemo(
    () => buildDisplayIdMap(allRequests),
    [allRequests],
  );

  const groups = useMemo(
    () => groupRequests(activeTab, filteredRequests),
    [activeTab, filteredRequests],
  );

  const flatIds = useMemo(
    () => filteredRequests.map((r) => r.id),
    [filteredRequests],
  );

  const { registerRef } = useKeyboardNav({
    ids: flatIds,
    focusedId,
    onFocus,
    onSelect: onOpen,
    onCheck,
  });

  if (filteredRequests.length === 0) {
    return <div className="flex-1" />;
  }

  const allSelected = filteredRequests.length > 0 && checkedIds.length === filteredRequests.length;
  const someSelected = checkedIds.length > 0 && !allSelected;

  return (
    <div
      role="grid"
      aria-label="Feature requests"
      aria-rowcount={filteredRequests.length}
      className="flex-1 overflow-y-auto"
    >
      {onSelectAll && filteredRequests.length > 0 && (
        <div className="flex items-center gap-2.5 px-4 h-8 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] flex-shrink-0">
          <button
            onClick={onSelectAll}
            aria-label={allSelected ? "Deselect all" : "Select all"}
            className="flex items-center gap-2 group"
          >
            <div className="h-[14px] w-[14px] rounded border flex items-center justify-center flex-shrink-0 transition-colors"
              style={{
                backgroundColor: allSelected || someSelected ? "var(--color-brand)" : undefined,
                borderColor: allSelected || someSelected ? "var(--color-brand)" : "var(--color-border-strong)",
              }}
            >
              {allSelected && (
                <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                  <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {someSelected && (
                <svg width="8" height="2" viewBox="0 0 8 2" fill="none">
                  <path d="M1 1h6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
            </div>
            <span className="text-[12px] text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)] transition-colors select-none">
              {allSelected ? "Deselect all" : someSelected ? `${checkedIds.length} selected` : "Select all"}
            </span>
          </button>
        </div>
      )}
      {groups.map((group) => (
        <div key={group.status} role="rowgroup">
          {groups.length > 1 && (
            <RequestGroupHeader
              status={group.status}
              count={group.items.length}
              onAddToGroup={onAddToGroup ? () => onAddToGroup(group.status) : undefined}
              statusLabels={statusLabels}
            />
          )}
          {group.items.map((request) => (
            <RequestRow
              key={request.id}
              request={request}
              displayId={displayIdMap[request.id] ?? "KEL-???"}
              isOpen={openId === request.id}
              isChecked={checkedIds.includes(request.id)}
              isFocused={focusedId === request.id}
              onOpen={onOpen}
              onCheck={onCheck}
              onStatusChange={onStatusChange}
              onSendToPrioritize={onSendToPrioritize}
              onSendToIdeas={onSendToIdeas}
              onDelete={onDelete}
              allowedStatuses={allowedStatuses}
              statusLabels={statusLabels}
              hideStatusIcon={hideStatusIcon}
              rowRef={registerRef(request.id)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
