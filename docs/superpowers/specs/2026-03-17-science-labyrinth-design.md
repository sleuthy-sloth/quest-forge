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
| `src/app/play/academy/page.tsx` | **No change needed** — catalog entry already committed (slug `science-labyrinth`, accent `#1e8a4a`) |

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
  3. After 1000ms total from tap: if `questionIndex < 9`, advance index; if `questionIndex === 9`, call `finishGame(newScore, newAnswers, questions)` instead.
- **Wrong answer flow:**
  1. Chosen button highlights red; correct button highlights green; screen flashes red 300ms.
  2. Dead-end wall slides down over corridor (~300ms, `dead-end-drop`).
  3. Explanation text renders below answer buttons.
  4. One `setTimeout(..., 3000)` fires from the moment of the tap. Inside that single callback: call `setWallVisible(false)` (triggering `dead-end-lift`), then schedule a second `setTimeout(..., 300)` (matching the lift duration) that sets `wallMounted` to `false` to remove the wall div from the DOM entirely — preventing it from intercepting pointer events on the next question. After the wall removal timer is queued: if `questionIndex < 9`, advance index; if `questionIndex === 9`, call `finishGame(newScore, newAnswers, questions)` instead.
- All timers stored in `timersRef`; cleared on unmount and on Play Again.

### saving
- Shows "MAPPING YOUR ROUTE…" message.
- Three concurrent Supabase writes (error-tolerant — any failure sets `saveError` flag):
  1. `edu_completions` INSERT
  2. `profiles` UPDATE (xp_total, xp_available)
  3. `story_chapters` UPDATE (boss_current_hp − xpEarned, clamped to 0)

### results
- Header: score (X / 10) and accuracy badge (green ≥ 80%, orange ≥ 60%, red < 60%).
- Subheader: `LABYRINTH CLEARED` if score ≥ 6, else `LABYRINTH ATTEMPTED`. (Score 6 = 60% accuracy = lowest paying XP tier — this threshold is intentional.)
- XP line: `+{n} XP · Maze Explored`.
- Boss line: `−{n} Boss HP` if active boss exists, else "No active threat".
- Question log: each row labeled `✓ Path clear` or `✗ Dead end` with correct answer shown.
- If `saveError`: warning toast "Results may not have saved."
- Buttons: Play Again (re-fetches questions, resets state) and Back to Academy.

---

## Animation State Variables

The following state variables drive animations and **must all be reset inside `fetchQuestions`** (in addition to the standard score/index/answers/feedback resets from the existing pattern):

| Variable | Type | Initial / reset value | Purpose |
|---|---|---|---|
| `wallVisible` | `boolean` | `false` | Triggers `dead-end-drop` (true) or `dead-end-lift` (false) on the wall div |
| `wallMounted` | `boolean` | `false` | Controls whether the wall div is in the DOM at all; set `false` 300ms after `wallVisible` goes false to remove it from layout so it cannot intercept pointer events |
| `corridorAdvancing` | `boolean` | `false` | Triggers `corridor-advance` keyframe on the corridor inner layers |

`fetchQuestions` must set all three to `false` before transitioning phase to `'playing'`.

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

**Structure:**
- Container: 64×64px, `position: relative`, `overflow: hidden`, background `#0a0c14`
- Four trapezoid strips (CSS `border` technique or `clip-path`): floor, ceiling, left wall, right wall — each smaller than the previous, converging on center
- Vanishing-point glow: green radial gradient `rgba(30,138,74,0.6)` at center, fading to transparent, rendered as a 20×20px absolutely-centered div
- The corridor inner-layer group is wrapped in a single div for animation targeting

**`corridor-advance` keyframe (fires on correct):**
```css
@keyframes corridor-advance {
  0%   { transform: scale(1);    opacity: 1; }
  40%  { transform: scale(1.18); opacity: 0.7; }
  100% { transform: scale(1);    opacity: 1; }
}
```
Duration: 400ms, easing: ease-in-out. Applied to the inner corridor wrapper div. `corridorAdvancing` is set `true` on tap and `false` in the cleanup timer.

**Dead-end wall overlay:**
- A `64×64px` `div`, `position: absolute`, `top: 0`, `left: 0`, `z-index: 5`, background `#3a3530`
- Rendered only when `wallMounted === true` (not `wallVisible`) — the div must stay in the DOM during the lift animation. `wallVisible` drives which animation class is applied: `dead-end-drop` when `true`, `dead-end-lift` when `false`.
- Stone texture: `repeating-linear-gradient(0deg, transparent, transparent 6px, rgba(0,0,0,0.15) 6px, rgba(0,0,0,0.15) 7px)` overlaid on `#3a3530`
- Crack: a small inline SVG (two jagged lines from top-center to bottom-center) at 30% opacity, absolutely centered
- The screen-flash overlay sits at `z-index: 10` (same as existing games); the wall at `z-index: 5` sits above the corridor content (`z-index: 0`) but below the flash overlay — this is intentional: the flash fires first (300ms), then the wall drops, so they do not need to compete in z-order during normal play

**`dead-end-drop` keyframe:**
```css
@keyframes dead-end-drop {
  0%   { transform: translateY(-100%); }
  100% { transform: translateY(0%); }
}
```
Duration: 300ms, easing: ease-in.

**`dead-end-lift` keyframe:**
```css
@keyframes dead-end-lift {
  0%   { transform: translateY(0%); }
  100% { transform: translateY(-100%); }
}
```
Duration: 300ms, easing: ease-out. Applied to the wall div when `wallVisible` transitions from `true` to `false`. After `setWallVisible(false)`, a `setTimeout(..., 300)` (matching lift duration) calls `setWallMounted(false)`, removing the wall div from the DOM entirely so it cannot intercept pointer events on the subsequent question.

**Neutral state:** Static corridor, no wall, `corridorAdvancing = false`.

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
//    WHERE id = user.id  →  if null: redirect('/login')
// 3. if !profile.avatar_class: redirect('/play/create-character')
// 4. Derive tier: age != null && age >= 11 ? 'senior' : 'junior'
// 5. Render <ScienceLabyrinth ageTier householdId playerId avatarConfig displayName xpTotal xpAvailable />
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
| Dead-end wall z-index | `5` (above corridor content at 0, below flash overlay at 10) |
| Results accent | `#1e8a4a` |

---

## Out of Scope

- No new database tables or migrations required.
- No AI generation — uses seeded `edu_challenges` rows.
- No audio.
- No changes to the existing auth or XP systems.
