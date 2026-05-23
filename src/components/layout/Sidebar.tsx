"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Inbox,
  CircleUser,
  Layers,
  Map,
  Circle,
  BarChart2,
  Plus,
  Search,
  UserPlus,
  HelpCircle,
  Import,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useAppStore } from "@/store/useAppStore";
import { SIDEBAR_NAV, TEAM_NAV } from "@/lib/constants";
import type { SidebarNavItem } from "@/types";
import { useState } from "react";

// ─────────────────────────────────────────────
// Sidebar — fixed left navigation.
// 176px wide, full viewport height.
// Mirrors Linear's sidebar exactly.
// ─────────────────────────────────────────────

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Inbox:      Inbox,
  CircleUser: CircleUser,
  Layers:     Layers,
  Map:        Map,
  Circle:     Circle,
  BarChart2:  BarChart2,
};

export function Sidebar() {
  const pathname = usePathname();
  const workspace = useAppStore((s) => s.workspace);
  const [importBannerDismissed, setImportBannerDismissed] = useState(false);
  const [teamExpanded, setTeamExpanded] = useState(true);

  return (
    <aside
      className="keel-sidebar-width flex flex-col h-full border-r border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] overflow-y-auto"
      aria-label="Main navigation"
    >
      {/* ── Workspace header ── */}
      <div className="keel-topbar-height flex items-center gap-2 px-3 border-b border-[var(--color-border-subtle)] flex-shrink-0">
        <WorkspaceAvatar
          name={workspace.name}
          color={workspace.avatarColor}
        />
        <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">
          {workspace.name}
        </span>
      </div>

      {/* ── Quick actions ── */}
      <div className="px-2 pt-2 pb-1 flex items-center gap-1">
        <button
          className={cn(
            "flex flex-1 items-center gap-2 h-7 px-2 rounded-md text-xs",
            "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]",
            "hover:text-[var(--color-text-primary)] transition-colors",
            "focus-visible:outline-2 focus-visible:outline-[var(--color-brand)] focus-visible:outline-offset-1",
          )}
          aria-label="Create new issue"
        >
          <Plus size={14} strokeWidth={2} />
          <span>New issue</span>
        </button>
        <button
          className={cn(
            "flex items-center justify-center h-7 w-7 rounded-md",
            "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)]",
            "hover:text-[var(--color-text-primary)] transition-colors",
            "focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]",
          )}
          aria-label="Search"
        >
          <Search size={14} />
        </button>
      </div>

      {/* ── Primary nav ── */}
      <nav className="px-2 py-1" aria-label="Primary">
        {SIDEBAR_NAV.map((item) => (
          <NavItem key={item.id} item={item} pathname={pathname} />
        ))}
      </nav>

      <SidebarDivider label="Your teams" />

      {/* ── Team nav ── */}
      <nav className="px-2 py-1" aria-label="Team">
        {/* Team header row */}
        <button
          className={cn(
            "w-full flex items-center gap-2 h-7 px-2 rounded-md text-xs",
            "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]",
            "hover:text-[var(--color-text-primary)] transition-colors",
            "focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]",
          )}
          onClick={() => setTeamExpanded((v) => !v)}
          aria-expanded={teamExpanded}
        >
          <TeamAvatar
            name={workspace.name}
            color={workspace.avatarColor}
          />
          <span className="flex-1 text-left text-[var(--color-text-primary)] font-medium">
            {workspace.name}
          </span>
          {teamExpanded ? (
            <ChevronDown size={12} className="text-[var(--color-text-muted)]" />
          ) : (
            <ChevronRight size={12} className="text-[var(--color-text-muted)]" />
          )}
        </button>

        {teamExpanded && (
          <div className="mt-0.5">
            {TEAM_NAV.map((item) => (
              <TeamNavItem key={item.id} item={item} pathname={pathname} />
            ))}
          </div>
        )}
      </nav>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Bottom utility ── */}
      <div className="px-2 pb-2 space-y-0.5">
        {/* Import issues banner */}
        {!importBannerDismissed && (
          <div className="relative mb-2 rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-2.5">
            <button
              onClick={() => setImportBannerDismissed(true)}
              className="absolute top-2 right-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
              aria-label="Dismiss import banner"
            >
              <X size={12} />
            </button>
            <p className="text-xs font-medium text-[var(--color-text-primary)] flex items-center gap-1.5">
              <Import size={12} />
              Import Issues
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
              Use our Migration Assistant to copy issues from another service.
            </p>
            <button className="mt-1.5 text-[11px] text-[var(--color-brand)] hover:underline">
              Try Now →
            </button>
          </div>
        )}

        <SidebarUtilityLink icon={UserPlus} label="Invite people" />
        <SidebarUtilityLink icon={HelpCircle} label="Help & Support" />
      </div>
    </aside>
  );
}

// ── Sub-components ──────────────────────────

function NavItem({ item, pathname }: { item: SidebarNavItem; pathname: string }) {
  const Icon = ICON_MAP[item.icon];
  const active = pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-2 h-[30px] px-2 rounded-md text-[13px]",
        "transition-colors duration-100",
        "focus-visible:outline-2 focus-visible:outline-[var(--color-brand)] focus-visible:outline-offset-1",
        active
          ? "bg-[var(--color-bg-selected)] text-[var(--color-text-primary)]"
          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]",
      )}
      aria-current={active ? "page" : undefined}
    >
      {Icon && (
        <Icon
          size={15}
          className={active ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)]"}
        />
      )}
      <span className="truncate">{item.label}</span>
      {item.badge != null && item.badge > 0 && (
        <span className="ml-auto text-[11px] text-[var(--color-text-muted)]">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

function TeamNavItem({ item, pathname }: { item: SidebarNavItem; pathname: string }) {
  const Icon = ICON_MAP[item.icon];
  const [expanded, setExpanded] = useState(true);
  const active = pathname === item.href || pathname.startsWith(item.href.split("?")[0]);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div>
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-2 h-[28px] px-2 pl-5 rounded-md text-[13px]",
          "transition-colors duration-100",
          "focus-visible:outline-2 focus-visible:outline-[var(--color-brand)] focus-visible:outline-offset-1",
          active
            ? "text-[var(--color-text-primary)]"
            : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]",
        )}
        aria-current={active ? "page" : undefined}
      >
        {hasChildren && (
          <button
            onClick={(e) => { e.preventDefault(); setExpanded((v) => !v); }}
            className="text-[var(--color-text-muted)]"
            aria-expanded={expanded}
            aria-label={`${expanded ? "Collapse" : "Expand"} ${item.label}`}
          >
            {expanded
              ? <ChevronDown size={11} />
              : <ChevronRight size={11} />
            }
          </button>
        )}
        {Icon && <Icon size={14} className="text-[var(--color-text-muted)]" />}
        <span className="truncate">{item.label}</span>
      </Link>

      {hasChildren && expanded && (
        <div className="mt-0.5">
          {item.children!.map((child) => (
            <Link
              key={child.id}
              href={child.href}
              className={cn(
                "flex items-center h-[26px] pl-10 pr-2 rounded-md text-[12px]",
                "transition-colors duration-100",
                "focus-visible:outline-2 focus-visible:outline-[var(--color-brand)] focus-visible:outline-offset-1",
                pathname === child.href || pathname.startsWith(child.href.split("?")[0])
                  ? "text-[var(--color-text-primary)]"
                  : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-secondary)]",
              )}
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function SidebarDivider({ label }: { label: string }) {
  return (
    <div className="px-4 pt-3 pb-1">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
        {label}
      </p>
    </div>
  );
}

function SidebarUtilityLink({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
}) {
  return (
    <button
      className={cn(
        "w-full flex items-center gap-2 h-[28px] px-2 rounded-md text-[12px]",
        "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)]",
        "hover:text-[var(--color-text-secondary)] transition-colors",
        "focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]",
      )}
    >
      <Icon size={13} />
      {label}
    </button>
  );
}

function WorkspaceAvatar({ name, color }: { name: string; color: string }) {
  return (
    <div
      className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-[10px] font-bold text-white"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function TeamAvatar({ name, color }: { name: string; color: string }) {
  return (
    <div
      className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded text-[9px] font-bold text-white"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
