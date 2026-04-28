import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { SignOutButton } from '@/components/play/SignOutButton'
import AvatarPreview from '@/components/avatar/AvatarPreview'
import { xpForLevel, xpProgressPercent, embershardState } from '@/lib/xp'
import classesData from '@/lore/classes.json'

// ── Static metadata ───────────────────────────────────────────────────────────

const CLASS_PRIMARY_STAT: Record<string, string> = {
  blazewarden:  'Strength',
  lorescribe:   'Wisdom',
  shadowstep:   'Courage',
  hearthkeeper: 'Endurance',
  stormcaller:  'Courage',
  ironvow:      'Endurance',
}

const LOOT_CAT_LABEL: Record<string, string> = {
  real_reward:  'Real Reward',
  cosmetic:     'Cosmetic',
  power_up:     'Power-Up',
  story_unlock: 'Story Unlock',
}
const LOOT_CAT_COLOR: Record<string, string> = {
  real_reward:  '#2eb85c',
  cosmetic:     '#b060e0',
  power_up:     '#e86a20',
  story_unlock: '#4d8aff',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Bar fill percent, capped at level 50 as a visual ceiling
function statBar(level: number) {
  return Math.min((level / 50) * 100, 100)
}

// ── Pixel art sub-components (pure JSX, no state needed) ─────────────────────

function XpIcon({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} style={{ imageRendering: 'pixelated', flexShrink: 0 }} aria-hidden="true">
      <polygon points="8,1 14,6 14,10 8,15 2,10 2,6" fill="#6eb5ff" stroke="#3a7acc" strokeWidth="0.5" />
      <polygon points="8,1 14,6 8,7 2,6" fill="#9fd0ff" opacity="0.8" />
    </svg>
  )
}

function GoldIcon({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} style={{ imageRendering: 'pixelated', flexShrink: 0 }} aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" fill="#c9a84c" stroke="#9c7b2e" strokeWidth="0.5" />
      <circle cx="8" cy="8" r="4.5" fill="#e8c55a" opacity="0.7" />
      <text x="8" y="11" textAnchor="middle" fontSize="6" fill="#9c7b2e" fontWeight="bold">G</text>
    </svg>
  )
}

// Stat icons — pixel-art inline SVGs
function StatIcon({ stat, color }: { stat: string; color: string }) {
  switch (stat) {
    case 'Strength':
      return (
        <svg viewBox="0 0 20 20" width={16} height={16} style={{ imageRendering: 'pixelated' }} aria-hidden="true">
          <rect x="9" y="1"  width="2" height="14" fill={color} rx="0.5" />
          <rect x="5" y="7"  width="10" height="2" fill={color} rx="0.5" />
          <rect x="7" y="15" width="6"  height="3" fill={color} rx="0.5" />
          <circle cx="10" cy="2" r="1.5" fill={color} />
        </svg>
      )
    case 'Wisdom':
      return (
        <svg viewBox="0 0 20 20" width={16} height={16} style={{ imageRendering: 'pixelated' }} aria-hidden="true">
          <polygon points="10,1 12,7 18,7 13,11 15,18 10,14 5,18 7,11 2,7 8,7" fill={color} opacity="0.9" />
        </svg>
      )
    case 'Courage':
      return (
        <svg viewBox="0 0 20 20" width={16} height={16} style={{ imageRendering: 'pixelated' }} aria-hidden="true">
          <polygon points="10,1 12,8 19,8 14,13 16,19 10,15 4,19 6,13 1,8 8,8" fill={color} opacity="0.85" />
          <polygon points="10,1 11,7 15,9 10,15 5,9 9,7" fill="white" opacity="0.2" />
        </svg>
      )
    case 'Endurance':
      return (
        <svg viewBox="0 0 20 20" width={16} height={16} style={{ imageRendering: 'pixelated' }} aria-hidden="true">
          <path d="M10 2 L18 6 L18 12 Q18 18 10 19 Q2 18 2 12 L2 6 Z" fill={color} opacity="0.85" />
          <path d="M10 5 L15 8 L15 12 Q15 16 10 17 Q5 16 5 12 L5 8 Z" fill="rgba(0,0,0,0.25)" />
        </svg>
      )
    default: return null
  }
}

// Section heading with decorative rule
function SectionHeading({ label, accent }: { label: string; accent: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
      <p
        style={{
          fontFamily:     'var(--font-pixel), monospace',
          fontSize:       '0.42rem',
          letterSpacing:  '0.18em',
          color:          `${accent}99`,
          imageRendering: 'pixelated',
          whiteSpace:     'nowrap',
          flexShrink:      0,
        }}
      >
        {label}
      </p>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${accent}30, transparent)` }} />
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_class, level, xp_total, xp_available, gold, household_id, username, avatar_config')
    .eq('id', user.id)
    .single()
  if (!profile) redirect('/login')

  // Fetch quest history and loot inventory in parallel
  const [{ data: rawCompletions }, { data: rawPurchases }] = await Promise.all([
    supabase
      .from('chore_completions')
      .select('id, completed_at, verified, xp_awarded, gold_awarded, chores (title)')
      .eq('household_id', profile.household_id)
      .eq('player_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(10),
    supabase
      .from('purchases')
      .select('id, purchased_at, redeemed, loot_store_items (name, category, real_reward_description)')
      .eq('household_id', profile.household_id)
      .eq('player_id', user.id)
      .order('purchased_at', { ascending: false }),
  ])

  // Shape the joined data
  type Completion = {
    id: string; completed_at: string; verified: boolean
    xp_awarded: number; gold_awarded: number
    chores: { title: string } | null
  }
  type Purchase = {
    id: string; purchased_at: string; redeemed: boolean
    loot_store_items: { name: string; category: string; real_reward_description: string } | null
  }

  const completions = (rawCompletions ?? []) as Completion[]
  const purchases   = (rawPurchases   ?? []) as Purchase[]

  // Character math
  const level       = profile.level        ?? 1
  const xpTotal     = profile.xp_total     ?? 0
  const xpAvailable = profile.xp_available ?? 0
  const gold        = profile.gold         ?? 0
  const progressPct = xpProgressPercent(xpTotal)
  const shard       = embershardState(level)
  const curLevelXP  = xpForLevel(level)
  const nextLevelXP = xpForLevel(level + 1)
  const xpIntoLevel = xpTotal - curLevelXP
  const xpNeeded    = nextLevelXP - curLevelXP

  // Class metadata
  const classInfo   = classesData.classes.find(c => c.id === profile.avatar_class) ?? null
  const accent      = classInfo?.color_primary  ?? '#c9a84c'
  const accent2     = classInfo?.color_secondary ?? '#ff8c42'
  const primaryStat = CLASS_PRIMARY_STAT[profile.avatar_class ?? ''] ?? ''

  // Derived stats (level × 2, equal across the board — displayed for fun)
  const statValue = level * 2
  const STATS = [
    { name: 'Strength',  value: statValue },
    { name: 'Wisdom',    value: statValue },
    { name: 'Courage',   value: statValue },
    { name: 'Endurance', value: statValue },
  ]

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="px-4 py-5 pb-8">

      {/* ═══════════════════════════════════════════════════════════════════
          HERO SECTION — Avatar + Character Info
      ═══════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          display:    'flex',
          gap:        '1.25rem',
          flexWrap:   'wrap',
          alignItems: 'flex-start',
          marginBottom: '1.75rem',
        }}
      >
        {/* ── Avatar ──────────────────────────────────────────────────── */}
        <div style={{ flexShrink: 0 }}>
          <div
            style={{
              position:        'relative',
              width:            256,
              height:           256,
              background:      `radial-gradient(ellipse at 50% 80%, ${accent}12, transparent 70%)`,
              border:          `2px solid ${accent}20`,
              borderRadius:     4,
              overflow:        'hidden',
            }}
          >
            {/* Corner ornaments */}
            {([
              { top: -1,    left: -1,  borderWidth: '3px 0 0 3px' },
              { top: -1,    right: -1, borderWidth: '3px 3px 0 0' },
              { bottom: -1, left: -1,  borderWidth: '0 0 3px 3px' },
              { bottom: -1, right: -1, borderWidth: '0 3px 3px 0' },
            ] as const).map((s, i) => (
              <div
                key={i}
                aria-hidden="true"
                style={{
                  position:    'absolute',
                  zIndex:       1,
                  width:        20,
                  height:       20,
                  borderColor: `${accent}40`,
                  borderStyle: 'solid',
                  ...s,
                }}
              />
            ))}
            {classInfo?.portrait ? (
              <Image
                src={classInfo.portrait}
                alt={classInfo.name}
                fill
                style={{ objectFit: 'cover' }}
                priority
              />
            ) : (
              <AvatarPreview
                avatarConfig={profile.avatar_config as Record<string, unknown> | null}
                size={256}
                className="block"
              />
            )}
          </div>

          {/* Edit Appearance link */}
          <Link
            href="/play/create-character?mode=edit"
            style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              marginTop:      '0.65rem',
              width:           256,
              padding:        '0.7rem',
              borderRadius:    3,
              border:         `1px solid ${accent}30`,
              background:     `${accent}0a`,
              color:          `${accent}cc`,
              fontFamily:     'var(--font-pixel), monospace',
              fontSize:       '0.42rem',
              letterSpacing:  '0.12em',
              imageRendering: 'pixelated',
              textDecoration: 'none',
              minHeight:       48,
              transition:     'border-color 0.15s, background 0.15s',
            }}
          >
            ✦ Edit Appearance
          </Link>
        </div>

        {/* ── Character Info ───────────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 240 }}>

          {/* Name */}
          <h1
            style={{
              fontFamily:    'var(--font-heading), serif',
              fontWeight:     700,
              fontSize:      '1.65rem',
              color:         '#f0e6c8',
              lineHeight:     1.15,
              marginBottom:  '0.2rem',
              textShadow:    `0 0 28px ${accent}50`,
            }}
          >
            {profile.display_name}
          </h1>

          {/* Username */}
          <p
            style={{
              fontFamily:   'var(--font-heading), serif',
              fontWeight:    300,
              fontSize:     '0.72rem',
              color:        'rgba(200,215,255,0.3)',
              marginBottom: '0.85rem',
            }}
          >
            @{profile.username}
          </p>

          {/* Class + motto */}
          {classInfo && (
            <div style={{ marginBottom: '0.85rem' }}>
              <p
                style={{
                  fontFamily:     'var(--font-pixel), monospace',
                  fontSize:       '0.4rem',
                  letterSpacing:  '0.18em',
                  imageRendering: 'pixelated',
                  color:           accent2,
                  marginBottom:   '0.25rem',
                }}
              >
                {classInfo.name.toUpperCase()} · {classInfo.archetype.toUpperCase()}
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-body), serif',
                  fontSize:   '0.82rem',
                  fontStyle:  'italic',
                  color:      'rgba(200,215,255,0.38)',
                  lineHeight:  1.5,
                }}
              >
                &ldquo;{classInfo.motto}&rdquo;
              </p>
            </div>
          )}

          {/* Level + shard */}
          <div
            style={{
              display:       'inline-flex',
              alignItems:    'center',
              gap:           '0.6rem',
              padding:       '0.4rem 0.75rem',
              borderRadius:   3,
              background:    `${accent}12`,
              border:        `1px solid ${accent}30`,
              marginBottom:  '0.85rem',
            }}
          >
            <span
              style={{
                fontFamily:     'var(--font-pixel), monospace',
                fontSize:       '0.38rem',
                imageRendering: 'pixelated',
                color:          `${accent}aa`,
                letterSpacing:  '0.1em',
              }}
            >
              Lv
            </span>
            <span
              style={{
                fontFamily:     'var(--font-pixel), monospace',
                fontSize:       '1rem',
                imageRendering: 'pixelated',
                color:           accent,
                textShadow:    `0 0 12px ${accent}80`,
                lineHeight:      1,
              }}
            >
              {level}
            </span>
            <span style={{ color: `${accent}50`, fontSize: '0.7rem' }}>·</span>
            <span
              style={{
                fontFamily:     'var(--font-pixel), monospace',
                fontSize:       '0.38rem',
                imageRendering: 'pixelated',
                color:          `${accent}cc`,
                letterSpacing:  '0.1em',
              }}
            >
              {shard.toUpperCase()}
            </span>
          </div>

          {/* XP + Gold row */}
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <XpIcon size={16} />
              <div>
                <p
                  style={{
                    fontFamily:     'var(--font-pixel), monospace',
                    fontSize:       '0.38rem',
                    imageRendering: 'pixelated',
                    color:          'rgba(200,215,255,0.3)',
                    lineHeight:      1,
                    marginBottom:   '0.1rem',
                  }}
                >
                  XP
                </p>
                <p
                  style={{
                    fontFamily:     'var(--font-pixel), monospace',
                    fontSize:       '0.5rem',
                    imageRendering: 'pixelated',
                    color:          'rgba(110,181,255,0.9)',
                    lineHeight:      1,
                  }}
                >
                  {xpAvailable.toLocaleString()} spendable
                </p>
                <p
                  style={{
                    fontFamily:     'var(--font-pixel), monospace',
                    fontSize:       '0.36rem',
                    imageRendering: 'pixelated',
                    color:          'rgba(110,181,255,0.45)',
                    lineHeight:      1,
                    marginTop:      '0.15rem',
                  }}
                >
                  {xpTotal.toLocaleString()} lifetime
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <GoldIcon size={16} />
              <div>
                <p
                  style={{
                    fontFamily:     'var(--font-pixel), monospace',
                    fontSize:       '0.38rem',
                    imageRendering: 'pixelated',
                    color:          'rgba(200,215,255,0.3)',
                    lineHeight:      1,
                    marginBottom:   '0.1rem',
                  }}
                >
                  GOLD
                </p>
                <p
                  style={{
                    fontFamily:     'var(--font-pixel), monospace',
                    fontSize:       '0.5rem',
                    imageRendering: 'pixelated',
                    color:          'rgba(201,168,76,0.9)',
                    lineHeight:      1,
                  }}
                >
                  {gold.toLocaleString()} GP
                </p>
              </div>
            </div>
          </div>

          {/* XP progress bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span
                style={{
                  fontFamily:     'var(--font-pixel), monospace',
                  fontSize:       '0.36rem',
                  imageRendering: 'pixelated',
                  color:          'rgba(200,215,255,0.28)',
                  letterSpacing:  '0.1em',
                }}
              >
                PROGRESS TO LV {level + 1}
              </span>
              <span
                style={{
                  fontFamily:     'var(--font-pixel), monospace',
                  fontSize:       '0.36rem',
                  imageRendering: 'pixelated',
                  color:          `${accent}90`,
                }}
              >
                {xpIntoLevel} / {xpNeeded}
              </span>
            </div>
            <div
              style={{
                position:       'relative',
                height:          14,
                background:     'rgba(255,255,255,0.04)',
                border:         '1px solid rgba(255,255,255,0.07)',
                borderRadius:    2,
                overflow:       'hidden',
                imageRendering: 'pixelated',
              }}
            >
              <div
                style={{
                  position:  'absolute',
                  top:        2,
                  left:       2,
                  bottom:     2,
                  width:     `calc(${Math.min(progressPct, 100)}% - 4px)`,
                  background: `linear-gradient(90deg, ${accent}99, ${accent2}cc, ${accent})`,
                  boxShadow: `0 0 8px ${accent}60`,
                  transition: 'width 0.6s ease',
                }}
              />
              {[25, 50, 75].map(tick => (
                <div
                  key={tick}
                  aria-hidden="true"
                  style={{ position: 'absolute', top: 0, bottom: 0, left: `${tick}%`, width: 1, background: 'rgba(0,0,0,0.35)' }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          STATS SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section style={{ marginBottom: '1.75rem' }}>
        <SectionHeading label="CHARACTER STATS" accent={accent} />

        <div
          style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap:                 '0.6rem',
          }}
        >
          {STATS.map(stat => {
            const isPrimary = stat.name === primaryStat
            const barPct    = statBar(level)
            return (
              <div
                key={stat.name}
                style={{
                  position:   'relative',
                  padding:    '0.75rem 0.85rem',
                  borderRadius: 3,
                  background:  isPrimary
                    ? `linear-gradient(135deg, ${accent}10, rgba(255,255,255,0.025))`
                    : 'rgba(255,255,255,0.025)',
                  border:      isPrimary
                    ? `1px solid ${accent}30`
                    : '1px solid rgba(255,255,255,0.06)',
                  overflow:   'hidden',
                }}
              >
                {/* Primary stat accent */}
                {isPrimary && (
                  <div
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      top:       0,
                      left:      0,
                      right:     0,
                      height:    2,
                      background: accent,
                      opacity:    0.7,
                    }}
                  />
                )}

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <StatIcon stat={stat.name} color={isPrimary ? accent : 'rgba(200,215,255,0.4)'} />
                    <span
                      style={{
                        fontFamily:     'var(--font-pixel), monospace',
                        fontSize:       '0.38rem',
                        imageRendering: 'pixelated',
                        color:           isPrimary ? `${accent}cc` : 'rgba(200,215,255,0.4)',
                        letterSpacing:  '0.1em',
                      }}
                    >
                      {stat.name.toUpperCase()}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily:     'var(--font-pixel), monospace',
                      fontSize:       '0.55rem',
                      imageRendering: 'pixelated',
                      color:           isPrimary ? accent : 'rgba(200,215,255,0.55)',
                      textShadow:      isPrimary ? `0 0 10px ${accent}70` : 'none',
                    }}
                  >
                    {stat.value}
                  </span>
                </div>

                {/* Stat bar */}
                <div
                  style={{
                    height:     6,
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: 1,
                    overflow:   'hidden',
                  }}
                >
                  <div
                    style={{
                      height:     '100%',
                      width:      `${barPct}%`,
                      background:  isPrimary
                        ? `linear-gradient(90deg, ${accent}88, ${accent})`
                        : 'rgba(200,215,255,0.2)',
                      borderRadius: 1,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {classInfo && (
          <p
            style={{
              fontFamily: 'var(--font-body), serif',
              fontSize:   '0.72rem',
              fontStyle:  'italic',
              color:      'rgba(200,215,255,0.22)',
              marginTop:  '0.65rem',
              textAlign:  'center',
            }}
          >
            Embershard form: {classInfo.embershard_form}
          </p>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          QUEST HISTORY
      ═══════════════════════════════════════════════════════════════════ */}
      <section style={{ marginBottom: '1.75rem' }}>
        <SectionHeading label="ADVENTURE LOG" accent={accent} />

        {completions.length === 0 ? (
          <p
            style={{
              fontFamily: 'var(--font-heading), serif',
              fontWeight: 300,
              fontSize:   '0.78rem',
              color:      'rgba(200,215,255,0.2)',
              textAlign:  'center',
              padding:    '1.5rem 0',
            }}
          >
            No quests recorded yet. Begin your adventure!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {completions.map((c, idx) => (
              <div
                key={c.id}
                style={{
                  display:       'flex',
                  alignItems:    'center',
                  gap:           '0.65rem',
                  padding:       '0.65rem 0.85rem',
                  borderRadius:   3,
                  background:    idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                  border:        `1px solid ${c.verified ? 'rgba(46,184,92,0.1)' : 'rgba(251,191,36,0.1)'}`,
                  position:      'relative',
                  overflow:      'hidden',
                }}
              >
                {/* Left accent stripe */}
                <div
                  aria-hidden="true"
                  style={{
                    position:   'absolute',
                    left:        0,
                    top:         0,
                    bottom:      0,
                    width:       2,
                    background:  c.verified ? 'rgba(46,184,92,0.6)' : 'rgba(251,191,36,0.5)',
                  }}
                />

                {/* Status icon */}
                <span
                  aria-label={c.verified ? 'Verified' : 'Awaiting verification'}
                  style={{ fontSize: '0.75rem', lineHeight: 1, flexShrink: 0 }}
                >
                  {c.verified ? '✓' : '⏳'}
                </span>

                {/* Title */}
                <p
                  style={{
                    fontFamily: 'var(--font-heading), serif',
                    fontWeight: 600,
                    fontSize:   '0.82rem',
                    color:      c.verified ? '#e0d8c0' : 'rgba(240,230,200,0.6)',
                    flex:        1,
                    minWidth:    0,
                    overflow:   'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {c.chores?.title ?? 'Unknown Quest'}
                </p>

                {/* XP earned */}
                {c.verified && c.xp_awarded > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
                    <XpIcon size={12} />
                    <span
                      style={{
                        fontFamily:     'var(--font-pixel), monospace',
                        fontSize:       '0.38rem',
                        imageRendering: 'pixelated',
                        color:          'rgba(110,181,255,0.8)',
                      }}
                    >
                      +{c.xp_awarded}
                    </span>
                  </div>
                )}

                {/* Date */}
                <span
                  style={{
                    fontFamily: 'var(--font-heading), serif',
                    fontWeight: 300,
                    fontSize:   '0.65rem',
                    color:      'rgba(200,215,255,0.25)',
                    flexShrink:  0,
                  }}
                >
                  {fmtDate(c.completed_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          LOOT INVENTORY
      ═══════════════════════════════════════════════════════════════════ */}
      <section>
        <SectionHeading label="LOOT INVENTORY" accent={accent} />

        {purchases.length === 0 ? (
          <p
            style={{
              fontFamily: 'var(--font-heading), serif',
              fontWeight: 300,
              fontSize:   '0.78rem',
              color:      'rgba(200,215,255,0.2)',
              textAlign:  'center',
              padding:    '1.5rem 0',
            }}
          >
            No items yet. Visit the Emporium to spend your XP.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {purchases.map(p => {
              const item    = p.loot_store_items
              const cat     = item?.category ?? 'real_reward'
              const catColor = LOOT_CAT_COLOR[cat] ?? '#c9a84c'
              return (
                <div
                  key={p.id}
                  style={{
                    display:       'flex',
                    alignItems:    'center',
                    gap:           '0.65rem',
                    padding:       '0.65rem 0.85rem',
                    borderRadius:   3,
                    background:    'rgba(255,255,255,0.02)',
                    border:        `1px solid rgba(255,255,255,0.06)`,
                    position:      'relative',
                    overflow:      'hidden',
                  }}
                >
                  {/* Left accent */}
                  <div
                    aria-hidden="true"
                    style={{
                      position:   'absolute',
                      left:        0,
                      top:         0,
                      bottom:      0,
                      width:       2,
                      background:  catColor,
                      opacity:     0.6,
                    }}
                  />

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.15rem' }}>
                      <p
                        style={{
                          fontFamily: 'var(--font-heading), serif',
                          fontWeight: 600,
                          fontSize:   '0.82rem',
                          color:      '#e0d8c0',
                        }}
                      >
                        {item?.name ?? 'Unknown Item'}
                      </p>
                      <span
                        style={{
                          fontFamily:     'var(--font-pixel), monospace',
                          fontSize:       '0.34rem',
                          imageRendering: 'pixelated',
                          padding:        '1px 4px',
                          borderRadius:    2,
                          background:     `${catColor}18`,
                          border:         `1px solid ${catColor}35`,
                          color:           catColor,
                        }}
                      >
                        {LOOT_CAT_LABEL[cat]}
                      </span>
                    </div>
                    {item?.real_reward_description && (
                      <p
                        style={{
                          fontFamily: 'var(--font-body), serif',
                          fontSize:   '0.72rem',
                          color:      'rgba(200,215,255,0.3)',
                          lineHeight:  1.4,
                        }}
                      >
                        {item.real_reward_description}
                      </p>
                    )}
                  </div>

                  {/* Redeemed badge */}
                  <span
                    style={{
                      fontFamily:     'var(--font-pixel), monospace',
                      fontSize:       '0.34rem',
                      imageRendering: 'pixelated',
                      padding:        '2px 5px',
                      borderRadius:    2,
                      background:      p.redeemed ? 'rgba(46,184,92,0.1)' : 'rgba(251,191,36,0.08)',
                      border:          p.redeemed ? '1px solid rgba(46,184,92,0.35)' : '1px solid rgba(251,191,36,0.25)',
                      color:           p.redeemed ? 'rgba(46,184,92,0.85)' : 'rgba(251,191,36,0.6)',
                      flexShrink:      0,
                      whiteSpace:     'nowrap',
                    }}
                  >
                    {p.redeemed ? '✓ Redeemed' : 'Pending'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SIGN OUT
      ═══════════════════════════════════════════════════════════════════ */}
      <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(230,80,100,0.15)' }}>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <SignOutButton />
          <Link
            href="/play?walkthrough=1"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: '0.7rem 1rem',
              borderRadius: 3,
              border: `1px solid ${accent}30`,
              background: `${accent}0a`,
              color: `${accent}cc`,
              fontFamily: 'var(--font-pixel), monospace',
              fontSize: '0.4rem',
              letterSpacing: '0.12em',
              imageRendering: 'pixelated',
              textDecoration: 'none',
              minHeight: 48,
              transition: 'border-color 0.15s, background 0.15s',
            }}
          >
            ⟡ Replay Guide
          </Link>
        </div>
      </div>
    </div>
  )
}
