# CLAUDE.md — Quest Forge: The Emberlight Chronicles

## Project Overview
A multi-tenant fantasy RPG chore-tracking and educational app. Parents sign up, create a household, and add their children as players. Completing real-world chores and age-appropriate educational challenges earns XP, advances a persistent narrative, and unlocks rewards from a loot store. The story progresses weekly with new bosses and story arcs. Cooperative boss battles encourage household members to work together.

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (mobile-first responsive design)
- **Database:** Supabase (PostgreSQL + Auth + Row-Level Security)
- **AI Engine:** Google Gemini Flash API (story generation, edu-challenge generation, quest flavor text)
  - Model: `gemini-2.0-flash` (free tier: 1,500 requests/day)
  - SDK: `@google/generative-ai` npm package
- **State Management:** React Context + Supabase Realtime subscriptions
- **Deployment:** Vercel (free tier for hobby, Pro for production)
- **CI/CD:** GitHub Actions (lint, type-check, build on PR)
- **Art:** Pixel art — Liberated Pixel Cup (LPC) sprites for characters, open-source asset packs for UI/items/bosses
- **Character System:** Layered PNG sprite compositing (LPC Universal Sprite Sheet standard)

## Architecture

### User Roles & Multi-Tenancy
1. **Game Master (Parent)** — Creates a household. Full admin within their household only. Creates chores, prizes, story triggers. Views all player data for their kids.
2. **Player (Child)** — Account created by their parent. Belongs to one household. Views their quests, completes tasks, plays edu-games, reads story, shops loot store.

Every piece of data is scoped to a `household_id`. Row-Level Security ensures complete isolation between families.

### Authentication Flow
1. **Parent signs up:** Email/password via Supabase Auth → automatically creates a `household` and a `profile` with `role: 'gm'`
2. **Parent creates child accounts:** From the GM dashboard, parent enters child's display name, username, and password → creates a Supabase Auth user → creates a `profile` with `role: 'player'` linked to the same `household_id`
3. **Child logs in:** Username/password (no email required for kids) → redirected to `/play`
4. **Parent logs in:** Email/password → redirected to `/dashboard`

**Critical:** Children's accounts use username-based login (mapped to a generated email like `username@household-id.questforge.local` internally for Supabase Auth compatibility). Kids should NEVER need to provide a real email.

### Database Schema (Supabase/PostgreSQL)

```
households
  id (uuid, PK)
  name (text) — e.g., "The Smith Family"
  created_by (uuid, FK to auth.users)
  created_at (timestamptz)
  settings (jsonb, default '{}') — household-level preferences

profiles
  id (uuid, PK, FK to auth.users)
  household_id (uuid, FK to households) — REQUIRED, scopes all data
  display_name (text)
  username (text, unique) — used for child login
  role ('gm' | 'player')
  age (int, nullable) — used for edu-game tier selection
  avatar_config (jsonb) — LPC sprite layer selections (see Avatar System below)
  avatar_class (text) — chosen narrative class
  xp_total (int, default 0)
  xp_available (int, default 0)
  level (int, default 1)
  gold (int, default 0)
  story_chapter (int, default 1)
  created_at (timestamptz)

chores
  id (uuid, PK)
  household_id (uuid, FK to households) — REQUIRED
  title (text)
  description (text)
  xp_reward (int)
  gold_reward (int, default 0)
  assigned_to (uuid, FK to profiles, nullable) — NULL means all players in household
  recurrence ('once' | 'daily' | 'weekly')
  difficulty ('easy' | 'medium' | 'hard' | 'epic')
  quest_flavor_text (text) — narrative wrapper, AI-generated if blank
  is_active (boolean, default true)
  created_by (uuid, FK to profiles)
  created_at (timestamptz)

chore_completions
  id (uuid, PK)
  household_id (uuid, FK to households)
  chore_id (uuid, FK to chores)
  player_id (uuid, FK to profiles)
  completed_at (timestamptz)
  verified (boolean, default false) — GM must approve
  verified_at (timestamptz, nullable)
  xp_awarded (int)
  gold_awarded (int)

edu_challenges
  id (uuid, PK)
  title (text)
  subject ('math' | 'reading' | 'science' | 'history' | 'vocabulary' | 'logic')
  age_tier ('junior' | 'senior') — junior=ages 6-10, senior=ages 11-16
  difficulty (int, 1-5)
  xp_reward (int)
  challenge_type ('quiz' | 'puzzle' | 'word_game' | 'math_drill' | 'ai_generated')
  content (jsonb) — question/answer data
  is_active (boolean, default true)
  — NOTE: edu_challenges are GLOBAL, not household-scoped (shared content library)

edu_completions
  id (uuid, PK)
  household_id (uuid, FK to households)
  challenge_id (uuid, FK to edu_challenges)
  player_id (uuid, FK to profiles)
  score (int)
  completed_at (timestamptz)
  xp_awarded (int)

rewards
  id (uuid, PK)
  household_id (uuid, FK to households) — each family has their own loot store
  title (text)
  description (text)
  cost_gold (int, default 0)
  cost_xp (int, default 0)
  category (loot_category) — 'real_reward' | 'cosmetic' | 'power_up' | 'story_unlock'
  sprite_icon (text, nullable) — reference to pixel art icon
  is_available (boolean, default true)
  created_by (uuid, FK to profiles, nullable)
  icon_type (text)
  reward_type (reward_type)
  metadata (jsonb, default '{}')
  created_at (timestamptz)
  — Replaces the legacy loot_store_items table (data migrated in migration 023)

redemptions
  id (uuid, PK)
  household_id (uuid, FK to households)
  player_id (uuid, FK to profiles)
  reward_id (uuid, FK to rewards)
  status (redemption_status) — 'pending' | 'redeemed' | 'cancelled'
  gold_cost_paid (int, nullable) — historical price at time of purchase
  xp_cost_paid (int, nullable) — historical price at time of purchase
  created_at (timestamptz)
  approved_at (timestamptz, nullable)
  — Replaces the legacy purchases table (data migrated in migration 023)

story_chapters
  id (uuid, PK)
  household_id (uuid, FK to households) — stories are per-household (personalized)
  week_number (int)
  chapter_number (int)
  title (text)
  narrative_text (text)
  boss_name (text, nullable)
  boss_description (text, nullable)
  boss_hp (int, default 100)
  boss_current_hp (int, default 100)
  boss_sprite_config (jsonb, nullable) — procedural boss sprite data
  xp_threshold_to_unlock (int)
  is_unlocked (boolean, default false)
  rewards_claimed (boolean, default false)

story_progress
  id (uuid, PK)
  household_id (uuid, FK to households)
  player_id (uuid, FK to profiles)
  chapter_id (uuid, FK to story_chapters)
  contribution_xp (int, default 0)
  unlocked_at (timestamptz, nullable)

inventory
  id (uuid, PK)
  household_id (uuid, FK to households)
  player_id (uuid, FK to profiles)
  item_name (text)
  item_type ('weapon' | 'armor' | 'accessory' | 'consumable' | 'cosmetic')
  description (text)
  sprite_layer (jsonb, nullable) — LPC layer override for equipment display
  equipped (boolean, default false)
  acquired_at (timestamptz)

api_usage
  id (uuid, PK)
  date (date) — the calendar day
  request_count (int, default 0)
  last_updated (timestamptz)
  — Single row per day, incremented on each Gemini call

lore_milestones
  id (uuid, PK)
  player_id (uuid, FK to profiles)
  chapter_id (uuid, FK to story_chapters)
  text (text)
  created_at (timestamptz)
  — Added in migration 024 for GM-bestowed narrative milestones
```

### Row-Level Security Pattern
EVERY table with `household_id` uses this RLS pattern:

```sql
-- All users can only see data from their own household
CREATE POLICY "household_isolation" ON [table_name]
  FOR ALL
  USING (
    household_id = (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Only GMs can write within their household
CREATE POLICY "gm_write" ON [table_name]
  FOR INSERT, UPDATE, DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'gm'
      AND household_id = [table_name].household_id
    )
  );
```

Exceptions:
- `edu_challenges` — globally readable (shared content), only writable by system/seed
- `chore_completions` — players can INSERT (mark complete), only GMs can UPDATE (verify)
- `redemptions` — players can INSERT (buy rewards via purchase_reward RPC)
- `edu_completions` — players can INSERT (submit scores)

---

## Gemini Flash API Integration

### Setup
```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
```

### Usage Points
1. **Story Generation** (`/api/story/generate`) — GM triggers weekly chapter. ~1 call/household/week.
2. **Edu-Challenge Generation** (`/api/edu/generate`) — Fresh questions on demand. Capped 20/player/day.
3. **Quest Flavor Text** (`/api/chores/flavor`) — Wraps chores in fantasy language. ~1 call per chore creation.
4. **Boss Description Enhancement** — Expands boss template for weekly narrative.

### Rate Limit Strategy (1,500 free req/day)
- Track daily usage in `api_usage` table (single row per day, atomically incremented)
- Before every Gemini call: check counter. If >= 1,400 (safety margin): serve from cache/fallback
- Cache ALL generated content in the database. Never regenerate existing content.
- Edu-challenges: once generated, store in `edu_challenges` table for reuse across all households
- Story chapters: stored per-household in `story_chapters`
- Flavor text: stored on the `chores` row itself

### Fallback Content
Maintain pre-written banks of:
- 200+ edu-challenges per subject per tier (seeded in DB)
- 50+ quest flavor text templates (stored in code as a map)
- Generic boss descriptions (in bosses.json)
The app must NEVER break because the AI is unavailable. AI enhances — it is not required.

---

## Pixel Art System

### Art Sources (All Free/Open-Source)

**Characters — Liberated Pixel Cup (LPC)**
- Source: https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles
- License: CC-BY-SA 3.0 / GPL 3.0 (dual-licensed)
- Provides: Modular character sprite sheets — base bodies, hair (dozens of styles/colors), clothing, armor, weapons, accessories. All designed to layer perfectly.
- Extensions: https://lpc.opengameart.org/ — community additions with hundreds of extra parts

**UI / Icons / Items**
- Kenney.nl (https://kenney.nl/assets) — CC0 (public domain)
- Key packs: "Pixel UI Pack," "RPG Item Pack," "Game Icons," "Emote Pack"

**Tilesets / Backgrounds**
- LPC tilesets for environment art
- Kenney RPG packs for supplementary tiles

**Bosses / Monsters**
- OpenGameArt.org: "Creatures" by Stealthix, "Monster Pack" by Calciumtrice (CC-BY 3.0)
- Search terms: "pixel boss," "pixel monster," "RPG enemy sprites," "LPC monsters"
- Supplemented by programmatic palette swaps + CSS particle effects

### Avatar System (LPC Paper-Doll)

Character avatars are composed of layered PNG sprite sheets stacked in order, rendered on an HTML5 Canvas.

**Layer Stack (bottom to top):**
```
1. Body (skin tone + body type)
2. Eyes
3. Hair (rear layer — long hair behind body)
4. Pants / Legs
5. Shirt / Torso armor
6. Feet / Boots
7. Hands / Gloves
8. Belt / Waist
9. Cape / Back accessory
10. Head / Helmet
11. Hair (front layer)
12. Weapon (held item)
13. Shield (off-hand)
```

**avatar_config JSON:**
```json
{
  "body": { "id": "body_light", "color": null },
  "eyes": { "id": "eyes_blue" },
  "hair": { "id": "hair_longcurly", "color": "#8B4513" },
  "pants": { "id": "pants_leather", "color": "#654321" },
  "shirt": { "id": "shirt_chainmail", "color": null },
  "boots": { "id": "boots_iron", "color": null },
  "cape": { "id": null },
  "helmet": { "id": null },
  "weapon": { "id": "weapon_longsword" },
  "shield": { "id": null }
}
```

**Implementation:**
- Store all LPC sprite sheets in `/public/sprites/` organized by category
- Canvas component composites layers in real-time
- Avatar preview: render idle front-facing frame only
- Celebrations/battles: animate walk/attack cycle
- Color tinting: Canvas `globalCompositeOperation` for recoloring hair/clothing
- ALWAYS use `image-rendering: pixelated` on Canvas elements and all sprite images

**Character Creator Flow:**
1. First login → redirect to `/play/create-character`
2. Choose narrative class (Blazewarden, Lorescribe, etc.)
3. Customize appearance: skin tone, hair style/color, eye color, starter outfit
4. Save `avatar_config` to profile → redirect to `/play`

### Boss Sprite Strategy
1. Source 15-20 base monster sprites from OpenGameArt LPC-compatible packs
2. Palette-swap programmatically via Canvas `getImageData` + color mapping
3. Display at 2x-4x normal scale
4. Layer CSS particle effects: ember particles, shadow tendrils, glowing eyes
5. Decorative frame SVG around sprite (changes by difficulty tier)
6. Result: 15 bases × 4 palettes × particle combos = effectively unlimited variety

**boss_sprite_config JSON:**
```json
{
  "base_sprite": "monster_treant",
  "palette": "hollow_dark",
  "scale": 3,
  "particles": ["ember_float", "shadow_tendril"],
  "frame": "frame_epic",
  "glow_color": "#4a0080"
}
```

---

## File Structure

```
quest-forge/
├── CLAUDE.md
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── .env.local
├── .github/
│   └── workflows/
│       └── ci.yml              # Lint, type-check, build
├── supabase/
│   ├── migrations/
│   └── seed.sql
├── public/
│   ├── sprites/
│   │   ├── bodies/
│   │   ├── hair/
│   │   ├── clothing/
│   │   ├── weapons/
│   │   ├── accessories/
│   │   ├── bosses/
│   │   ├── icons/
│   │   ├── tiles/
│   │   └── ui/
│   └── audio/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Landing / marketing
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx     # Parent registration
│   │   ├── dashboard/          # GM (parent)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── chores/page.tsx
│   │   │   ├── players/page.tsx    # Create/manage child accounts
│   │   │   ├── loot/page.tsx
│   │   │   ├── story/page.tsx
│   │   │   ├── progress/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── play/               # Player (child)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── create-character/page.tsx
│   │   │   ├── quests/page.tsx
│   │   │   ├── academy/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [game]/page.tsx
│   │   │   ├── story/page.tsx
│   │   │   ├── boss/page.tsx
│   │   │   ├── loot/page.tsx
│   │   │   └── profile/page.tsx
│   │   └── api/
│   │       ├── auth/create-child/route.ts
│   │       ├── story/generate/route.ts
│   │       ├── edu/generate/route.ts
│   │       └── chores/flavor/route.ts
│   ├── components/
│   │   ├── ui/
│   │   ├── auth/
│   │   ├── avatar/
│   │   │   ├── SpriteCanvas.tsx
│   │   │   ├── CharacterCreator.tsx
│   │   │   ├── AvatarPreview.tsx
│   │   │   └── SpriteAnimator.tsx
│   │   ├── boss/
│   │   │   ├── BossSprite.tsx
│   │   │   ├── BossHPBar.tsx
│   │   │   └── BossDefeat.tsx
│   │   ├── dashboard/
│   │   ├── player/
│   │   ├── games/
│   │   │   ├── MathArena.tsx
│   │   │   ├── WordForge.tsx
│   │   │   ├── ScienceLabyrinth.tsx
│   │   │   ├── HistoryScroll.tsx
│   │   │   ├── VocabDuel.tsx
│   │   │   └── LogicGate.tsx
│   │   └── story/
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   ├── admin.ts        # Service role for child account creation
│   │   │   └── middleware.ts
│   │   ├── gemini/
│   │   │   ├── client.ts
│   │   │   ├── story.ts
│   │   │   ├── edu.ts
│   │   │   ├── flavor.ts
│   │   │   └── rate-limiter.ts
│   │   ├── sprites/
│   │   │   ├── compositor.ts
│   │   │   ├── palette.ts
│   │   │   ├── manifest.ts
│   │   │   └── particles.ts
│   │   ├── xp.ts
│   │   ├── boss.ts
│   │   └── constants.ts
│   ├── hooks/
│   │   ├── usePlayer.ts
│   │   ├── useHousehold.ts
│   │   ├── useChores.ts
│   │   ├── useBoss.ts
│   │   ├── useStory.ts
│   │   └── useAvatar.ts
│   ├── types/index.ts
│   └── lore/
│       ├── world.json
│       ├── bosses.json
│       ├── classes.json
│       └── chapters.json
├── docs/
│   ├── PROJECT_PLAN.md
│   ├── LORE_CODEX.md
│   ├── GAME_DESIGN_DOC.md
│   └── ART_PIPELINE.md
```

---

## Key Mechanics

### XP & Leveling
- Level N requires `50 × N × (N + 1) / 2` total XP
- Dual-tracked: `xp_total` (lifetime, for leveling) and `xp_available` (spendable)
- Spending in store reduces `xp_available` but NOT `xp_total`

### Boss Battles (Weekly, Cooperative)
- Each week has a boss with HP pool that scales to household size
- **HP Scaling:** `actual_hp = base_hp × (0.5 + (0.5 × player_count))` — keeps per-player effort consistent whether a household has 1 kid or 5
- Every approved chore and completed edu-challenge deals "damage" equal to XP earned
- ALL players in the household contribute to the same boss HP pool
- Boss defeated = story chapter unlocks + bonus rewards
- Undefeated bosses carry over to next week with remaining HP

### Multi-Tenant Story Engine
- Stories are per-household (personalized to each family's players)
- Gemini generates chapters referencing each family's player names, classes, and accomplishments
- Story language adapts to player count: solo heroes get "lone Emberbearer" framing, groups get team dynamics
- NEVER assumes player gender — uses names, class titles ("the Blazewarden"), or they/them
- Pre-written scaffolds in `chapters.json` provide structure; AI fills in personalization

---

## Responsive Design Rules
- Mobile-first (min-width breakpoints)
- Tablet (young players): 48px min touch targets, large pixel art, 768px+
- Phone (older players): compact layout, swipe nav, 375px+
- Desktop (parents): full dashboard with sidebar, 1024px+
- Pixel art scales at INTEGER multiples only (2x, 3x, 4x) — use `image-rendering: pixelated`

## Code Conventions
- TypeScript strict mode
- Prefer server components; `'use client'` only when needed
- All DB queries through `lib/supabase/` — ALWAYS include `household_id` in WHERE clauses
- All Gemini calls through `lib/gemini/` with rate limiting
- Zod for form validation
- Error boundaries on every route segment
- Loading skeletons for all async content
- `image-rendering: pixelated` on ALL sprite elements globally
- Component naming: PascalCase, one component per file

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
```

## Commands
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # TypeScript compiler check
npx supabase start   # Local Supabase (Docker)
npx supabase db push # Push migrations
npm run fetch-sprites          # Download all LPC sprite assets
npm run fetch-sprites:bodies   # Download only body sprites
npm run fetch-sprites:hair     # Download only hair sprites
npm run fetch-sprites:clothing # Download only clothing sprites
npm run fetch-sprites:weapons  # Download only weapon sprites
npm run fetch-sprites:bosses   # Create boss sprite placeholders
```

## Sprite Asset Pipeline
- **Source:** [Universal LPC Spritesheet Character Generator](https://github.com/LiberatedPixelCup/Universal-LPC-Spritesheet-Character-Generator) (bodies, hair, eyes, clothing, capes, hats), [makrohn/Universal-LPC-spritesheet](https://github.com/makrohn/Universal-LPC-spritesheet) (weapons), [LPC Monsters](https://opengameart.org/content/lpc-monsters) (bosses)
- **License:** CC-BY-SA 3.0 / GPL 3.0 (dual-licensed) unless otherwise noted
- **Script:** `scripts/fetch-sprites.mjs` downloads assets and saves to `public/sprites/`
- **Attribution:** See `public/sprites/CREDITS.md`
- **Current status:** 802 real assets, 0 placeholders
  - Bodies: 11, Hair: 90, Eyes: 8, Clothing: 486, Capes: 96, Helmets: 73, Weapons: 10, Bosses: 28
- **Missing assets:** Folder-based boss sprites (dragon, demon, medusa, jinn, lizard) need manual sourcing from OpenGameArt
- **Color variant strategy:** Items with per-color PNGs (boots, shoes, capes, hats) are downloaded directly. Items with base-only sprites (shirts, armour) use compositor `hexTint` for runtime color application.

## Critical Reminders
- MULTI-TENANT: Every query MUST be scoped to `household_id`. No exceptions.
- PLAYER COUNT VARIES: Households can have 1-6+ players. NEVER hardcode assumptions about player count. Boss HP scales with player count. Story adapts to player count.
- GENDER NEUTRAL: NEVER assume player gender in story text, UI labels, or notifications. Use player names, class titles, "Emberbearer(s)", or they/them. Say "your child" not "your son/daughter" in parent-facing UI.
- Children's accounts: username-based login, no real emails. Use generated internal email for Supabase Auth.
- Gemini rate limit: check `api_usage` table BEFORE every call. Serve fallback if near limit.
- Pixel art: ALWAYS `image-rendering: pixelated`. NEVER fractional scaling.
- Boss battles are COOPERATIVE — all players in a household fight together.
- AI is an ENHANCEMENT — the app must work fully without it using cached/seeded content.
- All sprite assets must be properly attributed per their licenses (CC-BY-SA, CC-BY, CC0).
