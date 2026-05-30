"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ScoringFramework } from "@/types";

// ─────────────────────────────────────────────
// Workflow store — single-user linear workflow state.
// Tracks sticky flags and framework selection.
// All stage statuses are DERIVED (see src/lib/workflow.ts).
// ─────────────────────────────────────────────

interface WorkflowState {
  inboxCompleted:    boolean;
  scoringStarted:    boolean;
  selectedFramework: ScoringFramework | null;

  setInboxCompleted:    () => void;
  startScoring:         (framework: ScoringFramework) => void;
  resetPrioritization:  () => void;
  reset:                () => void;
}

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set) => ({
      inboxCompleted:    false,
      scoringStarted:    false,
      selectedFramework: null,

      setInboxCompleted: () =>
        set((s) => s.inboxCompleted ? s : { inboxCompleted: true }),

      startScoring: (framework) =>
        set({ scoringStarted: true, selectedFramework: framework }),

      resetPrioritization: () =>
        set({ scoringStarted: false, selectedFramework: null }),

      reset: () =>
        set({ inboxCompleted: false, scoringStarted: false, selectedFramework: null }),
    }),
    {
      name: "keel-workflow",
      version: 1,
    },
  ),
);
