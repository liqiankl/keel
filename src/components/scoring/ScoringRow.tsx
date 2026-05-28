"use client";

import { useCallback } from "react";
import { Map } from "lucide-react";
import { cn } from "@/lib/cn";
import { RankBadge } from "./RankBadge";
import { GoalTag } from "./GoalTag";
import { InlineNumberCell } from "./InlineNumberCell";
import { MoSCoWCell } from "./MoSCoWCell";
import type { ColDef } from "./columns";
import { IMPACT_VALUES, RICE_EDITABLE_COL_ORDER, WSJF_EDITABLE_COL_ORDER } from "./columns";
import type { RoadmapItem, QuarterlyGoal, ScoringFramework, MoSCoWLabel, RICEScore, WSJFScore } from "@/types";

// ─────────────────────────────────────────────
// ScoringRow — 36px dense row in the scoring
// table. Adapts cell rendering to the active
// scoring framework.
// ─────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  backlog:     "Backlog",
  todo:        "Todo",
  in_progress: "In Progress",
  done:        "Done",
  canceled:    "Canceled",
};

const STATUS_COLORS: Record<string, string> = {
  backlog:     "var(--color-status-backlog)",
  todo:        "var(--color-status-todo)",
  in_progress: "var(--color-status-in-progress)",
  done:        "var(--color-status-done)",
  canceled:    "var(--color-status-canceled)",
};

interface ScoringRowProps {
  initiative: RoadmapItem;
  rank: number;
  columns: ColDef[];
  framework: ScoringFramework;
  goals: QuarterlyGoal[];
  isOpen: boolean;
  isSelected: boolean;
  onOpen: (id: string) => void;
  onSelect: (id: string) => void;
  onUpdateRICE: (id: string, patch: Partial<RICEScore>) => void;
  onUpdateMoSCoW: (id: string, label: MoSCoWLabel) => void;
  onUpdateWSJF: (id: string, patch: Partial<WSJFScore>) => void;
  onSendToRoadmap?: (id: string) => void;
}

export function ScoringRow({
  initiative,
  rank,
  columns,
  framework,
  goals,
  isOpen,
  isSelected,
  onOpen,
  onSelect,
  onUpdateRICE,
  onUpdateMoSCoW,
  onUpdateWSJF,
  onSendToRoadmap,
}: ScoringRowProps) {
  const score = initiative.score;
  const rice  = score?.rice;
  const wsjf  = score?.wsjf;
  const isOverride = score?.manualRankOverride != null;

  const initiativeGoals = goals.filter((g) => initiative.goalIds.includes(g.id));

  // Tab navigation helpers — find the next/prev editable cell by data-col attribute
  const focusCell = useCallback(
    (colId: string) => {
      const el = document.querySelector<HTMLElement>(
        `[data-initiative="${initiative.id}"][data-col="${colId}"]`,
      );
      el?.focus();
    },
    [initiative.id],
  );

  const makeTabHandlers = useCallback(
    (currentColId: string) => {
      const order =
        framework === "rice"
          ? RICE_EDITABLE_COL_ORDER
          : framework === "wsjf"
          ? WSJF_EDITABLE_COL_ORDER
          : [];
      const idx = order.indexOf(currentColId);
      return {
        onTabNext: idx < order.length - 1 ? () => focusCell(order[idx + 1]) : undefined,
        onTabPrev: idx > 0 ? () => focusCell(order[idx - 1]) : undefined,
      };
    },
    [framework, focusCell],
  );

  function renderCell(col: ColDef) {
    switch (col.type) {
      case "rank":
        return (
          <div key={col.id} className="flex items-center justify-center" style={colStyle(col)}>
            <RankBadge rank={rank} isOverride={isOverride} />
          </div>
        );

      case "title":
        return (
          <div key={col.id} className="flex flex-col justify-center min-w-0" style={colStyle(col)}>
            <span className="text-[13px] text-[var(--color-text-primary)] truncate font-medium">
              {initiative.title}
            </span>
            {initiative.productArea && (
              <span className="text-[12px] text-[var(--color-text-muted)] truncate">
                {initiative.productArea}
              </span>
            )}
          </div>
        );

      case "number": {
        const { onTabNext, onTabPrev } = makeTabHandlers(col.id);
        let val = 0;
        if (framework === "rice") {
          const map: Record<string, number> = {
            reach:      rice?.reach      ?? 0,
            confidence: rice?.confidence ?? 100,
            effort:     rice?.effort     ?? 1,
          };
          val = map[col.id] ?? 0;
        } else if (framework === "wsjf") {
          val = col.id === "costOfDelay" ? (wsjf?.costOfDelay ?? 0) : (wsjf?.jobSize ?? 1);
        }
        return (
          <div key={col.id} style={colStyle(col)} className="flex items-center h-full">
            <InlineNumberCell
              value={val}
              min={col.min}
              max={col.max}
              step={col.step}
              suffix={col.suffix}
              onTabNext={onTabNext}
              onTabPrev={onTabPrev}
              data-col={col.id}
              data-initiative={initiative.id}
              onChange={(v) => {
                if (framework === "rice") {
                  onUpdateRICE(initiative.id, { [col.id]: v } as Partial<RICEScore>);
                } else if (framework === "wsjf") {
                  onUpdateWSJF(initiative.id, { [col.id]: v } as Partial<WSJFScore>);
                }
              }}
              className="w-full h-full"
            />
          </div>
        );
      }

      case "impact-select": {
        const currentImpact = rice?.impact ?? 1;
        return (
          <div
            key={col.id}
            style={colStyle(col)}
            className="flex items-center justify-end h-full pr-1.5"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <select
              value={currentImpact}
              data-col="impact"
              data-initiative={initiative.id}
              onChange={(e) => {
                onUpdateRICE(initiative.id, { impact: parseFloat(e.target.value) });
              }}
              className={cn(
                "h-6 rounded px-1 text-[12px] font-mono tabular-nums appearance-none text-right",
                "bg-transparent border border-transparent text-[var(--color-text-secondary)]",
                "hover:border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-hover)]",
                "focus:outline-none focus:border-[var(--color-brand)] focus:bg-[var(--color-bg-elevated)]",
                "cursor-pointer transition-colors",
              )}
              aria-label="Impact value"
            >
              {IMPACT_VALUES.map((v) => (
                <option key={v} value={v} className="bg-[#26262e] text-[var(--color-text-primary)]">
                  {v}
                </option>
              ))}
            </select>
          </div>
        );
      }

      case "moscow":
        return (
          <div
            key={col.id}
            style={colStyle(col)}
            className="flex items-center h-full"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <MoSCoWCell
              value={score?.moscow ?? null}
              onChange={(label) => onUpdateMoSCoW(initiative.id, label)}
            />
          </div>
        );

      case "score": {
        let scoreVal: number | null = null;
        if (col.id === "riceScore") scoreVal = rice?.score ?? null;
        if (col.id === "wsjfScore") scoreVal = wsjf?.score ?? null;

        return (
          <div
            key={col.id}
            style={colStyle(col)}
            className="flex items-center justify-end h-full pr-1.5"
          >
            <span
              className={cn(
                "text-[12px] font-mono font-semibold tabular-nums",
                scoreVal != null && scoreVal > 0
                  ? "text-[var(--color-brand)]"
                  : "text-[var(--color-text-muted)]",
              )}
            >
              {scoreVal != null ? scoreVal : "—"}
            </span>
          </div>
        );
      }

      case "goals":
        return (
          <div
            key={col.id}
            style={colStyle(col)}
            className="flex items-center gap-1 h-full overflow-hidden"
          >
            {initiativeGoals.length > 0 ? (
              <>
                <GoalTag goal={initiativeGoals[0]} />
                {initiativeGoals.length > 1 && (
                  <span className="text-[12px] text-[var(--color-text-muted)] flex-shrink-0">
                    +{initiativeGoals.length - 1}
                  </span>
                )}
              </>
            ) : (
              <span className="text-[12px] text-[var(--color-text-muted)]">—</span>
            )}
          </div>
        );

      case "status": {
        const color = STATUS_COLORS[initiative.status] ?? "var(--color-text-muted)";
        return (
          <div key={col.id} style={colStyle(col)} className="flex items-center h-full gap-1.5">
            <span
              className="h-1.5 w-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            <span className="text-[12px] text-[var(--color-text-secondary)] truncate">
              {STATUS_LABELS[initiative.status] ?? initiative.status}
            </span>
          </div>
        );
      }

      default:
        return null;
    }
  }

  return (
    <div
      role="row"
      aria-selected={isOpen}
      tabIndex={0}
      onClick={() => onOpen(initiative.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && e.target === e.currentTarget) onOpen(initiative.id);
      }}
      className={cn(
        "keel-row group flex items-center border-b border-[var(--color-border-subtle)] px-2",
        "cursor-pointer select-none transition-colors",
        isOpen || isSelected
          ? "bg-[var(--color-bg-selected)]"
          : "hover:bg-[var(--color-bg-hover)]",
        "focus-visible:outline-2 focus-visible:outline-[var(--color-brand)] focus-visible:outline-offset-[-2px]",
      )}
    >
      {/* Checkbox */}
      <div
        className="flex-shrink-0 flex items-center justify-center w-5 mr-1"
        onClick={(e) => { e.stopPropagation(); onSelect(initiative.id); }}
        role="button"
        aria-label={isSelected ? "Deselect" : "Select"}
        tabIndex={-1}
      >
        <div
          className={cn(
            "h-[14px] w-[14px] rounded border flex items-center justify-center transition-all duration-100",
            isSelected
              ? "bg-[var(--color-brand)] border-[var(--color-brand)]"
              : "border-[var(--color-border-strong)] opacity-0 group-hover:opacity-100",
          )}
        >
          {isSelected && (
            <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
              <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </div>

      {columns.map((col) => renderCell(col))}

      {onSendToRoadmap && (
        <button
          onClick={(e) => { e.stopPropagation(); onSendToRoadmap(initiative.id); }}
          title="Send to Roadmap"
          aria-label="Send to Roadmap"
          className={cn(
            "flex-shrink-0 ml-1 h-[22px] w-[22px] rounded flex items-center justify-center",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-100",
            "text-[var(--color-text-muted)] hover:text-[var(--color-brand)] hover:bg-[var(--color-bg-hover)]",
            isOpen && "opacity-100",
          )}
        >
          <Map size={12} />
        </button>
      )}
    </div>
  );
}

function colStyle(col: ColDef): React.CSSProperties {
  return {
    width: col.widthPx ? `${col.widthPx}px` : undefined,
    flex: col.widthPx ? `0 0 ${col.widthPx}px` : "1 1 0%",
    minWidth: col.widthPx ? `${col.widthPx}px` : "120px",
    overflow: "hidden",
  };
}
