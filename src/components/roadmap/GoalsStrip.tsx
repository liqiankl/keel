"use client";

import type { QuarterlyGoal } from "@/types";

// ─────────────────────────────────────────────
// GoalsStrip — horizontal scrollable row of
// quarterly goal pills with color and weight.
// ─────────────────────────────────────────────

interface GoalsStripProps {
  goals: QuarterlyGoal[];
}

export function GoalsStrip({ goals }: GoalsStripProps) {
  if (goals.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--color-border-subtle)] overflow-x-auto flex-shrink-0">
      <span className="text-[11px] text-[var(--color-text-muted)] whitespace-nowrap flex-shrink-0 font-medium uppercase tracking-wider">
        Goals
      </span>
      {goals.map((goal) => (
        <GoalPill key={goal.id} goal={goal} />
      ))}
    </div>
  );
}

function GoalPill({ goal }: { goal: QuarterlyGoal }) {
  return (
    <div
      className="flex items-center gap-1.5 rounded-full px-2.5 py-1 whitespace-nowrap flex-shrink-0"
      style={{
        backgroundColor: goal.color + "18",
        border: `1px solid ${goal.color}33`,
      }}
      title={goal.description || goal.title}
    >
      <span
        className="h-1.5 w-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: goal.color }}
        aria-hidden="true"
      />
      <span className="text-[12px] font-medium" style={{ color: goal.color }}>
        {goal.title}
      </span>
      <span
        className="text-[10px] rounded px-1 font-mono"
        style={{
          backgroundColor: goal.color + "30",
          color: goal.color,
        }}
        title={`Weight: ${goal.weight}/5`}
      >
        w{goal.weight}
      </span>
    </div>
  );
}
