"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/cn";
import { StatusIcon } from "@/components/ui/StatusIcon";
import type { RequestStatus } from "@/types";

interface StatusDropdownProps {
  requestId: string;
  currentStatus: RequestStatus;
  onChange: (id: string, status: RequestStatus) => void;
  allowedStatuses?: RequestStatus[];
  statusLabels?: Partial<Record<RequestStatus, string>>;
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
}: StatusDropdownProps) {
  const options = allowedStatuses
    ? STATUS_OPTIONS.filter((o) => allowedStatuses.includes(o.value))
    : STATUS_OPTIONS;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            "flex h-full items-center justify-center px-1 rounded transition-opacity",
            "opacity-50 hover:opacity-100",
            "focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]",
          )}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label={`Status: ${statusLabels?.[currentStatus] ?? currentStatus}`}
        >
          <StatusIcon status={currentStatus} size={13} />
        </button>
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
            const displayLabel = statusLabels?.[value] ?? label;
            const iconStatus = displayLabel === "Backlog" ? "backlog" : value;
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
                {displayLabel}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
