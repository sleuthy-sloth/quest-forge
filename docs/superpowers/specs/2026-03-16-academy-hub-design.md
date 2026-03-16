# Academy Hub — Design Spec
**Date:** 2026-03-16
**Route:** `src/app/play/academy/page.tsx`

## Overview

A pixel-art wizard's library hub that presents the 6 educational mini-games as books on bookshelves. Players tap a card to enter that game's route. The page is a Next.js 14 server component — no client-side JS required beyond the global shell.

---

## Data & Component Architecture

**Type:** Server Component (no `'use client'`)

**Data fetching:**
1. `createClient()` from `lib/supabase/server.ts`
2. `supabase.from('profiles').select('display_name, avatar_class, level, age, avatar_config').eq('id', user.id).single()`
   - No `getUser()` + redirect needed here — `play/layout.tsx` already guards all `/play/*` routes and redirects unauthenticated users to `/login` before any child page renders. The `user.id` is available via `supabase.auth.getUser()` solely to scope the profile query; no separate redirect logic is required.
3. Derive `age_tier`: `profile.age != null && profile.age >= 11 ? 'senior' : 'junior'`

**Note on `age` field:** The `age` column is `int, nullable` and is currently unpopulated for players created through the existing child account flow (which only collects `display_name`, `username`, and `password`). Until `age` is written during account creation or via the GM dashboard, all players will resolve to `'junior'` and see `20–30 XP`. The tier badge is correct-by-design; it will display accurately once the GM player-management page adds an age field.

**Hover implementation:** Use Tailwind's `group` + `group-hover:` utilities on the `<Link>` wrapper. This works in server components without any `'use client'` boundary:
```tsx
<Link href="..." className="group block ...">
  <div className="... transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:border-[rgba(201,168,76,0.5)]">
    ...
  </div>
</Link>
```

**No child client components needed.** Cards are plain Next.js `<Link>` elements with Tailwind group-hover for the lift effect.

---

## Visual Layout (top to bottom)

### Background
Same deep void gradient used across all play pages:
```css
background: linear-gradient(180deg, #0a0f1e 0%, #040812 100%);
```

### Page Header
- Title: `THE ACADEMY` — Press Start 2P font, centered, gold (`#c9a84c`)
- Subtitle: `⟡ Wizard's Tower of Knowledge ⟡` — Cinzel italic, muted gold, smaller
- Subtle decorative separator line below

### Hero Bar
Matches the aesthetic of the hero sections on `profile/page.tsx`:
- Left: `<AvatarPreview avatarConfig={profile.avatar_config} size={48} />` — consistent with other play pages
- Center: `display_name` in pixel font, `{avatar_class} · Lv {level}` in Cinzel beneath
- Right: tier badge — `✦ JUNIOR` or `✦ SENIOR` in Press Start 2P, purple accent (`#c9a0ff`), background `rgba(60,20,120,0.4)`, border `rgba(138,90,200,0.4)`

### Shelf Label
`CHOOSE YOUR DISCIPLINE` — tiny pixel text, muted gold, centered, above the shelves.

### Two Bookshelves
Each shelf is a row of 3 cards sitting above a wooden plank element:

**Shelf 1:** Math Arena · Word Forge · Science Labyrinth
**Shelf 2:** History Scroll · Vocab Duel · Logic Gate

**Wooden plank:**
```css
height: 10px;
background: linear-gradient(180deg, #4a2e0a, #2e1a04);
box-shadow: 0 3px 8px rgba(0,0,0,0.6), inset 0 1px 0 rgba(201,168,76,0.12);
```

### Game Cards

Each card is a `<Link>` wrapping:
- **Icon**: large emoji, centered top (~28px)
- **Name**: Press Start 2P, white, centered, ~7px, multi-line ok
- **Tagline**: Crimson Text italic, muted (`#8a7a5a`), centered, ~12px
- **XP badge**: `{min}–{max} XP`, Press Start 2P, gold, ~6px

**XP ranges by tier:**
- Junior: `20–30 XP`
- Senior: `30–50 XP`

**Card base style:**
```css
background: linear-gradient(135deg, #1a1c2e, #12131f);
border: 1px solid rgba(201,168,76,0.18);
border-radius: 3px;
```

**Hover:** Tailwind `group-hover:-translate-y-0.5` on the inner div, with `transition-transform duration-150`. Border brightens via `group-hover:border-[rgba(201,168,76,0.5)]`. No JS needed.

---

## Game Catalog

| Game | Icon | Tagline | Slug | Color Accent |
|------|------|---------|------|-------------|
| Math Arena | ⚔️ | Test your numbers in battle | `math-arena` | `#c43a00` |
| Word Forge | 🔨 | Forge words from molten letters | `word-forge` | `#1a5c9e` |
| Science Labyrinth | 🧪 | Navigate the maze of knowledge | `science-labyrinth` | `#1e8a4a` |
| History Scroll | 📜 | Unravel the tales of ages past | `history-scroll` | `#9e6a1a` |
| Vocab Duel | 📖 | Master the language of power | `vocab-duel` | `#7a1a9e` |
| Logic Gate | ⚡ | Unlock the puzzles of the mind | `logic-gate` | `#1e8ab8` |

---

## Navigation

Each card navigates to `/play/academy/[slug]`. The `[game]/page.tsx` routes do not exist yet — 404 is acceptable. This spec covers the hub only.

---

## What This Spec Does NOT Cover

- The individual game pages (`/play/academy/[game]/page.tsx`)
- Actual quiz logic, question fetching, or scoring
- Completion tracking or XP awarding
- Any animation beyond the CSS card lift hover

---

## Constraints & Conventions

- `image-rendering: pixelated` on all sprite/icon elements
- Mobile-first; shelf cards must not overflow on 375px screens — use `min-width: 0` on flex children if needed
- No fractional pixel scaling
- Fonts: Press Start 2P (pixel), Cinzel (headings), Crimson Text (body/taglines)
- All text gender-neutral; no player gender assumed
- Follow existing play page patterns — server component; auth redirect is handled by `play/layout.tsx`
