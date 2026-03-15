# Chore Approval System — Design Spec
**Date:** 2026-03-14
**Status:** Approved

---

## Overview

Game Masters (parents) need a focused workflow to approve or reject chore completions submitted by players (children). Approved completions trigger XP/gold awarding and boss damage via existing DB triggers — no application-layer math required. New submissions appear in real time via Supabase Realtime without page refresh.

---

## Database & Trigger Context

The `handle_chore_verified` trigger on `chore_completions` fires when `verified` flips to `true`. It automatically:
- Awards `xp_awarded` and `gold_awarded` to the player's profile (`xp_total`, `xp_available`, `gold`)
- Calls `deal_boss_damage()` to reduce the active boss's HP
- Inserts a row in `story_progress` recording the contribution
- The `recalculate_level` trigger fires on `profiles.xp_total` update and handles leveling up

**Critical:** `chore_completions.xp_awarded` and `gold_awarded` default to `0`. The trigger reads these columns to know how much to award. The approval API route must populate them from the parent `chores.xp_reward` and `chores.gold_reward` values **in the same UPDATE** that sets `verified=true`. If those columns are 0 when the trigger fires, the player receives nothing.

The approve route UPDATE must be:
```sql
UPDATE chore_completions
SET verified     = true,
    verified_at  = now(),
    xp_awarded   = (SELECT xp_reward  FROM chores WHERE id = chore_completions.chore_id),
    gold_awarded = (SELECT gold_reward FROM chores WHERE id = chore_completions.chore_id)
WHERE id = :completionId
  AND household_id = :gmHouseholdId
  AND verified = false
```

Or equivalently: join to `chores` in the same statement, or fetch `xp_reward`/`gold_reward` first and pass them as values. Either is acceptable. **Do not issue two separate queries** (fetch then patch) — read-then-write without a transaction is a race condition.

---

## Rejection Strategy

**Option chosen: DELETE the row.**

When a GM rejects a completion, the `chore_completions` row is deleted. No audit trail is kept. The player can resubmit the same chore immediately. The optional reject reason field is UI-only — shown to the GM as a text input for their own reference before confirming rejection. (It is not persisted anywhere.)

The DELETE must include a `household_id` WHERE clause in addition to `id`, as defense-in-depth on top of RLS:
```sql
DELETE FROM chore_completions WHERE id = :completionId AND household_id = :gmHouseholdId
```

---

## Player Notification

Out of scope for this feature. When the player's quests page is built, it will query for recently-verified completions (`verified=true`, `verified_at > now() - interval '24 hours'`) and surface them as a "Quest Reward Received!" banner. No schema changes are needed — `xp_awarded`, `gold_awarded`, and `verified_at` are already on the `chore_completions` row. That work belongs in the player quests page feature, not here.

---

## Architecture

### New Route: `/dashboard/approvals`

A dedicated `'use client'` page. Rationale: the existing `dashboard/page.tsx` is a server component (620 lines); embedding Realtime there would force the entire overview to become a client component. A dedicated page keeps concerns isolated and gives GMs a bookmarkable URL for their primary daily action.

### Existing badge in `dashboard/page.tsx`

The overview page already has a pending-approvals badge at line 224 that links to `/dashboard/chores`. The implementation must **update the existing badge's `href`** from `/dashboard/chores` to `/dashboard/approvals`. Do not add a second badge.

### Initial Data Fetch

On mount, the approvals page fetches:
```typescript
supabase
  .from('chore_completions')
  .select(`
    id, completed_at, xp_awarded, gold_awarded, chore_id, player_id,
    profiles!player_id ( display_name, username ),
    chores ( title, quest_flavor_text, xp_reward, gold_reward )
  `)
  .eq('household_id', householdId)
  .eq('verified', false)
  .order('completed_at', { ascending: true })
```

Note: `xp_awarded` and `gold_awarded` on the completion row will be 0 at this point (they are not populated until approval). The card should display the reward values from `chores.xp_reward` and `chores.gold_reward` (what the player will receive), not from `chore_completions.xp_awarded`.

### Realtime Subscription

The approvals page subscribes to `chore_completions` INSERT events filtered to the current household. When a player submits a chore, the new pending item appears in the GM's queue immediately.

Because the Realtime INSERT payload only contains `chore_completions` columns (no joined data), the component must **refetch the full record** (including joined `profiles` and `chores`) when it receives an INSERT event. One extra query per new submission is acceptable given the low expected volume.

```typescript
channel = supabase
  .channel('pending-approvals')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'chore_completions',
    filter: `household_id=eq.${householdId}`,
  }, async (payload) => {
    // refetch the new row with joins
    const { data } = await supabase
      .from('chore_completions')
      .select('id, completed_at, profiles!player_id(display_name, username), chores(title, quest_flavor_text, xp_reward, gold_reward)')
      .eq('id', payload.new.id)
      .single()
    if (data) setPending(prev => [...prev, data])
  })
  .subscribe()
```

The subscription is torn down in the `useEffect` cleanup.

### API Routes

| Route | Method | Action |
|---|---|---|
| `/api/chores/approve` | POST | Populate `xp_awarded`/`gold_awarded` from parent chore, set `verified=true`, `verified_at=now()`. GM role required. Trigger handles XP/gold/boss. |
| `/api/chores/reject` | POST | DELETE the completion row scoped to `household_id`. GM role required. |

Both routes:
- Validate the caller is a GM (fetch profile, check `role === 'gm'`)
- Include `household_id` in all WHERE clauses (defense-in-depth on top of RLS)
- Return `{ success: true }` or `{ error: string }` with appropriate HTTP status

---

## UI Structure

```
/dashboard/approvals
  approvals/page.tsx     ('use client')
  approvals/error.tsx    (error boundary — required by CLAUDE.md)
  │
  ApprovalQueuePage
  ├── Loading skeleton   (required by CLAUDE.md for all async content)
  │
  ├── Page header
  │     "Approval Queue"  ·  badge: N pending
  │     [Batch Approve All] button  (disabled when empty or processing)
  │
  ├── Empty state (queue is empty)
  │     "No quests awaiting your judgment, Game Master."
  │
  └── Pending item list (one card per chore_completion)
        ┌────────────────────────────────────────────────┐
        │  [Avatar]  PlayerName                          │
        │  Chore Title                    submitted X ago│
        │  "Quest flavor text..."                        │
        │  Reward: +35 XP  +10 Gold  (from chores row)  │
        │                                                │
        │  [Reject reason input — appears on Reject click]│
        │  [✅ Approve]     [✗ Reject → Confirm Reject] │
        └────────────────────────────────────────────────┘
```

**Approve flow:**
1. GM clicks ✅ Approve
2. Optimistic UI: card grays out / shows spinner
3. POST `/api/chores/approve` with `{ completionId }`
4. On success: remove card from list, show brief toast "Quest approved! XP awarded."
5. On error: restore card, show error toast

**Reject flow:**
1. GM clicks ✗ Reject — reject reason text input expands below the buttons; button label changes to "Confirm Reject"
2. GM optionally types a reason (local state only, not persisted)
3. GM clicks "Confirm Reject" (or presses Enter in the reason field)
4. POST `/api/chores/reject` with `{ completionId }`
5. On success: remove card from list
6. On error: restore card, show error toast
7. Clicking anywhere other than Confirm cancels and collapses the reason input

**Batch Approve All:**
- Button at the top; disabled when queue is empty or a batch is in progress
- Loops through all pending items and calls approve **sequentially** (not parallel — keeps boss HP decrement ordering predictable and prevents interleaved progress UI)
- Shows progress counter: "Approving 3 of 7…"
- On completion: "All quests approved!"
- On partial failure: continues remaining items; final toast reports error count

---

## Files Created / Modified

| File | Change |
|---|---|
| `src/app/api/chores/approve/route.ts` | **Create** — POST handler, GM auth, UPDATE completion with xp/gold from chore |
| `src/app/api/chores/reject/route.ts` | **Create** — POST handler, GM auth, DELETE completion scoped to household |
| `src/app/dashboard/approvals/page.tsx` | **Create** — Client component, initial fetch, Realtime subscription, approve/reject/batch UI |
| `src/app/dashboard/approvals/error.tsx` | **Create** — Error boundary for the approvals route segment |
| `src/app/dashboard/page.tsx` | **Modify** — Update existing pending-approvals badge `href` (line 224) from `/dashboard/chores` to `/dashboard/approvals` |

---

## Error Handling

- Network errors on approve/reject: restore optimistic state, show toast
- Realtime disconnects: Supabase client auto-reconnects; no special handling needed
- Empty `quest_flavor_text`: fall back to chore `description`, then to chore `title`
- Batch approve partial failure: continue remaining items, report final error count

---

## Out of Scope

- Persisting reject reasons to the database (no schema change)
- Push notifications / email alerts for new completions
- Player-facing rejection history or "Quest Reward Received" banner (belongs in player quests page feature)
- Pagination of the approval queue (expected queue size is small per household)
