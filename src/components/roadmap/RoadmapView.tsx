"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useStore } from "zustand";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Copy, Check as CheckIcon, Lock, Map, Share2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { WorkflowBar } from "@/components/workflow/WorkflowBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { RoadmapItemDetail } from "./RoadmapItemDetail";
import { useRoadmapStore } from "@/store/useRoadmapStore";
import { useAppStore } from "@/store/useAppStore";
import { useViewsStore } from "@/store/useViewsStore";
import { TEAMS } from "@/lib/constants";
import { useGlobalShortcuts } from "@/hooks/useGlobalShortcuts";
import { cn } from "@/lib/cn";
import type { InitiativeStatus, PlanStatus, QuarterlyPlan, RoadmapItem } from "@/types";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

type QuarterTab = "q2" | "q3" | "q4" | "year";

const QUARTER_TABS: { key: QuarterTab; label: string }[] = [
  { key: "q2", label: "Q2 2026" },
  { key: "q3", label: "Q3 2026" },
  { key: "q4", label: "Q4 2026" },
  { key: "year", label: "Full Year" },
];

const QUARTER_MONTHS: Record<string, { short: string; long: string }[]> = {
  q1: [{ short: "Jan", long: "January" }, { short: "Feb", long: "February" }, { short: "Mar", long: "March" }],
  q2: [{ short: "Apr", long: "April" },  { short: "May", long: "May" },      { short: "Jun", long: "June" }],
  q3: [{ short: "Jul", long: "July" },   { short: "Aug", long: "August" },   { short: "Sep", long: "September" }],
  q4: [{ short: "Oct", long: "October" },{ short: "Nov", long: "November" }, { short: "Dec", long: "December" }],
};

const TOTAL_WEEKS = 12;
const LABEL_W = 256; // px — left sticky label column
const DRAG_THRESHOLD = 4; // px movement before treating interaction as a drag

const STATUS_META: Record<string, { color: string; label: string }> = {
  backlog:     { color: "#94a3b8", label: "Backlog"     }, // slate
  todo:        { color: "#8b5cf6", label: "Planned"     }, // violet
  in_progress: { color: "#3b82f6", label: "In Progress" }, // blue
  in_review:   { color: "#f59e0b", label: "In Review"   }, // amber
  closed:      { color: "#14b8a6", label: "Completed"   }, // teal
  canceled:    { color: "#ef4444", label: "Canceled"    }, // red
};

const PRIORITY_COLOR: Record<string, string> = {
  urgent: "#e5484d",
  high:   "#f97316",
  medium: "#5e5ce6",
  low:    "#94a3b8",
};

const STATUS_SORT: Partial<Record<InitiativeStatus, number>> = {
  in_progress: 0, in_review: 1, todo: 2, backlog: 3, closed: 4, canceled: 5,
};
const PRIO_SORT: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

// ─────────────────────────────────────────────
// Auto-placement (items have no date fields — distribute by priority + status)
// ─────────────────────────────────────────────

function getStartWeek(item: RoadmapItem): number {
  if (item.status === "in_progress") return 1;
  if (item.status === "in_review") return 3;
  if (item.status === "todo") {
    if (item.priority === "urgent") return 1;
    if (item.priority === "high")   return 3;
    if (item.priority === "medium") return 6;
    return 9;
  }
  if (item.priority === "urgent") return 2;
  if (item.priority === "high")   return 5;
  if (item.priority === "medium") return 8;
  return 10;
}

function getDurationWeeks(item: RoadmapItem): number {
  const pts = item.effort.points;
  if (!pts) return 3;
  if (pts <= 8)  return 1;
  if (pts <= 21) return 2;
  if (pts <= 55) return 3;
  if (pts <= 89) return 4;
  return Math.min(6, Math.ceil(pts / 15));
}

function sortItems(items: RoadmapItem[]): RoadmapItem[] {
  return [...items].sort((a, b) => {
    const sd = (STATUS_SORT[a.status] ?? 5) - (STATUS_SORT[b.status] ?? 5);
    return sd !== 0 ? sd : (PRIO_SORT[a.priority] ?? 3) - (PRIO_SORT[b.priority] ?? 3);
  });
}

// ─────────────────────────────────────────────
// Today marker
// ─────────────────────────────────────────────

function getTodayPercent(qKey: string): number | null {
  const now = new Date();
  const y = now.getFullYear();
  const RANGES: Record<string, [Date, Date]> = {
    q1: [new Date(y, 0, 1),  new Date(y, 2, 31)],
    q2: [new Date(y, 3, 1),  new Date(y, 5, 30)],
    q3: [new Date(y, 6, 1),  new Date(y, 8, 30)],
    q4: [new Date(y, 9, 1),  new Date(y, 11, 31)],
  };
  const r = RANGES[qKey];
  if (!r) return null;
  const t = now.getTime();
  if (t < r[0].getTime() || t > r[1].getTime()) return null;
  return ((t - r[0].getTime()) / (r[1].getTime() - r[0].getTime())) * 100;
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function TimelineGrid({ todayPct }: { todayPct: number | null }) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Past shade */}
      {todayPct !== null && (
        <div
          className="absolute inset-y-0 left-0"
          style={{ width: `${todayPct}%`, backgroundColor: "rgba(0,0,0,0.025)" }}
        />
      )}
      {/* Week grid lines */}
      {Array.from({ length: TOTAL_WEEKS - 1 }).map((_, i) => (
        <div
          key={i}
          className="absolute top-0 bottom-0"
          style={{
            left: `${((i + 1) / TOTAL_WEEKS) * 100}%`,
            width: "1px",
            backgroundColor: "var(--color-border-subtle)",
            opacity: (i + 1) % 4 === 0 ? 0.8 : 0.35,
          }}
        />
      ))}
    </div>
  );
}

// Renders once over the entire rows area — today line + 3 labels (top / mid / bottom).
// Uses CSS calc so it stays aligned with the gantt area regardless of container width.
function TodayOverlay({ todayPct }: { todayPct: number }) {
  const left = `calc(${LABEL_W}px + (100% - ${LABEL_W}px) * ${todayPct / 100})`;
  const pill = "absolute -translate-x-1/2 text-[9px] font-bold text-white bg-[#e5484d] rounded px-1 py-0.5 leading-none";
  return (
    <div className="absolute inset-0 pointer-events-none z-10" style={{ left: 0, right: 0 }}>
      <div className="absolute inset-y-0" style={{ left }}>
        {/* Vertical line */}
        <div className="absolute inset-y-0 w-[2px] -translate-x-[1px] bg-[#e5484d]" />
        {/* Labels: top, middle, bottom */}
        <div className={`${pill} top-2`}>TODAY</div>
        <div className={`${pill} top-1/2 -translate-y-1/2 -translate-x-1/2`}>TODAY</div>
        <div className={`${pill} bottom-2`}>TODAY</div>
      </div>
    </div>
  );
}

function GanttBar({
  item,
  startWeek,
  isOpen,
  isDragging,
  onMouseDown,
}: {
  item: RoadmapItem;
  startWeek: number;
  isOpen: boolean;
  isDragging: boolean;
  onMouseDown: (id: string, e: React.MouseEvent) => void;
}) {
  const dur = getDurationWeeks(item);
  const end = Math.min(startWeek + dur - 1, TOTAL_WEEKS);
  const actualDur = end - startWeek + 1;
  const leftPct  = ((startWeek - 1) / TOTAL_WEEKS) * 100;
  const widthPct = (actualDur / TOTAL_WEEKS) * 100;
  const { color } = STATUS_META[item.status] ?? { color: "#94a3b8" };

  return (
    <div
      className="absolute inset-y-0 flex items-center px-1"
      style={{
        left: `${leftPct}%`,
        width: `${widthPct}%`,
        transition: isDragging ? "none" : "left 0.18s ease, width 0.18s ease",
        zIndex: isDragging ? 20 : undefined,
      }}
    >
      <div
        role="button"
        tabIndex={0}
        onMouseDown={(e) => onMouseDown(item.id, e)}
        className={cn(
          "w-full h-8 rounded-lg flex items-center gap-1.5 px-2.5 select-none",
          isDragging
            ? "shadow-2xl cursor-grabbing scale-[1.03]"
            : "shadow-[0_1px_3px_rgba(0,0,0,0.08)] cursor-grab hover:brightness-110",
        )}
        style={{
          backgroundColor: isDragging ? `${color}40` : `${color}28`,
          border: `1.5px solid ${color}${isDragging ? "99" : isOpen ? "bb" : "66"}`,
          outline: isOpen && !isDragging ? `2px solid ${color}60` : undefined,
          outlineOffset: isOpen && !isDragging ? "1px" : undefined,
          transition: isDragging ? "none" : "background-color 0.1s, border-color 0.1s",
        }}
        title={`${item.title} · ${STATUS_META[item.status]?.label} · Drag to reposition`}
      >
        <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
        <span className="text-[11px] font-semibold truncate" style={{ color }}>
          {item.title}
        </span>
        {isDragging ? (
          <span
            className="ml-auto text-[10px] font-bold flex-shrink-0 tabular-nums whitespace-nowrap"
            style={{ color }}
          >
            W{startWeek}
          </span>
        ) : (
          actualDur >= 3 && item.effort.points && (
            <span
              className="ml-auto text-[10px] tabular-nums flex-shrink-0 opacity-70"
              style={{ color }}
            >
              {item.effort.points}pt
            </span>
          )
        )}
      </div>
    </div>
  );
}

function ItemRow({
  item,
  startWeek,
  isOpen,
  isDragging,
  onBarMouseDown,
  todayPct,
}: {
  item: RoadmapItem;
  startWeek: number;
  isOpen: boolean;
  isDragging: boolean;
  onBarMouseDown: (id: string, e: React.MouseEvent) => void;
  todayPct: number | null;
}) {
  const { color, label } = STATUS_META[item.status] ?? { color: "#94a3b8", label: item.status };
  const priColor = PRIORITY_COLOR[item.priority] ?? "#94a3b8";

  return (
    <div
      className={cn(
        "flex border-b border-[var(--color-border-subtle)] h-[52px] flex-shrink-0",
        isOpen ? "bg-[var(--color-brand)]/[0.04]" : "hover:bg-[var(--color-bg-hover)]",
        "transition-colors",
      )}
    >
      {/* Label column */}
      <div
        className="flex items-center gap-2.5 px-3 flex-shrink-0 border-r border-[var(--color-border-subtle)]"
        style={{ width: LABEL_W }}
      >
        <div
          className="h-2.5 w-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
          title={label}
        />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-[var(--color-text-primary)] truncate leading-snug">
            {item.title}
          </p>
          <p className="text-[11px] text-[var(--color-text-muted)] truncate leading-snug">
            {item.productArea || label}
          </p>
        </div>
        <div
          className="h-[5px] w-[5px] rounded-full flex-shrink-0"
          style={{ backgroundColor: priColor }}
          title={item.priority}
        />
      </div>

      {/* Gantt area */}
      <div className="flex-1 relative overflow-hidden">
        <TimelineGrid todayPct={todayPct} />
        <GanttBar
          item={item}
          startWeek={startWeek}
          isOpen={isOpen}
          isDragging={isDragging}
          onMouseDown={onBarMouseDown}
        />
      </div>
    </div>
  );
}

function MonthHeader({ qKey }: { qKey: string }) {
  const months = QUARTER_MONTHS[qKey] ?? [];
  return (
    <div className="flex flex-1">
      {months.map((m) => (
        <div key={m.long} className="flex-1 border-l border-[var(--color-border-subtle)] first:border-l-0">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-[var(--color-text-secondary)] bg-[var(--color-bg-elevated)]">
            {m.long}
          </div>
          <div className="flex bg-[var(--color-bg-elevated)]">
            {[1, 2, 3, 4].map((w) => (
              <div
                key={w}
                className="flex-1 py-1 text-[10px] text-[var(--color-text-muted)] text-center border-l border-[var(--color-border-subtle)]/50 first:border-l-0"
              >
                W{w}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Plan status
// ─────────────────────────────────────────────

const PLAN_STATUS_META: Record<PlanStatus, { color: string; label: string }> = {
  draft:     { color: "#94a3b8", label: "Draft"     },
  in_review: { color: "#f59e0b", label: "In Review" },
  approved:  { color: "#22c55e", label: "Approved"  },
  locked:    { color: "#5e5ce6", label: "Locked"    },
};

function LockConfirmDialog({
  open,
  quarterLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  quarterLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!v) onCancel(); }}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-150"
        />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
            "w-[380px] rounded-2xl p-6",
            "bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]",
            "shadow-[0_24px_48px_rgba(0,0,0,0.18)]",
            "animate-in fade-in zoom-in-95 duration-150",
          )}
        >
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full flex items-center justify-center bg-[#5e5ce6]/12 border border-[#5e5ce6]/30">
              <Lock size={22} className="text-[#5e5ce6]" />
            </div>
          </div>

          <Dialog.Title className="text-[16px] font-semibold text-[var(--color-text-primary)] text-center mb-1">
            Lock {quarterLabel} plan?
          </Dialog.Title>
          <Dialog.Description className="text-[13px] text-[var(--color-text-muted)] text-center leading-relaxed mb-6">
            Locking marks this plan as final. You can still view it but it signals the plan is committed and shouldn&apos;t change.
          </Dialog.Description>

          <div className="flex gap-2.5">
            <button
              onClick={onCancel}
              className={cn(
                "flex-1 h-9 rounded-lg text-[13px] font-medium transition-colors",
                "border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]",
                "hover:bg-[var(--color-bg-hover)]",
              )}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={cn(
                "flex-1 h-9 rounded-lg text-[13px] font-semibold transition-colors",
                "bg-[#5e5ce6] text-white hover:bg-[#4f4de0]",
              )}
            >
              <Lock size={13} className="inline mr-1.5 -mt-0.5" />
              Lock Plan
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ─────────────────────────────────────────────
// Lock celebration
// ─────────────────────────────────────────────

const CONFETTI_COLORS = ["#6366f1", "#8b5cf6", "#f59e0b", "#22c55e", "#0ea5e9", "#f97316", "#ef4444"];

function Confetti() {
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        x: (Math.random() - 0.5) * 480,
        y: -(60 + Math.random() * 260),
        rotate: (Math.random() - 0.5) * 720,
        size: 5 + Math.random() * 7,
        delay: Math.random() * 0.4,
      })),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{ width: p.size, height: p.size, backgroundColor: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.4, rotate: p.rotate }}
          transition={{ duration: 1.1, delay: p.delay, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
    </div>
  );
}

function LockCelebrationModal({
  open,
  plan,
  shareUrl,
  onClose,
}: {
  open: boolean;
  plan: QuarterlyPlan;
  shareUrl: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const shareLink = shareUrl;

  function copyLink() {
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  }

  const quarterLabel = plan.quarter?.label ?? `Q${plan.quarter?.quarter} ${plan.quarter?.year}`;

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[3px] animate-in fade-in duration-200" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
            "w-[420px] rounded-2xl p-8 overflow-hidden",
            "bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]",
            "shadow-[0_32px_64px_rgba(0,0,0,0.24)]",
            "animate-in fade-in zoom-in-90 duration-300",
          )}
        >
          {/* Confetti burst */}
          <AnimatePresence>{open && <Confetti />}</AnimatePresence>

          {/* Lock icon with pulse ring */}
          <div className="relative flex justify-center mb-5">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
              className="relative"
            >
              {/* Pulse ring */}
              <motion.div
                className="absolute inset-0 rounded-full bg-[#22c55e]/20"
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 2.2, opacity: 0 }}
                transition={{ duration: 1.0, delay: 0.3, ease: "easeOut" }}
              />
              <div className="h-16 w-16 rounded-full flex items-center justify-center bg-[#22c55e]/12 border-2 border-[#22c55e]/40">
                <Lock size={28} className="text-[#22c55e]" />
              </div>
            </motion.div>
          </div>

          {/* Titles */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="text-center mb-2"
          >
            <Dialog.Title className="text-[20px] font-bold text-[var(--color-text-primary)]">
              Plan locked! 🎉
            </Dialog.Title>
            <Dialog.Description className="text-[13px] text-[var(--color-text-muted)] mt-1 leading-relaxed">
              Your <span className="font-medium text-[var(--color-text-secondary)]">{quarterLabel}</span> roadmap
              is committed. Share the read-only link with your team so everyone can see what's shipping.
            </Dialog.Description>
          </motion.div>

          {/* Share link */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.3 }}
            className="mt-5 mb-6"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5 flex items-center gap-1.5">
              <Share2 size={10} />
              Read-only share link
            </p>
            <div className="flex items-center gap-2">
              <div className={cn(
                "flex-1 flex items-center h-9 px-3 rounded-lg text-[12px] font-mono truncate",
                "bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)]",
                "text-[var(--color-text-secondary)]",
              )}>
                {shareLink || "Generating…"}
              </div>
              <button
                onClick={copyLink}
                disabled={!shareLink}
                className={cn(
                  "flex items-center gap-1.5 h-9 px-3 rounded-lg text-[12px] font-semibold flex-shrink-0 transition-all duration-150",
                  copied
                    ? "bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30"
                    : "bg-[var(--color-brand)] text-white hover:opacity-90",
                )}
              >
                {copied ? <CheckIcon size={13} /> : <Copy size={13} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </motion.div>

          {/* Done */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.44 }}
            onClick={onClose}
            className={cn(
              "w-full h-9 rounded-xl text-[13px] font-medium transition-colors",
              "border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]",
              "hover:bg-[var(--color-bg-hover)]",
            )}
          >
            Done
          </motion.button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function PlanStatusControl({
  plan,
  onSetStatus,
  onLock,
}: {
  plan: QuarterlyPlan;
  onSetStatus: (id: string, status: PlanStatus) => void;
  onLock: (id: string, userId: string) => void;
}) {
  const [confirmOpen, setConfirmOpen]         = useState(false);
  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const [shareUrl, setShareUrl]               = useState("");

  const createView  = useViewsStore((s) => s.createView);
  const existingViews = useViewsStore((s) => s.views);

  const { color, label } = PLAN_STATUS_META[plan.status];
  const isLocked = plan.status === "locked";

  const quarterLabel = plan.quarter?.label ?? `Q${plan.quarter?.quarter} ${plan.quarter?.year}`;

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Current status badge */}
        <span
          className="inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-[11px] font-semibold"
          style={{
            backgroundColor: `${color}18`,
            color,
            border: `1px solid ${color}40`,
          }}
        >
          {isLocked && <Lock size={10} />}
          {label}
        </span>

        {/* Transition actions */}
        {plan.status === "draft" && (
          <button
            onClick={() => onSetStatus(plan.id, "in_review")}
            className={cn(
              "inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-[11px] font-medium",
              "border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]",
              "hover:border-[#f59e0b] hover:text-[#f59e0b] transition-colors",
            )}
            title="Send this plan for review"
          >
            Send for Review
            <ChevronRight size={11} />
          </button>
        )}

        {(plan.status === "in_review" || plan.status === "approved") && (
          <>
            <button
              onClick={() => setConfirmOpen(true)}
              className={cn(
                "inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-[11px] font-semibold",
                "border transition-colors",
                "text-[#5e5ce6] border-[#5e5ce6]/50 bg-[#5e5ce6]/8",
                "hover:bg-[#5e5ce6]/15",
              )}
              title="Lock this plan — no further changes"
            >
              <Lock size={10} />
              Lock Plan
            </button>
            <button
              onClick={() => onSetStatus(plan.id, "draft")}
              className="text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
              title="Revert to Draft"
            >
              Revert
            </button>
          </>
        )}

        {isLocked && plan.lockedAt && (
          <span className="text-[11px] text-[var(--color-text-muted)]">
            {new Date(plan.lockedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        )}
      </div>

      <LockConfirmDialog
        open={confirmOpen}
        quarterLabel={quarterLabel}
        onConfirm={() => {
          const token  = plan.id;
          const origin = typeof window !== "undefined" ? window.location.origin : "";
          const url    = `${origin}/share/${token}`;

          onLock(plan.id, "u_pm_01");

          // Create a shareable view in the views store if one doesn't already exist
          const alreadyLive = existingViews.some((v) => v.planId === plan.id && !v.revokedAt);
          if (!alreadyLive) {
            createView({
              id: `view_${plan.id}_${Date.now()}`,
              planId: plan.id,
              planLabel: quarterLabel,
              token,
              url,
              passwordProtected: false,
              password: null,
              hiddenFields: [],
              createdAt: new Date().toISOString(),
              createdBy: "Beulah Khumlo",
              revokedAt: null,
            });
          }

          setShareUrl(url);
          setConfirmOpen(false);
          setCelebrationOpen(true);
        }}
        onCancel={() => setConfirmOpen(false)}
      />

      <LockCelebrationModal
        open={celebrationOpen}
        plan={plan}
        shareUrl={shareUrl}
        onClose={() => setCelebrationOpen(false)}
      />
    </>
  );
}

// ─────────────────────────────────────────────
// Year overview (kept as card grid)
// ─────────────────────────────────────────────

const YEAR_STATUS_COLORS: Record<string, string> = {
  draft: "#94a3b8", in_review: "#f59e0b", locked: "#22c55e", archived: "#64748b",
};

function YearOverview({ plans, teamName }: { plans: QuarterlyPlan[]; teamName: string }) {
  const [expandedQuarters, setExpandedQuarters] = useState<Set<number>>(new Set());
  const allItems = plans.flatMap((p) => p.items);
  const inProg = allItems.filter((i) => i.status === "in_progress").length;
  const inRev  = allItems.filter((i) => i.status === "in_review").length;

  return (
    <div className="flex-1 overflow-y-auto px-5 py-5">
      <div className="mb-5 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-5 py-4 flex items-center gap-8 flex-wrap">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-0.5">Team</p>
          <p className="text-[13px] font-bold text-[var(--color-text-primary)]">{teamName}</p>
        </div>
        <div className="h-6 w-px bg-[var(--color-border-subtle)]" />
        {[
          { label: "Quarters planned", value: plans.length },
          { label: "Initiatives",      value: allItems.length },
          { label: "In progress",      value: inProg },
          { label: "In review",        value: inRev },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-0.5">{label}</p>
            <p className="text-[15px] font-bold text-[var(--color-text-primary)]">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {([2, 3, 4] as const).map((qNum) => {
          const plan = plans.find((p) => p.quarter.quarter === qNum);
          const label = `Q${qNum} 2026`;
          if (!plan) {
            return (
              <div key={qNum} className="rounded-xl border border-dashed border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] p-5 flex flex-col items-center justify-center min-h-[200px]">
                <p className="text-[12px] font-semibold text-[var(--color-text-muted)] mb-1">{label}</p>
                <p className="text-[12px] text-[var(--color-text-muted)]">No plan yet</p>
              </div>
            );
          }
          const sorted   = sortItems(plan.items);
          const isExpanded = expandedQuarters.has(qNum);
          const visible  = isExpanded ? sorted : sorted.slice(0, 5);
          const remaining = plan.items.length - 5;
          const capPct = plan.capacity.total > 0
            ? Math.round((plan.capacity.committed / plan.capacity.total) * 100)
            : 0;
          return (
            <div key={qNum} className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-bold text-[var(--color-text-primary)]">{label}</p>
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    color: YEAR_STATUS_COLORS[plan.status] ?? "#94a3b8",
                    backgroundColor: `${YEAR_STATUS_COLORS[plan.status] ?? "#94a3b8"}18`,
                  }}
                >
                  {plan.status}
                </span>
              </div>
              <div>
                <div className="flex justify-between text-[11px] text-[var(--color-text-muted)] mb-1.5">
                  <span>Capacity</span>
                  <span>{plan.capacity.committed}/{plan.capacity.total} pts · {capPct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--color-bg-elevated)] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(capPct, 100)}%`,
                      backgroundColor: capPct >= 90 ? "#e5484d" : "var(--color-brand)",
                    }}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                {visible.map((item) => {
                  const { color } = STATUS_META[item.status] ?? { color: "#94a3b8" };
                  return (
                    <div key={item.id} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-[12px] text-[var(--color-text-secondary)] truncate">{item.title}</span>
                    </div>
                  );
                })}
                {!isExpanded && remaining > 0 && (
                  <button
                    type="button"
                    onClick={() => setExpandedQuarters((prev) => new Set([...prev, qNum]))}
                    className="text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-brand)] pl-3.5 transition-colors text-left"
                  >
                    +{remaining} more
                  </button>
                )}
                {isExpanded && remaining > 0 && (
                  <button
                    type="button"
                    onClick={() => setExpandedQuarters((prev) => { const s = new Set(prev); s.delete(qNum); return s; })}
                    className="text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-brand)] pl-3.5 transition-colors text-left"
                  >
                    Show less
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main view
// ─────────────────────────────────────────────

interface RoadmapViewProps {
  initialTeam?: string;
}

export function RoadmapView({ initialTeam }: RoadmapViewProps = {}) {
  const [activeTab, setActiveTab] = useState<QuarterTab>("q2");
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  // Drag state — weekOverrides persists positions after drag; dragLive is the live position during drag
  const [weekOverrides, setWeekOverrides] = useState<Record<string, number>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [dragLive, setDragLive] = useState<{ itemId: string; week: number } | null>(null);
  const dragInfoRef = useRef<{ itemId: string; startX: number } | null>(null);
  const ganttContainerRef = useRef<HTMLDivElement>(null);

  // Stable refs so event handlers don't go stale
  const weekOverridesRef = useRef(weekOverrides);
  const sortedItemsRef = useRef<RoadmapItem[]>([]);
  useEffect(() => { weekOverridesRef.current = weekOverrides; }, [weekOverrides]);

  const { plans, updateItemInPlan, setPlanStatus, lockPlan } = useRoadmapStore();
  const activeTeamId   = useAppStore((s) => s.activeTeamId);
  const setActiveTeamId = useAppStore((s) => s.setActiveTeamId);
  const temporal = useStore(useRoadmapStore.temporal);

  useEffect(() => {
    if (initialTeam) {
      const team = TEAMS.find((t) => t.slug === initialTeam);
      if (team) setActiveTeamId(team.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTeam]);

  const activeTeam  = useMemo(() => TEAMS.find((t) => t.id === activeTeamId), [activeTeamId]);
  const teamPlans   = useMemo(() => plans.filter((p) => p.teamId === activeTeamId), [plans, activeTeamId]);

  const activePlan = useMemo<QuarterlyPlan | null>(() => {
    if (activeTab === "year") return null;
    const qNum = parseInt(activeTab[1]) as 1 | 2 | 3 | 4;
    return teamPlans.find((p) => p.quarter.quarter === qNum) ?? null;
  }, [teamPlans, activeTab]);

  const sortedItems = useMemo(
    () => (activePlan ? sortItems(activePlan.items) : []),
    [activePlan],
  );

  // Keep ref in sync for use inside stable callbacks
  useEffect(() => { sortedItemsRef.current = sortedItems; }, [sortedItems]);

  const todayPct = useMemo(
    () => (activeTab !== "year" ? getTodayPercent(activeTab) : null),
    [activeTab],
  );

  const openItem = useMemo(
    () => activePlan?.items.find((i) => i.id === openItemId) ?? null,
    [activePlan, openItemId],
  );

  // Set global cursor during drag
  useEffect(() => {
    if (isDragging) {
      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";
    } else {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging]);

  // Global mousemove/mouseup during drag
  useEffect(() => {
    if (!isDragging) return;

    function computeTargetWeek(mouseX: number): number {
      if (!ganttContainerRef.current) return 1;
      const rect = ganttContainerRef.current.getBoundingClientRect();
      const ganttLeft = rect.left + LABEL_W;
      const ganttWidth = rect.width - LABEL_W;
      const cellWidth = ganttWidth / TOTAL_WEEKS;
      return Math.max(1, Math.min(TOTAL_WEEKS, Math.floor((mouseX - ganttLeft) / cellWidth) + 1));
    }

    function onMove(e: MouseEvent) {
      if (!dragInfoRef.current) return;
      const week = computeTargetWeek(e.clientX);
      setDragLive({ itemId: dragInfoRef.current.itemId, week });
    }

    function onUp(e: MouseEvent) {
      if (!dragInfoRef.current) return;
      const { itemId, startX } = dragInfoRef.current;
      const dx = Math.abs(e.clientX - startX);
      if (dx > DRAG_THRESHOLD) {
        const week = computeTargetWeek(e.clientX);
        setWeekOverrides((prev) => ({ ...prev, [itemId]: week }));
      } else {
        // Treat as click — toggle detail panel
        setOpenItemId((prev) => (prev === itemId ? null : itemId));
      }
      dragInfoRef.current = null;
      setDragLive(null);
      setIsDragging(false);
    }

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, [isDragging]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBarMouseDown = useCallback((itemId: string, e: React.MouseEvent) => {
    e.preventDefault();
    const item = sortedItemsRef.current.find((i) => i.id === itemId);
    if (!item) return;
    const startWeek = weekOverridesRef.current[itemId] ?? getStartWeek(item);
    dragInfoRef.current = { itemId, startX: e.clientX };
    setDragLive({ itemId, week: startWeek });
    setIsDragging(true);
  }, []);

  useGlobalShortcuts({
    escape: () => { if (openItemId) setOpenItemId(null); },
    undo: () => temporal.undo(),
    redo: () => temporal.redo(),
  });

  const hasDetail   = !!openItem;
  const headerTitle = activeTeam ? `${activeTeam.name} · Roadmap` : "Roadmap";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title={headerTitle} />
      {initialTeam && <WorkflowBar currentStage="roadmap" teamSlug={initialTeam} />}

      {/* ── Quarter tabs ── */}
      <div
        data-tour="roadmap-quarter-tabs"
        className="flex items-center border-b border-[var(--color-border-subtle)] px-4 h-10 flex-shrink-0"
        role="tablist"
      >
        {QUARTER_TABS.map(({ key, label }) => (
          <button
            key={key}
            role="tab"
            aria-selected={activeTab === key}
            onClick={() => { setActiveTab(key); setOpenItemId(null); }}
            className={cn(
              "relative flex items-center h-full px-3 text-[13px] transition-colors",
              key === "year" && "ml-4 pl-4 border-l border-[var(--color-border-subtle)]",
              activeTab === key
                ? "text-[var(--color-text-primary)] font-medium"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]",
            )}
          >
            {label}
            {activeTab === key && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[var(--color-brand)]" />
            )}
          </button>
        ))}

        {/* Plan status + item count + today chip */}
        {activeTab !== "year" && activePlan && (
          <div className="ml-auto flex items-center gap-4">
            <span data-tour="roadmap-plan-status">
              <PlanStatusControl
                plan={activePlan}
                onSetStatus={setPlanStatus}
                onLock={lockPlan}
              />
            </span>
            <div className="h-4 w-px bg-[var(--color-border-subtle)]" />
            <span className="text-[12px] text-[var(--color-text-muted)]">
              {activePlan.items.length} initiative{activePlan.items.length !== 1 ? "s" : ""}
            </span>
            {todayPct !== null && (
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-[2px] bg-[#e5484d] rounded-full" />
                <span className="text-[11px] text-[var(--color-text-muted)]">Today</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Year view ── */}
      {activeTab === "year" && (
        <YearOverview plans={teamPlans} teamName={activeTeam?.name ?? "Team"} />
      )}

      {/* ── Empty state ── */}
      {activeTab !== "year" && !activePlan && (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            Icon={Map}
            title="No plan for this quarter"
            description="Send initiatives to the roadmap from the Prioritization phase to see them here."
          />
        </div>
      )}

      {/* ── Timeline + detail ── */}
      {activeTab !== "year" && activePlan && (
        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* Timeline panel */}
          <div
            ref={ganttContainerRef}
            data-tour="roadmap-timeline"
            className={cn(
              "flex flex-col overflow-hidden transition-all duration-200",
              hasDetail ? "hidden md:flex md:[flex:0_0_60%]" : "flex-1",
            )}
          >

            {/* Sticky header row */}
            <div className="flex flex-shrink-0 sticky top-0 z-20 border-b-2 border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]">
              {/* Label column header */}
              <div
                className="flex-shrink-0 flex items-end px-3 pb-1 border-r border-[var(--color-border-subtle)]"
                style={{ width: LABEL_W }}
              >
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
                  Initiative
                </span>
              </div>
              {/* Month/week headers */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <MonthHeader qKey={activeTab} />
              </div>
            </div>

            {/* Rows */}
            <div className="flex-1 relative overflow-hidden">
              {/* Today overlay — sits above rows, doesn't scroll */}
              {todayPct !== null && <TodayOverlay todayPct={todayPct} />}

              <div className="absolute inset-0 overflow-y-auto overflow-x-hidden">
                {sortedItems.length === 0 ? (
                  <div className="flex items-center justify-center h-32">
                    <p className="text-[13px] text-[var(--color-text-muted)]">No initiatives in this plan.</p>
                  </div>
                ) : (
                  sortedItems.map((item) => {
                    const isThisDragging = dragLive?.itemId === item.id;
                    const startWeek = isThisDragging
                      ? dragLive!.week
                      : (weekOverrides[item.id] ?? getStartWeek(item));
                    return (
                      <ItemRow
                        key={item.id}
                        item={item}
                        startWeek={startWeek}
                        isOpen={openItemId === item.id}
                        isDragging={isThisDragging}
                        onBarMouseDown={handleBarMouseDown}
                        todayPct={todayPct}
                      />
                    );
                  })
                )}
              </div>
            </div>

            {/* Status legend */}
            <div className="flex-shrink-0 border-t border-[var(--color-border-subtle)] px-4 py-2 flex items-center gap-4 flex-wrap bg-[var(--color-bg-elevated)]">
              {Object.entries(STATUS_META).map(([status, { color, label }]) => (
                <div key={status} className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-[11px] text-[var(--color-text-muted)]">{label}</span>
                </div>
              ))}
              <div className="ml-auto flex items-center gap-1 text-[11px] text-[var(--color-text-muted)]">
                <span>Drag bars to reposition</span>
              </div>
            </div>
          </div>

          {/* Detail panel */}
          {hasDetail && openItem && (
            <div className="flex flex-col overflow-hidden flex-1 md:[flex:0_0_40%] border-l border-[var(--color-border-subtle)]">
              <RoadmapItemDetail
                item={openItem}
                goals={activePlan.goals}
                planId={activePlan.id}
                onClose={() => setOpenItemId(null)}
                onStatusChange={(itemId, planId, status) =>
                  updateItemInPlan(planId, itemId, { status })
                }
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
