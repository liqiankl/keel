"use client";

import { create } from "zustand";
import { temporal } from "zundo";
import type {
  RoadmapItem,
  PrioritizationScore,
  ScoringFramework,
  RICEScore,
  WSJFScore,
  MoSCoWLabel,
  CustomScore,
  CustomDimension,
} from "@/types";
import { SEED_INITIATIVES } from "@/lib/seed";

// ─────────────────────────────────────────────
// Scoring store — initiative scoring.
// undo/redo via zundo temporal middleware.
// ─────────────────────────────────────────────

interface ScoringState {
  initiatives: RoadmapItem[];
  activeFramework: ScoringFramework;
  customDimensions: CustomDimension[];
  sortColumn: string | null;
  sortDirection: "asc" | "desc";
  editingCell: { initiativeId: string; column: string } | null;

  setActiveFramework: (f: ScoringFramework) => void;
  updateRICE: (id: string, patch: Partial<RICEScore>) => void;
  updateMoSCoW: (id: string, label: MoSCoWLabel) => void;
  updateWSJF: (id: string, patch: Partial<WSJFScore>) => void;
  addCustomDimension: (dim: CustomDimension) => void;
  removeCustomDimension: (dimId: string) => void;
  updateCustomScore: (id: string, dimId: string, value: number) => void;
  addInitiative: (item: RoadmapItem) => void;
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

function computeCustom(dims: CustomDimension[], values: Record<string, number>): number {
  const totalWeight = dims.reduce((s, d) => s + d.weight, 0);
  if (totalWeight === 0) return 0;
  const weighted = dims.reduce(
    (s, d) => s + ((values[d.id] ?? 0) / d.scale) * d.weight,
    0,
  );
  return Math.round((weighted / totalWeight) * 100) / 100;
}

function patchScore(item: RoadmapItem, patch: Partial<PrioritizationScore>): RoadmapItem {
  const prev = item.score;
  const updated: PrioritizationScore = {
    initiativeId: item.id,
    framework: "rice",
    rice: null,
    moscow: null,
    wsjf: null,
    custom: null,
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
    (set, get) => ({
      initiatives: SEED_INITIATIVES,
      activeFramework: "rice",
      customDimensions: [],
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

      addCustomDimension: (dim) =>
        set((s) => ({ customDimensions: [...s.customDimensions, dim] })),

      removeCustomDimension: (dimId) =>
        set((s) => ({ customDimensions: s.customDimensions.filter((d) => d.id !== dimId) })),

      updateCustomScore: (id, dimId, value) =>
        set((s) => ({
          initiatives: s.initiatives.map((item) => {
            if (item.id !== id) return item;
            const prev = item.score?.custom ?? { dimensions: {}, score: 0 };
            const next: CustomScore = {
              ...prev,
              dimensions: { ...prev.dimensions, [dimId]: value },
            };
            next.score = computeCustom(s.customDimensions, next.dimensions);
            return patchScore(item, { custom: next, framework: "custom" });
          }),
        })),

      addInitiative: (item) =>
        set((s) => ({ initiatives: [...s.initiatives, item] })),

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
      limit: 100,
      partialize: (s) => ({ initiatives: s.initiatives, customDimensions: s.customDimensions }),
    },
  ),
);
