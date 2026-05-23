"use client";

import { cn } from "@/lib/cn";
import { PRIORITY_CONFIG, STATUS_CONFIG } from "@/lib/constants";
import type { RoadmapItem, QuarterlyGoal } from "@/types";

// ─────────────────────────────────────────────
// InitiativeCard — card rendered inside a status
// column. Shows priority border, title, RICE score,
// effort, MoSCoW label, and aligned goals.
// ─────────────────────────────────────────────

const MOSCOW_COLORS: Record<string, { color: string; bg: string }> = {
  must:   { color: "#f87171", bg: "#f8717118" },
  should: { color: "#fb923c", bg: "#fb923c18" },
  could:  { color: "#60a5fa", bg: "#60a5fa18" },
  wont:   { color: "#6b7280", bg: "#6b728018" },
};

const MOSCOW_LABELS: Record<string, string> = {
  must: "Must", should: "Should", could: "Could", wont: "Won't",
};

interface InitiativeCardProps {
  item: RoadmapItem;
  goals: QuarterlyGoal[];
}

export function InitiativeCard({ item, goals }: InitiativeCardProps) {
  const priorityCfg = PRIORITY_CONFIG[item.priority] ?? PRIORITY_CONFIG.none;
  const statusCfg   = STATUS_CONFIG[item.status]     ?? STATUS_CONFIG.backlog;
  const rice        = item.score?.rice?.score;
  const moscow      = item.score?.moscow;
  const moscowCfg   = moscow ? MOSCOW_COLORS[moscow] : null;
  const itemGoals   = goals.filter((g) => item.goalIds.includes(g.id));

  return (
    <div
      className={cn(
        "relative flex flex-col gap-2 rounded-lg border border-[var(--color-border-subtle)]",
        "bg-[var(--color-bg-surface)] p-3",
        "hover:border-[var(--color-border-strong)] transition-colors cursor-pointer",
        "overflow-hidden",
      )}
    >
      {/* Priority color left border */}
      <span
        className="absolute inset-y-0 left-0 w-[3px] rounded-l-lg"
        style={{ backgroundColor: priorityCfg.color }}
        aria-hidden="true"
      />

      {/* Title */}
      <p className="text-[13px] font-medium text-[var(--color-text-primary)] leading-snug pl-1">
        {item.title}
      </p>

      {/* Meta row */}
      <div className="flex items-center gap-2 flex-wrap pl-1">
        {/* Status */}
        <span className="flex items-center gap-1 text-[11px] text-[var(--color-text-muted)]">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: statusCfg.color }}
            aria-hidden="true"
          />
          {statusCfg.label}
        </span>

        {/* Effort */}
        {item.effort.points != null && (
          <span className="text-[11px] font-mono text-[var(--color-text-muted)] tabular-nums">
            {item.effort.points} pts
          </span>
        )}

        {/* RICE score */}
        {rice != null && rice > 0 && (
          <span
            className="text-[11px] font-mono font-medium text-[var(--color-brand)] tabular-nums"
            title="RICE score"
          >
            ⬟ {rice}
          </span>
        )}

        {/* MoSCoW */}
        {moscowCfg && moscow && (
          <span
            className="text-[10px] font-medium rounded px-1.5 py-0.5"
            style={{ backgroundColor: moscowCfg.bg, color: moscowCfg.color }}
          >
            {MOSCOW_LABELS[moscow]}
          </span>
        )}
      </div>

      {/* Goal chips */}
      {itemGoals.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap pl-1">
          {itemGoals.slice(0, 2).map((g) => (
            <span
              key={g.id}
              className="text-[10px] rounded-full px-1.5 py-0.5 font-medium truncate max-w-[120px]"
              style={{
                backgroundColor: g.color + "18",
                color: g.color,
                border: `1px solid ${g.color}33`,
              }}
              title={g.title}
            >
              {g.title}
            </span>
          ))}
          {itemGoals.length > 2 && (
            <span className="text-[10px] text-[var(--color-text-muted)]">
              +{itemGoals.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Product area */}
      {item.productArea && (
        <span className="text-[10px] text-[var(--color-text-muted)] pl-1 truncate">
          {item.productArea}
        </span>
      )}
    </div>
  );
}
