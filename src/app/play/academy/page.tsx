import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AvatarPreview from '@/components/avatar/AvatarPreview'
import EncounterCard from '@/components/avatar/EncounterCard'
import { GAMES, deriveTier, XP_RANGE, TIER_LABEL } from '@/lib/constants/academy'
import { ENEMY_PRESETS } from '@/lib/constants/enemies'

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AcademyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_class, level, age, avatar_config')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  const tier      = deriveTier(profile.age ?? null)
  const xpRange   = XP_RANGE[tier]
  const tierLabel = TIER_LABEL[tier]
  const level     = profile.level ?? 1
  const className = profile.avatar_class ?? 'Emberbearer'

  // Split games: 3 on top shelf (room for 128px avatars), 4 on bottom
  const mid = Math.floor(GAMES.length / 2)
  const shelf1 = GAMES.slice(0, mid)
  const shelf2 = GAMES.slice(mid)

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
        <div
          role="list"
          aria-label="Available academy disciplines"
          style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
        >
          {[shelf1, shelf2].map((shelf, shelfIdx) => (
            <div key={shelfIdx} style={{ position: 'relative', paddingBottom: '12px' }}>
              {/* Cards row */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {shelf.map((game) => (
                  <EncounterCard
                    key={game.slug}
                    game={game}
                    enemy={ENEMY_PRESETS[game.slug]}
                    xpRange={xpRange}
                  />
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


