# Word Forge — Design Spec
**Date:** 2026-03-16
**Routes:** `src/app/play/academy/word-forge/page.tsx` · `src/components/games/WordForge.tsx`

## Overview

A pixel-art blacksmith-themed educational vocabulary game. Players face a forge anvil in 10-question sessions drawn from the seeded `edu_challenges` table (`subject = 'vocabulary'`). Correct answers heat the iron bar and animate the vocabulary word letter-by-letter with a heat-glow effect. After 10 questions a results screen shows the full question log and XP earned, which is saved to the database and applied as boss damage.

---

## File Structure

| Action | Path | Purpose |
|--------|------|---------|
| **Create** | `src/app/play/academy/word-forge/page.tsx` | Server component — fetches profile, passes props to WordForge |
| **Create** | `src/components/games/WordForge.tsx` | `'use client'` — all game state, UI, and DB writes |

---

## Architecture & Data Flow

### Page (`word-forge/page.tsx`) — Server Component

1. `createClient()` from `lib/supabase/server`
2. `supabase.auth.getUser()` → `if (!user) redirect('/login')`
3. Fetch `profiles`: `display_name, age, avatar_config, household_id, level, avatar_class, xp_total, xp_available`
4. `if (!profile) redirect('/login')` · `if (!profile.avatar_class) redirect('/play/create-character')`
5. Derive `ageTier`: `age != null && age >= 11 ? 'senior' : 'junior'`
6. Render `<WordForge>` with props: `ageTier`, `householdId`, `playerId={user.id}` (from the auth call in step 2, not from the profile row), `avatarConfig`, `displayName`, `xpTotal`, `xpAvailable`

### Component (`WordForge.tsx`) — `'use client'`

**Question fetch (on mount and on Play Again):**
```ts
supabase
  .from('edu_challenges')
  .select('id, title, content, xp_reward')
  .eq('subject', 'vocabulary')
  .eq('age_tier', ageTier)
  .eq('is_active', true)
  .order('id')
  .limit(50)
  // shuffle client-side (Fisher-Yates), take 10
```

**XP calculation** — identical to Math Arena:
- `potential = sum of xp_reward across all 10 fetched questions`
- `accuracy = correct / 10`
- `xpEarned`: accuracy = 1.0 → potential × 1.0; ≥ 0.8 → × 0.8; ≥ 0.6 → × 0.5; < 0.6 → 10 (flat base)
- Round `xpEarned` to nearest integer

---

## Game State Machine

Single `phase` state: `'loading' | 'playing' | 'saving' | 'results'`

### `loading`
- Fetch questions from Supabase
- Show "Preparing the forge…" in pixel font
- On success → `playing`
- Network error → show retry button
- Empty results → show "No challenges available" + Back to Academy link

### `playing`
Additional state:
- `questionIndex: number` (0–9)
- `score: number` (correct count)
- `answers: string[]` (player's chosen option per question)
- `feedback: null | 'correct' | 'wrong'`
- `ironHit: boolean` (triggers iron-heat animation on the bar)
- `screenFlash: 'blue' | 'red' | null` — note: the conditional render checks `screenFlash === 'blue'` (not `=== 'green'` as in Math Arena) to apply `rgba(26,92,158,0.25)`
- `chosenWrong: string | null`

**On answer selected:**
- If `feedback !== null`: ignore (debounce during feedback window)
- Compare chosen option to `content.correct_answer`
- **Correct:** set `feedback = 'correct'`, `score++`, `ironHit = true`, `screenFlash = 'blue'`. After 300ms clear flash; after 600ms clear ironHit; after 1000ms advance to next question (or → `saving` if last)
- **Wrong:** set `feedback = 'wrong'`, `chosenWrong = option`, `screenFlash = 'red'`. After 300ms clear flash. After 3000ms advance

### `saving`
- Insert `edu_completions` row
- Update `profiles` XP
- Update boss HP
- Each write in its own try/catch (non-blocking — all three attempted independently)
- Show "Saving results…" briefly
- → `results` regardless of write success (errors shown as inline toast)

### `results`
- Show score header + question log + buttons
- "Play Again" → reset all state → `loading` (re-fetches fresh questions)
- "Back to Academy" → `router.push('/play/academy')`

---

## Visual Design

### Background
`linear-gradient(180deg, #0a0f1e 0%, #040812 100%)` — matches all play pages.

### Arena Bar (top section)
Dark panel with word-forge blue left accent border (`border-left: 3px solid #1a5c9e`).

**Left — Player:**
- `<AvatarPreview avatarConfig={avatarConfig} size={64} />` — must be a multiple of 64
- `displayName` in Press Start 2P, 5px
- Green HP bar (cosmetic, always full)

**Center:**
- `VS` badge: Press Start 2P, word-forge blue bg (`rgba(26,92,158,0.12)`, border `rgba(26,92,158,0.3)`, text `#1a5c9e`)
- 10 score pips in a row: gold filled = correct, empty = unanswered/wrong
- `Q{n} / 10` counter in pixel font

**Right — Anvil:**
- CSS pixel art anvil: dark iron base + thinner top horn, amber border `rgba(201,168,76,0.4)`
- Iron bar resting on top: starts cold gray (`#555`), heats to orange-white on correct hit, settles to hot orange (`#cc5500`) via `iron-heat` keyframe
- `FORGE` label in Press Start 2P, 5px, `#1a5c9e`
- Heat bar below: fills left-to-right, `width: (correct/10 * 100)%`, gradient `linear-gradient(90deg, #ff4400, #ffaa00)`, transition smooth

**Screen flash overlay:**
- `position: absolute` div covering the full arena bar
- Normally `opacity: 0`; on correct: `rgba(26,92,158,0.25)` for 300ms; on wrong: `rgba(224,85,85,0.25)` for 300ms

**Iron bar heat animation** (CSS keyframe `iron-heat`, applied as `animation: iron-heat 0.6s ease forwards` when `ironHit === true`):
```css
@keyframes iron-heat {
  0%   { background: #555; box-shadow: none; }
  30%  { background: #ff8c00; box-shadow: 0 0 10px #ff4400; }
  60%  { background: #fff0c0; box-shadow: 0 0 18px #ffaa00, 0 0 6px #fff; }
  100% { background: #cc5500; box-shadow: 0 0 6px rgba(204,85,0,0.4); }
}
```
`ironHit` is set to `false` after 600ms (matching the animation duration); when `ironHit` is `false` the bar returns to its heat-level color derived from `(correct / 10)` interpolated between cold gray and hot orange.

### Question Card (below arena)
- `animation: card-rise 0.25s ease` on mount (from globals.css) — plays each new question
- Vocabulary word header: `⚒ {WORD}` in Press Start 2P, 9px, gold — word extracted from `title` by taking everything after the first `": "` (colon-space). All seed titles follow the pattern `"{Category}: {word or phrase}"` (e.g. `"Define: ancient"` → `"ANCIENT"`, `"Fill in the blank: exhausted"` → `"EXHAUSTED"`, `"Context clue: insipid"` → `"INSIPID"`). Implementation: `title.includes(': ') ? title.split(': ').slice(1).join(': ').toUpperCase() : title.toUpperCase()`
- Question text: Press Start 2P, ~10px, centered, `lineHeight: 1.8`
- Answer grid: 2×2, each button min 48px tall (touch target)

**Heat Forge letter animation (correct answers):**
- Applied to the vocabulary word header letters on correct feedback
- Each letter wrapped in a `<span>` with `animation: letter-forge 0.4s ease forwards` and `animation-delay: index * 50ms`
- With 50ms per-letter delay, a 13-letter word's last letter starts at 600ms and completes at 1000ms — just within the 1000ms auto-advance window
- Keyframe `letter-forge`:
```css
@keyframes letter-forge {
  0%   { color: #fff8e0; text-shadow: 0 0 20px #fff, 0 0 40px #ffcc00, 0 0 60px #ff6600; }
  40%  { color: #ffaa00; text-shadow: 0 0 14px #ffcc00, 0 0 28px #ff6600; }
  80%  { color: #c9a84c; text-shadow: 0 0 8px rgba(201,168,76,0.6); }
  100% { color: #c9a84c; text-shadow: 0 0 4px rgba(201,168,76,0.3); }
}
```
- Animation runs only when `feedback === 'correct'`; letter spans re-render (via `key={questionIndex}`) on next question, resetting animation state

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
- Boss damage: `−{xpEarned} Boss HP` in ember red, or "No active boss" if none found

**Question log** (scrollable):
- One row per question
- ✓ (green left border) or ✗ (red left border)
- Question text + correct answer in Crimson Text
- Wrong rows: "you answered: {their answer}" in muted text below

**Buttons:**
- `⚒ PLAY AGAIN` — full width, blue gradient (`linear-gradient(135deg, #1a5c9e, #0e3a6e)`)
- `← BACK TO ACADEMY` — full width, ghost with gold border

---

## Database Writes (on `saving` phase)

All via browser Supabase client (`createClient()` from `lib/supabase/client`). Each write in its own try/catch — non-blocking, all three attempted independently.

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
const { data: boss } = await supabase
  .from('story_chapters')
  .select('id, boss_current_hp')
  .eq('household_id', householdId)
  .eq('is_unlocked', false)
  .gt('boss_current_hp', 0)
  .order('week_number', { ascending: true })
  .limit(1)
  .maybeSingle()

if (boss) {
  await supabase
    .from('story_chapters')
    .update({ boss_current_hp: Math.max(0, boss.boss_current_hp - xpEarned) })
    .eq('id', boss.id)
}
```

---

## Error Handling

- **Question fetch fails (network):** Show error message + "Try Again" button. Log error to console.
- **No questions found:** Show "No challenges available" with Back to Academy link.
- **Save fails:** Non-blocking — transition to results anyway. Show inline toast: "Couldn't save progress — check your connection."

---

## Constraints & Conventions

- `'use client'` on `WordForge.tsx` only — page stays server component
- `createClient()` from `@/lib/supabase/client` (browser client, wrapped in `useMemo`) inside the component
- `useRouter()` from `next/navigation` for Back to Academy navigation
- `useRef` for timeout IDs, cleaned up on unmount
- `image-rendering: pixelated` on AvatarPreview
- Touch targets ≥ 48px on answer buttons
- All text gender-neutral
- Fonts: `var(--font-pixel)`, `var(--font-heading)`, `var(--font-body)`
- Inline styles for dynamic values; Tailwind for layout classes
- Existing globals.css `card-rise` animation reused — no new global CSS added except `iron-heat` and `letter-forge` keyframes (added inline via `<style>` tag in the component)
