# Math Arena — Design Spec
**Date:** 2026-03-16
**Routes:** `src/app/play/academy/math-arena/page.tsx` · `src/components/games/MathArena.tsx`

## Overview

A pixel-art battle-themed educational math game. Players face a training dummy in 10-question sessions drawn from the seeded `edu_challenges` table. Correct answers deal damage to the dummy and accumulate XP. After 10 questions, a results screen shows the full question log and XP earned, which is saved to the database and applied as boss damage.

---

## File Structure

| Action | Path | Purpose |
|--------|------|---------|
| **Create** | `src/app/play/academy/math-arena/page.tsx` | Server component — fetches profile, passes props to MathArena |
| **Create** | `src/components/games/MathArena.tsx` | `'use client'` — all game state, UI, and DB writes |

---

## Architecture & Data Flow

### Page (`math-arena/page.tsx`) — Server Component

1. `createClient()` from `lib/supabase/server`
2. `supabase.auth.getUser()` → `if (!user) redirect('/login')`
3. Fetch `profiles`: `display_name, age, avatar_config, household_id, level, avatar_class, xp_total, xp_available`
4. `if (!profile) redirect('/login')` · `if (!profile.avatar_class) redirect('/play/create-character')`
5. Derive `ageTier`: `age != null && age >= 11 ? 'senior' : 'junior'`
6. Render `<MathArena>` with props: `ageTier`, `householdId`, `playerId`, `avatarConfig`, `displayName`, `xpTotal`, `xpAvailable`

### Component (`MathArena.tsx`) — `'use client'`

**Question fetch (on mount and on Play Again):**
```ts
supabase
  .from('edu_challenges')
  .select('id, title, content, xp_reward')
  .eq('subject', 'math')
  .eq('age_tier', ageTier)
  .eq('is_active', true)
  .order('id') // stable sort before random sampling
  // then shuffle client-side and take 10
```
Use a Fisher-Yates shuffle on the returned rows (or fetch with `.limit(50)` and slice 10 randomly) since Supabase doesn't support `ORDER BY random()` in the JS client cleanly.

**XP calculation:**
- `potential = sum of xp_reward across all 10 fetched questions`
- `accuracy = correct / 10`
- `xpEarned`: accuracy = 1.0 → potential × 1.0; ≥ 0.8 → × 0.8; ≥ 0.6 → × 0.5; < 0.6 → 10 (flat base)
- Round `xpEarned` to nearest integer

---

## Game State Machine

Single `phase` state: `'loading' | 'playing' | 'saving' | 'results'`

### `loading`
- Fetch questions from Supabase
- Show "Preparing the arena…" spinner in pixel font
- On success → `playing`; on error → show retry button

### `playing`
Additional state:
- `questionIndex: number` (0–9)
- `score: number` (correct count)
- `answers: string[]` (player's chosen option per question, for results log)
- `feedback: null | 'correct' | 'wrong'`
- `dummyHit: boolean` (triggers hit animation)
- `screenFlash: 'green' | 'red' | null`

**On answer selected:**
- If `feedback !== null`: ignore (debounce during feedback window)
- Compare chosen option to `content.correct_answer`
- **Correct:** set `feedback = 'correct'`, `score++`, `dummyHit = true`, `screenFlash = 'green'`. After 300ms clear flash; after 500ms clear dummyHit; after 800ms advance to next question (or → `saving` if last)
- **Wrong:** set `feedback = 'wrong'`, `screenFlash = 'red'`. After 300ms clear flash. After 3000ms advance

### `saving`
- Insert `edu_completions` row
- Update `profiles` XP
- Update boss HP
- Show "Saving results…" briefly
- → `results` regardless of write success (errors are non-blocking toast)

### `results`
- Show score header + question log + buttons
- "Play Again" → reset all state → `loading` (re-fetches fresh questions)
- "Back to Academy" → `router.push('/play/academy')`

---

## Visual Design

### Background
`linear-gradient(180deg, #0a0f1e 0%, #040812 100%)` — matches all play pages.

### Arena Bar (top section)
Dark panel with ember-red left accent border (`border-left: 3px solid #c43a00`).

**Left — Player:**
- `<AvatarPreview avatarConfig={avatarConfig} size={64} />` — must be a multiple of 64 for crisp pixel art
- `displayName` in Press Start 2P, 7px
- Green HP bar (cosmetic, always full — `width: 100%`)

**Center:**
- `VS` badge: Press Start 2P, ember red bg
- 10 score pips in a row: gold filled = correct, empty = unanswered/wrong
- `Q{n} / 10` counter in pixel font

**Right — Training Dummy:**
- CSS pixel art: brown circle head (`border-radius: 50%`) + rectangle torso, amber border
- `TARGET` label in pixel font, ember red
- Red HP bar depleting as correct answers accumulate: `width: (correct/10 * 100)%`

**Screen flash overlay:**
- `position: absolute` div covering the full arena bar
- Normally `opacity: 0`; on correct: `rgba(46,184,92,0.25)` for 300ms; on wrong: `rgba(224,85,85,0.25)` for 300ms

**Training dummy hit animation** (CSS keyframe `dummy-hit`):
```css
@keyframes dummy-hit {
  0%   { transform: translateX(0);   border-color: rgba(196,58,0,0.4); }
  25%  { transform: translateX(-4px); border-color: #e05555; }
  50%  { transform: translateX(4px);  border-color: #e05555; }
  75%  { transform: translateX(-2px); border-color: #e05555; }
  100% { transform: translateX(0);   border-color: rgba(196,58,0,0.4); }
}
```

### Question Card (below arena)
- `animation: card-rise 0.25s ease` on mount (already in globals.css) — plays each new question
- Question number: `QUESTION {n} OF 10` in tiny pixel font, muted gold
- Question text: Press Start 2P, ~11px, centered, `lineHeight: 1.8`
- Answer grid: 2×2, each button min 48px tall (touch target)

**Button states:**
- Default: dark bg, gold border `rgba(201,168,76,0.22)`
- On wrong feedback: correct answer button gets green border `#2eb85c`; chosen wrong button gets red border `#e05555`
- Disabled (during feedback): `pointer-events: none`

**Explanation (wrong answers only):**
- Appears below answer grid after wrong pick
- `content.explanation` in Crimson Text italic, muted, 12px
- Disappears when question advances

### Results Screen

**Header:**
- Score fraction: `{correct} / 10` in Press Start 2P, large
- Accuracy badge: colored pill — ≥80% green, ≥60% amber `#e8a020`, <60% red `#e05555`
- XP earned: `+{xpEarned} XP` in gold pixel font
- Boss damage: `−{xpEarned} HP` in ember red (or "No active boss" if skipped)

**Question log** (scrollable):
- One row per question
- ✓ (green left border) or ✗ (red left border)
- Question text + correct answer in Crimson Text
- Wrong rows: "you answered: {their answer}" in muted text below

**Buttons:**
- `⚔️ PLAY AGAIN` — full width, ember red gradient
- `← BACK TO ACADEMY` — full width, ghost with gold border

---

## Database Writes (on `saving` phase)

All via browser Supabase client (`createClient()` from `lib/supabase/client`). Sequential, non-blocking on failure.

### 1. Insert `edu_completions`
```ts
await supabase.from('edu_completions').insert({
  household_id: householdId,
  challenge_id: questions[0].id,   // first question as session anchor
  player_id:    playerId,
  score:        correct,
  completed_at: new Date().toISOString(),
  xp_awarded:   xpEarned,
})
```

### 2. Update player XP

No `increment_xp` RPC exists. Use a direct read-then-write pattern. The page passes `xpTotal` and `xpAvailable` as props, so the component already has the current values:

```ts
await supabase
  .from('profiles')
  .update({
    xp_total:     xpTotal     + xpEarned,
    xp_available: xpAvailable + xpEarned,
  })
  .eq('id', playerId)
```

### 3. Boss damage
```ts
// First: find active boss
const { data: boss } = await supabase
  .from('story_chapters')
  .select('id, boss_current_hp')
  .eq('household_id', householdId)
  .eq('is_unlocked', false)
  .gt('boss_current_hp', 0)
  .order('week_number', { ascending: true })
  .limit(1)
  .maybeSingle()

// If boss exists:
if (boss) {
  await supabase
    .from('story_chapters')
    .update({ boss_current_hp: Math.max(0, boss.boss_current_hp - xpEarned) })
    .eq('id', boss.id)
}
```

---

## Error Handling

- **Question fetch fails:** Show error message + "Try Again" button in the arena area. Log error to console.
- **Save fails:** Non-blocking — transition to results anyway. Show a small toast: "Couldn't save progress — check your connection." (simple inline text, no modal).
- **No questions found:** Show "No challenges available" with Back to Academy link.

---

## Constraints & Conventions

- `'use client'` on `MathArena.tsx` only — page stays server component
- `createClient()` from `@/lib/supabase/client` (browser client) inside the component
- `useRouter()` from `next/navigation` for Back to Academy navigation
- `image-rendering: pixelated` on AvatarPreview and any sprite elements
- Touch targets ≥ 48px on answer buttons
- All text gender-neutral
- Fonts: `var(--font-pixel)`, `var(--font-heading)`, `var(--font-body)`
- Inline styles for dynamic values; Tailwind for layout classes
- Existing globals.css `card-rise` animation reused — no new global CSS added except the `dummy-hit` keyframe (added inline via `<style>` tag in the component)
