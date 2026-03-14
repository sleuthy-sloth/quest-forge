# Quest Forge: The Emberlight Chronicles — Game Design Document

---

## I. Multi-Tenant Household System

### How Households Work
- A **household** is the fundamental unit of the app. One parent (GM), one or more children (players).
- Every piece of game data (chores, loot store, story chapters, boss progress) is scoped to a household.
- Households are completely isolated from each other. Family A cannot see Family B's data.
- Each household has its own story timeline, boss progression, and loot store.
- Educational challenges are the only shared resource — the question bank is global.

### Account Structure
```
Household: "The Smith Family"
├── Parent (GM): sarah@email.com — email/password login
├── Player 1: "DragonKid" — username/password login (age: 9)
└── Player 2: "ShadowBlade" — username/password login (age: 15)
```

### Child Account Safety
- Children log in with a **username and password only** — no email required
- Internally, Supabase Auth receives a generated email (`username@household-uuid.questforge.local`) — kids never see this
- Parents can reset child passwords from the GM dashboard
- Children cannot change their own age, household, or role
- No social features, no cross-household communication, no friend systems

---

## II. XP & Leveling Economy

### XP Sources

| Source | XP Range | Notes |
|--------|----------|-------|
| Easy chore | 10-25 XP | ~5 min tasks: make bed, put away dishes |
| Medium chore | 25-50 XP | ~15 min tasks: vacuum, take out trash |
| Hard chore | 50-100 XP | ~30 min tasks: mow lawn, clean bathroom |
| Epic chore | 100-200 XP | 1+ hour tasks: deep clean, organize garage |
| Edu-challenge (passed) | 20-75 XP | Scales with difficulty (1-5) |
| Edu-challenge (perfect) | +25% bonus | Multiplier on base XP |
| Boss defeat bonus | 50-150 XP | Split by contribution percentage |
| Weekly streak | 25 XP | At least 1 chore every day for 7 days |

### Level Thresholds (Total Lifetime XP)

| Level | Total XP | Embershard State |
|-------|----------|-----------------|
| 1 | 0 | Dim Ember |
| 2 | 100 | |
| 3 | 250 | |
| 5 | 700 | |
| 6 | 1,000 | Steady Flame |
| 10 | 2,700 | |
| 11 | 3,300 | Bright Blaze |
| 16 | 6,800 | Radiant Core |
| 21 | 11,600 | Emberstorm |
| 26 | 17,600 | Living Light |
| 31 | 24,900 | Hearthfire |

**Formula:** Level N requires `50 × N × (N + 1) / 2` total XP.

### Dual XP Tracking
- **xp_total**: Only goes up. Used for leveling.
- **xp_available**: Spendable in loot store. Goes up on earn, down on spend.
- Spending NEVER costs levels.

### Gold Economy
- Secondary currency for premium loot items
- Earned from hard/epic chores and boss defeats
- Typical: 5-20 gold per qualifying task

---

## III. Boss Battle Mechanics

### How Damage Works
- Boss HP is a shared pool — all players in the household fight cooperatively
- Every XP earned (from approved chores or edu-challenges) deals equal "damage"
- Boss HP decreases in real-time via Supabase Realtime updates
- No separate combat system — real-world actions ARE the combat

### Boss HP Scaling

Base HP values per week range (from bosses.json):

| Weeks | Base HP | Notes |
|-------|---------|-------|
| 1-4 | 300-500 | Introductory — achievable with moderate effort |
| 5-12 | 450-700 | Standard — requires daily engagement |
| 13-24 | 550-800 | Challenging — edu-challenges helpful |
| 25-36 | 650-900 | Hard — all players must be active |
| 37-48 | 750-1000 | Expert — daily effort from all players |
| 49-52 | 1000-1500 | Final arc — culmination |

**Player Count Scaling:**
Actual boss HP adjusts to household size so the per-player effort stays consistent:

```
actual_hp = base_hp × (0.5 + (0.5 × player_count))
```

| Players | Multiplier | Week 1 (base 300) | Week 12 (base 700) |
|---------|-----------|-------------------|---------------------|
| 1 | 1.0× | 300 | 700 |
| 2 | 1.5× | 450 | 1,050 |
| 3 | 2.0× | 600 | 1,400 |
| 4 | 2.5× | 750 | 1,750 |
| 5 | 3.0× | 900 | 2,100 |

A solo player has a slightly easier path (1.0× instead of the 1.5× that two players share) because they have no one else to rely on.

### Boss Carry-Over
If not defeated by Sunday midnight, the boss carries over. The story acknowledges this. No punishment — just continued challenge.

### Boss Visuals
Each boss uses the pixel art sprite system:
- Base monster sprite (from OpenGameArt library)
- Programmatic palette swap for color theming
- 2x-4x scale rendering
- CSS particle overlays (embers, shadows, glow)
- Decorative frame matching difficulty tier
- Damage animation: screen shake + sprite flash
- Defeat animation: sprite dissolves into particles, treasure chest appears

---

## IV. Chore System Design

### Recurrence Types
- **Once**: One-time task, disappears after completion
- **Daily**: Resets at midnight (household timezone)
- **Weekly**: Resets every Monday at midnight

### Quest Flavor Text
AI-generated via Gemini Flash, or selected from pre-written templates.

| Real Chore | Fantasy Wrapper |
|-----------|----------------|
| Make your bed | "Restore order to your quarters before the morning patrol." |
| Take out the trash | "The Refuse Wraiths gather at the fortress gates. Haul their vessels to the Outer Boundary." |
| Do the dishes | "The Alchemist's lab is in disarray. Scrub the vessels before residue becomes toxic." |
| Vacuum | "The Dustveils have infiltrated the great hall. Deploy the Suction Engine." |
| Read for 30 min | "Spend time in the Archive absorbing ancient knowledge." |
| Homework | "Professor Ignis requires your scholarly attention." |
| Walk the dog | "Take your beast-companion on a perimeter sweep." |
| Clean your room | "Commander Maren expects every Emberbearer's quarters battle-ready." |
| Mow the lawn | "The Dustmere encroaches. Cut back the wild growth." |
| Practice instrument | "Your instrument carries Emberlight in its sound. The realm needs your music." |

When Gemini API is available, it generates custom flavor text. When rate-limited, the system falls back to these templates (matched by keyword analysis of the chore title).

### GM Approval Workflow
1. Player taps "Quest Complete"
2. Status → "Awaiting Verification" (amber pixel badge)
3. GM sees notification in approval queue
4. Approve → XP/gold awarded, boss damage dealt, celebration triggered
5. Reject → Note sent to player ("Quest not completed to standard. Try again, Emberbearer.")
6. Batch approve: GM can approve multiple at once for efficiency

---

## V. Educational Game Specifications

### General Rules
- 10 questions per session (~5-10 minutes)
- XP by accuracy: 100% = full XP, 80%+ = 80%, 60%+ = 50%, below 60% = 10 XP
- Wrong answers show correct answer + brief explanation
- Replay diminishing returns: 100% XP first play, 50% second, 25% third (same day)
- Age tier determined by player's `age` field: 6-10 = junior, 11-16 = senior

### Math Arena (pixel art battle theme)

**Junior (6-10):** Multiplication tables (up to 12×12), division with remainders, simple fractions, word problems, money/time.

**Senior (11-16):** Solving for X, PEMDAS with nesting, percentages/ratios, area/perimeter, basic probability, functions, exponents.

### Word Forge (blacksmith forge theme)

**Junior:** 4th-5th grade vocab, definition matching, fill-in-blank with word bank, synonyms/antonyms.

**Senior:** SAT-level vocab, analogies, etymology, context clues, commonly confused words.

### Science Labyrinth (maze navigation theme)

**Junior:** States of matter, life cycles, solar system, simple machines, weather, human body.

**Senior:** Periodic table, Newton's laws, chemical reactions, cell biology, genetics, ecology.

### History Scroll (timeline theme)

**Junior:** Ancient civilizations, famous explorers, timeline ordering, inventions.

**Senior:** Cause/effect in major events, primary sources, WWI/WWII, civil rights, government structures.

### Logic Gate (circuit/puzzle theme)

**Junior:** Number sequences, patterns, simple Sudoku, if-then logic, spatial reasoning.

**Senior:** Logic grid puzzles, syllogisms, pseudocode, probability puzzles, Boolean logic.

### AI-Generated Challenges (Gemini Flash)
- Endpoint: `/api/edu/generate`
- Input: subject, age_tier, difficulty (1-5)
- Output: JSON with question, type, options, correct_answer, explanation, xp_value
- Rate limit: 20 AI-generated per player per day
- All generated questions cached in `edu_challenges` table for reuse
- Fallback: 600+ seeded questions (50/subject/tier) when API unavailable

---

## VI. Pixel Art Character Customization

### Paper-Doll System (LPC)
Players build their avatar by selecting layered sprite components:

**Customization Options:**
- Skin tone (4-6 options)
- Eye color (6 options, via palette tint)
- Hair style (10-20 styles)
- Hair color (8 options: blonde, brown, black, red, white, gray, blue, green)
- Clothing top (5-8 options, themed to classes)
- Clothing bottom (4-6 options)
- Boots (3-5 options)
- Weapon (5-8 options)
- Cape/accessory (optional, 4-6 options)
- Helmet/head gear (optional, 4-6 options)

**Total combinations:** Even conservatively, 5 × 6 × 15 × 8 × 6 × 5 × 4 × 6 = **2.6 million** unique looks. More than enough to feel personal.

### Class-Themed Starter Outfits
When a player picks their narrative class, they're offered a matching default outfit:
- **Blazewarden:** Plate armor, longsword, red cape
- **Lorescribe:** Blue robe, staff, no cape
- **Shadowstep:** Dark leather, dagger, hood
- **Hearthkeeper:** Light armor, lantern (shield slot), gold cape
- **Stormcaller:** Green tunic, drum (weapon slot), no helmet
- **Ironvow:** Heavy armor, sword and shield, iron helmet

Players can change any piece — the defaults are just a starting point.

### Avatar Display Contexts
- **Profile/Character Sheet:** Full 64×64 sprite at 4x scale (256×256 rendered), idle animation
- **Player Home Screen:** 3x scale, walk animation loop
- **Quest Board header:** 2x scale, static front-facing
- **GM Dashboard player cards:** 2x scale, static
- **Boss Battle page:** 2x scale, flanking the boss, attack animation on damage dealt
- **Story chapters:** Referenced by name and class (no inline sprite — keep story text-focused)

### Equipment Progression
As players level up and buy items from the loot store, they can unlock new sprite layers:
- **Cosmetic loot items** map directly to new sprite options (new hair colors, fancy armor, glowing weapons)
- Items in `inventory` with `sprite_layer` data override the corresponding avatar_config layer when equipped
- This creates a visible progression: Level 1 characters in basic clothing → Level 20+ in shining armor

---

## VII. Loot Store Design

### Item Categories

**Real Rewards** — The main draw. IRL rewards defined by the parent.
- 30 min extra screen time (100 XP)
- Choose dinner one night (150 XP)
- Stay up 30 min late (200 XP)
- Movie night pick (250 XP)
- $5 to spend (500 XP)
- Skip one chore (300 XP)
- Friend sleepover (1000 XP)
- Special outing (750 XP)

**Cosmetics** — New avatar sprite parts.
- New hair colors (50 XP)
- Character titles ("Dragonslayer," "Loremaster") (75 XP)
- Glowing weapon effects (150 XP — CSS glow on weapon layer)
- Rare armor sets (200 XP)
- Embershard visual trails (200 XP)

**Power-Ups** — Temporary gameplay bonuses.
- XP Boost: +25% for 24 hours (100 XP)
- Gold Rush: double gold for 24 hours (150 XP)
- Boss Bane: next task deals 2× boss damage (200 XP)
- Scholar's Focus: next edu-score boosted one tier (100 XP)

**Story Unlocks** — Bonus lore.
- NPC backstory entries (50 gold)
- Region map illustrations (75 gold)
- The Chronicler's hidden notes (100 gold)

### Pricing Philosophy
- Cheapest real reward: 2-3 days of solid effort
- Most expensive: 2-3 weeks of sustained effort
- GM adjusts prices anytime
- Cosmetics cheap enough to feel like regular treats
- Power-ups worth it but not necessary

### Per-Household Store
Each family has their own loot store. The parent decides what real-world rewards are available and at what prices. A family with older kids might price things differently than one with younger kids. The GM has total control.

---

## VIII. Notification System

### Player Notifications (In-App, pixel art message scroll)
- "New quest from the Game Master!"
- "Quest verified! +{XP} XP, +{Gold} gold" (with floating pixel numbers)
- "A new threat emerges in Embervale..." (weekly boss spawn)
- "The {boss} falls! A new chapter awaits." (boss defeated)
- "New wares at the Emporium!" (GM added loot)
- "Professor Ignis has new challenges." (new edu-content)
- "LEVEL UP! You are now Level {N}!" (with embershard evolution visual)

### GM Notifications
- "{Player} awaits quest verification" (chore submitted)
- "Boss HP at {percent}%" (progress milestone)
- "Weekly reset complete"
- "{Player} reached Level {N}!"
- "{Player} purchased {item}" (loot store activity)

### Celebration Moments (Pixel Art Animations)
- **Level up:** Full-screen flash, embershard sprite evolves, pixel fireworks, fanfare sound (if enabled)
- **Boss defeat:** Boss sprite dissolves into pixel particles, treasure chest drops, all player avatars do victory animation
- **Perfect edu-score:** Shooting stars, "FLAWLESS" in pixel font, bonus XP counter
- **Loot purchase:** Pixel treasure chest opens, item sprite revealed with glow
- **Weekly streak:** Flame trail circles the player's avatar, "7-DAY STREAK" badge

---

## IX. Safety & Privacy

- No third-party analytics or ad trackers
- No ads, ever
- All data in Supabase (parent controls their family's data)
- No cross-household social features
- No real emails for children
- Parent has full visibility over all child activity
- AI-generated content filtered through tone guidelines
- All loot store transactions are in-game currency only
- Parent can delete child accounts and household data from settings
- COPPA considerations: no data collection from children beyond gameplay data, parental consent is inherent in the parent-created account model

---

## X. Gemini Flash Integration Details

### Why Gemini Flash
- 1,500 free requests/day — no credit card needed
- Fast response time (~1-2 seconds) for edu-challenges
- Good at structured JSON output for question generation
- Adequate for short-form creative writing (story chapters)

### Daily Budget Allocation (1,500 requests)
- Story generation: ~50 (if 50 households generate 1 chapter each)
- Edu-challenge generation: ~1,000 (50 households × 2 kids × 10 questions avg)
- Flavor text: ~100 (across all households creating chores)
- Boss descriptions: ~50
- Buffer: ~300

### Scaling Beyond Free Tier
If the app grows past ~75 active households:
- Gemini Flash pay-as-you-go: $0.10 / 1M input tokens — extremely cheap
- Or increase pre-generated content to reduce API calls
- Or implement a question-sharing pool: once a question is generated for one household, it goes into the global `edu_challenges` table for all

### Fallback Strategy
The app MUST work without any AI:
- 600+ pre-seeded edu-challenges
- 50+ pre-written flavor text templates
- 52 pre-written boss descriptions (in bosses.json)
- 7 pre-written story chapter scaffolds (in chapters.json)
- Generic story templates that insert player names via string replacement

---

## XI. Future Expansion Ideas

1. **More Character Classes** — Add 2-3 new classes each season
2. **Player-Created Quests** — Older kids propose chores for GM approval
3. **Achievement System** — Pixel art badges for milestones
4. **Seasonal Events** — Ember Festival (December), The Long Dark (October)
5. **Voice Narration** — Text-to-speech for story chapters (younger readers)
6. **Mobile Push Notifications** — Via PWA
7. **Crafting System** — Combine loot items for enhanced versions
8. **Player Journal** — Kids write entries that AI incorporates into future chapters
9. **Multi-Household Bosses** — Optional community events where multiple families fight a shared world boss
10. **Companion Pets** — Small sprite companions that evolve with the player
