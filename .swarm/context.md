# Context
Swarm: default
Project: Quest Forge: The Emberlight Chronicles

## Project Snapshot
- **Framework**: Next.js 14.2.35 (App Router)
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS 3.4.1
- **Database**: Supabase (PostgreSQL + Auth + RLS)
- **AI Provider**: OpenRouter (primary: google/gemma-4-26b-a4b-it:free, fallback: openrouter/free)
- **State**: Zustand (2 stores)
- **Testing**: Vitest 4.1.0 + @testing-library/react + jsdom
- **E2E**: Playwright 1.59.1
- **Source files**: 263 total (253 TS/TSX)
- **Test files**: 14

## File Structure

### App Router (42 routes)
**Auth**: /login, /signup, /forgot-password, /reset-password, /auth/callback
**GM Dashboard**: /dashboard, /dashboard/chores, /dashboard/players, /dashboard/loot, /dashboard/story, /dashboard/progress, /dashboard/quests, /dashboard/quests/new, /dashboard/approvals, /dashboard/redemptions, /dashboard/settings, /dashboard/settings/about
**Player**: /play, /play/create-character, /play/quests, /play/academy, /play/academy/[8 games], /play/story, /play/boss, /play/loot, /play/profile, /play/world
**API**: 22 API routes (auth, chores, edu, gm, loot, story, health, admin/seed-story)
**Server Actions**: auth.ts, cache.ts, save-character.ts

### Components (12 dirs, 60+ TSX files)
- **avatar/**: AvatarDisplay, AnimatedAvatar, CharacterCreator
- **boss/**: BossSprite, BossHPBar, BossDefeat
- **combat/**: Battle mechanics
- **dashboard/**: GM UI components
- **games/**: MathArena, WordForge, ScienceLabyrinth, BattleArena, QuizInterface
- **hud/**: Heads-up display elements
- **play/**: Player-facing UI
- **player/**: WorldCodex, BossArena, Player profile components
- **qf/**: GMShell, XPBar, core QF components
- **quests/**: Quest management
- **shop/**: ShopModal, loot store
- **story/**: Story rendering
- **ui/**: PixelButton, PixelModal, PixelBadge, PixelProgressBar, AudioInit + tests

### Hooks (10)
useAcademy, useAvatar, useBoss, useChoreManager, useChores, useHousehold, useLootStore, useNotifications, usePlayer, useStory

### Lib Modules
- **supabase/**: client.ts (browser + SSR stub), server.ts (cookie-based), admin.ts (service role), middleware.ts
- **ai/**: client.ts (OpenRouter), edu.ts, flavor.ts, rate-limiter.ts, story.ts, test_edu.ts
- **api/**: middleware.ts (composite), rate-limiter.ts, csrf.ts, body-limit.ts, sanitize.ts + tests
- **sprites/**: compositor.ts, manifest.ts, palette.ts, particles.ts, proceduralBosses.tsx + tests
- **story/**: seed-chapters.ts
- **xp.ts, boss.ts, audio.ts, auth-context.tsx, env.ts, constants.ts**

### Stores (2 Zustand)
- useQuestStore.ts (288 lines) — RPG state, household creation, purchases, story data
- useAudioStore.ts — BGM/SFX state

### Types
database.ts (1050 lines, auto-generated) — 15 tables, RPC functions, views

## Database Schema (15 tables)
api_usage, chore_completions, chores, edu_challenges, edu_completions, households, inventory, loot_store_items, player_inventory, profiles, purchases, quests, redemptions, rewards, story_chapters, story_progress

**Extra tables beyond CLAUDE.md spec**: quests, redemptions, player_inventory, rewards
**RPC functions**: deal_boss_damage, deduct_gold, get_api_usage_today, get_my_household_id, increment_api_usage, is_gm, purchase_reward

## Critical Architecture

### Auth Flow
- Middleware (middleware.ts) gates /dashboard and /play
- Username-based child login → generated email @household-id.questforge.local
- Service role key in admin.ts for child account creation (NEVER client-side)

### RLS Pattern
- All tables with household_id have household_isolation policy
- GM write policy on most tables
- Exceptions: edu_challenges (global), chore_completions (players can INSERT), purchases (players can INSERT)

### AI Integration
- OpenRouter with model fallback strategy
- stripThinking() handles 6+ thinking tag variants across models
- Rate limiter checks api_usage table before calls
- Fallback content banks for when AI is unavailable

### Pixel Art System
- 802 real sprite assets (bodies:11, hair:90, eyes:8, clothing:486, capes:96, helmets:73, weapons:10, bosses:28)
- Canvas-based compositing with layer stacking
- Integer scaling only (2x, 3x, 4x) with image-rendering:pixelated

## Complexity Hotspots (Top 10)
| File | Churn | Complexity | Risk | Rec |
|------|-------|------------|------|-----|
| MathArena.tsx | 28 | 49 | 157 | full_gates |
| WordForge.tsx | 24 | 23 | 109 | full_gates |
| play/page.tsx | 20 | 35 | 103 | full_gates |
| ScienceLabyrinth.tsx | 25 | 17 | 102 | full_gates |
| audio.ts | 16 | 80 | 101 | full_gates |
| dashboard/page.tsx | 16 | 58 | 94 | full_gates |
| WorldCodex.tsx | 18 | 36 | 93 | full_gates |
| useAcademy.ts | 15 | 56 | 87 | full_gates |
| compositor.ts | 13 | 99 | 86 | full_gates |
| ai/client.ts | 22 | 15 | 86 | full_gates |

## TODO/WARN Scan (43 entries)
- 0 HIGH priority
- 34 MEDIUM (mostly AI fallback warnings, audio init, sprite load failures)
- 9 LOW (notes about styling, comments)
- No critical blockers

## Hidden Couplings (Dark Matter)
- MathArena ↔ WordForge ↔ ScienceLabyrinth (high co-change, no imports) — shared game architecture
- ShopModal ↔ shop.ts ↔ database.ts ↔ useQuestStore.ts — shared type concerns
- AvatarPreview ↔ manifest.ts, useAvatar ↔ compositor.ts — expected sprite coupling
- BossSprite ↔ proceduralBosses.tsx ↔ palette.ts — expected boss coupling

## Test Coverage (14 files)
Unit tests: pixelBadge, pixelProgressBar, xp, palette, particles, purchase, rate-limiter
API tests: sanitize, body-limit, middleware, rate-limiter, csrf
Component tests: PixelButton, XPBar

**Gaps**: No tests for hooks, stores, AI modules, sprite compositor, most components

## Architecture Deviations from CLAUDE.md
1. **State management**: Zustand (not React Context)
2. **AI provider**: OpenRouter (not Gemini Flash)
3. **Extra tables**: quests, redemptions, player_inventory, rewards
4. **edu subjects**: Expanded to include general_knowledge, life_skills
5. **Boss system**: Integrated into quests table (is_boss flag) vs separate table
6. **Component naming**: Some use "qf/" prefix (QuestForge internal components)

## Security-Sensitive Areas
- src/lib/supabase/admin.ts — Service role key, server-only
- src/app/api/auth/create-child/route.ts — Child account creation (238 lines)
- src/middleware.ts — Auth gate
- src/lib/api/csrf.ts, rate-limiter.ts, sanitize.ts — API security layer
- All API routes — need household_id validation

## Build & Dev Commands
- npm run dev — Start dev server
- npm run build — Production build
- npm run lint — ESLint
- npm run type-check — tsc --noEmit
- npm test — vitest run
- npm run fetch-sprites — Download LPC assets

## Decisions
- [PENDING] None recorded yet

## SME Cache
- [PENDING] None recorded yet

## Patterns Identified
- App Router with explicit 'use client' boundaries
- Zustand for client state, hooks for Supabase queries + Realtime
- Composite API middleware pattern (withApiMiddleware)
- Household-scoped queries everywhere
- Canvas-based sprite compositing
- AI with fallback chain (primary → fallback → DB/cache)
