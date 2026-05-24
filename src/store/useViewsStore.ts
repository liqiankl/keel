"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─────────────────────────────────────────────
// Views store — shareable read-only roadmap
// links (User Story 5.2: Shareable Roadmap Views).
// ─────────────────────────────────────────────

export type HiddenField = "effort" | "scores";

export interface ShareableView {
  id: string;
  planId: string;
  planLabel: string;     // "Q2 2026 Plan"
  token: string;         // route param: /share/[token]
  url: string;           // full URL: origin/share/[token]
  passwordProtected: boolean;
  password: string | null;
  hiddenFields: HiddenField[];
  createdAt: string;
  createdBy: string;
  revokedAt: string | null;
}

interface ViewsState {
  views: ShareableView[];
  createView: (view: ShareableView) => void;
  revokeView: (id: string) => void;
  restoreView: (id: string) => void;
  deleteView: (id: string) => void;
}

export function findViewByToken(views: ShareableView[], token: string): ShareableView | undefined {
  return views.find((v) => v.token === token);
}

export const useViewsStore = create<ViewsState>()(
  persist(
    (set) => ({
      views: [],

      createView: (view) =>
        set((s) => ({ views: [view, ...s.views] })),

      revokeView: (id) =>
        set((s) => ({
          views: s.views.map((v) =>
            v.id === id ? { ...v, revokedAt: new Date().toISOString() } : v,
          ),
        })),

      restoreView: (id) =>
        set((s) => ({
          views: s.views.map((v) =>
            v.id === id ? { ...v, revokedAt: null } : v,
          ),
        })),

      deleteView: (id) =>
        set((s) => ({ views: s.views.filter((v) => v.id !== id) })),
    }),
    { name: "keel-views" },
  ),
);
