"use client";

import { Star, LayoutList, LayoutGrid, Map, Menu } from "lucide-react";
import { cn } from "@/lib/cn";
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
  const { viewMode, setViewMode, openMobileSidebar } = useAppStore();

  return (
    <header className="keel-topbar-height flex items-center border-b border-[var(--color-border-subtle)] px-4 gap-3 flex-shrink-0 bg-[var(--color-bg-base)]">
      {/* Hamburger — mobile only */}
      <button
        onClick={openMobileSidebar}
        aria-label="Open navigation"
        className="md:hidden flex items-center justify-center h-8 w-8 rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] transition-colors flex-shrink-0"
      >
        <Menu size={18} />
      </button>

      {/* Title */}
      <div className="flex items-center gap-2.5 min-w-0">
        <h1 className="text-[15px] font-semibold tracking-tight text-[var(--color-text-primary)] truncate leading-none">
          {title}
        </h1>
        {onStar && (
          <button
            onClick={onStar}
            aria-label={starred ? "Unstar this view" : "Star this view"}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-warning)] transition-colors flex-shrink-0"
          >
            <Star
              size={15}
              fill={starred ? "var(--color-warning)" : "none"}
              stroke={starred ? "var(--color-warning)" : "currentColor"}
            />
          </button>
        )}
      </div>

      <div className="flex-1" />

      {/* Right controls */}
      <div className="flex items-center gap-1.5">
        {showViewToggle && (
          <ViewToggle current={viewMode} onChange={setViewMode} />
        )}
        {rightSlot}
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
      className="flex items-center gap-0.5 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-0.5"
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
            "flex h-6 w-6 items-center justify-center rounded-md transition-colors",
            "focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]",
            current === mode
              ? "bg-[var(--color-bg-base)] text-[var(--color-text-primary)] shadow-sm"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]",
          )}
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  );
}
