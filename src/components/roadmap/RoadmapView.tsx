"use client";

import { useMemo, useState, useEffect } from "react";
import { useStore } from "zustand";
import { Share2, Map } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { WorkflowBar } from "@/components/workflow/WorkflowBar";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CapacityBar } from "./CapacityBar";
import { GoalsStrip } from "./GoalsStrip";
import { PlanStatusBadge } from "./PlanStatusBadge";
import { StatusColumn } from "./StatusColumn";
import { ShareModal } from "./ShareModal";
import { RoadmapItemDetail } from "./RoadmapItemDetail";
import { useToast } from "@/components/ui/Toast";
import {
  useRoadmapStore,
  selectCapacityPercent,
} from "@/store/useRoadmapStore";
import { useAppStore } from "@/store/useAppStore";
import { TEAMS, STATUS_CONFIG } from "@/lib/constants";
import { useGlobalShortcuts } from "@/hooks/useGlobalShortcuts";
import { cn } from "@/lib/cn";
import type { InitiativeStatus, PlanStatus, QuarterlyPlan, RoadmapItem } from "@/types";

type QuarterTab = "q2" | "q3" | "q4" | "year";
const QUARTER_TABS: { key: QuarterTab; label: string }[] = [
  { key: "q2", label: "Q2 2026" },
  { key: "q3", label: "Q3 2026" },
  { key: "q4", label: "Q4 2026" },
  { key: "year", label: "2026" },
];

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
  "in_review",
  "closed",
  "done",
  "canceled",
];

interface RoadmapViewProps {
  initialTeam?: string;
}

export function RoadmapView({ initialTeam }: RoadmapViewProps = {}) {
  const [shareOpen, setShareOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<QuarterTab>("q2");
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const { showToast, ToastContainer } = useToast();

  const { plans, setPlanStatus, lockPlan, updatePlan, updateItemInPlan } = useRoadmapStore();
  const activeTeamId = useAppStore((s) => s.activeTeamId);
  const setActiveTeamId = useAppStore((s) => s.setActiveTeamId);
  const temporal = useStore(useRoadmapStore.temporal);

  useEffect(() => {
    if (initialTeam) {
      const team = TEAMS.find((t) => t.slug === initialTeam);
      if (team) setActiveTeamId(team.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTeam]);

  const activeTeam = useMemo(
    () => TEAMS.find((t) => t.id === activeTeamId),
    [activeTeamId],
  );

  // Plans for this team, indexed by quarter number
  const teamPlans = useMemo(
    () => plans.filter((p) => p.teamId === activeTeamId),
    [plans, activeTeamId],
  );

  // Active plan for the selected quarter tab (null for year view)
  const activePlan = useMemo<QuarterlyPlan | null>(() => {
    if (activeTab === "year") return null;
    const qNum = parseInt(activeTab[1]) as 1 | 2 | 3 | 4;
    return teamPlans.find((p) => p.quarter.quarter === qNum) ?? null;
  }, [teamPlans, activeTab]);

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
      (s) => (itemsByStatus[s]?.length ?? 0) > 0 || s === "backlog" || s === "in_progress"
    ),
    [itemsByStatus],
  );

  function handleStatusChange(status: PlanStatus) {
    if (!activePlan) return;
    if (status === "locked") lockPlan(activePlan.id, "u_pm_01");
    else setPlanStatus(activePlan.id, status);
  }

  function handleDropItem(itemId: string, dropPlanId: string, newStatus: InitiativeStatus) {
    const plan = plans.find((p) => p.id === dropPlanId);
    const item = plan?.items.find((i) => i.id === itemId);
    if (item && item.status !== newStatus) {
      const label = STATUS_CONFIG[newStatus]?.label ?? newStatus;
      showToast(`"${item.title}" → ${label}`);
    }
    updateItemInPlan(dropPlanId, itemId, { status: newStatus });
  }

  function handleOpenItem(id: string) {
    setOpenItemId((prev) => (prev === id ? null : id));
  }

  function handleItemStatusChange(itemId: string, planId: string, status: InitiativeStatus) {
    const plan = plans.find((p) => p.id === planId);
    const item = plan?.items.find((i) => i.id === itemId);
    if (item && item.status !== status) {
      const label = STATUS_CONFIG[status]?.label ?? status;
      showToast(`"${item.title}" → ${label}`);
    }
    updateItemInPlan(planId, itemId, { status });
  }

  function handleShareLinkGenerated(link: string) {
    if (!activePlan) return;
    updatePlan(activePlan.id, { shareLink: link });
  }

  useGlobalShortcuts({
    escape: () => {
      if (shareOpen) { setShareOpen(false); return; }
      if (openItemId) { setOpenItemId(null); return; }
    },
    undo: () => temporal.undo(),
    redo: () => temporal.redo(),
  });

  const headerTitle = activeTeam
    ? `${activeTeam.name} · Roadmap`
    : "Roadmap";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Header ── */}
      <Header
        title={headerTitle}
        rightSlot={
          activePlan ? (
            <div className="flex items-center gap-2">
              <PlanStatusBadge
                status={activePlan.status}
                onChange={handleStatusChange}
                disabled={activePlan.status === "locked"}
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
          ) : undefined
        }
      />

      {/* ── Workflow bar ── */}
      {initialTeam && <WorkflowBar currentStage="roadmap" teamSlug={initialTeam} />}

      {/* ── Quarter selector tabs ── */}
      <div
        className="flex items-center gap-0 border-b border-[var(--color-border-subtle)] px-4 h-10 flex-shrink-0"
        role="tablist"
        aria-label="Quarter"
      >
        {QUARTER_TABS.map(({ key, label }) => (
          <button
            key={key}
            role="tab"
            aria-selected={activeTab === key}
            onClick={() => { setActiveTab(key); setOpenItemId(null); }}
            className={cn(
              "relative flex items-center h-full px-3 text-[13px] transition-colors duration-100",
              "focus-visible:outline-2 focus-visible:outline-[var(--color-brand)] focus-visible:outline-offset-[-2px]",
              key === "year" && "ml-3",
              activeTab === key
                ? "text-[var(--color-text-primary)] font-medium"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]",
            )}
          >
            {label}
            {activeTab === key && (
              <span
                className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[var(--color-brand)]"
                aria-hidden="true"
              />
            )}
          </button>
        ))}
      </div>

      {/* ── Year overview ── */}
      {activeTab === "year" && (
        <YearOverview plans={teamPlans} teamName={activeTeam?.name ?? "Team"} />
      )}

      {/* ── Quarter plan view ── */}
      {activeTab !== "year" && !activePlan && (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            Icon={Map}
            title="No plan for this quarter"
            description="No plan has been created for this quarter yet."
            action={{ label: "Create plan", onClick: () => undefined }}
          />
        </div>
      )}

      <ToastContainer />

      {activeTab !== "year" && activePlan && (
        <>
          {/* ── Capacity bar ── */}
          <CapacityBar
            committed={activePlan.capacity.committed}
            total={activePlan.capacity.total}
            warningThreshold={activePlan.capacity.warningThreshold}
            unit={activePlan.capacity.unit === "story_points" ? "pts" : activePlan.capacity.unit}
            itemCount={activePlan.items.length}
          />

          {/* ── Goals strip ── */}
          <GoalsStrip goals={activePlan.goals} />

          {/* ── Kanban board + detail split ── */}
          <div className="flex flex-1 overflow-hidden min-h-0">
            {/* Board */}
            <div
              className={cn(
                "overflow-x-auto overflow-y-hidden transition-all duration-200",
                openItemId ? "hidden md:block md:[flex:0_0_60%]" : "flex-1",
              )}
            >
              <div className="flex gap-3 h-full px-4 py-4 min-w-max">
                {nonEmptyStatuses.map((status) => (
                  <StatusColumn
                    key={status}
                    status={status}
                    items={itemsByStatus[status] ?? []}
                    goals={activePlan.goals}
                    planId={activePlan.id}
                    openId={openItemId}
                    onDropItem={handleDropItem}
                    onOpen={handleOpenItem}
                  />
                ))}
              </div>
            </div>

            {/* Detail panel */}
            {openItemId && (() => {
              const openItem = activePlan.items.find((i) => i.id === openItemId) ?? null;
              return openItem ? (
                <div className="flex flex-col overflow-hidden flex-1 md:[flex:0_0_40%]">
                  <RoadmapItemDetail
                    item={openItem}
                    goals={activePlan.goals}
                    planId={activePlan.id}
                    onClose={() => setOpenItemId(null)}
                    onStatusChange={handleItemStatusChange}
                  />
                </div>
              ) : null;
            })()}
          </div>

          {/* ── Share modal ── */}
          <ShareModal
            open={shareOpen}
            planId={activePlan.id}
            quarterLabel={activePlan.quarter.label}
            onClose={() => setShareOpen(false)}
            onShareLinkGenerated={handleShareLinkGenerated}
          />
        </>
      )}
    </div>
  );
}

// ── Year Overview ─────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  draft:     "var(--color-text-muted)",
  in_review: "var(--color-warning)",
  locked:    "var(--color-success)",
  archived:  "var(--color-text-muted)",
};
const STATUS_LABELS: Record<string, string> = {
  draft:     "Draft",
  in_review: "In review",
  locked:    "Locked",
  archived:  "Archived",
};

function YearOverview({ plans, teamName }: { plans: QuarterlyPlan[]; teamName: string }) {
  const allItems = plans.flatMap((p) => p.items);
  const totalInitiatives = allItems.length;
  const doneCount  = allItems.filter((i) => i.status === "done").length;
  const inProgCount = allItems.filter((i) => i.status === "in_progress").length;
  const totalPts   = plans.reduce((s, p) => s + (p.capacity.committed ?? 0), 0);

  const QUARTERS = [2, 3, 4] as const;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5">
      {/* Year summary bar */}
      <div className="mb-6 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-5 py-4 flex items-center gap-8 flex-wrap">
        <div>
          <p className="text-[12px] text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">Team</p>
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">{teamName}</p>
        </div>
        <div className="h-6 w-px bg-[var(--color-border-subtle)]" />
        {[
          { label: "Quarters planned", value: plans.length },
          { label: "Total initiatives", value: totalInitiatives },
          { label: "In progress",       value: inProgCount },
          { label: "Done",              value: doneCount },
          { label: "Story points",      value: `${totalPts} pts` },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-[12px] text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">{label}</p>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">{value}</p>
          </div>
        ))}
      </div>

      {/* Quarter cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {QUARTERS.map((qNum) => {
          const plan = plans.find((p) => p.quarter.quarter === qNum);
          const label = `Q${qNum} 2026`;

          if (!plan) {
            return (
              <div key={qNum} className="rounded-lg border border-dashed border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] p-5 flex flex-col items-center justify-center min-h-[180px]">
                <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-1">{label}</p>
                <p className="text-xs text-[var(--color-text-muted)]">No plan yet</p>
              </div>
            );
          }

          const capPct = Math.round((plan.capacity.committed / plan.capacity.total) * 100);
          const topItems = plan.items.slice(0, 4);

          return (
            <div key={qNum} className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-5">
              {/* Card header */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-[var(--color-text-primary)]">{label}</p>
                <span
                  className="text-[12px] font-medium px-2 py-0.5 rounded-full"
                  style={{
                    color: STATUS_COLORS[plan.status] ?? "var(--color-text-muted)",
                    backgroundColor: `color-mix(in srgb, ${STATUS_COLORS[plan.status] ?? "gray"} 12%, transparent)`,
                  }}
                >
                  {STATUS_LABELS[plan.status] ?? plan.status}
                </span>
              </div>

              {/* Goals */}
              <div className="flex flex-wrap gap-1 mb-3">
                {plan.goals.slice(0, 3).map((g) => (
                  <span
                    key={g.id}
                    className="text-[12px] px-1.5 py-0.5 rounded-full truncate max-w-[120px]"
                    style={{ backgroundColor: `${g.color}18`, color: g.color }}
                    title={g.title}
                  >
                    {g.title}
                  </span>
                ))}
              </div>

              {/* Capacity bar */}
              <div className="mb-3">
                <div className="flex justify-between text-[12px] text-[var(--color-text-muted)] mb-1">
                  <span>Capacity</span>
                  <span>{plan.capacity.committed} / {plan.capacity.total} pts · {capPct}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[var(--color-bg-elevated)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(capPct, 100)}%`,
                      backgroundColor: capPct >= 90 ? "var(--color-danger)" : "var(--color-brand)",
                    }}
                  />
                </div>
              </div>

              {/* Top initiatives */}
              <div className="space-y-1.5">
                {topItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <div
                      className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor:
                          item.status === "done" ? "var(--color-success)"
                          : item.status === "in_progress" ? "var(--color-brand)"
                          : "var(--color-border-strong)",
                      }}
                    />
                    <span className="text-[12px] text-[var(--color-text-secondary)] truncate">{item.title}</span>
                  </div>
                ))}
                {plan.items.length > 4 && (
                  <p className="text-[12px] text-[var(--color-text-muted)] pl-3.5">
                    +{plan.items.length - 4} more
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
