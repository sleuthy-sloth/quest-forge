# Pixel Art UI Design System — Spec

## Overview

Five reusable React components that replace ad-hoc inline styles across the Quest Forge dashboard and player views. All components use Kenney Pixel UI Pack sprites served from `/public/sprites/ui/` and existing CSS design tokens from `globals.css`.

---

## Design Decisions

**Rendering approach:** CSS `border-image` 9-slice with actual Kenney 48×48 PNGs.
- `image-rendering: pixelated` on all border-image elements
- `border-width: 14px` / `border-image-slice: 14 fill` for buttons and panels
- `border-width: 6px` / `border-image-slice: 6 fill` for progress bar frame

**Sprite mapping:**
- Buttons: `/sprites/ui/9-Slice/Colored/{yellow,grey,red,green}.png` (normal), `{yellow,grey,red,green}_pressed.png` (active)
- Cards, Modals, Progress bar frame: `/sprites/ui/9-Slice/Ancient/brown.png`
- Badges: pure CSS (no sprites — too small to benefit)

**Typography:**
- Button labels: `var(--font-pixel)` (Press Start 2P), 9px
- Card headers: `var(--font-heading)` (Cinzel), 11px, `var(--gold-400)` color
- Badge labels: `var(--font-pixel)`, 6px

---

## Components

### 1. PixelButton

**File:** `src/components/ui/PixelButton.tsx`

**Variants** (controls sprite used):
| variant | sprite | label color |
|---------|--------|-------------|
| `primary` | `yellow.png` | `#ffffff` |
| `secondary` | `grey.png` | `#dddddd` |
| `danger` | `red.png` | `#ffffff` |
| `success` | `green.png` | `#ffffff` |

**Sizes:**
| size | font-size | padding | border-width |
|------|-----------|---------|--------------|
| `sm` | 7px | 0px 6px | 12px |
| `md` (default) | 9px | 2px 8px | 14px |
| `lg` | 11px | 4px 14px | 16px |

**States:**
- Hover: `filter: brightness(1.15); transform: translateY(-1px)`
- Active: switch to `_pressed` sprite, `transform: translateY(1px); filter: brightness(0.9)`
- Disabled: `opacity: 0.4; cursor: not-allowed` — no hover/active effects

**Props interface:**
```typescript
interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
}
```

Extends `React.ButtonHTMLAttributes<HTMLButtonElement>` — passes all standard button props (`onClick`, `disabled`, `type`, `aria-*`, etc.) through. Renders a `<button>` element.

**Implementation note:** Inject the sprite URL via an inline `style` prop setting a `--spr` CSS variable on the button element. A single `<style>` block inside `PixelButton.tsx` defines `.px-btn { border-image: var(--spr) 14 fill; }` and all shared button styles. The `_pressed` sprite is set via `--spr-p` and used in the `:active` selector: `border-image: var(--spr-p, var(--spr)) 14 fill`. Both CSS variables are applied via `style={{ '--spr': `url(...)`, '--spr-p': `url(...)` } as React.CSSProperties}`.

**Note:** The Colored directory also contains `blue.png` / `blue_pressed.png`. This variant is intentionally out of scope for v1.

---

### 2. PixelCard

**File:** `src/components/ui/PixelCard.tsx`

Renders a `<div>` with Ancient/brown 9-slice border and `var(--bg-card)` background.

**Props interface:**
```typescript
interface PixelCardProps {
  header?: React.ReactNode      // Renders Cinzel header stripe with gold underline
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}
```

**Layout:**
- Border: `border-image: url('/sprites/ui/9-Slice/Ancient/brown.png') 14 fill`, `border-width: 14px`
- Background: `var(--bg-card)` (`#1a1c2e`)
- Padding: 16px
- Color: `var(--text-primary)`

**Header stripe (when `header` prop present):**
- Font: `var(--font-heading)`, 11px, `var(--gold-400)` color
- Letter spacing: 0.1em
- Bottom border: `1px solid rgba(201,168,76,0.2)`
- Padding-bottom: 8px, margin-bottom: 10px

---

### 3. PixelProgressBar

**File:** `src/components/ui/PixelProgressBar.tsx`

Pixel-framed progress bar with labeled variants.

**Props interface:**
```typescript
interface PixelProgressBarProps {
  value: number          // Current value
  max: number            // Maximum value
  variant?: 'xp' | 'hp' | 'boss'
  label?: string         // Optional label above the bar
  showValue?: boolean    // Show "value / max" text below (default false)
  className?: string
}
```

**Variants (fill gradient):**
| variant | gradient | intended use |
|---------|----------|-------------|
| `xp` | `linear-gradient(90deg, #c95a00, #ff8c00, #ffc040)` (amber) | Player XP level progress |
| `hp` | `linear-gradient(90deg, #8b0000, #dd2222)` (red) | Player HP bar — reserved for future player views, no refactor target in v1 |
| `boss` | `linear-gradient(90deg, #7f0000, #cc0000)` (deep red) | Static boss HP display in player-facing boss page |

All three variants use a fixed gradient (no dynamic color shift based on percentage). The existing `dashboard/page.tsx` boss bar has a dynamic green→amber→red color shift and segment dividers that go beyond this spec — see Page Refactor section for exclusion.

**Frame:** Ancient/brown 9-slice, `border-width: 6px`, `border-image-slice: 6 fill`
**Track background:** `#0a0a12`
**Height:** 20px
**Fill transition:** `width 0.4s ease`

**Label (when `label` prop present):** Press Start 2P, 7px, `var(--text-muted)` color, 4px below label.

---

### 4. PixelBadge

**File:** `src/components/ui/PixelBadge.tsx`

Inline status/category tag. Pure CSS — no sprites.

**Props interface:**
```typescript
interface PixelBadgeProps {
  variant: 'easy' | 'medium' | 'hard' | 'epic'
           | 'pending' | 'verified'
           | 'once' | 'daily' | 'weekly' | 'monthly'
  children?: React.ReactNode   // Override default label text
  className?: string
}
```

**Variant styles:**
| variant | color | background | default label |
|---------|-------|------------|---------------|
| `easy` | `#2eb85c` | `rgba(46,184,92,0.1)` | EASY |
| `medium` | `#4d8aff` | `rgba(77,138,255,0.1)` | MEDIUM |
| `hard` | `#b060e0` | `rgba(176,96,224,0.1)` | HARD |
| `epic` | `#e86a20` | `rgba(232,106,32,0.1)` | EPIC |
| `pending` | `#fbbf24` | `rgba(251,191,36,0.1)` | ⏳ PENDING |
| `verified` | `#2eb85c` | `rgba(46,184,92,0.1)` | ✓ VERIFIED |
| `once` | `#6b5d44` (`var(--text-muted)`) | `rgba(107,93,68,0.1)` | ✦ ONCE |
| `daily` | `#c9a84c` | `rgba(201,168,76,0.1)` | ↻ DAILY |
| `weekly` | `#9b30ff` | `rgba(155,48,255,0.1)` | ◎ WEEKLY |
| `monthly` | `#60b0e0` | `rgba(96,176,224,0.1)` | ◎ MONTHLY |

**Base styles:** `display: inline-flex; align-items: center`, Press Start 2P 6px, `padding: 3px 6px`, `border: 1px solid currentColor`, `letter-spacing: 0.05em`.

---

### 5. PixelModal

**File:** `src/components/ui/PixelModal.tsx`

`'use client'` — renders a portal-free overlay inside the component tree (caller controls rendering with a boolean).

**Props interface:**
```typescript
interface PixelModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  maxWidth?: number      // default 380
}
```

**Overlay:** `position: fixed; inset: 0; background: rgba(0,0,0,0.78); z-index: 50; display: flex; align-items: center; justify-content: center`

**Modal box:**
- Border: Ancient/brown 9-slice, `border-width: 14px`
- Background: `#12131f` (`var(--bg-card-alt)`)
- Padding: 24px
- Max-width: `maxWidth` prop (default 380), width: 100%, `margin: 16px`

**Title (when `title` prop present):** Cinzel, 14px, `var(--gold-400)`, margin-bottom 12px

**Close button:** Press Start 2P, 8px, `var(--text-muted)` color. The modal box `div` has `position: relative`. The close button is a child of the modal box div with `position: absolute; top: -8px; right: -8px` — this places it over the top-right corner of the 9-slice border frame. Calls `onClose()` on click.

**Backdrop click:** Clicking the overlay background (outside the modal box) calls `onClose()`. Implement by giving the overlay an `onClick={onClose}` handler and the inner modal box an `onClick={e => e.stopPropagation()}` to prevent bubbling.

**Escape key:** `useEffect` adds a `keydown` listener when `open === true` that calls `onClose()` on `key === 'Escape'`; removes the listener on cleanup or when `open` becomes false.

**Behavior:** When `open` is false, renders `null`.

---

## Page Refactor Pass

After all 5 components are built, replace inline patterns in these files:

| File | What to replace |
|------|----------------|
| `src/app/dashboard/page.tsx` | Player XP level bar → `<PixelProgressBar variant="xp">`, inline level badges (LV{N}) → `<PixelBadge>`. **Exclude** the boss HP bar — it has dynamic color-shift (green→amber→red) and segment dividers not supported by `PixelProgressBar`. |
| `src/app/dashboard/chores/page.tsx` | Difficulty badges → `<PixelBadge variant={difficulty}>`, recurrence badges → `<PixelBadge variant={recurrence}>`, action buttons → `<PixelButton>` |
| `src/app/dashboard/loot/page.tsx` | Action buttons (edit, delete) → `<PixelButton>`. **Exclude** item category badges — `LootCategory` values (`real_reward`, `cosmetic`, `power_up`, `story_unlock`) are not `BadgeVariant` values and the ledger table layout is incompatible with `PixelCard`. |

**Scope limit:** Only replace elements that map cleanly to the new components. Do not restructure page layout or data-fetching logic. If a page does not exist yet, skip it.

---

## Barrel Export

Create `src/components/ui/index.ts` exporting all 5 components for clean imports:

```typescript
export { default as PixelButton } from './PixelButton'
export type { PixelButtonProps } from './PixelButton'

export { default as PixelCard } from './PixelCard'
export type { PixelCardProps } from './PixelCard'

export { default as PixelProgressBar } from './PixelProgressBar'
export type { PixelProgressBarProps } from './PixelProgressBar'

export { default as PixelBadge } from './PixelBadge'
export type { PixelBadgeProps } from './PixelBadge'

export { default as PixelModal } from './PixelModal'
export type { PixelModalProps } from './PixelModal'
```

---

## What This Does NOT Include

- No Storybook or visual regression tests — components are visually verified in-browser
- No CSS Modules or styled-components — inline styles + class names only (matches existing codebase)
- No animation beyond existing globals.css keyframes
- No accessibility beyond what HTML semantics provide naturally (`<button>`, `role="dialog"` on modal)
- No theming system — the 5 variants per component are the full set
