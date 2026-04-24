# Quest Forge: The Emberlight Chronicles

A multi-tenant fantasy RPG chore-tracking and educational app for families. Parents create households and add children as players. Completing real-world chores and educational challenges earns XP, advances a persistent narrative, and unlocks rewards from a loot store.

See `CLAUDE.md` for full architecture documentation.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL + Auth + RLS)
- **AI Engine:** OpenRouter (free tier) with Gemini fallback
- **Art:** Pixel art sprites (LPC-compatible)

## Features

- **Multi-tenant households** — complete data isolation between families via Row-Level Security
- **Player accounts** — children log in with username (no email required)
- **Chore quests** — real-world tasks wrapped in fantasy flavor text
- **Educational mini-games** — Math Arena, Word Forge, Science Labyrinth
- **Cooperative boss battles** — household members fight together weekly
- **Loot store** — spend gold on rewards redeemable IRL
- **Pixel art avatars** — LPC sprite compositing with character creator
- **AI-generated content** — story chapters and quest flavor text via Gemini/OpenRouter
- **Audio system** — Howler-based BGM with crossfade, SFX, and mute toggle

## Setup for New Developers

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
OPENROUTER_API_KEY=<openrouter-key>
GEMINI_API_KEY=<gemini-key>  # Optional fallback
NEXT_PUBLIC_SPRITE_BASE_URL=https://<project-id>.supabase.co/storage/v1/object/public/sprites
# Audio assets are served from the same bucket:
#   NEXT_PUBLIC_SPRITE_BASE_URL + '/audio/[track].mp3'
```

### 3. Upload sprite assets

Sprite PNGs are not committed to Git. Run this once to upload local sprites to Supabase Storage:

```bash
npx tsx scripts/upload-sprites.ts
```

### 4. Push database migrations

```bash
npx supabase db push
```

### 5. Seed the database

```bash
npx supabase db seed
```

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # TypeScript compiler check
```

## Project Structure

```
src/
├── app/
│   ├── login/, signup/     # Auth pages
│   ├── dashboard/          # GM (parent) dashboard
│   ├── play/               # Player (child) experience
│   │   ├── quests/         # Chore quests
│   │   ├── academy/        # Educational games
│   │   └── loot/          # Loot store
│   └── api/               # API routes
├── components/
│   ├── avatar/            # SpriteCanvas, CharacterCreator
│   ├── games/             # MathArena, WordForge, ScienceLabyrinth
│   └── boss/             # BossSprite, BossHPBar
├── lib/
│   ├── supabase/          # Client, server, admin clients
│   ├── gemini/            # AI integration with rate limiting
│   └── sprites/           # Compositor, palette, particles
└── hooks/                  # usePlayer, useHousehold, useBoss
```

## Recent Updates

- **Audio system** — Howler-based BGM with crossfade, SFX, and mute toggle in nav shells
- **Science Labyrinth** — dungeon-crawler game where players navigate corridors and answer science questions
- **Word Forge** — smithy-themed vocab game with heat animations and anvil feedback
- **Avatar system** — LPC sprite compositing with walk animation and proper body offsets
- **OpenRouter integration** — free-tier AI with Gemini fallback for story generation

## Deploy on Vercel

```bash
npx vercel
```

See `CLAUDE.md` for detailed deployment instructions.