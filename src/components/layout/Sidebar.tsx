"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Inbox, Layers, Map, Circle, BarChart2,
  ChevronDown, ChevronRight, Compass, // Settings — hidden
  PanelLeftClose, PanelLeftOpen, Sun, Moon, RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useAppStore } from "@/store/useAppStore";
import { SIDEBAR_NAV, TEAM_NAV, TEAMS, type TeamConfig } from "@/lib/constants";
import type { SidebarNavItem } from "@/types";
import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import { TourGuide, useTourAutoShow } from "@/components/tour/TourGuide";
import { useToast } from "@/components/ui/Toast";

// ─────────────────────────────────────────────────────────────────────────────
// Pinned sidebar: expanded (220px) by default, collapses to icon-only (48px).
// Collapse state persists via useAppStore (zustand + persist).
// Icons sit in a fixed 48-px container so they stay centered at either size.
// ─────────────────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Inbox, Layers, Map, Circle, BarChart2,
};

const NAV_TOUR_IDS: Record<string, string>      = { inbox: "nav-inbox", views: "nav-views" };
const TEAM_NAV_TOUR_IDS: Record<string, string> = { scoring: "nav-prioritize", roadmap: "nav-roadmap" };

function labelCn(expanded: boolean) {
  return cn(
    "transition-opacity duration-150 whitespace-nowrap",
    expanded ? "opacity-100 delay-75" : "opacity-0 pointer-events-none",
  );
}

export function Sidebar() {
  const pathname           = usePathname();
  const workspace          = useAppStore((s) => s.workspace);
  const activeTeamId       = useAppStore((s) => s.activeTeamId);
  const setActiveTeamId    = useAppStore((s) => s.setActiveTeamId);
  const sidebarCollapsed   = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar      = useAppStore((s) => s.toggleSidebar);
  const mobileSidebarOpen  = useAppStore((s) => s.mobileSidebarOpen);
  const closeMobileSidebar = useAppStore((s) => s.closeMobileSidebar);
  const { open: tourOpen, openTour, closeTour } = useTourAutoShow();
  const { theme, cycleTheme } = useTheme();
  const ThemeIcon = theme === "light" ? Sun : Moon;
  const themeLabel = theme.charAt(0).toUpperCase() + theme.slice(1);

  const [resetPending, setResetPending] = useState(false);
  const { showToast, ToastContainer } = useToast();

  useEffect(() => {
    if (sessionStorage.getItem("keel:data-reset") === "1") {
      sessionStorage.removeItem("keel:data-reset");
      showToast("Data has been reset successfully");
    }
  }, [showToast]);

  function handleResetClick() {
    if (!resetPending) { setResetPending(true); return; }
    sessionStorage.setItem("keel:data-reset", "1");
    localStorage.clear();
    window.location.reload();
  }

  const expanded = !sidebarCollapsed;
  const LABEL    = labelCn(expanded);

  const sidebarContent = (
    <div className="flex flex-col h-full w-[220px] overflow-y-auto overflow-x-hidden">

          {/* ── Workspace header ── */}
          <Link
            href="/workspace"
            aria-label="Workspace overview"
            className="flex items-center h-[44px] flex-shrink-0 border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-hover)] transition-colors"
          >
            <IconBox>
              <WorkspaceAvatar name={workspace.name} color={workspace.avatarColor} />
            </IconBox>
            <span className={cn("text-[14px] font-semibold text-[var(--color-text-primary)] truncate pr-3", LABEL)}>
              {workspace.name}
            </span>
          </Link>

          {/* ── Primary nav ── */}
          <nav className="py-2" aria-label="Primary">
            {SIDEBAR_NAV.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                pathname={pathname}
                expanded={expanded}
                dataTour={NAV_TOUR_IDS[item.id]}
                onNavigate={closeMobileSidebar}
              />
            ))}
          </nav>

          {/* ── Section divider ── */}
          <div className="mx-3 mb-1 border-t border-[var(--color-border-subtle)]" />

          {/* ── Teams label ── */}
          <div className="h-6 flex items-center" data-tour="teams-section">
            <span className={cn("text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] pl-[52px]", LABEL)}>
              Teams
            </span>
          </div>

          {/* ── Team nav ── */}
          <nav className="pb-2" aria-label="Teams">
            {TEAMS.map((team) => (
              <TeamSection
                key={team.id}
                team={team}
                pathname={pathname}
                isActive={activeTeamId === team.id}
                onActivate={() => setActiveTeamId(team.id)}
                expanded={expanded}
                dataTour={`team-${team.id.replace("team_", "")}`}
                showTeamNavTour={team.id === "team_navigators"}
                initialExpanded={team.id === "team_navigators"}
              />
            ))}
          </nav>

          <div className="flex-1" />

          {/* ── Bottom utility ── */}
          <div className="border-t border-[var(--color-border-subtle)] py-2">
            {/* Settings — hidden for now
            <UtilityLink
              icon={Settings}
              label="Settings"
              href="/settings"
              pathname={pathname}
              expanded={expanded}
            />
            */}

            <button
              type="button"
              onClick={openTour}
              className="flex items-center w-full h-8 rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-secondary)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]"
              aria-label="Take a product tour"
            >
              <IconBox><Compass size={19} /></IconBox>
              <span className={cn("text-[13px]", LABEL)}>Take a tour</span>
            </button>

            <button
              type="button"
              onClick={cycleTheme}
              title={`Theme: ${themeLabel} — click to cycle`}
              aria-label={`Current theme: ${themeLabel}. Click to change.`}
              className="flex items-center w-full h-8 rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-secondary)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]"
            >
              <IconBox><ThemeIcon size={19} /></IconBox>
              <span className={cn("text-[13px]", LABEL)}>{themeLabel}</span>
            </button>

            {/* Reset data (dev only) */}
            <button
              type="button"
              onClick={handleResetClick}
              onBlur={() => setResetPending(false)}
              aria-label="Reset all data"
              title="Reset all data"
              className={cn(
                "flex items-center w-full h-8 rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]",
                resetPending
                  ? "text-red-500 bg-red-500/10 hover:bg-red-500/20"
                  : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-secondary)]",
              )}
            >
              <IconBox><RotateCcw size={15} /></IconBox>
              <span className={cn("flex items-center gap-1.5 text-[13px] truncate", LABEL)}>
                {resetPending ? "Confirm reset?" : "Reset Data"}
                {!resetPending && (
                  <span className="inline-flex items-center px-1 py-px rounded text-[9px] font-bold uppercase tracking-wide leading-none bg-amber-500/15 text-amber-500 border border-amber-500/25">
                    dev
                  </span>
                )}
              </span>
            </button>

            <button
              type="button"
              onClick={toggleSidebar}
              aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
              className="flex items-center w-full h-8 rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-secondary)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]"
            >
              <IconBox>
                {expanded ? <PanelLeftClose size={17} /> : <PanelLeftOpen size={17} />}
              </IconBox>
              <span className={cn("text-[13px]", LABEL)}>Collapse</span>
            </button>
          </div>

        </div>
  );

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside
        className={cn(
          "hidden md:flex flex-col h-full flex-shrink-0 overflow-hidden",
          "transition-[width] duration-200 ease-in-out",
          "bg-[var(--color-bg-base)] border-r border-[var(--color-border-subtle)]",
          expanded ? "w-[220px]" : "w-12",
        )}
        aria-label="Main navigation"
      >
        {sidebarContent}
      </aside>

      {/* ── Mobile drawer backdrop ── */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile drawer ── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col h-full overflow-hidden md:hidden",
          "bg-[var(--color-bg-base)] border-r border-[var(--color-border-subtle)]",
          "transition-transform duration-250 ease-in-out w-[220px]",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Main navigation"
      >
        {sidebarContent}
      </aside>

      <TourGuide open={tourOpen} onClose={closeTour} />
      <ToastContainer />
    </>
  );
}

// ── Icon box — fixed 48px container that centers the icon ──────────────────

function IconBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-12 h-full flex items-center justify-center flex-shrink-0">
      {children}
    </div>
  );
}

// ── Nav item ───────────────────────────────────────────────────────────────

function NavItem({
  item, pathname, expanded, dataTour, onNavigate,
}: {
  item: SidebarNavItem; pathname: string; expanded: boolean; dataTour?: string; onNavigate?: () => void;
}) {
  const Icon   = ICON_MAP[item.icon];
  const active = pathname === item.href || pathname.startsWith(item.href + "/");
  const LABEL  = labelCn(expanded);

  return (
    <Link
      href={item.href}
      data-tour={dataTour}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group/item flex items-center h-8 mx-1.5 rounded-md transition-colors duration-100",
        "focus-visible:outline-2 focus-visible:outline-[var(--color-brand)] focus-visible:outline-offset-1",
        active
          ? "bg-[var(--color-brand)] text-white"
          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]",
      )}
    >
      <div className="w-9 flex items-center justify-center flex-shrink-0">
        {Icon && (
          <Icon
            size={20}
            className={cn(active ? "text-white" : "text-[var(--color-text-muted)] group-hover/item:text-[var(--color-text-primary)]")}
          />
        )}
      </div>
      <span className={cn("text-[14px] font-medium flex-1 pr-2", LABEL)}>
        {item.label}
      </span>
      {item.badge != null && item.badge > 0 && (
        <span className={cn("mr-2 text-[12px]", LABEL, active ? "text-white/70" : "text-[var(--color-text-muted)]")}>
          {item.badge}
        </span>
      )}
    </Link>
  );
}

// ── Team section ───────────────────────────────────────────────────────────

function TeamSection({
  team, pathname, isActive, onActivate, expanded, dataTour, showTeamNavTour, initialExpanded = false,
}: {
  team: TeamConfig; pathname: string; isActive: boolean; onActivate: () => void;
  expanded: boolean; dataTour?: string; showTeamNavTour?: boolean; initialExpanded?: boolean;
}) {
  const [subExpanded, setSubExpanded] = useState(initialExpanded);
  const LABEL = labelCn(expanded);

  return (
    <div>
      <button
        data-tour={dataTour}
        onClick={() => setSubExpanded((v) => !v)}
        aria-expanded={subExpanded}
        aria-label={`${team.name} team`}
        className="flex items-center w-full h-8 mx-0 hover:bg-[var(--color-bg-hover)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]"
      >
        <div className="w-12 flex items-center justify-center flex-shrink-0">
          <TeamAvatar name={team.name} color={team.color} />
        </div>
        <span className={cn("flex-1 text-left text-[14px] font-medium text-[var(--color-text-primary)]", LABEL)}>
          {team.name}
        </span>
        <span className={cn("mr-3", LABEL)}>
          {subExpanded
            ? <ChevronDown  size={17} className="text-[var(--color-text-muted)]" />
            : <ChevronRight size={17} className="text-[var(--color-text-muted)]" />}
        </span>
      </button>

      {subExpanded && (
        <div>
          {TEAM_NAV.map((item) => (
            <TeamNavItem
              key={`${team.id}_${item.id}`}
              item={item}
              pathname={pathname}
              teamSlug={team.slug}
              isActiveTeam={isActive}
              onActivate={onActivate}
              expanded={expanded}
              dataTour={showTeamNavTour ? TEAM_NAV_TOUR_IDS[item.id] : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Team nav item ──────────────────────────────────────────────────────────

function TeamNavItem({
  item, pathname, teamSlug, isActiveTeam, onActivate, expanded, dataTour,
}: {
  item: SidebarNavItem; pathname: string; teamSlug: string;
  isActiveTeam: boolean; onActivate: () => void; expanded: boolean; dataTour?: string;
}) {
  const Icon  = ICON_MAP[item.icon];
  const LABEL = labelCn(expanded);

  function withTeam(href: string): string {
    if (href.includes(":teamSlug")) return href.replace(":teamSlug", teamSlug);
    const [basePath, qs] = href.split("?");
    const params = new URLSearchParams(qs ?? "");
    params.set("team", teamSlug);
    return `${basePath}?${params.toString()}`;
  }

  const teamHref = withTeam(item.href);
  const active   = isActiveTeam && pathname === teamHref.split("?")[0];

  return (
    <Link
      href={teamHref}
      data-tour={dataTour}
      onClick={onActivate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group/item flex items-center h-8 mx-1.5 rounded-md transition-colors duration-100",
        "focus-visible:outline-2 focus-visible:outline-[var(--color-brand)] focus-visible:outline-offset-1",
        active
          ? "bg-[var(--color-brand)]/10 text-[var(--color-brand)]"
          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]",
      )}
    >
      <div className="w-9 flex items-center justify-center flex-shrink-0 pl-3">
        {Icon && (
          <Icon
            size={19}
            className={cn(active ? "text-[var(--color-brand)]" : "text-[var(--color-text-muted)] group-hover/item:text-[var(--color-text-secondary)]")}
          />
        )}
      </div>
      <span className={cn("text-[13px] font-medium flex-1 pr-2", LABEL)}>
        {item.label}
      </span>
    </Link>
  );
}

// ── Utility link ───────────────────────────────────────────────────────────

function UtilityLink({
  icon: Icon, label, href, pathname, expanded,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string; href: string; pathname: string; expanded: boolean;
}) {
  const active = pathname === href || pathname.startsWith(href + "/");
  const LABEL  = labelCn(expanded);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center h-8 mx-0 rounded-md transition-colors",
        "focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]",
        active
          ? "text-[var(--color-text-primary)]"
          : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-secondary)]",
      )}
    >
      <IconBox>
        <Icon size={19} className={active ? "text-[var(--color-brand)]" : undefined} />
      </IconBox>
      <span className={cn("text-[13px]", LABEL)}>{label}</span>
    </Link>
  );
}

// ── Avatars ────────────────────────────────────────────────────────────────

function WorkspaceAvatar({ name, color }: { name: string; color: string }) {
  return (
    <div
      className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-[11px] font-bold text-white shadow-sm"
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
      className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-[10px] font-bold text-white"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
