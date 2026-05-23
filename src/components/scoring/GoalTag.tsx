"use client";

import type { QuarterlyGoal } from "@/types";

interface GoalTagProps {
  goal: QuarterlyGoal;
}

export function GoalTag({ goal }: GoalTagProps) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium whitespace-nowrap"
      style={{
        backgroundColor: goal.color + "22",
        color: goal.color,
        border: `1px solid ${goal.color}44`,
      }}
      title={goal.title}
    >
      <span
        className="h-1.5 w-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: goal.color }}
        aria-hidden="true"
      />
      <span className="truncate max-w-[80px]">{goal.title}</span>
    </span>
  );
}
