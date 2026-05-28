"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useStore } from "zustand";
import { Map } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { WorkflowBar } from "@/components/workflow/WorkflowBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { RoadmapItemDetail } from "./RoadmapItemDetail";
import { useRoadmapStore } from "@/store/useRoadmapStore";
import { useAppStore } from "@/store/useAppStore";
import { TEAMS } from "@/lib/constants";
import { useGlobalShortcuts } from "@/hooks/useGlobalShortcuts";
import { cn } from "@/lib/cn";
import type { InitiativeStatus, QuarterlyPlan, RoadmapItem } from "@/types";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

type QuarterTab = "q2" | "q3" | "q4" | "year";

const QUARTER_TABS: { key: QuarterTab; label: string }[] = [
  { key: "q2", label: "Q2 2026" },
  { key: "q3", label: "Q3 2026" },
  { key: "q4", label: "Q4 2026" },
  { key: "year", label: "Full Year" },
];

const QUARTER_MONTHS: Record<string, { short: string; long: string }[]> = {
  q1: [{ short: "Jan", long: "January" }, { short: "Feb", long: "February" }, { short: "Mar", long: "March" }],
  q2: [{ short: "Apr", long: "April" },  { short: "May", long: "May" },      { short: "Jun", long: "June" }],
  q3: [{ short: "Jul", long: "July" },   { short: "Aug", long: "August" },   { short: "Sep", long: "September" }],
  q4: [{ short: "Oct", long: "October" },{ short: "Nov", long: "November" }, { short: "Dec", long: "December" }],
};

const TOTAL_WEEKS = 12;
const LABEL_W = 256; // px — left sticky label column

const STATUS_META: Record<InitiativeStatus, { color: string; label: string }> = {
  backlog:     { color: "#64748b", label: "Backlog" },
  todo:        { color: "#8b5cf6", label: "Planned" },
  in_progress: { color: "#5e5ce6", label: "In Progress" },
  in_review:   { color: "#f59e0b", label: "In Review" },
  done:        { color: "#22c55e", label: "Done" },
  closed:      { color: "#94a3b8", label: "Closed" },
  canceled:    { color: "#94a3b8", label: "Canceled" },
};

const PRIORITY_COLOR: Record<string, string> = {
  urgent: "#e5484d",
  high:   "#f97316",
  medium: "#5e5ce6",
  low:    "#94a3b8",
};

const STATUS_SORT: Partial<Record<InitiativeStatus, number>> = {
  in_progress: 0, in_review: 1, done: 2, todo: 3, backlog: 4, closed: 5, canceled: 6,
};
const PRIO_SORT: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

// ─────────────────────────────────────────────
// Auto-placement (items have no date fields — distribute by priority + status)
// ─────────────────────────────────────────────

function getStartWeek(item: RoadmapItem): number {
  if (item.status === "done" || item.status === "in_progress") return 1;
  if (item.status === "in_review") return 3;
  if (item.status === "todo") {
    if (item.priority === "urgent") return 1;
    if (item.priority === "high")   return 3;
    if (item.priority === "medium") return 6;
    return 9;
  }
  if (item.priority === "urgent") return 2;
  if (item.priority === "high")   return 5;
  if (item.priority === "medium") return 8;
  return 10;
}

function getDurationWeeks(item: RoadmapItem): number {
  const pts = item.effort.points;
  if (!pts) return 3;
  if (pts <= 8)  return 1;
  if (pts <= 21) return 2;
  if (pts <= 55) return 3;
  if (pts <= 89) return 4;
  return Math.min(6, Math.ceil(pts / 15));
}

function sortItems(items: RoadmapItem[]): RoadmapItem[] {
  return [...items].sort((a, b) => {
    const sd = (STATUS_SORT[a.status] ?? 5) - (STATUS_SORT[b.status] ?? 5);
    return sd !== 0 ? sd : (PRIO_SORT[a.priority] ?? 3) - (PRIO_SORT[b.priority] ?? 3);
  });
}

// ─────────────────────────────────────────────
// Today marker
// ─────────────────────────────────────────────

function getTodayPercent(qKey: string): number | null {
  const now = new Date();
  const y = now.getFullYear();
  const RANGES: Record<string, [Date, Date]> = {
    q1: [new Date(y, 0, 1),  new Date(y, 2, 31)],
    q2: [new Date(y, 3, 1),  new Date(y, 5, 30)],
    q3: [new Date(y, 6, 1),  new Date(y, 8, 30)],
    q4: [new Date(y, 9, 1),  new Date(y, 11, 31)],
  };
  const r = RANGES[qKey];
  if (!r) return null;
  const t = now.getTime();
  if (t < r[0].getTime() || t > r[1].getTime()) return null;
  return ((t - r[0].getTime()) / (r[1].getTime() - r[0].getTime())) * 100;
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function TimelineGrid({ todayPct }: { todayPct: number | null }) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Past shade */}
      {todayPct !== null && (
        <div
          className="absolute inset-y-0 left-0"
          style={{ width: `${todayPct}%`, backgroundColor: "rgba(0,0,0,0.025)" }}
        />
      )}
      {/* Week grid lines */}
      {Array.from({ length: TOTAL_WEEKS - 1 }).map((_, i) => (
        <div
          key={i}
          className="absolute top-0 bottom-0"
          style={{
            left: `${((i + 1) / TOTAL_WEEKS) * 100}%`,
            width: "1px",
            backgroundColor: (i + 1) % 4 === 0
              ? "var(--color-border-subtle)"
              : "var(--color-border-subtle)",
            opacity: (i + 1) % 4 === 0 ? 0.8 : 0.35,
          }}
        />
      ))}
      {/* Today line */}
      {todayPct !== null && (
        <>
          <div
            className="absolute top-0 bottom-0 z-10"
            style={{ left: `${todayPct}%`, width: "2px", backgroundColor: "#e5484d" }}
          />
          <div
            className="absolute top-1 z-10 -translate-x-1/2 text-[9px] font-bold text-white bg-[#e5484d] rounded px-1 py-0.5 leading-none"
            style={{ left: `${todayPct}%` }}
          >
            TODAY
          </div>
        </>
      )}
    </div>
  );
}

function GanttBar({
  item,
  isOpen,
  onOpen,
}: {
  item: RoadmapItem;
  isOpen: boolean;
  onOpen: (id: string) => void;
}) {
  const startWeek = getStartWeek(item);
  const dur = getDurationWeeks(item);
  const end = Math.min(startWeek + dur - 1, TOTAL_WEEKS);
  const actualDur = end - startWeek + 1;
  const leftPct  = ((startWeek - 1) / TOTAL_WEEKS) * 100;
  const widthPct = (actualDur / TOTAL_WEEKS) * 100;
  const { color } = STATUS_META[item.status] ?? { color: "#94a3b8" };

  return (
    <div
      className="absolute inset-y-0 flex items-center px-1"
      style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
    >
      <button
        onClick={() => onOpen(item.id)}
        className={cn(
          "w-full h-8 rounded-lg flex items-center gap-1.5 px-2.5 text-left",
          "transition-all duration-100 hover:brightness-110 active:scale-[0.99]",
          "shadow-[0_1px_3px_rgba(0,0,0,0.08)]",
          isOpen && "ring-2 ring-offset-1",
        )}
        style={{
          backgroundColor: `${color}28`,
          border: `1.5px solid ${color}66`,
          ...(isOpen ? { ringColor: color } : {}),
        }}
        title={`${item.title} · ${STATUS_META[item.status]?.label}`}
      >
        <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
        <span className="text-[11px] font-semibold truncate" style={{ color }}>
          {item.title}
        </span>
        {actualDur >= 3 && item.effort.points && (
          <span
            className="ml-auto text-[10px] tabular-nums flex-shrink-0 opacity-70"
            style={{ color }}
          >
            {item.effort.points}pt
          </span>
        )}
      </button>
    </div>
  );
}

function ItemRow({
  item,
  isOpen,
  onOpen,
  todayPct,
}: {
  item: RoadmapItem;
  isOpen: boolean;
  onOpen: (id: string) => void;
  todayPct: number | null;
}) {
  const { color, label } = STATUS_META[item.status] ?? { color: "#94a3b8", label: item.status };
  const priColor = PRIORITY_COLOR[item.priority] ?? "#94a3b8";

  return (
    <div
      className={cn(
        "flex border-b border-[var(--color-border-subtle)] h-[52px] flex-shrink-0",
        isOpen ? "bg-[var(--color-brand)]/[0.04]" : "hover:bg-[var(--color-bg-hover)]",
        "transition-colors",
      )}
    >
      {/* Label column */}
      <div
        className="flex items-center gap-2.5 px-3 flex-shrink-0 border-r border-[var(--color-border-subtle)]"
        style={{ width: LABEL_W }}
      >
        <div
          className="h-2.5 w-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
          title={label}
        />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-[var(--color-text-primary)] truncate leading-snug">
            {item.title}
          </p>
          <p className="text-[11px] text-[var(--color-text-muted)] truncate leading-snug">
            {item.productArea || label}
          </p>
        </div>
        <div
          className="h-[5px] w-[5px] rounded-full flex-shrink-0"
          style={{ backgroundColor: priColor }}
          title={item.priority}
        />
      </div>

      {/* Gantt area */}
      <div className="flex-1 relative overflow-hidden">
        <TimelineGrid todayPct={todayPct} />
        <GanttBar item={item} isOpen={isOpen} onOpen={onOpen} />
      </div>
    </div>
  );
}

function MonthHeader({ qKey }: { qKey: string }) {
  const months = QUARTER_MONTHS[qKey] ?? [];
  return (
    <div className="flex flex-1">
      {months.map((m) => (
        <div key={m.long} className="flex-1 border-l border-[var(--color-border-subtle)] first:border-l-0">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-[var(--color-text-secondary)] bg-[var(--color-bg-elevated)]">
            {m.long}
          </div>
          <div className="flex bg-[var(--color-bg-elevated)]">
            {[1, 2, 3, 4].map((w) => (
              <div
                key={w}
                className="flex-1 py-1 text-[10px] text-[var(--color-text-muted)] text-center border-l border-[var(--color-border-subtle)]/50 first:border-l-0"
              >
                W{w}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Year overview (kept as card grid)
// ─────────────────────────────────────────────

const YEAR_STATUS_COLORS: Record<string, string> = {
  draft: "#94a3b8", in_review: "#f59e0b", locked: "#22c55e", archived: "#64748b",
};

function YearOverview({ plans, teamName }: { plans: QuarterlyPlan[]; teamName: string }) {
  const allItems = plans.flatMap((p) => p.items);
  const done = allItems.filter((i) => i.status === "done").length;
  const inProg = allItems.filter((i) => i.status === "in_progress").length;

  return (
    <div className="flex-1 overflow-y-auto px-5 py-5">
      <div className="mb-5 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-5 py-4 flex items-center gap-8 flex-wrap">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-0.5">Team</p>
          <p className="text-[13px] font-bold text-[var(--color-text-primary)]">{teamName}</p>
        </div>
        <div className="h-6 w-px bg-[var(--color-border-subtle)]" />
        {[
          { label: "Quarters planned", value: plans.length },
          { label: "Initiatives",      value: allItems.length },
          { label: "In progress",      value: inProg },
          { label: "Done",             value: done },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-0.5">{label}</p>
            <p className="text-[15px] font-bold text-[var(--color-text-primary)]">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {([2, 3, 4] as const).map((qNum) => {
          const plan = plans.find((p) => p.quarter.quarter === qNum);
          const label = `Q${qNum} 2026`;
          if (!plan) {
            return (
              <div key={qNum} className="rounded-xl border border-dashed border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] p-5 flex flex-col items-center justify-center min-h-[200px]">
                <p className="text-[12px] font-semibold text-[var(--color-text-muted)] mb-1">{label}</p>
                <p className="text-[12px] text-[var(--color-text-muted)]">No plan yet</p>
              </div>
            );
          }
          const sorted = sortItems(plan.items);
          const capPct = plan.capacity.total > 0
            ? Math.round((plan.capacity.committed / plan.capacity.total) * 100)
            : 0;
          return (
            <div key={qNum} className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-bold text-[var(--color-text-primary)]">{label}</p>
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    color: YEAR_STATUS_COLORS[plan.status] ?? "#94a3b8",
                    backgroundColor: `${YEAR_STATUS_COLORS[plan.status] ?? "#94a3b8"}18`,
                  }}
                >
                  {plan.status}
                </span>
              </div>
              <div>
                <div className="flex justify-between text-[11px] text-[var(--color-text-muted)] mb-1.5">
                  <span>Capacity</span>
                  <span>{plan.capacity.committed}/{plan.capacity.total} pts · {capPct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--color-bg-elevated)] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(capPct, 100)}%`,
                      backgroundColor: capPct >= 90 ? "#e5484d" : "var(--color-brand)",
                    }}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                {sorted.slice(0, 5).map((item) => {
                  const { color } = STATUS_META[item.status] ?? { color: "#94a3b8" };
                  return (
                    <div key={item.id} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-[12px] text-[var(--color-text-secondary)] truncate">{item.title}</span>
                    </div>
                  );
                })}
                {plan.items.length > 5 && (
                  <p className="text-[11px] text-[var(--color-text-muted)] pl-3.5">+{plan.items.length - 5} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main view
// ─────────────────────────────────────────────

interface RoadmapViewProps {
  initialTeam?: string;
}

export function RoadmapView({ initialTeam }: RoadmapViewProps = {}) {
  const [activeTab, setActiveTab] = useState<QuarterTab>("q2");
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  const { plans, updateItemInPlan } = useRoadmapStore();
  const activeTeamId  = useAppStore((s) => s.activeTeamId);
  const setActiveTeamId = useAppStore((s) => s.setActiveTeamId);
  const temporal = useStore(useRoadmapStore.temporal);

  useEffect(() => {
    if (initialTeam) {
      const team = TEAMS.find((t) => t.slug === initialTeam);
      if (team) setActiveTeamId(team.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTeam]);

  const activeTeam  = useMemo(() => TEAMS.find((t) => t.id === activeTeamId), [activeTeamId]);
  const teamPlans   = useMemo(() => plans.filter((p) => p.teamId === activeTeamId), [plans, activeTeamId]);

  const activePlan = useMemo<QuarterlyPlan | null>(() => {
    if (activeTab === "year") return null;
    const qNum = parseInt(activeTab[1]) as 1 | 2 | 3 | 4;
    return teamPlans.find((p) => p.quarter.quarter === qNum) ?? null;
  }, [teamPlans, activeTab]);

  const sortedItems = useMemo(
    () => (activePlan ? sortItems(activePlan.items) : []),
    [activePlan],
  );

  const todayPct = useMemo(
    () => (activeTab !== "year" ? getTodayPercent(activeTab) : null),
    [activeTab],
  );

  const openItem = useMemo(
    () => activePlan?.items.find((i) => i.id === openItemId) ?? null,
    [activePlan, openItemId],
  );

  useGlobalShortcuts({
    escape: () => { if (openItemId) setOpenItemId(null); },
    undo: () => temporal.undo(),
    redo: () => temporal.redo(),
  });

  const hasDetail   = !!openItem;
  const headerTitle = activeTeam ? `${activeTeam.name} · Roadmap` : "Roadmap";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title={headerTitle} />
      {initialTeam && <WorkflowBar currentStage="roadmap" teamSlug={initialTeam} />}

      {/* ── Quarter tabs ── */}
      <div
        className="flex items-center border-b border-[var(--color-border-subtle)] px-4 h-10 flex-shrink-0"
        role="tablist"
      >
        {QUARTER_TABS.map(({ key, label }) => (
          <button
            key={key}
            role="tab"
            aria-selected={activeTab === key}
            onClick={() => { setActiveTab(key); setOpenItemId(null); }}
            className={cn(
              "relative flex items-center h-full px-3 text-[13px] transition-colors",
              key === "year" && "ml-4 pl-4 border-l border-[var(--color-border-subtle)]",
              activeTab === key
                ? "text-[var(--color-text-primary)] font-medium"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]",
            )}
          >
            {label}
            {activeTab === key && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[var(--color-brand)]" />
            )}
          </button>
        ))}

        {/* Item count + legend chips */}
        {activeTab !== "year" && activePlan && (
          <div className="ml-auto flex items-center gap-3">
            <span className="text-[12px] text-[var(--color-text-muted)]">
              {activePlan.items.length} initiative{activePlan.items.length !== 1 ? "s" : ""}
            </span>
            {todayPct !== null && (
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-[2px] bg-[#e5484d] rounded-full" />
                <span className="text-[11px] text-[var(--color-text-muted)]">Today</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Year view ── */}
      {activeTab === "year" && (
        <YearOverview plans={teamPlans} teamName={activeTeam?.name ?? "Team"} />
      )}

      {/* ── Empty state ── */}
      {activeTab !== "year" && !activePlan && (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            Icon={Map}
            title="No plan for this quarter"
            description="Send initiatives to the roadmap from the Prioritization phase to see them here."
          />
        </div>
      )}

      {/* ── Timeline + detail ── */}
      {activeTab !== "year" && activePlan && (
        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* Timeline panel */}
          <div className={cn(
            "flex flex-col overflow-hidden transition-all duration-200",
            hasDetail ? "hidden md:flex md:[flex:0_0_60%]" : "flex-1",
          )}>

            {/* Sticky header row */}
            <div className="flex flex-shrink-0 sticky top-0 z-20 border-b-2 border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]">
              {/* Label column header */}
              <div
                className="flex-shrink-0 flex items-end px-3 pb-1 border-r border-[var(--color-border-subtle)]"
                style={{ width: LABEL_W }}
              >
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
                  Initiative
                </span>
              </div>
              {/* Month/week headers */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <MonthHeader qKey={activeTab} />
              </div>
            </div>

            {/* Rows */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              {sortedItems.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-[13px] text-[var(--color-text-muted)]">No initiatives in this plan.</p>
                </div>
              ) : (
                sortedItems.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    isOpen={openItemId === item.id}
                    onOpen={setOpenItemId}
                    todayPct={todayPct}
                  />
                ))
              )}
            </div>

            {/* Status legend */}
            <div className="flex-shrink-0 border-t border-[var(--color-border-subtle)] px-4 py-2 flex items-center gap-4 flex-wrap bg-[var(--color-bg-elevated)]">
              {(Object.entries(STATUS_META) as [InitiativeStatus, { color: string; label: string }][]).map(
                ([status, { color, label }]) => (
                  <div key={status} className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-[11px] text-[var(--color-text-muted)]">{label}</span>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Detail panel */}
          {hasDetail && openItem && (
            <div className="flex flex-col overflow-hidden flex-1 md:[flex:0_0_40%] border-l border-[var(--color-border-subtle)]">
              <RoadmapItemDetail
                item={openItem}
                goals={activePlan.goals}
                planId={activePlan.id}
                onClose={() => setOpenItemId(null)}
                onStatusChange={(itemId, planId, status) =>
                  updateItemInPlan(planId, itemId, { status })
                }
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
