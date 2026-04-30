import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { xpForLevel } from '@/lib/xp'

export const metadata = {
  title: 'Progress Reports | Quest Forge',
  description: 'Track weekly XP, level-up milestones, and boss contributions across your household.',
}

// ── Helpers ────────────────────────────────────────────────────────────────

function getWeekId(dateStr: string): string {
  const d = new Date(dateStr)
  // Get the Monday of the week
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  return monday.toISOString().slice(0, 10)
}

interface WeekRow {
  week: string
  choresXp: number
  eduXp: number
  total: number
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function ProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('household_id, role')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')
  if (profile.role !== 'gm') redirect('/play')

  const householdId = profile.household_id

  // ── Fetch data in parallel ──────────────────────────────────────────────

  const [
    { data: players },
    { data: choreCompletions },
    { data: eduCompletions },
    { data: chapters },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, display_name, level, xp_total, xp_available, gold')
      .eq('household_id', householdId)
      .eq('role', 'player')
      .order('created_at', { ascending: true }),

    supabase
      .from('chore_completions')
      .select('xp_awarded, completed_at')
      .eq('household_id', householdId),

    supabase
      .from('edu_completions')
      .select('xp_awarded, completed_at')
      .eq('household_id', householdId),

    supabase
      .from('story_chapters')
      .select('week_number, boss_name, boss_hp, boss_current_hp, is_unlocked')
      .eq('household_id', householdId)
      .order('week_number', { ascending: true }),
  ])

  // ── Weekly XP aggregation ───────────────────────────────────────────────

  const weekMap = new Map<string, WeekRow>()

  // Generate last 8 weeks
  const now = new Date()
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i * 7)
    const weekId = getWeekId(d.toISOString())
    if (!weekMap.has(weekId)) {
      weekMap.set(weekId, { week: weekId, choresXp: 0, eduXp: 0, total: 0 })
    }
  }

  for (const c of (choreCompletions ?? [])) {
    const wk = getWeekId(c.completed_at)
    if (weekMap.has(wk)) {
      const row = weekMap.get(wk)!
      row.choresXp += c.xp_awarded ?? 0
      row.total += c.xp_awarded ?? 0
    }
  }

  for (const e of (eduCompletions ?? [])) {
    const wk = getWeekId(e.completed_at)
    if (weekMap.has(wk)) {
      const row = weekMap.get(wk)!
      row.eduXp += e.xp_awarded ?? 0
      row.total += e.xp_awarded ?? 0
    }
  }

  const weeklyData = Array.from(weekMap.values()).sort((a, b) => a.week.localeCompare(b.week))
  const grandTotal = weeklyData.reduce((acc, r) => acc + r.total, 0)

  // ── Boss status ─────────────────────────────────────────────────────────

  const activeBoss = chapters?.find(ch => !ch.is_unlocked && (ch.boss_current_hp ?? 0) > 0)
  const defeatedChapters = chapters?.filter(ch => ch.is_unlocked || (ch.boss_current_hp ?? 0) === 0) ?? []

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── Header ── */}
      <div>
        <div className="font-pixel" style={{ fontSize: 10, color: 'var(--qf-gold-400)', letterSpacing: '0.2em' }}>
          HOUSEHOLD PROGRESS
        </div>
        <h1 className="font-heading" style={{ fontSize: 32, margin: '4px 0 4px', color: 'var(--qf-parchment)', fontWeight: 700 }}>
          Progress Reports
        </h1>
        <p style={{ color: 'var(--qf-parchment-dim)', fontStyle: 'italic', margin: 0, fontSize: 14 }}>
          Weekly XP earned, player milestones, and boss contributions across your household.
        </p>
      </div>

      {/* ── Section 1: Weekly XP ── */}
      <div className="qf-ornate-panel" style={{ padding: 20 }}>
        <div className="qf-scribed" style={{ fontSize: 13, marginBottom: 16 }}>
          Weekly XP Overview
        </div>

        {weeklyData.length === 0 ? (
          <div style={{ padding: '1.5rem 0', textAlign: 'center', color: 'var(--qf-parchment-muted)', fontStyle: 'italic' }}>
            No XP data recorded yet. Complete chores and challenges to see your progress.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--qf-rule)', color: 'var(--qf-parchment-dim)' }}>
                  <th className="font-pixel" style={{ padding: '8px 12px', textAlign: 'left', fontSize: 9, letterSpacing: '0.1em' }}>Week</th>
                  <th className="font-pixel" style={{ padding: '8px 12px', textAlign: 'right', fontSize: 9, letterSpacing: '0.1em' }}>Chores XP</th>
                  <th className="font-pixel" style={{ padding: '8px 12px', textAlign: 'right', fontSize: 9, letterSpacing: '0.1em' }}>Education XP</th>
                  <th className="font-pixel" style={{ padding: '8px 12px', textAlign: 'right', fontSize: 9, letterSpacing: '0.1em' }}>Total XP</th>
                </tr>
              </thead>
              <tbody>
                {weeklyData.map((row) => (
                  <tr key={row.week} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td className="font-heading" style={{ padding: '10px 12px', color: 'var(--qf-parchment)' }}>
                      {row.week}
                    </td>
                    <td className="font-pixel" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--qf-gold-300)', fontSize: 10 }}>
                      {row.choresXp.toLocaleString()}
                    </td>
                    <td className="font-pixel" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--qf-magic)', fontSize: 10 }}>
                      {row.eduXp.toLocaleString()}
                    </td>
                    <td className="font-pixel" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--qf-ember-bright)', fontSize: 10 }}>
                      {row.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid var(--qf-gold-400)' }}>
                  <td className="font-heading" style={{ padding: '10px 12px', color: 'var(--qf-gold-400)', fontWeight: 700 }}>Total (8 weeks)</td>
                  <td className="font-pixel" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--qf-gold-300)', fontSize: 10 }}>
                    {weeklyData.reduce((a, r) => a + r.choresXp, 0).toLocaleString()}
                  </td>
                  <td className="font-pixel" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--qf-magic)', fontSize: 10 }}>
                    {weeklyData.reduce((a, r) => a + r.eduXp, 0).toLocaleString()}
                  </td>
                  <td className="font-pixel" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--qf-ember-bright)', fontSize: 10 }}>
                    {grandTotal.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* ── Section 2: Player Level-Up Timeline ── */}
      <div className="qf-ornate-panel" style={{ padding: 20 }}>
        <div className="qf-scribed" style={{ fontSize: 13, marginBottom: 16 }}>
          Emberbearer Progress
        </div>

        {!players || players.length === 0 ? (
          <div style={{ padding: '1.5rem 0', textAlign: 'center', color: 'var(--qf-parchment-muted)', fontStyle: 'italic' }}>
            No players have joined this household yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {players.map((p) => {
              const level = p.level ?? 1
              const xpTotal = p.xp_total ?? 0
              const curLevelXP = xpForLevel(level)
              const nextLevelXP = xpForLevel(level + 1)
              const intoLevel = xpTotal - curLevelXP
              const needed = nextLevelXP - curLevelXP
              const pct = needed > 0 ? Math.round((intoLevel / needed) * 100) : 0

              return (
                <div key={p.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--qf-rule)',
                }}>
                  {/* Avatar initial */}
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: 'var(--qf-gold-400)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#1a140c',
                    fontWeight: 700,
                    fontSize: 18,
                    fontFamily: 'var(--font-heading)',
                    flexShrink: 0,
                  }}>
                    {p.display_name.charAt(0)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
                      <span className="font-heading" style={{ fontSize: 16, color: 'var(--qf-parchment)' }}>
                        {p.display_name}
                      </span>
                      <span className="font-pixel" style={{ fontSize: 9, color: 'var(--qf-gold-400)' }}>
                        LV {level}
                      </span>
                    </div>

                    {/* XP Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--qf-gold-400)', borderRadius: 4, transition: 'width 0.3s' }} />
                      </div>
                      <span className="font-pixel" style={{ fontSize: 8, color: 'var(--qf-parchment-dim)', whiteSpace: 'nowrap' }}>
                        {intoLevel.toLocaleString()} / {needed.toLocaleString()}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 20, marginTop: 6 }}>
                      <span className="font-pixel" style={{ fontSize: 8, color: 'var(--qf-parchment-muted)' }}>
                        Total XP: {xpTotal.toLocaleString()}
                      </span>
                      <span className="font-pixel" style={{ fontSize: 8, color: 'var(--qf-gold-200)' }}>
                        Gold: {(p.gold ?? 0).toLocaleString()}
                      </span>
                      <span className="font-pixel" style={{ fontSize: 8, color: 'var(--qf-gold-300)' }}>
                        Spendable: {(p.xp_available ?? 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Section 3: Boss Contribution Breakdown ── */}
      <div className="qf-ornate-panel" style={{ padding: 20 }}>
        <div className="qf-scribed" style={{ fontSize: 13, marginBottom: 16 }}>
          Boss Chronicle
        </div>

        {!chapters || chapters.length === 0 ? (
          <div style={{ padding: '1.5rem 0', textAlign: 'center', color: 'var(--qf-parchment-muted)', fontStyle: 'italic' }}>
            No story chapters found. Seed the story from the Story Management page.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--qf-rule)', color: 'var(--qf-parchment-dim)' }}>
                  <th className="font-pixel" style={{ padding: '8px 12px', textAlign: 'left', fontSize: 9, letterSpacing: '0.1em' }}>Week</th>
                  <th className="font-pixel" style={{ padding: '8px 12px', textAlign: 'left', fontSize: 9, letterSpacing: '0.1em' }}>Boss</th>
                  <th className="font-pixel" style={{ padding: '8px 12px', textAlign: 'right', fontSize: 9, letterSpacing: '0.1em' }}>HP</th>
                  <th className="font-pixel" style={{ padding: '8px 12px', textAlign: 'right', fontSize: 9, letterSpacing: '0.1em' }}>Remaining</th>
                  <th className="font-pixel" style={{ padding: '8px 12px', textAlign: 'center', fontSize: 9, letterSpacing: '0.1em' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {chapters.filter(ch => ch.boss_name).map((ch) => {
                  const hp = ch.boss_hp ?? 0
                  const current = ch.boss_current_hp ?? 0
                  const isActive = !ch.is_unlocked && current > 0
                  const isDefeated = ch.is_unlocked || current === 0

                  let statusText = 'Upcoming'
                  let statusColor = 'var(--qf-parchment-muted)'
                  if (isActive) {
                    statusText = '⚔ Active'
                    statusColor = 'var(--qf-ember-bright)'
                  } else if (isDefeated && ch.is_unlocked) {
                    statusText = '✓ Defeated'
                    statusColor = 'var(--qf-success)'
                  }

                  return (
                    <tr key={ch.week_number} style={{
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      opacity: isActive ? 1 : isDefeated ? 0.7 : 0.4,
                    }}>
                      <td className="font-pixel" style={{ padding: '10px 12px', color: 'var(--qf-parchment)', fontSize: 10 }}>
                        {ch.week_number}
                      </td>
                      <td className="font-heading" style={{ padding: '10px 12px', color: 'var(--qf-parchment)' }}>
                        {ch.boss_name}
                      </td>
                      <td className="font-pixel" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--qf-parchment-dim)', fontSize: 10 }}>
                        {hp.toLocaleString()}
                      </td>
                      <td className="font-pixel" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--qf-ember-bright)', fontSize: 10 }}>
                        {isActive ? current.toLocaleString() : '—'}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <span className="font-pixel" style={{ fontSize: 8, color: statusColor, letterSpacing: '0.08em' }}>
                          {statusText}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}