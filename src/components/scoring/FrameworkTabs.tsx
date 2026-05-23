"use client";

import { cn } from "@/lib/cn";
import type { ScoringFramework } from "@/types";

// ─────────────────────────────────────────────
// FrameworkTabs — switches between RICE, MoSCoW,
// WSJF, and Custom scoring frameworks.
// ─────────────────────────────────────────────

const FRAMEWORKS: { id: ScoringFramework; label: string; description: string }[] = [
  { id: "rice",   label: "RICE",    description: "Reach × Impact × Confidence / Effort" },
  { id: "moscow", label: "MoSCoW",  description: "Must, Should, Could, Won't" },
  { id: "wsjf",   label: "WSJF",    description: "Weighted Shortest Job First" },
  { id: "custom", label: "Custom",  description: "Weighted dimensions" },
];

interface FrameworkTabsProps {
  active: ScoringFramework;
  onChange: (f: ScoringFramework) => void;
  onConfigureCustom: () => void;
}

export function FrameworkTabs({ active, onChange, onConfigureCustom }: FrameworkTabsProps) {
  return (
    <div
      className="flex items-center gap-0 border-b border-[var(--color-border-subtle)] px-4 h-10 flex-shrink-0"
      role="tablist"
      aria-label="Scoring framework"
    >
      {FRAMEWORKS.map((fw) => {
        const isActive = active === fw.id;
        return (
          <button
            key={fw.id}
            role="tab"
            aria-selected={isActive}
            title={fw.description}
            onClick={() => onChange(fw.id)}
            className={cn(
              "relative flex items-center h-full px-3 text-[13px] transition-colors duration-100",
              "focus-visible:outline-2 focus-visible:outline-[var(--color-brand)] focus-visible:outline-offset-[-2px]",
              isActive
                ? "text-[var(--color-text-primary)] font-medium"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]",
            )}
          >
            {fw.label}
            {isActive && (
              <span
                className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[var(--color-brand)]"
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}

      <div className="flex-1" />

      {active === "custom" && (
        <button
          type="button"
          onClick={onConfigureCustom}
          className={cn(
            "flex items-center gap-1 h-7 rounded-md px-2.5 text-[12px] font-medium",
            "text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]",
            "hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]",
            "transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]",
          )}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <circle cx="6" cy="6" r="1.5" fill="currentColor" />
            <circle cx="1.5" cy="6" r="1.5" fill="currentColor" />
            <circle cx="10.5" cy="6" r="1.5" fill="currentColor" />
          </svg>
          Configure dimensions
        </button>
      )}
    </div>
  );
}
