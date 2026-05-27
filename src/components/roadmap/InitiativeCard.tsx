"use client";

import { cn } from "@/lib/cn";
import { PRIORITY_CONFIG } from "@/lib/constants";
import type { RoadmapItem, QuarterlyGoal } from "@/types";

const MOSCOW_COLORS: Record<string, { color: string; bg: string }> = {
  must:   { color: "#f87171", bg: "#f8717115" },
  should: { color: "#fb923c", bg: "#fb923c15" },
  could:  { color: "#60a5fa", bg: "#60a5fa15" },
  wont:   { color: "#6b7280", bg: "#6b728015" },
};

const MOSCOW_LABELS: Record<string, string> = {
  must: "Must", should: "Should", could: "Could", wont: "Won't",
};

interface InitiativeCardProps {
  item: RoadmapItem;
  goals: QuarterlyGoal[];
  planId: string;
  isOpen?: boolean;
  onOpen?: (id: string) => void;
}

export function InitiativeCard({ item, goals, planId, isOpen, onOpen }: InitiativeCardProps) {
  const priorityCfg = PRIORITY_CONFIG[item.priority] ?? PRIORITY_CONFIG.none;
  const moscow      = item.score?.moscow;
  const moscowCfg   = moscow ? MOSCOW_COLORS[moscow] : null;
  const itemGoals   = goals.filter((g) => item.goalIds.includes(g.id));

  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.setData("itemId", item.id);
    e.dataTransfer.setData("planId", planId);
    e.dataTransfer.effectAllowed = "move";
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onOpen?.(item.id)}
      className={cn(
        "relative flex flex-col gap-2 rounded-xl border",
        "bg-[var(--color-bg-elevated)] px-3.5 py-3",
        "transition-all duration-150 overflow-hidden select-none",
        onOpen ? "cursor-pointer" : "cursor-grab active:cursor-grabbing",
        isOpen
          ? "border-[var(--color-brand)]/50 shadow-[0_0_0_2px_var(--color-brand)]/10"
          : "border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)] hover:shadow-[0_2px_12px_rgba(0,0,0,0.07)]",
      )}
    >
      {/* Priority accent */}
      <span
        className="absolute inset-y-0 left-0 w-[3px] rounded-l-xl"
        style={{ backgroundColor: priorityCfg.color }}
        title={`${priorityCfg.label} priority`}
        aria-hidden="true"
      />

      {/* Title */}
      <p className="text-[13px] font-medium text-[var(--color-text-primary)] leading-snug pl-1">
        {item.title}
      </p>

      {/* Footer row: goal dots + MoSCoW + pts */}
      <div className="flex items-center gap-2 pl-1">
        {/* Goal dots */}
        {itemGoals.length > 0 && (
          <div className="flex items-center gap-1">
            {itemGoals.map((g) => (
              <span
                key={g.id}
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: g.color }}
                title={g.title}
                aria-label={g.title}
              />
            ))}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* MoSCoW badge */}
        {moscowCfg && moscow && (
          <span
            className="inline-flex items-center h-[18px] px-1.5 rounded-md text-[11px] font-medium"
            style={{ backgroundColor: moscowCfg.bg, color: moscowCfg.color }}
            title={`MoSCoW: ${MOSCOW_LABELS[moscow]}`}
          >
            {MOSCOW_LABELS[moscow]}
          </span>
        )}

        {/* Effort */}
        {item.effort.points != null && (
          <span
            className="text-[11px] font-mono text-[var(--color-text-muted)] tabular-nums"
            title="Story points"
          >
            {item.effort.points} pts
          </span>
        )}
      </div>
    </div>
  );
}
