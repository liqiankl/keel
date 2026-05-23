"use client";

import { cn } from "@/lib/cn";

// ─────────────────────────────────────────────
// CapacityBar — visual meter showing committed
// vs total story points. Color shifts at 75%
// (amber) and at warningThreshold (red).
// ─────────────────────────────────────────────

interface CapacityBarProps {
  committed: number;
  total: number;
  warningThreshold?: number; // 0–1, default 0.9
  unit?: string;
}

export function CapacityBar({
  committed,
  total,
  warningThreshold = 0.9,
  unit = "pts",
}: CapacityBarProps) {
  const pct = total === 0 ? 0 : committed / total;
  const displayPct = Math.min(Math.round(pct * 100), 100);
  const isWarning = pct >= warningThreshold * 0.85; // amber at 85% of threshold
  const isOver    = pct >= warningThreshold;         // red at threshold

  const fillColor = isOver
    ? "var(--color-danger)"
    : isWarning
    ? "var(--color-warning)"
    : "var(--color-success)";

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[var(--color-border-subtle)] flex-shrink-0">
      {/* Label */}
      <span className="text-[12px] text-[var(--color-text-muted)] whitespace-nowrap flex-shrink-0">
        Capacity
      </span>

      {/* Bar track */}
      <div
        className="flex-1 h-1.5 rounded-full bg-[var(--color-bg-hover)] overflow-hidden"
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

      {/* Stats */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span
          className={cn(
            "text-[12px] font-mono font-medium tabular-nums",
            isOver    ? "text-[var(--color-danger)]"  :
            isWarning ? "text-[var(--color-warning)]" :
                        "text-[var(--color-text-primary)]",
          )}
        >
          {committed}
        </span>
        <span className="text-[12px] text-[var(--color-text-muted)]">
          / {total} {unit}
        </span>
        <span
          className={cn(
            "text-[11px] font-medium tabular-nums ml-0.5",
            isOver    ? "text-[var(--color-danger)]"  :
            isWarning ? "text-[var(--color-warning)]" :
                        "text-[var(--color-text-secondary)]",
          )}
        >
          ({displayPct}%)
        </span>
        {isOver && (
          <span
            className="ml-0.5 text-[var(--color-danger)]"
            title="Over capacity warning threshold"
            aria-label="Over capacity"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M6 1L11 10H1L6 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M6 5V7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <circle cx="6" cy="8.5" r="0.6" fill="currentColor" />
            </svg>
          </span>
        )}
      </div>
    </div>
  );
}
