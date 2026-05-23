# Keel — Product Roadmap

## Build Status

| Phase | Feature | Status |
|---|---|---|
| 1 | Foundation: types, stores, app shell | ✅ Complete |
| 2 | PM Inbox & Intake View | ✅ Complete |
| 3 | Prioritization / Scoring Engine | ✅ Complete |
| 4 | Stakeholder Roadmap | ✅ Complete |

TypeScript: ✅ clean (`npx tsc --noEmit`)  
Dev server: running on port 3000

---

## Phase Details

### Phase 1 — Foundation
**Goal:** Establish the type system, store layer, design tokens, and app shell before any feature UI.

Delivered:
- All domain types (`FeatureRequest`, `RoadmapItem`, `QuarterlyPlan`, scoring types)
- Three Zustand stores with zundo undo/redo
- Tailwind v4 design tokens in `globals.css`
- Sidebar (176px, team nav) + Header (44px, view toggle)
- Seed data: 7 requests, 5 initiatives, 1 quarterly plan

### Phase 2 — PM Inbox
**Goal:** High-density request list that replaces Notion/Jira intake workflows.

Delivered:
- 36px dense row list with `KEL-001` display IDs
- Filter tabs (Active / New / Triaged / Archived) with live counts
- Inline search
- Status dropdown (Radix DropdownMenu) with `stopPropagation`
- Split-view detail panel (55% list / 45% detail)
- New request modal (auto-grow textarea, source/signal chips, product area autocomplete)
- Bulk action bar (check rows → bulk triage/tag)
- Arrow-key navigation with `registerRef` scroll-into-view
- Global shortcuts: `C` = create, `Escape` = close, `⌘Z/⌘⇧Z` = undo/redo

### Phase 3 — Scoring Engine
**Goal:** Dense scoring table with inline editing across four prioritization frameworks.

Delivered:
- Framework tabs: RICE / MoSCoW / WSJF / Custom
- Per-framework column definitions (`columns.ts`)
- Sticky sortable column headers with sort-direction arrows
- Inline number cells (click-to-edit, Tab/Enter/Escape, `data-col` Tab navigation between cells)
- RICE Impact as `<select>` (values: 0.25, 0.5, 1, 2, 3)
- MoSCoW badge + Radix DropdownMenu picker
- Auto-computed scores (RICE, WSJF, Custom) inside the store
- Manual rank override (shows blue rank badge)
- Initiative detail right panel with all inputs + metadata
- Custom Dimensions modal (name, scale 1–5/10, weight slider)
- Undo/redo scoped to data mutations only

### Phase 4 — Stakeholder Roadmap
**Goal:** Plan lifecycle management and stakeholder-ready output.

Delivered:
- Capacity bar (green → amber → red at 90% threshold; ⚠ icon when over)
- Goals strip (scrollable colored pills with weight badges)
- Plan status badge + lifecycle dropdown (Draft → In Review → Approved → Locked)
- Kanban board grouped by initiative status (Backlog / Todo / In Progress / Done)
- Initiative cards with priority-color left border, RICE score, effort pts, MoSCoW badge, goals
- Reviewers footer with avatar + approval status indicators
- Submit for review / Lock plan CTAs
- Share modal with mock link generation, copy button, public/restricted toggle

---

## Pending Tasks

### 🔴 High Priority (product-blocking gaps)

| Task | Notes |
|---|---|
| Auth shell | Login/signup pages; currently no auth gate exists |
| `/my-issues` page | Sidebar link 404s; should filter by `DEMO_WORKSPACE.currentUser.id` |
| `/views` page | Sidebar link 404s; saved custom filter views |
| New initiative modal in Scoring | "Initiative" button in `ScoringView` header is a no-op; needs Radix Dialog like `NewRequestModal` |
| Add initiative to plan | Roadmap board shows seed data only; no UI to add new items |
| Error boundaries | No `<ErrorBoundary>` around any route — a component crash takes down the full shell |

### 🟡 Medium Priority (polish / power features)

| Task | Notes |
|---|---|
| `?` shortcut help modal | Key defined in `SHORTCUTS` constant but not wired to any handler |
| `⌘K` command palette | High-value for power users; `SHORTCUTS.SEARCH` defined |
| Promote scored initiative to plan | No Scoring → Roadmap flow; user has to add manually |
| MoSCoW picker in detail panel | `InitiativeDetail` shows a static badge when framework = `moscow`; should include the inline picker |
| Drag-and-drop in roadmap board | Currently cards are static; drag between status columns would complete the Kanban UX |
| `suppressHydrationWarning` on `<body>` | Silences Grammarly/extension hydration noise (false positive, not an app bug) |
| Mobile/responsive layout | Desktop-only; sidebar collapses via `useAppStore` but split-view breaks below ~768px |

### 🟢 Low Priority (future phases)

| Task | Notes |
|---|---|
| Jira integration | `jiraEpicId` field on `RoadmapItem` exists; UI only shows it as text |
| Linear integration | `linearProjectId` field exists; needs OAuth + push API |
| Voting round UI | `VotingRound` type defined; no UI built |
| Comment threads | `RequestComment[]` on `FeatureRequest`; `RequestDetail` doesn't render them |
| Merge requests | `mergeRequests()` in inbox store; no UI trigger |
| Export / real share link | `ShareModal` uses a mock URL; needs real read-only route |
| Backend / persistence | All data is ephemeral (in-memory); needs database + API layer |
| Real-time collaboration | Multiple PMs editing the same plan |

---

## Known Issues

### 1. Scoring table `flex` style warning
**Symptom:** React dev logs warn: _"Updating a style property during rerender (flex) when a conflicting property is set (flexShrink)"_  
**Cause:** `ScoringTableHeader.tsx` mixes `flex` shorthand with explicit `flexShrink` in the same inline style object.  
**Impact:** Dev-only cosmetic warning; no functional issue.  
**Fix:** Remove explicit `flexShrink` from any element that already uses `flex: "0 0 Xpx"` (the shorthand already sets flex-shrink to 0).

### 2. Inbox render loop — fixed, pattern documented
**Symptom (historical):** "Maximum update depth exceeded" on `/inbox`. React 19 + Zustand 5 + `useSyncExternalStore` crashes when a selector always returns a new array reference.  
**Fix applied:** Replaced `useInboxStore(selectFilteredRequests)` with `useMemo(() => selectFilteredRequests({ requests, filters }), [requests, filters])`.  
**Prevention:** See `docs/state-management.md` — "Selector Stability" section.

### 3. Browser extension hydration mismatch (false positive)
**Symptom:** Console warning about `data-gr-ext-installed` attribute mismatch on `<body>`.  
**Cause:** Grammarly (and similar extensions) inject attributes that differ between SSR and client.  
**Fix:** Add `suppressHydrationWarning` to `<body>` in `src/app/layout.tsx`.

### 4. Missing pages for sidebar nav items
`/my-issues` and `/views` are linked in the sidebar but have no page files → Next.js 404.  
**Fix:** Add placeholder pages (same pattern as the pre-Phase 3/4 placeholders that existed before).
