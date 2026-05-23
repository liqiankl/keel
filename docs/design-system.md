# Keel — Design System

## Reference

Design language is derived from **Linear.app**. The UI images in `/ui-images/` are Linear screenshots used as the visual spec. Key characteristics: dark-mode-first, extreme density, keyboard-driven, minimal chrome.

---

## Tailwind v4 — Critical Difference

There is **no `tailwind.config.ts`**. All custom tokens are defined in `src/app/globals.css` using the `@theme` directive. Tailwind v4 reads this block and generates corresponding utility classes automatically.

```css
/* ✅ Correct — in globals.css */
@theme {
  --color-brand: #5e5ce6;
}
/* Generates: bg-brand, text-brand, border-brand, etc. */

/* Also usable as CSS var anywhere: */
color: var(--color-brand);
```

**Do not** create `tailwind.config.ts` or `tailwind.config.js`. **Do not** add `@import url(...)` for Google Fonts — they are loaded via `next/font/google` in `src/app/layout.tsx`.

---

## Color Palette

### Dark Shell (primary UI)

| Token | Value | Usage |
|---|---|---|
| `--color-bg-base` | `#1b1b1f` | Page/html background |
| `--color-bg-surface` | `#202027` | Cards, panels, sidebars |
| `--color-bg-elevated` | `#26262e` | Modals, popovers, dropdowns |
| `--color-bg-hover` | `#2a2a34` | Row/button hover state |
| `--color-bg-selected` | `#26262e` | Active/selected rows |
| `--color-bg-overlay` | `rgba(0,0,0,0.55)` | Dialog backdrop |
| `--color-border-subtle` | `#2c2c38` | Default dividers, card borders |
| `--color-border-strong` | `#3a3a48` | Hover borders, active inputs |

### Text

| Token | Value | Usage |
|---|---|---|
| `--color-text-primary` | `#f0f0f2` | Main content, titles |
| `--color-text-secondary` | `#8888a0` | Labels, metadata |
| `--color-text-muted` | `#55556a` | Placeholders, disabled, counts |
| `--color-text-inverse` | `#ffffff` | Text on brand-colored surfaces |

### Brand

| Token | Value |
|---|---|
| `--color-brand` | `#5e5ce6` |
| `--color-brand-hover` | `#4b49cc` |
| `--color-brand-subtle` | `#3a3a80` |
| `--color-brand-foreground` | `#ffffff` |

### Semantic

| Token | Value | Usage |
|---|---|---|
| `--color-success` | `#30a46c` | Done, approved, positive |
| `--color-warning` | `#f5a623` | In-progress, caution |
| `--color-danger` | `#e5484d` | Error, archived, declined |
| `--color-info` | `#3b82f6` | Informational |

### Status Colors

| Token | Value |
|---|---|
| `--color-status-backlog` | `#55556a` |
| `--color-status-todo` | `#8888a0` |
| `--color-status-in-progress` | `#f5a623` |
| `--color-status-done` | `#4a90d9` |
| `--color-status-canceled` | `#6b6b7a` |

### Priority Colors

| Token | Value |
|---|---|
| `--color-priority-urgent` | `#e5484d` |
| `--color-priority-high` | `#f97316` |
| `--color-priority-medium` | `#f5a623` |
| `--color-priority-low` | `#3b82f6` |
| `--color-priority-none` | `#55556a` |

---

## Typography

Fonts are injected as CSS variables by `next/font/google` in `src/app/layout.tsx`:
- `--font-inter` → mapped to `--font-sans`
- `--font-jetbrains-mono` → mapped to `--font-mono`

### Type Scale

| Token | Size | Usage |
|---|---|---|
| `--text-h1` | 24px | Page headings (rare) |
| `--text-h2` | 18px | Section headings |
| `--text-h3` | 15px | Sub-headings |
| `--text-body` | 14px | Base / `text-sm` |
| `--text-small` | 13px | Row content, labels |
| `--text-caption` | 12px | Meta, timestamps |
| `--text-mono` | 12px | IDs, scores, numbers |

All numeric values (IDs, scores, points) use `font-mono` + `tabular-nums` to prevent layout shift when digits change.

---

## Spacing (4pt Grid)

| Token | Value |
|---|---|
| `--spacing-row` | 36px |
| `--spacing-topbar` | 44px |
| `--spacing-sidebar` | 176px |
| `--spacing-row-group` | 40px |

Standard Tailwind spacing tokens (1=4px, 2=8px, 3=12px, 4=16px…) also apply.

---

## Structural Utility Classes

Defined in `globals.css` after the `@theme` block:

```css
.keel-row          { height: 36px; display: flex; align-items: center; }
.keel-row-group    { height: 40px; display: flex; align-items: center; }
.keel-sidebar-width { width: 176px; min-width: 176px; flex-shrink: 0; }
.keel-topbar-height { height: 44px; min-height: 44px; }
```

---

## Border Radius

| Token | Value |
|---|---|
| `--radius-sm` | 4px |
| `--radius-md` | 6px |
| `--radius-lg` | 8px |
| `--radius-xl` | 10px |
| `--radius-full` | 9999px |

---

## Shadows

| Token | Value |
|---|---|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.25)` |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.35)` |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.45)` |
| `--shadow-brand` | `0 0 0 2px #5e5ce6` |

---

## Accessibility Rules

1. **Never use color as the only differentiator.** Every status/priority indicator must combine shape AND color. See `StatusIcon.tsx` for the canonical SVG shapes:
   - Backlog: dotted circle
   - Todo: outline circle
   - Triaged: dot-in-circle
   - In Progress: half-fill
   - Done: filled + check
   - Archived/Canceled: X

2. **Focus rings.** All interactive elements get `:focus-visible` rings via `globals.css`:
   ```css
   :focus-visible {
     outline: 2px solid var(--color-brand);
     outline-offset: 2px;
     border-radius: var(--radius-sm);
   }
   ```
   Tailwind equivalent: `focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]`

3. **WCAG AA contrast.** Text on dark backgrounds: primary `#f0f0f2` on `#1b1b1f` = 13:1. Secondary `#8888a0` on `#1b1b1f` = 4.7:1 (passes AA for normal text).

---

## Component Library

### Button
```tsx
<Button variant="primary" size="sm">Label</Button>
```
- **Variants:** `primary`, `secondary`, `ghost`, `danger`
- **Sizes:** `md` (h-9), `sm` (h-7), `icon` (h-8 w-8)

### EmptyState
```tsx
<EmptyState
  Icon={Inbox}  // ComponentType<{size?, strokeWidth?, className?}> — NOT LucideIcon type
  title="No requests yet"
  description="Description text."
  action={{ label: "New request", onClick: () => {} }}
/>
```
`Icon` type is `ComponentType<{size?, strokeWidth?, className?}>` — the broader type that all Lucide icons satisfy. Do not type it as `LucideIcon`.

### MoSCoW colors (canonical)
```
must:   #f87171 (red-400)
should: #fb923c (orange-400)
could:  #60a5fa (blue-400)
wont:   #6b7280 (gray-500)
```

### Goal chips
Goals always render with their `goal.color` hex value for both the dot and the text, using `color + "18"` for background and `color + "33"` for border (hex alpha suffix pattern).

---

## Scrollbar

Custom dark scrollbar defined globally:
```css
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-thumb { background: var(--color-border-strong); border-radius: 9999px; }
```
