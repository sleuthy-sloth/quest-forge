# Quest Forge: The Emberlight Chronicles

A fantasy RPG adventure where real-world chores become heroic quests, and educational challenges unlock epic story chapters. Designed for families with children ages 6-16.

## How It Works

**Parents** act as Game Masters — creating chores, managing rewards, and guiding the household's epic adventure. **Kids** are players — completing quests, battling bosses, and earning treasure.

---

## For Parents (Game Master Dashboard)

### Household Management
- Create your family household and invite players
- Add unlimited child accounts with simple username/password login (no email required for kids)
- View each player's progress, XP, gold, and completed quests

### Quest Creation
- Create chores with custom titles, descriptions, and rewards
- Assign quests to specific children or the whole household
- Set recurrence: one-time, daily, or weekly tasks
- Choose difficulty levels: Easy, Medium, Hard, or Epic (higher difficulty = higher rewards)
- AI-enhanced flavor text automatically transforms "clean your room" into an epic heroic task

### Loot Store
- Create custom rewards with gold and XP costs
- Categorize rewards: real-world prizes (ice cream outing, extra screen time), cosmetics, power-ups, and story unlocks
- Track redemption status for physical rewards
- Set your own prize values — you're in control of what rewards cost

### Boss Battles & Story
- Launch weekly boss battles that scale to your household size
- All players fight the same boss — encouraging family cooperation
- Bosses carry over week-to-week until defeated
- Unlock new story chapters when bosses fall
- AI-generated narrative featuring your family's player names and classes

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

**Math Arena**
- Timed math challenges at three difficulty levels
- Earn XP based on accuracy and speed
- Covers addition, subtraction, multiplication, and division

**Word Forge**
- Vocabulary-building smithy game
- Match words to definitions with heat-based feedback
- Progressive difficulty across rounds

**Science Labyrinth**
- Dungeon-crawler adventure with science questions
- Navigate corridors, battle enemies, collect power-ups
- Topics: life science, earth science, and physical science

**History Scroll**
- Ancient scroll-themed reading comprehension challenges
- Read passages and answer questions
- Unlock new scrolls as you progress

**Vocab Duel**
- Turn-based vocabulary battles
- Defeat opponents by demonstrating word knowledge
- Earn gold for victories

**Logic Gate**
- Puzzle challenges using circuits and switches
- Solve logic problems through interactive gameplay
- Earn bonus XP for quick solutions

### Boss Battles
- Fight weekly bosses with your entire household
- Every completed quest and educational challenge deals damage
- Watch the boss HP bar drop as your family works together
- Defeat bosses to unlock new story chapters and bonus rewards

### Story Mode
- Read your family's personalized adventure chapters
- Characters are referenced by name and class title
- Unlock new chapters by completing quests and defeating bosses
- Chapters adapt to your household size and player count

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
- Level up as you accumulate XP (higher levels require more experience)
- Dual tracking: total XP (for leveling) and available XP (spendable in store)

### Gold
- Earned alongside XP from completed tasks
- Used to purchase items in the loot store
- Bonus gold awarded for educational game victories

### Cooperative Combat
- Boss HP scales with household size (solo players and large families both have engaging battles)
- All players contribute to the same boss — teamwork matters
- Undefeated bosses persist week-to-week with remaining HP

### AI-Enhanced Narrative
- Story chapters feature your family's player names, classes, and accomplishments
- Quest flavor text transforms mundane tasks into heroic adventures
- Fresh educational questions generated on-demand

---

## Pixel Art & Design

- Character avatars built from layered LPC-compatible sprite sheets
- Customizable body, hair, eyes, clothing, and equipment
- Animated boss sprites with particle effects
- All pixel art rendered with crisp integer scaling (`image-rendering: pixelated`)

---

## Household Privacy

Every family's data is completely isolated. Row-Level Security ensures you only see your own household's quests, players, and progress. Your family's story stays private.
---

## Technical Stack

- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Styling**: Vanilla CSS (Thematic Design System)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **AI**: [Google Gemini Pro](https://ai.google.dev/) (via Vercel AI SDK)
- **State Management**: React Context + Server Actions
- **Deployment**: [Vercel](https://vercel.com/)

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY`
4. Run migrations: `npx supabase db push`
5. Start development server: `npm run dev`
