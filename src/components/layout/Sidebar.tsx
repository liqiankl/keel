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
  HelpCircle,
  Import,
  X,
  ChevronDown,
  ChevronRight,
  Compass,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useAppStore } from "@/store/useAppStore";
import { SIDEBAR_NAV, TEAM_NAV, TEAMS, type TeamConfig } from "@/lib/constants";
import type { SidebarNavItem } from "@/types";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { TourGuide, useTourAutoShow } from "@/components/tour/TourGuide";

// ─────────────────────────────────────────────
// Sidebar — fixed left navigation.
// 176px wide, full viewport height.
// ─────────────────────────────────────────────

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Inbox:      Inbox,
  CircleUser: CircleUser,
  Layers:     Layers,
  Map:        Map,
  Circle:     Circle,
  BarChart2:  BarChart2,
};

// Map nav item ids → tour target values
const NAV_TOUR_IDS: Record<string, string> = {
  inbox:    "nav-inbox",
  views:    "nav-views",
  roadmaps: "nav-roadmaps",
};

const TEAM_NAV_TOUR_IDS: Record<string, string> = {
  scoring: "nav-prioritize",
  roadmap: "nav-roadmap",
};

export function Sidebar() {
  const pathname = usePathname();
  const workspace = useAppStore((s) => s.workspace);
  const activeTeamId = useAppStore((s) => s.activeTeamId);
  const setActiveTeamId = useAppStore((s) => s.setActiveTeamId);
  const [importBannerDismissed, setImportBannerDismissed] = useState(false);

  const { open: tourOpen, openTour, closeTour } = useTourAutoShow();

  return (
    <>
      <aside
        className="keel-sidebar-width flex flex-col h-full border-r border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] overflow-y-auto"
        aria-label="Main navigation"
      >
        {/* ── Workspace header ── */}
        <Link
          href="/"
          className="keel-topbar-height flex items-center gap-2 px-3 border-b border-[var(--color-border-subtle)] flex-shrink-0 hover:bg-[var(--color-bg-hover)] transition-colors"
          aria-label="Go to home"
        >
          <WorkspaceAvatar name={workspace.name} color={workspace.avatarColor} />
          <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">
            {workspace.name}
          </span>
        </Link>

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
            <NavItem
              key={item.id}
              item={item}
              pathname={pathname}
              dataTour={NAV_TOUR_IDS[item.id]}
            />
          ))}
        </nav>

        {/* ── Your Teams section ── */}
        <div className="px-4 pt-3 pb-1" data-tour="teams-section">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
            Your teams
          </p>
        </div>

        {/* ── Team nav ── */}
        <nav className="px-2 py-1" aria-label="Teams">
          {TEAMS.map((team) => (
            <TeamSection
              key={team.id}
              team={team}
              pathname={pathname}
              isActive={activeTeamId === team.id}
              onActivate={() => setActiveTeamId(team.id)}
              dataTour={`team-${team.id.replace("team_", "")}`}
              showTeamNavTour={team.id === "team_navigators"}
            />
          ))}
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

          <SidebarUtilityLink icon={HelpCircle} label="Help & Support" />
          <SidebarUtilityNavLink icon={Settings} label="Settings" href="/settings" pathname={pathname} />

          {/* Tour trigger */}
          <button
            type="button"
            onClick={openTour}
            className={cn(
              "w-full flex items-center gap-2 h-[28px] px-2 rounded-md text-[12px]",
              "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)]",
              "hover:text-[var(--color-text-secondary)] transition-colors",
              "focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]",
            )}
            aria-label="Take a product tour"
          >
            <Compass size={13} />
            Take a tour
          </button>

          <ThemeToggle />
        </div>
      </aside>

      {/* ── Tour Guide (portal, always mounted) ── */}
      <TourGuide open={tourOpen} onClose={closeTour} />

    </>
  );
}

// ── Sub-components ───────────────────────────────

function NavItem({
  item,
  pathname,
  dataTour,
}: {
  item: SidebarNavItem;
  pathname: string;
  dataTour?: string;
}) {
  const Icon = ICON_MAP[item.icon];
  const active = pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <Link
      href={item.href}
      data-tour={dataTour}
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

function TeamSection({
  team,
  pathname,
  isActive,
  onActivate,
  dataTour,
  showTeamNavTour,
}: {
  team: TeamConfig;
  pathname: string;
  isActive: boolean;
  onActivate: () => void;
  dataTour?: string;
  showTeamNavTour?: boolean;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="mb-0.5">
      <button
        data-tour={dataTour}
        className={cn(
          "w-full flex items-center gap-2 h-7 px-2 rounded-md text-xs",
          "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]",
          "hover:text-[var(--color-text-primary)] transition-colors",
          "focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]",
        )}
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-label={`${team.name} team`}
      >
        <TeamAvatar name={team.name} color={team.color} />
        <span className="flex-1 text-left text-[var(--color-text-primary)] font-medium truncate">
          {team.name}
        </span>
        {expanded
          ? <ChevronDown size={12} className="text-[var(--color-text-muted)]" />
          : <ChevronRight size={12} className="text-[var(--color-text-muted)]" />
        }
      </button>

      {expanded && (
        <div className="mt-0.5">
          {TEAM_NAV.map((item) => (
            <TeamNavItem
              key={`${team.id}_${item.id}`}
              item={item}
              pathname={pathname}
              teamSlug={team.slug}
              isActiveTeam={isActive}
              onActivate={onActivate}
              dataTour={showTeamNavTour ? TEAM_NAV_TOUR_IDS[item.id] : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TeamNavItem({
  item,
  pathname,
  teamSlug,
  isActiveTeam,
  onActivate,
  dataTour,
}: {
  item: SidebarNavItem;
  pathname: string;
  teamSlug: string;
  isActiveTeam: boolean;
  onActivate: () => void;
  dataTour?: string;
}) {
  const Icon = ICON_MAP[item.icon];
  const [expanded, setExpanded] = useState(true);
  const hasChildren = item.children && item.children.length > 0;

  // Build team-qualified href by injecting ?team=slug
  function withTeam(href: string): string {
    const [basePath, qs] = href.split("?");
    const params = new URLSearchParams(qs ?? "");
    params.set("team", teamSlug);
    return `${basePath}?${params.toString()}`;
  }

  const teamHref = withTeam(item.href);
  const basePath = item.href.split("?")[0];
  const active = isActiveTeam && pathname === basePath;

  return (
    <div>
      <Link
        href={teamHref}
        data-tour={dataTour}
        onClick={onActivate}
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
            {expanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
          </button>
        )}
        {Icon && <Icon size={14} className="text-[var(--color-text-muted)]" />}
        <span className="truncate">{item.label}</span>
      </Link>

      {hasChildren && expanded && (
        <div className="mt-0.5">
          {item.children!.map((child) => {
            const childHref = withTeam(child.href);
            const childBasePath = child.href.split("?")[0];
            const childActive = isActiveTeam && pathname === childBasePath;
            return (
              <Link
                key={child.id}
                href={childHref}
                onClick={onActivate}
                className={cn(
                  "flex items-center h-[26px] pl-10 pr-2 rounded-md text-[12px]",
                  "transition-colors duration-100",
                  "focus-visible:outline-2 focus-visible:outline-[var(--color-brand)] focus-visible:outline-offset-1",
                  childActive
                    ? "text-[var(--color-text-primary)]"
                    : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-secondary)]",
                )}
              >
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
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

function SidebarUtilityNavLink({
  icon: Icon,
  label,
  href,
  pathname,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  href: string;
  pathname: string;
}) {
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={cn(
        "w-full flex items-center gap-2 h-[28px] px-2 rounded-md text-[12px]",
        "transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]",
        active
          ? "bg-[var(--color-bg-selected)] text-[var(--color-text-primary)]"
          : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-secondary)]",
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon size={13} className={active ? "text-[var(--color-brand)]" : undefined} />
      {label}
    </Link>
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
