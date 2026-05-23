"use client";

import { Filter, Star, LayoutList, LayoutGrid, Map } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/store/useAppStore";
import type { ViewMode } from "@/types";

// ─────────────────────────────────────────────
// Header — top bar inside the content area.
// 44px height, contains: page title, view
// toggle, filter button.
// ─────────────────────────────────────────────

interface HeaderProps {
  title: string;
  starred?: boolean;
  onStar?: () => void;
  rightSlot?: React.ReactNode;
  showViewToggle?: boolean;
}

export function Header({
  title,
  starred = false,
  onStar,
  rightSlot,
  showViewToggle = false,
}: HeaderProps) {
  const { viewMode, setViewMode } = useAppStore();

  return (
    <header className="keel-topbar-height flex items-center border-b border-[var(--color-border-subtle)] px-4 gap-3 flex-shrink-0">
      {/* Title row */}
      <div className="flex items-center gap-2 min-w-0">
        <h1 className="text-sm font-medium text-[var(--color-text-primary)] truncate">
          {title}
        </h1>
        {onStar && (
          <button
            onClick={onStar}
            aria-label={starred ? "Unstar this view" : "Star this view"}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-warning)] transition-colors"
          >
            <Star
              size={14}
              fill={starred ? "var(--color-warning)" : "none"}
              stroke={starred ? "var(--color-warning)" : "currentColor"}
            />
          </button>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right controls */}
      <div className="flex items-center gap-1">
        {showViewToggle && (
          <ViewToggle current={viewMode} onChange={setViewMode} />
        )}
        {rightSlot}
        <Button variant="ghost" size="sm" className="gap-1.5">
          <Filter size={13} />
          Filter
        </Button>
      </div>
    </header>
  );
}

// ── View mode toggle ───────────────────────

const VIEW_MODES: { mode: ViewMode; Icon: React.ComponentType<{ size?: number }>; label: string }[] = [
  { mode: "list",     Icon: LayoutList, label: "List view" },
  { mode: "board",    Icon: LayoutGrid, label: "Board view" },
  { mode: "timeline", Icon: Map,        label: "Timeline view" },
];

function ViewToggle({
  current,
  onChange,
}: {
  current: ViewMode;
  onChange: (m: ViewMode) => void;
}) {
  return (
    <div
      className="flex items-center gap-0.5 rounded-md border border-[var(--color-border-subtle)] p-0.5"
      role="group"
      aria-label="View mode"
    >
      {VIEW_MODES.map(({ mode, Icon, label }) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          aria-label={label}
          aria-pressed={current === mode}
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded transition-colors",
            "focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]",
            current === mode
              ? "bg-[var(--color-bg-hover)] text-[var(--color-text-primary)]"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]",
          )}
        >
          <Icon size={13} />
        </button>
      ))}
    </div>
  );
}
