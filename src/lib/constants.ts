import type { QuarterRef, SidebarNavItem, WorkspaceMember } from "@/types";

// ── Quarter helpers ────────────────────────

export function makeQuarterRef(year: number, q: 1 | 2 | 3 | 4): QuarterRef {
  return { year, quarter: q, label: `Q${q} ${year}` };
}

export const CURRENT_QUARTER: QuarterRef = makeQuarterRef(2026, 2);

// ── Scoring framework labels ───────────────

export const FRAMEWORK_LABELS = {
  rice: "RICE",
  moscow: "MoSCoW",
  wsjf: "WSJF",
  custom: "Custom",
} as const;

// ── MoSCoW labels ─────────────────────────

export const MOSCOW_LABELS = {
  must: "Must Have",
  should: "Should Have",
  could: "Could Have",
  wont: "Won't Have",
} as const;

export const MOSCOW_COLORS = {
  must: "var(--color-danger)",
  should: "var(--color-brand)",
  could: "var(--color-warning)",
  wont: "var(--color-text-muted)",
} as const;

// ── Priority config ────────────────────────

export const PRIORITY_CONFIG = {
  urgent: { label: "Urgent", color: "var(--color-priority-urgent)" },
  high:   { label: "High",   color: "var(--color-priority-high)" },
  medium: { label: "Medium", color: "var(--color-priority-medium)" },
  low:    { label: "Low",    color: "var(--color-priority-low)" },
  none:   { label: "None",   color: "var(--color-priority-none)" },
} as const;

// ── Status config ──────────────────────────

export const STATUS_CONFIG = {
  backlog:     { label: "Backlog",     color: "var(--color-status-backlog)" },
  todo:        { label: "Todo",        color: "var(--color-status-todo)" },
  in_progress: { label: "In Progress", color: "var(--color-status-in-progress)" },
  in_review:   { label: "In Review",   color: "var(--color-status-in-review)" },
  closed:      { label: "Closed",      color: "var(--color-status-closed)" },
  done:        { label: "Done",        color: "var(--color-status-done)" },
  canceled:    { label: "Canceled",    color: "var(--color-status-canceled)" },
} as const;

// ── Plan status config ─────────────────────

export const PLAN_STATUS_CONFIG = {
  draft:      { label: "Draft",       color: "var(--color-text-secondary)" },
  in_review:  { label: "In Review",   color: "var(--color-warning)" },
  approved:   { label: "Approved",    color: "var(--color-success)" },
  locked:     { label: "Locked",      color: "var(--color-brand)" },
} as const;

// ── Sidebar navigation ─────────────────────

export const SIDEBAR_NAV: SidebarNavItem[] = [
  { id: "inbox",    label: "Inbox",     icon: "Inbox",      href: "/inbox" },
  { id: "views",    label: "Views",     icon: "Layers",     href: "/views" },
];

export const TEAM_NAV: SidebarNavItem[] = [
  { id: "ideas", label: "Ideas", icon: "Layers", href: "/team/:teamSlug/ideas" },
  { id: "scoring",  label: "Prioritization",  icon: "BarChart2", href: "/team/:teamSlug/prioritization" },
  { id: "roadmap",  label: "Roadmap",  icon: "Map",       href: "/team/:teamSlug/roadmap" },
];

export interface TeamConfig {
  id: string;
  name: string;
  color: string;
  slug: string;
}

export const TEAMS: TeamConfig[] = [
  { id: "team_navigators", name: "Navigators Team", color: "#5e5ce6", slug: "navigators" },
  { id: "team_hitchhiker", name: "Hitchhikers Team", color: "#30a46c", slug: "hitchhiker" },
];

// ── Keyboard shortcuts ─────────────────────

export const SHORTCUTS = {
  CREATE_ISSUE:   "C",
  CHANGE_STATUS:  "S",
  HELP:           "?",
  SEARCH:         "$mod+K",
  CLOSE:          "Escape",
  UNDO:           "$mod+Z",
  REDO:           "$mod+Shift+Z",
} as const;

// ── Seed workspace (Phase 1 static data) ──

export const DEMO_WORKSPACE = {
  id: "ws_keel_demo",
  name: "Keel",
  slug: "keel",
  avatarColor: "#5e5ce6",
  productAreas: ["Growth", "Onboarding", "Core Product", "Platform", "Integrations"],
  members: [] as WorkspaceMember[],
  currentUser: {
    id: "u_pm_01",
    name: "Alex Chen",
    email: "alex@keel.so",
    avatarUrl: null,
    avatarInitials: "AC",
    avatarColor: "#5e5ce6",
    role: "admin",
  } as WorkspaceMember,
};
