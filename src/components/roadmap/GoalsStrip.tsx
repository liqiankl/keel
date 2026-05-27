"use client";

import type { QuarterlyGoal } from "@/types";
import { Tooltip } from "@/components/ui/Tooltip";

interface GoalsStripProps {
  goals: QuarterlyGoal[];
}

export function GoalsStrip({ goals }: GoalsStripProps) {
  if (goals.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 px-4 h-8 border-b border-[var(--color-border-subtle)] overflow-x-auto flex-shrink-0">
      {goals.map((goal) => (
        <Tooltip
          key={goal.id}
          content={goal.description || goal.title}
          placement="bottom"
        >
          <span
            className="inline-flex items-center gap-1.5 h-5 rounded-full px-2 whitespace-nowrap flex-shrink-0 text-[11px] font-medium cursor-default"
            style={{
              backgroundColor: goal.color + "15",
              color: goal.color,
              border: `1px solid ${goal.color}2e`,
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: goal.color }}
              aria-hidden="true"
            />
            {goal.title}
          </span>
        </Tooltip>
      ))}
    </div>
  );
}
