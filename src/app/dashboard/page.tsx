import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AvatarPreview from '@/components/avatar/AvatarPreview'
import { PixelProgressBar, PixelBadge } from '@/components/ui'

// ── XP maths (CLAUDE.md: Level N requires 50 × N × (N+1) / 2 total XP) ──────
function xpForLevel(n: number) { return 50 * n * (n + 1) / 2 }
function levelProgress(xpTotal: number, level: number) {
  const prev    = xpForLevel(level - 1)
  const needed  = 50 * level           // xpForLevel(level) - xpForLevel(level-1)
  const current = Math.max(0, xpTotal - prev)
  return { current, needed, pct: Math.min(100, (current / needed) * 100) }
}

// ── Boss HP colour (green → amber → red as HP drains) ─────────────────────────
function bossHpColor(pct: number) {
  if (pct > 60) return { bar: 'linear-gradient(90deg, #1a6b35, #2eb85c)', glow: 'rgba(46,184,92,0.35)' }
  if (pct > 30) return { bar: 'linear-gradient(90deg, #7a4e00, #e8a020)', glow: 'rgba(232,160,32,0.4)' }
  return           { bar: 'linear-gradient(90deg, #6b1a1a, #e84040)', glow: 'rgba(232,64,64,0.45)' }
}

export default async function OverviewPage() {
  const supabase = await createClient()

  const [
    { data: players },
    { data: pending },
    { data: boss },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, display_name, username, level, xp_total, xp_available, gold, avatar_config')
      .eq('role', 'player')
      .order('created_at', { ascending: true }),

    supabase
      .from('chore_completions')
      .select('player_id')
      .eq('verified', false),

    supabase
      .from('story_chapters')
      .select('title, boss_name, boss_description, boss_hp, boss_current_hp, is_unlocked')
      .order('week_number', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  // Count pending completions per player
  const pendingByPlayer: Record<string, number> = {}
  for (const row of (pending ?? [])) {
    pendingByPlayer[row.player_id] = (pendingByPlayer[row.player_id] ?? 0) + 1
  }
  const totalPending = Object.values(pendingByPlayer).reduce((a, b) => a + b, 0)

  const bossHpPct = boss
    ? Math.min(100, Math.max(0, ((boss.boss_current_hp ?? boss.boss_hp) / (boss.boss_hp || 1)) * 100))
    : 0
  const bossColors = bossHpColor(bossHpPct)

  return (
    <>
      <style suppressHydrationWarning>{`
        .ov-card {
          position: relative;
          background: rgba(80,10,20,0.08);
          border: 1px solid rgba(201,168,76,0.20);
          border-top: 1px solid rgba(201,168,76,0.32);
          border-radius: 3px;
          overflow: hidden;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-shadow: 0 2px 20px rgba(140,20,50,0.07), inset 0 1px 0 rgba(255,220,150,0.03);
        }
        .ov-card:hover {
          border-color: rgba(201,168,76,0.24);
          box-shadow: 0 0 20px rgba(201,168,76,0.06);
        }
        /* pixel corner brackets */
        .px-corner::before, .px-corner::after,
        .px-corner > span::before, .px-corner > span::after {
          content: '';
          position: absolute;
          width: 10px;
          height: 10px;
          border-color: rgba(201,168,76,0.35);
          border-style: solid;
        }
        .px-corner::before  { top: -1px;    left: -1px;  border-width: 2px 0 0 2px; }
        .px-corner::after   { top: -1px;    right: -1px; border-width: 2px 2px 0 0; }
        .px-corner > span::before { bottom: -1px; left: -1px;  border-width: 0 0 2px 2px; }
        .px-corner > span::after  { bottom: -1px; right: -1px; border-width: 0 2px 2px 0; }

        .boss-hp-track {
          height: 14px;
          background: rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 2px;
          overflow: hidden;
          position: relative;
        }
        /* segment dividers every 10% */
        .boss-hp-track::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(
            90deg,
            transparent,
            transparent calc(10% - 1px),
            rgba(0,0,0,0.35) calc(10% - 1px),
            rgba(0,0,0,0.35) 10%
          );
          pointer-events: none;
          z-index: 1;
        }
        .boss-hp-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.6s ease;
        }

        .pending-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(220,80,60,0.15);
          border: 1px solid rgba(220,80,60,0.35);
          border-radius: 2px;
          padding: 2px 7px;
          font-family: 'Press Start 2P', monospace;
          font-size: 0.48rem;
          color: rgba(230,110,90,0.95);
          image-rendering: pixelated;
          flex-shrink: 0;
        }
        .pending-badge.large {
          font-size: 0.55rem;
          padding: 4px 10px;
          background: rgba(220,80,60,0.12);
          border-color: rgba(220,80,60,0.3);
        }

        .stat-chip {
          display: flex;
          align-items: center;
          gap: 5px;
          font-family: 'Press Start 2P', monospace;
          font-size: 0.48rem;
          image-rendering: pixelated;
        }
        .stat-chip .icon {
          font-size: 0.7rem;
          line-height: 1;
        }

        .section-rule {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .section-rule h2 {
          font-family: 'Cinzel', serif;
          font-size: 0.72rem;
          font-weight: 700;
          color: rgba(201,168,76,0.85);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .section-rule .rule-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, rgba(180,50,80,0.28), transparent);
        }

        @keyframes slide-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .slide-in { animation: slide-in 0.4s ease both; }
        .slide-in-d1 { animation-delay: 0.05s; }
        .slide-in-d2 { animation-delay: 0.1s; }
        .slide-in-d3 { animation-delay: 0.15s; }
        .slide-in-d4 { animation-delay: 0.2s; }
        .slide-in-d5 { animation-delay: 0.25s; }
        .slide-in-d6 { animation-delay: 0.3s; }
      `}</style>

      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <div className="dash-topbar">
        <span className="dash-page-title">⟡ Overview</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {totalPending > 0 && (
            <Link
              href="/dashboard/approvals"
              className="pending-badge large"
              style={{ textDecoration: 'none' }}
            >
              <span>⚠</span>
              {totalPending} pending {totalPending === 1 ? 'approval' : 'approvals'}
            </Link>
          )}
          <span style={{
            fontFamily: 'Cinzel, serif',
            fontWeight: 300,
            fontSize: '0.72rem',
            color: 'rgba(80,55,20,0.55)',
          }}>
            {(players ?? []).length} {(players ?? []).length === 1 ? 'adventurer' : 'adventurers'}
          </span>
        </div>
      </div>

      <div className="dash-content">

        {/* ── Player Cards ──────────────────────────────────────────── */}
        <div className="section-rule">
          <h2>Adventurer Roster</h2>
          <div className="rule-line" />
          <Link
            href="/dashboard/players"
            className="dashboard-manage-link"
            style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '0.6rem',
              letterSpacing: '0.1em',
              color: 'rgba(201,168,76,0.45)',
              textDecoration: 'none',
              textTransform: 'uppercase',
              flexShrink: 0,
              transition: 'color 0.2s',
            }}
          >
            Manage →
          </Link>
        </div>

        {(players ?? []).length === 0 ? (
          <div style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            background: 'rgba(255,255,255,0.015)',
            border: '1px dashed rgba(201,168,76,0.12)',
            borderRadius: 3,
            marginBottom: '2rem',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem', opacity: 0.3 }}>⚔</div>
            <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.78rem', color: 'rgba(80,55,20,0.45)', letterSpacing: '0.06em' }}>
              No adventurers yet
            </p>
            <Link
              href="/dashboard/players"
              style={{
                display: 'inline-block',
                marginTop: '1rem',
                fontFamily: 'Cinzel, serif',
                fontSize: '0.65rem',
                color: 'rgba(201,168,76,0.6)',
                textDecoration: 'none',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                border: '1px solid rgba(201,168,76,0.2)',
                padding: '0.5rem 1rem',
                borderRadius: 2,
              }}
            >
              Recruit Players
            </Link>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '0.75rem',
            marginBottom: '2.5rem',
          }}>
            {(players ?? []).map((player, i) => {
              const { current, needed } = levelProgress(player.xp_total, player.level)
              const pendingCount = pendingByPlayer[player.id] ?? 0
              const delayClass = `slide-in slide-in-d${Math.min(i + 1, 6)}`

              return (
                <div key={player.id} className={`ov-card px-corner ${delayClass}`}>
                  <span aria-hidden="true" />

                  <div style={{ padding: '1rem' }}>

                    {/* ── Name row ─── */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>

                      {/* Avatar */}
                      <div style={{ flexShrink: 0, lineHeight: 0 }}>
                        <AvatarPreview
                          avatarConfig={player.avatar_config as Record<string, unknown> | null}
                          size={64}
                        />
                      </div>

                      {/* Name + level badge */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{
                            fontFamily: 'Cinzel, serif',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: '#1a1410',
                            letterSpacing: '0.02em',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {player.display_name}
                          </span>

                          {/* Level badge — uses 'daily' variant for gold color; children override default label */}
                          <span style={{ flexShrink: 0 }}>
                            <PixelBadge variant="daily">LV{player.level}</PixelBadge>
                          </span>

                          {/* Pending badge */}
                          {pendingCount > 0 && (
                            <span className="pending-badge">
                              ⚑ {pendingCount}
                            </span>
                          )}
                        </div>

                        <span style={{
                          fontFamily: 'Cinzel, serif',
                          fontWeight: 300,
                          fontSize: '0.68rem',
                          color: 'rgba(80,55,20,0.70)',
                        }}>
                          @{player.username}
                        </span>
                      </div>
                    </div>

                    {/* ── XP progress bar ─── */}
                    <div style={{ marginBottom: '0.65rem' }}>
                      <PixelProgressBar
                        value={current}
                        max={needed}
                        variant="xp"
                        showValue={false}
                      />
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: 4,
                        fontFamily: 'Cinzel, serif',
                        fontWeight: 300,
                        fontSize: '0.62rem',
                        color: 'rgba(80,55,20,0.65)',
                      }}>
                        <span>{current.toLocaleString()} XP</span>
                        <span>{needed.toLocaleString()} to Lv.{player.level + 1}</span>
                      </div>
                    </div>

                    {/* ── Stat chips ─── */}
                    <div style={{
                      display: 'flex',
                      gap: '0.85rem',
                      paddingTop: '0.5rem',
                      borderTop: '1px solid rgba(180,50,80,0.14)',
                    }}>
                      {/* Available XP */}
                      <div className="stat-chip" style={{ color: 'rgba(201,168,76,0.75)' }}>
                        <span className="icon" aria-hidden="true">⬡</span>
                        <span>{player.xp_available.toLocaleString()}</span>
                        <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 300, fontSize: '0.55rem', color: 'rgba(80,55,20,0.55)' }}>xp</span>
                      </div>

                      {/* Gold */}
                      <div className="stat-chip" style={{ color: 'rgba(249,200,70,0.8)' }}>
                        <span className="icon" aria-hidden="true">◈</span>
                        <span>{player.gold.toLocaleString()}</span>
                        <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 300, fontSize: '0.55rem', color: 'rgba(80,55,20,0.55)' }}>gp</span>
                      </div>

                      {/* Pending approvals for this player */}
                      {pendingCount > 0 && (
                        <div className="stat-chip" style={{ color: 'rgba(230,110,90,0.8)', marginLeft: 'auto' }}>
                          <span className="icon" aria-hidden="true">⚑</span>
                          <span>{pendingCount} pending</span>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Current Boss ──────────────────────────────────────────── */}
        <div className="section-rule">
          <h2>Current Campaign</h2>
          <div className="rule-line" />
        </div>

        {!boss || !boss.boss_name ? (
          <div style={{
            padding: '2.5rem 2rem',
            textAlign: 'center',
            background: 'rgba(255,255,255,0.015)',
            border: '1px dashed rgba(201,168,76,0.1)',
            borderRadius: 3,
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem', opacity: 0.25 }}>⚔</div>
            <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.78rem', color: 'rgba(80,55,20,0.40)', letterSpacing: '0.06em' }}>
              No active boss
            </p>
            <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 300, fontSize: '0.72rem', color: 'rgba(80,55,20,0.30)', marginTop: '0.4rem' }}>
              Generate a story chapter from the Story page to begin the campaign.
            </p>
            <Link
              href="/dashboard/story"
              style={{
                display: 'inline-block',
                marginTop: '1rem',
                fontFamily: 'Cinzel, serif',
                fontSize: '0.65rem',
                color: 'rgba(201,168,76,0.55)',
                textDecoration: 'none',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                border: '1px solid rgba(201,168,76,0.18)',
                padding: '0.5rem 1rem',
                borderRadius: 2,
              }}
            >
              Open Story →
            </Link>
          </div>
        ) : (
          <div
            className="ov-card px-corner slide-in"
            style={{
              padding: '1.5rem 1.75rem',
            }}
          >
            <span aria-hidden="true" />

            {/* Boss header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                  <h3 style={{
                    fontFamily: 'Cinzel, serif',
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    color: '#1a1410',
                    letterSpacing: '0.04em',
                  }}>
                    {boss.boss_name}
                  </h3>
                  <span style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: '0.42rem',
                    imageRendering: 'pixelated',
                    padding: '3px 7px',
                    borderRadius: 2,
                    ...(boss.is_unlocked
                      ? { background: 'rgba(220,60,60,0.12)', border: '1px solid rgba(220,60,60,0.3)', color: 'rgba(230,100,100,0.9)' }
                      : { background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', color: 'rgba(201,168,76,0.6)' }
                    ),
                  }}>
                    {boss.is_unlocked ? '⚔ ACTIVE' : '⚿ LOCKED'}
                  </span>
                </div>
                {boss.title && (
                  <p style={{
                    fontFamily: 'Cinzel, serif',
                    fontWeight: 300,
                    fontSize: '0.72rem',
                    color: 'rgba(201,168,76,0.62)',
                    letterSpacing: '0.06em',
                    fontStyle: 'italic',
                  }}>
                    {boss.title}
                  </p>
                )}
              </div>

              {/* HP numbers */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '0.55rem',
                  color: bossHpPct > 30 ? 'rgba(46,184,92,0.85)' : 'rgba(232,64,64,0.85)',
                  imageRendering: 'pixelated',
                  marginBottom: 2,
                }}>
                  {(boss.boss_current_hp ?? boss.boss_hp).toLocaleString()} / {boss.boss_hp.toLocaleString()}
                </div>
                <div style={{
                  fontFamily: 'Cinzel, serif',
                  fontWeight: 300,
                  fontSize: '0.6rem',
                  color: 'rgba(80,55,20,0.65)',
                  letterSpacing: '0.06em',
                }}>
                  HP remaining
                </div>
              </div>
            </div>

            {/* Boss description */}
            {boss.boss_description && (
              <p style={{
                fontFamily: 'Cinzel, serif',
                fontWeight: 300,
                fontSize: '0.82rem',
                color: 'rgba(60,45,20,0.85)',
                lineHeight: 1.65,
                fontStyle: 'italic',
                marginBottom: '1.25rem',
                borderLeft: '2px solid rgba(180,50,80,0.30)',
                paddingLeft: '0.85rem',
              }}>
                {boss.boss_description}
              </p>
            )}

            {/* HP bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.6rem', color: 'rgba(80,55,20,0.65)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Boss HP
                </span>
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.45rem', color: 'rgba(80,55,20,0.50)', imageRendering: 'pixelated' }}>
                  {Math.round(bossHpPct)}%
                </span>
              </div>
              <div
                className="boss-hp-track"
                style={{ boxShadow: `0 0 12px ${bossColors.glow}` }}
                role="meter"
                aria-label={`Boss HP: ${Math.round(bossHpPct)}%`}
                aria-valuenow={Math.round(bossHpPct)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="boss-hp-fill"
                  style={{
                    width: `${bossHpPct}%`,
                    background: bossColors.bar,
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.15)`,
                  }}
                />
              </div>
              <p style={{
                fontFamily: 'Cinzel, serif',
                fontWeight: 300,
                fontSize: '0.68rem',
                color: 'rgba(80,55,20,0.65)',
                marginTop: 8,
              }}>
                Every approved quest and academy challenge deals damage equal to its XP reward.
              </p>
            </div>

          </div>
        )}

      </div>
    </>
  )
}
