# Quest Forge: The Emberlight Chronicles

A fantasy RPG adventure where real-world chores become heroic quests, and educational challenges unlock epic story chapters. Designed for families with children ages 6-16.

**Parents** act as Game Masters — creating chores, managing rewards, and guiding the household's epic adventure. **Kids** are players — completing quests, battling bosses, and earning treasure.

```
Routes:      50+ pages and API endpoints
Tests:       144 unit/integration tests + E2E Playwright tests
Story Arcs:  3 arcs spanning 12 weeks (17 chapter scaffolds)
Sprite Assets: 800+ LPC-compatible pixel art assets
```

---

## Table of Contents

- [For Parents (Game Master Dashboard)](#for-parents-game-master-dashboard)
- [For Kids (Player Experience)](#for-kids-player-experience)
- [Game Mechanics](#game-mechanics)
- [Automated Story Engine](#automated-story-engine)
- [Pixel Art & Design](#pixel-art--design)
- [Security & Reliability](#security--reliability)
- [Accessibility](#accessibility)
- [Technical Stack](#technical-stack)
- [Project Structure](#project-structure)
- [Development Setup](#development-setup)
- [Testing](#testing)
- [Deployment](#deployment)

---

## For Parents (Game Master Dashboard)

### Household Management
- Create your family household and invite players
- Add unlimited child accounts with simple username/password login (no email required for kids)
- View each player's progress, XP, gold, level, and completed quests
- **Progress Reports** (`/dashboard/progress`): Weekly XP charts, player level-up timelines, boss contribution breakdowns across the household

### Quest Creation
- Create chores with custom titles, descriptions, and rewards
- Assign quests to specific children or the whole household
- Set recurrence: one-time, daily, weekly, or monthly tasks
- Choose difficulty levels: Easy, Medium, Hard, or Epic (higher difficulty = higher rewards)
- AI-enhanced flavor text automatically transforms "clean your room" into an epic heroic task

### Loot Store
- Create custom rewards with gold and XP costs
- Categorize rewards: real-world prizes, cosmetics, power-ups, and story unlocks
- Track redemption status for physical rewards
- Set your own prize values — you're in control of what rewards cost

### Boss Battles & Story
- Launch weekly boss battles that scale to your household size
- All players fight the same boss — encouraging family cooperation
- Bosses carry over week-to-week until defeated
- **Automated story engine**: One click advances the story — AI generates cinematic narratives, introduces bosses, and writes victory scenes

### Progress Tracking
- See detailed completion history for each player
- Verify quest completions before awarding rewards
- Monitor educational game scores and progress

---

## For Kids (Player Experience)

### Character Creation
- Choose your hero class: Blazewarden, Lorescribe, Thornwood, Stormcaller, or Shadowveil
- Customize your pixel art avatar with body, hair, eyes, and clothing options
- View your character stats: XP, gold, level, and equipped items

### Quest Board
- Browse your assigned quests with heroic flavor text
- Mark tasks complete and await parent verification
- Track which quests are done, pending, or verified
- See XP and gold rewards for each task

### The Academy (Educational Games)

| Game | Subject | Format |
|------|---------|--------|
| **Math Arena** | Math | Timed challenges (add, subtract, multiply, divide) |
| **Word Forge** | Vocabulary | Word-definition matching with heat-based feedback |
| **Science Labyrinth** | Science | Dungeon-crawler with science questions |
| **History Scroll** | Reading | Scroll-themed reading comprehension |
| **Vocab Duel** | Vocabulary | Turn-based vocabulary battles |
| **Logic Gate** | Logic | Puzzle challenges with circuits and switches |
| **General Knowledge** | Trivia | Quiz-style general knowledge challenges |
| **Life Skills** | Life Skills | Practical knowledge scenarios |

Each game features AI-generated questions, animated battle sequences, and XP/gold rewards.

### Boss Battles
- Fight weekly bosses with your entire household
- Every completed quest and educational challenge deals damage
- Watch the boss HP bar drop as your family works together
- **BossDefeat cinematic**: Confetti celebration, narrative reveal, and reward summary when a boss falls

### Story Mode (Chronicle Hall)
- Read your family's personalized adventure chapters
- Characters are referenced by name, class title, and accomplishments
- Typewriter-style narrative reveal with narrator portraits
- Heroic Deeds section showing each player's contributions per week

### Loot Store
- Spend gold and XP on rewards
- Browse real-world prizes, cosmetics, and power-ups
- Track purchased items and redemption status

### Profile & Inventory
- View your stats, level, and total XP earned
- See your collected items and equipment
- Track your story progress and unlocked chapters

---

## Game Mechanics

### XP & Leveling
- Complete quests and educational challenges to earn XP
- Level formula: `50 × N × (N + 1) / 2` total XP for level N
- Level 1 = 0 XP, Level 2 = 100 XP, Level 3 = 250 XP, Level 10 = 2,700 XP, Level 20 = 10,450 XP
- Dual tracking: `xp_total` (for leveling) and `xp_available` (spendable in store)
- Embershard states evolve as you level: Dim Ember → Steady Flame → Bright Blaze → Radiant Core → Emberstorm → Living Light → Hearthfire

### Gold
- Earned alongside XP from completed tasks
- Used to purchase items in the loot store
- Atomic RPC transactions prevent race conditions on purchases

### Cooperative Combat
- Boss HP scales with household size: `actual_hp = base_hp × (0.5 + (0.5 × player_count))`
- Solo players and large families both have engaging battles
- All players contribute to the same boss — teamwork matters
- Undefeated bosses persist week-to-week with remaining HP

---

## Automated Story Engine

The story engine removes the burden of lore-writing from parents. Everything is automated:

### Week Advancement
1. GM clicks "Advance Week" — the system finds the next locked chapter
2. AI generates an atmospheric opening narrative referencing the current arc and region
3. The chapter unlocks for all players simultaneously
4. Players read the narrative in the Chronicle Hall

### Victory Narratives
- When a boss reaches 0 HP, the victory narrative API auto-generates
- AI writes 3-4 cinematic paragraphs celebrating each hero by name and class
- Narrative is persisted and displayed in the Chronicle Hall

### Chapter Scaffolds
- **17 pre-written scaffolds** for 3 story arcs (12 weeks)
- Arc 1: The Ashwood Awakening (weeks 1-4) — Thornmaw, Whispering Swarm, Grulk, Cindra
- Arc 2: The Shattered Coast (weeks 5-8) — Captain Murk, Abyssal Maw, Siren, Leviathan's Shadow
- Arc 3: The Ironspine Depths (weeks 9-12) — Rustvein, Echoing Hollow, Slag, Veinworm
- Each scaffold includes `must_include`, `tone`, and `player_count_notes` (single/pair/group)
- 52 weeks of boss data pre-configured in `bosses.json`

### Regeneration
- If the AI output is weak, a "Regenerate" button on the Story Management page requests a fresh generation
- Rate-limited to prevent API abuse

---

## Pixel Art & Design

### Character Avatars (LPC Paper-Doll)
- Built from layered LPC Universal Sprite Sheet sprites
- 13 composited layers: body, eyes, hair (rear), pants, shirt, boots, hands, belt, cape, helmet, hair (front), weapon, shield
- Canvas-based compositing at runtime with `image-rendering: pixelated`
- Animated sprites with idle, walk, and attack frame cycles (600+ lines in `AnimatedAvatar`)
- Color tinting via Canvas `globalCompositeOperation`

### Asset Pipeline
- 800+ real sprite assets (bodies, hair, eyes, clothing, capes, helmets, weapons, bosses)
- Sources: Liberated Pixel Cup (CC-BY-SA 3.0 / GPL 3.0), Kenney.nl (CC0)
- Fetch script: `npm run fetch-sprites`

### Boss Visuals
- 28 base monster sprites with programmatic palette swapping
- CSS particle effects (ember float, shadow tendril, dark aura)
- Decorative frames per difficulty tier
- Configurable via `boss_sprite_config` JSON

---

## Security & Reliability

### API Protection
- **Rate limiting**: Per-IP sliding window on auth, chores, loot, and story endpoints
- **CSRF protection**: Origin/Referer header validation on all state-mutating routes
- **Body size limits**: 100KB default, 10KB for AI generation routes
- **Text sanitization**: HTML tag stripping, event handler removal, javascript: URL filtering

### Runtime Safety
- **Zod env validation**: Fails fast with clear messages on missing env vars at startup
- **Error boundaries**: Themed error pages (`error.tsx`) on all 19 route segments
- **Loading states**: Skeleton loading screens (`loading.tsx`) on all 17 major routes
- **Health endpoint**: `/api/health` verifies Supabase connectivity and AI provider config

### Graceful Degradation
- AI is an enhancement, not a requirement — 200+ seeded educational challenges
- 50+ pre-written quest flavor text templates
- Fallback boss descriptions and defeat narratives
- Pre-wired `canMakeRequest()` checks before every AI call with 1,400/1,500 daily safety margin

---

## Accessibility

- **Zoom support**: `userScalable: false` removed — kids and parents can pinch-zoom
- **Focus management**: Focus trap in modals (`PixelModal`, `LevelUpModal`, `BossDefeat`), auto-focus on open, return focus on close
- **ARIA labels**: `role="meter"` on XP/HP bars with `aria-valuenow/min/max`, `role="dialog"` on modals with `aria-modal`, `role="checkbox"` on chore indicators with `aria-checked`
- **Keyboard navigation**: Visible `:focus-visible` outlines on all interactive elements (gold ring on `PixelButton`)
- **Screen readers**: Descriptive `aria-label` on stat cards, boss HP displays, and progress bars

All checks pass WCAG guidelines for keyboard navigation and screen reader compatibility.

---

## Technical Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router, RSC, Server Actions) |
| **Language** | TypeScript (strict mode) |
| **Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL + Row-Level Security) |
| **AI Provider** | [OpenRouter](https://openrouter.ai/) (primary: `google/gemma-4-26b-a4b-it:free`, fallback: `openrouter/free`) |
| **Styling** | Tailwind CSS + CSS variables (dark fantasy theme) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Audio** | [Howler.js](https://howlerjs.com/) |
| **Validation** | [Zod](https://zod.dev/) |
| **State** | React Context + Zustand |
| **Icons** | Sonner toast notifications |
| **Testing** | Vitest (unit/integration), Playwright (E2E) |
| **Sprites** | Liberated Pixel Cup, Kenney.nl |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages & API
│   ├── api/                # 20 API route files (auth, chores, story, edu, loot)
│   ├── dashboard/          # 11 GM-facing pages
│   ├── play/               # 11 player-facing pages
│   └── login|signup|...    # Auth pages
├── components/
│   ├── avatar/             # SpriteCanvas, AnimatedAvatar, AvatarPreview
│   ├── boss/               # BossSprite, BossHPBar, BossDefeat
│   ├── dashboard/          # StoryDashboard, ChoreCreator, etc.
│   ├── games/              # MathArena, QuizInterface, BattleArena, etc.
│   ├── play/               # LevelUpModal, ZoneManager, etc.
│   ├── story/              # ChronicleHall, StoryPlayer
│   └── ui/                 # PixelButton, PixelModal, ErrorFallback, LoadingFallback
├── hooks/                  # useStory, useHousehold, useBoss, useChores, etc.
├── lib/
│   ├── ai/                 # OpenRouter client, story/edu/flavor generators
│   ├── api/                # Rate limiter, CSRF, body-limit, sanitize, middleware
│   ├── supabase/           # Client, server, admin, middleware
│   └── sprites/            # Compositor, palette, manifest, particles
├── lore/                   # chapters.json (17 scaffolds), bosses.json (52 weeks)
└── store/                  # Zustand stores (useQuestStore)
```

---

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI Provider (OpenRouter)
OPENROUTER_API_KEY=

# Sprite Assets (if using Supabase storage for sprites)
NEXT_PUBLIC_SPRITE_BASE_URL=
```

4. Run database migrations: `npx supabase db push`
5. Start development server: `npm run dev`

### Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint check |
| `npm run type-check` | TypeScript checking |
| `npm run test` | Run Vitest (144 tests) |
| `npm run test:watch` | Vitest in watch mode |
| `npm run fetch-sprites` | Download all LPC sprite assets |

---

## Testing

### Unit & Integration Tests (Vitest)
**144 tests across 14 test files:**

| Test Suite | Tests | What's Covered |
|-----------|-------|----------------|
| `xp.test.ts` | 27 | XP formulas, level calculation, embershard states |
| `sanitize.test.ts` | 17 | HTML stripping, XSS prevention, text limits |
| `purchase.test.ts` | 10 | Auth guards, validation, RPC success/failure |
| `csrf.test.ts` | 9 | Origin/Referer validation, middleware |
| `rate-limiter.test.ts` | 6 | IP tracking, limits, blocking, independence |
| `pixelBadge.test.ts` | 3 | Badge variant metadata |
| `particles.test.ts` | 10 | Particle system calculations |
| `PixelButton.test.tsx` | 8 | Rendering, variants, sizes, props |
| `XPBar.test.tsx` | 8 | Percentages, clamping, ARIA attributes |
| `palette.test.ts` | 4 | Color palette mappings |
| `body-limit.test.ts` | 6 | Size checks, middleware |
| `middleware.test.ts` | 2 | Body sanitization |
| `pixelProgressBar.test.ts` | 28 | Progress bar calculations |

### E2E Tests (Playwright)
- **Golden Path**: Landing page → auth flow → API auth enforcement → CSRF protection
- **Story Progression**: Chapter API → advance-week → deeds → page rendering → meta tags

Run E2E tests: `npx playwright test`

---

## Deployment

The app is optimized for Vercel deployment:

```bash
npm run build           # Production build
npm run fetch-sprites   # Download sprite assets
```

Required environment variables (all non-optional fail fast at build time with clear error messages):
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-side only)
- `OPENROUTER_API_KEY` — OpenRouter API key for AI generation

### Security Headers
The `next.config.mjs` includes:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`: camera, microphone, geolocation disabled

---

## License

Quest Forge: The Emberlight Chronicles — A gamified productivity platform for families.

Sprite assets are provided under their respective licenses (CC-BY-SA 3.0 / GPL 3.0 for LPC assets, CC0 for Kenney.nl assets). See `public/sprites/CREDITS.md` for full attribution.
