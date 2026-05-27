"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type HiddenField = "effort" | "scores";

export interface ShareableView {
  id: string;
  planId: string;
  planLabel: string;
  token: string;
  url: string;
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
