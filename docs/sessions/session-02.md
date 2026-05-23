# Keel MVP — Session 002 Handoff

**Date:** 2026-05-24  
**Status:** All 4 MVP phases complete. TypeScript clean. Dev server running on port 3000.

---

## Completed Work

### Phase 1 — Foundation ✅
Types, stores, design tokens, app shell.

- `src/types/index.ts` — all domain interfaces (`FeatureRequest`, `RoadmapItem`, `QuarterlyPlan`, `PrioritizationScore`, `RICEScore`, `WSJFScore`, `CustomDimension`, etc.)
- `src/lib/seed.ts` — 7 `FeatureRequest` objects, 5 `RoadmapItem` initiatives (with pre-computed RICE scores), 3 `QuarterlyGoal` objects, 1 `QuarterlyPlan` (Q2 2026, capacity 60 pts, committed 55 pts)
- `src/lib/constants.ts` — `makeQuarterRef`, `PRIORITY_CONFIG`, `STATUS_CONFIG`, `PLAN_STATUS_CONFIG`, `SIDEBAR_NAV`, `DEMO_WORKSPACE`
- `src/lib/format.ts` — `formatRelativeDate`, `buildDisplayIdMap` (KEL-001…), `avatarColor`
- `src/lib/cn.ts` — `clsx` + `tailwind-merge`
- `src/app/globals.css` — all design tokens via Tailwind v4 `@theme`
- `src/store/useInboxStore.ts` — zundo temporal, requests + filters
- `src/store/useScoringStore.ts` — zundo temporal, initiatives + custom dimensions
- `src/store/useRoadmapStore.ts` — zundo temporal, plans + reviewers
- `src/store/useAppStore.ts` — workspace prefs with `persist` middleware
- `src/components/layout/Sidebar.tsx` — 176px fixed, team nav, collapsible
- `src/components/layout/Header.tsx` — 44px bar, view mode toggle, filter button, right slot
- `src/components/ui/` — `Button`, `EmptyState`, `StatusIcon`, `PriorityIcon`, `Kbd`
- `src/hooks/useGlobalShortcuts.ts` — `c`, `Escape`, `⌘Z`, `⌘⇧Z`
- `src/hooks/useKeyboardNav.ts` — arrow key nav with `registerRef` scroll-into-view

### Phase 2 — PM Inbox ✅
36px dense list view, split-view detail panel, bulk actions, keyboard nav.

- `src/components/inbox/InboxView.tsx` — root orchestrator
- `src/components/inbox/RequestList.tsx` — grouped by status (active tab) or flat
- `src/components/inbox/RequestRow.tsx` — 36px row, hover-reveal date/avatar
- `src/components/inbox/RequestGroupHeader.tsx`
- `src/components/inbox/FilterTabs.tsx` — underline tabs with live counts + inline search
- `src/components/inbox/StatusDropdown.tsx` — Radix DropdownMenu with `stopPropagation`
- `src/components/inbox/BulkActionBar.tsx` — appears when rows are checked
- `src/components/inbox/RequestDetail.tsx` — right panel, inline tag editing
- `src/components/inbox/NewRequestModal.tsx` — Radix Dialog, auto-grow textarea
- `src/components/inbox/PrioritySignalBadge.tsx`, `SourceBadge.tsx`

### Phase 3 — Scoring Engine ✅
Dense scoring table, inline editing, all four frameworks, custom dimensions, detail panel.

- `src/components/scoring/ScoringView.tsx` — root orchestrator, split-view
- `src/components/scoring/columns.ts` — `ColDef` type, `RICE_COLUMNS`, `MOSCOW_COLUMNS`, `WSJF_COLUMNS`
- `src/components/scoring/ScoringTable.tsx` — framework-aware sort, sticky header
- `src/components/scoring/ScoringTableHeader.tsx` — sort arrows, column click
- `src/components/scoring/ScoringRow.tsx` — 36px row, adapts cells per framework
- `src/components/scoring/InlineNumberCell.tsx` — click-to-edit, Tab/Enter/Escape, `data-col`/`data-initiative` for Tab navigation between cells
- `src/components/scoring/MoSCoWCell.tsx` — Radix DropdownMenu badge picker
- `src/components/scoring/FrameworkTabs.tsx` — RICE / MoSCoW / WSJF / Custom
- `src/components/scoring/InitiativeDetail.tsx` — right panel with score inputs + metadata
- `src/components/scoring/CustomDimensionsModal.tsx` — Radix Dialog, add/remove dimensions
- `src/components/scoring/RankBadge.tsx`, `GoalTag.tsx`

### Phase 4 — Stakeholder Roadmap ✅
Kanban board by status, capacity bar, goals strip, plan lifecycle, share link, reviewers.

- `src/components/roadmap/RoadmapView.tsx` — root orchestrator
- `src/components/roadmap/CapacityBar.tsx` — green/amber/red based on threshold
- `src/components/roadmap/GoalsStrip.tsx` — horizontal scrollable goal pills with weight
- `src/components/roadmap/PlanStatusBadge.tsx` — lifecycle dropdown (Draft → In Review → Approved → Locked)
- `src/components/roadmap/StatusColumn.tsx` — Kanban column with count + pts summary
- `src/components/roadmap/InitiativeCard.tsx` — priority-border card with RICE/MoSCoW/effort/goals
- `src/components/roadmap/ReviewersFooter.tsx` — reviewer avatars, approval status, Submit/Lock CTA
- `src/components/roadmap/ShareModal.tsx` — mock link generation, copy, public/restricted toggle

---

## Current Architecture

### Tech Stack

| Layer | Library | Version | Notes |
|---|---|---|---|
| Framework | Next.js App Router | 16.2.6 | `src/` layout, `(app)` route group |
| Runtime | React | 19.2.4 | Strict mode in dev |
| Styling | Tailwind CSS | v4 | CSS `@theme` — **no `tailwind.config.ts`** |
| State | Zustand | 5.0.13 | No deprecated `shallow` import |
| Undo/Redo | zundo | 2.3.0 | `temporal` middleware |
| UI Primitives | Radix UI | various | Dialog, DropdownMenu, Tooltip, etc. |
| Icons | lucide-react | 1.16.0 | |
| Class utils | clsx + tailwind-merge | — | via `src/lib/cn.ts` |

### File Structure

```
src/
├── app/
│   ├── layout.tsx                    # Root: Inter + JetBrains Mono fonts
│   ├── globals.css                   # ALL design tokens (@theme block)
│   ├── page.tsx                      # Redirects to /inbox
│   └── (app)/
│       ├── layout.tsx                # Shell: <Sidebar> + <main>
│       ├── inbox/page.tsx            # → <InboxView />
│       ├── scoring/page.tsx          # → <ScoringView />
│       └── roadmap/page.tsx          # → <RoadmapView />
├── components/
│   ├── layout/    Header, Sidebar
│   ├── ui/        Button, EmptyState, StatusIcon, PriorityIcon, Kbd
│   ├── inbox/     9 components
│   ├── scoring/   12 components
│   └── roadmap/   8 components
├── hooks/
│   ├── useGlobalShortcuts.ts
│   └── useKeyboardNav.ts
├── lib/
│   ├── cn.ts, constants.ts, format.ts, seed.ts
├── store/
│   ├── useInboxStore.ts
│   ├── useScoringStore.ts
│   ├── useRoadmapStore.ts
│   ├── useAppStore.ts
│   └── middleware/withHistory.ts     # re-exports zundo temporal
└── types/index.ts
```

### Design Tokens (globals.css `@theme`)

All tokens are CSS custom properties. Use with `var(--color-*)`, `var(--spacing-*)` etc.

```
Colors:
  --color-bg-base:        #1b1b1f   (page background)
  --color-bg-surface:     #202027   (cards, panels)
  --color-bg-elevated:    #26262e   (modals, dropdowns)
  --color-bg-hover:       #2a2a34
  --color-border-subtle:  #2c2c38
  --color-border-strong:  #3a3a48
  --color-text-primary:   #f0f0f2
  --color-text-secondary: #8888a0
  --color-text-muted:     #55556a
  --color-brand:          #5e5ce6   (active underlines, focus rings)
  --color-brand-hover:    #4b49cc
  --color-success:        #30a46c
  --color-warning:        #f5a623
  --color-danger:         #e5484d

Structural:
  --spacing-sidebar: 176px
  --spacing-topbar:  44px
  --spacing-row:     36px           (all dense rows)

Utility classes:
  .keel-row            height: 36px, flex, align-center
  .keel-sidebar-width  width + min-width: 176px
  .keel-topbar-height  height + min-height: 44px
```

### Zustand Store Pattern

All three data stores use **zundo temporal** middleware for undo/redo:

```typescript
// ✅ Correct store creation
export const useInboxStore = create<InboxState>()(
  temporal(
    (set, get) => ({ /* state + actions */ }),
    {
      limit: 50,
      partialize: (s) => ({ requests: s.requests }), // only data, not UI state
    },
  ),
);

// ✅ Accessing undo/redo in a component
const temporal = useStore(useInboxStore.temporal);
temporal.undo();
temporal.redo();
```

### Selector Pattern — CRITICAL

**Never** call `useStore(selector)` when the selector creates a new array/object reference on every call. In Zustand 5 + React 19, `useSyncExternalStore`'s `getSnapshot` must return stable references, or you get an infinite render loop ("Maximum update depth exceeded").

```typescript
// ❌ BROKEN — selectFilteredRequests returns new array every call
const filtered = useInboxStore(selectFilteredRequests);

// ✅ CORRECT — derive from already-subscribed state with useMemo
const { requests, filters } = useInboxStore();
const filtered = useMemo(
  () => selectFilteredRequests({ requests, filters }),
  [requests, filters],
);
```

**Rule:** Any selector that returns `array.filter(...)`, `array.map(...)`, or builds a new object must be called inside `useMemo`, not as the argument to `useStore()`. Single-value selectors (returning a primitive or a stable object reference) are safe.

### "use client" Boundary

All interactive components must have `"use client"` at the top. Server Components cannot receive `onClick` or other event handler props. The three page files (`inbox/page.tsx`, `scoring/page.tsx`, `roadmap/page.tsx`) are Server Components that simply `import` and render the `"use client"` root view components.

### Tailwind v4 — Important Difference

There is **no `tailwind.config.ts`**. All custom tokens are in `globals.css` using the `@theme` directive. Do not create a config file. Custom utility classes (`.keel-row`, etc.) are defined after the `@theme` block as plain CSS.

---

## Important Constraints

1. **Tailwind v4**: tokens live in `globals.css @theme`, not in a config file. Use `var(--color-*)` in inline styles when Tailwind classes don't cover it.

2. **No color-only status indicators**: every status/priority indicator uses both shape AND color (WCAG AA). See `StatusIcon.tsx` for the canonical SVG shapes.

3. **Row height is always 36px**: use `.keel-row` class or `h-[36px]` / `var(--spacing-row)`. Do not deviate.

4. **Radix DropdownMenu triggers**: always add `e.stopPropagation()` AND `e.onPointerDown` stopPropagation to prevent the parent row's `onClick` from firing when the trigger is clicked.

5. **Selector stability**: see "Selector Pattern — CRITICAL" above.

6. **Font imports**: Inter and JetBrains Mono are loaded via `next/font/google` in `src/app/layout.tsx` and injected as CSS variables (`--font-inter`, `--font-jetbrains-mono`). Do not add `@import url(...)` for them.

7. **`FilterTab` type**: `"active" | "all" | "new" | "triaged" | "archived"`. Every switch statement must handle ALL five values including `"all"`, or TypeScript will complain about missing return paths.

8. **`EmptyState` Icon prop type**: `ComponentType<{ size?: number; strokeWidth?: number; className?: string }>` — NOT `LucideIcon` (which is `ForwardRefExoticComponent<...>`). The broader `ComponentType` is satisfied by all Lucide icons.

9. **`buildDisplayIdMap`**: sorts by `submittedAt` ascending, assigns `KEL-001`, `KEL-002` etc. Always pass `allRequests` (not filtered) so IDs are stable across filter changes.

10. **zundo `partialize`**: only include data fields, never UI state like `filters`, `selectedIds`, `focusedId`, `editingCell`. This keeps the undo stack clean.

11. **Inline style `flex` vs `flexShrink`**: do not mix `flex: "0 0 Xpx"` (shorthand) with explicit `flexShrink` — React warns about conflicting properties. Use the shorthand only.

---

## Pending Tasks

### High Priority (Product-complete gaps)
- [ ] **Auth shell** — login/signup pages, session management. Currently the app shell renders for everyone with no auth gate.
- [ ] **`/my-issues` page** — sidebar link exists but page 404s. Should show issues assigned to `DEMO_WORKSPACE.currentUser`.
- [ ] **`/views` page** — sidebar link exists but page 404s. Custom saved filters.
- [ ] **New initiative modal** — the "Initiative" button in ScoringView's header is a no-op (Phase 4 placeholder). Needs a Radix Dialog similar to `NewRequestModal`.
- [ ] **Add initiative to plan** — the roadmap board shows seed data but has no way to add new items from the UI.
- [ ] **Reviewer "Add reviewer" button** — `ReviewersFooter` has the `<UserPlus>` button wired to nothing. Should open a member-picker popover.

### Medium Priority (Polish)
- [ ] **Keyboard shortcut help modal** — `?` key is defined in `SHORTCUTS` but not wired to a handler or UI.
- [ ] **`⌘K` command palette** — `SHORTCUTS.SEARCH` defined; high-value for power users.
- [ ] **Scoring → Roadmap link** — no way to promote a scored initiative from the scoring table directly onto the roadmap plan.
- [ ] **MoSCoW detail panel** — `InitiativeDetail` shows a static badge when framework is `moscow` but no input to change it (uses the table's `MoSCoWCell` for edits, which is fine, but detail panel should have the full picker inline too).
- [ ] **Mobile/responsive** — layout is desktop-only. Sidebar collapses via `useAppStore` but below ~768px the split view breaks.
- [ ] **Error boundaries** — no React error boundaries around any route. A component crash takes down the entire shell.

### Low Priority (Future phases)
- [ ] **Real Jira/Linear integration** — `jiraEpicId` and `linearProjectId` fields exist on `RoadmapItem` but the UI only shows them as text.
- [ ] **Voting round UI** — `VotingRound` type is defined but has no UI at all.
- [ ] **Comment threads** — `RequestComment[]` is on `FeatureRequest` but `RequestDetail` doesn't render them.
- [ ] **Merge requests** — `mergeRequests()` exists in the inbox store but no UI triggers it.
- [ ] **Export / PDF generation** — stakeholder share link is a mock URL.
- [ ] **Backend / persistence** — all data is in-memory Zustand (resets on page refresh). `useAppStore` has `persist` to localStorage for UI prefs, but request/initiative data is ephemeral.

---

## Known Issues

### 1. Scoring `flex` style warning (cosmetic, non-breaking)
React logs: _"Updating a style property during rerender (flex) when a conflicting property is set (flexShrink)"_ on the scoring table rows.

**Root cause:** `ScoringTableHeader.tsx` sets both `flex` shorthand and separate alignment properties inline. Appears only in dev mode.  
**Impact:** Visual-only warning; no functional issue.  
**Fix:** Audit inline style objects in `ScoringTableHeader` to ensure no property is duplicated between the shorthand `flex` and an explicit `flexShrink`.

### 2. Inbox crash loop (fixed, but verify after cold start)
The original `useInboxStore(selectFilteredRequests)` call caused "Maximum update depth exceeded" in dev mode with React 19 + Zustand 5. This was fixed in session 002 by switching to a `useMemo` pattern. If the crash reappears, the fix pattern is documented above in "Selector Pattern — CRITICAL".

### 3. Browser extension hydration warning (false positive)
Grammarly and similar extensions add `data-gr-ext-installed` attributes to `<body>`, which causes a hydration mismatch warning in the console on every page load. This is not an app bug — `suppressHydrationWarning` is already set on `<html>` but not on `<body>`. Adding `suppressHydrationWarning` to `<body>` in `src/app/layout.tsx` would silence it.

### 4. No 404 pages for unimplemented routes
`/my-issues` and `/views` are in the sidebar nav but have no corresponding page files. They produce Next.js default 404 responses. Either add placeholder pages (like the Phase 3/4 placeholders that existed before) or remove the sidebar links until implemented.

---

## Seed Data Reference

**Requests** (`SEED_REQUESTS` — 7 items):
- `req_001` Bulk status update — new, Core Product
- `req_002` WSJF scoring framework — triaged, Core Product
- `req_003` Shareable read-only roadmap — triaged, Roadmap Planning (3 votes)
- `req_004` Linear integration — new, Integrations
- `req_005` Capacity bar — new, Roadmap Planning
- `req_006` Email digest — archived, Notifications
- `req_007` Keyboard shortcut — triaged, Core Product

**Initiatives** (`SEED_INITIATIVES` — 5 items, Q2 2026):

| ID | Title | Status | RICE | Effort | MoSCoW |
|---|---|---|---|---|---|
| init_001 | Bulk triage actions | in_progress | 400 | 8 pts | must |
| init_002 | WSJF scoring framework | todo | 180 | 13 pts | must |
| init_003 | Shareable read-only roadmap | todo | 1275 | 8 pts | must |
| init_004 | Linear integration | backlog | 112 | 21 pts | should |
| init_005 | Capacity planning bar | todo | 1440 | 5 pts | must |

**Plan** (`SEED_PLAN`): Q2 2026, Draft status, capacity 60 pts total / 55 pts committed (91.7% — over the 90% warning threshold, so the capacity bar renders red).

---

## Dev Server

Already running on port 3000 (PID 11925). Access:
- `/inbox` — Phase 2 (PM Inbox)
- `/scoring` — Phase 3 (Scoring Engine)
- `/roadmap` — Phase 4 (Stakeholder Roadmap)

Restart: `npm run dev` from the project root (`/Users/beulahanalnim/Documents/Claude/keel-mvp/keel/`).
