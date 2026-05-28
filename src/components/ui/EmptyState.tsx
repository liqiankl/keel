"use client";

import { cn } from "@/lib/cn";
import { Button } from "./Button";
// ─────────────────────────────────────────────
// EmptyState — every empty view must explain:
// 1. what goes here
// 2. next action
// PRD requirement: never leave blank screens.
// ─────────────────────────────────────────────

type IconComponent = React.ComponentType<{
  size?: number;
  strokeWidth?: number;
  className?: string;
}>;

interface EmptyStateProps {
  Icon: IconComponent;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 px-6 py-16 text-center",
        "max-w-sm mx-auto",
        className,
      )}
    >
      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]"
        aria-hidden="true"
      >
        <Icon
          size={22}
          className="text-[var(--color-text-muted)]"
          strokeWidth={1.5}
        />
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-[var(--color-text-primary)]">
          {title}
        </p>
        <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
          {description}
        </p>
      </div>

      {(action || secondaryAction) && (
        <div className="flex items-center gap-2">
          {action && (
            <Button
              variant="secondary"
              size="sm"
              onClick={action.onClick}
              className="hover:bg-[var(--color-brand)] hover:text-white hover:border-[var(--color-brand)] transition-colors"
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="ghost" size="sm" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
