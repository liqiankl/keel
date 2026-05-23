"use client";

import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ColDef } from "./columns";

interface ScoringTableHeaderProps {
  columns: ColDef[];
  sortColumn: string | null;
  sortDirection: "asc" | "desc";
  onSort: (colId: string) => void;
}

export function ScoringTableHeader({
  columns,
  sortColumn,
  sortDirection,
  onSort,
}: ScoringTableHeaderProps) {
  return (
    <div
      role="row"
      aria-rowindex={1}
      className={cn(
        "flex items-center border-b border-[var(--color-border-subtle)]",
        "bg-[var(--color-bg-surface)] sticky top-0 z-10",
        "h-8 flex-shrink-0 px-2",
      )}
    >
      {columns.map((col) => {
        const isActive = sortColumn === col.id;
        const sortable = col.type === "score" || col.type === "number" || col.type === "rank" || col.type === "moscow";

        return (
          <div
            key={col.id}
            role="columnheader"
            aria-sort={
              isActive
                ? sortDirection === "asc"
                  ? "ascending"
                  : "descending"
                : undefined
            }
            style={{
              width: col.widthPx ? `${col.widthPx}px` : undefined,
              flex: col.widthPx ? `0 0 ${col.widthPx}px` : "1 1 0%",
              minWidth: col.widthPx ? `${col.widthPx}px` : "120px",
              justifyContent:
                col.align === "right"
                  ? "flex-end"
                  : col.align === "center"
                  ? "center"
                  : "flex-start",
            }}
            className={cn(
              "flex items-center gap-0.5 h-full",
              col.align === "right" && "justify-end",
              col.align === "center" && "justify-center",
            )}
          >
            {sortable ? (
              <button
                type="button"
                onClick={() => onSort(col.id)}
                className={cn(
                  "flex items-center gap-0.5 text-[11px] font-medium",
                  "transition-colors hover:text-[var(--color-text-primary)]",
                  "focus-visible:outline-2 focus-visible:outline-[var(--color-brand)] rounded",
                  isActive
                    ? "text-[var(--color-text-primary)]"
                    : "text-[var(--color-text-muted)]",
                )}
              >
                {col.label}
                <span className="ml-0.5 opacity-60">
                  {isActive ? (
                    sortDirection === "desc" ? (
                      <ChevronDown size={10} />
                    ) : (
                      <ChevronUp size={10} />
                    )
                  ) : (
                    <ChevronDown size={10} className="opacity-30" />
                  )}
                </span>
              </button>
            ) : (
              <span
                className={cn(
                  "text-[11px] font-medium text-[var(--color-text-muted)] select-none",
                  col.type === "rank" && "w-full text-center",
                )}
              >
                {col.type === "rank" ? "" : col.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
