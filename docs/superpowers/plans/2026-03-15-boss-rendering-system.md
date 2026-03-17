# Boss Rendering System Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete boss rendering system — palette-swap colorization, CSS particle effects, animated HP bar, and an animated Canvas boss sprite — culminating in a working `/play/boss` test-harness page using the Week 1 boss (Thornmaw / demon sprite).

**Architecture:** `palette.ts` holds palette data + pure luminance-colorization logic; `particles.ts` holds CSS keyframe strings + particle style generators; `BossHPBar.tsx` is a pure presentational HP bar; `BossSprite.tsx` is a `'use client'` Canvas component that loads sprites, applies palette swap, animates idle frames, renders CSS particles, and exposes `takeDamage()`/`defeat()` via `useImperativeHandle`; the boss page (`/play/boss/page.tsx`) wires everything together as a test harness.

**Tech Stack:** Next.js 14 App Router, TypeScript, Canvas 2D API, Vitest (node/jsdom), CSS animations, `spriteUrl()` from `src/lib/sprites/manifest.ts`

---

## Chunk 1: Data Layer (palette.ts + particles.ts)

### Task 0: Preflight — Install jsdom

The palette tests use `@vitest-environment jsdom` (needed for `ImageData`). The `jsdom` package must be installed separately.

**Files:**
- Modify: `package.json` (add `jsdom` devDependency via npm)

---

- [ ] **Step 0.1: Install jsdom**

```bash
npm install -D jsdom @types/jsdom
```

- [ ] **Step 0.2: Verify install**

```bash
npm test
```

Expected: All existing tests PASS (xp.test.ts still green)

- [ ] **Step 0.3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install jsdom for vitest browser-environment tests"
```

---

### Task 1: Boss Palette Data and Luminance Colorization

**Files:**
- Create: `src/lib/sprites/palette.ts`
- Create: `src/lib/__tests__/palette.test.ts`

---

- [ ] **Step 1.1: Write the failing tests**

Create `src/lib/__tests__/palette.test.ts`:

```typescript
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest'
import { BOSS_PALETTES, BOSS_SPRITE_MANIFEST, swapPalette } from '../sprites/palette'

describe('BOSS_PALETTES', () => {
  it('has the four required palettes', () => {
    expect(BOSS_PALETTES).toHaveProperty('hollow_dark')
    expect(BOSS_PALETTES).toHaveProperty('ember_corrupt')
    expect(BOSS_PALETTES).toHaveProperty('frost_hollow')
    expect(BOSS_PALETTES).toHaveProperty('ash_gray')
  })

  it('each palette has primary, secondary, accent, glow hex strings', () => {
    for (const [key, palette] of Object.entries(BOSS_PALETTES)) {
      expect(palette.primary,   `${key}.primary`).toMatch(/^#[0-9a-f]{6}$/i)
      expect(palette.secondary, `${key}.secondary`).toMatch(/^#[0-9a-f]{6}$/i)
      expect(palette.accent,    `${key}.accent`).toMatch(/^#[0-9a-f]{6}$/i)
      expect(palette.glow,      `${key}.glow`).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })
})

describe('BOSS_SPRITE_MANIFEST', () => {
  it('has folder-format entries for the six named bosses', () => {
    for (const key of ['demon', 'dragon', 'small_dragon', 'jinn', 'medusa', 'lizard']) {
      expect(BOSS_SPRITE_MANIFEST[key].format).toBe('folder')
    }
  })

  it('folder entries have idleFrames with 3 items', () => {
    expect(BOSS_SPRITE_MANIFEST.demon.idleFrames).toHaveLength(3)
    expect(BOSS_SPRITE_MANIFEST.demon.idleFrames![0]).toBe('Idle1.png')
  })

  it('has sheet-format entries for sheet sprites', () => {
    for (const key of ['bat', 'ghost', 'slime', 'eyeball', 'pumpking', 'bee', 'big_worm', 'snake']) {
      expect(BOSS_SPRITE_MANIFEST[key].format).toBe('sheet')
    }
  })

  it('sheet entries have cellW and cellH of 64', () => {
    expect(BOSS_SPRITE_MANIFEST.bat.cellW).toBe(64)
    expect(BOSS_SPRITE_MANIFEST.bat.cellH).toBe(64)
  })
})

describe('swapPalette', () => {
  const hollow = BOSS_PALETTES.hollow_dark

  it('leaves fully transparent pixels unchanged', () => {
    // 1×1 transparent pixel
    const input = new ImageData(new Uint8ClampedArray([0, 0, 0, 0]), 1, 1)
    const output = swapPalette(input, hollow)
    expect(output.data[3]).toBe(0)
  })

  it('maps a pure-white pixel to the accent color', () => {
    const input = new ImageData(new Uint8ClampedArray([255, 255, 255, 255]), 1, 1)
    const output = swapPalette(input, hollow)
    // accent of hollow_dark is #9b30ff → r=155, g=48, b=255
    expect(output.data[0]).toBeCloseTo(155, -1)
    expect(output.data[1]).toBeCloseTo(48, -1)
    expect(output.data[2]).toBeCloseTo(255, -1)
    expect(output.data[3]).toBe(255)
  })

  it('maps a pure-black pixel to near-black (dark band)', () => {
    const input = new ImageData(new Uint8ClampedArray([0, 0, 0, 255]), 1, 1)
    const output = swapPalette(input, hollow)
    // luminance = 0 → t = 0 → lerp(0, primary) = 0
    expect(output.data[0]).toBe(0)
    expect(output.data[1]).toBe(0)
    expect(output.data[2]).toBe(0)
    expect(output.data[3]).toBe(255)
  })

  it('does not mutate the input ImageData', () => {
    const raw = new Uint8ClampedArray([128, 128, 128, 255])
    const input = new ImageData(raw, 1, 1)
    const before = Array.from(input.data)
    swapPalette(input, hollow)
    expect(Array.from(input.data)).toEqual(before)
  })
})
```

- [ ] **Step 1.2: Run tests — expect failure (module not found)**

```bash
npm test src/lib/__tests__/palette.test.ts
```

Expected: FAIL — `Cannot find module '../sprites/palette'`

- [ ] **Step 1.3: Implement `src/lib/sprites/palette.ts`**

```typescript
// src/lib/sprites/palette.ts

export interface BossPalette {
  /** Hex color for the dark luminance band (L < 85) */
  primary: string
  /** Hex color for the mid luminance band (85 ≤ L < 170) */
  secondary: string
  /** Hex color for the bright luminance band (L ≥ 170) */
  accent: string
  /** CSS glow color for drop-shadow filter */
  glow: string
}

export const BOSS_PALETTES: Record<string, BossPalette> = {
  hollow_dark: {
    primary:   '#1a0a2e',
    secondary: '#4a0080',
    accent:    '#9b30ff',
    glow:      '#4a0080',
  },
  ember_corrupt: {
    primary:   '#1a0500',
    secondary: '#c0390a',
    accent:    '#ff8c00',
    glow:      '#ff4500',
  },
  frost_hollow: {
    primary:   '#000d1a',
    secondary: '#0066aa',
    accent:    '#aaddff',
    glow:      '#00ccff',
  },
  ash_gray: {
    primary:   '#0d0d0d',
    secondary: '#555555',
    accent:    '#c8c8c8',
    glow:      '#888888',
  },
}

// ---------------------------------------------------------------------------
// Boss sprite manifest
// ---------------------------------------------------------------------------

export type BossSpriteFormat = 'folder' | 'sheet'

export interface BossSpriteInfo {
  format: BossSpriteFormat
  /** Folder path prefix (folder) or single PNG path (sheet), relative to /sprites */
  basePath: string
  /** Sheet only: individual cell width in pixels */
  cellW?: number
  /** Sheet only: individual cell height in pixels */
  cellH?: number
  /** Sheet only: number of columns */
  cols?: number
  /** Sheet only: number of rows */
  rows?: number
  /** Folder only: idle animation frame filenames (e.g. ['Idle1.png', 'Idle2.png', 'Idle3.png']) */
  idleFrames?: string[]
}

export const BOSS_SPRITE_MANIFEST: Record<string, BossSpriteInfo> = {
  // --- Folder-based: 256×256 individual PNGs ---
  demon: {
    format: 'folder',
    basePath: 'bosses/demon',
    idleFrames: ['Idle1.png', 'Idle2.png', 'Idle3.png'],
  },
  dragon: {
    format: 'folder',
    basePath: 'bosses/dragon',
    idleFrames: ['Idle1.png', 'Idle2.png', 'Idle3.png'],
  },
  small_dragon: {
    format: 'folder',
    basePath: 'bosses/small_dragon',
    idleFrames: ['Idle1.png', 'Idle2.png', 'Idle3.png'],
  },
  jinn: {
    format: 'folder',
    basePath: 'bosses/jinn_animation',
    idleFrames: ['Idle1.png', 'Idle2.png', 'Idle3.png'],
  },
  medusa: {
    format: 'folder',
    basePath: 'bosses/medusa',
    idleFrames: ['Idle1.png', 'Idle2.png', 'Idle3.png'],
  },
  lizard: {
    format: 'folder',
    basePath: 'bosses/lizard',
    idleFrames: ['Idle1.png', 'Idle2.png', 'Idle3.png'],
  },
  // --- Sheet-based: single PNG, 64×64 cells ---
  bat: {
    format: 'sheet',
    basePath: 'bosses/bat.png',
    cellW: 64, cellH: 64, cols: 7, rows: 4,
  },
  ghost: {
    format: 'sheet',
    basePath: 'bosses/ghost.png',
    cellW: 64, cellH: 64, cols: 6, rows: 4,
  },
  slime: {
    format: 'sheet',
    basePath: 'bosses/slime.png',
    cellW: 64, cellH: 64, cols: 8, rows: 4,
  },
  eyeball: {
    format: 'sheet',
    basePath: 'bosses/eyeball.png',
    cellW: 64, cellH: 64, cols: 7, rows: 4,
  },
  pumpking: {
    format: 'sheet',
    basePath: 'bosses/pumpking.png',
    cellW: 64, cellH: 64, cols: 6, rows: 4,
  },
  bee: {
    format: 'sheet',
    basePath: 'bosses/bee.png',
    cellW: 64, cellH: 64, cols: 3, rows: 2,
  },
  big_worm: {
    format: 'sheet',
    basePath: 'bosses/big_worm.png',
    cellW: 64, cellH: 64, cols: 6, rows: 4,
  },
  man_eater_flower: {
    format: 'sheet',
    basePath: 'bosses/man_eater_flower.png',
    cellW: 64, cellH: 64, cols: 12, rows: 8,
  },
  small_worm: {
    format: 'sheet',
    basePath: 'bosses/small_worm.png',
    cellW: 64, cellH: 64, cols: 11, rows: 4,
  },
  snake: {
    format: 'sheet',
    basePath: 'bosses/snake.png',
    cellW: 64, cellH: 64, cols: 7, rows: 4,
  },
}

// ---------------------------------------------------------------------------
// Luminance colorization palette swap
// ---------------------------------------------------------------------------

/**
 * Applies luminance-colorization to every opaque pixel in `imageData`.
 * Maps three luminance bands to palette.primary / secondary / accent via lerp.
 * Returns a new ImageData — does NOT mutate the input.
 *
 * Band mapping:
 *   L < 85  → lerp(black, primary,   L / 85)
 *   L < 170 → lerp(primary, secondary, (L - 85) / 85)
 *   L ≥ 170 → lerp(secondary, accent,  (L - 170) / 85)
 */
export function swapPalette(imageData: ImageData, palette: BossPalette): ImageData {
  const src = imageData.data
  const dst = new Uint8ClampedArray(src.length)
  dst.set(src) // copy alpha + start values

  const primary   = hexToRgb(palette.primary)
  const secondary = hexToRgb(palette.secondary)
  const accent    = hexToRgb(palette.accent)

  for (let i = 0; i < dst.length; i += 4) {
    if (dst[i + 3] === 0) continue // fully transparent — skip

    const r = dst[i], g = dst[i + 1], b = dst[i + 2]
    const lum = 0.299 * r + 0.587 * g + 0.114 * b

    let nr: number, ng: number, nb: number

    if (lum < 85) {
      const t = lum / 85
      nr = Math.round(lerp(0, primary.r, t))
      ng = Math.round(lerp(0, primary.g, t))
      nb = Math.round(lerp(0, primary.b, t))
    } else if (lum < 170) {
      const t = (lum - 85) / 85
      nr = Math.round(lerp(primary.r, secondary.r, t))
      ng = Math.round(lerp(primary.g, secondary.g, t))
      nb = Math.round(lerp(primary.b, secondary.b, t))
    } else {
      const t = (lum - 170) / 85
      nr = Math.round(lerp(secondary.r, accent.r, t))
      ng = Math.round(lerp(secondary.g, accent.g, t))
      nb = Math.round(lerp(secondary.b, accent.b, t))
    }

    dst[i] = nr; dst[i + 1] = ng; dst[i + 2] = nb
    // dst[i + 3] unchanged (alpha preserved)
  }

  return new ImageData(dst, imageData.width, imageData.height)
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const n = parseInt(hex.replace('#', ''), 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t))
}
```

- [ ] **Step 1.4: Run tests — expect pass**

```bash
npm test src/lib/__tests__/palette.test.ts
```

Expected: All 8 tests PASS

- [ ] **Step 1.5: Commit**

```bash
git add src/lib/sprites/palette.ts src/lib/__tests__/palette.test.ts
git commit -m "feat: add BOSS_PALETTES, BOSS_SPRITE_MANIFEST, and swapPalette (luminance colorization)"
```

---

### Task 2: CSS Particle Effect Definitions

**Files:**
- Create: `src/lib/sprites/particles.ts`
- Create: `src/lib/__tests__/particles.test.ts`

---

- [ ] **Step 2.1: Write the failing tests**

Create `src/lib/__tests__/particles.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { PARTICLE_DEFS, PARTICLE_CSS_KEYFRAMES } from '../sprites/particles'

describe('PARTICLE_CSS_KEYFRAMES', () => {
  it('is a non-empty string containing @keyframes', () => {
    expect(typeof PARTICLE_CSS_KEYFRAMES).toBe('string')
    expect(PARTICLE_CSS_KEYFRAMES).toContain('@keyframes')
  })

  it('defines all four animation names', () => {
    expect(PARTICLE_CSS_KEYFRAMES).toContain('ember-float')
    expect(PARTICLE_CSS_KEYFRAMES).toContain('shadow-tendril')
    expect(PARTICLE_CSS_KEYFRAMES).toContain('glow-pulse')
    expect(PARTICLE_CSS_KEYFRAMES).toContain('dark-aura')
  })
})

describe('PARTICLE_DEFS', () => {
  it('has the four required particle types', () => {
    expect(PARTICLE_DEFS).toHaveProperty('ember_float')
    expect(PARTICLE_DEFS).toHaveProperty('shadow_tendril')
    expect(PARTICLE_DEFS).toHaveProperty('glow_pulse')
    expect(PARTICLE_DEFS).toHaveProperty('dark_aura')
  })

  it('each particle def has count > 0', () => {
    for (const [key, def] of Object.entries(PARTICLE_DEFS)) {
      expect(def.count, `${key}.count`).toBeGreaterThan(0)
    }
  })

  it('each particle def has a style function', () => {
    for (const [key, def] of Object.entries(PARTICLE_DEFS)) {
      expect(typeof def.style, `${key}.style`).toBe('function')
    }
  })

  it('style functions return objects with position: absolute', () => {
    for (const [key, def] of Object.entries(PARTICLE_DEFS)) {
      const style = def.style(0, def.count)
      expect(style.position, `${key} style.position`).toBe('absolute')
    }
  })

  it('style functions produce consistent output (no Math.random)', () => {
    for (const [key, def] of Object.entries(PARTICLE_DEFS)) {
      const a = def.style(0, def.count)
      const b = def.style(0, def.count)
      expect(JSON.stringify(a), `${key} style is deterministic`).toBe(JSON.stringify(b))
    }
  })

  it('ember_float has count 8', () => {
    expect(PARTICLE_DEFS.ember_float.count).toBe(8)
  })

  it('glow_pulse has count 1', () => {
    expect(PARTICLE_DEFS.glow_pulse.count).toBe(1)
  })
})
```

- [ ] **Step 2.2: Run tests — expect failure**

```bash
npm test src/lib/__tests__/particles.test.ts
```

Expected: FAIL — `Cannot find module '../sprites/particles'`

- [ ] **Step 2.3: Implement `src/lib/sprites/particles.ts`**

```typescript
// src/lib/sprites/particles.ts

import type { CSSProperties } from 'react'

export interface ParticleDef {
  /** Number of particle elements to render */
  count: number
  /** CSS @keyframes animation name used by this particle */
  keyframes: string
  /**
   * Returns CSS styles for particle element at index `i` of `total`.
   * MUST be deterministic — no Math.random().
   */
  style: (i: number, total: number) => CSSProperties
}

/** CSS @keyframes declarations for all particle animations. Inject once into a <style> tag. */
export const PARTICLE_CSS_KEYFRAMES = `
@keyframes ember-float {
  0%   { transform: translateY(0) scale(1); opacity: 0.9; }
  50%  { transform: translateY(-30px) scale(0.8) translateX(8px); opacity: 0.6; }
  100% { transform: translateY(-60px) scale(0.4) translateX(-4px); opacity: 0; }
}
@keyframes shadow-tendril {
  0%   { transform: scaleY(1) scaleX(1); opacity: 0.7; }
  50%  { transform: scaleY(1.4) scaleX(0.7); opacity: 0.4; }
  100% { transform: scaleY(0.6) scaleX(1.2); opacity: 0.7; }
}
@keyframes glow-pulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50%       { opacity: 0.8; transform: scale(1.15); }
}
@keyframes dark-aura {
  0%   { transform: rotate(0deg) scale(1); opacity: 0.5; }
  33%  { transform: rotate(120deg) scale(1.1); opacity: 0.3; }
  66%  { transform: rotate(240deg) scale(0.9); opacity: 0.6; }
  100% { transform: rotate(360deg) scale(1); opacity: 0.5; }
}
`

export const PARTICLE_DEFS: Record<string, ParticleDef> = {
  ember_float: {
    count: 8,
    keyframes: 'ember-float',
    style: (i) => ({
      position: 'absolute',
      width:  `${4 + (i % 3) * 2}px`,
      height: `${4 + (i % 3) * 2}px`,
      borderRadius: '50%',
      backgroundColor: i % 2 === 0 ? '#ff4500' : '#ff8c00',
      left:   `${10 + (i * 73) % 80}%`,
      bottom: `${5  + (i * 31) % 40}%`,
      animation: `ember-float ${(1.5 + (i * 30) % 120 / 100).toFixed(2)}s ease-in infinite`,
      animationDelay: `${((i * 25) % 150 / 100).toFixed(2)}s`,
      pointerEvents: 'none',
    }),
  },

  shadow_tendril: {
    count: 5,
    keyframes: 'shadow-tendril',
    style: (i) => ({
      position: 'absolute',
      width:  `${3 + (i % 2) * 2}px`,
      height: `${20 + (i * 7) % 20}px`,
      borderRadius: '2px',
      backgroundColor: '#1a0a2e',
      left:   `${15 + (i * 61) % 70}%`,
      bottom: `${(i * 17) % 15}%`,
      animation: `shadow-tendril ${(2 + (i * 40) % 100 / 100).toFixed(2)}s ease-in-out infinite`,
      animationDelay: `${((i * 50) % 200 / 100).toFixed(2)}s`,
      pointerEvents: 'none',
    }),
  },

  glow_pulse: {
    count: 1,
    keyframes: 'glow-pulse',
    style: () => ({
      position: 'absolute',
      inset: '-10px',
      borderRadius: '50%',
      background: 'radial-gradient(ellipse, rgba(74,0,128,0.3) 0%, transparent 70%)',
      animation: 'glow-pulse 2s ease-in-out infinite',
      pointerEvents: 'none',
    }),
  },

  dark_aura: {
    count: 3,
    keyframes: 'dark-aura',
    style: (i) => ({
      position: 'absolute',
      inset: `${-5 + i * 8}px`,
      borderRadius: '40% 60% 50% 70%',
      border: `1px solid rgba(74,0,128,${(0.3 - i * 0.08).toFixed(2)})`,
      animation: `dark-aura ${(3 + i * 0.7).toFixed(1)}s linear infinite`,
      animationDelay: `${(i * 0.4).toFixed(1)}s`,
      pointerEvents: 'none',
    }),
  },
}
```

- [ ] **Step 2.4: Run tests — expect pass**

```bash
npm test src/lib/__tests__/particles.test.ts
```

Expected: All 9 tests PASS

- [ ] **Step 2.5: Run full test suite to confirm no regressions**

```bash
npm test
```

Expected: All tests PASS

- [ ] **Step 2.6: Commit**

```bash
git add src/lib/sprites/particles.ts src/lib/__tests__/particles.test.ts
git commit -m "feat: add CSS particle definitions (ember_float, shadow_tendril, glow_pulse, dark_aura)"
```

---

## Chunk 2: Components (BossHPBar.tsx + BossSprite.tsx)

### Task 3: Boss HP Bar Component

**Files:**
- Create: `src/components/boss/BossHPBar.tsx`

Note: This is a pure presentational component. Test it visually via the boss page in Task 5.

---

- [ ] **Step 3.1: Create `src/components/boss/BossHPBar.tsx`**

```typescript
'use client'

import React from 'react'

interface BossHPBarProps {
  currentHp: number
  maxHp: number
  bossName: string
}

const SEGMENT_COUNT = 20

export default function BossHPBar({ currentHp, maxHp, bossName }: BossHPBarProps) {
  const pct = maxHp > 0 ? Math.max(0, Math.min(1, currentHp / maxHp)) : 0
  const isLow = pct <= 0.25
  const isMid = pct > 0.25 && pct <= 0.5

  const hpText = `${currentHp} / ${maxHp}`

  // Inject HP pulse keyframe once (no dependency on document)
  const pulseKeyframe = isLow ? (
    <style>{`@keyframes hp-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
  ) : null

  return (
    <div style={{ width: '100%', maxWidth: 440, fontFamily: 'monospace' }}>
      {pulseKeyframe}

      {/* Boss name */}
      <div style={{
        color: '#ff4444',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        marginBottom: '0.2rem',
        textShadow: '0 0 8px #cc0000',
      }}>
        ☠ {bossName}
      </div>

      {/* HP label */}
      <div style={{ color: '#888', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
        HP: {hpText}
      </div>

      {/* Segmented pixel-art bar */}
      <div style={{
        display: 'flex',
        gap: 2,
        height: 16,
        background: '#111',
        border: '2px solid #333',
        padding: 2,
        imageRendering: 'pixelated',
      }}>
        {Array.from({ length: SEGMENT_COUNT }).map((_, i) => {
          const threshold = (i + 1) / SEGMENT_COUNT
          const filled = pct >= threshold - 1 / SEGMENT_COUNT / 2

          let bg = 'transparent'
          if (filled) {
            if (isLow) bg = 'linear-gradient(90deg, #7f0000, #cc0000)'
            else if (isMid) bg = 'linear-gradient(90deg, #7f4000, #cc8800)'
            else bg = 'linear-gradient(90deg, #8b0000, #dd2222)'
          }

          return (
            <div
              key={i}
              style={{
                flex: 1,
                background: bg,
                animation: isLow && filled ? 'hp-pulse 0.8s ease-in-out infinite' : undefined,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 3.2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: No errors in `BossHPBar.tsx`

- [ ] **Step 3.3: Commit**

```bash
git add src/components/boss/BossHPBar.tsx
git commit -m "feat: add BossHPBar component with pixel-art segmented bar and HP color stages"
```

---

### Task 4: Boss Sprite Canvas Component

**Files:**
- Create: `src/components/boss/BossSprite.tsx`

Canvas + imperative animation. No unit tests (Canvas API is browser-only). Test visually via Task 5.

---

- [ ] **Step 4.1: Create `src/components/boss/BossSprite.tsx`**

```typescript
'use client'

import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useState,
} from 'react'
import { spriteUrl } from '@/lib/sprites/manifest'
import {
  BOSS_PALETTES,
  BOSS_SPRITE_MANIFEST,
  swapPalette,
} from '@/lib/sprites/palette'
import {
  PARTICLE_CSS_KEYFRAMES,
  PARTICLE_DEFS,
} from '@/lib/sprites/particles'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BossSpriteConfig {
  base_sprite: string
  palette: string
  scale: number
  particles: string[]
  frame: string
  glow_color: string
}

export interface BossSpriteHandle {
  takeDamage: () => void
  defeat: () => void
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Milliseconds between idle animation frames */
const FRAME_INTERVAL_MS = 400

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const BossSprite = forwardRef<BossSpriteHandle, { config: BossSpriteConfig }>(
  function BossSprite({ config }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const flashRef  = useRef<HTMLDivElement>(null)

    // Resolved pixel images (palette-swapped), set once after load
    const framesRef = useRef<ImageBitmap[]>([])
    const frameIdx  = useRef(0)
    const rafHandle = useRef<number>(0)
    const intervalHandle = useRef<ReturnType<typeof setInterval> | null>(null)

    const [loaded, setLoaded] = useState(false)

    // -----------------------------------------------------------------------
    // Resolve sprite info
    // -----------------------------------------------------------------------
    const spriteInfo = BOSS_SPRITE_MANIFEST[config.base_sprite]
    const palette    = BOSS_PALETTES[config.palette] ?? BOSS_PALETTES.hollow_dark

    // Native size depends on format
    const nativeSize = spriteInfo?.format === 'folder' ? 256 : (spriteInfo?.cellW ?? 64)
    const displaySize = nativeSize * config.scale

    // -----------------------------------------------------------------------
    // Load + palette-swap sprite frames
    // -----------------------------------------------------------------------
    useEffect(() => {
      if (!spriteInfo) return

      let cancelled = false

      async function load() {
        const offscreen = document.createElement('canvas')
        const ctx = offscreen.getContext('2d')!

        let rawFrames: ImageBitmap[]

        if (spriteInfo.format === 'folder') {
          // Load each idle frame individually
          const urls = (spriteInfo.idleFrames ?? ['Idle1.png']).map(
            (f) => spriteUrl(`${spriteInfo.basePath}/${f}`)
          )
          rawFrames = await Promise.all(
            urls.map((url) =>
              fetch(url)
                .then((r) => r.blob())
                .then((b) => createImageBitmap(b))
            )
          )
        } else {
          // Sheet: extract first row cells as frames
          const url = spriteUrl(spriteInfo.basePath)
          const sheet = await fetch(url).then((r) => r.blob()).then((b) => createImageBitmap(b))
          const cols = spriteInfo.cols ?? 1
          const w = spriteInfo.cellW ?? 64
          const h = spriteInfo.cellH ?? 64
          // Use first 3 cells from row 0 (or fewer if cols < 3)
          const frameCount = Math.min(3, cols)
          rawFrames = await Promise.all(
            Array.from({ length: frameCount }, (_, i) =>
              createImageBitmap(sheet, i * w, 0, w, h)
            )
          )
        }

        if (cancelled) return

        // Apply palette swap to each frame
        offscreen.width  = nativeSize
        offscreen.height = nativeSize

        const swapped: ImageBitmap[] = []
        for (const bmp of rawFrames) {
          ctx.clearRect(0, 0, nativeSize, nativeSize)
          ctx.drawImage(bmp, 0, 0, nativeSize, nativeSize)
          const imgData  = ctx.getImageData(0, 0, nativeSize, nativeSize)
          const recolored = swapPalette(imgData, palette)
          ctx.putImageData(recolored, 0, 0)
          swapped.push(await createImageBitmap(offscreen))
        }

        if (cancelled) return
        framesRef.current = swapped
        setLoaded(true)
      }

      load().catch(console.error)
      return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config.base_sprite, config.palette])

    // -----------------------------------------------------------------------
    // Idle animation loop (setInterval drives frame index; rAF draws)
    // -----------------------------------------------------------------------
    useEffect(() => {
      if (!loaded) return

      function draw() {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        const frames = framesRef.current
        if (!frames.length) return

        ctx.clearRect(0, 0, displaySize, displaySize)
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(frames[frameIdx.current], 0, 0, displaySize, displaySize)
      }

      draw()

      intervalHandle.current = setInterval(() => {
        const frames = framesRef.current
        if (!frames.length) return
        frameIdx.current = (frameIdx.current + 1) % frames.length
        rafHandle.current = requestAnimationFrame(draw)
      }, FRAME_INTERVAL_MS)

      return () => {
        if (intervalHandle.current) clearInterval(intervalHandle.current)
        cancelAnimationFrame(rafHandle.current)
      }
    }, [loaded, displaySize])

    // -----------------------------------------------------------------------
    // Imperative API
    // -----------------------------------------------------------------------
    useImperativeHandle(ref, () => ({
      takeDamage() {
        const flash = flashRef.current
        if (!flash) return
        flash.style.opacity = '0.6'
        setTimeout(() => { if (flash) flash.style.opacity = '0' }, 150)
      },

      defeat() {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Stop idle animation
        if (intervalHandle.current) clearInterval(intervalHandle.current)
        cancelAnimationFrame(rafHandle.current)

        const accent = BOSS_PALETTES[config.palette]?.accent ?? '#ffffff'
        const totalPixels = displaySize * displaySize
        const pixelsPerFrame = Math.ceil(totalPixels * 0.03)
        const startTime = performance.now()
        const duration = 2000

        function disintegrate() {
          const elapsed = performance.now() - startTime
          if (elapsed >= duration) {
            ctx!.clearRect(0, 0, displaySize, displaySize)
            return
          }

          const imgData = ctx!.getImageData(0, 0, displaySize, displaySize)
          const d = imgData.data

          // Zero out a random-ish selection of pixels (deterministic-ish)
          const seed = Math.floor(elapsed)
          for (let p = 0; p < pixelsPerFrame; p++) {
            const idx = ((seed * 2654435761 + p * 40503) >>> 0) % (displaySize * displaySize)
            const base = idx * 4
            d[base + 3] = 0 // erase alpha
          }
          ctx!.putImageData(imgData, 0, 0)

          // Draw small rising dots
          const r = parseInt(accent.slice(1, 3), 16)
          const g = parseInt(accent.slice(3, 5), 16)
          const b = parseInt(accent.slice(5, 7), 16)
          ctx!.fillStyle = `rgba(${r},${g},${b},0.7)`
          for (let p = 0; p < 4; p++) {
            const x = ((seed * 1013904223 + p * 1664525) >>> 0) % displaySize
            const y = displaySize - ((seed / 10 + p * 20) % displaySize)
            ctx!.fillRect(x, Math.max(0, y), 2, 2)
          }

          rafHandle.current = requestAnimationFrame(disintegrate)
        }

        rafHandle.current = requestAnimationFrame(disintegrate)
      },
    }))

    // -----------------------------------------------------------------------
    // Decorative frame SVG helper
    // -----------------------------------------------------------------------
    const frameColor = config.frame === 'frame_epic' ? '#aa44ff' : '#888'
    const frameStyle: React.CSSProperties = {
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      border: `3px solid ${frameColor}`,
      boxShadow: `0 0 12px ${config.glow_color}, inset 0 0 8px ${config.glow_color}44`,
    }

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------
    return (
      <div style={{ position: 'relative', width: displaySize, height: displaySize, display: 'inline-block' }}>
        {/* Inject particle keyframes */}
        <style>{PARTICLE_CSS_KEYFRAMES}</style>

        {/* Boss canvas */}
        <canvas
          ref={canvasRef}
          width={displaySize}
          height={displaySize}
          style={{
            imageRendering: 'pixelated',
            display: 'block',
            filter: loaded ? `drop-shadow(0 0 8px ${config.glow_color})` : undefined,
          }}
        />

        {/* Red flash overlay for takeDamage() */}
        <div
          ref={flashRef}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(255, 0, 0, 0)',
            opacity: 0,
            transition: 'opacity 0.05s',
            pointerEvents: 'none',
            mixBlendMode: 'screen',
          }}
        />

        {/* Decorative frame */}
        <div style={frameStyle} />

        {/* CSS Particles */}
        {config.particles.map((particleKey) => {
          const def = PARTICLE_DEFS[particleKey]
          if (!def) return null
          return Array.from({ length: def.count }, (_, i) => (
            <div key={`${particleKey}-${i}`} style={def.style(i, def.count)} />
          ))
        })}
      </div>
    )
  }
)

BossSprite.displayName = 'BossSprite'
export default BossSprite
```

- [ ] **Step 4.2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: No errors in `BossSprite.tsx`

- [ ] **Step 4.3: Commit**

```bash
git add src/components/boss/BossSprite.tsx
git commit -m "feat: add BossSprite Canvas component with palette swap, idle animation, particles, takeDamage/defeat"
```

---

## Chunk 3: Boss Battle Test Harness

### Task 5: `/play/boss` Test Harness Page

**Files:**
- Create: `src/app/play/boss/page.tsx`

Hardcoded Week 1 config: Thornmaw the Blighted Root, `base_sprite: 'demon'`, `palette: 'hollow_dark'`, `scale: 2`, `particles: ['ember_float', 'shadow_tendril']`, `frame: 'frame_epic'`, `glow_color: '#4a0080'`.
Scale is set to 2 (512px) rather than 3 for viewport compatibility — mobile screens would overflow at 768px.

---

- [ ] **Step 5.1: Create `src/app/play/boss/page.tsx`**

```typescript
'use client'

import React, { useRef, useState } from 'react'
import BossSprite, { type BossSpriteConfig, type BossSpriteHandle } from '@/components/boss/BossSprite'
import BossHPBar from '@/components/boss/BossHPBar'

const WEEK1_CONFIG: BossSpriteConfig = {
  base_sprite: 'demon',
  palette:     'hollow_dark',
  scale:       2,
  particles:   ['ember_float', 'shadow_tendril'],
  frame:       'frame_epic',
  glow_color:  '#4a0080',
}

const MAX_HP = 300

export default function BossPage() {
  const spriteRef = useRef<BossSpriteHandle>(null)
  const [currentHp, setCurrentHp] = useState(MAX_HP)
  const [defeated, setDefeated] = useState(false)
  const [spriteKey, setSpriteKey] = useState(0)

  function handleDamage() {
    if (defeated) return
    const damage = Math.floor(Math.random() * 30) + 10
    const next = Math.max(0, currentHp - damage)
    setCurrentHp(next)
    spriteRef.current?.takeDamage()
    if (next === 0) {
      setDefeated(true)
      setTimeout(() => spriteRef.current?.defeat(), 300)
    }
  }

  function handleReset() {
    setCurrentHp(MAX_HP)
    setDefeated(false)
    // Increment key to remount BossSprite and restart idle animation
    setSpriteKey((k) => k + 1)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a12',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '2rem',
      padding: '2rem',
      fontFamily: 'monospace',
    }}>
      <h1 style={{ color: '#9b30ff', fontSize: '1.4rem', margin: 0 }}>
        ⚔ Boss Battle — Week 1
      </h1>

      {/* HP Bar */}
      <BossHPBar
        currentHp={currentHp}
        maxHp={MAX_HP}
        bossName="Thornmaw, the Blighted Root"
      />

      {/* Boss Sprite — key forces remount on reset */}
      <BossSprite key={spriteKey} ref={spriteRef} config={WEEK1_CONFIG} />

      {/* Controls */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={handleDamage}
          disabled={defeated}
          style={{
            padding: '0.6rem 1.4rem',
            background: defeated ? '#333' : '#4a0080',
            color: defeated ? '#666' : '#fff',
            border: 'none',
            cursor: defeated ? 'not-allowed' : 'pointer',
            fontFamily: 'monospace',
            fontSize: '1rem',
          }}
        >
          ⚔ Strike! ({currentHp} HP left)
        </button>

        <button
          onClick={handleReset}
          style={{
            padding: '0.6rem 1.4rem',
            background: '#1a1a2e',
            color: '#9b30ff',
            border: '1px solid #4a0080',
            cursor: 'pointer',
            fontFamily: 'monospace',
            fontSize: '1rem',
          }}
        >
          ↺ Reset
        </button>
      </div>

      {defeated && (
        <div style={{ color: '#9b30ff', fontSize: '1.2rem', textAlign: 'center' }}>
          ✦ Thornmaw has been defeated! ✦
          <br />
          <span style={{ fontSize: '0.85rem', color: '#666' }}>
            The Emberbearers&apos; combined Emberlight purifies the roots.
          </span>
        </div>
      )}

      {/* Config display for debugging */}
      <details style={{ color: '#444', fontSize: '0.7rem', maxWidth: 480 }}>
        <summary style={{ cursor: 'pointer', color: '#666' }}>Boss config</summary>
        <pre style={{ color: '#555', marginTop: '0.5rem' }}>
          {JSON.stringify(WEEK1_CONFIG, null, 2)}
        </pre>
      </details>
    </div>
  )
}
```

- [ ] **Step 5.2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: No errors

- [ ] **Step 5.3: Run dev server and verify visually**

```bash
npm run dev
```

Navigate to `http://localhost:3000/play/boss` and verify:
- [ ] Boss sprite renders (demon with hollow_dark palette — purple/dark tones)
- [ ] Idle animation cycles through 3 frames
- [ ] Ember and shadow-tendril particles animate around the sprite
- [ ] Purple glow frame visible
- [ ] "Strike!" button deals damage — HP bar updates and segments empty
- [ ] `takeDamage()` causes brief red flash on sprite
- [ ] At 0 HP: defeated message appears and `defeat()` plays disintegration animation
- [ ] BossHPBar: segments are red, turn amber below 50%, pulse below 25%

- [ ] **Step 5.4: Run full test suite**

```bash
npm test
```

Expected: All tests PASS (palette + particles + xp)

- [ ] **Step 5.5: Commit**

```bash
git add src/app/play/boss/page.tsx
git commit -m "feat: add /play/boss test harness page with Week 1 boss (Thornmaw/demon, hollow_dark palette)"
```

---

## Done

All 5 tasks complete. The boss rendering system is fully operational:

- `src/lib/sprites/palette.ts` — BOSS_PALETTES, BOSS_SPRITE_MANIFEST, swapPalette
- `src/lib/sprites/particles.ts` — PARTICLE_CSS_KEYFRAMES, PARTICLE_DEFS
- `src/components/boss/BossHPBar.tsx` — pixel-art segmented HP bar
- `src/components/boss/BossSprite.tsx` — Canvas renderer with palette swap, idle animation, particles, takeDamage/defeat
- `src/app/play/boss/page.tsx` — interactive test harness

**Next steps:** Connect the boss page to real Supabase data (`story_chapters.boss_sprite_config`), add boss damage from chore completions via Realtime subscription, and wire up the defeat narrative display.
