import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AvatarPreview from '@/components/avatar/AvatarPreview'

// ── Game catalog ──────────────────────────────────────────────────────────────

const GAMES = [
  {
    slug:    'math-arena',
    name:    'Math Arena',
    icon:    '⚔️',
    tagline: 'Test your numbers in battle',
    accent:  '#c43a00',
  },
  {
    slug:    'word-forge',
    name:    'Word Forge',
    icon:    '🔨',
    tagline: 'Forge words from molten letters',
    accent:  '#1a5c9e',
  },
  {
    slug:    'science-labyrinth',
    name:    'Science Labyrinth',
    icon:    '🧪',
    tagline: 'Navigate the maze of knowledge',
    accent:  '#1e8a4a',
  },
  {
    slug:    'history-scroll',
    name:    'History Scroll',
    icon:    '📜',
    tagline: 'Unravel the tales of ages past',
    accent:  '#9e6a1a',
  },
  {
    slug:    'vocab-duel',
    name:    'Vocab Duel',
    icon:    '📖',
    tagline: 'Master the language of power',
    accent:  '#7a1a9e',
  },
  {
    slug:    'logic-gate',
    name:    'Logic Gate',
    icon:    '⚡',
    tagline: 'Unlock the puzzles of the mind',
    accent:  '#1e8ab8',
  },
] as const

// ── Tier helpers ──────────────────────────────────────────────────────────────

type AgeTier = 'junior' | 'senior'

function deriveTier(age: number | null): AgeTier {
  return age != null && age >= 11 ? 'senior' : 'junior'
}

const XP_RANGE: Record<AgeTier, string> = {
  junior: '20–30 XP',
  senior: '30–50 XP',
}

const TIER_LABEL: Record<AgeTier, string> = {
  junior: '✦ JUNIOR',
  senior: '✦ SENIOR',
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AcademyPage() {
  const supabase = await createClient()
  // play/layout.tsx already redirects unauthenticated users — getUser() here
  // is only needed to obtain user.id for the profile query.
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_class, level, age, avatar_config')
    .eq('id', user!.id)
    .single()

  if (!profile) redirect('/login')

  const tier      = deriveTier(profile.age ?? null)
  const xpRange   = XP_RANGE[tier]
  const tierLabel = TIER_LABEL[tier]
  const level     = profile.level ?? 1
  const className = profile.avatar_class ?? 'Emberbearer'

  // Split games into two shelves of 3
  const shelf1 = GAMES.slice(0, 3)
  const shelf2 = GAMES.slice(3, 6)

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a0f1e 0%, #040812 100%)',
        paddingBottom: '32px',
      }}
    >
      {/* ── Page Header ── */}
      <div style={{ textAlign: 'center', padding: '28px 16px 20px' }}>
        <div
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '11px',
            color: '#c9a84c',
            letterSpacing: '3px',
            marginBottom: '8px',
            textShadow: '0 0 20px rgba(201,168,76,0.4)',
          }}
        >
          THE ACADEMY
        </div>
        <div
          style={{
            fontFamily: 'var(--font-heading)',
            fontStyle: 'italic',
            fontSize: '14px',
            color: '#7a6a44',
            letterSpacing: '1px',
          }}
        >
          ⟡ Wizard&rsquo;s Tower of Knowledge ⟡
        </div>
        {/* Decorative separator */}
        <div
          style={{
            margin: '14px auto 0',
            width: '180px',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)',
          }}
        />
      </div>

      <div className="px-4" style={{ maxWidth: '480px', margin: '0 auto' }}>

        {/* ── Hero Bar ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'linear-gradient(135deg, rgba(26,28,46,0.9), rgba(18,19,31,0.9))',
            border: '1px solid rgba(201,168,76,0.18)',
            borderRadius: '4px',
            padding: '10px 12px',
            marginBottom: '20px',
          }}
        >
          {/* Avatar */}
          <div style={{ flexShrink: 0 }}>
            <AvatarPreview avatarConfig={profile.avatar_config as Record<string, unknown> | null} size={48} />
          </div>

          {/* Name + class */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '8px',
                color: '#f0e6c8',
                marginBottom: '4px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {profile.display_name}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '12px',
                color: '#8a7a5a',
                textTransform: 'capitalize',
              }}
            >
              {className} · Lv {level}
            </div>
          </div>

          {/* Tier badge */}
          <div
            style={{
              flexShrink: 0,
              fontFamily: 'var(--font-pixel)',
              fontSize: '6px',
              color: '#c9a0ff',
              background: 'rgba(60,20,120,0.4)',
              border: '1px solid rgba(138,90,200,0.4)',
              borderRadius: '3px',
              padding: '5px 7px',
              whiteSpace: 'nowrap',
              letterSpacing: '1px',
            }}
          >
            {tierLabel}
          </div>
        </div>

        {/* ── Shelf label ── */}
        <div
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '6px',
            color: '#7a6a44',
            textAlign: 'center',
            letterSpacing: '2px',
            marginBottom: '14px',
          }}
        >
          CHOOSE YOUR DISCIPLINE
        </div>

        {/* ── Bookshelves ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {[shelf1, shelf2].map((shelf, shelfIdx) => (
            <div key={shelfIdx} style={{ position: 'relative', paddingBottom: '12px' }}>
              {/* Cards row */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {shelf.map((game) => (
                  <GameCard key={game.slug} game={game} xpRange={xpRange} />
                ))}
              </div>
              {/* Wooden plank */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '-8px',
                  right: '-8px',
                  height: '10px',
                  background: 'linear-gradient(180deg, #4a2e0a 0%, #2e1a04 100%)',
                  borderRadius: '2px',
                  boxShadow: '0 3px 8px rgba(0,0,0,0.6), inset 0 1px 0 rgba(201,168,76,0.12)',
                }}
              />
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

// ── GameCard sub-component ────────────────────────────────────────────────────

function GameCard({
  game,
  xpRange,
}: {
  game: (typeof GAMES)[number]
  xpRange: string
}) {
  return (
    <Link
      href={`/play/academy/${game.slug}`}
      className="group flex-1"
      style={{ minWidth: 0, textDecoration: 'none' }}
    >
      <div
        className="transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:border-[rgba(201,168,76,0.5)]"
        style={{
          background: 'linear-gradient(135deg, #1a1c2e 0%, #12131f 100%)',
          border: '1px solid rgba(201,168,76,0.18)',
          borderRadius: '3px',
          padding: '10px 6px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '5px',
          borderTopColor: game.accent,
          borderTopWidth: '2px',
        }}
      >
        {/* Icon */}
        <div style={{ fontSize: '24px', lineHeight: 1 }} aria-hidden="true">
          {game.icon}
        </div>

        {/* Name */}
        <div
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '6px',
            color: '#f0e6c8',
            textAlign: 'center',
            lineHeight: 1.6,
          }}
        >
          {game.name}
        </div>

        {/* Tagline */}
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontStyle: 'italic',
            fontSize: '10px',
            color: '#7a6a44',
            textAlign: 'center',
            lineHeight: 1.3,
          }}
        >
          {game.tagline}
        </div>

        {/* XP badge */}
        <div
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '5px',
            color: '#c9a84c',
            marginTop: '2px',
          }}
        >
          {xpRange}
        </div>
      </div>
    </Link>
  )
}
