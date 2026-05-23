# Keel — Architecture

## Overview

Keel is a Quarterly Planning & Prioritization Tool (QPT) for Product Managers. It runs as a single-tenant Next.js application with all data held in Zustand stores (client-side only in the current MVP). There is no backend — persistence resets on page refresh except for UI preferences which are saved to `localStorage`.

---

## Tech Stack

| Concern | Library | Version |
|---|---|---|
| Framework | Next.js App Router | 16.2.6 |
| Runtime | React | 19.2.4 |
| Language | TypeScript | strict mode |
| Styling | Tailwind CSS v4 | CSS `@theme` — no config file |
| State | Zustand | 5.0.13 |
| Undo/Redo | zundo | 2.3.0 |
| UI Primitives | Radix UI | various (see package.json) |
| Icons | lucide-react | 1.16.0 |
| Class utils | clsx + tailwind-merge | via `src/lib/cn.ts` |
| Fonts | next/font/google | Inter, JetBrains Mono |

---

## File Structure

```
keel/
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Root layout: font injection, html/body
│   │   ├── globals.css                 # ALL design tokens (Tailwind v4 @theme)
│   │   ├── page.tsx                    # Redirects → /inbox
│   │   └── (app)/                      # Authenticated shell route group
│   │       ├── layout.tsx              # Shell: <Sidebar> + <main id="main-content">
│   │       ├── inbox/page.tsx          # Server Component → <InboxView />
│   │       ├── scoring/page.tsx        # Server Component → <ScoringView />
│   │       └── roadmap/page.tsx        # Server Component → <RoadmapView />
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx              # 44px top bar, view toggle, right slot
│   │   │   └── Sidebar.tsx             # 176px fixed, team nav, collapsible
│   │   ├── ui/
│   │   │   ├── Button.tsx              # variants: primary/secondary/ghost/danger
│   │   │   ├── EmptyState.tsx          # zero-state template
│   │   │   ├── StatusIcon.tsx          # SVG shapes (shape+color, never color-only)
│   │   │   ├── PriorityIcon.tsx
│   │   │   └── Kbd.tsx                 # keyboard shortcut badge
│   │   ├── inbox/                      # Phase 2 — 9 components
│   │   ├── scoring/                    # Phase 3 — 12 components
│   │   └── roadmap/                    # Phase 4 — 8 components
│   ├── hooks/
│   │   ├── useGlobalShortcuts.ts       # c, Escape, ⌘Z, ⌘⇧Z
│   │   └── useKeyboardNav.ts           # arrow-key nav, registerRef scroll
│   ├── lib/
│   │   ├── cn.ts                       # clsx + tailwind-merge
│   │   ├── constants.ts                # makeQuarterRef, nav, STATUS_CONFIG, etc.
│   │   ├── format.ts                   # formatRelativeDate, buildDisplayIdMap, avatarColor
│   │   └── seed.ts                     # SEED_REQUESTS, SEED_INITIATIVES, SEED_PLAN
│   ├── store/
│   │   ├── useInboxStore.ts
│   │   ├── useScoringStore.ts
│   │   ├── useRoadmapStore.ts
│   │   ├── useAppStore.ts
│   │   └── middleware/withHistory.ts   # re-exports zundo temporal
│   └── types/
│       └── index.ts                    # all domain interfaces
├── docs/                               # ← you are here
├── public/
├── CLAUDE.md → AGENTS.md              # next dev guide pointer
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## Routing

The `(app)` route group applies the authenticated shell layout (sidebar + main wrapper) to all routes inside it. The route group name does not appear in URLs.

| URL | Page file | Root component |
|---|---|---|
| `/` | `app/page.tsx` | Redirect to `/inbox` |
| `/inbox` | `(app)/inbox/page.tsx` | `<InboxView />` |
| `/scoring` | `(app)/scoring/page.tsx` | `<ScoringView />` |
| `/roadmap` | `(app)/roadmap/page.tsx` | `<RoadmapView />` |
| `/my-issues` | ❌ not yet built | — |
| `/views` | ❌ not yet built | — |

### Page files are Server Components

Page files contain no logic — they just import and render the `"use client"` root view:

```tsx
// (app)/scoring/page.tsx
import { ScoringView } from "@/components/scoring/ScoringView";
export default function ScoringPage() {
  return <ScoringView />;
}
```

---

## "use client" Boundary

Every interactive component must declare `"use client"`. Server Components cannot accept `onClick` or other event handler props. The pattern:

- **Server** → page files (`inbox/page.tsx`, etc.)
- **Client** → all components in `components/`, `hooks/`, `store/`

When a new component needs `useState`, `useEffect`, Zustand hooks, or Radix UI — add `"use client"` at the top.

---

## Component Patterns

### Split-view layout
All three main views use the same two-panel pattern: list panel shrinks, detail panel slides in.

```tsx
<div className="flex flex-1 overflow-hidden min-h-0">
  <div style={{ flex: hasDetail ? "0 0 55%" : "1 1 0%" }}>
    {/* list */}
  </div>
  {hasDetail && (
    <div style={{ flex: "0 0 45%" }}>
      {/* detail */}
    </div>
  )}
</div>
```

### 36px dense rows
All list rows use `.keel-row` (height: 36px, display: flex, align-items: center). This is the core density that makes the app feel like Linear.

### Hover-reveal pattern
Date and avatar columns are `opacity-0 group-hover:opacity-100` on the parent `.group` container.

### Radix DropdownMenu trigger
Always stop propagation to prevent the parent row's `onClick` from firing:

```tsx
<DropdownMenu.Trigger asChild>
  <button
    onClick={(e) => e.stopPropagation()}
    onPointerDown={(e) => e.stopPropagation()}
  >
    {/* ... */}
  </button>
</DropdownMenu.Trigger>
```

---

## Build & Run

```bash
# Install
npm install

# Dev server (already running on port 3000)
npm run dev

# Type check
npx tsc --noEmit

# Build
npm run build
```

The dev server uses Turbopack. Hot module replacement is active. TypeScript errors appear in the terminal and browser overlay.
