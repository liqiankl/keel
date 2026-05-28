"use client";

import { useState, useRef, useEffect } from "react";
import { X, Clock, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { STATUS_CONFIG, PRIORITY_CONFIG, CURRENT_QUARTER, makeQuarterRef } from "@/lib/constants";
import type { RoadmapItem, QuarterlyGoal, InitiativeStatus, QuarterRef } from "@/types";

const ALL_STATUSES: InitiativeStatus[] = [
  "backlog", "todo", "in_progress", "in_review", "closed", "canceled",
];

const MOSCOW_LABELS: Record<string, string> = {
  must: "Must", should: "Should", could: "Could", wont: "Won't",
};
const MOSCOW_COLORS: Record<string, string> = {
  must: "#f87171", should: "#fb923c", could: "#60a5fa", wont: "#6b7280",
};

function getNextQuarters(count = 4): QuarterRef[] {
  const { year, quarter } = CURRENT_QUARTER;
  const quarters: QuarterRef[] = [];
  let y = year, q = quarter;
  for (let i = 0; i < count; i++) {
    q++;
    if (q > 4) { q = 1; y++; }
    quarters.push(makeQuarterRef(y, q as 1 | 2 | 3 | 4));
  }
  return quarters;
}

const FUTURE_QUARTERS = getNextQuarters(2);

interface RoadmapItemDetailProps {
  item: RoadmapItem;
  goals: QuarterlyGoal[];
  planId: string;
  onClose: () => void;
  onStatusChange: (itemId: string, planId: string, status: InitiativeStatus) => void;
  onQuarterChange?: (itemId: string, planId: string, quarter: QuarterRef) => void;
}

export function RoadmapItemDetail({
  item,
  goals,
  planId,
  onClose,
  onStatusChange,
  onQuarterChange,
}: RoadmapItemDetailProps) {
  const [quarterOpen, setQuarterOpen] = useState(false);
  const [pendingQuarter, setPendingQuarter] = useState<QuarterRef | null>(null);
  const quarterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!quarterOpen) return;
    function handle(e: MouseEvent) {
      if (quarterRef.current && !quarterRef.current.contains(e.target as Node)) {
        setQuarterOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [quarterOpen]);
  const priorityCfg = PRIORITY_CONFIG[item.priority] ?? PRIORITY_CONFIG.none;
  const itemGoals   = goals.filter((g) => item.goalIds.includes(g.id));
  const rice        = item.score?.rice;
  const moscow      = item.score?.moscow;
  const wsjf        = item.score?.wsjf;
  const hasScore    = (rice?.score != null && rice.score > 0) || moscow || (wsjf?.score != null && wsjf.score > 0);

  return (
    <div className="flex flex-col h-full border-l border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[var(--color-border-subtle)] flex-shrink-0">
        <div className="flex items-start gap-2.5 min-w-0">
          <span
            className="mt-[3px] h-2.5 w-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: priorityCfg.color }}
            aria-hidden="true"
          />
          <h2 className="text-[15px] font-semibold text-[var(--color-text-primary)] leading-snug">
            {item.title}
          </h2>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className={cn(
            "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md mt-0.5",
            "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]",
            "hover:bg-[var(--color-bg-hover)] transition-colors",
            "focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]",
          )}
        >
          <X size={16} />
        </button>
      </div>

      {/* ── Status selector ── */}
      <div className="px-5 py-3 border-b border-[var(--color-border-subtle)] flex-shrink-0">
        <p className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
          Status
        </p>
        <div className="flex flex-wrap gap-1.5">
          {ALL_STATUSES.map((s) => {
            const cfg      = STATUS_CONFIG[s];
            const isActive = item.status === s;
            return (
              <button
                key={s}
                onClick={() => onStatusChange(item.id, planId, s)}
                className={cn(
                  "inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[12px] font-medium transition-all",
                  isActive ? "ring-1" : "opacity-50 hover:opacity-90",
                )}
                style={
                  isActive
                    ? {
                        backgroundColor: cfg.color + "18",
                        color: cfg.color,
                        border: `1px solid ${cfg.color}40`,
                      }
                    : {
                        backgroundColor: "var(--color-bg-hover)",
                        color: "var(--color-text-secondary)",
                      }
                }
              >
                <span
                  className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: isActive ? cfg.color : "var(--color-text-muted)" }}
                />
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* Description */}
        {item.description && (
          <section>
            <SectionLabel>Description</SectionLabel>
            <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
              {item.description}
            </p>
          </section>
        )}

        {/* Meta grid */}
        <section>
          <SectionLabel>Details</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            <MetaCard label="Priority">
              <span
                className="flex items-center gap-1.5 text-[13px] font-medium"
                style={{ color: priorityCfg.color }}
              >
                <span
                  className="h-2 w-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: priorityCfg.color }}
                />
                {priorityCfg.label}
              </span>
            </MetaCard>

            <MetaCard label="Effort">
              <span className="text-[13px] font-mono text-[var(--color-text-primary)]">
                {item.effort.points != null ? `${item.effort.points} pts` : "—"}
              </span>
            </MetaCard>

            {item.productArea && (
              <MetaCard label="Area">
                <span className="text-[13px] text-[var(--color-text-primary)] truncate block">
                  {item.productArea}
                </span>
              </MetaCard>
            )}

            <MetaCard label="Quarter">
              <div ref={quarterRef} className="relative">
                <button
                  onClick={() => onQuarterChange && setQuarterOpen((o) => !o)}
                  disabled={!onQuarterChange}
                  className={cn(
                    "flex items-center gap-1 text-[13px] text-[var(--color-text-primary)]",
                    onQuarterChange && "hover:text-[var(--color-brand)] transition-colors cursor-pointer",
                  )}
                >
                  {item.quarter.label}
                  {onQuarterChange && (
                    <ChevronDown
                      size={13}
                      className={cn("text-[var(--color-text-muted)] transition-transform", quarterOpen && "rotate-180")}
                    />
                  )}
                </button>
                {quarterOpen && (
                  <div className={cn(
                    "absolute left-0 top-full mt-1 z-50 min-w-[110px] rounded-lg py-1",
                    "bg-[var(--color-bg-elevated)] border border-[var(--color-border-strong)]",
                    "shadow-xl",
                  )}>
                    {FUTURE_QUARTERS.map((q) => (
                      <button
                        key={q.label}
                        onClick={() => {
                          setPendingQuarter(q);
                          setQuarterOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-[13px] transition-colors",
                          "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]",
                        )}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </MetaCard>
          </div>
        </section>

        {/* Goals */}
        {itemGoals.length > 0 && (
          <section>
            <SectionLabel>Goals</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {itemGoals.map((g) => (
                <span
                  key={g.id}
                  className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[12px] font-medium"
                  style={{
                    backgroundColor: g.color + "18",
                    color: g.color,
                    border: `1px solid ${g.color}2e`,
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: g.color }}
                  />
                  {g.title}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Score */}
        {hasScore && (
          <section>
            <SectionLabel>Score</SectionLabel>
            <div className="flex items-end gap-2 flex-wrap">
              {rice?.score != null && rice.score > 0 && (
                <ScoreChip value={rice.score} label="RICE" />
              )}
              {moscow && (
                <ScoreChip
                  value={MOSCOW_LABELS[moscow] ?? moscow}
                  label="MoSCoW"
                  color={MOSCOW_COLORS[moscow]}
                />
              )}
              {wsjf?.score != null && wsjf.score > 0 && (
                <ScoreChip value={wsjf.score} label="WSJF" />
              )}
              {item.score?.scoredAt && (
                <span className="flex items-center gap-1 text-[11px] text-[var(--color-text-muted)] ml-auto pb-1">
                  <Clock size={11} />
                  {new Date(item.score.scoredAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>
          </section>
        )}
      </div>

      {/* ── Quarter change confirmation modal ── */}
      {pendingQuarter && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setPendingQuarter(null)}
          />
          <div className={cn(
            "relative z-10 w-full max-w-[360px] rounded-xl p-5",
            "bg-[var(--color-bg-surface)] border border-[var(--color-border-strong)]",
            "shadow-2xl",
          )}>
            <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)] mb-2">
              Move to {pendingQuarter.label}?
            </h3>
            <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed mb-5">
              Do you want to move this item to {pendingQuarter.label}? It will be set to draft state until processed.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setPendingQuarter(null)}
                className={cn(
                  "h-8 px-4 rounded-lg text-[13px] font-medium transition-colors",
                  "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]",
                  "border border-[var(--color-border-subtle)]",
                )}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onQuarterChange!(item.id, planId, pendingQuarter);
                  setPendingQuarter(null);
                }}
                className={cn(
                  "h-8 px-4 rounded-lg text-[13px] font-medium transition-colors",
                  "bg-[var(--color-brand)] text-white hover:opacity-90",
                )}
              >
                Yes, move it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
      {children}
    </p>
  );
}

function MetaCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] px-3 py-2">
      <p className="text-[11px] text-[var(--color-text-muted)] mb-0.5">{label}</p>
      {children}
    </div>
  );
}

function ScoreChip({
  value,
  label,
  color,
}: {
  value: number | string;
  label: string;
  color?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-4 py-2.5 min-w-[64px]">
      <span
        className="text-[20px] font-mono font-bold tabular-nums leading-none"
        style={{ color: color ?? "var(--color-brand)" }}
      >
        {value}
      </span>
      <span className="text-[11px] text-[var(--color-text-muted)]">{label}</span>
    </div>
  );
}
