"use client";

import { cn } from "@/lib/cn";
import { InitiativeCard } from "./InitiativeCard";
import { STATUS_CONFIG } from "@/lib/constants";
import type { RoadmapItem, InitiativeStatus, QuarterlyGoal } from "@/types";

// ─────────────────────────────────────────────
// StatusColumn — a Kanban column grouping
// initiatives by their current status.
// ─────────────────────────────────────────────

interface StatusColumnProps {
  status: InitiativeStatus;
  items: RoadmapItem[];
  goals: QuarterlyGoal[];
}

export function StatusColumn({ status, items, goals }: StatusColumnProps) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.backlog;
  const totalPts = items.reduce((s, i) => s + (i.effort.points ?? 0), 0);

  return (
    <div className="flex flex-col gap-2 min-w-[220px] max-w-[280px] flex-1">
      {/* Column header */}
      <div className={cn("flex items-center gap-2 px-1 py-1.5 flex-shrink-0")}>
        <span
          className="h-2 w-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: cfg.color }}
          aria-hidden="true"
        />
        <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">
          {cfg.label}
        </span>
        <span className="text-[11px] text-[var(--color-text-muted)] tabular-nums">
          {items.length}
        </span>
        {totalPts > 0 && (
          <span className="ml-auto text-[11px] font-mono text-[var(--color-text-muted)] tabular-nums">
            {totalPts} pts
          </span>
        )}
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 overflow-y-auto flex-1 min-h-[80px]">
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--color-border-subtle)] p-4 text-center">
            <p className="text-[11px] text-[var(--color-text-muted)]">No items</p>
          </div>
        ) : (
          items.map((item) => (
            <InitiativeCard key={item.id} item={item} goals={goals} />
          ))
        )}
      </div>
    </div>
  );
}
