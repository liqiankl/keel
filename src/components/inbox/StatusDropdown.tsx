"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { StatusIcon } from "@/components/ui/StatusIcon";
import type { RequestStatus } from "@/types";

interface StatusDropdownProps {
  requestId: string;
  currentStatus: RequestStatus;
  onChange: (id: string, status: RequestStatus) => void;
  allowedStatuses?: RequestStatus[];
  statusLabels?: Partial<Record<RequestStatus, string>>;
  showLabel?: boolean;
}

const STATUS_OPTIONS: { value: RequestStatus; label: string }[] = [
  { value: "new",      label: "New"      },
  { value: "triaged",  label: "Triaged"  },
  { value: "archived", label: "Archived" },
];

export function StatusDropdown({
  requestId,
  currentStatus,
  onChange,
  allowedStatuses,
  statusLabels,
  showLabel = false,
}: StatusDropdownProps) {
  const options = allowedStatuses
    ? STATUS_OPTIONS.filter((o) => allowedStatuses.includes(o.value))
    : STATUS_OPTIONS;

  const displayLabel = statusLabels?.[currentStatus] ?? currentStatus;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        {showLabel ? (
          <button
            className={cn(
              "inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md",
              "text-[12px] font-medium text-[var(--color-text-secondary)]",
              "border border-[var(--color-border-subtle)]",
              "bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-hover)]",
              "transition-colors select-none",
              "focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]",
            )}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label={`Status: ${displayLabel}. Click to change`}
          >
            <StatusIcon status={currentStatus} size={12} />
            <span className="capitalize">{displayLabel}</span>
            <ChevronDown size={11} className="text-[var(--color-text-muted)] ml-0.5" />
          </button>
        ) : (
          <button
            className={cn(
              "flex h-full items-center justify-center px-1 rounded transition-opacity",
              "opacity-50 hover:opacity-100",
              "focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]",
            )}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label={`Status: ${displayLabel}`}
          >
            <StatusIcon status={currentStatus} size={13} />
          </button>
        )}
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={cn(
            "z-50 w-[140px] overflow-hidden rounded-lg p-1",
            "bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]",
            "shadow-[0_8px_24px_rgba(0,0,0,0.12)]",
            "animate-in fade-in-0 zoom-in-95 duration-100",
          )}
          sideOffset={6}
          align="start"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          {options.map(({ value, label }) => {
            const itemLabel = statusLabels?.[value] ?? label;
            const iconStatus = itemLabel === "Backlog" ? "backlog" : value;
            const isActive = currentStatus === value;

            return (
              <DropdownMenu.Item
                key={value}
                onSelect={() => onChange(requestId, value)}
                className={cn(
                  "flex items-center gap-2 px-2 h-7 rounded-md cursor-default select-none outline-none",
                  "text-[12px] font-medium transition-colors",
                  isActive
                    ? "bg-[var(--color-brand)]/10 text-[var(--color-brand)]"
                    : "text-[var(--color-text-secondary)] data-[highlighted]:bg-[var(--color-bg-hover)] data-[highlighted]:text-[var(--color-text-primary)]",
                )}
              >
                <StatusIcon
                  status={iconStatus as Parameters<typeof StatusIcon>[0]["status"]}
                  size={13}
                />
                {itemLabel}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
