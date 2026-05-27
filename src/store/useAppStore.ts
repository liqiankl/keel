"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Workspace, WorkspaceMember, ViewMode, FilterTab } from "@/types";
import { DEMO_WORKSPACE } from "@/lib/constants";

export interface WorkspaceTag {
  id: string;
  name: string;   // display label, used as the string value on requests
  color: string;  // hex
}

export interface PendingInvite {
  id: string;
  email: string;
  role: "admin" | "member" | "viewer";
  sentAt: string; // ISO string
}

const SEED_MEMBERS: WorkspaceMember[] = [
  { id: "u_pm_01", name: "Alex Chen",    email: "alex@keel.so",    avatarUrl: null, avatarInitials: "AC", avatarColor: "#5e5ce6", role: "admin"  },
  { id: "u_pm_02", name: "Sam Rivera",   email: "sam@keel.so",     avatarUrl: null, avatarInitials: "SR", avatarColor: "#30a46c", role: "member" },
  { id: "u_pm_03", name: "Jordan Park",  email: "jordan@keel.so",  avatarUrl: null, avatarInitials: "JP", avatarColor: "#f97316", role: "member" },
  { id: "u_pm_04", name: "Casey Morgan", email: "casey@keel.so",   avatarUrl: null, avatarInitials: "CM", avatarColor: "#8b5cf6", role: "viewer" },
];

// ─────────────────────────────────────────────
// App-level store — workspace, UI preferences,
// active navigation state. Not history-tracked
// (these are preferences, not planning data).
// ─────────────────────────────────────────────

interface AppState {
  workspace: Workspace;
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  activeTeamId: string;
  viewMode: ViewMode;
  activeFilterTab: FilterTab;
  commandPaletteOpen: boolean;
  workspaceTags: WorkspaceTag[];

  pendingInvites: PendingInvite[];

  setWorkspace: (ws: Workspace) => void;
  updateWorkspace: (patch: Partial<Pick<Workspace, "name" | "slug" | "avatarColor">>) => void;
  updateCurrentUser: (patch: Partial<Pick<WorkspaceMember, "name" | "avatarColor" | "email">>) => void;
  addMember: (member: Omit<WorkspaceMember, "avatarUrl" | "avatarInitials"> & { avatarUrl?: string | null }) => void;
  removeMember: (id: string) => void;
  updateMemberRole: (id: string, role: WorkspaceMember["role"]) => void;
  addPendingInvite: (invite: Omit<PendingInvite, "id">) => void;
  removePendingInvite: (id: string) => void;
  phasesActed: string[];
  markPhaseActed: (key: string) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  setActiveTeamId: (id: string) => void;
  setViewMode: (mode: ViewMode) => void;
  setActiveFilterTab: (tab: FilterTab) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  addWorkspaceTag: (tag: Omit<WorkspaceTag, "id">) => void;
  updateWorkspaceTag: (id: string, patch: Partial<Omit<WorkspaceTag, "id">>) => void;
  removeWorkspaceTag: (id: string) => void;
}

const SEED_WORKSPACE_TAGS: WorkspaceTag[] = [
  { id: "wt_01", name: "triage",          color: "#e5484d" },
  { id: "wt_02", name: "inbox",           color: "#5e5ce6" },
  { id: "wt_03", name: "roadmap",         color: "#3b82f6" },
  { id: "wt_04", name: "scoring",         color: "#8b5cf6" },
  { id: "wt_05", name: "planning",        color: "#f97316" },
  { id: "wt_06", name: "ux",             color: "#ec4899" },
  { id: "wt_07", name: "automation",      color: "#14b8a6" },
  { id: "wt_08", name: "integrations",    color: "#30a46c" },
  { id: "wt_09", name: "frontend",        color: "#f5a623" },
  { id: "wt_10", name: "backend",         color: "#6366f1" },
  { id: "wt_11", name: "api",            color: "#0ea5e9" },
  { id: "wt_12", name: "sre",            color: "#f43f5e" },
  { id: "wt_13", name: "compliance",      color: "#a16207" },
  { id: "wt_14", name: "migration",       color: "#7c3aed" },
  { id: "wt_15", name: "workbench",       color: "#059669" },
];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      workspace: {
        ...DEMO_WORKSPACE,
        members: SEED_MEMBERS,
      },
      pendingInvites: [],
      phasesActed: [],
      sidebarCollapsed: false,
      mobileSidebarOpen: false,
      activeTeamId: "team_navigators",
      viewMode: "list",
      activeFilterTab: "active",
      commandPaletteOpen: false,
      workspaceTags: SEED_WORKSPACE_TAGS,

      setWorkspace: (ws) => set({ workspace: ws }),

      updateWorkspace: (patch) =>
        set((s) => ({ workspace: { ...s.workspace, ...patch } })),

      addMember: (member) =>
        set((s) => {
          const parts = member.name.trim().split(/\s+/);
          const initials = parts.length >= 2
            ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
            : parts[0].slice(0, 2).toUpperCase();
          const newMember: WorkspaceMember = {
            ...member,
            avatarUrl: member.avatarUrl ?? null,
            avatarInitials: initials,
          };
          return { workspace: { ...s.workspace, members: [...s.workspace.members, newMember] } };
        }),

      removeMember: (id) =>
        set((s) => ({
          workspace: {
            ...s.workspace,
            members: s.workspace.members.filter((m) => m.id !== id),
          },
        })),

      updateMemberRole: (id, role) =>
        set((s) => ({
          workspace: {
            ...s.workspace,
            members: s.workspace.members.map((m) => m.id === id ? { ...m, role } : m),
          },
        })),

      addPendingInvite: (invite) =>
        set((s) => ({
          pendingInvites: [...s.pendingInvites, { ...invite, id: `inv_${Date.now()}` }],
        })),

      removePendingInvite: (id) =>
        set((s) => ({
          pendingInvites: s.pendingInvites.filter((i) => i.id !== id),
        })),

      updateCurrentUser: (patch) =>
        set((s) => {
          const updated = { ...s.workspace.currentUser, ...patch };
          // Auto-recompute initials from name if name changed
          if (patch.name) {
            const parts = patch.name.trim().split(/\s+/);
            updated.avatarInitials = parts.length >= 2
              ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
              : parts[0].slice(0, 2).toUpperCase();
          }
          return {
            workspace: {
              ...s.workspace,
              currentUser: updated,
              members: s.workspace.members.map((m) =>
                m.id === updated.id ? updated : m,
              ),
            },
          };
        }),
      markPhaseActed: (key) =>
        set((s) =>
          s.phasesActed.includes(key) ? s : { phasesActed: [...s.phasesActed, key] },
        ),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      openMobileSidebar:  () => set({ mobileSidebarOpen: true }),
      closeMobileSidebar: () => set({ mobileSidebarOpen: false }),
      setActiveTeamId: (id) => set({ activeTeamId: id }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setActiveFilterTab: (tab) => set({ activeFilterTab: tab }),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

      addWorkspaceTag: (tag) =>
        set((s) => ({
          workspaceTags: [
            ...s.workspaceTags,
            { ...tag, id: `wt_${Date.now()}` },
          ],
        })),

      updateWorkspaceTag: (id, patch) =>
        set((s) => ({
          workspaceTags: s.workspaceTags.map((t) =>
            t.id === id ? { ...t, ...patch } : t,
          ),
        })),

      removeWorkspaceTag: (id) =>
        set((s) => ({
          workspaceTags: s.workspaceTags.filter((t) => t.id !== id),
        })),
    }),
    {
      name: "keel-app-preferences",
      version: 2,
      partialize: (s) => ({
        phasesActed: s.phasesActed,
        sidebarCollapsed: s.sidebarCollapsed,
        viewMode: s.viewMode,
        activeTeamId: s.activeTeamId,
        workspaceTags: s.workspaceTags,
        workspace: s.workspace,
        pendingInvites: s.pendingInvites,
      }),
    },
  ),
);
