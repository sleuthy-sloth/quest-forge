import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Chip, XPIcon, Coin } from '@/components/qf'

const DIFF_COLOR: Record<string, string> = {
  easy:   'var(--qf-success)',
  medium: 'var(--qf-gold-300)',
  hard:   'var(--qf-ember-bright)',
  epic:   'var(--qf-magic)',
}

function difficultyLabel(d: string): string {
  return d.charAt(0).toUpperCase() + d.slice(1)
}

export default async function GMQuestsPage() {
  const supabase = await createClient()

  // RLS scopes by household. Players are joined client-side via a Map for
  // the assignee column rather than a Postgres join — the player set is
  // tiny (~6 rows) and the join column varies.
  const [
    { data: quests },
    { data: players },
  ] = await Promise.all([
    supabase
      .from('quests')
      .select('id, title, description, difficulty, xp_reward, gold_reward, assigned_to, is_active, is_boss, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false }),

    supabase
      .from('profiles')
      .select('id, display_name')
      .eq('role', 'player'),
  ])

  const playerById = new Map((players ?? []).map(p => [p.id, p.display_name]))
  const rows = quests ?? []

  const counts = {
    all:    rows.length,
    easy:   rows.filter(r => r.difficulty === 'easy').length,
    medium: rows.filter(r => r.difficulty === 'medium').length,
    hard:   rows.filter(r => r.difficulty === 'hard').length,
    epic:   rows.filter(r => r.difficulty === 'epic').length,
    boss:   rows.filter(r => r.is_boss).length,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div
          className="qg-head-row"
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
          }}
        >
        <div>
          <div
            className="font-pixel"
            style={{
              fontSize: 7,
              color: 'var(--qf-gold-400)',
              letterSpacing: '0.18em',
            }}
          >
            THE QUEST BOARD
          </div>
          <h1
            className="font-heading"
            style={{
              fontSize: 28,
              margin: '4px 0 0',
              color: 'var(--qf-parchment)',
              fontWeight: 700,
            }}
          >
            Active Quests
          </h1>
          <p
            style={{
              color: 'var(--qf-parchment-dim)',
              fontStyle: 'italic',
              margin: '2px 0 0',
              fontSize: 13,
            }}
          >
            Tasks the Emberbearers may take up. AI flavor text turns chores into deeds.
          </p>
        </div>
        <Link href="/dashboard/quests/new" className="qf-btn" style={{ textDecoration: 'none' }}>
          + Forge New Quest
        </Link>
      </div>

      {/* Quick filter chips — decorative in this iteration; client-side
          filtering can be wired later when the volume warrants it. */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[
          { key: 'all',    label: `All Quests · ${counts.all}` },
          { key: 'easy',   label: `Easy · ${counts.easy}` },
          { key: 'medium', label: `Medium · ${counts.medium}` },
          { key: 'hard',   label: `Hard · ${counts.hard}` },
          { key: 'epic',   label: `Epic · ${counts.epic}` },
          { key: 'boss',   label: `Boss · ${counts.boss}` },
        ].map((f, i) => (
          <div
            key={f.key}
            style={{
              padding: '6px 12px',
              border: `1px solid ${i === 0 ? 'var(--qf-gold-400)' : 'var(--qf-rule)'}`,
              background: i === 0 ? 'rgba(232,160,32,0.08)' : 'transparent',
              fontFamily: 'var(--font-heading), Cinzel, serif',
              fontSize: 11,
              color: i === 0 ? 'var(--qf-gold-300)' : 'var(--qf-parchment-dim)',
              letterSpacing: '0.06em',
            }}
          >
            {f.label}
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="qf-ornate-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          className="qg-header"
          style={{
            display: 'grid',
            gridTemplateColumns: '2.5fr 1fr 1fr 0.8fr',
            padding: '10px 18px',
            gap: 12,
            borderBottom: '1px solid var(--qf-rule)',
            background: 'rgba(0,0,0,0.2)',
          }}
        >
          {['Quest', 'Difficulty', 'Assigned', 'Reward'].map((h) => (
            <div
              key={h}
              className="font-pixel"
              style={{
                fontSize: 7,
                color: 'var(--qf-parchment-muted)',
                letterSpacing: '0.14em',
              }}
            >
              {h}
            </div>
          ))}
        </div>

        {rows.length === 0 ? (
          <div
            style={{
              padding: '3.5rem 2rem',
              textAlign: 'center',
              color: 'var(--qf-parchment-muted)',
              fontStyle: 'italic',
              fontSize: 14,
            }}
          >
            The quest board is empty. Forge a new decree to begin.
          </div>
        ) : (
          rows.map((q, i) => {
            const accent = DIFF_COLOR[q.difficulty] ?? 'var(--qf-gold-300)'
            return (
                <div
                  key={q.id}
                  className="qg-row"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2.5fr 1fr 1fr 0.8fr',
                    padding: '12px 18px',
                    gap: 12,
                    alignItems: 'center',
                    borderBottom: i < rows.length - 1 ? '1px solid var(--qf-rule)' : 'none',
                  }}
                >
                <div>
                  <div
                    className="font-heading"
                    style={{
                      fontSize: 14,
                      color: 'var(--qf-parchment)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    {q.title}
                    {q.is_boss && <Chip color="var(--qf-ember-bright)">Boss</Chip>}
                  </div>
                  {q.description && (
                    <div
                      style={{
                        fontSize: 12,
                        color: 'var(--qf-parchment-muted)',
                        fontStyle: 'italic',
                        marginTop: 2,
                      }}
                    >
                      &ldquo;{q.description}&rdquo;
                    </div>
                  )}
                </div>
                <div>
                  <Chip color={accent}>{difficultyLabel(q.difficulty)}</Chip>
                </div>
                <div
                  className="font-heading qg-assignee"
                  style={{ fontSize: 13, color: 'var(--qf-parchment)' }}
                >
                  {q.assigned_to ? (playerById.get(q.assigned_to) ?? 'Unknown') : 'Everyone'}
                </div>
                <div className="qg-rewards" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span
                    className="font-pixel"
                    style={{
                      fontSize: 8,
                      color: 'var(--qf-gold-300)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <XPIcon size={11} /> +{q.xp_reward}
                  </span>
                  {q.gold_reward > 0 && (
                    <span
                      className="font-pixel"
                      style={{
                        fontSize: 8,
                        color: 'var(--qf-gold-200)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Coin size={11} /> +{q.gold_reward}
                    </span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
