"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { temporal } from "zundo";
import type {
  QuarterlyPlan,
  RoadmapItem,
  QuarterRef,
  QuarterlyGoal,
  PlanReviewer,
  PlanStatus,
  CapacityConfig,
} from "@/types";
// import { SEED_PLAN, SEED_PLAN_HITCHHIKER, SEED_PLAN_Q3, SEED_PLAN_HH_Q3, SEED_PLAN_Q4, SEED_PLAN_HH_Q4 } from "@/lib/seed";

// ─────────────────────────────────────────────
// Roadmap store — quarterly plan management.
// undo/redo via zundo temporal middleware.
// ─────────────────────────────────────────────

interface RoadmapState {
  plans: QuarterlyPlan[];
  activePlanId: string | null;
  selectedQuarter: QuarterRef | null;

  setActivePlan: (id: string) => void;
  addPlan: (plan: QuarterlyPlan) => void;
  updatePlan: (id: string, patch: Partial<QuarterlyPlan>) => void;
  setPlanStatus: (id: string, status: PlanStatus) => void;
  lockPlan: (id: string, userId: string) => void;
  addItemToPlan: (planId: string, item: RoadmapItem) => void;
  removeItemFromPlan: (planId: string, itemId: string) => void;
  updateItemInPlan: (planId: string, itemId: string, patch: Partial<RoadmapItem>) => void;
  moveItemToQuarter: (planId: string, itemId: string, quarter: QuarterRef) => void;
  addGoal: (planId: string, goal: QuarterlyGoal) => void;
  updateGoal: (planId: string, goalId: string, patch: Partial<QuarterlyGoal>) => void;
  removeGoal: (planId: string, goalId: string) => void;
  updateCapacity: (planId: string, patch: Partial<CapacityConfig>) => void;
  addReviewer: (planId: string, reviewer: PlanReviewer) => void;
  removeReviewer: (planId: string, userId: string) => void;
  submitReview: (planId: string, userId: string, decision: PlanReviewer["decision"], comment: string | null) => void;
  setSelectedQuarter: (q: QuarterRef | null) => void;
}

function recomputeCommitted(plan: QuarterlyPlan): number {
  return plan.items.reduce((sum, item) => sum + (item.effort.points ?? 0), 0);
}

export const useRoadmapStore = create<RoadmapState>()(
  temporal(
    persist<RoadmapState, [], [], Pick<RoadmapState, "plans" | "activePlanId">>(
      (set) => ({
        plans: [],
        activePlanId: null,
        selectedQuarter: null,

      setActivePlan: (id) => set({ activePlanId: id }),

      addPlan: (plan) =>
        set((s) => ({ plans: [...s.plans, plan], activePlanId: plan.id })),

      updatePlan: (id, patch) =>
        set((s) => ({
          plans: s.plans.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),

      setPlanStatus: (id, status) =>
        set((s) => ({
          plans: s.plans.map((p) =>
            p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p,
          ),
        })),

      lockPlan: (id, userId) =>
        set((s) => ({
          plans: s.plans.map((p) =>
            p.id === id
              ? { ...p, status: "locked" as PlanStatus, lockedAt: new Date().toISOString(), lockedBy: userId }
              : p,
          ),
        })),

      addItemToPlan: (planId, item) =>
        set((s) => ({
          plans: s.plans.map((p) => {
            if (p.id !== planId) return p;
            const items = [...p.items, item];
            return { ...p, items, capacity: { ...p.capacity, committed: recomputeCommitted({ ...p, items }) } };
          }),
        })),

      removeItemFromPlan: (planId, itemId) =>
        set((s) => ({
          plans: s.plans.map((p) => {
            if (p.id !== planId) return p;
            const items = p.items.filter((i) => i.id !== itemId);
            return { ...p, items, capacity: { ...p.capacity, committed: recomputeCommitted({ ...p, items }) } };
          }),
        })),

      updateItemInPlan: (planId, itemId, patch) =>
        set((s) => ({
          plans: s.plans.map((p) => {
            if (p.id !== planId) return p;
            const items = p.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i));
            return { ...p, items, capacity: { ...p.capacity, committed: recomputeCommitted({ ...p, items }) } };
          }),
        })),

      moveItemToQuarter: (planId, itemId, quarter) =>
        set((s) => ({
          plans: s.plans.map((p) =>
            p.id !== planId
              ? p
              : { ...p, items: p.items.map((i) => (i.id === itemId ? { ...i, quarter } : i)) },
          ),
        })),

      addGoal: (planId, goal) =>
        set((s) => ({
          plans: s.plans.map((p) =>
            p.id === planId ? { ...p, goals: [...p.goals, goal] } : p,
          ),
        })),

      updateGoal: (planId, goalId, patch) =>
        set((s) => ({
          plans: s.plans.map((p) =>
            p.id !== planId
              ? p
              : { ...p, goals: p.goals.map((g) => (g.id === goalId ? { ...g, ...patch } : g)) },
          ),
        })),

      removeGoal: (planId, goalId) =>
        set((s) => ({
          plans: s.plans.map((p) =>
            p.id !== planId ? p : { ...p, goals: p.goals.filter((g) => g.id !== goalId) },
          ),
        })),

      updateCapacity: (planId, patch) =>
        set((s) => ({
          plans: s.plans.map((p) =>
            p.id !== planId ? p : { ...p, capacity: { ...p.capacity, ...patch } },
          ),
        })),

      addReviewer: (planId, reviewer) =>
        set((s) => ({
          plans: s.plans.map((p) =>
            p.id !== planId ? p : { ...p, reviewers: [...p.reviewers, reviewer] },
          ),
        })),

      removeReviewer: (planId, userId) =>
        set((s) => ({
          plans: s.plans.map((p) =>
            p.id !== planId
              ? p
              : { ...p, reviewers: p.reviewers.filter((r) => r.userId !== userId) },
          ),
        })),

      submitReview: (planId, userId, decision, comment) =>
        set((s) => ({
          plans: s.plans.map((p) =>
            p.id !== planId
              ? p
              : {
                  ...p,
                  reviewers: p.reviewers.map((r) =>
                    r.userId !== userId
                      ? r
                      : { ...r, decision, comment, reviewedAt: new Date().toISOString() },
                  ),
                },
          ),
        })),

      setSelectedQuarter: (q) => set({ selectedQuarter: q }),
      }),
      {
        name: "keel-roadmap",
        version: 3,
        partialize: (s) => ({ plans: s.plans, activePlanId: s.activePlanId }),
      },
    ) as any,
    {
      limit: 50,
      partialize: (s) => ({ plans: s.plans }),
    },
  ),
);

// ── Derived selectors ──────────────────────

export function selectActivePlan(state: RoadmapState): QuarterlyPlan | null {
  if (!state.activePlanId) return null;
  return state.plans.find((p) => p.id === state.activePlanId) ?? null;
}

export function selectCapacityPercent(plan: QuarterlyPlan): number {
  if (plan.capacity.total === 0) return 0;
  return Math.min(Math.round((plan.capacity.committed / plan.capacity.total) * 100), 100);
}

export function selectAllApproved(plan: QuarterlyPlan): boolean {
  return (
    plan.reviewers.length > 0 &&
    plan.reviewers.every((r) => !r.required || r.decision === "approved")
  );
}
