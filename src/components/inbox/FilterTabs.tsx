"use client";

import { cn } from "@/lib/cn";
import type { FilterTab, FeatureRequest } from "@/types";

// ─────────────────────────────────────────────
// FilterTabs — underline-style tab navigation.
// Shows live counts per tab.
// ─────────────────────────────────────────────

const TABS: { id: FilterTab; label: string }[] = [
  { id: "active",   label: "Active" },
  { id: "all",      label: "All" },
  { id: "new",      label: "New" },
  { id: "backlog",  label: "Backlog" },
  { id: "triaged",  label: "Triaged" },
  { id: "archived", label: "Archived" },
];

function countForTab(tab: FilterTab, requests: FeatureRequest[]): number {
  switch (tab) {
    case "all":      return requests.length;
    case "active":   return requests.filter((r) => r.status !== "archived").length;
    case "new":      return requests.filter((r) => r.status === "new").length;
    case "triaged":  return requests.filter((r) => r.status === "triaged").length;
    case "archived": return requests.filter((r) => r.status === "archived").length;
    case "backlog":  return requests.filter((r) => r.status === "triaged").length;
    default:         return 0;
  }
}

interface FilterTabsProps {
  activeTab: FilterTab;
  requests: FeatureRequest[];
  onTabChange: (tab: FilterTab) => void;
  searchValue: string;
  onSearchChange: (v: string) => void;
  visibleTabs?: FilterTab[];
  searchPlaceholder?: string;
}

export function FilterTabs({
  activeTab,
  requests,
  onTabChange,
  searchValue,
  onSearchChange,
  visibleTabs,
  searchPlaceholder = "Search requests…",
}: FilterTabsProps) {
  const tabs = visibleTabs ? TABS.filter((t) => visibleTabs.includes(t.id)) : TABS;

  return (
    <div className="flex items-center border-b border-[var(--color-border-subtle)] px-4 gap-0 flex-shrink-0 h-10">
      {/* Tabs */}
      <div className="flex items-center gap-0 h-full" role="tablist" aria-label="Filter requests">
        {tabs.map((tab) => {
          const count = countForTab(tab.id, requests);
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={active}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative flex items-center gap-1.5 h-full px-3 text-[13px]",
                "transition-colors duration-100",
                "focus-visible:outline-2 focus-visible:outline-[var(--color-brand)] focus-visible:outline-offset-[-2px]",
                active
                  ? "text-[var(--color-text-primary)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]",
              )}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className={cn(
                    "text-[12px] tabular-nums",
                    active ? "text-[var(--color-text-secondary)]" : "text-[var(--color-text-muted)]",
                  )}
                >
                  {count}
                </span>
              )}
              {/* Active underline indicator */}
              {active && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[var(--color-text-primary)]"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Inline search */}
      <div className="relative flex items-center">
        <svg
          className="absolute left-2.5 text-[var(--color-text-muted)] pointer-events-none"
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          aria-hidden="true"
        >
          <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8.5 8.5L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cn(
            "h-7 w-48 rounded-md pl-7 pr-3 text-[13px]",
            "bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)]",
            "text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]",
            "focus:outline-none focus:border-[var(--color-brand)]",
            "transition-colors",
          )}
          aria-label="Search feature requests"
        />
      </div>
    </div>
  );
}
