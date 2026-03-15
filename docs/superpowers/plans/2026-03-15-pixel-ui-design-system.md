# Pixel Art UI Design System Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build five reusable pixel-art React components (PixelButton, PixelCard, PixelProgressBar, PixelBadge, PixelModal) using Kenney 9-slice sprites, then replace ad-hoc inline styles in three existing dashboard pages.

**Architecture:** Components live in `src/components/ui/` as separate files, each self-contained with an inline `<style>` block. CSS `border-image` 9-slice renders Kenney 48×48 PNGs; CSS variables (`--spr`, `--spr-p`) injected via `style={}` prop drive the sprite swap. A barrel export at `src/components/ui/index.ts` exposes all five. Page refactors replace matching elements without touching data-fetching or layout logic.

**Tech Stack:** Next.js 14 App Router, TypeScript strict mode, Vitest (node env), `npx tsc --noEmit` for type-checking. No new npm packages required.

---

## Chunk 1: Core Components

### Task 1: PixelButton

**Files:**
- Modify: `src/app/globals.css`
- Create: `src/components/ui/PixelButton.tsx`

**Reference:** Spec § PixelButton — `docs/superpowers/specs/2026-03-15-pixel-ui-design-system.md`

**IMPORTANT architectural note:** `PixelButton` must NOT use a React Fragment `<><style>...</style><button>...</button></>`. When a Fragment-wrapped component (style + button) is placed inside a flex container with `gap`, the invisible `<style>` DOM element becomes a flex child and the gap is applied between `<style>` and `<button>`, causing buttons to appear incorrectly spaced. Instead, `.px-btn` shared styles go in `globals.css` (loaded globally by Next.js), and `PixelButton` returns just the `<button>` element.

Sprite paths (all served from `/public/` root):
- Yellow: `/sprites/ui/9-Slice/Colored/yellow.png` / `yellow_pressed.png`
- Grey: `/sprites/ui/9-Slice/Colored/grey.png` / `grey_pressed.png`
- Red: `/sprites/ui/9-Slice/Colored/red.png` / `red_pressed.png`
- Green: `/sprites/ui/9-Slice/Colored/green.png` / `green_pressed.png`

- [ ] **Step 1: Add `.px-btn` styles to `src/app/globals.css`**

At the end of `src/app/globals.css`, append:

```css
/* ── Pixel Button (PixelButton component) ────────────────────────────────── */
.px-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-style: solid;
  border-image: var(--spr) var(--slice) fill;
  image-rendering: pixelated;
  font-family: var(--font-pixel, 'Press Start 2P', monospace);
  color: #fff;
  cursor: pointer;
  background: transparent;
  transition: transform 0.08s, filter 0.08s;
  letter-spacing: 0.04em;
  line-height: 1.4;
  text-shadow: 1px 1px 0 rgba(0,0,0,0.6);
  outline: none;
}
.px-btn:hover:not(:disabled) {
  filter: brightness(1.15);
  transform: translateY(-1px);
}
.px-btn:active:not(:disabled) {
  border-image: var(--spr-p, var(--spr)) var(--slice) fill;
  transform: translateY(1px);
  filter: brightness(0.9);
}
.px-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
```

- [ ] **Step 2: Write `src/components/ui/PixelButton.tsx`**

```tsx
// src/components/ui/PixelButton.tsx
import React from 'react'

const SPRITE_MAP = {
  primary:   { n: '/sprites/ui/9-Slice/Colored/yellow.png',  p: '/sprites/ui/9-Slice/Colored/yellow_pressed.png'  },
  secondary: { n: '/sprites/ui/9-Slice/Colored/grey.png',    p: '/sprites/ui/9-Slice/Colored/grey_pressed.png'    },
  danger:    { n: '/sprites/ui/9-Slice/Colored/red.png',     p: '/sprites/ui/9-Slice/Colored/red_pressed.png'     },
  success:   { n: '/sprites/ui/9-Slice/Colored/green.png',   p: '/sprites/ui/9-Slice/Colored/green_pressed.png'   },
} as const

// borderSlice: unitless integer for CSS border-image-slice (e.g. "14")
// borderWidth: px value for CSS border-width layout (e.g. "14px")
// These MUST be separate — border-image-slice does not accept px units.
const SIZE_MAP = {
  sm: { fontSize: '7px',  padding: '0px 6px',  borderWidth: '12px', borderSlice: '12' },
  md: { fontSize: '9px',  padding: '2px 8px',  borderWidth: '14px', borderSlice: '14' },
  lg: { fontSize: '11px', padding: '4px 14px', borderWidth: '16px', borderSlice: '16' },
} as const

export interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
}

export default function PixelButton({
  variant = 'primary',
  size = 'md',
  disabled,
  style,
  children,
  ...rest
}: PixelButtonProps) {
  const spr = SPRITE_MAP[variant]
  const sz  = SIZE_MAP[size]

  // Returns a plain <button> — no Fragment wrapper. This is intentional.
  // The .px-btn class styles live in globals.css so no <style> tag is needed
  // here, which prevents the style element from becoming a flex child when
  // this button is used inside flex containers with gap.
  return (
    <button
      className="px-btn"
      disabled={disabled}
      style={{
        '--spr':   `url(${spr.n})`,
        '--spr-p': `url(${spr.p})`,
        '--slice': sz.borderSlice,   // unitless: "12", "14", or "16"
        fontSize:    sz.fontSize,
        padding:     sz.padding,
        borderWidth: sz.borderWidth, // with px: "12px", "14px", or "16px"
        ...style,
      } as React.CSSProperties}
      {...rest}
    >
      {children}
    </button>
  )
}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css src/components/ui/PixelButton.tsx
git commit -m "feat(ui): add PixelButton component with Kenney 9-slice sprites"
```

---

### Task 2: PixelCard

**Files:**
- Create: `src/components/ui/PixelCard.tsx`

**Reference:** Spec § PixelCard

- [ ] **Step 1: Write the file**

```tsx
// src/components/ui/PixelCard.tsx
import React from 'react'

export interface PixelCardProps {
  header?: React.ReactNode
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export default function PixelCard({ header, children, className, style }: PixelCardProps) {
  return (
    <>
      <style>{`
        .px-card {
          border-style: solid;
          border-width: 14px;
          border-image: url('/sprites/ui/9-Slice/Ancient/brown.png') 14 fill;
          image-rendering: pixelated;
          background: var(--bg-card, #1a1c2e);
          padding: 16px;
          color: var(--text-primary, #f0e6c8);
        }
        .px-card-header {
          font-family: var(--font-heading, 'Cinzel', serif);
          font-size: 11px;
          color: var(--gold-400, #e8a020);
          margin-bottom: 10px;
          letter-spacing: 0.1em;
          border-bottom: 1px solid rgba(201,168,76,0.2);
          padding-bottom: 8px;
        }
      `}</style>
      <div className={`px-card${className ? ` ${className}` : ''}`} style={style}>
        {header && <div className="px-card-header">{header}</div>}
        {children}
      </div>
    </>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/PixelCard.tsx
git commit -m "feat(ui): add PixelCard component with Ancient/brown 9-slice border"
```

---

### Task 3: PixelProgressBar

**Files:**
- Create: `src/components/ui/PixelProgressBar.tsx`

**Reference:** Spec § PixelProgressBar

- [ ] **Step 1: Write the file**

```tsx
// src/components/ui/PixelProgressBar.tsx
import React from 'react'

const FILL_GRADIENT = {
  xp:   'linear-gradient(90deg, #c95a00, #ff8c00, #ffc040)',
  hp:   'linear-gradient(90deg, #8b0000, #dd2222)',
  boss: 'linear-gradient(90deg, #7f0000, #cc0000)',
} as const

export interface PixelProgressBarProps {
  value: number
  max: number
  variant?: 'xp' | 'hp' | 'boss'
  label?: string
  showValue?: boolean
  className?: string
}

export default function PixelProgressBar({
  value,
  max,
  variant = 'xp',
  label,
  showValue = false,
  className,
}: PixelProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0

  return (
    <>
      <style>{`
        .px-progress-wrap {
          border-style: solid;
          border-width: 6px;
          border-image: url('/sprites/ui/9-Slice/Ancient/brown.png') 6 fill;
          image-rendering: pixelated;
          background: #0a0a12;
          overflow: hidden;
          height: 20px;
          position: relative;
        }
        .px-progress-fill {
          height: 100%;
          transition: width 0.4s ease;
        }
        .px-progress-label {
          font-family: var(--font-pixel, 'Press Start 2P', monospace);
          font-size: 7px;
          color: var(--text-muted, #6b5d44);
          margin-bottom: 4px;
          image-rendering: pixelated;
        }
        .px-progress-value {
          font-family: var(--font-pixel, 'Press Start 2P', monospace);
          font-size: 7px;
          color: var(--text-muted, #6b5d44);
          margin-top: 4px;
          image-rendering: pixelated;
        }
      `}</style>
      <div className={className}>
        {label && <div className="px-progress-label">{label}</div>}
        <div className="px-progress-wrap">
          <div
            className="px-progress-fill"
            style={{ width: `${pct}%`, background: FILL_GRADIENT[variant] }}
          />
        </div>
        {showValue && (
          <div className="px-progress-value">
            {value.toLocaleString()} / {max.toLocaleString()}
          </div>
        )}
      </div>
    </>
  )
}
```

- [ ] **Step 2: Write the test**

```typescript
// src/lib/__tests__/pixelProgressBar.test.ts
// Tests pure value clamping logic — no DOM required

import { describe, it, expect } from 'vitest'

// Mirror the clamping formula from PixelProgressBar
function clamp(value: number, max: number): number {
  return max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
}

describe('PixelProgressBar value clamping', () => {
  it('returns 0 when value is 0', () => {
    expect(clamp(0, 100)).toBe(0)
  })

  it('returns 100 when value equals max', () => {
    expect(clamp(100, 100)).toBe(100)
  })

  it('returns 100 when value exceeds max', () => {
    expect(clamp(150, 100)).toBe(100)
  })

  it('returns 0 when max is 0 (avoids div-by-zero)', () => {
    expect(clamp(50, 0)).toBe(0)
  })

  it('computes intermediate percentage correctly', () => {
    expect(clamp(25, 100)).toBe(25)
    expect(clamp(78, 100)).toBe(78)
  })

  it('returns 0 for negative value', () => {
    expect(clamp(-10, 100)).toBe(0)
  })
})
```

- [ ] **Step 3: Run the test — expect PASS**

```bash
npm test -- pixelProgressBar
```

Expected output: `6 passed`

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/PixelProgressBar.tsx src/lib/__tests__/pixelProgressBar.test.ts
git commit -m "feat(ui): add PixelProgressBar with Ancient/brown frame and variant fills"
```

---

### Task 4: PixelBadge

**Files:**
- Create: `src/components/ui/PixelBadge.tsx`

**Reference:** Spec § PixelBadge — all 10 variants including `once`

- [ ] **Step 1: Write the file**

```tsx
// src/components/ui/PixelBadge.tsx
import React from 'react'

type BadgeVariant =
  | 'easy' | 'medium' | 'hard' | 'epic'
  | 'pending' | 'verified'
  | 'once' | 'daily' | 'weekly' | 'monthly'

interface BadgeStyle {
  color: string
  bg: string
  defaultLabel: string
}

const BADGE_MAP: Record<BadgeVariant, BadgeStyle> = {
  easy:     { color: '#2eb85c', bg: 'rgba(46,184,92,0.1)',   defaultLabel: 'EASY'       },
  medium:   { color: '#4d8aff', bg: 'rgba(77,138,255,0.1)',  defaultLabel: 'MEDIUM'     },
  hard:     { color: '#b060e0', bg: 'rgba(176,96,224,0.1)',  defaultLabel: 'HARD'       },
  epic:     { color: '#e86a20', bg: 'rgba(232,106,32,0.1)',  defaultLabel: 'EPIC'       },
  pending:  { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  defaultLabel: '⏳ PENDING' },
  verified: { color: '#2eb85c', bg: 'rgba(46,184,92,0.1)',   defaultLabel: '✓ VERIFIED' },
  once:     { color: '#6b5d44', bg: 'rgba(107,93,68,0.1)',   defaultLabel: '✦ ONCE'     },
  daily:    { color: '#c9a84c', bg: 'rgba(201,168,76,0.1)',  defaultLabel: '↻ DAILY'    },
  weekly:   { color: '#9b30ff', bg: 'rgba(155,48,255,0.1)',  defaultLabel: '◎ WEEKLY'   },
  monthly:  { color: '#60b0e0', bg: 'rgba(96,176,224,0.1)', defaultLabel: '◎ MONTHLY'  },
}

export interface PixelBadgeProps {
  variant: BadgeVariant
  children?: React.ReactNode
  className?: string
}

export default function PixelBadge({ variant, children, className }: PixelBadgeProps) {
  const { color, bg, defaultLabel } = BADGE_MAP[variant]

  return (
    <>
      <style>{`
        .px-badge {
          display: inline-flex;
          align-items: center;
          font-family: var(--font-pixel, 'Press Start 2P', monospace);
          font-size: 6px;
          padding: 3px 6px;
          letter-spacing: 0.05em;
          line-height: 1;
          border: 1px solid currentColor;
          image-rendering: pixelated;
        }
      `}</style>
      <span
        className={`px-badge${className ? ` ${className}` : ''}`}
        style={{ color, background: bg }}
      >
        {children ?? defaultLabel}
      </span>
    </>
  )
}
```

- [ ] **Step 2: Write the test**

```typescript
// src/lib/__tests__/pixelBadge.test.ts
// Tests pure BADGE_MAP data — no DOM required

import { describe, it, expect } from 'vitest'

// Mirror the BADGE_MAP from PixelBadge
const BADGE_MAP = {
  easy:     { color: '#2eb85c', bg: 'rgba(46,184,92,0.1)',   defaultLabel: 'EASY'       },
  medium:   { color: '#4d8aff', bg: 'rgba(77,138,255,0.1)',  defaultLabel: 'MEDIUM'     },
  hard:     { color: '#b060e0', bg: 'rgba(176,96,224,0.1)',  defaultLabel: 'HARD'       },
  epic:     { color: '#e86a20', bg: 'rgba(232,106,32,0.1)',  defaultLabel: 'EPIC'       },
  pending:  { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  defaultLabel: '⏳ PENDING' },
  verified: { color: '#2eb85c', bg: 'rgba(46,184,92,0.1)',   defaultLabel: '✓ VERIFIED' },
  once:     { color: '#6b5d44', bg: 'rgba(107,93,68,0.1)',   defaultLabel: '✦ ONCE'     },
  daily:    { color: '#c9a84c', bg: 'rgba(201,168,76,0.1)',  defaultLabel: '↻ DAILY'    },
  weekly:   { color: '#9b30ff', bg: 'rgba(155,48,255,0.1)',  defaultLabel: '◎ WEEKLY'   },
  monthly:  { color: '#60b0e0', bg: 'rgba(96,176,224,0.1)', defaultLabel: '◎ MONTHLY'  },
} as const

describe('PixelBadge BADGE_MAP', () => {
  it('has all 10 required variants', () => {
    const keys = Object.keys(BADGE_MAP)
    expect(keys).toHaveLength(10)
    for (const k of ['easy','medium','hard','epic','pending','verified','once','daily','weekly','monthly']) {
      expect(keys).toContain(k)
    }
  })

  it('every variant has color, bg, defaultLabel strings', () => {
    for (const [k, v] of Object.entries(BADGE_MAP)) {
      expect(v.color,        `${k}.color`).toMatch(/^#[0-9a-f]{6}$/i)
      expect(v.bg,           `${k}.bg`).toMatch(/^rgba/)
      expect(v.defaultLabel, `${k}.defaultLabel`).toBeTruthy()
    }
  })

  it('once variant uses muted gold color', () => {
    expect(BADGE_MAP.once.color).toBe('#6b5d44')
  })
})
```

- [ ] **Step 3: Run test — expect PASS**

```bash
npm test -- pixelBadge
```

Expected output: `3 passed`

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/PixelBadge.tsx src/lib/__tests__/pixelBadge.test.ts
git commit -m "feat(ui): add PixelBadge with 10 variants (difficulty, status, recurrence)"
```

---

### Task 5: PixelModal

**Files:**
- Create: `src/components/ui/PixelModal.tsx`

**Reference:** Spec § PixelModal — `'use client'`, backdrop click closes, Escape key closes, renders null when closed

- [ ] **Step 1: Write the file**

```tsx
// src/components/ui/PixelModal.tsx
'use client'

import React, { useEffect } from 'react'

// Note for callers: wrap your onClose handler with useCallback to avoid
// unnecessary effect re-registrations on each parent render:
//   const handleClose = useCallback(() => setOpen(false), [])
//   <PixelModal open={open} onClose={handleClose} ...>

export interface PixelModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  maxWidth?: number
}

export default function PixelModal({
  open,
  onClose,
  title,
  children,
  maxWidth = 380,
}: PixelModalProps) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      <style>{`
        .px-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.78);
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        .px-modal-box {
          position: relative;
          border-style: solid;
          border-width: 14px;
          border-image: url('/sprites/ui/9-Slice/Ancient/brown.png') 14 fill;
          image-rendering: pixelated;
          background: var(--bg-card-alt, #12131f);
          padding: 24px;
          width: 100%;
          color: var(--text-primary, #f0e6c8);
        }
        .px-modal-title {
          font-family: var(--font-heading, 'Cinzel', serif);
          font-size: 14px;
          color: var(--gold-400, #e8a020);
          margin-bottom: 12px;
        }
        .px-modal-close {
          position: absolute;
          top: -8px;
          right: -8px;
          font-family: var(--font-pixel, 'Press Start 2P', monospace);
          font-size: 8px;
          cursor: pointer;
          color: var(--text-muted, #6b5d44);
          background: none;
          border: none;
          padding: 4px;
          image-rendering: pixelated;
        }
        .px-modal-close:hover {
          color: var(--text-primary, #f0e6c8);
        }
      `}</style>
      {/* Overlay — click outside closes */}
      <div className="px-modal-overlay" onClick={onClose}>
        {/* Modal box — stop propagation so clicking inside doesn't close */}
        <div
          className="px-modal-box"
          style={{ maxWidth }}
          onClick={e => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'px-modal-title' : undefined}
        >
          <button className="px-modal-close" onClick={onClose} aria-label="Close">✕</button>
          {title && <div id="px-modal-title" className="px-modal-title">{title}</div>}
          {children}
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/PixelModal.tsx
git commit -m "feat(ui): add PixelModal with Ancient/brown border, backdrop+Escape close"
```

---

## Chunk 2: Barrel Export and Page Refactors

### Task 6: Barrel Export

**Files:**
- Create: `src/components/ui/index.ts`

- [ ] **Step 1: Write the file**

```typescript
// src/components/ui/index.ts
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

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/index.ts
git commit -m "feat(ui): add barrel export for pixel UI components"
```

---

### Task 7: Refactor — Dashboard Overview Page

**Files:**
- Modify: `src/app/dashboard/page.tsx`

**What to replace (exact targets, do NOT touch anything else):**

1. **Player XP level bars** (lines ~364–381): Replace the `.xp-bar-track` / `.xp-bar-fill` divs with `<PixelProgressBar>`.
2. **Level badge** (lines ~330–340): Replace the inline `<span>` level badge (`LV{N}`) with `<PixelBadge>`.

**What NOT to touch:**
- The boss HP bar — it has dynamic color-shift and segment dividers not in PixelProgressBar scope. Leave it exactly as is.
- The `bossHpColor` function, `boss-hp-track`, `boss-hp-fill` CSS — leave intact.
- All data fetching, state, layout.

**Implementation notes:**
- `dashboard/page.tsx` is a server component (no `'use client'`). `PixelProgressBar` and `PixelBadge` have no browser-only APIs so they can render in server components.
- Add `import { PixelProgressBar, PixelBadge } from '@/components/ui'` at the top.
- The `LV{N}` badge doesn't directly map to a named variant. Use `variant="daily"` (gold color) with children overriding the default label — gold matches the existing level badge appearance.

- [ ] **Step 1: Add import at the top of `src/app/dashboard/page.tsx`**

After the existing imports, add:
```typescript
import { PixelProgressBar, PixelBadge } from '@/components/ui'
```

- [ ] **Step 2: Replace the XP bar**

Find this block (inside the player card map, around line 365):
```tsx
{/* ── XP progress bar ─── */}
<div style={{ marginBottom: '0.65rem' }}>
  <div className="xp-bar-track">
    <div className="xp-bar-fill" style={{ width: `${pct}%` }} />
  </div>
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 4,
    fontFamily: 'Cinzel, serif',
    fontWeight: 300,
    fontSize: '0.62rem',
    color: 'rgba(200,215,255,0.3)',
  }}>
    <span>{current.toLocaleString()} XP</span>
    <span>{needed.toLocaleString()} to Lv.{player.level + 1}</span>
  </div>
</div>
```

Replace with:
```tsx
{/* ── XP progress bar ─── */}
<div style={{ marginBottom: '0.65rem' }}>
  <PixelProgressBar
    value={current}
    max={needed}
    variant="xp"
    showValue={false}
  />
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 4,
    fontFamily: 'Cinzel, serif',
    fontWeight: 300,
    fontSize: '0.62rem',
    color: 'rgba(200,215,255,0.3)',
  }}>
    <span>{current.toLocaleString()} XP</span>
    <span>{needed.toLocaleString()} to Lv.{player.level + 1}</span>
  </div>
</div>
```

- [ ] **Step 3: Replace the level badge**

Find this block (the level badge span, around line 330):
```tsx
{/* Level badge */}
<span style={{
  fontFamily: "'Press Start 2P', monospace",
  fontSize: '0.48rem',
  color: '#c9a84c',
  background: 'rgba(201,168,76,0.08)',
  border: '1px solid rgba(201,168,76,0.25)',
  padding: '2px 5px',
  borderRadius: 2,
  imageRendering: 'pixelated',
  flexShrink: 0,
}}>
  LV{player.level}
</span>
```

Replace with:
```tsx
{/* Level badge — uses 'daily' variant for gold color; children override default label */}
<span style={{ flexShrink: 0 }}>
  <PixelBadge variant="daily">LV{player.level}</PixelBadge>
</span>
```

`PixelBadge` doesn't accept a `style` prop, so the `flexShrink` wrapper span is required.
Using `variant="daily"` is intentional — it provides the gold color that matches the existing badge appearance, with children overriding the default "↻ DAILY" label.

- [ ] **Step 4: Remove the now-unused `pct` variable**

The `levelProgress()` function returns `{ current, needed, pct }`. After replacing the XP bar, `pct` is no longer used. Removing it avoids a TypeScript strict-mode error.

In the player card map (around line 292), find:
```tsx
const { current, needed, pct } = levelProgress(player.xp_total, player.level)
```

Replace with:
```tsx
const { current, needed } = levelProgress(player.xp_total, player.level)
```

- [ ] **Step 5: Remove the now-unused CSS classes from the `<style>` block**

In the inline `<style suppressHydrationWarning>` block at the top of the render, delete the `.xp-bar-track` and `.xp-bar-fill` CSS rules (they are no longer used). Leave `.boss-hp-track`, `.boss-hp-fill`, and all other rules intact.

- [ ] **Step 6: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 7: Verify in browser**

```bash
npm run dev
```

Navigate to `http://localhost:3000/dashboard`. Confirm:
- Player XP bars show the Ancient/brown pixel frame
- Level badges show gold pixel text
- The boss HP bar is unchanged (green→amber→red dynamic gradient still works)

- [ ] **Step 8: Commit**

```bash
git add src/app/dashboard/page.tsx
git commit -m "refactor(dashboard): use PixelProgressBar and PixelBadge for player XP and level"
```

---

### Task 8: Refactor — Chores Page

**Files:**
- Modify: `src/app/dashboard/chores/page.tsx`

**What to replace:**
1. **Difficulty badge spans** in the chore list cards (the inline `<span>` with `DIFF_META[diff]` colors)
2. **Recurrence display** in the chore list cards (currently rendered as `{REC_META[rec].icon} {REC_META[rec].label}` in a muted span)
3. **Edit and End action buttons** (`.act-btn edit` and `.act-btn deact` classes)

**What NOT to touch:**
- The form's difficulty selector buttons (`.diff-btn`) — these are toggle-style selectors, not badges
- The recurrence selector buttons (`.rec-btn`) — these are toggle-style selectors
- The filter pills (`.filter-pill`) — these are filter toggles, not status indicators
- The submit button (`.decree-btn`), generate button (`.gen-btn`), cancel button
- All form logic, data fetching, state

`chores/page.tsx` is `'use client'` so all pixel components work here.

- [ ] **Step 1: Add import**

After existing imports in `src/app/dashboard/chores/page.tsx`:
```typescript
import { PixelBadge, PixelButton } from '@/components/ui'
```

- [ ] **Step 2: Replace the difficulty badge in the chore card**

Find the difficulty badge span inside `filtered.map(chore => ...)` (around line 551):
```tsx
{/* Difficulty badge */}
<span style={{
  fontFamily: 'var(--font-pixel, "Press Start 2P", monospace)',
  fontSize: '0.4rem',
  imageRendering: 'pixelated',
  padding: '2px 5px',
  borderRadius: 2,
  background: meta.bg,
  border: `1px solid ${meta.border}`,
  color: meta.color,
  flexShrink: 0,
}}>
  {meta.label.toUpperCase()}
</span>
```

Replace with:
```tsx
{/* Difficulty badge */}
<PixelBadge variant={diff} />
```

(`diff` is already typed as `Difficulty` which maps to `'easy' | 'medium' | 'hard' | 'epic'` — all valid `BadgeVariant` values)

- [ ] **Step 3: Replace the recurrence display**

Find the recurrence text span in the chore card header row (around line 579):
```tsx
{/* Recurrence badge */}
<span style={{
  fontFamily: 'var(--font-heading, Cinzel, serif)',
  fontWeight: 300,
  fontSize: '0.65rem',
  color: 'rgba(200,215,255,0.3)',
  flexShrink: 0,
}}>
  {REC_META[rec].icon} {REC_META[rec].label}
</span>
```

Replace with:
```tsx
{/* Recurrence badge */}
<PixelBadge variant={rec} />
```

(`rec` is typed as `Recurrence = 'once' | 'daily' | 'weekly' | 'monthly'` — all valid `BadgeVariant` values)

- [ ] **Step 4: Replace the Edit action button**

Find (around line 630):
```tsx
<button className="act-btn edit" onClick={() => startEdit(chore)}>
  ✎ Edit
</button>
```

Replace with:
```tsx
<PixelButton variant="secondary" size="sm" onClick={() => startEdit(chore)}>
  ✎ Edit
</PixelButton>
```

- [ ] **Step 5: Replace the End (deactivate) action button**

Find (around line 633):
```tsx
<button
  className="act-btn deact"
  disabled={isDeactivating}
  onClick={() => handleDeactivate(chore.id)}
>
  {isDeactivating ? '…' : '✕ End'}
</button>
```

Replace with:
```tsx
<PixelButton
  variant="danger"
  size="sm"
  disabled={isDeactivating}
  onClick={() => handleDeactivate(chore.id)}
>
  {isDeactivating ? '…' : '✕ End'}
</PixelButton>
```

- [ ] **Step 6: Remove now-unused CSS from the `<style>` block**

In the inline `<style suppressHydrationWarning>` block, delete the `.act-btn`, `.act-btn.edit`, `.act-btn.deact` rules. The `.act-btn:disabled` rule can also be removed. Leave all other rules (`.diff-btn`, `.rec-btn`, `.filter-pill`, `.decree-btn`, `.gen-btn`, `.spinner`, `.slide-in`, `.chore-card`, `.ch-input`, `.ch-label`).

- [ ] **Step 7: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 8: Verify in browser**

Navigate to `http://localhost:3000/dashboard/chores`. Confirm:
- Chore cards show PixelBadge for difficulty and recurrence
- Edit button shows grey Kenney sprite
- End button shows red Kenney sprite
- All form elements (difficulty selector, recurrence toggle, submit) are unchanged

- [ ] **Step 9: Commit**

```bash
git add src/app/dashboard/chores/page.tsx
git commit -m "refactor(chores): use PixelBadge and PixelButton in quest board cards"
```

---

### Task 9: Refactor — Loot Page

**Files:**
- Modify: `src/app/dashboard/loot/page.tsx`

**What to replace:**
1. **Category badge spans** in ledger rows (the inline `<span>` with `meta.bg`/`meta.border`/`meta.color` for category)
2. **Edit action button** (`.act-btn.edit`)
3. **The `DeleteBtn` component's danger button** (`.act-btn.danger` and `.act-btn.del`)

**What NOT to touch:**
- The availability toggle button (`.avail-toggle`) — it's a functional on/off toggle, not a badge
- Filter pills (`.f-pill`)
- The ledger table structure, form, submit button (`.stock-btn`), cancel button
- The `DeleteBtn` component's state logic (confirming/setConfirming) — only replace the rendered button element

The loot page categories (`real_reward`, `cosmetic`, `power_up`, `story_unlock`) do NOT map to `PixelBadge` variants (the badge only has difficulty/status/recurrence variants). For the category badge, keep it as an inline span — it uses emoji icons and custom colors from `CAT_META` that don't match the badge variants. **Skip the category badge replacement.**

So the actual replacements are only the **Edit** and **Delete** action buttons.

- [ ] **Step 1: Add import**

After existing imports in `src/app/dashboard/loot/page.tsx`:
```typescript
import { PixelButton } from '@/components/ui'
```

- [ ] **Step 2: Replace the Edit button in ledger rows**

Find (around line 649):
```tsx
<button
  className="act-btn edit"
  onClick={() => startEdit(item)}
  disabled={isBusy}
>
  ✎
</button>
```

Replace with:
```tsx
<PixelButton
  variant="secondary"
  size="sm"
  onClick={() => startEdit(item)}
  disabled={isBusy}
>
  ✎
</PixelButton>
```

- [ ] **Step 3: Replace the DeleteBtn rendered buttons**

The `DeleteBtn` component (lines ~42–68) renders two states. Replace both buttons:

**Default state (del):**
```tsx
// Before:
<button
  className="act-btn del"
  onClick={() => setConfirming(true)}
  disabled={disabled}
>
  ✕
</button>

// After:
<PixelButton
  variant="danger"
  size="sm"
  onClick={() => setConfirming(true)}
  disabled={disabled}
>
  ✕
</PixelButton>
```

**Confirming state (danger):**
```tsx
// Before:
<button
  className="act-btn danger"
  onClick={onConfirm}
  disabled={disabled}
>
  Sure?
</button>

// After:
<PixelButton
  variant="danger"
  size="sm"
  onClick={onConfirm}
  disabled={disabled}
>
  Sure?
</PixelButton>
```

- [ ] **Step 4: Remove now-unused CSS**

In the `<style suppressHydrationWarning>` block, delete the `.act-btn`, `.act-btn.edit`, `.act-btn.del`, `.act-btn.danger`, `.act-btn:disabled` rules. Leave `.loot-label`, `.loot-input`, `.avail-toggle`, `.f-pill`, `.ledger-*`, `.stock-btn`, `.spinner`, `.fadein`, and the media queries.

- [ ] **Step 5: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 6: Verify in browser**

Navigate to `http://localhost:3000/dashboard/loot`. Confirm:
- Edit button shows grey Kenney sprite
- Delete button shows red Kenney sprite
- Confirming state ("Sure?") also shows red Kenney sprite
- Availability toggles are unchanged
- Category badges are unchanged (inline spans)

- [ ] **Step 7: Run full test suite**

```bash
npm test
```

Expected: all tests pass (including the new pixelProgressBar and pixelBadge tests)

- [ ] **Step 8: Final type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 9: Commit**

```bash
git add src/app/dashboard/loot/page.tsx
git commit -m "refactor(loot): use PixelButton for edit and delete actions in ledger rows"
```
