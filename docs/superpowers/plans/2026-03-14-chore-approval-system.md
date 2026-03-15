# Chore Approval System — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the GM chore approval workflow — a `/dashboard/approvals` page where Game Masters approve or reject pending chore completions in real time, with the existing overview badge updated to link there.

**Architecture:** Two POST API routes handle approve (single UPDATE that populates rewards + flips verified, triggering the DB to award XP/gold/boss damage) and reject (DELETE scoped to household_id). A `'use client'` approvals page fetches the initial pending queue on mount, subscribes to Supabase Realtime for live new submissions, and supports individual and batch approval. The existing pending-approvals badge in `dashboard/page.tsx` is updated to point at `/dashboard/approvals` instead of `/dashboard/chores`.

**Tech Stack:** Next.js 14 App Router, `@supabase/ssr` server client (API routes), `@supabase/ssr` browser client (Realtime + mutations), TypeScript, inline CSS matching existing dashboard aesthetic (Cinzel + Press Start 2P fonts, gold/dark palette)

**Key constraint:** The `handle_chore_verified` DB trigger fires when `verified` flips to `true` and awards XP/gold/boss damage automatically — but it reads `xp_awarded` and `gold_awarded` from the completion row, which default to 0. The approve route **must** copy `xp_reward`/`gold_reward` from the parent `chores` row into those columns in the **same UPDATE** that sets `verified=true`. Never two separate UPDATEs.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/app/api/chores/approve/route.ts` | **Create** | POST — fetch chore rewards, UPDATE completion with rewards + verified=true, household-scoped |
| `src/app/api/chores/reject/route.ts` | **Create** | POST — DELETE completion WHERE id AND household_id |
| `src/app/dashboard/approvals/page.tsx` | **Create** | `'use client'` — initial fetch, Realtime sub, approve/reject/batch UI, skeleton, empty state |
| `src/app/dashboard/approvals/error.tsx` | **Create** | Next.js error boundary for the approvals segment |
| `src/app/dashboard/page.tsx` | **Modify** | Line 224 — change `href="/dashboard/chores"` to `href="/dashboard/approvals"` |

---

## Chunk 1: API Routes, Badge Update, Error Boundary

### Task 1: Approve API Route

**File:** `src/app/api/chores/approve/route.ts`

This route:
1. Authenticates the caller and verifies they are a GM.
2. Fetches the `chore_completions` row **joined** to its parent `chores` row to get `xp_reward` and `gold_reward`.
3. Issues a single UPDATE that sets `verified=true`, `verified_at`, `xp_awarded`, and `gold_awarded` together — the DB trigger then fires and awards the player.
4. Guards against double-approval by filtering `verified=false` in the SELECT.

- [ ] **Step 1: Create the file with full implementation**

```typescript
// src/app/api/chores/approve/route.ts
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const Schema = z.object({
  completionId: z.string().uuid('completionId must be a valid UUID'),
})

/**
 * POST /api/chores/approve
 *
 * Approves a pending chore completion.
 * - Copies xp_reward + gold_reward from the parent chore into xp_awarded/gold_awarded.
 * - Sets verified=true and verified_at=now() in one UPDATE.
 * - The handle_chore_verified DB trigger fires and awards XP, gold, and boss damage.
 *
 * Protected: GM role required.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, household_id')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'gm') {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const result = Schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
  }

  const { completionId } = result.data

  // Fetch completion + parent chore rewards in one query.
  // The .eq('verified', false) guard prevents double-approval.
  const { data: completion, error: fetchError } = await supabase
    .from('chore_completions')
    .select('id, chores!chore_id(xp_reward, gold_reward)')
    .eq('id', completionId)
    .eq('household_id', profile.household_id)
    .eq('verified', false)
    .single()

  if (fetchError || !completion) {
    return NextResponse.json(
      { error: 'Completion not found or already approved.' },
      { status: 404 }
    )
  }

  // Extract rewards — TypeScript types the join as an object or null.
  const chore = completion.chores as { xp_reward: number; gold_reward: number } | null
  const xpAwarded   = chore?.xp_reward   ?? 0
  const goldAwarded = chore?.gold_reward ?? 0

  // Single UPDATE: populates awards + flips verified=true in one operation.
  // The handle_chore_verified trigger fires here and awards xp/gold/boss damage.
  // .eq('verified', false) closes the TOCTOU window: two concurrent approvals
  // for the same row both pass the SELECT, but only the first UPDATE matches.
  const { error: updateError } = await supabase
    .from('chore_completions')
    .update({
      verified:     true,
      verified_at:  new Date().toISOString(),
      xp_awarded:   xpAwarded,
      gold_awarded: goldAwarded,
    })
    .eq('id', completionId)
    .eq('household_id', profile.household_id)
    .eq('verified', false)

  if (updateError) {
    console.error('[approve] update error:', updateError)
    return NextResponse.json({ error: 'Failed to approve completion.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, xpAwarded, goldAwarded })
}
```

- [ ] **Step 2: Type-check**

```bash
cd /path/to/quest-forge && npx tsc --noEmit --skipLibCheck
```

Expected: no errors for this file.

- [ ] **Step 3: Lint**

```bash
npm run lint -- --max-warnings 0
```

Expected: no lint errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/chores/approve/route.ts
git commit -m "feat: add POST /api/chores/approve route"
```

---

### Task 2: Reject API Route

**File:** `src/app/api/chores/reject/route.ts`

Deletes the completion row. `household_id` is included in the WHERE clause as defense-in-depth on top of RLS.

- [ ] **Step 1: Create the file**

```typescript
// src/app/api/chores/reject/route.ts
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const Schema = z.object({
  completionId: z.string().uuid('completionId must be a valid UUID'),
})

/**
 * POST /api/chores/reject
 *
 * Rejects a pending chore completion by deleting the row.
 * No audit trail is kept. The player can resubmit the chore.
 * The optional reject reason (if any) is UI-only and is never sent here.
 *
 * Protected: GM role required.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, household_id')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'gm') {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const result = Schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
  }

  const { completionId } = result.data

  const { error } = await supabase
    .from('chore_completions')
    .delete()
    .eq('id', completionId)
    .eq('household_id', profile.household_id)

  if (error) {
    console.error('[reject] delete error:', error)
    return NextResponse.json({ error: 'Failed to reject completion.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
```

- [ ] **Step 2: Type-check and lint**

```bash
npx tsc --noEmit --skipLibCheck && npm run lint -- --max-warnings 0
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/chores/reject/route.ts
git commit -m "feat: add POST /api/chores/reject route"
```

---

### Task 3: Update Overview Badge href

**File:** `src/app/dashboard/page.tsx`, line 224

Change `href="/dashboard/chores"` → `href="/dashboard/approvals"` on the existing pending-approvals badge. Do not add a second badge or change any other part of the file.

- [ ] **Step 1: Edit the file**

Find this block (around line 222–231):

```tsx
{totalPending > 0 && (
  <Link
    href="/dashboard/chores"
    className="pending-badge large"
    style={{ textDecoration: 'none' }}
  >
    <span>⚠</span>
    {totalPending} pending {totalPending === 1 ? 'approval' : 'approvals'}
  </Link>
)}
```

Change only the `href` value:

```tsx
{totalPending > 0 && (
  <Link
    href="/dashboard/approvals"
    className="pending-badge large"
    style={{ textDecoration: 'none' }}
  >
    <span>⚠</span>
    {totalPending} pending {totalPending === 1 ? 'approval' : 'approvals'}
  </Link>
)}
```

- [ ] **Step 2: Type-check and lint**

```bash
npx tsc --noEmit --skipLibCheck && npm run lint -- --max-warnings 0
```

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/page.tsx
git commit -m "fix: redirect pending-approvals badge to /dashboard/approvals"
```

---

### Task 4: Error Boundary

**File:** `src/app/dashboard/approvals/error.tsx`

Next.js requires an `error.tsx` alongside each route segment (CLAUDE.md requirement). This is a minimal `'use client'` error component.

- [ ] **Step 1: Create the file**

```typescript
// src/app/dashboard/approvals/error.tsx
'use client'

import { useEffect } from 'react'

export default function ApprovalsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[ApprovalQueue] Error:', error)
  }, [error])

  return (
    <div style={{
      padding: '3rem 2rem',
      textAlign: 'center',
      background: 'rgba(220,60,60,0.04)',
      border: '1px solid rgba(220,60,60,0.15)',
      borderRadius: 3,
      margin: '2rem auto',
      maxWidth: 480,
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.75rem', opacity: 0.4 }}>⚠</div>
      <p style={{
        fontFamily: 'Cinzel, serif',
        fontSize: '0.82rem',
        color: 'rgba(230,110,90,0.85)',
        marginBottom: '1.25rem',
        letterSpacing: '0.04em',
      }}>
        The Approval Queue encountered an error.
      </p>
      <button
        onClick={reset}
        style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '0.72rem',
          color: 'rgba(201,168,76,0.8)',
          background: 'rgba(201,168,76,0.06)',
          border: '1px solid rgba(201,168,76,0.2)',
          borderRadius: 2,
          padding: '0.5rem 1.25rem',
          cursor: 'pointer',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        Try Again
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Type-check and lint**

```bash
npx tsc --noEmit --skipLibCheck && npm run lint -- --max-warnings 0
```

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/approvals/error.tsx
git commit -m "feat: add error boundary for /dashboard/approvals"
```

---

## Chunk 2: Approvals Page

### Task 5: Approvals Page Client Component

**File:** `src/app/dashboard/approvals/page.tsx`

This is the main deliverable. It is a `'use client'` component that:

1. On mount: fetches the current user's profile (for `household_id`), then fetches all `chore_completions` where `verified=false` for this household, joined to `profiles` (player name) and `chores` (title, flavor text, rewards).
2. Subscribes to Supabase Realtime INSERT events on `chore_completions` filtered by `household_id`. On new INSERT, refetches the single new row with joins and appends it to state.
3. Renders a loading skeleton while data loads.
4. Renders an empty state when the queue is empty.
5. Renders a card per pending item, showing player name, chore title, flavor text, reward amounts (from `chores.xp_reward` / `chores.gold_reward`, NOT the zero-valued `xp_awarded`), and submitted time.
6. Approve button: optimistic removal → POST `/api/chores/approve` → toast on success/error.
7. Reject button: expands a reason text field + relabels button to "Confirm Reject" → POST `/api/chores/reject` → card removed on success.
8. Batch Approve All: sequential loop with progress display.
9. Simple inline toast system (no library dependency).

**Time display helper:** A `timeAgo(date)` function that returns human-readable relative time ("2 minutes ago", "1 hour ago", etc.) without any external library.

- [ ] **Step 1: Create the file with full implementation**

```typescript
// src/app/dashboard/approvals/page.tsx
'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

// ── Types ──────────────────────────────────────────────────────────────────

interface PendingCompletion {
  id: string
  completed_at: string
  player_id: string
  chore_id: string
  profiles: { display_name: string; username: string } | null
  chores: {
    title: string
    quest_flavor_text: string | null
    description: string | null
    xp_reward: number
    gold_reward: number
  } | null
}

interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}

// ── Helpers ────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60)  return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// Deterministic avatar colour — matches palette in dashboard/page.tsx
const PALETTES = [
  { bg: 'rgba(100,30,140,0.85)',  border: 'rgba(160,80,220,0.6)',  text: '#d4a8f0' },
  { bg: 'rgba(20,60,140,0.85)',   border: 'rgba(60,120,220,0.6)',  text: '#8ab4f8' },
  { bg: 'rgba(20,100,70,0.85)',   border: 'rgba(40,180,120,0.6)',  text: '#6ed9a8' },
  { bg: 'rgba(140,60,20,0.85)',   border: 'rgba(220,110,40,0.6)',  text: '#f0a86e' },
  { bg: 'rgba(130,20,50,0.85)',   border: 'rgba(210,50,90,0.6)',   text: '#f08aaa' },
  { bg: 'rgba(20,100,120,0.85)',  border: 'rgba(40,160,200,0.6)',  text: '#6ecef0' },
  { bg: 'rgba(100,95,20,0.85)',   border: 'rgba(200,180,40,0.6)',  text: '#f0dc6e' },
  { bg: 'rgba(60,20,100,0.85)',   border: 'rgba(120,50,200,0.6)',  text: '#b08af0' },
]
function avatarPalette(username: string) {
  let h = 0
  for (const c of username) h = (Math.imul(h, 31) + c.charCodeAt(0)) | 0
  return PALETTES[Math.abs(h) % PALETTES.length]
}

// ── Main component ──────────────────────────────────────────────────────────

export default function ApprovalQueuePage() {
  const [pending, setPending]             = useState<PendingCompletion[]>([])
  const [loading, setLoading]             = useState(true)
  const [householdId, setHouseholdId]     = useState<string | null>(null)
  const [processing, setProcessing]       = useState<Set<string>>(new Set())
  const [rejectExpanded, setRejectExpanded] = useState<Record<string, boolean>>({})
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({})
  const [toasts, setToasts]              = useState<Toast[]>([])
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null)

  // useMemo stabilises the client reference so useEffect hooks don't re-fire
  // on every render due to a new supabase object being created each time.
  const supabase = useMemo(() => createClient(), [])
  // useRef keeps the counter stable across re-renders so toast IDs are unique.
  const toastCounter = useRef(0)

  // ── Toast helpers ──
  function addToast(message: string, type: Toast['type']) {
    const id = ++toastCounter.current
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }

  // ── Initial data fetch ──
  const fetchPending = useCallback(async (hid: string) => {
    const { data, error } = await supabase
      .from('chore_completions')
      .select(`
        id,
        completed_at,
        player_id,
        chore_id,
        profiles!player_id ( display_name, username ),
        chores ( title, quest_flavor_text, description, xp_reward, gold_reward )
      `)
      .eq('household_id', hid)
      .eq('verified', false)
      .order('completed_at', { ascending: true })

    if (error) {
      console.error('[ApprovalQueue] fetch error:', error)
      return
    }
    setPending((data ?? []) as unknown as PendingCompletion[])
  }, [supabase])

  // ── Bootstrap: get profile → household_id → fetch queue ──
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('household_id')
        .eq('id', user.id)
        .single()

      if (!profile?.household_id) return

      setHouseholdId(profile.household_id)
      await fetchPending(profile.household_id)
      setLoading(false)
    }
    init()
  }, [supabase, fetchPending])

  // ── Realtime subscription ──
  useEffect(() => {
    if (!householdId) return

    const channel = supabase
      .channel('pending-approvals')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chore_completions',
          filter: `household_id=eq.${householdId}`,
        },
        async (payload) => {
          // Realtime INSERT payload only has raw columns — refetch with joins.
          const newId = (payload.new as { id: string }).id
          const { data } = await supabase
            .from('chore_completions')
            .select(`
              id,
              completed_at,
              player_id,
              chore_id,
              profiles!player_id ( display_name, username ),
              chores ( title, quest_flavor_text, description, xp_reward, gold_reward )
            `)
            .eq('id', newId)
            .eq('verified', false)
            .single()

          if (data) {
            setPending(prev => [...prev, data as unknown as PendingCompletion])
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [householdId, supabase])

  // ── Approve a single completion ──
  async function approve(id: string): Promise<boolean> {
    setProcessing(p => new Set(p).add(id))
    // Optimistic removal
    setPending(p => p.filter(x => x.id !== id))

    const res = await fetch('/api/chores/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completionId: id }),
    })

    if (!res.ok) {
      // Restore: refetch to get accurate state
      if (householdId) await fetchPending(householdId)
      const { error } = await res.json().catch(() => ({ error: 'Unknown error' }))
      addToast(error ?? 'Failed to approve.', 'error')
      setProcessing(p => { const next = new Set(p); next.delete(id); return next })
      return false
    }

    const { xpAwarded, goldAwarded } = await res.json()
    addToast(`Quest approved! +${xpAwarded} XP, +${goldAwarded} GP awarded.`, 'success')
    setProcessing(p => { const next = new Set(p); next.delete(id); return next })
    return true
  }

  // ── Reject a single completion ──
  async function reject(id: string) {
    setProcessing(p => new Set(p).add(id))
    setPending(p => p.filter(x => x.id !== id))

    const res = await fetch('/api/chores/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completionId: id }),
    })

    if (!res.ok) {
      if (householdId) await fetchPending(householdId)
      addToast('Failed to reject. Please try again.', 'error')
    }

    setProcessing(p => { const next = new Set(p); next.delete(id); return next })
    setRejectExpanded(r => { const next = { ...r }; delete next[id]; return next })
    setRejectReasons(r => { const next = { ...r }; delete next[id]; return next })
  }

  // ── Batch approve all ──
  async function batchApproveAll() {
    const ids = pending.map(p => p.id)
    if (ids.length === 0) return

    setBatchProgress({ current: 0, total: ids.length })
    let errors = 0

    for (let i = 0; i < ids.length; i++) {
      setBatchProgress({ current: i + 1, total: ids.length })
      const ok = await approve(ids[i])
      if (!ok) errors++
    }

    setBatchProgress(null)

    if (errors === 0) {
      addToast('All quests approved!', 'success')
    } else {
      addToast(`Done. ${errors} approval${errors > 1 ? 's' : ''} failed.`, 'error')
    }
  }

  const isBatching = batchProgress !== null

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <>
      <style suppressHydrationWarning>{`
        .aq-card {
          background: rgba(255,255,255,0.022);
          border: 1px solid rgba(201,168,76,0.12);
          border-radius: 3px;
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .aq-card.processing {
          opacity: 0.45;
          pointer-events: none;
        }
        .aq-btn {
          font-family: 'Cinzel', serif;
          font-size: 0.68rem;
          letter-spacing: 0.06em;
          border-radius: 2px;
          padding: 0.45rem 1rem;
          cursor: pointer;
          border: 1px solid;
          transition: opacity 0.15s, background 0.15s;
        }
        .aq-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .aq-btn-approve {
          background: rgba(40,160,90,0.12);
          border-color: rgba(40,160,90,0.35);
          color: rgba(80,200,130,0.9);
        }
        .aq-btn-approve:hover:not(:disabled) {
          background: rgba(40,160,90,0.22);
        }
        .aq-btn-reject {
          background: rgba(220,60,60,0.08);
          border-color: rgba(220,60,60,0.25);
          color: rgba(230,100,90,0.85);
        }
        .aq-btn-reject:hover:not(:disabled) {
          background: rgba(220,60,60,0.18);
        }
        .aq-btn-batch {
          background: rgba(201,168,76,0.08);
          border-color: rgba(201,168,76,0.25);
          color: rgba(201,168,76,0.85);
        }
        .aq-btn-batch:hover:not(:disabled) {
          background: rgba(201,168,76,0.16);
        }
        .aq-reject-input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(220,60,60,0.2);
          border-radius: 2px;
          color: rgba(200,215,255,0.7);
          font-family: 'Cinzel', serif;
          font-size: 0.7rem;
          padding: 0.4rem 0.65rem;
          outline: none;
          margin-bottom: 0.6rem;
          box-sizing: border-box;
        }
        .aq-reject-input:focus {
          border-color: rgba(220,60,60,0.45);
        }
        .aq-skeleton {
          background: linear-gradient(90deg,
            rgba(255,255,255,0.03) 25%,
            rgba(255,255,255,0.07) 50%,
            rgba(255,255,255,0.03) 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 2px;
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .aq-toast {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          pointer-events: none;
        }
        .aq-toast-item {
          font-family: 'Cinzel', serif;
          font-size: 0.72rem;
          padding: 0.65rem 1rem;
          border-radius: 3px;
          letter-spacing: 0.04em;
          animation: toast-in 0.25s ease both;
          pointer-events: none;
        }
        .aq-toast-item.success {
          background: rgba(20,80,50,0.92);
          border: 1px solid rgba(40,160,90,0.35);
          color: rgba(80,200,130,0.95);
        }
        .aq-toast-item.error {
          background: rgba(80,20,20,0.92);
          border: 1px solid rgba(220,60,60,0.35);
          color: rgba(230,100,90,0.95);
        }
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .section-rule {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
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
        .section-rule .rule-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, rgba(201,168,76,0.2), transparent);
        }
      `}</style>

      {/* ── Top bar ───────────────────────────────────────────────── */}
      <div className="dash-topbar">
        <span className="dash-page-title">⚑ Approval Queue</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {!loading && pending.length > 0 && (
            <span style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '0.48rem',
              color: 'rgba(230,110,90,0.9)',
              background: 'rgba(220,80,60,0.12)',
              border: '1px solid rgba(220,80,60,0.3)',
              borderRadius: 2,
              padding: '3px 8px',
              imageRendering: 'pixelated',
            }}>
              {pending.length} pending
            </span>
          )}
          <button
            className="aq-btn aq-btn-batch"
            disabled={loading || pending.length === 0 || isBatching}
            onClick={batchApproveAll}
          >
            {batchProgress
              ? `Approving ${batchProgress.current} of ${batchProgress.total}…`
              : 'Batch Approve All'}
          </button>
        </div>
      </div>

      <div className="dash-content">

        {/* ── Loading skeleton ───────────────────────────────────── */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.022)',
                border: '1px solid rgba(201,168,76,0.08)',
                borderRadius: 3,
                padding: '1.25rem 1.5rem',
              }}>
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div className="aq-skeleton" style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="aq-skeleton" style={{ height: 12, width: '40%', marginBottom: 8 }} />
                    <div className="aq-skeleton" style={{ height: 10, width: '25%' }} />
                  </div>
                </div>
                <div className="aq-skeleton" style={{ height: 10, width: '70%', marginBottom: 6 }} />
                <div className="aq-skeleton" style={{ height: 10, width: '55%' }} />
              </div>
            ))}
          </div>
        )}

        {/* ── Empty state ────────────────────────────────────────── */}
        {!loading && pending.length === 0 && (
          <div style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            background: 'rgba(255,255,255,0.015)',
            border: '1px dashed rgba(201,168,76,0.1)',
            borderRadius: 3,
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: 0.2 }}>⚑</div>
            <p style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '0.82rem',
              color: 'rgba(200,215,255,0.3)',
              letterSpacing: '0.06em',
            }}>
              No quests awaiting your judgment, Game Master.
            </p>
          </div>
        )}

        {/* ── Pending item list ──────────────────────────────────── */}
        {!loading && pending.length > 0 && (
          <>
            <div className="section-rule">
              <h2>Pending Quests</h2>
              <div className="rule-line" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {pending.map(item => {
                const player   = item.profiles
                const chore    = item.chores
                const username = player?.username ?? 'unknown'
                const pal      = avatarPalette(username)
                const isProcessing = processing.has(item.id)
                const rejectOpen   = rejectExpanded[item.id] ?? false

                const flavorText = chore?.quest_flavor_text
                  || chore?.description
                  || chore?.title
                  || '—'

                return (
                  <div
                    key={item.id}
                    className={`aq-card${isProcessing ? ' processing' : ''}`}
                  >
                    <div style={{ padding: '1.25rem 1.5rem' }}>

                      {/* ── Player row ── */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        marginBottom: '0.85rem',
                        flexWrap: 'wrap',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          {/* Avatar */}
                          <div style={{
                            width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                            background: pal.bg,
                            border: `2px solid ${pal.border}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <span style={{
                              fontFamily: "'Press Start 2P', monospace",
                              fontSize: 11,
                              color: pal.text,
                              imageRendering: 'pixelated',
                            }}>
                              {(player?.display_name ?? '?').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div style={{
                              fontFamily: 'Cinzel, serif',
                              fontSize: '0.88rem',
                              fontWeight: 600,
                              color: '#e8f0ff',
                            }}>
                              {player?.display_name ?? 'Unknown Player'}
                            </div>
                            <div style={{
                              fontFamily: 'Cinzel, serif',
                              fontWeight: 300,
                              fontSize: '0.65rem',
                              color: 'rgba(200,215,255,0.28)',
                            }}>
                              @{username}
                            </div>
                          </div>
                        </div>

                        {/* Submitted time */}
                        <span style={{
                          fontFamily: 'Cinzel, serif',
                          fontWeight: 300,
                          fontSize: '0.65rem',
                          color: 'rgba(200,215,255,0.3)',
                          flexShrink: 0,
                        }}>
                          {timeAgo(item.completed_at)}
                        </span>
                      </div>

                      {/* ── Chore info ── */}
                      <div style={{ marginBottom: '0.85rem' }}>
                        <div style={{
                          fontFamily: 'Cinzel, serif',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          color: 'rgba(200,215,255,0.85)',
                          marginBottom: '0.3rem',
                        }}>
                          {chore?.title ?? 'Unknown Quest'}
                        </div>
                        <div style={{
                          fontFamily: 'Cinzel, serif',
                          fontWeight: 300,
                          fontSize: '0.75rem',
                          color: 'rgba(200,215,255,0.4)',
                          fontStyle: 'italic',
                          lineHeight: 1.55,
                        }}>
                          {flavorText}
                        </div>
                      </div>

                      {/* ── Rewards ── */}
                      <div style={{
                        display: 'flex',
                        gap: '1rem',
                        marginBottom: '1rem',
                        paddingBottom: '1rem',
                        borderBottom: '1px solid rgba(201,168,76,0.06)',
                      }}>
                        <span style={{
                          fontFamily: "'Press Start 2P', monospace",
                          fontSize: '0.45rem',
                          color: 'rgba(201,168,76,0.75)',
                          imageRendering: 'pixelated',
                        }}>
                          +{chore?.xp_reward ?? 0} XP
                        </span>
                        {(chore?.gold_reward ?? 0) > 0 && (
                          <span style={{
                            fontFamily: "'Press Start 2P', monospace",
                            fontSize: '0.45rem',
                            color: 'rgba(249,200,70,0.75)',
                            imageRendering: 'pixelated',
                          }}>
                            +{chore.gold_reward} GP
                          </span>
                        )}
                      </div>

                      {/* ── Reject reason input (expands on first Reject click) ── */}
                      {rejectOpen && (
                        <input
                          className="aq-reject-input"
                          type="text"
                          placeholder="Reason for rejection (optional, not saved)"
                          value={rejectReasons[item.id] ?? ''}
                          onChange={e =>
                            setRejectReasons(r => ({ ...r, [item.id]: e.target.value }))
                          }
                          onKeyDown={e => {
                            if (e.key === 'Enter') reject(item.id)
                            if (e.key === 'Escape') {
                              setRejectExpanded(r => ({ ...r, [item.id]: false }))
                            }
                          }}
                          autoFocus
                        />
                      )}

                      {/* ── Action buttons ── */}
                      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <button
                          className="aq-btn aq-btn-approve"
                          disabled={isProcessing || isBatching}
                          onClick={() => approve(item.id)}
                        >
                          ✓ Approve
                        </button>

                        <button
                          className="aq-btn aq-btn-reject"
                          disabled={isProcessing || isBatching}
                          onClick={() => {
                            if (!rejectOpen) {
                              setRejectExpanded(r => ({ ...r, [item.id]: true }))
                            } else {
                              reject(item.id)
                            }
                          }}
                        >
                          {rejectOpen ? '✕ Confirm Reject' : '✕ Reject'}
                        </button>

                        {rejectOpen && (
                          <button
                            className="aq-btn"
                            style={{
                              background: 'transparent',
                              borderColor: 'rgba(200,215,255,0.12)',
                              color: 'rgba(200,215,255,0.35)',
                            }}
                            onClick={() => {
                              setRejectExpanded(r => ({ ...r, [item.id]: false }))
                              setRejectReasons(r => { const n = { ...r }; delete n[item.id]; return n })
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>

                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

      </div>

      {/* ── Toast notifications ──────────────────────────────────── */}
      <div className="aq-toast" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`aq-toast-item ${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>
    </>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit --skipLibCheck
```

Expected: no errors. If the Supabase join types cause issues (the `profiles!player_id` and `chores` selects return `Json` or complex types), cast them as shown in the code with `as unknown as PendingCompletion[]`. The runtime behaviour is correct even if TypeScript's inferred type is wider.

- [ ] **Step 3: Lint**

```bash
npm run lint -- --max-warnings 0
```

Expected: no lint errors.

- [ ] **Step 4: Smoke-test manually**

Start the dev server:
```bash
npm run dev
```

1. Log in as a GM (parent account).
2. Navigate to `/dashboard` — confirm the overview page loads.
3. Navigate to `/dashboard/approvals` — confirm the loading skeleton appears then resolves to the empty state if no pending completions exist.
4. In a separate session, log in as a player and submit a chore completion (mark a chore complete from the player side — or insert directly in Supabase Studio: `INSERT INTO chore_completions (household_id, chore_id, player_id) VALUES (...)`).
5. Confirm the new item appears in the GM's queue without page refresh (Realtime working).
6. Click Approve — confirm the card disappears, toast appears, and the player's XP/gold increments (check Supabase Studio → profiles table).
7. Submit another completion. Click Reject — confirm the reason field expands, Confirm Reject button appears, Cancel works, Confirm Reject removes the card.
8. Submit two more completions. Click "Batch Approve All" — confirm sequential progress display and all cards cleared.
9. Navigate to `/dashboard` — confirm the badge count reflects the current state and clicking it routes to `/dashboard/approvals`.

- [ ] **Step 5: Full type-check and build**

```bash
npx tsc --noEmit --skipLibCheck && npm run build
```

Expected: clean compile and successful build.

- [ ] **Step 6: Commit**

```bash
git add src/app/dashboard/approvals/page.tsx
git commit -m "feat: add /dashboard/approvals page with Realtime approval queue"
```

---

## Final Commit

- [ ] **Verify all files are committed**

```bash
git status
```

Expected: clean working tree.

- [ ] **Final build check**

```bash
npm run build
```

Expected: successful production build with no errors.
