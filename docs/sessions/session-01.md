# Session 01 — Foundation + PM Inbox

**Date:** 2026-05-24 (earlier)  
**Phases delivered:** Phase 1 (Foundation) + Phase 2 (PM Inbox)  
**TypeScript:** ✅ clean at end of session

---

## What Was Built

### Phase 1 — Foundation

**Goal:** Establish the full type system, store layer, and app shell before any feature UI. Nothing rendered until Phase 1 was complete and approved.

#### Type system (`src/types/index.ts`)
All domain interfaces defined in one file:
- `FeatureRequest`, `RequestVote`, `RequestComment`
- `RoadmapItem`, `EffortValue`, `InitiativeDependency`
- `PrioritizationScore`, `RICEScore`, `WSJFScore`, `CustomDimension`, `CustomScore`, `ScoringHistoryEntry`
- `QuarterlyPlan`, `QuarterlyGoal`, `CapacityConfig`, `PlanReviewer`
- `WorkspaceMember`, `Workspace`, `VotingRound`
- Enums: `Priority`, `RequestStatus`, `InitiativeStatus`, `PlanStatus`, `ScoringFramework`, `MoSCoWLabel`, `RequestSource`, `PrioritySignal`
- UI types: `FilterTab`, `ViewMode`, `SidebarNavItem`

**`FilterTab`** = `"active" | "all" | "new" | "triaged" | "archived"` — all five values must be handled in every switch statement.

#### Seed data (`src/lib/seed.ts`)
- 7 `FeatureRequest` objects (mix of new/triaged/archived, different sources)
- 5 `RoadmapItem` initiatives with pre-computed RICE scores (1440, 1275, 400, 180, 112)
- 3 `QuarterlyGoal` objects with hex colors
- 1 `QuarterlyPlan` (Q2 2026, 60 pts total, 55 pts committed → over 90% threshold)

#### Stores
Three data stores with zundo `temporal` undo/redo, plus one persisted UI store:
- `useInboxStore` — requests, triage filters, selection
- `useScoringStore` — initiatives, framework, custom dimensions, sort, editing cell
- `useRoadmapStore` — plans, capacity auto-recompute, reviewers
- `useAppStore` — viewMode, sidebarCollapsed (localStorage)

**Key discovery:** The original custom `withHistory` middleware had TypeScript errors with Zustand's `StateCreator` / `StoreMutatorIdentifier` types. Replaced with `zundo` package which provides `temporal` with correct types out of the box.

#### Design tokens (`src/app/globals.css`)
Full `@theme` block: colors, spacing, border-radius, shadows, typography sizes. Utility classes: `.keel-row`, `.keel-sidebar-width`, `.keel-topbar-height`.

#### App shell
- `src/app/layout.tsx` — Root layout with Inter + JetBrains Mono via `next/font/google`
- `src/app/(app)/layout.tsx` — Authenticated shell: `<Sidebar>` + `<main>`
- `src/components/layout/Sidebar.tsx` — 176px fixed, workspace avatar, primary nav, team subnav (collapsible), import banner
- `src/components/layout/Header.tsx` — 44px bar, view mode toggle (list/board/timeline), Filter button, right slot

#### UI primitives
- `Button` — variants: primary/secondary/ghost/danger; sizes: md/sm/icon
- `EmptyState` — Icon must be `ComponentType<{size?, strokeWidth?, className?}>` not `LucideIcon`
- `StatusIcon` — SVG shape + color (WCAG AA: shape AND color, never color alone)
- `PriorityIcon`, `Kbd`

---

### Phase 2 — PM Inbox

**Goal:** 36px dense request list replacing Notion/Jira intake workflows. Split-view with detail panel.

#### Components built
- `InboxView.tsx` — root orchestrator; manages `openId`, `newModalOpen`, global shortcuts
- `RequestList.tsx` — groups requests by status (active tab) or flat (other tabs); EMPTY_STATE_CONFIG for all 5 FilterTab values
- `RequestRow.tsx` — 36px row; `.group` for hover-reveal; `role="row"`, `tabIndex={0}`, `aria-selected`
- `RequestGroupHeader.tsx` — status group header with count + "Add to group" action
- `FilterTabs.tsx` — underline-style tabs with live counts + inline search input
- `StatusDropdown.tsx` — Radix DropdownMenu; trigger uses `stopPropagation` on both `onClick` AND `onPointerDown`
- `BulkActionBar.tsx` — slides in when rows are checked; bulk triage/tag
- `RequestDetail.tsx` — right panel; inline tag editing (Enter/comma add, X remove); footer actions
- `NewRequestModal.tsx` — Radix Dialog; auto-grow textarea for title; source/signal `<select>` chips; `<datalist>` for product area autocomplete; "Create more" toggle
- `PrioritySignalBadge.tsx`, `SourceBadge.tsx`

#### Key patterns established
- **Split-view:** `style={{ flex: hasDetail ? "0 0 55%" : "1 1 0%" }}` on list panel
- **Display IDs:** `buildDisplayIdMap(allRequests)` — always pass unfiltered list
- **`useKeyboardNav`:** `registerRef(id)` pattern; arrow keys + `scrollIntoView({ block: "nearest" })`
- **`useGlobalShortcuts`:** `c` = create, `Escape` = close, `⌘Z/⌘⇧Z` = undo/redo

---

## Errors Fixed in This Session

### 1. Custom `withHistory` middleware type errors
All three stores failed with TypeScript errors around `StateCreator` and `StoreMutatorIdentifier`.  
**Fix:** Replaced custom middleware with `zundo` package. `withHistory.ts` now just re-exports `temporal` from zundo.

### 2. Server Component passing event handlers
Placeholder inbox/scoring/roadmap pages were Server Components but passed `onClick: () => undefined` to `EmptyState`.  
**Fix:** Added `"use client"` to `EmptyState.tsx` and the placeholder page files.

### 3. `FilterTabs.tsx` missing `"all"` case
`countForTab` switch was missing `case "all"` — TypeScript reported missing return path.  
**Fix:** Added `case "all": return requests.length;` and `default: return 0;`.

### 4. `EmptyState` `Icon` type mismatch
`RequestList` used `ComponentType<{size?, strokeWidth?, className?}>` in `EMPTY_STATE_CONFIG` but `EmptyState` expected `LucideIcon` (`ForwardRefExoticComponent<...>`).  
**Fix:** Changed `EmptyState`'s `Icon` prop type to the broader `ComponentType` shape.

### 5. `selectFilteredRequests` called with partial state
`InboxView` called `selectFilteredRequests({ requests, filters } as ...)` which required a cast.  
**Fix at the time:** Used direct Zustand selector: `useInboxStore(selectFilteredRequests)`.  
**This later caused the infinite loop — see session-02 for the final correct fix.**

---

## Handoff Notes to Session 02

- All Phase 1 + 2 files are complete and TypeScript-clean
- Phase 3 (Scoring Engine) is next
- The `useInboxStore(selectFilteredRequests)` selector pattern should be watched — it works in this session but Zustand 5 + React 19's `useSyncExternalStore` may surface issues
- The `useGlobalShortcuts` hook re-creates the listener on every render (unstable `shortcuts` object dependency) — not causing issues now but is technically incorrect
