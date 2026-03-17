# Dashboard Bloodstone Redesign & Sign-out Fix

**Date:** 2026-03-15
**Status:** Approved

## Summary

Two problems to solve:
1. Sign-out button does not reliably redirect after signing out (Next.js router cache retains session state).
2. Dashboard text is hard to read due to very low opacity values (20–40%), and the overall aesthetic is generic.

The approved design applies a "Bloodstone" atmospheric theme: deeper sidebar background, crimson as a secondary accent colour alongside gold, boosted text contrast throughout, and a stronger glow on the brand and active state.

---

## Sign-out Fix

**File:** `src/components/dashboard/DashboardShell.tsx`

Replace `router.push('/login')` with `window.location.href = '/login'` after `supabase.auth.signOut()`. This forces a full page reload, which clears the Next.js router cache and the Supabase client session. `router.push` alone leaves the server component cache intact and can leave the user appearing still signed in.

```ts
async function handleLogout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  window.location.href = '/login'
}
```

---

## Visual Redesign

### Colour Tokens (Bloodstone palette)

| Token | Value | Usage |
|---|---|---|
| `crimson-border` | `rgba(180,50,80,0.18–0.35)` | Sidebar right border, footer divider, card top accent, section rule lines |
| `crimson-glow` | `rgba(200,40,70,0.30–0.35)` | Sign-out text-shadow |
| `crimson-card-bg` | `rgba(80,10,20,0.08–0.10)` | Player card and boss card background tint |
| `crimson-separator` | `rgba(180,50,80,0.14)` | Stat chip divider inside cards |
| `crimson-floor` | `rgba(140,20,50,0.07)` | Sidebar bottom gradient (atmospheric depth) |
| `gold-glow` | `0 0 18px rgba(201,140,40,0.55), 0 0 6px rgba(201,140,40,0.25)` | "QUEST FORGE" brand text-shadow |
| `gold-active-glow` | `0 0 8px rgba(201,140,40,0.35)` | Active nav item text-shadow |

### Contrast Improvements

All secondary text opacity values are raised to be legible on `#040812` background:

| Element | Before | After |
|---|---|---|
| Nav inactive items | `rgba(176,154,110,0.40)` | `rgba(200,185,145,0.72)` |
| "Game Master Console" label | `rgba(176,154,110,0.45)` | `rgba(200,175,130,0.72)` |
| Household name | `rgba(201,168,76,0.50)` | `rgba(201,168,76,0.80)` |
| "Signed in as" text | `rgba(176,154,110,0.35)` | `rgba(200,180,140,0.68)` |
| Signed-in username | `rgba(201,168,76,0.55)` | `#c9a84c` (full) |
| Sign-out button | `rgba(224,85,85,0.50)` | `rgba(230,80,100,0.88)` |
| Player `@username` | `rgba(200,215,255,0.28)` | `rgba(180,200,255,0.62)` |
| XP / gold labels | `rgba(200,215,255,0.30)` | `rgba(180,200,255,0.58)` |
| Section headings | `rgba(201,168,76,0.65)` | `rgba(201,168,76,0.85)` |
| Top bar adventurer count | `rgba(200,215,255,0.25)` | `rgba(200,215,255,0.40)` |
| Boss description text | `rgba(200,215,255,0.45)` | `rgba(200,215,255,0.50)` |
| Boss HP label / percent | `rgba(200,215,255,0.30–0.35)` | `rgba(200,215,255,0.42)` |
| Boss "damage" footnote | `rgba(200,215,255,0.20)` | `rgba(200,215,255,0.42)` |

### Sidebar (`DashboardShell.tsx`)

- **Background:** `linear-gradient(180deg, #080510 0%, #050810 100%)` — replaces flat `#040812`
- **Right border:** `rgba(180,50,80,0.18)` — replaces gold border
- **Brand divider:** keep gold `rgba(201,168,76,0.18)`
- **Footer divider:** `rgba(180,50,80,0.20)` — crimson
- **Active nav:** add `text-shadow: 0 0 8px rgba(201,140,40,0.35)` and left border `rgba(201,140,40,0.80)`
- **Floor glow:** absolute `div` at bottom, `rgba(140,20,50,0.07)` gradient upward

### Top Bar (`dashboard/page.tsx` + `globals.css`)

- **Bottom border:** `rgba(180,50,80,0.12)` — replaces gold border
- **Background tint:** `rgba(80,10,20,0.04)`

### Section Rules (`dashboard/page.tsx`)

- Rule line gradient: `linear-gradient(90deg, rgba(180,50,80,0.28), transparent)` — replaces gold line

### Player Cards (`dashboard/page.tsx`)

- **Background:** `rgba(80,10,20,0.08)`
- **Border:** `rgba(201,168,76,0.20)` with `border-top: rgba(201,168,76,0.32)` for accent
- **Box-shadow:** `0 2px 20px rgba(140,20,50,0.07), inset 0 1px 0 rgba(255,220,150,0.03)`
- **Stat separator:** `rgba(180,50,80,0.14)`

### Boss Card (`dashboard/page.tsx`)

- **Background:** `rgba(80,10,20,0.10)` (slightly darker than player cards — boss = more dangerous)
- **Top border:** `rgba(180,50,80,0.35)` — crimson danger accent
- **Quote stripe (boss description):** `border-left: 2px solid rgba(180,50,80,0.30)`
- **Box-shadow:** `0 2px 24px rgba(140,20,50,0.10)`

---

## Files to Modify

1. `src/components/dashboard/DashboardShell.tsx` — sign-out fix + full sidebar reskin
2. `src/app/dashboard/page.tsx` — top bar border/bg, section rules, player cards, boss card
3. `src/app/globals.css` — `.section-rule .rule-line` gradient colour update, `.dash-topbar` border colour

---

## Out of Scope

- Player-facing `/play` pages (separate task)
- Other dashboard sub-pages (`/chores`, `/loot`, etc.) — they share the shell so will inherit sidebar changes automatically
- Any new functionality
