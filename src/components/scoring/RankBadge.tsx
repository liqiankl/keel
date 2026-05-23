"use client";

import { cn } from "@/lib/cn";

interface RankBadgeProps {
  rank: number;
  isOverride?: boolean;
}

export function RankBadge({ rank, isOverride = false }: RankBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-5 min-w-[20px] items-center justify-center rounded text-[11px] tabular-nums font-medium px-1",
        isOverride
          ? "bg-[var(--color-brand-subtle)] text-[var(--color-brand)] border border-[var(--color-brand)]"
          : "text-[var(--color-text-muted)]",
      )}
      aria-label={isOverride ? `Manual rank ${rank}` : `Rank ${rank}`}
    >
      {rank}
    </span>
  );
}
