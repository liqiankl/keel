"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Workspace, ViewMode, FilterTab } from "@/types";
import { DEMO_WORKSPACE } from "@/lib/constants";

// ─────────────────────────────────────────────
// App-level store — workspace, UI preferences,
// active navigation state. Not history-tracked
// (these are preferences, not planning data).
// ─────────────────────────────────────────────

interface AppState {
  workspace: Workspace;
  sidebarCollapsed: boolean;
  activeTeamId: string;
  viewMode: ViewMode;
  activeFilterTab: FilterTab;
  commandPaletteOpen: boolean;

  setWorkspace: (ws: Workspace) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  setActiveTeamId: (id: string) => void;
  setViewMode: (mode: ViewMode) => void;
  setActiveFilterTab: (tab: FilterTab) => void;
  setCommandPaletteOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      workspace: {
        ...DEMO_WORKSPACE,
        members: [DEMO_WORKSPACE.currentUser],
      },
      sidebarCollapsed: false,
      activeTeamId: "team_keel",
      viewMode: "list",
      activeFilterTab: "active",
      commandPaletteOpen: false,

      setWorkspace: (ws) => set({ workspace: ws }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      setActiveTeamId: (id) => set({ activeTeamId: id }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setActiveFilterTab: (tab) => set({ activeFilterTab: tab }),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
    }),
    {
      name: "keel-app-preferences",
      partialize: (s) => ({
        sidebarCollapsed: s.sidebarCollapsed,
        viewMode: s.viewMode,
        activeTeamId: s.activeTeamId,
      }),
    },
  ),
);
