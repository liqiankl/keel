"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/cn";
import type { PrioritySignal } from "@/types";

interface PrioritySignalBadgeProps {
  signal: PrioritySignal;
  showLabel?: boolean;
  className?: string;
  onChange?: (signal: PrioritySignal) => void;
}

const SIGNAL_CONFIG: Record<PrioritySignal, {
  label: string;
  dot: string;
  ariaLabel: string;
}> = {
  critical:     { label: "Critical",     dot: "bg-[var(--color-priority-urgent)]", ariaLabel: "Critical priority signal" },
  important:    { label: "Important",    dot: "bg-[var(--color-priority-medium)]", ariaLabel: "Important priority signal" },
  nice_to_have: { label: "Nice to have", dot: "bg-[var(--color-text-muted)]",      ariaLabel: "Nice to have priority signal" },
};

const OPTIONS: PrioritySignal[] = ["critical", "important", "nice_to_have"];

export function PrioritySignalBadge({
  signal,
  showLabel = false,
  className,
  onChange,
}: PrioritySignalBadgeProps) {
  const { label, dot, ariaLabel } = SIGNAL_CONFIG[signal];

  const badge = (
    <span
      className={cn("inline-flex items-center gap-1.5 flex-shrink-0", className)}
      aria-label={ariaLabel}
      title={label}
    >
      <span
        className={cn("h-[7px] w-[7px] rounded-full flex-shrink-0", dot)}
        aria-hidden="true"
      />
      {showLabel && (
        <span className="text-[11px] text-[var(--color-text-muted)]">{label}</span>
      )}
    </span>
  );

  if (!onChange) return badge;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            "inline-flex items-center gap-1.5 flex-shrink-0 rounded px-1.5 py-0.5 -mx-1.5",
            "transition-colors hover:bg-[var(--color-bg-hover)]",
            "focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]",
            className,
          )}
          aria-label={`Priority: ${label}. Click to change`}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <span
            className={cn("h-[7px] w-[7px] rounded-full flex-shrink-0", dot)}
            aria-hidden="true"
          />
          {showLabel && (
            <span className="text-[11px] text-[var(--color-text-muted)]">{label}</span>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={cn(
            "z-50 w-[160px] overflow-hidden rounded-lg p-1",
            "bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]",
            "shadow-[0_8px_24px_rgba(0,0,0,0.12)]",
            "animate-in fade-in-0 zoom-in-95 duration-100",
          )}
          sideOffset={6}
          align="start"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          {OPTIONS.map((opt) => {
            const cfg = SIGNAL_CONFIG[opt];
            const isActive = signal === opt;
            return (
              <DropdownMenu.Item
                key={opt}
                onSelect={() => onChange(opt)}
                className={cn(
                  "flex items-center gap-2.5 px-2 h-7 rounded-md cursor-default select-none outline-none",
                  "text-[12px] font-medium transition-colors",
                  isActive
                    ? "bg-[var(--color-brand)]/10 text-[var(--color-brand)]"
                    : "text-[var(--color-text-secondary)] data-[highlighted]:bg-[var(--color-bg-hover)] data-[highlighted]:text-[var(--color-text-primary)]",
                )}
              >
                <span
                  className={cn("h-[7px] w-[7px] rounded-full flex-shrink-0", cfg.dot)}
                  aria-hidden="true"
                />
                {cfg.label}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
