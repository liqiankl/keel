"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "zustand";
import { BarChart2, Check, Lock, Map as MapIcon, RotateCcw } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { EmptyState } from "@/components/ui/EmptyState";
import { FrameworkTabs } from "./FrameworkTabs";
import { InitiativeDetail } from "./InitiativeDetail";
import { InlineNumberCell } from "./InlineNumberCell";
import { WorkflowBar } from "@/components/workflow/WorkflowBar";
import { useScoringStore } from "@/store/useScoringStore";
import { useRoadmapStore } from "@/store/useRoadmapStore";
import { useAppStore } from "@/store/useAppStore";
import { useWorkflowStore } from "@/store/useWorkflowStore";
import { useInboxStore } from "@/store/useInboxStore";
import { TEAMS, CURRENT_QUARTER } from "@/lib/constants";
import { useGlobalShortcuts } from "@/hooks/useGlobalShortcuts";
import { cn } from "@/lib/cn";
import { IMPACT_VALUES } from "./columns";
import type {
  RoadmapItem,
  ScoringFramework,
  MoSCoWLabel,
  QuarterlyPlan,
  RICEScore,
  WSJFScore,
} from "@/types";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const goals: QuarterlyPlan["goals"] = [];

const PRIORITY_COLOR: Record<string, string> = {
  urgent: "#e5484d",
  high:   "#f97316",
  medium: "#5e5ce6",
  low:    "#94a3b8",
  none:   "#94a3b8",
};

const MOSCOW_COLUMNS = [
  { value: "must"   as MoSCoWLabel, label: "Must",   color: "#ef4444", bg: "#ef444410" },
  { value: "should" as MoSCoWLabel, label: "Should", color: "#f97316", bg: "#f9731610" },
  { value: "could"  as MoSCoWLabel, label: "Could",  color: "#eab308", bg: "#eab30810" },
  { value: "wont"   as MoSCoWLabel, label: "Won't",  color: "#6b7280", bg: "#6b728010" },
];

// ─────────────────────────────────────────────
// Shared atoms
// ─────────────────────────────────────────────

function DragDots({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-[3px] opacity-25 group-hover:opacity-60 transition-opacity", className)}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-[3px] w-[3px] rounded-full bg-[var(--color-text-secondary)]" />
      ))}
    </div>
  );
}

function FieldLabel({ children }: { children: string }) {
  return (
    <span className="block text-[9px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] text-center mb-0.5">
      {children}
    </span>
  );
}

function RoadmapButton({ onClick }: { onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[12px] font-medium flex-shrink-0 ml-auto",
        "border border-[var(--color-border-subtle)] text-[var(--color-text-muted)]",
        "hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] hover:bg-[var(--color-brand)]/5",
        "opacity-0 group-hover:opacity-100 transition-opacity duration-100",
        "focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]",
      )}
    >
      <MapIcon size={11} />
      Roadmap
    </button>
  );
}

function BackToIdeasButton({ onClick }: { onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[12px] font-medium flex-shrink-0",
        "border border-[var(--color-border-subtle)] text-[var(--color-text-muted)]",
        "hover:border-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]",
        "opacity-0 group-hover:opacity-100 transition-opacity duration-100",
        "focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]",
      )}
    >
      ← Ideas
    </button>
  );
}

// ─────────────────────────────────────────────
// RICE
// ─────────────────────────────────────────────

interface RICECardProps {
  item: RoadmapItem;
  rank: number;
  isOpen: boolean;
  isDragged: boolean;
  isDropTarget: boolean;
  onOpen: (id: string) => void;
  onDragStart: (id: string, e: React.MouseEvent) => void;
  onMouseEnter: () => void;
  onUpdateRICE: (id: string, patch: Partial<RICEScore>) => void;
  onSendToRoadmap?: (id: string) => void;
  onSendBackToIdeas?: (id: string) => void;
}

function RICECard({
  item, rank, isOpen, isDragged, isDropTarget,
  onOpen, onDragStart, onMouseEnter, onUpdateRICE, onSendToRoadmap, onSendBackToIdeas,
}: RICECardProps) {
  const rice = item.score?.rice;
  const score = rice?.score ?? 0;
  const priColor = PRIORITY_COLOR[item.priority] ?? "#94a3b8";
  const isScored = score > 0;

  return (
    <div onMouseEnter={onMouseEnter}>
      <div className={cn("h-[2px] rounded-full mx-1 transition-all duration-100", isDropTarget ? "bg-[var(--color-brand)] mb-1" : "bg-transparent mb-0")} />
      <div
        onClick={() => onOpen(item.id)}
        className={cn(
          "group rounded-xl border overflow-hidden transition-all duration-150 cursor-pointer select-none",
          isDragged && "opacity-40 scale-[0.99]",
          isOpen
            ? "border-[var(--color-brand)]/50 bg-[var(--color-brand)]/[0.03]"
            : "bg-[var(--color-bg-surface)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)] hover:shadow-sm",
        )}
      >
        {/* Title row */}
        <div className="flex items-stretch">
          {/* Drag handle */}
          <div
            onMouseDown={(e) => { e.stopPropagation(); onDragStart(item.id, e); }}
            className="flex flex-col items-center justify-center w-10 flex-shrink-0 gap-1.5 border-r border-[var(--color-border-subtle)] cursor-grab active:cursor-grabbing hover:bg-[var(--color-bg-hover)] transition-colors"
          >
            <span className="text-[13px] font-bold tabular-nums text-[var(--color-text-muted)]">{rank}</span>
            <DragDots />
          </div>

          {/* Title + description */}
          <div className="flex-1 flex items-center gap-2.5 px-4 py-3 min-w-0">
            <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: priColor }} />
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-[var(--color-text-primary)] truncate leading-snug">{item.title}</p>
              {item.description && (
                <p className="text-[12px] text-[var(--color-text-muted)] truncate mt-0.5 leading-snug">{item.description}</p>
              )}
            </div>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center justify-center flex-shrink-0 w-16 border-l border-[var(--color-border-subtle)]">
            <span
              className="text-[22px] font-mono font-bold tabular-nums leading-none"
              style={{ color: isScored ? "var(--color-brand)" : "var(--color-text-muted)" }}
            >
              {isScored ? score : "—"}
            </span>
            <span className="text-[9px] font-semibold text-[var(--color-text-muted)] mt-0.5">RICE</span>
          </div>
        </div>

        {/* Inputs strip */}
        <div
          className="flex items-end gap-4 px-4 py-2.5 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-base)]/40"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div>
            <FieldLabel>Reach</FieldLabel>
            <div className="h-7 w-[72px]">
              <InlineNumberCell value={rice?.reach ?? 0} min={0} step={10} onChange={(v) => onUpdateRICE(item.id, { reach: v })} />
            </div>
          </div>

          <div>
            <FieldLabel>Impact</FieldLabel>
            <select
              value={rice?.impact ?? 1}
              onChange={(e) => onUpdateRICE(item.id, { impact: parseFloat(e.target.value) })}
              className={cn(
                "h-7 w-[60px] rounded px-1.5 text-[12px] font-mono appearance-none text-right",
                "bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]",
                "text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand)] cursor-pointer",
              )}
            >
              {IMPACT_VALUES.map((v) => (
                <option key={v} value={v} className="bg-[#26262e]">{v}×</option>
              ))}
            </select>
          </div>

          <div>
            <FieldLabel>Confidence</FieldLabel>
            <div className="h-7 w-[72px]">
              <InlineNumberCell value={rice?.confidence ?? 100} min={0} max={100} step={5} suffix="%" onChange={(v) => onUpdateRICE(item.id, { confidence: v })} />
            </div>
          </div>

          <div>
            <FieldLabel>Effort</FieldLabel>
            <div className="h-7 w-[60px]">
              <InlineNumberCell value={rice?.effort ?? 1} min={0.1} step={0.5} onChange={(v) => onUpdateRICE(item.id, { effort: v })} />
            </div>
          </div>

          <div className="flex items-end gap-1.5 ml-auto">
            {onSendBackToIdeas && (
              <BackToIdeasButton onClick={(e) => { e.stopPropagation(); onSendBackToIdeas(item.id); }} />
            )}
            {onSendToRoadmap && (
              <RoadmapButton onClick={(e) => { e.stopPropagation(); onSendToRoadmap(item.id); }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ListViewProps {
  orderedIds: string[];
  initiativeMap: Map<string, RoadmapItem>;
  dragId: string | null;
  dragOverIdx: number | null;
  setDragOverIdx: (i: number | null) => void;
  handleDragStart: (id: string, e: React.MouseEvent) => void;
  openId: string | null;
  setOpenId: (id: string | null) => void;
  initialTeam?: string;
  handleSendToRoadmap: (id: string) => void;
  handleSendBackToIdeas?: (id: string) => void;
}

function RICEView({
  orderedIds, initiativeMap, dragId, dragOverIdx, setDragOverIdx,
  handleDragStart, openId, setOpenId, handleSendToRoadmap, handleSendBackToIdeas,
  updateRICE,
}: ListViewProps & { updateRICE: (id: string, p: Partial<RICEScore>) => void }) {
  const scored = orderedIds.filter((id) => (initiativeMap.get(id)?.score?.rice?.score ?? 0) > 0).length;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex items-center gap-2 px-4 pt-3 pb-1.5">
        <span className="text-[11px] text-[var(--color-text-muted)]">
          {orderedIds.length} initiatives · {scored} scored · drag to reorder
        </span>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {orderedIds.map((id, idx) => {
          const item = initiativeMap.get(id);
          if (!item) return null;
          return (
            <RICECard
              key={id}
              item={item}
              rank={idx + 1}
              isOpen={openId === id}
              isDragged={dragId === id}
              isDropTarget={dragId !== null && dragId !== id && dragOverIdx === idx}
              onOpen={(id) => setOpenId(openId === id ? null : id)}
              onDragStart={handleDragStart}
              onMouseEnter={() => { if (dragId && dragId !== id) setDragOverIdx(idx); }}
              onUpdateRICE={updateRICE}
              onSendToRoadmap={handleSendToRoadmap}
              onSendBackToIdeas={handleSendBackToIdeas}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// WSJF
// ─────────────────────────────────────────────

interface WSJFCardProps {
  item: RoadmapItem;
  rank: number;
  isOpen: boolean;
  isDragged: boolean;
  isDropTarget: boolean;
  onOpen: (id: string) => void;
  onDragStart: (id: string, e: React.MouseEvent) => void;
  onMouseEnter: () => void;
  onUpdateWSJF: (id: string, patch: Partial<WSJFScore>) => void;
  onSendToRoadmap?: (id: string) => void;
  onSendBackToIdeas?: (id: string) => void;
}

function WSJFCard({
  item, rank, isOpen, isDragged, isDropTarget,
  onOpen, onDragStart, onMouseEnter, onUpdateWSJF, onSendToRoadmap, onSendBackToIdeas,
}: WSJFCardProps) {
  const wsjf = item.score?.wsjf;
  const score = wsjf?.score ?? 0;
  const priColor = PRIORITY_COLOR[item.priority] ?? "#94a3b8";
  const isScored = score > 0;

  return (
    <div onMouseEnter={onMouseEnter}>
      <div className={cn("h-[2px] rounded-full mx-1 transition-all duration-100", isDropTarget ? "bg-[var(--color-brand)] mb-1" : "bg-transparent mb-0")} />
      <div
        onClick={() => onOpen(item.id)}
        className={cn(
          "group rounded-xl border overflow-hidden transition-all duration-150 cursor-pointer select-none",
          isDragged && "opacity-40 scale-[0.99]",
          isOpen
            ? "border-[#0ea5e9]/50 bg-[#0ea5e9]/[0.03]"
            : "bg-[var(--color-bg-surface)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)] hover:shadow-sm",
        )}
      >
        {/* Title row */}
        <div className="flex items-stretch">
          <div
            onMouseDown={(e) => { e.stopPropagation(); onDragStart(item.id, e); }}
            className="flex flex-col items-center justify-center w-10 flex-shrink-0 gap-1.5 border-r border-[var(--color-border-subtle)] cursor-grab active:cursor-grabbing hover:bg-[var(--color-bg-hover)] transition-colors"
          >
            <span className="text-[13px] font-bold tabular-nums text-[var(--color-text-muted)]">{rank}</span>
            <DragDots />
          </div>

          <div className="flex-1 flex items-center gap-2.5 px-4 py-3 min-w-0">
            <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: priColor }} />
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-[var(--color-text-primary)] truncate leading-snug">{item.title}</p>
              {item.description && (
                <p className="text-[12px] text-[var(--color-text-muted)] truncate mt-0.5 leading-snug">{item.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Formula strip: CoD ÷ Size = Score */}
        <div
          className="flex items-center gap-3 px-4 py-2.5 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-base)]/40"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div>
            <FieldLabel>Cost of Delay</FieldLabel>
            <div className="h-7 w-[80px]">
              <InlineNumberCell value={wsjf?.costOfDelay ?? 0} min={0} step={1} onChange={(v) => onUpdateWSJF(item.id, { costOfDelay: v })} />
            </div>
          </div>

          <span className="text-[20px] font-light text-[var(--color-text-muted)] mt-3 flex-shrink-0">÷</span>

          <div>
            <FieldLabel>Job Size</FieldLabel>
            <div className="h-7 w-[64px]">
              <InlineNumberCell value={wsjf?.jobSize ?? 1} min={0.1} step={0.5} onChange={(v) => onUpdateWSJF(item.id, { jobSize: v })} />
            </div>
          </div>

          <span className="text-[20px] font-light text-[var(--color-text-muted)] mt-3 flex-shrink-0">=</span>

          <div className="flex flex-col items-center">
            <FieldLabel>WSJF</FieldLabel>
            <span
              className="text-[22px] font-mono font-bold tabular-nums leading-none"
              style={{ color: isScored ? "#0ea5e9" : "var(--color-text-muted)" }}
            >
              {isScored ? score : "—"}
            </span>
          </div>

          <div className="flex items-end gap-1.5 ml-auto">
            {onSendBackToIdeas && (
              <BackToIdeasButton onClick={(e) => { e.stopPropagation(); onSendBackToIdeas(item.id); }} />
            )}
            {onSendToRoadmap && (
              <RoadmapButton onClick={(e) => { e.stopPropagation(); onSendToRoadmap(item.id); }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function WSJFView({
  orderedIds, initiativeMap, dragId, dragOverIdx, setDragOverIdx,
  handleDragStart, openId, setOpenId, handleSendToRoadmap, handleSendBackToIdeas,
  updateWSJF,
}: ListViewProps & { updateWSJF: (id: string, p: Partial<WSJFScore>) => void }) {
  const scored = orderedIds.filter((id) => (initiativeMap.get(id)?.score?.wsjf?.score ?? 0) > 0).length;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex items-center gap-2 px-4 pt-3 pb-1.5">
        <span className="text-[11px] text-[var(--color-text-muted)]">
          {orderedIds.length} initiatives · {scored} scored · drag to reorder
        </span>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {orderedIds.map((id, idx) => {
          const item = initiativeMap.get(id);
          if (!item) return null;
          return (
            <WSJFCard
              key={id}
              item={item}
              rank={idx + 1}
              isOpen={openId === id}
              isDragged={dragId === id}
              isDropTarget={dragId !== null && dragId !== id && dragOverIdx === idx}
              onOpen={(id) => setOpenId(openId === id ? null : id)}
              onDragStart={handleDragStart}
              onMouseEnter={() => { if (dragId && dragId !== id) setDragOverIdx(idx); }}
              onUpdateWSJF={updateWSJF}
              onSendToRoadmap={handleSendToRoadmap}
              onSendBackToIdeas={handleSendBackToIdeas}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MoSCoW Kanban
// ─────────────────────────────────────────────

function KanbanCard({
  item,
  isDragged,
  isOpen,
  onOpen,
  onDragStart,
  onSendToRoadmap,
}: {
  item: RoadmapItem;
  isDragged: boolean;
  isOpen: boolean;
  onOpen: (id: string) => void;
  onDragStart: (id: string) => void;
  onSendToRoadmap?: (id: string) => void;
}) {
  const priColor = PRIORITY_COLOR[item.priority] ?? "#94a3b8";
  return (
    <div
      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onDragStart(item.id); }}
      onClick={(e) => { e.stopPropagation(); onOpen(item.id); }}
      className={cn(
        "group flex flex-col gap-1.5 p-3 rounded-lg border select-none transition-all duration-100",
        "cursor-grab active:cursor-grabbing",
        isDragged
          ? "opacity-40 scale-[0.97] shadow-lg"
          : isOpen
          ? "bg-[var(--color-bg-elevated)] border-[var(--color-brand)]/40 shadow-sm"
          : "bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)] hover:shadow-sm",
      )}
    >
      <div className="flex items-start gap-2">
        <div className="h-2 w-2 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: priColor }} />
        <p className="text-[13px] font-medium text-[var(--color-text-primary)] leading-snug flex-1 min-w-0">{item.title}</p>
        {onSendToRoadmap && (
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onSendToRoadmap(item.id); }}
            title="Send to Roadmap"
            className={cn(
              "flex items-center gap-1 flex-shrink-0 h-5 px-1.5 rounded text-[10px] font-semibold",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-100",
              "bg-[var(--color-brand)]/10 text-[var(--color-brand)] hover:bg-[var(--color-brand)]/20",
              "focus-visible:opacity-100",
            )}
          >
            <MapIcon size={9} />
            Roadmap
          </button>
        )}
      </div>
      {item.description && (
        <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed pl-4 line-clamp-2">{item.description}</p>
      )}
      {item.effort.points != null && (
        <span className="text-[10px] font-mono text-[var(--color-text-muted)] pl-4">{item.effort.points}pt</span>
      )}
    </div>
  );
}

function KanbanColumn({
  column,
  items,
  isDropTarget,
  isSelected,
  dragId,
  openId,
  onMouseEnter,
  onOpen,
  onDragStart,
  onToggleSelect,
  onSendToRoadmap,
}: {
  column: typeof MOSCOW_COLUMNS[number];
  items: RoadmapItem[];
  isDropTarget: boolean;
  isSelected: boolean;
  dragId: string | null;
  openId: string | null;
  onMouseEnter: () => void;
  onOpen: (id: string) => void;
  onDragStart: (id: string) => void;
  onToggleSelect: () => void;
  onSendToRoadmap?: (id: string) => void;
}) {
  return (
    <div
      className={cn(
        "flex flex-col flex-1 overflow-hidden border-r border-[var(--color-border-subtle)] last:border-r-0 transition-colors duration-150",
        isSelected && "bg-[var(--color-brand)]/[0.03]",
      )}
      style={isDropTarget && !isSelected ? { backgroundColor: column.bg } : {}}
      onMouseEnter={onMouseEnter}
    >
      {/* Column header */}
      <div
        className="flex items-center gap-2 px-3 py-3 flex-shrink-0 border-b border-[var(--color-border-subtle)]"
        style={{ borderTop: `2px solid ${isSelected ? "var(--color-brand)" : column.color}` }}
      >
        {/* Selection checkbox */}
        <button
          type="button"
          onClick={onToggleSelect}
          aria-label={isSelected ? `Deselect ${column.label}` : `Select ${column.label}`}
          className={cn(
            "h-4 w-4 rounded border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all duration-100",
            isSelected
              ? "bg-[var(--color-brand)] border-[var(--color-brand)]"
              : "border-[var(--color-border-strong)] hover:border-[var(--color-brand)]/60",
          )}
        >
          {isSelected && <Check size={9} strokeWidth={3} className="text-white" />}
        </button>

        <span
          className="text-[13px] font-semibold transition-colors"
          style={{ color: isSelected ? "var(--color-brand)" : column.color }}
        >
          {column.label}
        </span>
        <span
          className="text-[11px] font-semibold rounded-full px-1.5 py-0.5 transition-colors"
          style={
            isSelected
              ? { backgroundColor: "var(--color-brand)20", color: "var(--color-brand)" }
              : { backgroundColor: column.color + "20", color: column.color }
          }
        >
          {items.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {items.map((item) => (
          <KanbanCard
            key={item.id}
            item={item}
            isDragged={dragId === item.id}
            isOpen={openId === item.id}
            onOpen={onOpen}
            onDragStart={onDragStart}
            onSendToRoadmap={onSendToRoadmap}
          />
        ))}

        {/* Empty state */}
        {items.length === 0 && (
          <div
            className={cn(
              "flex items-center justify-center h-16 rounded-lg border-2 border-dashed text-[11px] transition-colors",
              isDropTarget
                ? "border-[var(--color-brand)] text-[var(--color-brand)]"
                : "border-[var(--color-border-subtle)] text-[var(--color-text-muted)]",
            )}
          >
            {isDropTarget ? "Drop to classify" : "No items"}
          </div>
        )}

        {/* Active drop target highlight when column has items */}
        {isDropTarget && items.length > 0 && (
          <div className="h-1 rounded-full bg-[var(--color-brand)]/30" />
        )}
      </div>
    </div>
  );
}

function MoSCoWView({
  initiatives,
  openId,
  setOpenId,
  updateMoSCoW,
  clearMoSCoW,
  onSendToRoadmap,
}: {
  initiatives: RoadmapItem[];
  openId: string | null;
  setOpenId: (id: string | null) => void;
  updateMoSCoW: (id: string, label: MoSCoWLabel) => void;
  clearMoSCoW: (id: string) => void;
  onSendToRoadmap?: (id: string) => void;
}) {
  const [dragId, setDragId]           = useState<string | null>(null);
  const [dropTarget, setDropTarget]   = useState<MoSCoWLabel | "unscored" | null>(null);
  const [selectedCols, setSelectedCols] = useState<Set<MoSCoWLabel>>(new Set());

  const toggleCol = useCallback((label: MoSCoWLabel) => {
    setSelectedCols((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label); else next.add(label);
      return next;
    });
  }, []);

  // Global grabbing cursor
  useEffect(() => {
    if (dragId) {
      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";
    } else {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
    return () => { document.body.style.cursor = ""; document.body.style.userSelect = ""; };
  }, [dragId]);

  // Commit on mouseup
  useEffect(() => {
    if (!dragId) return;
    function onUp() {
      if (dropTarget && dragId) {
        if (dropTarget === "unscored") clearMoSCoW(dragId);
        else updateMoSCoW(dragId, dropTarget as MoSCoWLabel);
      }
      setDragId(null);
      setDropTarget(null);
    }
    document.addEventListener("mouseup", onUp);
    return () => document.removeEventListener("mouseup", onUp);
  }, [dragId, dropTarget, updateMoSCoW, clearMoSCoW]); // eslint-disable-line react-hooks/exhaustive-deps

  const unscored = useMemo(() => initiatives.filter((i) => !i.score?.moscow), [initiatives]);
  const grouped  = useMemo(() => {
    const g: Record<MoSCoWLabel, RoadmapItem[]> = { must: [], should: [], could: [], wont: [] };
    for (const i of initiatives) {
      if (i.score?.moscow) g[i.score.moscow].push(i);
    }
    return g;
  }, [initiatives]);

  const selectedItems = useMemo(
    () => MOSCOW_COLUMNS.filter((c) => selectedCols.has(c.value)).flatMap((c) => grouped[c.value]),
    [selectedCols, grouped],
  );

  const selectedLabels = useMemo(
    () => MOSCOW_COLUMNS.filter((c) => selectedCols.has(c.value)).map((c) => c.label),
    [selectedCols],
  );

  const handleSendSelected = useCallback(() => {
    if (!onSendToRoadmap) return;
    selectedItems.forEach((i) => onSendToRoadmap(i.id));
    setSelectedCols(new Set());
  }, [selectedItems, onSendToRoadmap]);

  const classifiedCount = initiatives.length - unscored.length;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Progress bar + unscored tray */}
      <div
        className={cn(
          "flex-shrink-0 border-b border-[var(--color-border-subtle)] transition-colors duration-150",
          dropTarget === "unscored" && dragId ? "bg-[var(--color-brand)]/5" : "",
        )}
        onMouseEnter={() => { if (dragId) setDropTarget("unscored"); }}
      >
        {/* Progress */}
        <div className="flex items-center gap-3 px-4 pt-3 pb-2">
          <span className="text-[11px] text-[var(--color-text-muted)]">
            {classifiedCount} of {initiatives.length} classified
          </span>
          <div className="flex-1 h-1 rounded-full bg-[var(--color-border-subtle)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--color-brand)] transition-all duration-300"
              style={{ width: initiatives.length ? `${(classifiedCount / initiatives.length) * 100}%` : "0%" }}
            />
          </div>
        </div>

        {/* Unscored tray */}
        {unscored.length > 0 && (
          <div className="px-4 pb-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
              Unclassified ({unscored.length}) — drag to a column
            </p>
            <div className="flex flex-wrap gap-2">
              {unscored.map((item) => (
                <div
                  key={item.id}
                  onMouseDown={(e) => { e.preventDefault(); setDragId(item.id); }}
                  onClick={(e) => { e.stopPropagation(); setOpenId(openId === item.id ? null : item.id); }}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[12px] font-medium",
                    "cursor-grab active:cursor-grabbing select-none transition-all",
                    dragId === item.id
                      ? "opacity-40 scale-95"
                      : openId === item.id
                      ? "bg-[var(--color-bg-elevated)] border-[var(--color-brand)]/40"
                      : "bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)]",
                  )}
                >
                  <div
                    className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: PRIORITY_COLOR[item.priority] ?? "#94a3b8" }}
                  />
                  <span className="text-[var(--color-text-secondary)] max-w-[160px] truncate">{item.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4 Kanban columns */}
      <div className="flex flex-1 overflow-hidden relative">
        {MOSCOW_COLUMNS.map((col) => (
          <KanbanColumn
            key={col.value}
            column={col}
            items={grouped[col.value]}
            isDropTarget={dropTarget === col.value && !!dragId}
            isSelected={selectedCols.has(col.value)}
            dragId={dragId}
            openId={openId}
            onMouseEnter={() => { if (dragId) setDropTarget(col.value); }}
            onOpen={(id) => setOpenId(openId === id ? null : id)}
            onDragStart={setDragId}
            onToggleSelect={() => toggleCol(col.value)}
            onSendToRoadmap={onSendToRoadmap}
          />
        ))}

        {/* Floating cumulative action bar */}
        {selectedItems.length > 0 && onSendToRoadmap && (
          <div className={cn(
            "absolute bottom-5 left-1/2 -translate-x-1/2 z-20",
            "flex items-center gap-3 pl-4 pr-2 py-2 rounded-2xl",
            "bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]",
            "shadow-[0_8px_32px_rgba(0,0,0,0.22),0_2px_8px_rgba(0,0,0,0.12)]",
            "animate-in fade-in slide-in-from-bottom-2 duration-200",
          )}>
            <span className="text-[12px] text-[var(--color-text-secondary)] whitespace-nowrap">
              <span className="font-semibold text-[var(--color-text-primary)]">{selectedItems.length}</span>
              {" "}item{selectedItems.length !== 1 ? "s" : ""} from{" "}
              <span className="font-semibold text-[var(--color-text-primary)]">{selectedLabels.join(" + ")}</span>
            </span>

            <button
              onClick={handleSendSelected}
              className={cn(
                "flex items-center gap-1.5 h-7 px-3 rounded-xl text-[12px] font-semibold",
                "bg-[var(--color-brand)] text-white hover:opacity-90 transition-opacity",
              )}
            >
              <MapIcon size={11} />
              Send to Roadmap
            </button>

            <button
              onClick={() => setSelectedCols(new Set())}
              className="h-7 px-2 rounded-lg text-[12px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-colors"
            >
              Clear
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ScoringView
// ─────────────────────────────────────────────

interface ScoringViewProps {
  initialTeam?: string;
}

export function ScoringView({ initialTeam }: ScoringViewProps = {}) {
  const router = useRouter();
  const [openId, setOpenId]             = useState<string | null>(null);
  const [roadmapToast, setRoadmapToast] = useState<string | null>(null);
  const [orderedIds, setOrderedIds]     = useState<string[]>([]);
  const [dragId, setDragId]             = useState<string | null>(null);
  const [dragOverIdx, setDragOverIdx]   = useState<number | null>(null);

  const phasesActed     = useAppStore((s) => s.phasesActed);
  const markPhaseActed  = useAppStore((s) => s.markPhaseActed);
  const setActiveTeamId = useAppStore((s) => s.setActiveTeamId);
  const phaseKey        = initialTeam ? `prioritize:${initialTeam}` : null;
  const hasActed        = phaseKey ? phasesActed.includes(phaseKey) : false;

  // Workflow store
  const scoringStarted      = useWorkflowStore((s) => s.scoringStarted);
  const startScoring        = useWorkflowStore((s) => s.startScoring);
  const wfResetPrioritization = useWorkflowStore((s) => s.resetPrioritization);

  // Inbox store (for workflow stage updates)
  const inboxRequests  = useInboxStore((s) => s.requests);
  const updateRequest  = useInboxStore((s) => s.updateRequest);

  useEffect(() => {
    if (initialTeam) {
      const team = TEAMS.find((t) => t.slug === initialTeam);
      if (team) setActiveTeamId(team.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTeam]);

  const {
    initiatives: allInitiatives,
    activeFramework,
    setActiveFramework,
    updateRICE,
    updateMoSCoW,
    updateWSJF,
    updateEffort,
    updateGoals,
    updateGoalNotes,
    clearMoSCoW,
    removeInitiative,
    setManualRank,
  } = useScoringStore();

  const { plans, addItemToPlan, addPlan } = useRoadmapStore();
  const temporal = useStore(useScoringStore.temporal);

  const teamId = useMemo(
    () => initialTeam ? TEAMS.find((t) => t.slug === initialTeam)?.id : undefined,
    [initialTeam],
  );

  const initiatives = useMemo(
    () => teamId ? allInitiatives.filter((i) => i.teamId === teamId) : allInitiatives,
    [allInitiatives, teamId],
  );

  useEffect(() => {
    setOrderedIds((prev) => {
      const existing = prev.filter((id) => initiatives.some((i) => i.id === id));
      const incoming = initiatives
        .filter((i) => !prev.includes(i.id))
        .sort((a, b) => (a.score?.manualRankOverride ?? 999) - (b.score?.manualRankOverride ?? 999))
        .map((i) => i.id);
      return [...existing, ...incoming];
    });
  }, [initiatives]);

  const initiativeMap = useMemo(
    () => new Map(initiatives.map((i) => [i.id, i])),
    [initiatives],
  );

  const activePlanId = useMemo(() => {
    if (!teamId) return null;
    return plans.find(
      (p) =>
        p.teamId === teamId &&
        p.quarter.year === CURRENT_QUARTER.year &&
        p.quarter.quarter === CURRENT_QUARTER.quarter,
    )?.id ?? null;
  }, [plans, teamId]);

  // Auto-navigate when all sent to roadmap
  const prevLen = useRef<number | null>(null);
  useEffect(() => {
    if (prevLen.current === null) { prevLen.current = initiatives.length; return; }
    const canNavigate = initialTeam ? hasActed : scoringStarted;
    if (prevLen.current > 0 && initiatives.length === 0 && canNavigate) {
      const target = initialTeam ? `/team/${initialTeam}/roadmap` : "/roadmap";
      const t = setTimeout(() => router.push(target), 1200);
      return () => clearTimeout(t);
    }
    prevLen.current = initiatives.length;
  }, [initiatives.length, hasActed, initialTeam, scoringStarted, router]);

  // List drag (RICE / WSJF)
  useEffect(() => {
    if (dragId) {
      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";
    } else {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
    return () => { document.body.style.cursor = ""; document.body.style.userSelect = ""; };
  }, [dragId]);

  useEffect(() => {
    if (!dragId) return;
    function onUp() {
      if (dragOverIdx !== null && dragId) {
        setOrderedIds((prev) => {
          const next = prev.filter((id) => id !== dragId);
          next.splice(dragOverIdx, 0, dragId!);
          next.forEach((id, idx) => setManualRank(id, idx + 1, "drag"));
          return next;
        });
      }
      setDragId(null);
      setDragOverIdx(null);
    }
    document.addEventListener("mouseup", onUp);
    return () => document.removeEventListener("mouseup", onUp);
  }, [dragId, dragOverIdx, setManualRank]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDragStart = useCallback((id: string, _e: React.MouseEvent) => {
    setDragId(id);
    setDragOverIdx(orderedIds.indexOf(id));
  }, [orderedIds]);

  const handleSendToRoadmap = useCallback((id: string) => {
    const initiative = initiativeMap.get(id);
    if (!initiative) return;

    // Workflow flow: update workflowStage in inbox store
    if (initiative.featureRequestId) {
      updateRequest(initiative.featureRequestId, { workflowStage: "roadmap" });
    }

    // Team-based flow: add to roadmap plan
    if (teamId) {
      let planId = activePlanId;
      if (!planId) {
        const newPlan: QuarterlyPlan = {
          id: `plan_${teamId}_${CURRENT_QUARTER.year}q${CURRENT_QUARTER.quarter}_${Date.now()}`,
          quarter: CURRENT_QUARTER,
          workspaceId: "ws_01",
          teamId,
          status: "draft",
          goals: [],
          items: [],
          capacity: { unit: "story_points", total: 80, committed: 0, warningThreshold: 0.9, byArea: {} },
          reviewers: [],
          lockedAt: null,
          lockedBy: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          shareLink: null,
        };
        addPlan(newPlan);
        planId = newPlan.id;
      }
      const alreadyInPlan = plans.find((p) => p.id === planId)?.items.some((i) => i.id === id);
      if (!alreadyInPlan) addItemToPlan(planId!, initiative);
      if (phaseKey) markPhaseActed(phaseKey);
    }

    removeInitiative(id);
    if (openId === id) setOpenId(null);
    setRoadmapToast(initiative.title);
    setTimeout(() => setRoadmapToast(null), 3500);
  }, [initiativeMap, teamId, activePlanId, plans, addPlan, addItemToPlan, removeInitiative, openId, phaseKey, markPhaseActed, updateRequest]);

  const handleSendBackToIdeas = useCallback((id: string) => {
    if (scoringStarted) return;
    const initiative = initiativeMap.get(id);
    if (!initiative) return;
    if (initiative.featureRequestId) {
      updateRequest(initiative.featureRequestId, { workflowStage: "ideas" });
    }
    removeInitiative(id);
    if (openId === id) setOpenId(null);
  }, [scoringStarted, initiativeMap, updateRequest, removeInitiative, openId]);

  const handleResetPrioritization = useCallback(() => {
    // Move all prioritization items back to ideas
    const prioritizationItems = inboxRequests.filter((r) => r.workflowStage === "prioritization");
    prioritizationItems.forEach((r) => updateRequest(r.id, { workflowStage: "ideas" }));
    // Remove matching items from scoring store
    const prioritizationIds = new Set(prioritizationItems.map((r) => r.id));
    allInitiatives
      .filter((i) => i.featureRequestId && prioritizationIds.has(i.featureRequestId))
      .forEach((i) => removeInitiative(i.id));
    // Reset workflow flags
    wfResetPrioritization();
  }, [inboxRequests, updateRequest, allInitiatives, removeInitiative, wfResetPrioritization]);

  useGlobalShortcuts({
    escape: () => { if (openId) setOpenId(null); },
    undo: () => temporal.undo(),
    redo: () => temporal.redo(),
  });

  // Wrap scoring updates to lock the framework on first action
  const handleUpdateRICE = useCallback((id: string, patch: Partial<RICEScore>) => {
    if (!scoringStarted) startScoring(activeFramework);
    updateRICE(id, patch);
  }, [scoringStarted, startScoring, activeFramework, updateRICE]);

  const handleUpdateMoSCoW = useCallback((id: string, label: MoSCoWLabel) => {
    if (!scoringStarted) startScoring(activeFramework);
    updateMoSCoW(id, label);
  }, [scoringStarted, startScoring, activeFramework, updateMoSCoW]);

  const handleUpdateWSJF = useCallback((id: string, patch: Partial<WSJFScore>) => {
    if (!scoringStarted) startScoring(activeFramework);
    updateWSJF(id, patch);
  }, [scoringStarted, startScoring, activeFramework, updateWSJF]);

  const handleClearMoSCoW = useCallback((id: string) => {
    if (!scoringStarted) startScoring(activeFramework);
    clearMoSCoW(id);
  }, [scoringStarted, startScoring, activeFramework, clearMoSCoW]);

  const openInitiative = openId ? initiativeMap.get(openId) ?? null : null;
  const hasDetail = !!openInitiative;

  const sharedListProps: ListViewProps = {
    orderedIds, initiativeMap, dragId, dragOverIdx, setDragOverIdx,
    handleDragStart, openId, setOpenId, initialTeam, handleSendToRoadmap,
    handleSendBackToIdeas: !scoringStarted ? handleSendBackToIdeas : undefined,
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Prioritization" />
      <WorkflowBar currentStage="prioritization" teamSlug={initialTeam} />

      <div data-tour="scoring-framework-tabs" className="flex-shrink-0">
        <FrameworkTabs
          active={activeFramework}
          locked={scoringStarted}
          onChange={(f) => { if (!scoringStarted) setActiveFramework(f); }}
        />
      </div>

      {scoringStarted && (
        <div className="flex items-center gap-3 px-5 py-2.5 border-b border-[var(--color-warning)]/30 bg-[var(--color-warning)]/8 flex-shrink-0">
          <Lock size={14} className="text-[var(--color-warning)] flex-shrink-0" />
          <p className="text-[13px] text-[var(--color-text-secondary)] flex-1 leading-snug">
            <span className="font-semibold text-[var(--color-warning)]">
              Framework locked: {activeFramework.toUpperCase()}
            </span>
            {" — Cannot be changed while scoring is in progress."}
          </p>
          <button
            onClick={handleResetPrioritization}
            className={cn(
              "inline-flex items-center gap-1.5 h-7 px-3 rounded-md text-[12px] font-medium flex-shrink-0",
              "text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]",
              "hover:text-[var(--color-danger)] hover:border-[var(--color-danger)]/40 hover:bg-[var(--color-danger)]/6 transition-colors",
            )}
          >
            <RotateCcw size={12} />
            Reset Prioritization
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Main content */}
        <div
          data-tour="scoring-card-list"
          className={cn(
            "flex flex-col overflow-hidden transition-all duration-200",
            hasDetail ? "hidden md:flex md:[flex:0_0_55%]" : "flex-1",
          )}
        >
          {initiatives.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <EmptyState
                Icon={BarChart2}
                title="Nothing to prioritize yet"
                description="Head to Ideas and move items here to start scoring."
                action={initialTeam ? {
                  label: "Go to Ideas",
                  onClick: () => { window.location.href = `/team/${initialTeam}/ideas`; },
                } : {
                  label: "Go to Ideas",
                  onClick: () => router.push("/ideas"),
                }}
              />
            </div>
          ) : (
            <>
              {activeFramework === "rice"   && <RICEView   {...sharedListProps} updateRICE={handleUpdateRICE} />}
              {activeFramework === "wsjf"   && <WSJFView   {...sharedListProps} updateWSJF={handleUpdateWSJF} />}
              {activeFramework === "moscow" && (
                <MoSCoWView
                  initiatives={initiatives}
                  openId={openId}
                  setOpenId={setOpenId}
                  updateMoSCoW={handleUpdateMoSCoW}
                  clearMoSCoW={handleClearMoSCoW}
                  onSendToRoadmap={handleSendToRoadmap}
                />
              )}
            </>
          )}
        </div>

        {/* Detail panel */}
        {hasDetail && openInitiative && (
          <div className="flex flex-col overflow-hidden flex-1 md:[flex:0_0_45%] border-l border-[var(--color-border-subtle)]">
            <InitiativeDetail
              initiative={openInitiative}
              framework={activeFramework}
              goals={goals}
              onClose={() => setOpenId(null)}
              onUpdateRICE={handleUpdateRICE}
              onUpdateMoSCoW={handleUpdateMoSCoW}
              onUpdateWSJF={handleUpdateWSJF}
              onUpdateEffort={updateEffort}
              onUpdateGoals={updateGoals}
              onUpdateGoalNotes={updateGoalNotes}
              onSendToRoadmap={handleSendToRoadmap}
            />
          </div>
        )}
      </div>

      {/* Toast */}
      {roadmapToast && (
        <div className={cn(
          "fixed bottom-20 left-1/2 -translate-x-1/2 z-50",
          "flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg",
          "bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]",
          "text-[12px] text-[var(--color-text-secondary)]",
          "animate-in fade-in slide-in-from-bottom-2 duration-200",
        )}>
          <Check size={13} className="text-[var(--color-success)]" />
          <span>Sent to <span className="font-semibold text-[var(--color-text-primary)]">Roadmap</span></span>
        </div>
      )}
    </div>
  );
}
