# Chore Approval System — Design Spec
**Date:** 2026-03-14
**Status:** Approved

---

## Overview

Game Masters (parents) need a focused workflow to approve or reject chore completions submitted by players (children). Approved completions trigger XP/gold awarding and boss damage via existing DB triggers — no application-layer math required. New submissions appear in real time via Supabase Realtime without page refresh.

---

## Database & Trigger Context

The `handle_chore_verified` trigger on `chore_completions` fires when `verified` flips to `true`. It automatically:
- Awards `xp_awarded` and `gold_awarded` to the player's profile
- Calls `deal_boss_damage()` to reduce the active boss's HP
- Inserts a row in `story_progress` recording the contribution
- The `recalculate_level` trigger fires on `profiles.xp_total` update and handles leveling up

The approval API route only needs to PATCH one column (`verified=true`). All downstream effects are handled by the database.

---

## Rejection Strategy

**Option chosen: DELETE the row.**

When a GM rejects a completion, the `chore_completions` row is deleted. No audit trail is kept. The player can resubmit the same chore immediately. The optional reject reason field is UI-only — shown to the GM as a text input for their own reference before confirming rejection. (It is not persisted anywhere.)

---

## Player Notification

No schema changes. On the player's quests page, recently-verified completions (within last 24 hours, `verified=true`) surface as a "Quest Reward Received!" banner showing XP and gold earned. The data is already present on `chore_completion` rows (`xp_awarded`, `gold_awarded`, `verified_at`). No separate notifications table is needed.

This read-only display is in scope as part of this feature — the player page will query for recently verified completions on load.

---

## Architecture

### New Route: `/dashboard/approvals`

A dedicated `'use client'` page. Rationale: the existing `dashboard/page.tsx` is a server component (620 lines); embedding Realtime there would force the entire overview to become a client component. A dedicated page keeps concerns isolated and gives GMs a bookmarkable URL for their primary daily action.

The overview page (`dashboard/page.tsx`) gains a prominent "Approval Queue" badge/link showing the pending count, linking to this new page.

### API Routes

| Route | Method | Action |
|---|---|---|
| `/api/chores/approve` | POST | Set `verified=true`, `verified_at=now()` on a completion row. GM role required. Trigger handles XP/gold/boss. |
| `/api/chores/reject` | POST | DELETE the completion row. GM role required. |

Both routes:
- Validate the caller is a GM (check `profiles.role = 'gm'`)
- Scope the query to `household_id` (defense-in-depth on top of RLS)
- Return `{ success: true }` or `{ error: string }` with appropriate HTTP status

### Realtime Subscription

The approvals page subscribes to `chore_completions` INSERT events filtered to the current household. When a player submits a chore, the new pending item appears in the GM's queue immediately without refresh.

The subscription is torn down in the component's cleanup (`useEffect` return).

---

## UI Structure

```
/dashboard/approvals
  ApprovalQueuePage  ('use client')
  │
  ├── Page header
  │     "Approval Queue"  ·  badge: N pending
  │     [Batch Approve All] button  (disabled when empty or processing)
  │
  ├── Empty state (queue is empty)
  │     Illustration + "No quests awaiting your judgment, Game Master."
  │
  └── Pending item list (one card per chore_completion)
        ┌────────────────────────────────────────────────┐
        │  [Avatar]  PlayerName                          │
        │  Chore Title                    submitted X ago│
        │  "Quest flavor text..."                        │
        │  Reward: +35 XP  +10 Gold                     │
        │                                                │
        │  [Reject reason input — collapses in]         │
        │  [✅ Approve]          [✗ Reject]             │
        └────────────────────────────────────────────────┘
```

**Approve flow:**
1. GM clicks ✅ Approve
2. Optimistic UI: card grays out / spinner
3. POST `/api/chores/approve` with `{ completionId }`
4. On success: remove card from list, show brief toast "Quest approved! XP awarded."
5. On error: restore card, show error toast

**Reject flow:**
1. GM clicks ✗ Reject — optional reject reason input expands
2. GM optionally types a reason (local state only, not persisted)
3. GM confirms (second click or pressing Enter)
4. POST `/api/chores/reject` with `{ completionId }`
5. On success: remove card from list
6. On error: restore card, show error toast

**Batch Approve All:**
- Button at the top; disabled when queue is empty or a batch is in progress
- Loops through all pending items and calls approve sequentially (not parallel — avoids race conditions on boss HP)
- Shows progress: "Approving 3 of 7…"
- On completion: "All quests approved!"

---

## Files Created / Modified

| File | Change |
|---|---|
| `src/app/api/chores/approve/route.ts` | **Create** — POST handler, GM auth, PATCH completion |
| `src/app/api/chores/reject/route.ts` | **Create** — POST handler, GM auth, DELETE completion |
| `src/app/dashboard/approvals/page.tsx` | **Create** — Full client component with Realtime |
| `src/app/dashboard/page.tsx` | **Modify** — Add prominent Approval Queue badge/link |

---

## Error Handling

- Network errors on approve/reject: restore optimistic state, show toast
- Realtime disconnects: Supabase client auto-reconnects; no special handling needed
- Empty `quest_flavor_text`: show chore description as fallback
- Batch approve partial failure: continue remaining items, report final error count

---

## Out of Scope

- Persisting reject reasons to the database (no schema change)
- Push notifications / email alerts for new completions
- Player-facing rejection history
- Pagination of the approval queue (expected queue size is small per household)
