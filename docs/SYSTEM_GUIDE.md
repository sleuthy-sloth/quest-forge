# System Guide: AI & Engine Architecture

## Story Engine
The Quest Forge Story Engine uses **Google Gemini Pro** to generate immersive, personalized narratives.

### Core Prompts
- **Quest Flavor**: Transforms mundane chore titles into heroic tasks.
  - *Input*: "Clean the kitchen"
  - *Output*: "The Great Scouring of the Granite Hall"
- **Chapter Narrative**: Generates weekly story updates based on household progress.
  - *Context*: Player names, classes, completed quests, boss status.
- **Victory Chronicles**: Celebrates the defeat of a boss with a cinematic epilogue.

### AI Implementation Details
- **Location**: `src/app/api/story/`
- **Rate Limiting**: Implemented via a usage tracker in the `api_usage` table.
- **Fallbacks**: If the AI key is missing or quota is exceeded, the system falls back to pre-defined "Ancient Scroll" templates.

## Database & RLS
- **Supabase**: Used for data persistence and authentication.
- **Row-Level Security (RLS)**: Crucial for household isolation.
- **Schema**:
  - `profiles`: Core user data and stats.
  - `chores`: Quest definitions and assignments.
  - `story_chapters`: Narrative segments and boss state.
  - `edu_completions`: Academic performance tracking.

## Procedural Bosses
Bosses are rendered using dynamic React SVG components (`src/components/boss/BossSprite.tsx`).
- **Palettes**: Themes based on the current Story Arc (e.g., `blight_hollow`, `frost_hollow`).
- **Scaling**: Boss HP and damage are calculated dynamically based on the number of active players in the household.
