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
    tab === "new" ? "new" : tab === "triaged" ? "triaged" : "archived";
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
    const cfg = EMPTY_STATE_CONFIG[activeTab];
    return (
      <div className="flex flex-1 items-center justify-center overflow-y-auto">
        <EmptyState
          Icon={cfg.Icon}
          title={cfg.title}
          description={cfg.description}
          action={{ label: cfg.actionLabel, onClick: () => undefined }}
        />
      </div>
    );
  }

  return (
    <div
      role="grid"
      aria-label="Feature requests"
      aria-rowcount={filteredRequests.length}
      className="flex-1 overflow-y-auto"
    >
      {groups.map((group) => (
        <div key={group.status} role="rowgroup">
          <RequestGroupHeader
            status={group.status}
            count={group.items.length}
            onAddToGroup={onAddToGroup ? () => onAddToGroup(group.status) : undefined}
          />
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
              rowRef={registerRef(request.id)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
