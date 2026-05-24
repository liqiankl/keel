"use client";

import { useMemo } from "react";
import { Globe, AlertTriangle, Lock } from "lucide-react";
import { useViewsStore, findViewByToken } from "@/store/useViewsStore";
import { useRoadmapStore } from "@/store/useRoadmapStore";
import type { InitiativeStatus, RoadmapItem } from "@/types";

// ─────────────────────────────────────────────
// SharedRoadmapView — public read-only view of
// a quarterly roadmap shared via a token link.
// No auth required; renders outside (app) layout.
// ─────────────────────────────────────────────

const STATUS_LABEL: Record<InitiativeStatus, string> = {
  backlog: "Backlog",
  todo: "Planned",
  in_progress: "In Progress",
  done: "Done",
  canceled: "Canceled",
};

const STATUS_DOT: Record<InitiativeStatus, string> = {
  backlog: "bg-[#6b7280]",
  todo: "bg-[#3b82f6]",
  in_progress: "bg-[#f59e0b]",
  done: "bg-[#22c55e]",
  canceled: "bg-[#ef4444]",
};

const VISIBLE_STATUSES: InitiativeStatus[] = [
  "backlog",
  "todo",
  "in_progress",
  "done",
  "canceled",
];

interface SharedRoadmapViewProps {
  token: string;
}

export function SharedRoadmapView({ token }: SharedRoadmapViewProps) {
  const views = useViewsStore((s) => s.views);
  const plans = useRoadmapStore((s) => s.plans);

  const view = useMemo(() => findViewByToken(views, token), [views, token]);
  const plan = useMemo(
    () => (view ? plans.find((p) => p.id === view.planId) ?? null : null),
    [view, plans],
  );

  // Not found or revoked
  if (!view) {
    return (
      <NotFoundState
        title="View not found"
        message="This share link doesn't exist or may have been removed."
      />
    );
  }

  if (view.revokedAt) {
    return (
      <NotFoundState
        title="Link revoked"
        message="Access to this roadmap has been revoked by the owner."
        icon="lock"
      />
    );
  }

  if (!plan) {
    return (
      <NotFoundState
        title="Roadmap unavailable"
        message="The roadmap this link points to could not be found."
      />
    );
  }

  const showEffort  = !view.hiddenFields.includes("effort");
  const showScores  = !view.hiddenFields.includes("scores");

  const itemsByStatus = Object.fromEntries(
    VISIBLE_STATUSES.map((s) => [s, plan.items.filter((i) => i.status === s)]),
  ) as Record<InitiativeStatus, RoadmapItem[]>;

  const nonEmptyStatuses = VISIBLE_STATUSES.filter(
    (s) =>
      (itemsByStatus[s]?.length ?? 0) > 0 ||
      s === "backlog" ||
      s === "todo" ||
      s === "in_progress",
  );

  return (
    <div className="min-h-screen bg-[#0d0d12] text-white">
      {/* Top bar */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded bg-[#6366f1] flex items-center justify-center">
            <Globe size={12} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white">{plan.quarter.label} Roadmap</h1>
            <p className="text-xs text-white/50">Read-only · Shared by {view.createdBy}</p>
          </div>
        </div>
        <span className="text-xs text-white/40 border border-white/10 rounded-full px-2.5 py-1">
          Read-only
        </span>
      </header>

      {/* Goals strip */}
      {plan.goals.length > 0 && (
        <div className="border-b border-white/10 px-6 py-3 flex flex-wrap gap-2">
          {plan.goals.map((g) => (
            <span
              key={g.id}
              className="flex items-center gap-1.5 text-xs rounded-full px-2.5 py-1 border"
              style={{
                borderColor: g.color + "55",
                backgroundColor: g.color + "18",
                color: g.color,
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: g.color }}
              />
              {g.title}
            </span>
          ))}
        </div>
      )}

      {/* Board */}
      <div className="overflow-x-auto">
        <div className="flex gap-4 px-6 py-5 min-w-max">
          {nonEmptyStatuses.map((status) => {
            const items = itemsByStatus[status] ?? [];
            return (
              <div key={status} className="w-[280px] flex-shrink-0">
                {/* Column header */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`h-2 w-2 rounded-full ${STATUS_DOT[status]}`} />
                  <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">
                    {STATUS_LABEL[status]}
                  </span>
                  <span className="ml-auto text-xs text-white/40">{items.length}</span>
                </div>

                {/* Cards */}
                <div className="space-y-2">
                  {items.map((item) => (
                    <InitiativeCard
                      key={item.id}
                      item={item}
                      goals={plan.goals}
                      showEffort={showEffort}
                      showScores={showScores}
                    />
                  ))}
                  {items.length === 0 && (
                    <div className="h-16 rounded-lg border border-dashed border-white/10 flex items-center justify-center">
                      <span className="text-xs text-white/25">Empty</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-3 text-center">
        <p className="text-xs text-white/25">
          Powered by Keel · {plan.items.length} initiatives
        </p>
      </footer>
    </div>
  );
}

// ── Sub-components ─────────────────────────────

interface InitiativeCardProps {
  item: RoadmapItem;
  goals: { id: string; color: string; title: string }[];
  showEffort: boolean;
  showScores: boolean;
}

function InitiativeCard({ item, goals, showEffort }: InitiativeCardProps) {
  const linkedGoals = goals.filter((g) => item.goalIds.includes(g.id));

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-2">
      <p className="text-sm text-white/90 leading-snug">{item.title}</p>

      <div className="flex items-center gap-2 flex-wrap">
        {/* Priority dot */}
        <PriorityBadge priority={item.priority} />

        {/* Effort */}
        {showEffort && item.effort.points != null && (
          <span className="text-[10px] text-white/40 border border-white/10 rounded px-1.5 py-0.5">
            {item.effort.points} pts
          </span>
        )}

        {/* Goal dots */}
        {linkedGoals.map((g) => (
          <span
            key={g.id}
            className="h-2 w-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: g.color }}
            title={g.title}
          />
        ))}
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, { label: string; color: string }> = {
    urgent: { label: "Urgent", color: "#ef4444" },
    high:   { label: "High",   color: "#f97316" },
    medium: { label: "Medium", color: "#f59e0b" },
    low:    { label: "Low",    color: "#6b7280" },
    none:   { label: "None",   color: "#374151" },
  };
  const p = map[priority] ?? map.none;
  return (
    <span
      className="text-[10px] font-medium rounded px-1.5 py-0.5"
      style={{ color: p.color, backgroundColor: p.color + "22" }}
    >
      {p.label}
    </span>
  );
}

interface NotFoundStateProps {
  title: string;
  message: string;
  icon?: "warning" | "lock";
}

function NotFoundState({ title, message, icon = "warning" }: NotFoundStateProps) {
  const Icon = icon === "lock" ? Lock : AlertTriangle;
  return (
    <div className="min-h-screen bg-[#0d0d12] flex flex-col items-center justify-center text-white">
      <div className="flex flex-col items-center gap-4 max-w-sm text-center px-6">
        <div className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <Icon size={20} className="text-white/40" />
        </div>
        <h1 className="text-lg font-semibold text-white">{title}</h1>
        <p className="text-sm text-white/50">{message}</p>
      </div>
    </div>
  );
}
