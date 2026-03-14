# Quest Forge: The Emberlight Chronicles — Project Plan

## How To Build This (For Someone New to Coding)

This plan assumes you're working primarily in **Claude Code** (command-line AI coding assistant) with help from Claude Pro for planning, Gemini for the in-app AI features, and Perplexity for research. Each phase has quoted instructions you can paste directly into Claude Code.

---

## Prerequisites (Do These First)

### 1. Install Your Tools
Open your terminal and tell Claude Code:
> "Help me install Node.js (version 20+), npm, and Git on my machine."

Then:
> "Help me install the Supabase CLI."

### 2. Create Free Accounts
- **GitHub** (https://github.com) — Code hosting. Create a repo called `quest-forge`.
- **Supabase** (https://supabase.com) — Free tier. Database + user login system.
- **Vercel** (https://vercel.com) — Free tier. Hosts the app. Connect to your GitHub repo.
- **Google AI Studio** (https://aistudio.google.com) — Free Gemini API key (1,500 requests/day on Flash).

### 3. Create the Project
Tell Claude Code:
> "Create a new Next.js 14 project called quest-forge with TypeScript, Tailwind CSS, and the App Router. Initialize a git repo and push to my GitHub remote."

Copy the CLAUDE.md file into the project root so Claude Code has context for every future task.

### 4. Download Art Assets
This takes time, so start it during Phase 1. See the Art Pipeline section at the end of this plan, or read `docs/ART_PIPELINE.md` for the full guide. In short:
- Download the LPC base sprite sheets from OpenGameArt.org
- Download Kenney's Pixel UI Pack and RPG Item Pack
- Download 2-3 monster sprite packs from OpenGameArt
- Organize them into `/public/sprites/` per the folder structure in CLAUDE.md

---

## Phase 1: Foundation (Week 1)
*Goal: Database exists, parents can sign up, household is created.*

### Step 1.1 — Database Setup
> "Create Supabase migration files for the entire database schema from CLAUDE.md. Include the households table, profiles table, and all other tables. Add Row-Level Security policies that scope every table to household_id. The edu_challenges table should be globally readable."

**Verify:** Go to Supabase dashboard → Table Editor. All tables should exist.

### Step 1.2 — Parent Signup Flow
> "Build a signup page at /signup where a parent enters their name, email, and password. On submit: create the Supabase Auth user, create a household row, and create a profile row with role 'gm' linked to that household. Redirect to /dashboard."

**Verify:** Sign up with your email. Check Supabase — you should see a row in `households` and `profiles`.

### Step 1.3 — Login Page
> "Build a login page at /login with two modes: 'Parent Login' (email + password) and 'Player Login' (username + password). For player login, look up the username in the profiles table to find the generated internal email, then authenticate with that. After login, redirect GMs to /dashboard and players to /play. Add auth middleware that protects both routes."

**Verify:** Log in as your parent account. You should land on `/dashboard` (even if it's empty).

### Step 1.4 — Child Account Creation
> "Build /dashboard/players where the GM can create child accounts. Form fields: display name, username, password, and age. On submit, call /api/auth/create-child which uses the Supabase service role key to create an auth user with a generated email like username@household-uuid.questforge.local, then creates a profile row with role 'player' linked to the GM's household_id. Show a list of existing players with their username and level."

**Verify:** Create two child accounts. Log out. Log in as each child using their username. You should land on `/play`.

### Step 1.5 — Base Layouts & Navigation
> "Create the root layout with a pixel art fantasy color palette (deep purples, golds, ember oranges, dark backgrounds). Build a responsive sidebar nav for /dashboard (parent) and a bottom tab bar for /play (player). Use pixel art styled buttons and borders. The Tailwind config should include the full fantasy palette and a pixel font (like 'Press Start 2P' from Google Fonts for headings, and a readable sans-serif for body text)."

**Verify:** Resize browser — layout works at 375px, 768px, and 1280px.

### Step 1.6 — GitHub Actions CI
> "Create a GitHub Actions workflow at .github/workflows/ci.yml that runs on every pull request: install deps, run lint, run type-check, run build. Make sure it catches TypeScript errors."

**Verify:** Push a commit. Check the Actions tab on GitHub — workflow should run green.

---

## Phase 2: Game Master Dashboard (Week 2)
*Goal: Parent can create chores, prizes, and see player stats.*

### Step 2.1 — GM Overview Page
> "Build the /dashboard page showing all players in the household. For each player show: pixel art avatar (placeholder for now), display name, level, XP bar, available XP, gold, and count of pending chore verifications. Use card components styled with pixel art borders. Add a summary of the current boss (name, HP bar)."

### Step 2.2 — Chore Management
> "Build /dashboard/chores with a form to create chores. Fields: title, description, XP reward, gold reward (optional), assigned player (dropdown of household players or 'All'), recurrence (once/daily/weekly), difficulty (easy/medium/hard/epic). Add an 'Auto-generate flavor text' toggle that calls /api/chores/flavor using the Gemini API to wrap the chore in Embervale fantasy language. Show all active chores in a filterable list with edit and deactivate buttons."

### Step 2.3 — Quest Flavor Text API
> "Build /api/chores/flavor as a POST endpoint. It receives a chore title and description, calls Gemini Flash to generate a fantasy quest wrapper, checks the rate limiter first, and returns the flavor text. If the rate limit is near capacity, pick from a hardcoded map of 50 common chore-to-quest templates instead."

### Step 2.4 — Loot Store Management
> "Build /dashboard/loot for creating store items. Fields: item name, real-world reward description, XP cost, gold cost (optional), category (real_reward/cosmetic/power_up/story_unlock), and fantasy flavor text. Show all items with availability toggles. Style as a pixel art shop interface."

### Step 2.5 — Chore Approval Queue
> "Add an approval section to the GM dashboard. When a player marks a chore complete, it appears in a 'Pending Verification' queue. The GM can approve (awards XP/gold, deals boss damage) or reject (sends a note). Use Supabase Realtime to make new pending items appear without refresh."

---

## Phase 3: Player Interface (Week 3)
*Goal: Kids can see quests, mark them done, shop the loot store.*

### Step 3.1 — Character Creation
> "Build /play/create-character as a multi-step wizard. Step 1: Choose a narrative class (Blazewarden, Lorescribe, Shadowstep, Hearthkeeper, Stormcaller, Ironvow) — show each class's name, motto, archetype, and embershard description from classes.json. Step 2: Customize avatar using the LPC sprite system — pick skin tone, hair style, hair color, eye color, and starter outfit. Render a live preview using the SpriteCanvas component. Step 3: Confirmation screen with dramatic class reveal. Save avatar_config and avatar_class to the profile."

### Step 3.2 — Sprite Canvas Component
> "Build the SpriteCanvas component in /components/avatar/. It takes an avatar_config JSON object and renders layered LPC sprite sheets on an HTML5 Canvas element. Layer order: body → eyes → hair back → pants → shirt → boots → gloves → belt → cape → helmet → hair front → weapon → shield. Each layer is a PNG sprite sheet; the component draws the correct frame based on direction (front for static, animated for walk/attack). Use image-rendering: pixelated. Export a function to extract a static PNG from the canvas for use as a thumbnail."

### Step 3.3 — Player Home Screen
> "Build /play as the player hub. Show: animated avatar sprite (idle animation), character name and class, level with pixel art XP progress bar, available XP and gold counters, current boss HP bar (shared across household), and navigation tiles for Quest Board, Academy, Story, Boss, Loot Store, and Profile. Style as a pixel art adventurer's camp. All touch targets minimum 48px."

### Step 3.4 — Quest Board (Chores)
> "Build /play/quests showing assigned chores as quest cards with pixel art styling. Each card: quest flavor text in a scroll-like container, real chore description in smaller text, XP/gold reward with coin icons, difficulty badge (color-coded), and a 'Complete Quest' button. Daily quests show a reset timer. Completed quests show 'Awaiting Verification' (amber) or 'Verified' (green) badges."

### Step 3.5 — Loot Store
> "Build /play/loot styled as a pixel art shop with a counter and shelves. Show items as cards with pixel art icon, name, flavor text, cost, and 'Purchase' button. Gray out items the player can't afford. Confirmation modal on purchase. 'My Items' tab showing purchased items and redeem status."

### Step 3.6 — Character Sheet
> "Build /play/profile as a character sheet. Show: full avatar with equipped items, class name and motto, level and embershard state name (from the level-to-shard mapping), XP bars, gold, stats, equipped inventory items, and a quest history log. Include an 'Edit Avatar' button that reopens the appearance customizer (not the class selection)."

---

## Phase 4: Art Integration (Week 3-4, parallel with Phase 3)
*Goal: All sprites sourced, organized, and rendering correctly.*

### Step 4.1 — Download and Organize LPC Assets
Follow the ART_PIPELINE.md guide. Key tasks:
- Download LPC base sprites (bodies, 4+ skin tones)
- Download 10+ hair styles from LPC extensions
- Download 5+ clothing/armor sets
- Download 5+ weapon sprites
- Organize into `/public/sprites/` subfolders
- Create a `manifest.ts` that catalogs every available part with its display name, category, and file path

### Step 4.2 — Download Boss Sprites
- Source 15-20 monster/creature base sprites from OpenGameArt
- Save in `/public/sprites/bosses/`
- Create a palette swap utility that recolors sprites programmatically
- Map each boss in `bosses.json` to a base sprite + palette combo

### Step 4.3 — Download UI Assets
- Download Kenney's Pixel UI Pack
- Extract buttons, frames, borders, progress bars, icons
- Create Tailwind utility classes or React components for pixel art UI elements:
  - `PixelButton`, `PixelCard`, `PixelProgressBar`, `PixelFrame`, `PixelBorder`
- These become the app's design system

### Step 4.4 — Boss Sprite Component
> "Build the BossSprite component. It takes a boss_sprite_config JSON and renders: the base monster sprite (from /public/sprites/bosses/), palette-shifted via Canvas, scaled to 3-4x, with CSS particle effects overlaid (ember particles, shadow tendrils, glow effects). Add a pulsing animation on idle and a shake animation when taking damage. Include a decorative frame SVG that changes by difficulty tier."

### Step 4.5 — Attribution File
> "Create a CREDITS.md in the project root listing every art asset used, its source URL, author, and license. This is required by CC-BY-SA and CC-BY licenses."

---

## Phase 5: Educational Games (Week 4-5)
*Goal: Age-appropriate learning games that award XP.*

### Step 5.1 — Academy Hub
> "Build /play/academy as a game selection screen styled like a pixel art library/tower. Show games as book-spine cards on shelves. Filter by the player's age_tier. Each game shows: subject icon, name, XP reward range, and difficulty indicator."

### Step 5.2 — Pre-Generated Question Bank
> "Seed the edu_challenges table with at least 50 questions per subject per age tier. That's math, reading, science, history, vocabulary, and logic × junior and senior × 50 = 600 questions minimum. Use the content specifications from GAME_DESIGN_DOC.md for appropriate difficulty levels. Store as JSONB with question text, type, options (if multiple choice), correct answer, and explanation."

**Tip for Claude Code:** You can say: "Generate 50 junior-tier math questions covering multiplication, division, and fractions as a SQL INSERT statement for the edu_challenges table." Repeat for each subject/tier combo.

### Step 5.3 — Math Arena
> "Build the MathArena game component. Display questions one at a time with a pixel art battle theme — the player 'attacks' a training dummy by answering correctly. 10 questions per session. Timer per question (optional, toggleable). Show correct answer and brief explanation on wrong answers. Score screen at end with XP awarded based on accuracy. Save completion to edu_completions table."

### Step 5.4 — Word Forge (Vocabulary)
> "Build WordForge. Same structure as MathArena but with vocabulary questions. Junior: definition matching, fill-in-blank, synonyms. Senior: analogies, context clues, SAT-level words. Style as a blacksmith's forge where correct answers forge letters into glowing words."

### Step 5.5 — Science Labyrinth
> "Build ScienceLabyrinth. Frame as navigating a maze — each correct answer advances through a corridor. Wrong answers hit a dead end (show explanation, then continue). Junior: earth science, animals, solar system. Senior: physics, chemistry, biology."

### Step 5.6 — History Scroll, Logic Gate
> "Build HistoryScroll (timeline-themed) and LogicGate (circuit/puzzle-themed) following the same pattern. Use the question specs from GAME_DESIGN_DOC.md."

### Step 5.7 — AI-Generated Challenges
> "Build /api/edu/generate that calls Gemini Flash to create a fresh question. Input: subject, age_tier, difficulty (1-5). Output: JSON with question, type, options, correct_answer, explanation, xp_value. Check rate limiter before calling. Store generated questions in edu_challenges for reuse. Add a 'Generate New Challenge' button in the Academy that calls this endpoint."

---

## Phase 6: Story Engine & Boss Battles (Week 5-6)
*Goal: Living narrative that advances weekly per household.*

### Step 6.1 — Story Display
> "Build /play/story styled as a pixel art illuminated manuscript with parchment background. Show unlocked chapters in scrollable order. Each chapter: title in decorative pixel font, narrative text in readable font, boss encounter illustration (BossSprite component). Locked chapters show as darkened scroll icons with 'Defeat the current boss to continue.' Use CSS scroll-snap for chapter-by-chapter reading."

### Step 6.2 — Boss Battle Page
> "Build /play/boss showing the current week's boss. Display: BossSprite component (large, animated), boss name and description, HP bar (shows current/max, updates via Supabase Realtime), a 'Battle Log' showing recent damage events ('{Player} dealt 25 damage by completing Refuse Wraith Disposal!'), and pixel art avatars of all household players arranged dynamically around the boss (1 player centered below, 2 flanking, 3+ in a row). When boss HP reaches 0: trigger a multi-second victory animation with the boss dissolving into particles and a treasure chest appearing."

### Step 6.3 — Boss Damage Integration
> "When a chore is approved or an edu-challenge is completed, automatically deal damage to the current boss equal to the XP earned. Update boss_current_hp in story_chapters. If boss_current_hp <= 0: set is_unlocked on the next chapter, award bonus XP/gold split between contributing players, and flag rewards_claimed. Use a Supabase database function (RPC) for atomic HP updates to prevent race conditions."

### Step 6.4 — Story Generation API
> "Build /api/story/generate. The GM triggers this from /dashboard/story. It sends to Gemini Flash: the world summary (abbreviated from world.json), current arc and chapter info, the boss for this week, all players' names/classes/recent accomplishments, and the total player count. Gemini returns a 400-800 word chapter that references every player by name and adapts its language to the number of heroes (solo, pair, or group). The GM can edit before publishing. Save to story_chapters for that household. Include the full prompt template from LORE_CODEX.md."

### Step 6.5 — Seed Initial Story
> "Seed the first 4 story chapters and boss encounters for each new household from chapters.json and bosses.json. When a household is created, automatically populate story_chapters for weeks 1-4. The GM can regenerate/customize these."

### Step 6.6 — Weekly Boss Spawning
> "When the current boss is defeated and it's time for the next week: look up the next boss from bosses.json by week number, create a new story_chapters row with the boss data and sprite config, and mark it as the active boss for that household. If the household has exhausted the 52-week boss pool, use Gemini to generate a new boss based on the world lore (Season 2+)."

---

## Phase 7: Polish & Production (Week 7)

### Step 7.1 — Celebration Animations
> "Add pixel art micro-animations: XP gain shows floating '+25 XP' pixel text that rises and fades. Level-up triggers a full-screen flash with the embershard evolution. Boss damage shows a screen shake. Boss defeat has a dissolve-to-particles animation. Loot purchase shows a chest-open animation. Use CSS keyframe animations — no heavy libraries."

### Step 7.2 — Responsive Audit
> "Test every page at 375px, 768px, and 1280px. Fix layouts. Ensure 48px minimum touch targets on all interactive elements. Pixel art must scale at integer multiples. Test with actual touch input."

### Step 7.3 — PWA Setup
> "Convert to a Progressive Web App. Add manifest.json with the app name, pixel art icons, and theme color. Add a service worker that caches the sprite assets and story pages for offline reading. The app should be installable on tablet and phone home screens."

### Step 7.4 — Landing Page
> "Build a marketing landing page at / for new visitors. Show: the game's concept (pixel art screenshots), how it works for parents, character class showcase, and signup CTA. Pixel art themed. Responsive."

### Step 7.5 — Error Handling & Loading States
> "Add error boundaries to every route segment. Add pixel art themed loading skeletons (flickering torches, pulsing embershards). Add a global error page with a funny 'The Hollow consumed this page' message. Handle Gemini API failures gracefully with fallback content."

---

## Phase 8: Deployment (Week 8)

### Step 8.1 — Vercel Setup
> "Connect the GitHub repo to Vercel. Set environment variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY. Deploy. Set up a custom domain if you have one."

### Step 8.2 — Supabase Production
> "Push all migrations to the production Supabase instance. Run the seed SQL for edu_challenges. Verify RLS policies are active."

### Step 8.3 — Create Your Family's Accounts
- Sign up as the parent
- Create both child accounts from the dashboard
- Have each kid log in on their device and create their character
- Create some initial chores and loot store items
- Generate or publish the first story chapter
- Start playing!

### Step 8.4 — Testing Checklist
- [ ] Parent can sign up and create household
- [ ] Parent can create child accounts with username login
- [ ] Each child can log in on their device (tablet, phone)
- [ ] Character creation works (class + avatar)
- [ ] Parent can create chores (with AI flavor text)
- [ ] Chores appear on correct player's quest board
- [ ] Player marks chore complete → appears in GM approval queue
- [ ] GM approves → XP/gold awarded, boss takes damage
- [ ] Player can play each edu-game and earn XP
- [ ] Boss HP reaches 0 → story chapter unlocks
- [ ] Player can buy from loot store
- [ ] Story displays correctly on all screen sizes
- [ ] Pixel art renders crisply (no blurring) on all devices
- [ ] App works when installed as PWA on tablet
- [ ] A second family can sign up and sees ONLY their own data

---

## Ongoing Operations

### Weekly GM Tasks (10-15 minutes)
1. Approve pending chore completions (batch approve helps)
2. Click "Generate Story" for this week's chapter, review/edit, publish
3. Check boss status — on track to be defeated?
4. Optionally create new chores, loot items, or challenges

### Monthly
- Review XP economy — are levels coming too fast or slow?
- Rotate loot store items
- Check Gemini API usage stats
- Back up Supabase (or enable point-in-time recovery)

### Scaling Notes
- Vercel free tier: sufficient for ~100 households
- Supabase free tier: 500MB database, 50k monthly active users — plenty for early growth
- Gemini free tier: 1,500 req/day — sufficient for ~50 active households
- If growing beyond this: Vercel Pro ($20/mo), Supabase Pro ($25/mo), Gemini pay-as-you-go

---

## Tips for Working with Claude Code

1. **Give it CLAUDE.md first.** Every session: "Read CLAUDE.md and then..."

2. **One step at a time.** Each ">" instruction in this plan is a single Claude Code prompt. Don't ask for multiple phases at once.

3. **Test after every step.** Run `npm run dev` and check the browser.

4. **When something breaks:** Copy the error, paste it. "I got this error when [action]. Fix it."

5. **Git after each phase.** "Commit all changes with message 'Phase 2 complete: GM dashboard'"

6. **Use Perplexity for research.** "What is Supabase Row-Level Security and how do I set it up?"

7. **Use Gemini as a second opinion.** If Claude Code's approach seems complex, ask Gemini the same question and compare.

8. **For art downloads:** See ART_PIPELINE.md — it has direct URLs and step-by-step instructions for every asset you need.

---

## Estimated Timeline

| Phase | Duration | What You'll Have |
|-------|----------|-----------------|
| Prerequisites | Day 1-2 | Tools installed, accounts created, art downloading |
| Phase 1: Foundation | Days 3-7 | Signup, login, household system, child accounts |
| Phase 2: GM Dashboard | Days 8-12 | Parent can create chores and prizes |
| Phase 3: Player Interface | Days 13-18 | Kids can see quests, shop, customize character |
| Phase 4: Art Integration | Days 14-20 | Pixel art rendering, boss sprites, UI polish |
| Phase 5: Edu Games | Days 21-30 | All six learning games playable |
| Phase 6: Story Engine | Days 31-38 | Narrative system, boss battles, Gemini integration |
| Phase 7: Polish | Days 39-44 | Animations, PWA, responsive, landing page |
| Phase 8: Deploy | Days 45-48 | Live on the internet |

**Total: ~7-9 weeks working evenings/weekends**

Phases 3 and 4 overlap intentionally — art integration happens while you're building the player interface that displays it.
