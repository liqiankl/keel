"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { PLAN_STATUS_CONFIG } from "@/lib/constants";
import type { PlanStatus } from "@/types";

// ─────────────────────────────────────────────
// PlanStatusBadge — clickable badge that lets
// PMs advance the plan through its lifecycle.
// ─────────────────────────────────────────────

const STATUS_ORDER: PlanStatus[] = ["draft", "in_review", "approved", "locked"];

interface PlanStatusBadgeProps {
  status: PlanStatus;
  onChange: (s: PlanStatus) => void;
  disabled?: boolean;
}

export function PlanStatusBadge({ status, onChange, disabled = false }: PlanStatusBadgeProps) {
  const cfg = PLAN_STATUS_CONFIG[status];

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild disabled={disabled}>
        <button
          className={cn(
            "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium",
            "border transition-colors",
            "focus-visible:outline-2 focus-visible:outline-[var(--color-brand)] focus-visible:outline-offset-1",
            !disabled && "hover:opacity-80",
          )}
          style={{
            color: cfg.color,
            borderColor: cfg.color + "55",
            backgroundColor: cfg.color + "15",
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: cfg.color }}
            aria-hidden="true"
          />
          {cfg.label}
          {!disabled && <ChevronDown size={10} className="opacity-60" />}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={cn(
            "z-50 min-w-[140px] rounded-lg border border-[var(--color-border-subtle)]",
            "bg-[var(--color-bg-elevated)] py-1 shadow-[var(--shadow-md)]",
          )}
          sideOffset={4}
          align="start"
        >
          {STATUS_ORDER.map((s) => {
            const c = PLAN_STATUS_CONFIG[s];
            return (
              <DropdownMenu.Item
                key={s}
                onSelect={() => onChange(s)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-[12px] cursor-pointer outline-none",
                  "transition-colors focus:bg-[var(--color-bg-hover)]",
                  status === s && "opacity-50 pointer-events-none",
                )}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: c.color }}
                  aria-hidden="true"
                />
                <span style={{ color: c.color }}>{c.label}</span>
                {status === s && (
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
