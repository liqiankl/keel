# Keel — State Management

## Overview

All state is managed by **Zustand 5** with **zundo 2** temporal middleware for undo/redo. There is no backend — data lives in memory and resets on page refresh (except UI preferences, which persist to `localStorage`).

---

## Stores

| Store | File | Undo/Redo | Persisted |
|---|---|---|---|
| `useInboxStore` | `src/store/useInboxStore.ts` | ✅ | ❌ |
| `useScoringStore` | `src/store/useScoringStore.ts` | ✅ | ❌ |
| `useRoadmapStore` | `src/store/useRoadmapStore.ts` | ✅ | ❌ |
| `useAppStore` | `src/store/useAppStore.ts` | ❌ | ✅ localStorage |

---

## Store Creation Pattern

All three data stores wrap their state creator with `temporal` from zundo:

```typescript
import { create } from "zustand";
import { temporal } from "zundo";

export const useInboxStore = create<InboxState>()(
  temporal(
    (set, get) => ({
      // initial state
      requests: SEED_REQUESTS,
      filters: DEFAULT_FILTERS,
      selectedIds: [],

      // actions
      addRequest: (req) => set((s) => ({ requests: [req, ...s.requests] })),
      setStatus: (id, status) =>
        set((s) => ({
          requests: s.requests.map((r) => r.id === id ? { ...r, status } : r),
        })),
    }),
    {
      limit: 50,
      // Only include data fields in history — never UI state
      partialize: (s) => ({ requests: s.requests }),
    },
  ),
);
```

### `partialize` — what goes in history

Only mutations to **domain data** should be tracked. Exclude all UI state:

| ✅ Include | ❌ Exclude |
|---|---|
| `requests` | `filters` |
| `initiatives` | `selectedIds` |
| `customDimensions` | `focusedId` |
| `plans` | `editingCell` |
| | `sortColumn` / `sortDirection` |
| | `activePlanId` |

---

## Accessing Undo/Redo in Components

```typescript
import { useStore } from "zustand";

// Inside a component:
const temporal = useStore(useInboxStore.temporal);

// Use:
temporal.undo();
temporal.redo();
temporal.clear();           // wipe history
temporal.pastStates;        // array of past snapshots
temporal.futureStates;      // array of future snapshots
```

---

## ⚠️ Critical: Selector Stability (Zustand 5 + React 19)

**The most important gotcha in this codebase.**

Zustand 5 uses React's `useSyncExternalStore` internally. React requires that `getSnapshot` returns a **stable reference** when the underlying data has not changed. If a selector always creates a new array (via `.filter()`, `.map()`, etc.), React detects a "torn" snapshot and enters an infinite render loop:

```
Error: Maximum update depth exceeded.
Warning: The result of getSnapshot should be cached to avoid an infinite loop.
```

### ❌ Broken pattern

```typescript
// selectFilteredRequests calls requests.filter(...) → always new array ref
const filtered = useInboxStore(selectFilteredRequests);
```

### ✅ Correct pattern

Use the store's already-subscribed state as input to `useMemo`. The component re-renders when `requests` or `filters` change (because of the top-level `useInboxStore()` call), and `useMemo` recomputes then — returning a stable reference between renders.

```typescript
// Subscribe to raw state at the top level
const { requests, filters } = useInboxStore();

// Derive the filtered list with useMemo — stable reference when inputs unchanged
const filtered = useMemo(
  () => selectFilteredRequests({ requests, filters }),
  [requests, filters],
);
```

### Rule of thumb

| Selector returns | Safe to use with `useStore(selector)`? |
|---|---|
| Primitive (`string`, `number`, `boolean`) | ✅ Yes |
| Direct state reference (`state.requests` — same array) | ✅ Yes |
| New array (`state.requests.filter(...)`) | ❌ No — use `useMemo` |
| New object (`{ ...state.x }`) | ❌ No — use `useMemo` |

---

## useInboxStore

**Purpose:** Feature requests (inbox), triage, filtering, bulk selection.

### State shape

```typescript
interface InboxState {
  requests: FeatureRequest[];
  filters: {
    tab: FilterTab;           // "active" | "all" | "new" | "triaged" | "archived"
    search: string;
    tags: string[];
    productArea: string | null;
    source: string | null;
  };
  selectedIds: string[];
  focusedId: string | null;

  // Actions
  addRequest, updateRequest, removeRequest, mergeRequests,
  setStatus, bulkSetStatus, setTags, bulkAddTag,
  toggleSelectId, selectAll, clearSelection, setFocusedId,
  setFilter, resetFilters,
}
```

### Exported selector

```typescript
// Accepts Pick<InboxState, "requests" | "filters"> — safe to call from useMemo
export function selectFilteredRequests(
  state: Pick<InboxState, "requests" | "filters">
): FeatureRequest[]
```

### FilterTab — all five values must be handled

`"active" | "all" | "new" | "triaged" | "archived"` — every switch statement on `FilterTab` must have a case for `"all"` and a `default`, or TypeScript will report a missing return path.

---

## useScoringStore

**Purpose:** Initiative scoring across RICE, MoSCoW, WSJF, and Custom frameworks.

### State shape

```typescript
interface ScoringState {
  initiatives: RoadmapItem[];
  activeFramework: ScoringFramework;    // "rice"|"moscow"|"wsjf"|"custom"
  customDimensions: CustomDimension[];
  sortColumn: string | null;
  sortDirection: "asc" | "desc";
  editingCell: { initiativeId: string; column: string } | null;

  // Actions
  setActiveFramework,
  updateRICE,       // patch: Partial<RICEScore>
  updateMoSCoW,     // label: MoSCoWLabel
  updateWSJF,       // patch: Partial<WSJFScore>
  addCustomDimension, removeCustomDimension,
  updateCustomScore,  // (id, dimId, value)
  setManualRank,
  setSortColumn, toggleSortDirection,
  setEditingCell,
}
```

### Score computation (inside store, not in components)

```typescript
// RICE: (reach × impact × confidence%) / effort
computeRICE({ reach, impact, confidence, effort }) → number

// WSJF: costOfDelay / jobSize
computeWSJF({ costOfDelay, jobSize }) → number

// Custom: weighted average normalized to dimension scale
computeCustom(dims, values) → number  // 0.0–1.0 range
```

Scores are recomputed inside the store's `updateRICE` / `updateWSJF` / `updateCustomScore` actions — never in the UI. The UI only calls the action with the raw input value.

### Impact values (RICE)

RICE impact is not a free number — it must be one of: `0.25 | 0.5 | 1 | 2 | 3`. The scoring table uses a `<select>` for this column, not a free-text input.

---

## useRoadmapStore

**Purpose:** Quarterly plans, initiative lifecycle, capacity, reviewer approvals.

### State shape

```typescript
interface RoadmapState {
  plans: QuarterlyPlan[];
  activePlanId: string | null;
  selectedQuarter: QuarterRef | null;

  // Plan operations
  setActivePlan, addPlan, updatePlan, setPlanStatus, lockPlan,

  // Item operations
  addItemToPlan, removeItemFromPlan, updateItemInPlan, moveItemToQuarter,

  // Goal operations
  addGoal, updateGoal, removeGoal,

  // Capacity
  updateCapacity,   // auto-recomputes committed from items sum

  // Reviewers
  addReviewer, removeReviewer, submitReview,

  setSelectedQuarter,
}
```

### Exported selectors (call these from useMemo, not useStore)

```typescript
selectActivePlan(state: RoadmapState): QuarterlyPlan | null
selectCapacityPercent(plan: QuarterlyPlan): number   // 0–100, clamped
selectAllApproved(plan: QuarterlyPlan): boolean
```

### Capacity auto-recompute

`addItemToPlan`, `removeItemFromPlan`, and `updateItemInPlan` all call `recomputeCommitted()` internally, which sums `item.effort.points ?? 0` across all items. The UI never needs to manually update `capacity.committed`.

---

## useAppStore

**Purpose:** Workspace-level UI preferences. Persisted to `localStorage` via Zustand `persist` middleware.

```typescript
interface AppState {
  viewMode: ViewMode;           // "list" | "board" | "timeline"
  sidebarCollapsed: boolean;
  activeTeamId: string | null;

  setViewMode, toggleSidebar, setActiveTeamId,
}
```

Not wrapped in `temporal` — UI prefs don't need undo/redo.

---

## Display ID Generation

Feature request display IDs (`KEL-001`, `KEL-002`…) are **not stored** — they are computed deterministically from creation order:

```typescript
// src/lib/format.ts
export function buildDisplayIdMap(requests: FeatureRequest[]): Record<string, string> {
  // Sort by submittedAt ascending, assign KEL-001, KEL-002...
}
```

Always pass `allRequests` (not filtered) to keep IDs stable as filters change. Memoize the result:

```typescript
const displayIdMap = useMemo(() => buildDisplayIdMap(requests), [requests]);
```
