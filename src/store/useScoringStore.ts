"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { temporal } from "zundo";
import type {
  RoadmapItem,
  PrioritizationScore,
  ScoringFramework,
  RICEScore,
  WSJFScore,
  MoSCoWLabel,
} from "@/types";
// import { SEED_INITIATIVES } from "@/lib/seed";

// ─────────────────────────────────────────────
// Scoring store — initiative scoring.
// undo/redo via zundo temporal middleware.
// ─────────────────────────────────────────────

interface ScoringState {
  initiatives: RoadmapItem[];
  activeFramework: ScoringFramework;
  sortColumn: string | null;
  sortDirection: "asc" | "desc";
  editingCell: { initiativeId: string; column: string } | null;

  setActiveFramework: (f: ScoringFramework) => void;
  updateRICE: (id: string, patch: Partial<RICEScore>) => void;
  updateMoSCoW: (id: string, label: MoSCoWLabel) => void;
  updateWSJF: (id: string, patch: Partial<WSJFScore>) => void;
  updateEffort: (id: string, points: number | null) => void;
  updateGoals: (id: string, goalIds: string[]) => void;
  updateGoalNotes: (id: string, notes: string) => void;
  addInitiative: (item: RoadmapItem) => void;
  removeInitiative: (id: string) => void;
  clearMoSCoW: (id: string) => void;
  setManualRank: (id: string, rank: number, reason: string) => void;
  setSortColumn: (col: string | null) => void;
  toggleSortDirection: () => void;
  setEditingCell: (cell: { initiativeId: string; column: string } | null) => void;
}

function computeRICE(r: Partial<RICEScore>): number {
  if (r.reach == null || r.impact == null || r.confidence == null || r.effort == null) return 0;
  if (r.effort === 0) return 0;
  return Math.round((r.reach * r.impact * (r.confidence / 100)) / r.effort);
}

function computeWSJF(w: Partial<WSJFScore>): number {
  if (w.costOfDelay == null || w.jobSize == null || w.jobSize === 0) return 0;
  return Math.round((w.costOfDelay / w.jobSize) * 100) / 100;
}

function patchScore(item: RoadmapItem, patch: Partial<PrioritizationScore>): RoadmapItem {
  const prev = item.score;
  const updated: PrioritizationScore = {
    initiativeId: item.id,
    framework: "rice",
    rice: null,
    moscow: null,
    wsjf: null,
    manualRankOverride: null,
    overrideReason: null,
    scoredAt: new Date().toISOString(),
    scoredBy: "u_pm_01",
    history: [],
    ...prev,
    ...patch,
  };
  return { ...item, score: updated };
}

export const useScoringStore = create<ScoringState>()(
  temporal(
    persist<ScoringState, [], [], Pick<ScoringState, "initiatives" | "activeFramework" | "sortColumn" | "sortDirection">>(
      (set, get) => ({
        initiatives: [],
        activeFramework: "rice",
        sortColumn: null,
        sortDirection: "desc",
        editingCell: null,

      setActiveFramework: (f) => set({ activeFramework: f }),

      updateRICE: (id, patch) =>
        set((s) => ({
          initiatives: s.initiatives.map((item) => {
            if (item.id !== id) return item;
            const prev = item.score?.rice ?? {};
            const next: RICEScore = { reach: 0, impact: 1, confidence: 100, effort: 1, score: 0, ...prev, ...patch };
            next.score = computeRICE(next);
            return patchScore(item, { rice: next, framework: "rice" });
          }),
        })),

      updateMoSCoW: (id, label) =>
        set((s) => ({
          initiatives: s.initiatives.map((item) =>
            item.id !== id ? item : patchScore(item, { moscow: label, framework: "moscow" }),
          ),
        })),

      updateWSJF: (id, patch) =>
        set((s) => ({
          initiatives: s.initiatives.map((item) => {
            if (item.id !== id) return item;
            const prev = item.score?.wsjf ?? {};
            const next: WSJFScore = { costOfDelay: 0, jobSize: 1, score: 0, ...prev, ...patch };
            next.score = computeWSJF(next);
            return patchScore(item, { wsjf: next, framework: "wsjf" });
          }),
        })),

      updateEffort: (id, points) =>
        set((s) => ({
          initiatives: s.initiatives.map((item) =>
            item.id !== id ? item : { ...item, effort: { ...item.effort, points } },
          ),
        })),

      updateGoals: (id, goalIds) =>
        set((s) => ({
          initiatives: s.initiatives.map((item) =>
            item.id !== id ? item : { ...item, goalIds },
          ),
        })),

      updateGoalNotes: (id, notes) =>
        set((s) => ({
          initiatives: s.initiatives.map((item) =>
            item.id !== id ? item : { ...item, goalNotes: notes },
          ),
        })),

      addInitiative: (item) =>
        set((s) => ({ initiatives: [...s.initiatives, item] })),

      removeInitiative: (id) =>
        set((s) => ({ initiatives: s.initiatives.filter((i) => i.id !== id) })),

      clearMoSCoW: (id) =>
        set((s) => ({
          initiatives: s.initiatives.map((item) =>
            item.id !== id ? item : patchScore(item, { moscow: null }),
          ),
        })),

      setManualRank: (id, rank, reason) =>
        set((s) => ({
          initiatives: s.initiatives.map((item) =>
            item.id !== id ? item : patchScore(item, { manualRankOverride: rank, overrideReason: reason }),
          ),
        })),

      setSortColumn: (col) => set({ sortColumn: col }),
      toggleSortDirection: () =>
        set((s) => ({ sortDirection: s.sortDirection === "asc" ? "desc" : "asc" })),
      setEditingCell: (cell) => set({ editingCell: cell }),
    }),
    {
      name: "keel-scoring",
      version: 4,
      partialize: (s) => ({
        initiatives: s.initiatives,
        activeFramework: s.activeFramework,
        sortColumn: s.sortColumn,
        sortDirection: s.sortDirection,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.initiatives = state.initiatives.map(
            (i) => i.teamId ? i : { ...i, teamId: "team_navigators" },
          );
        }
      },
    },
  ) as any,
  {
    limit: 100,
    partialize: (s) => ({ initiatives: s.initiatives }),
  },
  ),
);
