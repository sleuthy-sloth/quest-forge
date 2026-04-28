import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import classesData from '@/lore/classes.json'
import { signOut } from '@/app/actions/auth'
import AvatarPreview from '@/components/avatar/AvatarPreview'
import NowDuelingCallout from '@/components/avatar/NowDuelingCallout'
import {
  XPBar,
  HPBar,
  XPIcon,
  BossSprite,
} from '@/components/qf'
import { embershardState, xpForLevel } from '@/lib/xp'
import { TEACHERS, SLUG_PRESET } from '@/lib/constants/academy'
import { ENEMY_PRESETS } from '@/lib/constants/enemies'

export default async function PlayerHomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_class, avatar_config, level, xp_total, xp_available, gold, household_id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    await signOut()
    redirect('/login')
  }
  if (!profile.avatar_class) redirect('/play/create-character')

  const classInfo = classesData.classes.find((c) => c.id === profile.avatar_class) ?? null

  // XP math — current level + progress + nextLevelXP
  const level       = profile.level ?? 1
  const xpTotal     = profile.xp_total ?? 0
  const curLevelXP  = xpForLevel(level)
  const nextLevelXP = xpForLevel(level + 1)
  const xpIntoLevel = xpTotal - curLevelXP
  const xpNeeded    = nextLevelXP - curLevelXP
  const xpPct       = xpNeeded > 0 ? Math.round((xpIntoLevel / xpNeeded) * 100) : 0
  const shard       = embershardState(level)

  // Determine the current active academy teacher
  const { data: eduCompletions } = await supabase
    .from('edu_completions')
    .select('challenge_id, score')
    .eq('player_id', user.id)
    .gt('score', 0)

  const { data: eduChallenges } = await supabase
    .from('edu_challenges')
    .select('id, subject')

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
  if (eduCompletions && eduChallenges) {
    const challengeSubjectMap = new Map(eduChallenges.map(c => [c.id, c.subject]))
    const subjectScores = new Map<string, number>()
    for (const comp of eduCompletions) {
      const subject = challengeSubjectMap.get(comp.challenge_id)
      if (subject) subjectScores.set(subject, (subjectScores.get(subject) ?? 0) + 1)
    }
    for (const [subject, slug] of Object.entries(subjectToSlug)) {
      if ((subjectScores.get(subject) ?? 0) >= 3) completedSlugs.add(slug)
    }
  }

  const currentTeacher = TEACHERS.find(t => !completedSlugs.has(t.slug)) ?? null
  const currentEnemy = currentTeacher ? ENEMY_PRESETS[currentTeacher.slug] ?? null : null
  const currentPreset = currentTeacher ? (SLUG_PRESET[currentTeacher.slug] ?? 'warrior') : 'warrior'

  // Active boss — is_unlocked=false means battle in progress;
  // the trigger sets is_unlocked=true only when boss_current_hp reaches 0.
  const { data: boss } = await supabase
    .from('story_chapters')
    .select('boss_name, boss_description, boss_hp, boss_current_hp, week_number, boss_sprite_config')
    .eq('household_id', profile.household_id)
    .eq('is_unlocked', false)
    .gt('boss_current_hp', 0)
    .order('week_number', { ascending: true })
    .limit(1)
    .maybeSingle()

  const bossHpPct = boss
    ? Math.round((boss.boss_current_hp / (boss.boss_hp || 1)) * 100)
    : 0
  const bossSpriteName =
    (boss?.boss_sprite_config as { base_sprite?: string } | null)?.base_sprite || 'eyeball'

  // Today's chores (presented as Quests) — assigned to this player or unassigned.
  const { data: chores } = await supabase
    .from('chores')
    .select('id, title, xp_reward, assigned_to')
    .eq('household_id', profile.household_id)
    .eq('is_active', true)
    .or(`assigned_to.eq.${user.id},assigned_to.is.null`)
    .order('created_at', { ascending: false })
    .limit(5)

  // Verified completions today — used to mark off finished quests.
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const { data: doneToday } = await supabase
    .from('chore_completions')
    .select('chore_id')
    .eq('player_id', user.id)
    .gte('completed_at', startOfDay.toISOString())
  const doneIds = new Set((doneToday ?? []).map((r) => r.chore_id))

  const todaysQuests = (chores ?? []).map((q) => ({
    id: q.id,
    title: q.title,
    xp: q.xp_reward,
    done: doneIds.has(q.id),
  }))
  const doneCount = todaysQuests.filter((q) => q.done).length

  return (
    <div style={{ padding: '4px 18px 16px' }}>
      {/* Hero card — character */}
      <div className="qf-ornate-panel" style={{ padding: 18, marginBottom: 14, position: 'relative' }}>
        <span className="qf-corner-tl" /><span className="qf-corner-tr" />
        <span className="qf-corner-bl" /><span className="qf-corner-br" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 64,
              height: 64,
              padding: 6,
              background: 'radial-gradient(circle, rgba(232,160,32,0.18), transparent 70%)',
              border: '1px solid var(--qf-rule-strong)',
            }}
          >
            <AvatarPreview avatarConfig={profile.avatar_config as Record<string, unknown> | null} size={52} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              className="font-pixel"
              style={{
                fontSize: 7,
                color: 'var(--qf-ember-bright)',
                letterSpacing: '0.16em',
              }}
            >
              {(classInfo?.name ?? profile.avatar_class).toUpperCase()}
            </div>
            <div
              className="font-heading qf-shimmer"
              style={{
                fontSize: 22,
                fontWeight: 700,
                marginTop: 2,
                letterSpacing: '0.02em',
                lineHeight: 1.1,
              }}
            >
              {profile.display_name}
            </div>
            <div
              style={{
                fontSize: 12,
                color: 'var(--qf-parchment-dim)',
                fontStyle: 'italic',
              }}
            >
              Embershard · {shard}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div
              className="font-heading"
              style={{ fontSize: 22, color: 'var(--qf-gold-300)', fontWeight: 700 }}
            >
              {level}
            </div>
            <div
              className="font-pixel"
              style={{
                fontSize: 6,
                color: 'var(--qf-parchment-muted)',
                letterSpacing: '0.12em',
              }}
            >
              LEVEL
            </div>
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <div
            style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}
          >
            <span
              className="font-pixel"
              style={{
                fontSize: 6,
                color: 'var(--qf-parchment-muted)',
                letterSpacing: '0.12em',
              }}
            >
              XP TO LV {level + 1}
            </span>
            <span
              className="font-pixel"
              style={{ fontSize: 6, color: 'var(--qf-gold-300)' }}
            >
              {xpIntoLevel.toLocaleString()} / {xpNeeded.toLocaleString()}
            </span>
          </div>
          <XPBar pct={xpPct} />
        </div>
      </div>

      {/* Boss banner */}
      {boss && boss.boss_name ? (
        <div
          style={{
            position: 'relative',
            padding: 16,
            marginBottom: 14,
            background:
              'linear-gradient(180deg, rgba(196,58,0,0.15) 0%, rgba(15,17,24,0.8) 100%), var(--qf-bg-card-alt)',
            border: '1px solid var(--qf-ember-deep)',
            overflow: 'hidden',
          }}
        >
          <span className="qf-corner-tl" /><span className="qf-corner-tr" />
          <span className="qf-corner-bl" /><span className="qf-corner-br" />
          <div
            style={{ position: 'absolute', top: -8, right: -10, opacity: 0.9 }}
            className="qf-boss-bob"
            aria-hidden="true"
          >
            <BossSprite name={bossSpriteName} scale={1.5} />
          </div>
          <div
            className="font-pixel"
            style={{
              fontSize: 7,
              color: 'var(--qf-ember-bright)',
              letterSpacing: '0.18em',
            }}
          >
            WEEK {boss.week_number ?? 1} · BOSS
          </div>
          <div
            className="font-heading qf-flicker"
            style={{
              fontSize: 20,
              color: 'var(--qf-parchment)',
              marginTop: 4,
              fontWeight: 700,
              letterSpacing: '0.04em',
            }}
          >
            {boss.boss_name}
          </div>
          {boss.boss_description && (
            <div
              style={{
                fontSize: 12,
                color: 'var(--qf-parchment-dim)',
                fontStyle: 'italic',
                margin: '4px 0 12px',
                maxWidth: '70%',
              }}
            >
              &ldquo;{boss.boss_description}&rdquo;
            </div>
          )}
          <HPBar
            pct={bossHpPct}
            label="HP"
            value={`${boss.boss_current_hp.toLocaleString()} / ${boss.boss_hp.toLocaleString()}`}
          />
        </div>
      ) : (
        <div
          style={{
            padding: '14px 16px',
            marginBottom: 14,
            background: 'rgba(255,255,255,0.02)',
            border: '1px dashed rgba(255,255,255,0.08)',
            textAlign: 'center',
          }}
        >
          <span
            className="font-pixel"
            style={{
              fontSize: 7,
              color: 'var(--qf-parchment-muted)',
              letterSpacing: '0.16em',
            }}
          >
            NO ACTIVE THREAT — THE REALM IS AT PEACE
          </span>
        </div>
      )}

      {/* Now Dueling callout */}
      {currentTeacher && currentEnemy && (
        <NowDuelingCallout
          teacher={currentTeacher}
          enemy={currentEnemy}
          animationPreset={currentPreset}
        />
      )}

      {/* Today's chores preview */}
      <div style={{ marginBottom: 14 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}
        >
          <div className="qf-scribed" style={{ fontSize: 10 }}>
            Today&rsquo;s Chores
          </div>
          {todaysQuests.length > 0 && (
            <span
              className="font-pixel"
              style={{ fontSize: 6, color: 'var(--qf-gold-400)' }}
            >
              {doneCount} OF {todaysQuests.length}
            </span>
          )}
        </div>
        {todaysQuests.length === 0 ? (
          <div
            style={{
              padding: '1.25rem 1rem',
              textAlign: 'center',
              background: 'rgba(255,255,255,0.015)',
              border: '1px dashed rgba(201,168,76,0.10)',
              fontSize: 12,
              color: 'var(--qf-parchment-muted)',
              fontStyle: 'italic',
            }}
          >
            No quests today. The Game Master must post deeds.
          </div>
        ) : (
          todaysQuests.map((q) => (
            <div
              key={q.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                background: q.done ? 'rgba(90,171,110,0.06)' : 'var(--qf-bg-card)',
                border: '1px solid ' + (q.done ? 'rgba(90,171,110,0.3)' : 'var(--qf-rule)'),
                marginBottom: 6,
                opacity: q.done ? 0.7 : 1,
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  border: '2px solid ' + (q.done ? 'var(--qf-success)' : 'var(--qf-gold-500)'),
                  background: q.done ? 'var(--qf-success)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--qf-bg-void)',
                  fontSize: 12,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {q.done && '✓'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  className="font-heading"
                  style={{
                    fontSize: 13,
                    color: 'var(--qf-parchment)',
                    textDecoration: q.done ? 'line-through' : 'none',
                    textDecorationColor: 'var(--qf-parchment-muted)',
                  }}
                >
                  {q.title}
                </div>
              </div>
              <span
                className="font-pixel"
                style={{
                  fontSize: 7,
                  color: 'var(--qf-gold-300)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <XPIcon size={10} />+{q.xp}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Inventory teaser — passes to wallet/profile when implemented */}
      <div className="qf-ornate-panel" style={{ padding: 14 }}>
        <div
          className="font-pixel"
          style={{
            fontSize: 6,
            color: 'var(--qf-ember-bright)',
            letterSpacing: '0.18em',
            marginBottom: 6,
          }}
        >
          PURSE
        </div>
        <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <div>
            <div
              className="font-heading"
              style={{ fontSize: 18, color: 'var(--qf-gold-300)', fontWeight: 700 }}
            >
              {(profile.xp_available ?? 0).toLocaleString()}
            </div>
            <div
              className="font-pixel"
              style={{
                fontSize: 6,
                color: 'var(--qf-parchment-muted)',
                letterSpacing: '0.1em',
              }}
            >
              SPENDABLE XP
            </div>
          </div>
          <div>
            <div
              className="font-heading"
              style={{ fontSize: 18, color: 'var(--qf-gold-200)', fontWeight: 700 }}
            >
              {(profile.gold ?? 0).toLocaleString()}
            </div>
            <div
              className="font-pixel"
              style={{
                fontSize: 6,
                color: 'var(--qf-parchment-muted)',
                letterSpacing: '0.1em',
              }}
            >
              GOLD
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
