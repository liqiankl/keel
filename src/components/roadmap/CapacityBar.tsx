"use client";

import { cn } from "@/lib/cn";
import { Tooltip } from "@/components/ui/Tooltip";

interface CapacityBarProps {
  committed: number;
  total: number;
  warningThreshold?: number;
  unit?: string;
  itemCount?: number;
}

export function CapacityBar({
  committed,
  total,
  warningThreshold = 0.9,
  unit = "pts",
  itemCount,
}: CapacityBarProps) {
  const pct        = total === 0 ? 0 : committed / total;
  const displayPct = Math.min(Math.round(pct * 100), 100);
  const isWarning  = pct >= warningThreshold * 0.85;
  const isOver     = pct >= warningThreshold;

  const fillColor = isOver
    ? "var(--color-danger)"
    : isWarning
    ? "var(--color-warning)"
    : "var(--color-brand)";

  return (
    <div className="flex items-center gap-3 px-4 h-9 border-b border-[var(--color-border-subtle)] flex-shrink-0">
      {itemCount != null && (
        <>
          <Tooltip content={`${itemCount} ${itemCount === 1 ? "initiative" : "initiatives"} in this quarter`}>
            <span className="text-[12px] font-medium text-[var(--color-text-secondary)] whitespace-nowrap cursor-default">
              {itemCount} {itemCount === 1 ? "initiative" : "initiatives"}
            </span>
          </Tooltip>
          <span className="h-3 w-px bg-[var(--color-border-subtle)]" />
        </>
      )}

      <span className="text-[12px] text-[var(--color-text-muted)] whitespace-nowrap flex-shrink-0">
        Capacity
      </span>

      <Tooltip
        content={`${committed} of ${total} ${unit} committed (${displayPct}%)`}
      >
        <div
          className="w-24 h-1 rounded-full bg-[var(--color-bg-hover)] overflow-hidden flex-shrink-0 cursor-default"
          role="progressbar"
          aria-valuenow={displayPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${committed} of ${total} ${unit} committed`}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${displayPct}%`, backgroundColor: fillColor }}
          />
        </div>
      </Tooltip>

      <div className="flex items-center gap-1 flex-shrink-0">
        <span
          className={cn(
            "text-[12px] font-mono tabular-nums",
            isOver    ? "text-[var(--color-danger)] font-medium"  :
            isWarning ? "text-[var(--color-warning)] font-medium" :
                        "text-[var(--color-text-secondary)]",
          )}
        >
          {committed}/{total} {unit}
        </span>
        <span className="text-[12px] text-[var(--color-text-muted)] tabular-nums">
          · {displayPct}%
        </span>
        {isOver && (
          <Tooltip content="Over capacity — committed points exceed the quarterly budget" placement="top">
            <span className="ml-0.5 text-[var(--color-danger)] cursor-default" aria-label="Over capacity">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M6 1L11 10H1L6 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M6 5V7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="6" cy="8.5" r="0.6" fill="currentColor" />
              </svg>
            </span>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
