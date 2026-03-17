# Dashboard Bloodstone Redesign & Sign-out Fix Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the broken sign-out redirect and apply the Bloodstone visual theme to the GM dashboard — deeper sidebar, crimson secondary accents, and legible text contrast throughout.

**Architecture:** Three files change. `DashboardShell.tsx` gets the sign-out fix and full sidebar reskin. `dashboard/page.tsx` gets updated card backgrounds, crimson section dividers, and contrast-boosted text. `globals.css` gets two small class updates to match. No new files, no new dependencies.

**Tech Stack:** Next.js 14 App Router, Tailwind CSS, inline styles (existing pattern), Supabase client auth

---

## Chunk 1: Sign-out Fix + Sidebar Reskin

### Task 1: Fix sign-out redirect

**Files:**
- Modify: `src/components/dashboard/DashboardShell.tsx`

**Context:** After `supabase.auth.signOut()`, `router.push('/login')` leaves the Next.js server component cache intact — the layout still sees the old session and redirects back to `/dashboard`. Replacing it with `window.location.href` forces a full browser navigation, clearing the cache entirely. If `router` is only used in this function, the `useRouter` import and call can be removed entirely.

- [ ] **Step 1: Update `handleLogout` and clean up the router import**

Find:
```ts
import { usePathname, useRouter } from 'next/navigation'
```
Replace with:
```ts
import { usePathname } from 'next/navigation'
```

Find:
```ts
  const pathname = usePathname()
  const router = useRouter()
```
Replace with:
```ts
  const pathname = usePathname()
```

Find:
```ts
  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }
```
Replace with:
```ts
  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }
```

Note: if `router` is used elsewhere in the file, keep the import and `useRouter()` call and only update `handleLogout`.

- [ ] **Step 2: Type-check**

```bash
npm run type-check
```
Expected: no errors

- [ ] **Step 3: Manual verify**

Start `npm run dev`, sign in as a GM, click Sign Out. Expected: browser fully navigates to `/login`. Pressing the browser Back button should NOT return to the dashboard without re-authenticating.

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/DashboardShell.tsx
git commit -m "fix(auth): force full page reload on sign-out to clear Next.js router cache"
```

---

### Task 2: Reskin the sidebar

**Files:**
- Modify: `src/components/dashboard/DashboardShell.tsx`

**Context:** The sidebar is rendered by `SidebarContent` (defined inside `DashboardShell`). Both the desktop fixed sidebar and the mobile slide-in drawer render `<SidebarContent />`, so one edit updates both. Changes are a mix of Tailwind class replacements and inline style additions — the file already uses both patterns. The `<aside>` gets `position: relative` so the floor-glow `div` (absolute-positioned) can sit inside it without a new wrapper.

- [ ] **Step 1: Update the outer `<aside>` element**

Find:
```tsx
    <aside className="flex flex-col h-full w-56 bg-[#040812] border-r border-[#c9a84c]/10">
```

Replace with:
```tsx
    <aside
      className="flex flex-col h-full w-56 border-r relative"
      style={{
        background: 'linear-gradient(180deg, #080510 0%, #050810 100%)',
        borderRightColor: 'rgba(180,50,80,0.18)',
      }}
    >
```

- [ ] **Step 2: Add the crimson floor-glow div as the first child of `<aside>`**

Find (the line immediately after the `<aside>` opening tag):
```tsx
      {/* Brand */}
      <div className="px-5 py-5 border-b border-[#c9a84c]/10">
```

Replace with:
```tsx
      {/* Crimson floor glow — atmospheric depth at bottom of sidebar */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0"
        style={{ height: 100, background: 'linear-gradient(0deg, rgba(140,20,50,0.07) 0%, transparent 100%)', zIndex: 0 }}
        aria-hidden="true"
      />

      {/* Brand */}
      <div className="px-5 py-5 relative" style={{ borderBottom: '1px solid rgba(201,168,76,0.18)', zIndex: 1 }}>
```

- [ ] **Step 3: Update brand text opacities**

Find (the "Game Master Console" span — note it uses a Tailwind opacity class for colour):
```tsx
        <span
          className="block text-[#b09a6e]/45 text-[0.65rem] tracking-wider mt-1"
          style={{ fontFamily: 'var(--font-heading), serif' }}
        >
          Game Master Console
        </span>
```
Replace with:
```tsx
        <span
          className="block text-[0.65rem] tracking-wider mt-1"
          style={{ fontFamily: 'var(--font-heading), serif', color: 'rgba(200,175,130,0.72)' }}
        >
          Game Master Console
        </span>
```

Find (the household name span — uses Tailwind opacity `/50`):
```tsx
          <span
            className="block text-[#c9a84c]/50 text-[0.7rem] mt-2 truncate"
            style={{ fontFamily: 'var(--font-heading), serif' }}
            title={householdName}
          >
```
Replace with:
```tsx
          <span
            className="block text-[0.7rem] mt-2 truncate"
            style={{ fontFamily: 'var(--font-heading), serif', color: 'rgba(201,168,76,0.80)' }}
            title={householdName}
          >
```

Find (the "Quest Forge" brand span — update only the `textShadow` value):
```tsx
          style={{ fontFamily: 'var(--font-pixel), monospace', textShadow: '0 0 16px rgba(201,168,76,0.3)' }}
```
Replace with:
```tsx
          style={{ fontFamily: 'var(--font-pixel), monospace', textShadow: '0 0 18px rgba(201,140,40,0.55), 0 0 6px rgba(201,140,40,0.25)' }}
```

- [ ] **Step 4: Update nav items — replace full `<Link>` element**

Find the entire `<Link>` element inside the nav (it spans from `<Link` to the closing `</Link>`):
```tsx
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setSidebarOpen(false)}
            className={`
              flex items-center gap-2.5 px-3 py-2.5 rounded-[3px]
              text-[0.68rem] font-semibold tracking-widest uppercase
              transition-colors duration-150
              ${isActive(item.href)
                ? 'text-[#c9a84c] bg-[#c9a84c]/8'
                : 'text-[#b09a6e]/40 hover:text-[#c9a84c]/75 hover:bg-[#c9a84c]/5'
              }
            `}
            style={{ fontFamily: 'var(--font-heading), serif' }}
          >
            <span className="text-sm w-4 text-center" aria-hidden="true">{item.icon}</span>
            {item.label}
          </Link>
```

Replace with:
```tsx
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setSidebarOpen(false)}
            className={`
              flex items-center gap-2.5 px-3 py-2.5 rounded-[3px]
              text-[0.68rem] font-semibold tracking-widest uppercase
              transition-colors duration-150
              ${isActive(item.href)
                ? 'bg-[#c9a84c]/12 border-l-2'
                : 'hover:bg-[#c9a84c]/5'
              }
            `}
            style={isActive(item.href)
              ? { fontFamily: 'var(--font-heading), serif', color: '#c9a84c', textShadow: '0 0 8px rgba(201,140,40,0.35)', borderLeftColor: 'rgba(201,140,40,0.80)' }
              : { fontFamily: 'var(--font-heading), serif', color: 'rgba(200,185,145,0.72)' }
            }
          >
            <span className="text-sm w-4 text-center" aria-hidden="true">{item.icon}</span>
            {item.label}
          </Link>
```

- [ ] **Step 5: Update the GM footer section**

Find (the footer wrapper div):
```tsx
      <div className="px-3 py-4 border-t border-[#c9a84c]/10 space-y-2">
```
Replace with:
```tsx
      <div className="px-3 py-4 space-y-2 relative" style={{ borderTop: '1px solid rgba(180,50,80,0.20)', zIndex: 1 }}>
```

Find (the "Signed in as" paragraph and its inner span — both need updating):
```tsx
        <p
          className="px-3 text-[0.65rem] text-[#b09a6e]/35 leading-relaxed"
          style={{ fontFamily: 'var(--font-heading), serif' }}
        >
          Signed in as<br />
          <span className="text-[#c9a84c]/55">{displayName}</span>
        </p>
```
Replace with:
```tsx
        <p
          className="px-3 text-[0.65rem] leading-relaxed"
          style={{ fontFamily: 'var(--font-heading), serif', color: 'rgba(200,180,140,0.68)' }}
        >
          Signed in as<br />
          <span style={{ color: '#c9a84c', fontSize: '0.7rem' }}>{displayName}</span>
        </p>
```

Find (the sign-out button — note it uses Tailwind colour classes that must be removed):
```tsx
        <button
          onClick={handleLogout}
          className="w-full px-3 py-2 text-left text-[0.65rem] tracking-wider uppercase
            text-[#e05555]/50 hover:text-[#e05555] hover:bg-[#e05555]/6
            rounded-[3px] transition-colors duration-150"
          style={{ fontFamily: 'var(--font-heading), serif' }}
        >
          ⬡ Sign Out
        </button>
```
Replace with:
```tsx
        <button
          onClick={handleLogout}
          className="w-full px-3 py-2 text-left text-[0.65rem] tracking-wider uppercase
            hover:bg-[#e05555]/6 rounded-[3px] transition-colors duration-150"
          style={{
            fontFamily: 'var(--font-heading), serif',
            color: 'rgba(230,80,100,0.88)',
            textShadow: '0 0 10px rgba(200,40,70,0.35)',
          }}
        >
          ⬡ Sign Out
        </button>
```

- [ ] **Step 6: Update the nav wrapper to sit above the floor glow**

Find (the `<nav>` element):
```tsx
      <nav className="flex-1 flex flex-col gap-0.5 px-2 py-3" aria-label="Dashboard navigation">
```
Replace with:
```tsx
      <nav className="flex-1 flex flex-col gap-0.5 px-2 py-3 relative" style={{ zIndex: 1 }} aria-label="Dashboard navigation">
```

- [ ] **Step 7: Type-check and lint**

```bash
npm run type-check && npm run lint
```
Expected: no errors or warnings

- [ ] **Step 8: Visual verify**

Open `http://localhost:3000/dashboard`. Check:
- Sidebar background is a subtle purple-dark gradient (not flat navy)
- Inactive nav items show warm parchment text — clearly readable
- Active nav item has a left gold border and gold glow
- "Game Master Console" and household name are legible
- Sign-out button is clearly visible with crimson colour and glow
- Bottom of sidebar has a faint crimson warmth
- Mobile: open the hamburger menu and verify the drawer looks identical

- [ ] **Step 9: Commit**

```bash
git add src/components/dashboard/DashboardShell.tsx
git commit -m "feat(dashboard): bloodstone sidebar — deeper bg, crimson accents, readable nav text"
```

---

## Chunk 2: Page Content & globals.css

### Task 3: Update top bar and section rules in `dashboard/page.tsx`

**Files:**
- Modify: `src/app/dashboard/page.tsx`

**Context:** The top bar border and background use gold/near-transparent values. Section rules use a gold gradient line. Both shift to crimson to tie the page to the sidebar's new accent colour.

- [ ] **Step 1: Update the top bar `<div>`**

Find:
```tsx
<div className="dash-topbar">
```

This class is defined in `globals.css`. We'll update the class itself in Task 5. No change needed here.

- [ ] **Step 2: Update the adventurer count span in the top bar**

Find (around line 203):
```tsx
<span style={{
  fontFamily: 'Cinzel, serif',
  fontWeight: 300,
  fontSize: '0.72rem',
  color: 'rgba(200,215,255,0.25)',
}}>
```

Replace `0.25` opacity with `0.40`:
```tsx
<span style={{
  fontFamily: 'Cinzel, serif',
  fontWeight: 300,
  fontSize: '0.72rem',
  color: 'rgba(200,215,255,0.40)',
}}>
```

- [ ] **Step 3: Update the `section-rule` `.rule-line` in the inline `<style>` block**

Find in the `<style>` block (around line 170):
```css
        .section-rule .rule-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, rgba(201,168,76,0.2), transparent);
        }
```

Replace with:
```css
        .section-rule .rule-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, rgba(180,50,80,0.28), transparent);
        }
```

- [ ] **Step 4: Update the section heading colour**

Find in the `<style>` block (the full `.section-rule h2` rule, around line 160):
```css
        .section-rule h2 {
          font-family: 'Cinzel', serif;
          font-size: 0.72rem;
          font-weight: 700;
          color: rgba(201,168,76,0.65);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          white-space: nowrap;
          flex-shrink: 0;
        }
```

Replace with (only `color` changes):
```css
        .section-rule h2 {
          font-family: 'Cinzel', serif;
          font-size: 0.72rem;
          font-weight: 700;
          color: rgba(201,168,76,0.85);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          white-space: nowrap;
          flex-shrink: 0;
        }
```

---

### Task 4: Update player cards and boss card in `dashboard/page.tsx`

**Files:**
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Update player card container**

Find the player card outer `<div>` (has `ov-card px-corner` classes, around line 283):
```tsx
<div key={player.id} className={`ov-card px-corner ${delayClass}`}>
```

The `ov-card` class is in the inline `<style>`. Update its background and border in the style block:

Find in `<style>` (the full `.ov-card` rule, around line 64):
```css
        .ov-card {
          position: relative;
          background: rgba(255,255,255,0.022);
          border: 1px solid rgba(201,168,76,0.12);
          border-radius: 3px;
          overflow: hidden;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
```

Replace with (background, border, and box-shadow change; border-radius, overflow, transition preserved):
```css
        .ov-card {
          position: relative;
          background: rgba(80,10,20,0.08);
          border: 1px solid rgba(201,168,76,0.20);
          border-top: 1px solid rgba(201,168,76,0.32);
          border-radius: 3px;
          overflow: hidden;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-shadow: 0 2px 20px rgba(140,20,50,0.07), inset 0 1px 0 rgba(255,220,150,0.03);
        }
```

- [ ] **Step 2: Update player card username opacity**

Find (around line 332):
```tsx
color: 'rgba(200,215,255,0.28)',
```
Replace with:
```tsx
color: 'rgba(180,200,255,0.62)',
```

- [ ] **Step 3: Update XP progress label colours**

Find (around line 354):
```tsx
color: 'rgba(200,215,255,0.3)',
```
(This is the flex row with `{current.toLocaleString()} XP` and `to Lv.N` labels.)

Replace with:
```tsx
color: 'rgba(180,200,255,0.58)',
```

- [ ] **Step 4: Update stat chip divider and label colours**

Find the stat chip row's `borderTop` (around line 366):
```tsx
borderTop: '1px solid rgba(201,168,76,0.06)',
```
Replace with:
```tsx
borderTop: '1px solid rgba(180,50,80,0.14)',
```

Find the `xp` unit label span (around line 372):
```tsx
                        <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 300, fontSize: '0.55rem', color: 'rgba(200,215,255,0.3)' }}>xp</span>
```
Replace with:
```tsx
                        <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 300, fontSize: '0.55rem', color: 'rgba(180,200,255,0.55)' }}>xp</span>
```

Find the `gp` unit label span (around line 379):
```tsx
                        <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 300, fontSize: '0.55rem', color: 'rgba(200,215,255,0.3)' }}>gp</span>
```
Replace with:
```tsx
                        <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 300, fontSize: '0.55rem', color: 'rgba(180,200,255,0.55)' }}>gp</span>
```

- [ ] **Step 5: Update boss card**

Find the boss card `<div>` (has `ov-card px-corner slide-in` classes, around line 440):
```tsx
<div
  className="ov-card px-corner slide-in"
  style={{ padding: '1.5rem 1.75rem' }}
>
```

Replace with:
```tsx
<div
  className="ov-card px-corner slide-in"
  style={{
    padding: '1.5rem 1.75rem',
    background: 'rgba(80,10,20,0.10)',
    borderTop: '1px solid rgba(180,50,80,0.35)',
    boxShadow: '0 2px 24px rgba(140,20,50,0.10)',
  }}
>
```

- [ ] **Step 6: Update boss description quote stripe**

Find (around line 519):
```tsx
borderLeft: '2px solid rgba(201,168,76,0.15)',
```
Replace with:
```tsx
borderLeft: '2px solid rgba(180,50,80,0.30)',
```

- [ ] **Step 7: Boost boss card secondary text contrast**

Find the `boss.title` italic paragraph colour (around line 477):
```tsx
                    color: 'rgba(201,168,76,0.45)',
```
Replace with:
```tsx
                    color: 'rgba(201,168,76,0.62)',
```

Find the boss description text colour (around line 515):
```tsx
                color: 'rgba(200,215,255,0.45)',
```
Replace with:
```tsx
                color: 'rgba(200,215,255,0.50)',
```

Find the "HP remaining" label (around line 511 — identified by `letterSpacing: '0.06em'` neighbour):
```tsx
                <div style={{
                  fontFamily: 'Cinzel, serif',
                  fontWeight: 300,
                  fontSize: '0.6rem',
                  color: 'rgba(200,215,255,0.3)',
                  letterSpacing: '0.06em',
                }}>
                  HP remaining
                </div>
```
Replace with:
```tsx
                <div style={{
                  fontFamily: 'Cinzel, serif',
                  fontWeight: 300,
                  fontSize: '0.6rem',
                  color: 'rgba(200,215,255,0.42)',
                  letterSpacing: '0.06em',
                }}>
                  HP remaining
                </div>
```

Find the "Boss HP" label span (around line 529 — identified by `textTransform: 'uppercase'` neighbour):
```tsx
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.6rem', color: 'rgba(200,215,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Boss HP
                </span>
```
Replace with:
```tsx
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.6rem', color: 'rgba(200,215,255,0.42)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Boss HP
                </span>
```

Find the boss damage footnote (around line 555 — identified by `fontFamily` + `marginTop` neighbours):
```tsx
              <p style={{
                fontFamily: 'Cinzel, serif',
                fontWeight: 300,
                fontSize: '0.68rem',
                color: 'rgba(200,215,255,0.2)',
                marginTop: 8,
              }}>
```
Replace with:
```tsx
              <p style={{
                fontFamily: 'Cinzel, serif',
                fontWeight: 300,
                fontSize: '0.68rem',
                color: 'rgba(200,215,255,0.42)',
                marginTop: 8,
              }}>
```

- [ ] **Step 8: Type-check and lint**

```bash
npm run type-check && npm run lint
```
Expected: no errors

- [ ] **Step 9: Visual verify**

Open `http://localhost:3000/dashboard`. Check:
- Player cards have a faint crimson-warm background and a slightly brighter top border
- Usernames, XP labels, and gold/XP stat chips are clearly readable
- Boss card has the crimson top border and crimson quote stripe
- Boss card description text is legible

---

### Task 5: Update `globals.css`

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Update `.dash-topbar` border and background**

Find the full rule (around line 263 of `globals.css`):
```css
.dash-topbar {
  border-bottom: 1px solid rgba(201,168,76,0.08);
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: rgba(255,255,255,0.01);
  flex-shrink: 0;
}
```

Replace with (only `border-bottom` and `background` change):
```css
.dash-topbar {
  border-bottom: 1px solid rgba(180,50,80,0.12);
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: rgba(80,10,20,0.04);
  flex-shrink: 0;
}
```

- [ ] **Step 2: Lint and build**

```bash
npm run lint && npm run build
```
Expected: build succeeds with no errors

- [ ] **Step 3: Final visual pass**

Open `http://localhost:3000/dashboard`. Walk through:
1. Top bar has a faint crimson bottom border
2. Sidebar — purple-dark gradient, crimson footer divider, readable nav, glowing sign-out
3. Player cards — crimson-warm bg tint, readable usernames and stats
4. Boss card — crimson top border and quote stripe
5. Section rules — crimson gradient divider lines
6. Sign out — navigate to `/login` fully, cannot go back without re-auth

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/page.tsx src/app/globals.css
git commit -m "feat(dashboard): bloodstone theme — crimson accents, boosted text contrast throughout"
```
