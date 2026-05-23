"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { StatusIcon } from "@/components/ui/StatusIcon";
import { Kbd } from "@/components/ui/Kbd";
import type { RequestStatus } from "@/types";

// ─────────────────────────────────────────────
// StatusDropdown — click the status icon to
// change status inline. Stops event propagation
// so the row's onClick (open detail) doesn't fire.
// ─────────────────────────────────────────────

interface StatusDropdownProps {
  requestId: string;
  currentStatus: RequestStatus;
  onChange: (id: string, status: RequestStatus) => void;
}

const STATUS_OPTIONS: {
  value: RequestStatus;
  label: string;
  shortcut: string;
}[] = [
  { value: "new",      label: "New",      shortcut: "1" },
  { value: "triaged",  label: "Triaged",  shortcut: "2" },
  { value: "archived", label: "Archived", shortcut: "3" },
];

export function StatusDropdown({
  requestId,
  currentStatus,
  onChange,
}: StatusDropdownProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            "flex h-full items-center justify-center px-1 rounded",
            "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]",
            "hover:bg-[var(--color-bg-hover)] transition-colors",
            "focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]",
          )}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label={`Change status, current: ${currentStatus}`}
        >
          <StatusIcon status={currentStatus} size={14} />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={cn(
            "z-50 min-w-[180px] overflow-hidden rounded-lg py-1",
            "bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)]",
            "shadow-[var(--shadow-md)]",
            "animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2",
          )}
          sideOffset={4}
          align="start"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <div className="px-3 py-1.5">
            <p className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
              Change status
            </p>
          </div>

          {STATUS_OPTIONS.map(({ value, label, shortcut }) => (
            <DropdownMenu.Item
              key={value}
              onSelect={() => onChange(requestId, value)}
              className={cn(
                "flex items-center gap-2.5 px-3 h-8 text-sm cursor-default select-none",
                "text-[var(--color-text-primary)] outline-none",
                "data-[highlighted]:bg-[var(--color-bg-hover)]",
              )}
            >
              <StatusIcon status={value} size={14} />
              <span className="flex-1 text-[13px]">{label}</span>
              {currentStatus === value && (
                <Check size={12} className="text-[var(--color-brand)]" />
              )}
              <Kbd>{shortcut}</Kbd>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
