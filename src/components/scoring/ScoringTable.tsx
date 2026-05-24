"use client";

import { useMemo } from "react";
import { ScoringTableHeader } from "./ScoringTableHeader";
import { ScoringRow } from "./ScoringRow";
import type { ColDef } from "./columns";
import type {
  RoadmapItem,
  QuarterlyGoal,
  ScoringFramework,
  MoSCoWLabel,
  RICEScore,
  WSJFScore,
  CustomDimension,
} from "@/types";

// ─────────────────────────────────────────────
// ScoringTable — full table with sticky header,
// sorted rows, and framework-aware cells.
// ─────────────────────────────────────────────

const MOSCOW_ORDER: MoSCoWLabel[] = ["must", "should", "could", "wont"];

function sortInitiatives(
  items: RoadmapItem[],
  framework: ScoringFramework,
  sortColumn: string | null,
  sortDir: "asc" | "desc",
): RoadmapItem[] {
  const sorted = [...items].sort((a, b) => {
    // Manual rank override always wins
    const aRank = a.score?.manualRankOverride;
    const bRank = b.score?.manualRankOverride;
    if (aRank != null && bRank != null) return aRank - bRank;
    if (aRank != null) return -1;
    if (bRank != null) return 1;

    if (sortColumn) {
      const dir = sortDir === "asc" ? 1 : -1;
      const av = getCellValue(a, sortColumn, framework);
      const bv = getCellValue(b, sortColumn, framework);
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      if (typeof av === "string" && typeof bv === "string") return av.localeCompare(bv) * dir;
      return 0;
    }

    // Default: sort by framework score descending
    return getFrameworkScore(b, framework) - getFrameworkScore(a, framework);
  });

  return sorted;
}

function getFrameworkScore(item: RoadmapItem, framework: ScoringFramework): number {
  switch (framework) {
    case "rice":   return item.score?.rice?.score ?? 0;
    case "wsjf":   return item.score?.wsjf?.score ?? 0;
    case "custom": return item.score?.custom?.score ?? 0;
    case "moscow": {
      const label = item.score?.moscow;
      return label ? (MOSCOW_ORDER.length - MOSCOW_ORDER.indexOf(label)) : 0;
    }
  }
}

function getCellValue(item: RoadmapItem, col: string, framework: ScoringFramework): number | string {
  switch (col) {
    case "rank":        return getFrameworkScore(item, framework);
    case "riceScore":   return item.score?.rice?.score ?? 0;
    case "reach":       return item.score?.rice?.reach ?? 0;
    case "impact":      return item.score?.rice?.impact ?? 0;
    case "confidence":  return item.score?.rice?.confidence ?? 0;
    case "effort":      return item.score?.rice?.effort ?? 0;
    case "wsjfScore":   return item.score?.wsjf?.score ?? 0;
    case "costOfDelay": return item.score?.wsjf?.costOfDelay ?? 0;
    case "jobSize":     return item.score?.wsjf?.jobSize ?? 0;
    case "customScore": return item.score?.custom?.score ?? 0;
    case "moscow": {
      const label = item.score?.moscow;
      return label ? MOSCOW_ORDER.indexOf(label) : 99;
    }
    default:            return 0;
  }
}

interface ScoringTableProps {
  initiatives: RoadmapItem[];
  framework: ScoringFramework;
  columns: ColDef[];
  goals: QuarterlyGoal[];
  customDimensions: CustomDimension[];
  sortColumn: string | null;
  sortDirection: "asc" | "desc";
  openId: string | null;
  onSort: (col: string) => void;
  onOpen: (id: string) => void;
  onUpdateRICE: (id: string, patch: Partial<RICEScore>) => void;
  onUpdateMoSCoW: (id: string, label: MoSCoWLabel) => void;
  onUpdateWSJF: (id: string, patch: Partial<WSJFScore>) => void;
  onUpdateCustom: (id: string, dimId: string, value: number) => void;
}

export function ScoringTable({
  initiatives,
  framework,
  columns,
  goals,
  customDimensions,
  sortColumn,
  sortDirection,
  openId,
  onSort,
  onOpen,
  onUpdateRICE,
  onUpdateMoSCoW,
  onUpdateWSJF,
  onUpdateCustom,
}: ScoringTableProps) {
  const sorted = useMemo(
    () => sortInitiatives(initiatives, framework, sortColumn, sortDirection),
    [initiatives, framework, sortColumn, sortDirection],
  );

  const handleSort = (colId: string) => {
    if (sortColumn === colId) {
      // Already sorted by this col — toggle direction via store
      onSort(colId);
    } else {
      onSort(colId);
    }
  };

  return (
    <div role="grid" aria-label="Initiatives prioritization table" className="flex flex-col flex-1 overflow-hidden">
      <ScoringTableHeader
        columns={columns}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
      />
      <div role="rowgroup" className="flex-1 overflow-y-auto">
        {sorted.map((item, idx) => (
          <ScoringRow
            key={item.id}
            initiative={item}
            rank={idx + 1}
            columns={columns}
            framework={framework}
            goals={goals}
            customDimensions={customDimensions}
            isOpen={openId === item.id}
            onOpen={onOpen}
            onUpdateRICE={onUpdateRICE}
            onUpdateMoSCoW={onUpdateMoSCoW}
            onUpdateWSJF={onUpdateWSJF}
            onUpdateCustom={onUpdateCustom}
          />
        ))}
      </div>
    </div>
  );
}
