import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AvatarPreview from '@/components/avatar/AvatarPreview'
import DuelCard from '@/components/avatar/DuelCard'
import { GAMES, TEACHERS, deriveTier, XP_RANGE, TIER_LABEL } from '@/lib/constants/academy'
import { ENEMY_PRESETS } from '@/lib/constants/enemies'
import type { TeacherStatus } from '@/lib/constants/academy'

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

  // Determine which subjects this player has completed (≥1 passing score)
  const { data: completions } = await supabase
    .from('edu_completions')
    .select('challenge_id, score')
    .eq('player_id', user.id)
    .gt('score', 0)

  // Fetch edu_challenges to map challenge_id → subject
  const { data: challenges } = await supabase
    .from('edu_challenges')
    .select('id, subject')

  const subjectScores = new Map<string, number[]>()
  if (completions && challenges) {
    const challengeSubjectMap = new Map(challenges.map(c => [c.id, c.subject]))
    for (const comp of completions) {
      const subject = challengeSubjectMap.get(comp.challenge_id)
      if (subject) {
        const existing = subjectScores.get(subject) ?? []
        existing.push(comp.score)
        subjectScores.set(subject, existing)
      }
    }
  }

  // Map SUBJECT_TO_SLUG keys → completed subjects
  const subjectToSlug: Record<string, string> = {
    math:       'math-arena',
    word:       'word-forge',
    science:    'science-labyrinth',
    reading:    'reading-tome',
    history:    'history-scroll',
    vocabulary: 'vocab-duel',
    logic:      'logic-gate',
  }
  const completedSlugs = new Set<string>()
  for (const [subject, slug] of Object.entries(subjectToSlug)) {
    const scores = subjectScores.get(subject) ?? []
    if (scores.length >= 3) completedSlugs.add(slug)
  }

  // Derive status for each teacher: defeated → current → available
  let foundCurrent = false
  const teacherStatuses = TEACHERS.map(t => {
    if (completedSlugs.has(t.slug)) return 'defeated' as TeacherStatus
    if (!foundCurrent) {
      foundCurrent = true
      return 'current' as TeacherStatus
    }
    return 'available' as TeacherStatus
  })

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--qf-bg-void)',
        paddingBottom: 32,
      }}
    >
      {/* ── Page Header ── */}
      <div style={{ textAlign: 'center', padding: '28px 16px 20px' }}>
        <div
          className="font-pixel"
          style={{
            fontSize: 7,
            color: 'var(--qf-ember-bright)',
            letterSpacing: '0.25em',
            marginBottom: 6,
          }}
        >
          THE FACULTY DUEL
        </div>
        <h1
          className="font-heading qf-shimmer"
          style={{
            fontSize: 22,
            margin: '4px 0 2px',
            fontWeight: 700,
            fontStyle: 'italic',
          }}
        >
          Seven Teachers, Seven Trials
        </h1>
        <p
          style={{
            color: 'var(--qf-parchment-dim)',
            fontStyle: 'italic',
            margin: '0 0 6px',
            fontSize: 12,
            lineHeight: 1.4,
          }}
        >
          Each instructor guards a discipline. Best them in single combat.
        </p>
      </div>

      <div className="px-4" style={{ maxWidth: 480, margin: '0 auto' }}>

        {/* ── Hero Bar ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'linear-gradient(135deg, rgba(26,28,46,0.9), rgba(18,19,31,0.9))',
            border: '1px solid var(--qf-rule)',
            borderRadius: 4,
            padding: '10px 12px',
            marginBottom: 20,
          }}
        >
          <div style={{ flexShrink: 0 }}>
            <AvatarPreview avatarConfig={profile.avatar_config as Record<string, unknown> | null} size={48} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              className="font-pixel"
              style={{
                fontSize: 8,
                color: 'var(--qf-parchment)',
                marginBottom: 4,
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
                fontSize: 12,
                color: 'var(--qf-parchment-muted)',
                textTransform: 'capitalize',
              }}
            >
              {profile.avatar_class ?? 'Emberbearer'} · Lv {level}
            </div>
          </div>
          <div
            className="font-pixel"
            style={{
              flexShrink: 0,
              fontSize: 6,
              color: 'var(--qf-magic)',
              background: 'rgba(60,20,120,0.4)',
              border: '1px solid rgba(138,90,200,0.4)',
              borderRadius: 3,
              padding: '5px 7px',
              whiteSpace: 'nowrap',
              letterSpacing: '1px',
            }}
          >
            {tierLabel}
          </div>
        </div>

        {/* ── Faculty progress ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 16,
          }}
        >
          <div className="qf-scribed" style={{ fontSize: 10 }}>Faculty Roster</div>
          <span className="font-pixel" style={{ fontSize: 6, color: 'var(--qf-gold-400)' }}>
            {completedSlugs.size} OF {TEACHERS.length} DEFEATED
          </span>
        </div>

        {/* ── Duel cards ── */}
        <div role="list" aria-label="Academy faculty roster">
          {TEACHERS.map((teacher, idx) => {
            const enemy = ENEMY_PRESETS[teacher.slug]
            if (!enemy) return null
            const status = teacherStatuses[idx]
            return (
              <div key={teacher.slug} role="listitem">
                <DuelCard
                  teacher={teacher}
                  enemy={enemy}
                  status={status}
                  playerAvatarConfig={profile.avatar_config as Record<string, unknown> | null}
                  playerName={profile.display_name}
                  playerLevel={level}
                  playerClass={profile.avatar_class ?? 'blazewarden'}
                  xpRange={xpRange}
                />
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
