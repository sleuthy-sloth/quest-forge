# Science Labyrinth — Design Spec
**Date:** 2026-03-17
**Status:** Approved

---

## Overview

Science Labyrinth is a mini-game for the Quest Forge Academy. Players answer science multiple-choice questions framed as navigating a dungeon maze. Correct answers advance through a corridor; wrong answers show a stone dead-end wall with an explanation. It follows the established WordForge / MathArena component pattern exactly.

---

## Files

| File | Role |
|---|---|
| `src/components/games/ScienceLabyrinth.tsx` | `'use client'` game component (all game logic + UI) |
| `src/app/play/academy/science-labyrinth/page.tsx` | Server route wrapper: auth, profile fetch, age-tier derivation |
| `src/app/play/academy/page.tsx` | Add one entry to the `GAMES` catalog array |

---

## Props Interface

Identical to WordForge and MathArena:

```typescript
interface Props {
  ageTier:      'junior' | 'senior'
  householdId:  string
  playerId:     string
  avatarConfig: Record<string, unknown> | null
  displayName:  string
  xpTotal:      number
  xpAvailable:  number
}
```

---

## State Machine

Four phases: `'loading' | 'playing' | 'saving' | 'results'`

### loading
- Fetches 10 shuffled questions from `edu_challenges` where `subject = 'science'` and `age_tier = ageTier`.
- Shows "Charting the Labyrinth…" message.
- On empty result: shows "No challenges available" + back button.
- On network error: shows retry button.

### playing
- Renders one question at a time (index 0–9).
- Arena bar shows player avatar (left), VS badge (center, green `#1e8a4a`), corridor view (right).
- **Correct answer flow:**
  1. Chosen button highlights green; screen flashes green 300ms.
  2. Corridor advance animation fires (~400ms).
  3. After 1000ms total: advance to next question.
- **Wrong answer flow:**
  1. Chosen button highlights red; correct button highlights green; screen flashes red 300ms.
  2. Dead-end wall slides down over the corridor (~400ms).
  3. Explanation text renders below answer buttons.
  4. After 3000ms total: wall slides back up, advance to next question.
- All timers stored in `timersRef`; cleared on unmount and on Play Again.

### saving
- Shows "MAPPING YOUR ROUTE…" message.
- Three concurrent Supabase writes (error-tolerant — any failure sets `saveError` flag):
  1. `edu_completions` INSERT
  2. `profiles` UPDATE (xp_total, xp_available)
  3. `story_chapters` UPDATE (boss_current_hp − xpEarned, clamped to 0)

### results
- Header: score (X / 10) and accuracy badge (green ≥ 80%, orange ≥ 60%, red < 60%).
- Subheader: `LABYRINTH CLEARED` if score ≥ 6, else `LABYRINTH ATTEMPTED`.
- XP line: `+{n} XP · Maze Explored`.
- Boss line: `−{n} Boss HP` if active boss exists, else "No active threat".
- Question log: each row labeled `✓ Path clear` or `✗ Dead end` with correct answer shown.
- If `saveError`: warning toast "Results may not have saved."
- Buttons: Play Again (re-fetches questions, resets state) and Back to Academy.

---

## XP Calculation

```typescript
function calcXp(correct: number, questions: Question[]): number {
  const potential = questions.reduce((sum, q) => sum + q.xp_reward, 0)
  const accuracy  = correct / 10
  if (accuracy === 1.0)   return Math.round(potential * 1.0)
  if (accuracy >= 0.8)    return Math.round(potential * 0.8)
  if (accuracy >= 0.6)    return Math.round(potential * 0.5)
  return 10
}
```

---

## Arena Bar — Corridor Visual

The right panel of the arena bar is a first-person dungeon corridor drawn in CSS:

**Structure (nested trapezoids via `clip-path` or `border` trick):**
- Background: near-black `#0a0c14`
- Five corridor layers (floor strip, ceiling strip, left wall, right wall) shrinking toward a central vanishing point
- Vanishing-point glow: green radial gradient `rgba(30,138,74,0.6)` fading to transparent
- Overall dimensions: 64×64px (matching anvil / dummy sizes)

**Neutral state:** Static corridor receding into green glow.

**`corridor-advance` keyframe (correct):**
```css
@keyframes corridor-advance {
  0%   { transform: scale(1);    opacity: 1; }
  40%  { transform: scale(1.18); opacity: 0.7; }
  100% { transform: scale(1);    opacity: 1; }
}
```
Duration: 400ms ease-in-out. Applied to the inner corridor layers.

**`dead-end-drop` keyframe (wrong):**
```css
@keyframes dead-end-drop {
  0%   { transform: translateY(-100%); }
  100% { transform: translateY(0%); }
}
```
A stone-colored rectangle (`#3a3530`, 64×64px, absolute-positioned) drops over the corridor in ~300ms. Remains visible for the 3-second feedback window. Slides back up (`dead-end-lift`) as the next question loads.

**Stone wall texture:** A subtle CSS pattern of horizontal lines (`repeating-linear-gradient`) and a single crack SVG overlaid at 30% opacity.

---

## Question Card

Same layout as WordForge / MathArena:

```
┌──────────────────────────────────────┐
│  🧪 SCIENCE QUESTION  ·  Q {n} OF 10 │
│                                       │
│  [Question text — centered]           │
│                                       │
│  [Option A]  [Option B]               │
│  [Option C]  [Option D]               │
│                                       │
│  [Explanation — wrong answers only]   │
└──────────────────────────────────────┘
```

Button default style: same dark gradient + gold border as existing games.
Primary button accent: green `#1e8a4a`.

---

## Data

**Supabase query:**
```typescript
supabase
  .from('edu_challenges')
  .select('id, title, content, xp_reward')
  .eq('subject', 'science')
  .eq('age_tier', ageTier)
  .eq('is_active', true)
  .order('id')
  .limit(50)
// then shuffle + slice(0, 10)
```

Seed data exists at `seeds/science_junior.json` and `seeds/science_senior.json`.

**Content JSON shape** (matches global standard):
```json
{
  "question":       "string",
  "type":           "multiple_choice",
  "options":        ["A", "B", "C", "D"],
  "correct_answer": "string",
  "explanation":    "string (optional)"
}
```

---

## Route Wrapper (`science-labyrinth/page.tsx`)

```typescript
// Server component — mirrors math-arena/page.tsx exactly
// 1. createClient() → getUser() → redirect('/login') if null
// 2. SELECT display_name, age, household_id, avatar_config, xp_total, xp_available FROM profiles
// 3. Derive tier: age >= 11 ? 'senior' : 'junior'
// 4. Render <ScienceLabyrinth {...props} />
```

---

## Academy Catalog Addition

In `src/app/play/academy/page.tsx`, add to the `GAMES` array:
```typescript
{
  slug:    'science-labyrinth',
  name:    'Science Labyrinth',
  icon:    '🧪',
  tagline: 'Navigate the maze of knowledge',
  accent:  '#1e8a4a',
}
```

---

## Theming Summary

| Element | Value |
|---|---|
| VS badge color | `#1e8a4a` (forest green) |
| Screen flash — correct | `rgba(30,138,74,0.25)` |
| Screen flash — wrong | `rgba(224,85,85,0.25)` |
| Primary button accent | `#1e8a4a` |
| Corridor glow | `rgba(30,138,74,0.6)` |
| Dead-end wall | `#3a3530` with stone texture |
| Results accent | `#1e8a4a` |

---

## Out of Scope

- No new database tables or migrations required.
- No AI generation — uses seeded `edu_challenges` rows.
- No audio.
- No changes to the existing auth or XP systems.
