# Quest Forge — Master Build Playbook

## How This Document Works

This is your step-by-step recipe. Each step tells you:
- **Which AI to open** (Claude Code, Claude Pro, Gemini, or Perplexity)
- **What files to give it** (if any)
- **Exactly what to type or paste**
- **What to check before moving on**

Do them in order. Don't skip ahead. Each step builds on the last.

---

# ============================================================
# PHASE 0: SETUP (Day 1)
# ============================================================

## Step 0.1 — Install Node.js

**Open:** Claude Code (terminal)
**Give it:** Nothing
**Prompt:**
```
Help me install Node.js version 20 or newer and npm on my machine. Check if I already have them first. Also install Git if I don't have it.
```
**Check:** Run `node --version` and `npm --version` in your terminal. You should see version numbers.

---

## Step 0.2 — Install Supabase CLI

**Open:** Claude Code
**Give it:** Nothing
**Prompt:**
```
Help me install the Supabase CLI on my machine.
```
**Check:** Run `supabase --version` in your terminal.

---

## Step 0.3 — Create Accounts

**Do these yourself in your browser (no AI needed):**

1. **GitHub** — https://github.com — Sign up, then create a new repository called `quest-forge` (public or private, your choice). Don't add a README yet.

2. **Supabase** — https://supabase.com — Sign up, then click "New Project." Name it `quest-forge`. Pick a strong database password and **save it somewhere safe**. Choose the region closest to you. Wait for it to finish setting up (~2 min). Then go to Settings → API and copy these values somewhere safe:
   - Project URL (looks like `https://xxxxx.supabase.co`)
   - `anon` public key (long string starting with `eyJ`)
   - `service_role` key (another long string — keep this SECRET)

3. **Vercel** — https://vercel.com — Sign up with your GitHub account. Don't deploy anything yet.

4. **Google AI Studio** — https://aistudio.google.com/apikey — Sign in with Google, click "Create API Key," copy it somewhere safe.

---

## Step 0.4 — Create the Project

**Open:** Claude Code
**Give it:** Nothing
**Prompt:**
```
Create a new Next.js 14 project in a folder called quest-forge. Use TypeScript, Tailwind CSS, the App Router, and ESLint. After creating it, initialize a git repo, add a remote pointing to my GitHub repo at https://github.com/YOUR_GITHUB_USERNAME/quest-forge.git and push the initial commit. Also install these dependencies: @google/generative-ai @supabase/supabase-js @supabase/ssr zod
```
*(Replace YOUR_GITHUB_USERNAME with your actual GitHub username)*

**Check:** You should have a `quest-forge` folder. `cd quest-forge && npm run dev` should start a dev server at localhost:3000.

---

## Step 0.5 — Add the Project Files

**Open:** Claude Code (make sure you're inside the quest-forge folder)
**Give it:** All 9 files from the planning package:
- CLAUDE.md
- PROJECT_PLAN.md
- GAME_DESIGN_DOC.md
- LORE_CODEX.md
- ART_PIPELINE.md
- lore/world.json
- lore/classes.json
- lore/bosses.json
- lore/chapters.json

**Prompt:**
```
I'm going to give you the project files for Quest Forge. Please place them as follows:
- CLAUDE.md → project root (quest-forge/CLAUDE.md)
- PROJECT_PLAN.md → docs/PROJECT_PLAN.md
- GAME_DESIGN_DOC.md → docs/GAME_DESIGN_DOC.md
- LORE_CODEX.md → docs/LORE_CODEX.md
- ART_PIPELINE.md → docs/ART_PIPELINE.md
- world.json → src/lore/world.json
- classes.json → src/lore/classes.json
- bosses.json → src/lore/bosses.json
- chapters.json → src/lore/chapters.json

Then create a .env.local file with these placeholder variables:
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=

Don't commit .env.local to git — add it to .gitignore if it isn't already.
```

Then fill in your `.env.local` with the real values from Step 0.3.

**Check:** `cat CLAUDE.md` should show the project spec. `cat .env.local` should show your keys.

---

## Step 0.6 — Start Downloading Art Assets (Do in parallel)

**Open:** Your web browser
**Do:** Follow the download checklist in ART_PIPELINE.md. This takes a while, so start it now and continue building while downloads run.

**Minimum downloads needed before Phase 4:**
1. LPC base sprites (bodies): https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles
2. LPC character parts: browse https://lpc.opengameart.org/ — download hair, clothing, weapons
3. Kenney Pixel UI Pack: https://kenney.nl/assets/pixel-ui-pack
4. Kenney Game Icons: https://kenney.nl/assets/game-icons
5. Monster sprites: search OpenGameArt for "pixel monster sprites" — grab 15+ different creatures

Create the folder structure inside your project:
```
public/sprites/bodies/
public/sprites/hair/
public/sprites/clothing/torso/
public/sprites/clothing/legs/
public/sprites/clothing/feet/
public/sprites/clothing/head/
public/sprites/weapons/
public/sprites/accessories/
public/sprites/bosses/
public/sprites/icons/
public/sprites/ui/
```

Put downloaded assets in the matching folders as you get them.

---

# ============================================================
# PHASE 1: DATABASE & AUTH (Days 2-5)
# ============================================================

## Step 1.1 — Database Schema

**Open:** Claude Code
**Give it:** Read CLAUDE.md first
**Prompt:**
```
Read CLAUDE.md for the full project context. Now create Supabase SQL migration files for the entire database schema defined in CLAUDE.md. Create a file at supabase/migrations/001_initial_schema.sql that:

1. Creates ALL tables: households, profiles, chores, chore_completions, edu_challenges, edu_completions, loot_store_items, purchases, story_chapters, story_progress, inventory, api_usage
2. Adds Row-Level Security policies that scope every table with household_id so users can only see their own household's data
3. Makes edu_challenges globally readable
4. Allows players to INSERT on chore_completions, purchases, and edu_completions
5. Allows only GMs to INSERT/UPDATE/DELETE on chores, loot_store_items, story_chapters
6. Creates a database function that atomically decrements boss HP when damage is dealt
7. Enables realtime on chore_completions and story_chapters tables

After creating the file, tell me the exact commands to push this to my Supabase project.
```

**Check:** After pushing, go to Supabase Dashboard → Table Editor. You should see all tables listed.

---

## Step 1.2 — Supabase Client Setup

**Open:** Claude Code
**Prompt:**
```
Read CLAUDE.md. Set up the Supabase client files:

1. src/lib/supabase/client.ts — browser client using createBrowserClient from @supabase/ssr
2. src/lib/supabase/server.ts — server component client using createServerClient with cookies
3. src/lib/supabase/admin.ts — service role client for creating child accounts (server-only, never exposed to browser)
4. src/lib/supabase/middleware.ts — auth middleware that refreshes sessions
5. src/middleware.ts — Next.js middleware that uses the above, protects /dashboard and /play routes, redirects unauthenticated users to /login

Follow the latest @supabase/ssr patterns for Next.js App Router.
```

**Check:** No errors on `npm run build`.

---

## Step 1.3 — Parent Signup

**Open:** Claude Code
**Prompt:**
```
Read CLAUDE.md. Build the parent signup flow:

1. src/app/signup/page.tsx — A signup form with fields: household name (e.g. "The Smith Family"), parent display name, email, and password. Style it with a pixel art fantasy theme — dark background, gold/amber accents, pixel font for the heading "Create Your Hearthhold", readable font for form fields. On submit:
   - Create the Supabase Auth user
   - Create a row in the households table
   - Create a row in profiles with role='gm' linked to that household
   - Redirect to /dashboard

2. Make sure the signup page is responsive — works on phone and desktop.

Use Zod for form validation. Show clear error messages.
```

**Check:** Go to localhost:3000/signup. Create an account. Check Supabase — you should see rows in `households` and `profiles`.

---

## Step 1.4 — Login Page

**Open:** Claude Code
**Prompt:**
```
Read CLAUDE.md. Build the login page at src/app/login/page.tsx with TWO tabs:

Tab 1 — "Game Master" login: email + password fields
Tab 2 — "Player" login: username + password fields

For the Player tab: look up the username in the profiles table to find the internal generated email (username@household-uuid.questforge.local), then authenticate with Supabase using that email + the entered password.

After successful login: check the user's role in profiles. If 'gm', redirect to /dashboard. If 'player', redirect to /play.

Style with pixel art theme matching the signup page. Add a "Don't have a household? Create one" link to /signup.
```

**Check:** Log in with your parent account. You should be redirected to /dashboard (even if it's a blank page).

---

## Step 1.5 — Child Account Creation

**Open:** Claude Code
**Prompt:**
```
Read CLAUDE.md. Build the child account creation system:

1. src/app/api/auth/create-child/route.ts — A POST endpoint that:
   - Verifies the caller is a GM (check their profile role)
   - Receives: displayName, username, password, age
   - Uses the Supabase ADMIN client (service role) to create an auth user with email set to username@{household_id}.questforge.local
   - Creates a profile row with role='player', the GM's household_id, and the provided age
   - Returns the created profile data

2. src/app/dashboard/players/page.tsx — A page where the GM can:
   - See a list of all players in their household (name, username, age, level)
   - A form to create a new player account (display name, username, password, age)
   - A button to reset a player's password

Style with the pixel art theme. Make the player list show placeholder avatar circles for now (we'll add real sprites later).
```

**Check:** Create two child accounts. Log out. Log in as each child using the "Player" tab with their username. Each should land on /play.

---

## Step 1.6 — Layout & Navigation

**Open:** Claude Code
**Prompt:**
```
Read CLAUDE.md. Build the base layouts and navigation:

1. src/app/layout.tsx — Root layout with:
   - Import "Press Start 2P" from Google Fonts for headings
   - A readable sans-serif (Inter or similar) for body text
   - Global CSS including image-rendering: pixelated on a .pixel-art class
   - Dark fantasy background color (#0D0D1A or similar)
   - Auth context provider wrapping children

2. src/app/dashboard/layout.tsx — GM layout with:
   - Desktop: sidebar navigation with links to Overview, Chores, Players, Loot Store, Story, Progress, Settings
   - Mobile/tablet: collapsible hamburger menu
   - Sidebar styled as a pixel art panel with gold borders
   - Show the household name at the top

3. src/app/play/layout.tsx — Player layout with:
   - Bottom tab bar with icons for: Home, Quests, Academy, Story, Loot
   - Tab bar uses pixel art button styling
   - Touch targets at least 48px
   - Show the player's name and level in a top bar

Both layouts should show a logout button.

Use Tailwind for all styling. The overall feel should be a retro RPG game UI.
```

**Check:** Navigate between /dashboard and /play on different accounts. Resize your browser — sidebar should collapse on mobile, tab bar should show on player pages.

---

## Step 1.7 — First Commit

**Open:** Claude Code
**Prompt:**
```
Commit all changes with the message "Phase 1 complete: database, auth, layouts" and push to GitHub.
```

---

# ============================================================
# PHASE 2: GAME MASTER DASHBOARD (Days 6-10)
# ============================================================

## Step 2.1 — GM Overview

**Open:** Claude Code
**Prompt:**
```
Read CLAUDE.md. Build the GM dashboard overview at src/app/dashboard/page.tsx:

Show cards for each player in the household. Each card displays:
- Player display name
- Level (as a pixel art badge)
- XP progress bar to next level (use the formula from CLAUDE.md: Level N requires 50 × N × (N + 1) / 2 total XP)
- Available XP and Gold with pixel coin/gem icons
- Number of pending chore verifications (badge with count)

Below the player cards, show a "Current Boss" section:
- Boss name and description (pull from the first story_chapters row, or show "No active boss" if none exist)
- HP bar showing current/max

Style everything with pixel art borders, dark card backgrounds, and amber/gold accent colors. All data comes from Supabase queries scoped to the GM's household_id.
```

---

## Step 2.2 — Gemini Client Setup

**Open:** Claude Code
**Prompt:**
```
Read CLAUDE.md. Create the Gemini API client files:

1. src/lib/gemini/client.ts — Initialize the GoogleGenerativeAI client with GEMINI_API_KEY. Export the model instance.

2. src/lib/gemini/rate-limiter.ts — A module that:
   - Checks the api_usage table for today's row
   - If no row exists, creates one with request_count=0
   - Exports an async function canMakeRequest() that returns true if count < 1400
   - Exports an async function incrementUsage() that atomically increments the counter
   - Both functions use the Supabase server client

3. src/lib/gemini/flavor.ts — Exports an async function generateFlavorText(choreTitle: string, choreDescription: string) that:
   - Checks canMakeRequest(). If false, returns a fallback from a hardcoded template map.
   - Calls Gemini Flash with a prompt to rewrite the chore as an Embervale fantasy quest
   - Increments usage on success
   - Returns the generated text
   - Falls back to template map on any error

4. Include a FLAVOR_TEMPLATES constant with at least 30 chore-to-quest mappings for common chores (cleaning, dishes, trash, laundry, homework, reading, yard work, pet care, cooking, organizing, etc.)
```

---

## Step 2.3 — Chore Management

**Open:** Claude Code
**Prompt:**
```
Read CLAUDE.md and the chore system section of GAME_DESIGN_DOC.md. Build chore management:

1. src/app/api/chores/flavor/route.ts — POST endpoint that calls generateFlavorText and returns the result as JSON. Protected: only GMs can call it.

2. src/app/dashboard/chores/page.tsx — A page with:
   TOP: A form to create new chores with fields:
   - Title (text)
   - Description (text)
   - XP Reward (number, with presets for easy/medium/hard/epic: 15/35/75/150)
   - Gold Reward (number, optional)
   - Assign To (dropdown: all players in household + "Everyone" option)
   - Recurrence (once / daily / weekly)
   - Difficulty (easy / medium / hard / epic — color-coded: green/blue/purple/orange)
   - Quest Flavor Text (textarea, with a "✨ Auto-Generate" button that calls the flavor text API)

   BOTTOM: A filterable list of all active chores showing:
   - Quest title with difficulty badge
   - Assigned player (or "Everyone")
   - XP/Gold reward
   - Recurrence type
   - Edit and Deactivate buttons

Style the form as a "scroll" or "decree" being written. The chore list should use pixel art card styling.
```

---

## Step 2.4 — Loot Store Management

**Open:** Claude Code
**Prompt:**
```
Read CLAUDE.md. Build loot store management at src/app/dashboard/loot/page.tsx:

A form to create store items:
- Item name
- Real-world reward description (what the kid actually gets, e.g. "30 min extra screen time")
- Fantasy flavor text
- XP Cost (number)
- Gold Cost (number, optional)
- Category (dropdown: Real Reward, Cosmetic, Power-Up, Story Unlock)

Below the form: a list of all store items with availability toggles (on/off switch) and edit/delete buttons.

Style as a shop inventory management screen with pixel art table rows.
```

---

## Step 2.5 — Approval Queue

**Open:** Claude Code
**Prompt:**
```
Read CLAUDE.md. Build the chore approval system:

1. Add an "Approval Queue" section to the GM dashboard overview page (or as a prominent tab/section). Show all chore_completions where verified=false for this household.

Each pending item shows:
- Player name
- Chore title + quest flavor text
- When it was submitted
- Approve button (green checkmark) and Reject button (red X)
- Optional reject reason text field

When approved:
- Set verified=true and verified_at=now
- Add the XP to the player's xp_total and xp_available
- Add gold to the player's gold
- Call the boss damage database function to reduce boss_current_hp by the XP amount
- The player should see a notification on their next page load

When rejected:
- Delete the chore_completion row (or mark it rejected)

Add a "Batch Approve All" button for busy parents.

Use Supabase Realtime subscription so new pending items appear without page refresh.
```

---

## Step 2.6 — Commit Phase 2

**Open:** Claude Code
**Prompt:**
```
Commit all changes with the message "Phase 2 complete: GM dashboard, chores, loot store, approvals" and push to GitHub.
```

---

# ============================================================
# PHASE 3: PLAYER INTERFACE (Days 11-15)
# ============================================================

## Step 3.1 — XP & Level Utilities

**Open:** Claude Code
**Prompt:**
```
Read CLAUDE.md. Create game mechanic utility files:

1. src/lib/xp.ts — Export functions:
   - xpForLevel(level: number): number — returns total XP needed (formula: 50 * level * (level + 1) / 2)
   - levelFromXP(totalXP: number): number — returns current level
   - xpProgressPercent(totalXP: number): number — returns 0-100 progress to next level
   - embershardState(level: number): string — returns the shard name for that level range per GAME_DESIGN_DOC.md

2. src/lib/boss.ts — Export functions:
   - scaleBossHP(baseHP: number, playerCount: number): number — formula: baseHP × (0.5 + (0.5 × playerCount)). This ensures a solo child faces fair HP and a family of 5 faces proportionally more.
   - dealBossDamage(householdId: string, damage: number): Promise<{newHP: number, defeated: boolean}>
   - getCurrentBoss(householdId: string): Promise<Boss | null>
   - These should call the Supabase database functions created in Phase 1

3. src/lib/constants.ts — Export all game balance constants:
   - XP ranges per difficulty
   - Gold ranges per difficulty
   - Level-to-shard mapping
   - Boss HP defaults per week range

Write unit tests for the XP functions using the test cases: Level 1=0 XP, Level 2=100, Level 5=700, Level 10=2700, Level 20=10500.
```

---

## Step 3.2 — Player Home Screen

**Open:** Claude Code
**Prompt:**
```
Read CLAUDE.md. Build the player home screen at src/app/play/page.tsx:

This is the main hub the kids see after login. Show:

TOP SECTION:
- Player display name in pixel font
- Class name and motto (from their profile's avatar_class, matched against classes.json)
- Level badge with embershard state name
- XP progress bar (pixel art style, ember orange fill)
- Available XP and Gold counters with pixel coin/gem sprites

MIDDLE SECTION — Current Boss:
- Boss name
- HP bar (red fill, shows current/max)
- Text: "Your household has dealt X damage this week!"

BOTTOM SECTION — Navigation grid (2×3 grid of large tap targets):
- Quest Board (sword icon)
- Academy (book icon)
- Story (scroll icon)
- Boss Battle (skull icon)
- Loot Store (chest icon)
- Character (shield icon)

Each grid item should be at least 80×80px with a pixel art icon and label below. Use a dark RPG camp/tent background feel. Touch targets must be large and obvious for a 9-year-old on a tablet.

If the player has no avatar_class set (first login), redirect to /play/create-character.
```

---

## Step 3.3 — Quest Board

**Open:** Claude Code
**Prompt:**
```
Read CLAUDE.md. Build the quest board at src/app/play/quests/page.tsx:

Show all chores assigned to this player (or assigned to "everyone" in the household) as quest cards.

Each quest card:
- Pixel art scroll/parchment background
- Quest flavor text in the main area (fantasy language)
- Real chore description in smaller, lighter text below
- Difficulty badge (color-coded pixel gem: green/blue/purple/orange)
- XP and Gold reward shown with pixel icons
- Recurrence badge (daily/weekly/once)
- A large "Complete Quest" button (pixel art styled)

States:
- Available: normal card with active button
- Completed (awaiting verification): amber/yellow glow, "Awaiting Verification" badge, button disabled
- Verified: green glow, "Verified ✓" badge, shows XP earned

Daily quests should show a reset countdown timer.

Sort: pending verification at top, then available, then completed today.
```

---

## Step 3.4 — Loot Store (Player View)

**Open:** Claude Code
**Prompt:**
```
Read CLAUDE.md. Build the player loot store at src/app/play/loot/page.tsx:

Style as a pixel art shop interior. Show a shop counter with a "ROOK'S EMPORIUM" sign in pixel font.

Tab 1 — "Buy": Grid of available items as cards:
- Pixel art icon (or placeholder gem icon for now)
- Item name
- Flavor text
- Cost (XP and/or Gold)
- "Buy" button — enabled only if player can afford it, grayed out otherwise
- On purchase: confirmation modal ("Spend 100 XP on Extra Screen Time?"), then deduct from xp_available/gold, create purchase row

Tab 2 — "My Items": List of purchased items:
- Item name and description
- Real reward description
- "Redeemed" or "Not Yet Redeemed" status badge
- If the parent has marked it redeemed, show a green checkmark

Keep touch targets large. Make the purchase confirmation modal very clear (kids shouldn't accidentally buy things).
```

---

## Step 3.5 — Character Sheet

**Open:** Claude Code
**Prompt:**
```
Read CLAUDE.md. Build the character profile page at src/app/play/profile/page.tsx:

Show as a pixel art character sheet / RPG stat screen:

LEFT SIDE (or top on mobile):
- Large placeholder avatar area (256×256 pixels, gray box for now — we'll add the real sprite in Phase 4)
- "Edit Appearance" button (disabled for now)

RIGHT SIDE (or bottom on mobile):
- Character name (pixel font, large)
- Class: [class name] — [motto in italics]
- Level: [number] — [embershard state name]
- XP: [available] spendable / [total] lifetime
- Gold: [amount]
- Progress to next level: pixel art XP bar

STATS SECTION (derived from level, just for fun):
- Strength: level × 2
- Wisdom: level × 2
- Courage: level × 2
- Endurance: level × 2

QUEST HISTORY (bottom):
- Last 10 completed/verified chores with dates and XP earned

INVENTORY:
- List of owned items from the loot store
```

---

## Step 3.6 — Commit Phase 3

**Open:** Claude Code
**Prompt:**
```
Commit all changes with the message "Phase 3 complete: player home, quests, loot store, profile" and push to GitHub.
```

---

# ============================================================
# PHASE 4: PIXEL ART INTEGRATION (Days 14-20)
# (Start this once you have art assets downloaded from Step 0.6)
# ============================================================

## Step 4.1 — Sprite Manifest

**Open:** Claude Code
**Prompt:**
```
Read CLAUDE.md and ART_PIPELINE.md. Look at the files I've downloaded into public/sprites/ and create a sprite manifest file at src/lib/sprites/manifest.ts.

List the contents of each subfolder in public/sprites/ and create a typed manifest object that catalogs every PNG sprite sheet with: id, display name, category, file path, and any color variants. This manifest will drive the character creator UI.

Also create a types file at src/types/avatar.ts with TypeScript interfaces for AvatarConfig (matching the JSON structure in CLAUDE.md) and SpriteLayer.
```

*(Claude Code will scan your actual downloaded files and build the manifest to match)*

---

## Step 4.2 — Sprite Canvas Renderer

**Open:** Claude Code
**Prompt:**
```
Read CLAUDE.md, specifically the Avatar System section. Build the sprite rendering system:

1. src/components/avatar/SpriteCanvas.tsx — A React component that:
   - Takes an avatarConfig prop (the JSON layer selections)
   - Creates an HTML5 Canvas element
   - Loads each selected layer's PNG sprite sheet as an Image
   - Draws them in the correct layer order (body → eyes → hair back → pants → shirt → boots → gloves → belt → cape → helmet → hair front → weapon → shield)
   - For the static preview: draws only the "walk down, frame 0" cell from each sheet (that's column 0, row 10 in the standard LPC layout — each cell is 64×64)
   - Scales the canvas output to the specified size (default 256×256, which is 4× scale)
   - Uses image-rendering: pixelated on the canvas element
   - Handles missing layers gracefully (if a slot is null, skip it)

2. src/components/avatar/AvatarPreview.tsx — A wrapper that takes a profile's avatar_config from the database and renders a SpriteCanvas at a given size. This is what we'll use everywhere we show an avatar.

Test it by hardcoding a sample avatarConfig and rendering it on the player home page.
```

**Check:** You should see a pixel art character assembled from the LPC layers on the player home page.

---

## Step 4.3 — Character Creator

**Open:** Claude Code
**Prompt:**
```
Read CLAUDE.md. Build the character creation wizard at src/app/play/create-character/page.tsx:

Step 1 — "Choose Your Path" (Class Selection):
- Show all 6 classes from src/lore/classes.json as large cards
- Each card: class name, motto, archetype, embershard description, a class-colored border
- Player taps one to select it (highlight with glow effect)
- "Next" button

Step 2 — "Forge Your Identity" (Avatar Customization):
- LEFT: Live SpriteCanvas preview (updates in real-time as they pick options)
- RIGHT: Selection panels:
  - Skin tone (4-6 swatches, tap to select)
  - Hair style (scrollable row of options, tap to select)
  - Hair color (8 color swatches)
  - Eye color (6 swatches)
  - Clothing top (scrollable row)
  - Clothing bottom (scrollable row)
  - Boots (scrollable row)
  - Weapon (scrollable row)
- On mobile/tablet: preview on top, options scrolling below
- All driven by the sprite manifest from Step 4.1

Step 3 — "Your Legend Begins" (Confirmation):
- Large avatar preview with a dramatic reveal animation (fade in + particle burst)
- "Welcome, [Name] the [Class]!"
- Their class motto displayed below
- "Begin Your Quest" button → saves avatar_config and avatar_class to their profile, redirects to /play

Make this feel EXCITING. This is the first thing a kid experiences. Use pixel font headings, dramatic dark backgrounds, and ember particle effects.
```

**Check:** Log in as a child account, go through the creator. The avatar should render correctly and save to the database.

---

## Step 4.4 — Integrate Avatars Everywhere

**Open:** Claude Code
**Prompt:**
```
Now replace all avatar placeholders across the app with real AvatarPreview components:

1. Player home screen (/play): show animated avatar (if we have animation ready) or static preview at 3x scale
2. Character profile (/play/profile): large avatar at 4x scale, enable the "Edit Appearance" button to reopen step 2 of the character creator (not class selection)
3. GM dashboard player cards: small avatar at 2x scale next to each player's stats
4. Quest board header: small avatar at 2x scale
5. GM approval queue: show the requesting player's avatar at 2x scale next to each pending item
```

---

## Step 4.5 — Boss Sprite System

**Open:** Claude Code
**Prompt:**
```
Read CLAUDE.md and ART_PIPELINE.md, specifically the Boss Sprite Strategy. Build the boss rendering system:

1. src/lib/sprites/palette.ts — The palette swap system:
   - Define 4 palettes: hollow_dark, ember_corrupt, frost_hollow, ash_gray (colors defined in ART_PIPELINE.md)
   - Export a function swapPalette(imageData, sourcePalette, targetPalette) that replaces colors

2. src/lib/sprites/particles.ts — CSS particle effect definitions:
   - ember_float: small orange dots drifting upward
   - shadow_tendril: dark wisps at the base
   - glow_pulse: soft colored glow that pulses
   - dark_aura: semi-transparent dark overlay that breathes
   - Export each as a CSS animation class name + keyframe definition

3. src/components/boss/BossSprite.tsx — A component that:
   - Takes a boss_sprite_config JSON
   - Loads the base sprite from /public/sprites/bosses/
   - Applies palette swap on a Canvas
   - Renders at the specified scale (3-4x)
   - Overlays CSS particle effects as absolute-positioned animated divs
   - Adds a decorative frame SVG around the sprite
   - Has a takeDamage() animation (brief red flash + shake)
   - Has a defeat() animation (sprite dissolves into pixel particles rising upward)

4. src/components/boss/BossHPBar.tsx — A pixel art HP bar:
   - Shows boss name above
   - Red fill bar with current/max HP text
   - Animates smoothly when HP changes
   - Turns yellow below 50%, red below 25%
   - Pulses when near death

Test with the Week 1 boss data from bosses.json.
```

---

## Step 4.6 — Pixel Art UI Components

**Open:** Claude Code
**Prompt:**
```
Using the Kenney Pixel UI Pack assets in public/sprites/ui/, create a pixel art design system:

1. src/components/ui/PixelButton.tsx — Button with pixel art border, hover glow, tap feedback. Variants: primary (gold), secondary (gray), danger (red), success (green). Sizes: sm, md, lg.

2. src/components/ui/PixelCard.tsx — Card with pixel art border frame (9-slice from Kenney panel). Dark background. Optional header stripe.

3. src/components/ui/PixelProgressBar.tsx — XP/HP bar with pixel frame, animated fill, optional label. Color variants: xp (amber), hp (red-to-green), boss (red).

4. src/components/ui/PixelBadge.tsx — Small badges for difficulty (easy/medium/hard/epic), status (pending/verified), recurrence (daily/weekly).

5. src/components/ui/PixelModal.tsx — Modal dialog with pixel border, dark overlay, and close button.

Then go through ALL existing pages and replace any basic HTML/Tailwind buttons, cards, and progress bars with these pixel art components. This is the visual polish pass.
```

---

## Step 4.7 — Credits & Commit

**Open:** Claude Code
**Prompt:**
```
Create a CREDITS.md file in the project root that lists every art asset we're using: source URL, author name, and license for each. Group by category (LPC characters, Kenney UI, Boss sprites, etc.).

Also add a Credits/About page accessible from the settings menu at /dashboard/settings that displays this information.

Then commit everything with message "Phase 4 complete: pixel art integration, character creator, boss sprites, UI components" and push.
```

---

# ============================================================
# PHASE 5: EDUCATIONAL GAMES (Days 21-30)
# ============================================================

## Step 5.1 — Seed the Question Bank

**Open:** Claude Pro (web chat, NOT Claude Code)
**Give it:** The educational game specs from GAME_DESIGN_DOC.md (copy the relevant sections)
**Prompt:**
```
I'm building a chore/learning RPG app for kids. I need seed data for educational challenges. For each combination below, generate exactly 50 questions in this JSON format:

{ "title": "brief title", "subject": "math", "age_tier": "junior", "difficulty": 3, "xp_reward": 35, "challenge_type": "quiz", "content": { "question": "What is 7 × 8?", "type": "multiple_choice", "options": ["54", "56", "58", "64"], "correct_answer": "56", "explanation": "7 × 8 = 56. You can think of it as 7 × 8 = (7 × 4) × 2 = 28 × 2 = 56." } }

Generate for:
1. math / junior (ages 6-10) — multiplication, division, fractions, word problems
2. math / senior (ages 11-16) — algebra, geometry, percentages

Output ONLY valid JSON arrays with no markdown formatting. I'll come back for the other subjects.
```

**Then repeat for each subject pair (this will take multiple Claude Pro conversations):**
- vocabulary / junior AND senior
- science / junior AND senior
- history / junior AND senior
- logic / junior AND senior

**You'll end up with 12 JSON arrays (6 subjects × 2 tiers). Save each as a file like:**
- `seeds/math_junior.json`
- `seeds/math_senior.json`
- etc.

**Then open Claude Code and prompt:**
```
Read CLAUDE.md. I have seed JSON files in a seeds/ folder with educational challenges. Create a supabase/seed.sql file that inserts all of these into the edu_challenges table. Read each JSON file and generate the INSERT statements. There should be at least 600 questions total (50 per subject per age tier, 6 subjects, 2 tiers).
```

**Then push the seed data:**
```
Help me run the seed.sql file against my Supabase database.
```

---

## Step 5.2 — Academy Hub

**Open:** Claude Code
**Prompt:**
```
Read CLAUDE.md. Build the Academy hub at src/app/play/academy/page.tsx:

Styled as a pixel art library/wizard's tower. Show 6 game cards on "bookshelves":

1. Math Arena (⚔️ sword icon) — "Test your numbers in battle"
2. Word Forge (🔨 anvil icon) — "Forge words from molten letters"
3. Science Labyrinth (🧪 potion icon) — "Navigate the maze of knowledge"
4. History Scroll (📜 scroll icon) — "Unravel the tales of ages past"
5. Vocab Duel (📖 book icon) — "Master the language of power"
6. Logic Gate (⚡ circuit icon) — "Unlock the puzzles of the mind"

Each card shows: game name, subject icon, brief tagline, and the XP range earnable.

Only show games appropriate for the player's age_tier (determined by their age in the profile: 6-10 = junior, 11-16 = senior). Actually, show ALL games to both tiers — the questions inside will be different. But visually indicate which tier the player is on.

Tapping a card navigates to /play/academy/[game-slug].
```

---

## Step 5.3 — Build Each Game (One at a Time)

**Open:** Claude Code
**For each game, give it one prompt. Do them one at a time and test each before moving on.**

**Math Arena:**
```
Read CLAUDE.md and the Math Arena specs in GAME_DESIGN_DOC.md. Build the Math Arena educational game:

1. src/components/games/MathArena.tsx — A self-contained game component:
   - Fetches 10 questions from edu_challenges where subject='math' and age_tier matches the player
   - Shows one question at a time in a pixel art "battle" frame — the player's avatar on the left, a training dummy on the right
   - 4 multiple-choice answer buttons (large, touch-friendly)
   - Correct answer: training dummy takes a hit (flash animation), +1 to score, brief green flash
   - Wrong answer: show the correct answer + explanation for 3 seconds, red flash
   - After 10 questions: results screen with score, XP earned (100%=full, 80%+=80%, 60%+=50%, below=10 XP base)
   - Save completion to edu_completions table
   - Deal boss damage equal to XP earned
   - "Play Again" and "Back to Academy" buttons

2. Wire it up at src/app/play/academy/math-arena/page.tsx

Make it feel like a battle — dramatic question reveals, hit animations, victory screen.
```

**Word Forge:**
```
Read CLAUDE.md. Build Word Forge following the same pattern as Math Arena but with vocabulary questions. Theme it as a blacksmith's forge — correct answers "forge" glowing letters. Junior: definition matching, fill-in-blank. Senior: analogies, context clues. Wire up at /play/academy/word-forge.
```

**Science Labyrinth:**
```
Read CLAUDE.md. Build Science Labyrinth following the same game component pattern. Theme it as navigating a maze — correct answers advance through a corridor, wrong answers show a dead end (with explanation). Wire up at /play/academy/science-labyrinth.
```

**History Scroll:**
```
Read CLAUDE.md. Build History Scroll following the same pattern. Theme it as unrolling an ancient scroll — each correct answer reveals more of the scroll. Wire up at /play/academy/history-scroll.
```

**Vocab Duel:**
```
Read CLAUDE.md. Build Vocab Duel following the same pattern. Theme it as a word-based duel — the player and an NPC opponent trade vocabulary challenges. Wire up at /play/academy/vocab-duel.
```

**Logic Gate:**
```
Read CLAUDE.md. Build Logic Gate following the same pattern. Theme it as activating a circuit — correct answers light up nodes. Wire up at /play/academy/logic-gate.
```

---

## Step 5.4 — AI Question Generation

**Open:** Claude Code
**Prompt:**
```
Read CLAUDE.md. Build the AI-generated challenge system:

1. src/lib/gemini/edu.ts — Export a function generateChallenge(subject, ageTier, difficulty) that:
   - Checks the rate limiter first
   - Calls Gemini Flash with a prompt to generate a single question in our JSON format
   - Saves the generated question to edu_challenges for future reuse
   - Returns the question
   - Falls back to a random question from the existing database on any failure

2. src/app/api/edu/generate/route.ts — POST endpoint wrapping the above. Player-accessible, rate-limited to 20 calls per player per day (track in a simple counter).

3. Add a "✨ Generate Fresh Challenge" button in each game's completion screen that calls this API to get one AI-generated bonus question worth extra XP.
```

---

## Step 5.5 — Commit Phase 5

**Open:** Claude Code
**Prompt:**
```
Commit with message "Phase 5 complete: all 6 educational games, AI question generation, 600+ seeded questions" and push.
```

---

# ============================================================
# PHASE 6: STORY ENGINE & BOSS BATTLES (Days 31-38)
# ============================================================

## Step 6.1 — Story Display

**Open:** Claude Code
**Prompt:**
```
Read CLAUDE.md and LORE_CODEX.md. Build the story page at src/app/play/story/page.tsx:

Style as a pixel art illuminated manuscript:
- Parchment/scroll background texture (can be CSS gradient — tan/cream background with darker edges)
- Chapter titles in pixel font
- Body text in a readable serif or sans-serif font at comfortable reading size
- Each chapter is a separate "page" with scroll-snap behavior
- Show the boss sprite (BossSprite component) as an illustration between the boss-related paragraphs

For locked chapters: show a darkened/grayed scroll icon with text: "Defeat [boss name] to unlock this chapter."

Load all story_chapters for this household, ordered by week_number and chapter_number. Show the player's contribution_xp from story_progress for each chapter.
```

---

## Step 6.2 — Boss Battle Page

**Open:** Claude Code
**Prompt:**
```
Read CLAUDE.md. Build the boss battle page at src/app/play/boss/page.tsx:

This is the showpiece screen. Layout:

CENTER: Large BossSprite component (the current week's boss at 4x scale with particles)
BELOW BOSS: BossHPBar component showing current/max HP
BELOW HP BAR: Boss name and description text
FLANKING THE BOSS (or below on mobile): All household players' AvatarPreview sprites at 2x scale, arranged dynamically based on player count (1 player centered below boss, 2 flanking, 3+ in a row)

"BATTLE LOG" section at the bottom:
- Scrollable list of recent damage events: "[Player Name] dealt 35 damage by completing [quest name]!"
- Pull from chore_completions and edu_completions for this week, joined with the chore/challenge titles
- Most recent at top

Use Supabase Realtime subscription on story_chapters (boss_current_hp field) so the HP bar updates live when any household member completes a task.

When boss_current_hp reaches 0: trigger the BossSprite defeat animation, show a VICTORY overlay with pixel fireworks, display bonus XP/gold earned, and a "Read the Next Chapter" button linking to /play/story.
```

---

## Step 6.3 — Story Generation API

**Open:** Claude Code
**Give it:** The AI Story Generation Prompt Template from LORE_CODEX.md
**Prompt:**
```
Read CLAUDE.md and the AI Story Generation Prompt Template in LORE_CODEX.md. Build the story generation system:

1. src/lib/gemini/story.ts — Export a function generateStoryChapter(householdId) that:
   - Loads the household's players (names, classes, levels)
   - Loads recent chore_completions and edu_completions for this week
   - Loads the current boss data from bosses.json by week number
   - Loads the previous chapter summary
   - Loads the world summary from world.json (abbreviated to save tokens)
   - Constructs the prompt from the LORE_CODEX.md template
   - Calls Gemini Flash
   - Returns the generated chapter text and title
   - Falls back to a generic template filled with player names on failure

2. src/app/api/story/generate/route.ts — POST endpoint. GM-only. Calls the above and returns the result.

3. src/app/dashboard/story/page.tsx — GM story management page:
   - "Generate Next Chapter" button that calls the API
   - Shows the generated chapter in an editable text area so the GM can review and tweak
   - "Publish" button that saves it to story_chapters
   - List of all published chapters for this household
   - Current boss status (name, HP, week number)
```

---

## Step 6.4 — Seed Initial Story

**Open:** Claude Code
**Prompt:**
```
Read CLAUDE.md and the chapter scaffolds in src/lore/chapters.json and boss data in src/lore/bosses.json.

Create a Supabase database function or API endpoint that, when a new household is created, automatically seeds their first 4 story chapters and boss encounters.

Specifically, when a household row is inserted:
1. Create story_chapters rows for weeks 1-4 using the boss data from bosses.json and the chapter scaffolds from chapters.json
2. The first chapter (week 0, "The Choosing") should be immediately unlocked
3. Week 1's boss should be active with its HP set

Add a trigger or call this from the signup flow after household creation.

Also, make the chapter scaffold text personalized — use the players' names and classes. Since players might not exist yet when the household is created, the story generation for chapters 1+ should happen on-demand when the GM requests it.
```

---

## Step 6.5 — Weekly Boss Spawning Logic

**Open:** Claude Code
**Prompt:**
```
Read CLAUDE.md. Build the weekly boss transition system:

When a boss is defeated (boss_current_hp <= 0):
1. Mark the current chapter as completed
2. Unlock the next chapter
3. Look up the next week's boss from bosses.json
4. Count the number of active players in the household
5. Scale the boss HP using the formula: actual_hp = base_hp × (0.5 + (0.5 × player_count)). This keeps per-player effort consistent whether a household has 1 kid or 5.
6. Create a new story_chapters row with that boss's data (name, description, scaled HP, sprite_config)
7. Set it as the active boss for the household

Create a utility function advanceToNextBoss(householdId) in src/lib/boss.ts that handles this.

Also create a weekly cleanup function (can be called from a Supabase Edge Function or a Next.js cron API route) that:
- Resets daily chore completions
- Checks for bosses that weren't defeated — carry them over with remaining HP
- Resets weekly chores on Monday

For now, just build it as an API route at /api/cron/weekly-reset that we can call manually or wire up to a cron later.
```

---

## Step 6.6 — Commit Phase 6

**Open:** Claude Code
**Prompt:**
```
Commit with message "Phase 6 complete: story engine, boss battles, Gemini story generation, weekly progression" and push.
```

---

# ============================================================
# PHASE 7: POLISH (Days 39-44)
# ============================================================

## Step 7.1 — Celebration Animations

**Open:** Claude Code
**Prompt:**
```
Read CLAUDE.md. Add celebration animations throughout the app:

1. XP Gain: When XP is awarded, show a floating "+25 XP" in pixel font that rises and fades out. Gold shows a "+5 Gold" with a coin icon.

2. Level Up: Full-screen overlay with dark background, the player's embershard evolving (glow + scale pulse), "LEVEL UP!" in pixel font, new level number, and the new embershard state name. Auto-dismisses after 4 seconds or on tap.

3. Boss Damage: When viewing the boss page and damage occurs (via Realtime), brief screen shake + red flash on the boss sprite.

4. Boss Defeat: Boss dissolve particle animation (already built in BossSprite), then a treasure chest drops in, opens with sparkle, shows bonus rewards.

5. Perfect Edu Score: Shooting pixel stars, "FLAWLESS" text, bonus XP counter animating up.

6. Loot Purchase: Pixel chest appears, opens, item icon revealed with glow burst.

Use CSS keyframe animations only — no heavy animation libraries. Create a shared src/components/ui/CelebrationOverlay.tsx that can be triggered from anywhere.
```

---

## Step 7.2 — Notification System

**Open:** Claude Code
**Prompt:**
```
Read CLAUDE.md. Build an in-app notification system:

1. src/components/ui/NotificationToast.tsx — A pixel art toast notification that slides in from the top. Shows an icon, message text, and auto-dismisses after 5 seconds. Types: quest_verified, level_up, boss_damaged, boss_defeated, new_quest, purchase_redeemed.

2. Create a notification context provider that queues and displays toasts.

3. Wire up notifications to these events:
   - Player loads /play and has newly verified chores → show "Quest verified!" toast for each
   - Boss HP changes via Realtime → show damage toast
   - Boss defeated → show special defeat toast
   - New chore assigned → show "New quest!" toast on next load

4. GM notifications on the dashboard:
   - New pending verifications
   - Boss HP milestones (50%, 25%)
   - Player level-ups
```

---

## Step 7.3 — Responsive Audit

**Open:** Claude Code
**Prompt:**
```
Test every page in the app at these screen widths and fix any layout issues:
- 375px (iPhone SE — older son's phone)
- 414px (iPhone Plus — larger phones)
- 768px (iPad — younger son's tablet)
- 1024px (small desktop)
- 1280px (standard desktop — parent)

Specific things to check and fix:
- All touch targets are at least 48×48px on mobile/tablet
- Pixel art scales at integer multiples (2x, 3x, 4x — never 2.5x)
- No horizontal scrolling on any viewport
- Text is readable (not too small on phone, not too large on desktop)
- The bottom tab bar on /play doesn't overlap content
- The character creator works well on tablet (side-by-side on tablet, stacked on phone)
- Educational games are fully playable on a tablet touch screen
- The GM dashboard sidebar collapses to hamburger on mobile

Fix any issues you find.
```

---

## Step 7.4 — PWA Setup

**Open:** Claude Code
**Prompt:**
```
Convert the app to a Progressive Web App:

1. Create public/manifest.json with: app name "Quest Forge", short name "QuestForge", theme color matching our dark purple, background color matching our dark background, display: standalone, icons at 192×192 and 512×512 (use a simple pixel art ember/flame icon — can be generated as an SVG converted to PNG).

2. Add the manifest link to the root layout <head>.

3. Create a basic service worker that caches: sprite assets, the app shell, and the fonts. Story pages and game data should be network-first with cache fallback.

4. Add a meta viewport tag and apple-mobile-web-app-capable meta tags for iOS.

The goal is that the younger son can tap "Add to Home Screen" on his tablet and get a full-screen app experience without the browser chrome.
```

---

## Step 7.5 — Landing Page

**Open:** Claude Code
**Prompt:**
```
Read CLAUDE.md. Build a marketing landing page at src/app/page.tsx for unauthenticated visitors:

Hero section: "Quest Forge: The Emberlight Chronicles" in pixel font, tagline "Turn chores into quests. Turn learning into adventure.", pixel art hero illustration (can be a composed scene from our sprites), and a "Create Your Hearthhold" signup CTA button.

How It Works section (3 columns):
1. "Parents assign quests" — pixel art scroll icon
2. "Kids complete and learn" — pixel art sword + book icon
3. "The story unfolds" — pixel art boss icon

Features section: cooperative boss battles, 6 educational games, 52 weeks of story, character customization

Bottom CTA: "Start Your Family's Adventure" → /signup

If the visitor IS authenticated, redirect to /dashboard (GM) or /play (player) instead of showing the landing page.

Style with the pixel art theme but keep it clean and readable. This page should convince a parent that this app is worth trying.
```

---

## Step 7.6 — Error Handling

**Open:** Claude Code
**Prompt:**
```
Add error handling throughout the app:

1. Create pixel art themed error boundary components:
   - src/app/error.tsx — Global error page with "The Hollow consumed this page..." message, a pixel art broken sword icon, and a "Return to Safety" button
   - src/app/not-found.tsx — 404 page with "You've wandered into the Ashlands..." message
   - Add error.tsx to /dashboard and /play route segments too

2. Add loading skeletons to every page:
   - src/app/loading.tsx — Global loading with a pulsing pixel art embershard
   - Skeleton components for: player cards, quest cards, loot cards, story pages
   - The loading states should feel on-theme (flickering torches, pulsing ember)

3. Handle Gemini API failures gracefully everywhere — no user-facing errors, just silent fallback to pre-written content.

4. Handle Supabase errors with user-friendly pixel art toast messages ("The connection to Hearthhold was lost. Trying again...").
```

---

## Step 7.7 — Commit Phase 7

**Open:** Claude Code
**Prompt:**
```
Commit with message "Phase 7 complete: animations, notifications, responsive fixes, PWA, landing page, error handling" and push.
```

---

# ============================================================
# PHASE 8: DEPLOY & LAUNCH (Days 45-48)
# ============================================================

## Step 8.1 — GitHub Actions CI

**Open:** Claude Code
**Prompt:**
```
Create a GitHub Actions workflow at .github/workflows/ci.yml that runs on every push and pull request:
1. Install dependencies
2. Run lint (next lint)
3. Run TypeScript type checking (tsc --noEmit)
4. Run build (next build)

If any step fails, the workflow fails. Use Node.js 20.
```

---

## Step 8.2 — Deploy to Vercel

**Open:** Your browser
**Do:**
1. Go to https://vercel.com/new
2. Import your `quest-forge` GitHub repository
3. Vercel should auto-detect it's a Next.js project
4. Before deploying, add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL` → your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → your anon key
   - `SUPABASE_SERVICE_ROLE_KEY` → your service role key
   - `GEMINI_API_KEY` → your Gemini API key
5. Click Deploy
6. Wait for the build to complete (~2-3 minutes)

**Check:** Visit the URL Vercel gives you. You should see the landing page. Try signing up, creating child accounts, and logging in as a child.

---

## Step 8.3 — Set Up Your Family

**Do yourself (no AI needed):**

1. Go to your deployed app URL
2. Sign up as the Game Master (you)
3. From /dashboard/players, create accounts for your kids
4. Log in as each son on their device, go through character creation
5. From /dashboard/chores, create 5-10 initial chores with flavor text
6. From /dashboard/loot, create 5-10 loot store items (the real-world rewards you want to offer)
7. From /dashboard/story, publish the first story chapter (or generate one with AI)
8. On each kid's device: tap "Add to Home Screen" to install the PWA

---

## Step 8.4 — Weekly Cron Job (Optional)

**Open:** Perplexity
**Prompt:**
```
How do I set up a cron job on Vercel to call an API route once a week at midnight on Monday? I have a Next.js app deployed on Vercel.
```
Use the answer to configure automatic weekly resets. Alternatively, just call `/api/cron/weekly-reset` manually each Monday from your browser.

---

# ============================================================
# ONGOING: WEEKLY GAME MASTER ROUTINE
# ============================================================

Every week (takes ~10-15 minutes):

1. **Approve chore completions** — Open /dashboard, approve pending quests
2. **Generate the week's story** — Go to /dashboard/story, click "Generate Next Chapter", review/edit, publish
3. **Check boss status** — Is it on track to be defeated? If the kids are struggling, consider adding bonus XP chores
4. **Adjust loot store** — Add new items, rotate out claimed ones

---

# ============================================================
# AI TOOL REFERENCE CHEAT SHEET
# ============================================================

| Task | Which AI | Why |
|------|----------|-----|
| Writing code, building features | **Claude Code** | It reads CLAUDE.md and generates code directly in your project |
| Generating seed data (600 questions) | **Claude Pro** (web chat) | Large text generation, copy output to files |
| Planning, brainstorming, design decisions | **Claude Pro** (web chat) | Conversational back-and-forth |
| Debugging errors | **Claude Code** | Paste the error, it fixes the file |
| Researching tools/services you don't know | **Perplexity** | It searches the web and gives current docs |
| Second opinion on approach | **Gemini** (web chat) | Compare its answer to Claude's |
| In-app AI (story, questions, flavor text) | **Gemini Flash API** | 1,500 free requests/day |
| Art asset research | **Perplexity** | "Find free CC0 pixel art monster sprites" |

### What Files To Give Claude Code Each Session

When you start a new Claude Code session, it doesn't remember previous ones. Always start with:

```
Read CLAUDE.md in the project root before doing anything else.
```

You do NOT need to give it all the other docs — CLAUDE.md has everything Claude Code needs. The other docs (LORE_CODEX, GAME_DESIGN_DOC, ART_PIPELINE, PROJECT_PLAN) are for YOUR reference and for Claude Pro conversations about design.

### When Things Go Wrong

| Problem | Solution |
|---------|----------|
| Build fails | Tell Claude Code: "npm run build fails with this error: [paste error]. Fix it." |
| Page looks broken | Tell Claude Code: "The [page] looks broken on [phone/tablet/desktop]. [Describe what's wrong]. Fix the responsive layout." |
| Supabase query returns empty | Tell Claude Code: "This query returns no results but there is data in the table. Check the RLS policies." |
| Gemini API errors | Tell Claude Code: "The Gemini API call in [file] is failing with: [error]. Make sure the fallback content serves correctly when the API is down." |
| Sprites not rendering | Tell Claude Code: "The avatar/boss sprite is showing blank. Check that the PNG paths in the manifest match the actual file locations and that the Canvas is drawing correctly." |
| Can't log in as child | Tell Claude Code: "Child login with username [X] isn't working. Check the internal email mapping logic and the Supabase Auth configuration." |
