"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/cn";
import type { MoSCoWLabel } from "@/types";

// ─────────────────────────────────────────────
// MoSCoW label badge + inline picker.
// ─────────────────────────────────────────────

interface MoSCoWConfig {
  label: string;
  color: string;
  bg: string;
  border: string;
}

const MOSCOW_CONFIG: Record<MoSCoWLabel, MoSCoWConfig> = {
  must:   { label: "Must",   color: "#f87171", bg: "#f8717120", border: "#f8717144" },
  should: { label: "Should", color: "#fb923c", bg: "#fb923c20", border: "#fb923c44" },
  could:  { label: "Could",  color: "#60a5fa", bg: "#60a5fa20", border: "#60a5fa44" },
  wont:   { label: "Won't",  color: "#6b7280", bg: "#6b728020", border: "#6b728044" },
};

const MOSCOW_ORDER: MoSCoWLabel[] = ["must", "should", "could", "wont"];

interface MoSCoWBadgeProps {
  value: MoSCoWLabel | null;
  small?: boolean;
}

export function MoSCoWBadge({ value, small = false }: MoSCoWBadgeProps) {
  const cfg = value ? MOSCOW_CONFIG[value] : null;
  if (!cfg) {
    return (
      <span className={cn(
        "inline-flex items-center rounded px-1.5 font-medium",
        small ? "py-0.5 text-[10px]" : "py-1 text-[11px]",
        "text-[var(--color-text-muted)] border border-[var(--color-border-subtle)]",
      )}>
        —
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 font-medium whitespace-nowrap",
        small ? "py-0.5 text-[10px]" : "py-1 text-[11px]",
      )}
      style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
    >
      {cfg.label}
    </span>
  );
}

interface MoSCoWCellProps {
  value: MoSCoWLabel | null;
  onChange: (label: MoSCoWLabel) => void;
  disabled?: boolean;
}

export function MoSCoWCell({ value, onChange, disabled = false }: MoSCoWCellProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        disabled={disabled}
        asChild
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button
          className={cn(
            "flex items-center rounded transition-colors",
            !disabled && "hover:opacity-80 focus-visible:outline-2 focus-visible:outline-[var(--color-brand)] focus-visible:outline-offset-1",
          )}
          aria-label="Change MoSCoW priority"
        >
          <MoSCoWBadge value={value} />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={cn(
            "z-50 min-w-[120px] rounded-lg border border-[var(--color-border-subtle)]",
            "bg-[var(--color-bg-elevated)] py-1 shadow-[var(--shadow-md)]",
          )}
          sideOffset={4}
          align="start"
          onClick={(e) => e.stopPropagation()}
        >
          {MOSCOW_ORDER.map((label) => {
            const cfg = MOSCOW_CONFIG[label];
            return (
              <DropdownMenu.Item
                key={label}
                onSelect={() => onChange(label)}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 text-[12px] cursor-pointer",
                  "outline-none transition-colors",
                  "focus:bg-[var(--color-bg-hover)]",
                  value === label && "bg-[var(--color-bg-hover)]",
                )}
              >
                <MoSCoWBadge value={label} small />
                {value === label && (
                  <svg className="ml-auto" width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
