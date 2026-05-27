"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  User,
  Building2,
  Users,
  Bell,
  Plug,
  Palette,
  Tag,
  ChevronRight,
  ChevronDown,
  Check,
  Copy,
  GitBranch,
  MessageSquare,
  Link2,
  Loader2,
  Mail,
  Shield,
  Trash2,
  Pencil,
  X,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useAppStore, type WorkspaceTag, type PendingInvite } from "@/store/useAppStore";
import { useToast } from "@/components/ui/Toast";
import { useInboxStore } from "@/store/useInboxStore";
// import { useTheme } from "@/hooks/useTheme"; // v2 — Appearance section
import { TEAMS } from "@/lib/constants";

// const DENSITY_KEY = "keel-density"; // v2 — Appearance section

// ─────────────────────────────────────────────
// SettingsView — /settings
// Two-panel layout: section nav (left) + content (right)
// ─────────────────────────────────────────────

type Section =
  | "profile"
  | "workspace"
  | "members"
  | "appearance"
  | "notifications"
  | "integrations";

interface SectionMeta {
  id: Section;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
  comingSoon?: boolean;
}

const SECTIONS: SectionMeta[] = [
  { id: "profile",       label: "Profile",       icon: User,      description: "Your personal details" },
  { id: "workspace",     label: "Workspace",     icon: Building2, description: "Name, branding, and slug",  comingSoon: true },
  { id: "members",       label: "Members",       icon: Users,     description: "Manage access and roles",   comingSoon: true },
  { id: "appearance",    label: "Appearance",    icon: Palette,   description: "Theme and display",  comingSoon: true },
  { id: "notifications", label: "Notifications", icon: Bell,      description: "Email and in-app alerts",   comingSoon: true },
  { id: "integrations",  label: "Integrations",  icon: Plug,      description: "Connect external tools",   comingSoon: true },
];

interface Props {
  initialSection?: string;
}

export function SettingsView({ initialSection = "profile" }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState<Section>(() => {
    const found = SECTIONS.find((s) => s.id === initialSection);
    return found && !found.comingSoon ? (initialSection as Section) : "profile";
  });

  function navigate(section: Section) {
    setActive(section);
    router.push(`/settings/${section}`, { scroll: false });
  }

  const activeMeta = SECTIONS.find((s) => s.id === active)!;

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden">
      {/* ── Mobile top nav ── */}
      <div className="md:hidden flex-shrink-0 border-b border-[var(--color-border-subtle)] overflow-x-auto">
        <nav className="flex px-3 py-2 gap-1">
          {SECTIONS.filter((s) => !s.comingSoon).map((s) => {
            const Icon = s.icon;
            const isActive = s.id === active;
            return (
              <button
                key={s.id}
                onClick={() => navigate(s.id)}
                className={cn(
                  "flex items-center gap-1.5 h-8 px-3 rounded-md text-[12px] whitespace-nowrap transition-colors flex-shrink-0",
                  isActive
                    ? "bg-[var(--color-bg-selected)] text-[var(--color-text-primary)] font-medium"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]",
                )}
              >
                <Icon size={13} />
                {s.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Desktop side nav ── */}
      <aside className="hidden md:block w-[200px] flex-shrink-0 border-r border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] overflow-y-auto">
        <div className="px-4 py-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-2">
            Settings
          </p>
          <nav className="space-y-0.5">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const isActive = s.id === active;
              if (s.comingSoon) {
                return (
                  <div
                    key={s.id}
                    className="flex items-center gap-2.5 h-8 px-2 rounded-md text-[13px] opacity-40 cursor-not-allowed select-none"
                  >
                    <Icon size={14} className="text-[var(--color-text-muted)]" />
                    <span className="text-[var(--color-text-muted)]">{s.label}</span>
                    <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)] border border-[var(--color-border-subtle)] px-1.5 py-0.5 rounded-full">
                      v2
                    </span>
                  </div>
                );
              }
              return (
                <button
                  key={s.id}
                  onClick={() => navigate(s.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 h-8 px-2 rounded-md text-[13px] text-left transition-colors",
                    "focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]",
                    isActive
                      ? "bg-[var(--color-bg-selected)] text-[var(--color-text-primary)]"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon
                    size={14}
                    className={isActive ? "text-[var(--color-brand)]" : "text-[var(--color-text-muted)]"}
                  />
                  {s.label}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* ── Content panel ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
          <div className="mb-6">
            <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">
              {activeMeta.label}
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
              {activeMeta.description}
            </p>
          </div>

          <div className="space-y-6">
            {active === "profile"       && <ProfileSection />}
            {active === "workspace"     && <WorkspaceSection />}
            {active === "members"       && <MembersSection />}
            {/* {active === "appearance"    && <AppearanceSection />} */}
            {active === "notifications" && <NotificationsComingSoon />}
            {active === "integrations"  && <IntegrationsComingSoon />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Shared primitives ──────────────────────────────────────

function SettingsCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] overflow-hidden", className)}>
      {children}
    </div>
  );
}

function SettingsRow({
  label,
  description,
  children,
  last,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 px-5 py-4",
        !last && "border-b border-[var(--color-border-subtle)]",
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--color-text-primary)]">{label}</p>
        {description && (
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{description}</p>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function SettingsInput({
  value,
  onChange,
  placeholder,
  readOnly,
}: {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      className={cn(
        "h-8 px-3 rounded-md border border-[var(--color-border-strong)] text-sm",
        "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]",
        "focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]",
        "placeholder:text-[var(--color-text-muted)] w-48",
        readOnly && "opacity-60 cursor-default",
      )}
    />
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]",
        checked ? "bg-[var(--color-brand)]" : "bg-[var(--color-border-strong)]",
      )}
    >
      <span
        className={cn(
          "inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-4" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

function SaveButton({ onClick, saved }: { onClick: () => void; saved: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-8 px-4 rounded-md text-sm font-medium transition-colors",
        saved
          ? "bg-[var(--color-success)] text-white"
          : "bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-hover)]",
        "focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]",
      )}
    >
      {saved ? (
        <span className="flex items-center gap-1.5"><Check size={13} /> Saved</span>
      ) : (
        "Save changes"
      )}
    </button>
  );
}

// ── Profile Section ───────────────────────────

const AVATAR_COLORS = [
  "#5e5ce6", "#30a46c", "#e5484d", "#f97316",
];

function deriveInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function ProfileSection() {
  const currentUser       = useAppStore((s) => s.workspace.currentUser);
  const updateCurrentUser = useAppStore((s) => s.updateCurrentUser);
  const requests          = useInboxStore((s) => s.requests);

  const [name, setName] = useState(currentUser.name);
  const [color, setColor] = useState(currentUser.avatarColor);

  useEffect(() => {
    if (name.trim() && name.trim() !== currentUser.name) {
      updateCurrentUser({ name: name.trim(), avatarColor: color });
    }
  }, [name, color, currentUser.name, updateCurrentUser]);

  const liveInitials = deriveInitials(name || currentUser.name);

  const myRequests = requests.filter((r) => r.submittedBy === currentUser.name);
  const recentRequests = [...myRequests]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 3);

  const statusColors: Record<string, string> = {
    new:      "var(--color-warning)",
    triaged:  "var(--color-brand)",
    archived: "var(--color-text-muted)",
  };

  return (
    <>
      {/* Identity card */}
      <SettingsCard>
        {/* Avatar + name hero row */}
        <div className="flex items-center gap-4 px-5 py-5">
          {/* Live avatar preview */}
          <div
            className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold text-white transition-colors"
            style={{ backgroundColor: color }}
          >
            {liveInitials}
          </div>
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={cn(
                "w-full text-base font-semibold bg-transparent border-b border-transparent",
                "text-[var(--color-text-primary)] focus:outline-none",
                "focus:border-[var(--color-brand)] transition-colors pb-0.5",
                "placeholder:text-[var(--color-text-muted)]",
              )}
              placeholder="Your name"
              aria-label="Display name"
            />
          </div>
          <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-medium flex-shrink-0"
            style={currentUser.role === "admin"
              ? { backgroundColor: "var(--color-admin-badge-bg)", color: "var(--color-admin-badge-text)" }
              : { backgroundColor: "var(--color-bg-elevated)", color: "var(--color-text-secondary)", border: "1px solid var(--color-border-subtle)" }
            }
          >
            <Shield size={11} />
            {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
          </span>
        </div>

        {/* Avatar color row — hidden */}
        {/* <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--color-border-subtle)]">
          <div>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">Avatar color</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Used in your avatar across the workspace</p>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {AVATAR_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={cn(
                  "h-6 w-6 rounded-full transition-transform hover:scale-110",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]",
                )}
                style={{
                  backgroundColor: c,
                  boxShadow: color === c ? `0 0 0 2px var(--color-bg-surface), 0 0 0 4px ${c}` : undefined,
                }}
                aria-label={c}
                aria-pressed={color === c}
              />
            ))}
          </div>
        </div> */}

      </SettingsCard>

      {/* Recent requests */}
      {recentRequests.length > 0 && (
        <SettingsCard>
          <div className="px-5 py-3 border-b border-[var(--color-border-subtle)]">
            <p className="text-sm font-medium text-[var(--color-text-primary)]">Your recent requests</p>
          </div>
          {recentRequests.map((r, i) => (
            <div
              key={r.id}
              className={cn(
                "flex items-center gap-3 px-5 py-3",
                i < recentRequests.length - 1 && "border-b border-[var(--color-border-subtle)]",
              )}
            >
              <div
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: statusColors[r.status] }}
              />
              <span className="flex-1 text-sm text-[var(--color-text-primary)] truncate">{r.title}</span>
              <span className="text-[11px] text-[var(--color-text-muted)] flex-shrink-0 capitalize">{r.status}</span>
            </div>
          ))}
        </SettingsCard>
      )}

      {/* Teams */}
      <SettingsCard>
        <div className="px-5 py-3 border-b border-[var(--color-border-subtle)]">
          <p className="text-sm font-medium text-[var(--color-text-primary)]">Teams</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Workspaces you have access to</p>
        </div>
        {TEAMS.map((team, i) => (
          <div
            key={team.id}
            className={cn(
              "flex items-center gap-3 px-5 py-3",
              i < TEAMS.length - 1 && "border-b border-[var(--color-border-subtle)]",
            )}
          >
            <div
              className="h-7 w-7 rounded flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
              style={{ backgroundColor: team.color }}
            >
              {team.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[var(--color-text-primary)]">{team.name}</p>
              <p className="text-xs text-[var(--color-text-muted)]">/{team.slug}</p>
            </div>
            <span className="text-[11px] text-[var(--color-text-muted)]">
              {requests.filter((r) => (r.teamId ?? "team_navigators") === team.id).length} requests
            </span>
          </div>
        ))}
      </SettingsCard>

    </>
  );
}

// ── Workspace Section ─────────────────────────

const COLOR_PRESETS = [
  "#5e5ce6", "#30a46c", "#e5484d", "#f97316",
  "#f5a623", "#3b82f6", "#8b5cf6", "#ec4899",
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function WorkspaceSection() {
  const workspace       = useAppStore((s) => s.workspace);
  const updateWorkspace = useAppStore((s) => s.updateWorkspace);
  const { showToast, ToastContainer } = useToast();

  const [name, setName]           = useState(workspace.name);
  const [slug, setSlug]           = useState(workspace.slug);
  const [slugEditing, setSlugEditing] = useState(false);
  const [color, setColor]         = useState(workspace.avatarColor);
  const [copied, setCopied]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [slugError, setSlugError] = useState("");

  // Auto-derive slug from name when name changes (only when not manually editing)
  useEffect(() => {
    if (!slugEditing) {
      setSlug(slugify(name) || slug);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, slugEditing]);

  const dirty =
    name.trim() !== workspace.name ||
    slug !== workspace.slug ||
    color !== workspace.avatarColor;

  function handleSlugChange(val: string) {
    // Allow only valid slug characters while typing
    const clean = val.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSlug(clean);
    setSlugError("");
  }

  function copySlug() {
    navigator.clipboard.writeText(slug);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleSave() {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const finalSlug = slugify(slug);
    if (!finalSlug) {
      setSlugError("Slug must contain at least one letter or number.");
      return;
    }

    updateWorkspace({ name: trimmedName, slug: finalSlug, avatarColor: color });
    setName(trimmedName);
    setSlug(finalSlug);
    setSlugEditing(false);
    setSlugError("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    showToast("Workspace settings saved");
  }

  return (
    <>
      <ToastContainer />

      <SettingsCard>
        <SettingsRow label="Workspace name" description="Visible to all members">
          <SettingsInput value={name} onChange={setName} placeholder="My workspace" />
        </SettingsRow>

        <SettingsRow label="Slug" description="Used in shared links · keel.so/{slug}">
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              {slugEditing ? (
                <>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-muted)] select-none pointer-events-none">
                      /
                    </span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") setSlugEditing(false);
                        if (e.key === "Escape") { setSlug(workspace.slug); setSlugEditing(false); setSlugError(""); }
                      }}
                      autoFocus
                      placeholder="my-workspace"
                      className={cn(
                        "h-8 pl-6 pr-3 rounded-md border text-sm w-48",
                        "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]",
                        "focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]",
                        "placeholder:text-[var(--color-text-muted)]",
                        slugError ? "border-[var(--color-danger)]" : "border-[var(--color-border-strong)]",
                      )}
                    />
                  </div>
                  <button
                    onClick={() => { setSlug(workspace.slug); setSlugEditing(false); setSlugError(""); }}
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
                    aria-label="Cancel slug edit"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <>
                  <SettingsInput value={slug} readOnly />
                  <button
                    onClick={() => setSlugEditing(true)}
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
                    aria-label="Edit slug"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={copySlug}
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
                    aria-label="Copy slug"
                  >
                    {copied ? <Check size={14} className="text-[var(--color-success)]" /> : <Copy size={14} />}
                  </button>
                </>
              )}
            </div>
            {slugError && (
              <p className="text-[11px] text-[var(--color-danger)]">{slugError}</p>
            )}
          </div>
        </SettingsRow>

        <SettingsRow label="Accent color" description="Used in avatars and highlights" last>
          <div className="flex items-center gap-1.5">
            {COLOR_PRESETS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={cn(
                  "h-6 w-6 rounded-full transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]",
                  color === c && "ring-2 ring-offset-2 ring-offset-[var(--color-bg-surface)]",
                )}
                style={{
                  backgroundColor: c,
                  ...(color === c ? { outline: `2px solid ${c}` } : {}),
                }}
                aria-label={`Color ${c}`}
                aria-pressed={color === c}
              />
            ))}
          </div>
        </SettingsRow>
      </SettingsCard>

      {/* Tags */}
      <TagsManager />

      {/* Teams */}
      <SettingsCard>
        <div className="px-5 py-3 border-b border-[var(--color-border-subtle)]">
          <p className="text-sm font-medium text-[var(--color-text-primary)]">Teams</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Teams scoped inside this workspace</p>
        </div>
        {TEAMS.map((team, i) => (
          <div
            key={team.id}
            className={cn(
              "flex items-center gap-3 px-5 py-3",
              i < TEAMS.length - 1 && "border-b border-[var(--color-border-subtle)]",
            )}
          >
            <div
              className="h-6 w-6 rounded flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
              style={{ backgroundColor: team.color }}
            >
              {team.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[var(--color-text-primary)]">{team.name}</p>
              <p className="text-xs text-[var(--color-text-muted)]">/{team.slug}</p>
            </div>
            <ChevronRight size={14} className="text-[var(--color-text-muted)]" />
          </div>
        ))}
      </SettingsCard>

      <div className="flex items-center justify-between">
        {dirty && (
          <p className="text-xs text-[var(--color-text-muted)]">You have unsaved changes</p>
        )}
        <div className="ml-auto">
          <SaveButton onClick={handleSave} saved={saved} />
        </div>
      </div>
    </>
  );
}

// ── Tags Manager ──────────────────────────────

const TAG_COLOR_OPTIONS = [
  { hex: "#e5484d", label: "Red"    },
  { hex: "#f97316", label: "Orange" },
  { hex: "#f5a623", label: "Amber"  },
  { hex: "#30a46c", label: "Green"  },
  { hex: "#14b8a6", label: "Teal"   },
  { hex: "#3b82f6", label: "Blue"   },
  { hex: "#5e5ce6", label: "Indigo" },
  { hex: "#8b5cf6", label: "Violet" },
  { hex: "#ec4899", label: "Pink"   },
  { hex: "#6b7280", label: "Gray"   },
];

function TagsManager() {
  const workspaceTags    = useAppStore((s) => s.workspaceTags);
  const addWorkspaceTag  = useAppStore((s) => s.addWorkspaceTag);
  const updateWorkspaceTag = useAppStore((s) => s.updateWorkspaceTag);
  const removeWorkspaceTag = useAppStore((s) => s.removeWorkspaceTag);
  const requests         = useInboxStore((s) => s.requests);

  const [adding, setAdding]   = useState(false);
  const [editId, setEditId]   = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(TAG_COLOR_OPTIONS[6].hex);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Count how many requests use each tag name
  const usageCounts = useCallback(
    (name: string) => requests.filter((r) => r.tags.includes(name)).length,
    [requests],
  );

  function openAdd() {
    setAdding(true);
    setEditId(null);
    setNewName("");
    setNewColor(TAG_COLOR_OPTIONS[6].hex);
    setTimeout(() => nameInputRef.current?.focus(), 50);
  }

  function cancelAdd() {
    setAdding(false);
    setNewName("");
  }

  function confirmAdd() {
    const trimmed = newName.trim().toLowerCase().replace(/\s+/g, "-");
    if (!trimmed) return;
    if (workspaceTags.some((t) => t.name === trimmed)) return; // no duplicates
    addWorkspaceTag({ name: trimmed, color: newColor });
    setAdding(false);
    setNewName("");
  }

  function openEdit(tag: WorkspaceTag) {
    setEditId(tag.id);
    setNewName(tag.name);
    setNewColor(tag.color);
    setAdding(false);
  }

  function cancelEdit() {
    setEditId(null);
  }

  function confirmEdit(id: string) {
    const trimmed = newName.trim().toLowerCase().replace(/\s+/g, "-");
    if (!trimmed) return;
    updateWorkspaceTag(id, { name: trimmed, color: newColor });
    setEditId(null);
  }

  function requestDelete(id: string) {
    setDeleteConfirm(id);
  }

  function confirmDelete(id: string) {
    removeWorkspaceTag(id);
    setDeleteConfirm(null);
  }

  return (
    <SettingsCard>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--color-border-subtle)]">
        <div>
          <p className="text-sm font-medium text-[var(--color-text-primary)] flex items-center gap-2">
            <Tag size={14} className="text-[var(--color-text-muted)]" />
            Tags
            <span className="text-xs font-normal text-[var(--color-text-muted)]">
              ({workspaceTags.length})
            </span>
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Labels applied to feature requests across teams
          </p>
        </div>
        {!adding && (
          <button
            onClick={openAdd}
            className={cn(
              "flex items-center gap-1 h-7 px-3 rounded-md text-xs font-medium transition-colors",
              "bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-hover)]",
              "focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]",
            )}
          >
            <Plus size={12} />
            New tag
          </button>
        )}
      </div>

      {/* New tag form */}
      {adding && (
        <div className="flex items-center gap-3 px-5 py-3 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]">
          <ColorPicker value={newColor} onChange={setNewColor} />
          <input
            ref={nameInputRef}
            type="text"
            placeholder="tag-name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") confirmAdd();
              if (e.key === "Escape") cancelAdd();
            }}
            className={cn(
              "flex-1 h-7 px-2 rounded border border-[var(--color-border-strong)] text-sm",
              "bg-[var(--color-bg-base)] text-[var(--color-text-primary)]",
              "focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]",
              "placeholder:text-[var(--color-text-muted)]",
            )}
          />
          <button
            onClick={confirmAdd}
            disabled={!newName.trim()}
            className="h-7 px-3 rounded-md text-xs font-medium bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-hover)] disabled:opacity-40"
          >
            Add
          </button>
          <button
            onClick={cancelAdd}
            className="h-7 px-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Tag rows */}
      <div>
        {workspaceTags.length === 0 && !adding && (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-[var(--color-text-muted)]">No tags yet. Create one to get started.</p>
          </div>
        )}

        {workspaceTags.map((tag, i) => {
          const isEditing = editId === tag.id;
          const isDeleting = deleteConfirm === tag.id;
          const count = usageCounts(tag.name);
          const isLast = i === workspaceTags.length - 1;

          if (isEditing) {
            return (
              <div
                key={tag.id}
                className={cn(
                  "flex items-center gap-3 px-5 py-2.5 bg-[var(--color-bg-elevated)]",
                  !isLast && "border-b border-[var(--color-border-subtle)]",
                )}
              >
                <ColorPicker value={newColor} onChange={setNewColor} />
                <input
                  autoFocus
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") confirmEdit(tag.id);
                    if (e.key === "Escape") cancelEdit();
                  }}
                  className={cn(
                    "flex-1 h-7 px-2 rounded border border-[var(--color-border-strong)] text-sm",
                    "bg-[var(--color-bg-base)] text-[var(--color-text-primary)]",
                    "focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]",
                  )}
                />
                <button
                  onClick={() => confirmEdit(tag.id)}
                  disabled={!newName.trim()}
                  className="h-7 px-3 rounded-md text-xs font-medium bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-hover)] disabled:opacity-40"
                >
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="h-7 px-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                >
                  <X size={14} />
                </button>
              </div>
            );
          }

          if (isDeleting) {
            return (
              <div
                key={tag.id}
                className={cn(
                  "flex items-center gap-3 px-5 py-2.5 bg-[var(--color-danger)]/5",
                  !isLast && "border-b border-[var(--color-border-subtle)]",
                )}
              >
                <div
                  className="h-3 w-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="flex-1 text-sm text-[var(--color-text-primary)]">{tag.name}</span>
                <span className="text-xs text-[var(--color-text-muted)] mr-2">
                  {count > 0 ? `Used by ${count} request${count !== 1 ? "s" : ""}` : "Not in use"}
                </span>
                <span className="text-xs text-[var(--color-danger)]">Delete?</span>
                <button
                  onClick={() => confirmDelete(tag.id)}
                  className="h-7 px-3 rounded-md text-xs font-medium bg-[var(--color-danger)] text-white hover:opacity-90"
                >
                  Yes, delete
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="h-7 px-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                >
                  <X size={14} />
                </button>
              </div>
            );
          }

          return (
            <div
              key={tag.id}
              className={cn(
                "group flex items-center gap-3 px-5 py-2.5",
                !isLast && "border-b border-[var(--color-border-subtle)]",
                "hover:bg-[var(--color-bg-hover)] transition-colors",
              )}
            >
              {/* Color swatch + name chip */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div
                  className="h-3 w-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: tag.color }}
                />
                <span
                  className="inline-flex items-center h-5 px-2 rounded-full text-xs font-medium"
                  style={{ backgroundColor: `${tag.color}22`, color: tag.color }}
                >
                  {tag.name}
                </span>
              </div>

              {/* Usage count */}
              <span className="text-xs text-[var(--color-text-muted)] tabular-nums w-24 text-right">
                {count === 0 ? "Not in use" : `${count} request${count !== 1 ? "s" : ""}`}
              </span>

              {/* Actions — visible on hover */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(tag)}
                  className="flex items-center justify-center h-6 w-6 rounded hover:bg-[var(--color-bg-selected)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
                  aria-label={`Edit ${tag.name}`}
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={() => requestDelete(tag.id)}
                  className="flex items-center justify-center h-6 w-6 rounded hover:bg-[var(--color-danger)]/10 text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors"
                  aria-label={`Delete ${tag.name}`}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </SettingsCard>
  );
}

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-6 w-6 rounded-full border-2 border-[var(--color-border-strong)] focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]"
        style={{ backgroundColor: value }}
        aria-label="Pick color"
        aria-expanded={open}
      />
      {open && (
        <div className={cn(
          "absolute left-0 top-8 z-20 p-2 rounded-lg border border-[var(--color-border-strong)]",
          "bg-[var(--color-bg-elevated)] shadow-xl grid grid-cols-5 gap-1",
        )}>
          {TAG_COLOR_OPTIONS.map((opt) => (
            <button
              key={opt.hex}
              type="button"
              onClick={() => { onChange(opt.hex); setOpen(false); }}
              className={cn(
                "h-5 w-5 rounded-full transition-transform hover:scale-110",
                value === opt.hex && "ring-2 ring-offset-1 ring-offset-[var(--color-bg-elevated)]",
              )}
              style={{ backgroundColor: opt.hex }}
              aria-label={opt.label}
              aria-pressed={value === opt.hex}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Members Section ───────────────────────────

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

type InviteStatus = "idle" | "sending" | "sent" | "link_ready" | "error";

function MembersSection() {
  const workspace         = useAppStore((s) => s.workspace);
  const members           = workspace.members;
  const currentUser       = workspace.currentUser;
  const removeMember      = useAppStore((s) => s.removeMember);
  const pendingInvites    = useAppStore((s) => s.pendingInvites);
  const addPendingInvite  = useAppStore((s) => s.addPendingInvite);
  const removePendingInvite = useAppStore((s) => s.removePendingInvite);
  const requests          = useInboxStore((s) => s.requests);
  const { showToast, ToastContainer } = useToast();

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole]   = useState<"admin" | "member" | "viewer">("member");
  const [inviteStatus, setInviteStatus] = useState<InviteStatus>("idle");
  const [inviteError, setInviteError] = useState("");
  const [inviteLink, setInviteLink]   = useState("");
  const [linkCopied, setLinkCopied]   = useState(false);

  async function handleInvite() {
    const trimmed = inviteEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setInviteError("Enter a valid email address.");
      return;
    }
    if (members.some((m) => m.email === trimmed)) {
      setInviteError("This person is already a member.");
      return;
    }
    if (pendingInvites.some((i) => i.email === trimmed)) {
      setInviteError("An invite is already pending for this email.");
      return;
    }

    setInviteStatus("sending");
    setInviteError("");

    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email:         trimmed,
          role:          inviteRole,
          inviterName:   currentUser.name,
          workspaceId:   workspace.id,
          workspaceName: workspace.name,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message ?? "Failed to send invitation.");
      }

      // Update local pending-invite list for display
      addPendingInvite({ email: trimmed, role: inviteRole, sentAt: new Date().toISOString() });
      setInviteEmail("");

      if (data.emailSent === false && data.inviteUrl) {
        // Resend domain restriction — show the link for manual sharing
        setInviteLink(data.inviteUrl);
        setInviteStatus("link_ready");
      } else {
        setInviteStatus("sent");
        showToast(`Invitation sent to ${trimmed}`);
        setTimeout(() => setInviteStatus("idle"), 2500);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send invitation.";
      setInviteStatus("error");
      setInviteError(msg);
      showToast(msg, "error");
      setTimeout(() => setInviteStatus("idle"), 3000);
    }
  }

  function activityCount(name: string) {
    return requests.filter((r) => r.submittedBy === name).length;
  }

  const isSending   = inviteStatus === "sending";
  const isSent      = inviteStatus === "sent";
  const isLinkReady = inviteStatus === "link_ready";

  function copyInviteLink() {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  }

  function dismissLink() {
    setInviteStatus("idle");
    setInviteLink("");
  }

  return (
    <>
      <ToastContainer />

      {/* Invite form */}
      <SettingsCard>
        <div className="px-5 py-4">
          <p className="text-sm font-medium text-[var(--color-text-primary)] mb-1">Invite member</p>
          <p className="text-xs text-[var(--color-text-muted)] mb-3">
            A real invitation email will be sent via Resend. Set{" "}
            <code className="text-[var(--color-brand)] text-[11px]">RESEND_API_KEY</code> in{" "}
            <code className="text-[var(--color-text-muted)] text-[11px]">.env.local</code> to enable delivery.
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                disabled={isSending}
                onChange={(e) => { setInviteEmail(e.target.value); setInviteError(""); setInviteStatus("idle"); }}
                onKeyDown={(e) => e.key === "Enter" && !isSending && handleInvite()}
                className={cn(
                  "w-full h-8 pl-8 pr-3 rounded-md border text-sm",
                  "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]",
                  "focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]",
                  "placeholder:text-[var(--color-text-muted)]",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  inviteError ? "border-[var(--color-danger)]" : "border-[var(--color-border-strong)]",
                )}
              />
            </div>
            <select
              value={inviteRole}
              disabled={isSending}
              onChange={(e) => setInviteRole(e.target.value as "admin" | "member" | "viewer")}
              className={cn(
                "h-8 px-2 rounded-md border border-[var(--color-border-strong)] text-sm",
                "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]",
                "focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
              <option value="viewer">Viewer</option>
            </select>
            <button
              onClick={handleInvite}
              disabled={isSending || isSent}
              aria-busy={isSending}
              className={cn(
                "h-8 px-4 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 min-w-[80px] justify-center",
                "disabled:cursor-not-allowed",
                isSent
                  ? "bg-[var(--color-success)] text-white"
                  : isSending
                  ? "bg-[var(--color-brand)]/70 text-white"
                  : "bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-hover)]",
              )}
            >
              {isSent ? (
                <><Check size={13} /> Sent!</>
              ) : isSending ? (
                <><Loader2 size={13} className="animate-spin" /> Sending…</>
              ) : isLinkReady ? (
                <><Link2 size={13} /> Link ready</>
              ) : (
                <><Plus size={13} /> Invite</>
              )}
            </button>
          </div>
          {inviteError && (
            <p className="text-[11px] text-[var(--color-danger)] mt-1.5">{inviteError}</p>
          )}

          {/* Manual share link — shown when Resend can't deliver to external addresses */}
          {isLinkReady && inviteLink && (
            <div className="mt-3 rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-xs font-medium text-[var(--color-text-primary)]">
                  Share this invite link manually
                </p>
                <button
                  onClick={dismissLink}
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] flex-shrink-0"
                  aria-label="Dismiss"
                >
                  <X size={13} />
                </button>
              </div>
              <p className="text-[11px] text-[var(--color-text-muted)] mb-2">
                Email delivery requires a verified domain in Resend. Copy the link below and send it directly.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-[11px] font-mono text-[var(--color-text-secondary)] bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded px-2 py-1.5 truncate">
                  {inviteLink}
                </code>
                <button
                  onClick={copyInviteLink}
                  className={cn(
                    "flex items-center gap-1.5 h-7 px-3 rounded-md text-xs font-medium flex-shrink-0 transition-colors",
                    linkCopied
                      ? "bg-[var(--color-success)]/10 text-[var(--color-success)]"
                      : "bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-hover)]",
                  )}
                >
                  {linkCopied ? <><Check size={11} /> Copied!</> : <><Copy size={11} /> Copy</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </SettingsCard>

      {/* Pending invites */}
      {pendingInvites.length > 0 && (
        <SettingsCard>
          <div className="px-5 py-3 border-b border-[var(--color-border-subtle)]">
            <p className="text-sm font-medium text-[var(--color-text-primary)] flex items-center gap-2">
              Pending invites
              <span className="text-xs font-normal text-[var(--color-text-muted)]">({pendingInvites.length})</span>
            </p>
          </div>
          {pendingInvites.map((inv: PendingInvite, i) => (
            <div
              key={inv.id}
              className={cn(
                "flex items-center gap-3 px-5 py-3",
                i < pendingInvites.length - 1 && "border-b border-[var(--color-border-subtle)]",
              )}
            >
              <div className="h-8 w-8 rounded-full flex items-center justify-center bg-[var(--color-bg-elevated)] border border-[var(--color-border-strong)] flex-shrink-0">
                <Mail size={13} className="text-[var(--color-text-muted)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--color-text-primary)] truncate">{inv.email}</p>
                <p className="text-xs text-[var(--color-text-muted)]">Sent {formatRelativeTime(inv.sentAt)}</p>
              </div>
              <RoleBadge role={inv.role} />
              <button
                onClick={() => removePendingInvite(inv.id)}
                className="ml-2 text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors"
                aria-label="Cancel invite"
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </SettingsCard>
      )}

      {/* Member list */}
      <SettingsCard>
        <div className="px-5 py-3 border-b border-[var(--color-border-subtle)]">
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            {members.length} {members.length === 1 ? "member" : "members"}
          </p>
        </div>
        {members.map((m, i) => {
          const isCurrentUser = m.id === currentUser.id;
          const count = activityCount(m.name);
          return (
            <div
              key={m.id}
              className={cn(
                "flex items-center gap-3 px-5 py-3",
                i < members.length - 1 && "border-b border-[var(--color-border-subtle)]",
              )}
            >
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ backgroundColor: m.avatarColor }}
              >
                {m.avatarInitials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm text-[var(--color-text-primary)]">{m.name}</p>
                  {isCurrentUser && (
                    <span className="text-[11px] text-[var(--color-text-muted)] bg-[var(--color-bg-elevated)] px-1.5 py-0.5 rounded-full border border-[var(--color-border-subtle)]">
                      you
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {m.email}
                  {count > 0 && (
                    <span className="ml-2">· {count} request{count !== 1 ? "s" : ""}</span>
                  )}
                </p>
              </div>
              {isCurrentUser ? (
                <RoleBadge role={m.role} />
              ) : (
                <RolePicker memberId={m.id} currentRole={m.role} />
              )}
              {!isCurrentUser && (
                <button
                  onClick={() => removeMember(m.id)}
                  className="ml-2 text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors"
                  aria-label={`Remove ${m.name}`}
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          );
        })}
      </SettingsCard>
    </>
  );
}

function RoleBadge({ role }: { role: "admin" | "member" | "viewer" }) {
  if (role === "admin") {
    return (
      <span
        className="text-[11px] px-2 py-0.5 rounded-full font-medium"
        style={{ backgroundColor: "var(--color-admin-badge-bg)", color: "var(--color-admin-badge-text)" }}
      >
        Admin
      </span>
    );
  }
  const styles = {
    member: "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]",
    viewer: "bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]",
  };
  return (
    <span className={cn("text-[11px] px-2 py-0.5 rounded-full font-medium border border-[var(--color-border-subtle)]", styles[role])}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
}

function RolePicker({ memberId, currentRole }: { memberId: string; currentRole: "admin" | "member" | "viewer" }) {
  const updateMemberRole = useAppStore((s) => s.updateMemberRole);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const ROLES = ["admin", "member", "viewer"] as const;
  const ROLE_DESC = {
    admin:  "Full access",
    member: "Can view & comment",
    viewer: "View only",
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium border border-[var(--color-border-subtle)]",
          "hover:opacity-80 transition-opacity cursor-pointer",
          currentRole === "member"
            ? "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]"
            : currentRole === "viewer"
            ? "bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]"
            : "",
        )}
        style={currentRole === "admin"
          ? { backgroundColor: "var(--color-admin-badge-bg)", color: "var(--color-admin-badge-text)" }
          : undefined
        }
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}
        <ChevronDown size={10} />
      </button>
      {open && (
        <div
          className={cn(
            "absolute right-0 top-7 z-30 min-w-[160px] rounded-lg border border-[var(--color-border-strong)]",
            "bg-[var(--color-bg-elevated)] shadow-xl py-1",
          )}
          role="listbox"
        >
          {ROLES.map((role) => (
            <button
              key={role}
              role="option"
              aria-selected={role === currentRole}
              onClick={() => { updateMemberRole(memberId, role); setOpen(false); }}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors",
                "hover:bg-[var(--color-bg-hover)]",
                role === currentRole ? "text-[var(--color-brand)]" : "text-[var(--color-text-secondary)]",
              )}
            >
              <span className="w-3 flex-shrink-0 flex items-center">
                {role === currentRole && <Check size={11} />}
              </span>
              <div>
                <p className="font-medium capitalize">{role}</p>
                <p className="text-[11px] text-[var(--color-text-muted)]">{ROLE_DESC[role]}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Notifications — Coming Soon ───────────────

const UPCOMING_NOTIFS = [
  { label: "New feature request",  description: "When someone submits a request to your team's inbox" },
  { label: "Mentions",             description: "When you're @mentioned in a comment"                 },
  { label: "Status changes",       description: "When a request or initiative changes status"         },
  { label: "Plan review requests", description: "When a quarterly plan is sent for your review"       },
  { label: "Weekly digest",        description: "Summary of activity across your teams"               },
];

function NotificationsComingSoon() {
  return (
    <div className="space-y-5">
      {/* Banner */}
      <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-6 py-8 text-center">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border-strong)] mb-4">
          <Bell size={20} className="text-[var(--color-text-muted)]" />
        </div>
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">
          Notifications — coming in v2
        </h3>
        <p className="text-xs text-[var(--color-text-muted)] max-w-xs mx-auto leading-relaxed">
          Email and in-app notification preferences will be configurable in the next version of Keel.
        </p>
        <span className="mt-4 inline-block text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] border border-[var(--color-border-subtle)] px-3 py-1 rounded-full">
          Coming soon
        </span>
      </div>

      {/* Grayed-out preview */}
      <SettingsCard className="opacity-40 pointer-events-none select-none">
        <div className="px-5 py-3 border-b border-[var(--color-border-subtle)]">
          <p className="text-sm font-medium text-[var(--color-text-primary)]">Email notifications</p>
        </div>
        {UPCOMING_NOTIFS.map((p, i) => (
          <SettingsRow key={p.label} label={p.label} description={p.description} last={i === UPCOMING_NOTIFS.length - 1}>
            <div className="h-5 w-9 rounded-full bg-[var(--color-border-strong)]" />
          </SettingsRow>
        ))}
      </SettingsCard>
    </div>
  );
}

// ── Integrations — Coming Soon ────────────────

const UPCOMING_INTEGRATIONS = [
  { name: "GitHub",        icon: GitBranch,    description: "Link PRs and commits to roadmap initiatives" },
  { name: "Slack",         icon: MessageSquare, description: "Post updates and review reminders to channels" },
  { name: "Jira",          icon: Link2,         description: "Sync epics and ideas from your Jira projects" },
  { name: "Linear",        icon: Link2,         description: "Import ideas and keep status in sync" },
];

function IntegrationsComingSoon() {
  return (
    <div className="space-y-5">
      {/* Banner */}
      <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-6 py-8 text-center">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border-strong)] mb-4">
          <Plug size={20} className="text-[var(--color-text-muted)]" />
        </div>
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">
          Integrations — coming in v2
        </h3>
        <p className="text-xs text-[var(--color-text-muted)] max-w-xs mx-auto leading-relaxed">
          Native connections to your existing tools are on the roadmap. You'll be notified when they're available.
        </p>
        <span className="mt-4 inline-block text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] border border-[var(--color-border-subtle)] px-3 py-1 rounded-full">
          Coming soon
        </span>
      </div>

      {/* Grayed-out preview cards */}
      <div className="space-y-2 opacity-40 pointer-events-none select-none">
        {UPCOMING_INTEGRATIONS.map((intg) => {
          const Icon = intg.icon;
          return (
            <SettingsCard key={intg.name}>
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] flex-shrink-0">
                  <Icon size={18} className="text-[var(--color-text-secondary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">{intg.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{intg.description}</p>
                </div>
                <div className="h-7 px-3 rounded-md text-xs font-medium border border-[var(--color-border-strong)] text-[var(--color-text-muted)] flex items-center">
                  Connect
                </div>
              </div>
            </SettingsCard>
          );
        })}
      </div>
    </div>
  );
}

// ── Appearance Section (commented out — v2) ──────────────────────────────────

/*
type Density = "comfortable" | "compact";

function AppearanceSection() {
  const { theme, setTheme } = useTheme();

  const [density, setDensityState] = useState<Density>(() => {
    if (typeof window === "undefined") return "comfortable";
    return (localStorage.getItem(DENSITY_KEY) as Density) ?? "comfortable";
  });

  const [saved, setSaved] = useState(false);

  function handleThemeSelect(t: "dark" | "light") {
    setTheme(t);
  }

  function handleDensitySelect(d: Density) {
    setDensityState(d);
    localStorage.setItem(DENSITY_KEY, d);
    document.documentElement.setAttribute("data-density", d);
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <SettingsCard>
        <div className="px-5 py-4 border-b border-[var(--color-border-subtle)]">
          <p className="text-sm font-medium text-[var(--color-text-primary)] mb-1">Theme</p>
          <p className="text-xs text-[var(--color-text-muted)] mb-3">Changes apply immediately across the workspace.</p>
          <div className="grid grid-cols-2 gap-2">
            {(["dark", "light"] as const).map((t) => (
              <button
                key={t}
                onClick={() => handleThemeSelect(t)}
                className={cn(
                  "relative flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors text-xs",
                  theme === t
                    ? "border-[var(--color-brand)] bg-[var(--color-brand-subtle)]"
                    : "border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)]",
                )}
                aria-pressed={theme === t}
              >
                <ThemePreview variant={t} />
                <span className="capitalize text-[var(--color-text-secondary)]">{t}</span>
                {theme === t && (
                  <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-brand)]">
                    <Check size={10} className="text-white" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <SettingsRow label="Density" description="Controls row height and spacing in lists and tables" last>
          <div className="flex items-center rounded-md overflow-hidden border border-[var(--color-border-strong)]">
            {(["comfortable", "compact"] as const).map((d) => (
              <button
                key={d}
                onClick={() => handleDensitySelect(d)}
                aria-pressed={density === d}
                className={cn(
                  "h-7 px-3 text-xs font-medium transition-colors",
                  density === d
                    ? "bg-[var(--color-brand)] text-white"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]",
                )}
              >
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
        </SettingsRow>
      </SettingsCard>

      <div className="flex justify-end">
        <SaveButton onClick={handleSave} saved={saved} />
      </div>
    </>
  );
}

function ThemePreview({ variant }: { variant: "dark" | "light" }) {
  const isDark = variant === "dark";
  return (
    <div
      className={cn(
        "w-full h-12 rounded overflow-hidden border",
        isDark
          ? "bg-[#1b1b1f] border-[#2c2c38]"
          : "bg-[#f7f7f8] border-[#e4e4ea]",
      )}
    >
      <div className="flex h-full">
        <div className={cn("w-6 h-full", isDark ? "bg-[#202027]" : "bg-[#ffffff]")}>
          {[0,1,2].map((i) => (
            <div
              key={i}
              className={cn("mx-1 mt-1 h-1 rounded-full", isDark ? "bg-[#2c2c38]" : "bg-[#e4e4ea]")}
            />
          ))}
        </div>
        <div className="flex-1 p-1 space-y-0.5">
          {[0,1,2,3].map((i) => (
            <div
              key={i}
              className={cn("h-1 rounded-full", isDark ? "bg-[#2c2c38]" : "bg-[#e4e4ea]")}
              style={{ width: `${60 + i * 8}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
*/
