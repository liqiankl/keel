"use client";

import { useMemo, useState } from "react";
import { useStore } from "zustand";
import { Share2, Map } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CapacityBar } from "./CapacityBar";
import { GoalsStrip } from "./GoalsStrip";
import { PlanStatusBadge } from "./PlanStatusBadge";
import { StatusColumn } from "./StatusColumn";
import { ReviewersFooter } from "./ReviewersFooter";
import { ShareModal } from "./ShareModal";
import {
  useRoadmapStore,
  selectActivePlan,
  selectCapacityPercent,
} from "@/store/useRoadmapStore";
import { useGlobalShortcuts } from "@/hooks/useGlobalShortcuts";
import type { InitiativeStatus, PlanStatus, RoadmapItem } from "@/types";

// ─────────────────────────────────────────────
// RoadmapView — root client component for /roadmap.
// Shows:
//   - Plan header (quarter, status, share/lock)
//   - Capacity bar
//   - Goals strip
//   - Kanban columns by status
//   - Reviewers footer
// ─────────────────────────────────────────────

const VISIBLE_STATUSES: InitiativeStatus[] = [
  "backlog",
  "todo",
  "in_progress",
  "done",
  "canceled",
];

export function RoadmapView() {
  const [shareOpen, setShareOpen] = useState(false);

  const {
    plans,
    activePlanId,
    setPlanStatus,
    lockPlan,
    updatePlan,
  } = useRoadmapStore();

  const temporal = useStore(useRoadmapStore.temporal);

  // Derive active plan via useMemo to avoid unstable selector references
  const activePlan = useMemo(
    () => selectActivePlan({ plans, activePlanId, selectedQuarter: null } as Parameters<typeof selectActivePlan>[0]),
    [plans, activePlanId],
  );

  const capacityPct = useMemo(
    () => (activePlan ? selectCapacityPercent(activePlan) : 0),
    [activePlan],
  );

  // Group items by status for the board columns
  const itemsByStatus = useMemo(() => {
    if (!activePlan) return {} as Record<InitiativeStatus, RoadmapItem[]>;
    return Object.fromEntries(
      VISIBLE_STATUSES.map((s) => [
        s,
        activePlan.items.filter((i) => i.status === s),
      ]),
    ) as Record<InitiativeStatus, typeof activePlan.items>;
  }, [activePlan]);

  const nonEmptyStatuses = useMemo(
    () => VISIBLE_STATUSES.filter(
      (s) => (itemsByStatus[s]?.length ?? 0) > 0 || s === "backlog" || s === "todo" || s === "in_progress"
    ),
    [itemsByStatus],
  );

  function handleStatusChange(status: PlanStatus) {
    if (!activePlan) return;
    if (status === "locked") {
      lockPlan(activePlan.id, "u_pm_01");
    } else {
      setPlanStatus(activePlan.id, status);
    }
  }

  function handleShareLinkGenerated(link: string) {
    if (!activePlan) return;
    updatePlan(activePlan.id, { shareLink: link });
  }

  useGlobalShortcuts({
    escape: () => { if (shareOpen) setShareOpen(false); },
    undo: () => temporal.undo(),
    redo: () => temporal.redo(),
  });

  if (!activePlan) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <Header title="Roadmap" />
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            Icon={Map}
            title="No active plan"
            description="Create a quarterly plan to start building your roadmap."
            action={{ label: "New plan", onClick: () => undefined }}
          />
        </div>
      </div>
    );
  }

  const goals = activePlan.goals;
  const capacity = activePlan.capacity;
  const isLocked = activePlan.status === "locked";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Header ── */}
      <Header
        title={activePlan.quarter.label}
        rightSlot={
          <div className="flex items-center gap-2">
            <PlanStatusBadge
              status={activePlan.status}
              onChange={handleStatusChange}
              disabled={isLocked}
            />
            <Button
              variant="secondary"
              size="sm"
              className="gap-1.5"
              onClick={() => setShareOpen(true)}
              aria-label="Share roadmap"
            >
              <Share2 size={12} />
              Share
            </Button>
          </div>
        }
      />

      {/* ── Capacity bar ── */}
      <CapacityBar
        committed={capacity.committed}
        total={capacity.total}
        warningThreshold={capacity.warningThreshold}
        unit={capacity.unit === "story_points" ? "pts" : capacity.unit}
      />

      {/* ── Goals strip ── */}
      <GoalsStrip goals={goals} />

      {/* ── Kanban board ── */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {/* Quarter label row */}
        <div className="flex items-center px-4 py-2 flex-shrink-0 border-b border-[var(--color-border-subtle)]">
          <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
            {activePlan.quarter.label} · {activePlan.items.length} initiatives
          </span>
          <span className="ml-3 text-[11px] text-[var(--color-text-muted)]">
            {capacityPct}% capacity used
          </span>
        </div>

        {/* Columns */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex gap-4 h-full px-4 py-3 min-w-max">
            {nonEmptyStatuses.map((status) => (
              <StatusColumn
                key={status}
                status={status}
                items={itemsByStatus[status] ?? []}
                goals={goals}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Reviewers footer ── */}
      <ReviewersFooter
        plan={activePlan}
        onStatusChange={handleStatusChange}
      />

      {/* ── Share modal ── */}
      <ShareModal
        open={shareOpen}
        planId={activePlan.id}
        quarterLabel={activePlan.quarter.label}
        onClose={() => setShareOpen(false)}
        onShareLinkGenerated={handleShareLinkGenerated}
      />
    </div>
  );
}
