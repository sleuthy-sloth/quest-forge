import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { xpForLevel } from '@/lib/xp'
import {
  StatCard,
  PixelAvatar,
  XPBar,
  XPIcon,
  Coin,
} from '@/components/qf'

function classKey(avatarClass: string | null): string {
  return (avatarClass ?? 'blazewarden').toLowerCase()
}

export default async function GMHomePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Resolve household_id for defense-in-depth query scoping.
  // The dashboard layout already guards: only GMs who pass the role check
  // reach this page, so the profile + household_id always exist.
  const { data: profileBrief } = await supabase
    .from('profiles')
    .select('household_id')
    .eq('id', user.id)
    .maybeSingle()

  if (!profileBrief?.household_id) redirect('/login')
  const householdId = profileBrief.household_id

  // Fetch in parallel: roster, pending approvals, current week's boss.
  const [
    { data: players },
    { data: pending },
    { data: boss },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, display_name, username, level, xp_total, xp_available, gold, avatar_class')
      .eq('household_id', householdId)
      .eq('role', 'player')
      .order('created_at', { ascending: true }),

    supabase
      .from('chore_completions')
      .select('id, xp_awarded, gold_awarded')
      .eq('verified', false)
      .eq('household_id', householdId),

    supabase
      .from('story_chapters')
      .select('title, boss_name, boss_hp, boss_current_hp, week_number, chapter_number, is_unlocked')
      .eq('household_id', householdId)
      .order('week_number', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const totalPending = (pending ?? []).length
  const playerCount = (players ?? []).length

  // Sum of unverified XP — useful at a glance, less abstract than "4 items"
  const xpInQueue = (pending ?? []).reduce((acc, row) => acc + (row.xp_awarded ?? 0), 0)

  // Aggregate XP earned this week. The schema doesn't yet tag completions
  // with a week, so we approximate with this-week's verified completions.
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  weekStart.setHours(0, 0, 0, 0)
  const { data: weekRows } = await supabase
    .from('chore_completions')
    .select('xp_awarded')
    .eq('household_id', householdId)
    .eq('verified', true)
    .gte('verified_at', weekStart.toISOString())
  const weekXP = (weekRows ?? []).reduce((acc, r) => acc + (r.xp_awarded ?? 0), 0)

  // Total spendable gold across the household.
  const goldInCirculation = (players ?? []).reduce((acc, p) => acc + (p.gold ?? 0), 0)

  const bossHpPct = boss && boss.boss_hp
    ? Math.round(((boss.boss_current_hp ?? boss.boss_hp) / boss.boss_hp) * 100)
    : 0

  const chapterNum = boss?.chapter_number ?? boss?.week_number ?? 1
  const weekNum = boss?.week_number ?? 1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Greeting */}
      <div>
        <div
          className="font-pixel"
          style={{
            fontSize: 7,
            color: 'var(--qf-gold-400)',
            letterSpacing: '0.2em',
          }}
        >
          WEEK {weekNum} · CHAPTER {chapterNum}
        </div>
        <h1
          className="font-heading"
          style={{
            fontSize: 32,
            margin: '4px 0 4px',
            color: 'var(--qf-parchment)',
            fontWeight: 700,
            letterSpacing: '0.03em',
          }}
        >
          Welcome back, Game Master.
        </h1>
        <p
          style={{
            color: 'var(--qf-parchment-dim)',
            fontStyle: 'italic',
            margin: 0,
            fontSize: 14,
          }}
        >
          {totalPending > 0
            ? `The Hearthstone burned steadily through the night. ${totalPending} ${totalPending === 1 ? 'quest awaits' : 'quests await'} your verdict.`
            : 'The Hearthstone burned steadily through the night. The quest board is quiet.'}
        </p>
      </div>

      {/* Stat row */}
      <div className="dash-stat-grid">
        <StatCard
          label="QUESTS PENDING"
          value={totalPending}
          sub={totalPending === 1 ? 'awaiting your verdict' : 'awaiting your verdict'}
          accent="var(--qf-ember-bright)"
        />
        <StatCard
          label="THIS WEEK · XP"
          value={weekXP.toLocaleString()}
          sub={`across ${playerCount} ${playerCount === 1 ? 'Emberbearer' : 'Emberbearers'}`}
        />
        <StatCard
          label="BOSS HP"
          value={boss && boss.boss_name ? `${bossHpPct}%` : '—'}
          sub={boss?.boss_name ?? 'No active boss'}
          accent="var(--qf-error)"
        />
        <StatCard
          label="GOLD IN CIRCULATION"
          value={goldInCirculation.toLocaleString()}
          sub="across the household"
          accent="var(--qf-gold-200)"
        />
      </div>

      {/* Two cols: pending approvals + emberbearers */}
      <div className="dash-panels">
        {/* Approvals teaser */}
        <div
          className="qf-ornate-panel"
          style={{ padding: 18, display: 'flex', flexDirection: 'column' }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 12,
            }}
          >
            <div className="qf-scribed" style={{ fontSize: 11 }}>
              Awaiting Verification
            </div>
            <div
              className="font-pixel"
              style={{ fontSize: 7, color: 'var(--qf-parchment-muted)' }}
            >
              {totalPending} ITEMS · {xpInQueue.toLocaleString()} XP
            </div>
          </div>

          {totalPending === 0 ? (
            <div
              style={{
                padding: '2.5rem 1rem',
                textAlign: 'center',
                color: 'var(--qf-parchment-muted)',
                fontStyle: 'italic',
                fontSize: 13,
              }}
            >
              The board is clear. Every deed has its verdict.
            </div>
          ) : (
            <Link
              href="/dashboard/approvals"
              className="qf-btn-ghost"
              style={{
                textDecoration: 'none',
                textAlign: 'center',
                marginTop: 'auto',
              }}
            >
              Open Approvals →
            </Link>
          )}
        </div>

        {/* Emberbearers panel */}
        <div
          className="qf-ornate-panel"
          style={{ padding: 18, display: 'flex', flexDirection: 'column' }}
        >
          <div className="qf-scribed" style={{ fontSize: 11, marginBottom: 12 }}>
            The Emberbearers
          </div>

          {playerCount === 0 ? (
            <div
              style={{
                padding: '1.5rem 0',
                textAlign: 'center',
                color: 'var(--qf-parchment-muted)',
                fontStyle: 'italic',
                fontSize: 13,
              }}
            >
              No heroes recruited yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {(players ?? []).map((p) => {
                const level = p.level ?? 1
                const xpTotal = p.xp_total ?? 0
                const curLevelXP = xpForLevel(level)
                const nextLevelXP = xpForLevel(level + 1)
                const intoLevel = xpTotal - curLevelXP
                const needed = nextLevelXP - curLevelXP
                const pct = needed > 0 ? Math.round((intoLevel / needed) * 100) : 0

                return (
                  <div
                    key={p.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'auto 1fr',
                      gap: 12,
                      alignItems: 'center',
                    }}
                  >
                    <PixelAvatar klass={classKey(p.avatar_class)} size={48} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <div
                          className="font-heading"
                          style={{ fontSize: 14, color: 'var(--qf-parchment)' }}
                        >
                          {p.display_name}
                        </div>
                        <div
                          className="font-pixel"
                          style={{ fontSize: 7, color: 'var(--qf-gold-400)' }}
                        >
                          LV {level}
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: 'var(--qf-parchment-muted)',
                          fontStyle: 'italic',
                          marginBottom: 5,
                        }}
                      >
                        @{p.username}
                      </div>
                      <XPBar pct={pct} />
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginTop: 4,
                        }}
                      >
                        <span
                          className="font-pixel"
                          style={{
                            fontSize: 6,
                            color: 'var(--qf-parchment-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                          }}
                        >
                          <XPIcon size={10} />
                          {(p.xp_available ?? 0).toLocaleString()}
                        </span>
                        <span
                          className="font-pixel"
                          style={{
                            fontSize: 6,
                            color: 'var(--qf-gold-200)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                          }}
                        >
                          <Coin size={10} />
                          {(p.gold ?? 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div style={{ flex: 1 }} />
          <Link
            href="/dashboard/players"
            className="qf-btn-ghost"
            style={{ marginTop: 16, textAlign: 'center', textDecoration: 'none' }}
          >
            Manage Players
          </Link>
        </div>
      </div>
    </div>
  )
}
