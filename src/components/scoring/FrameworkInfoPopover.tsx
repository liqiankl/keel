"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ScoringFramework } from "@/types";
import { cn } from "@/lib/cn";

// ─────────────────────────────────────────────
// FrameworkInfoPopover — educational floating
// card explaining each prioritization framework.
// Triggered by the ⓘ icon beside each tab.
// ─────────────────────────────────────────────

// ── Content definitions ────────────────────────

interface FieldDef {
  label: string;
  color: string;
  description: string;
}

interface FrameworkInfo {
  title: string;
  description: string;
  formula?: React.ReactNode;
  fields: FieldDef[];
  note: string;
}

const RICE_FIELDS: FieldDef[] = [
  { label: "Reach",      color: "#6366f1", description: "Number of users or customers affected in a given time period." },
  { label: "Impact",     color: "#8b5cf6", description: "Degree of business or user impact (0.25× to 3×)." },
  { label: "Confidence", color: "#a78bfa", description: "How confident you are in your Reach and Impact estimates (0–100%)." },
  { label: "Effort",     color: "#64748b", description: "Total implementation effort required in person-months." },
];

const MOSCOW_FIELDS: FieldDef[] = [
  { label: "Must",   color: "#ef4444", description: "Critical — the initiative must ship this quarter or the delivery fails." },
  { label: "Should", color: "#f97316", description: "High value — important but not critical; include if possible." },
  { label: "Could",  color: "#eab308", description: "Nice to have — include only if time and capacity allow." },
  { label: "Won't",  color: "#6b7280", description: "Explicitly out of scope for this quarter; revisit later." },
];

const WSJF_FIELDS: FieldDef[] = [
  { label: "Cost of Delay", color: "#0ea5e9", description: "Economic impact of delaying the job — combines user value, time criticality, and risk reduction." },
  { label: "Job Size",      color: "#64748b", description: "Relative effort or complexity; acts as a proxy for duration." },
];

const FRAMEWORK_CONTENT: Record<ScoringFramework, FrameworkInfo> = {
  rice: {
    title: "About RICE",
    description:
      "RICE is a prioritization framework that helps Product Managers score initiatives based on impact and effort.",
    formula: <RICEFormula />,
    fields: RICE_FIELDS,
    note: "Higher RICE score indicates higher priority initiative.",
  },
  moscow: {
    title: "About MoSCoW",
    description:
      "MoSCoW is a classification method that aligns teams on relative priority through four clearly defined tiers.",
    fields: MOSCOW_FIELDS,
    note: "All Must items should be achievable within the quarter's capacity.",
  },
  wsjf: {
    title: "About WSJF",
    description:
      "Weighted Shortest Job First (WSJF) prioritizes jobs with the highest Cost of Delay relative to their size — a core SAFe practice.",
    formula: <WSJFFormula />,
    fields: WSJF_FIELDS,
    note: "Higher WSJF score = deliver sooner for maximum economic benefit.",
  },
};

// ── Sub-components: formula visualizations ──────

function FormulaChip({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-tight"
      style={{ backgroundColor: color + "22", color }}
    >
      {label}
    </span>
  );
}

function Operator({ children }: { children: string }) {
  return (
    <span className="text-[12px] font-medium text-[var(--color-text-muted)] px-0.5">
      {children}
    </span>
  );
}

function RICEFormula() {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
        RICE Score Formula
      </p>
      <div className="flex flex-wrap items-center gap-1 rounded-lg bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] px-3 py-2.5">
        <FormulaChip label="Reach"      color="#6366f1" />
        <Operator>×</Operator>
        <FormulaChip label="Impact"     color="#8b5cf6" />
        <Operator>×</Operator>
        <FormulaChip label="Confidence" color="#a78bfa" />
        <Operator>÷</Operator>
        <FormulaChip label="Effort"     color="#64748b" />
      </div>
    </div>
  );
}

function WSJFFormula() {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
        WSJF Formula
      </p>
      <div className="flex flex-wrap items-center gap-1 rounded-lg bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] px-3 py-2.5">
        <FormulaChip label="Cost of Delay" color="#0ea5e9" />
        <Operator>÷</Operator>
        <FormulaChip label="Job Size"      color="#64748b" />
      </div>
    </div>
  );
}


// ── Main popover component ─────────────────────

interface FrameworkInfoPopoverProps {
  framework: ScoringFramework;
  open: boolean;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function FrameworkInfoPopover({ framework, open, onClose, onMouseEnter, onMouseLeave }: FrameworkInfoPopoverProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const content  = FRAMEWORK_CONTENT[framework];

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="false"
            aria-label={content.title}
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{ opacity: 1, scale: 1,    y: 0 }}
            exit={{    opacity: 0, scale: 0.96, y: -6 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={cn(
              "absolute left-0 top-[calc(100%+6px)] z-50",
              "w-[308px] rounded-xl",
              "border border-[var(--color-border-subtle)]",
              "bg-[var(--color-bg-elevated)]",
              "shadow-[0_8px_32px_rgba(0,0,0,0.18),0_2px_8px_rgba(0,0,0,0.10)]",
              "overflow-hidden",
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3">
              <h3 className="text-[13px] font-semibold text-[var(--color-text-primary)]">
                {content.title}
              </h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-md",
                  "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]",
                  "hover:bg-[var(--color-bg-hover)] transition-colors",
                )}
              >
                <X size={13} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="px-4 pb-4 space-y-3 max-h-[480px] overflow-y-auto">
              {/* Description */}
              <p className="text-[12px] leading-relaxed text-[var(--color-text-secondary)]">
                {content.description}
              </p>

              {/* Formula (if any) */}
              {content.formula && content.formula}

              {/* Fields */}
              <div className="space-y-2">
                {content.fields.map((field) => (
                  <div key={field.label} className="flex gap-2.5">
                    <span
                      className="mt-[3px] h-1.5 w-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: field.color }}
                    />
                    <div className="min-w-0">
                      <span
                        className="text-[11px] font-semibold"
                        style={{ color: field.color }}
                      >
                        {field.label}
                      </span>
                      <span className="text-[11px] text-[var(--color-text-muted)]">
                        {" "}—{" "}
                      </span>
                      <span className="text-[11px] text-[var(--color-text-secondary)]">
                        {field.description}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Note */}
              <div className="flex items-start gap-2 rounded-lg bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] px-3 py-2.5">
                <span className="mt-[1px] h-1.5 w-1.5 rounded-full bg-[#f59e0b] flex-shrink-0" />
                <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                  {content.note}
                </p>
              </div>
            </div>
          </motion.div>
      )}
    </AnimatePresence>
  );
}
