import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileView from '@/components/play/ProfileView'
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

  // Fetch quest history, loot inventory, and education completions in parallel
  const [
    { data: rawCompletions },
    { data: rawPurchases },
    { data: rawEduCompletions },
    { count: totalVerifiedChores }
  ] = await Promise.all([
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
    supabase
      .from('edu_completions')
      .select('score, xp_awarded, edu_challenges (subject, difficulty)')
      .eq('player_id', user.id),
    supabase
      .from('chore_completions')
      .select('*', { count: 'exact', head: true })
      .eq('player_id', user.id)
      .eq('verified', true),
  ])

  // Shape the joined data
  const completions = (rawCompletions ?? [])
  const purchases   = (rawPurchases   ?? [])
  const eduCompletions = (rawEduCompletions ?? [])
  const verifiedChoresCount = totalVerifiedChores ?? 0

  // Character math
  const level       = profile.level        ?? 1
  const xpTotal     = profile.xp_total     ?? 0
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

  // ── Stat Calculation ───────────────────────────────────────────────────────
  const baseValue = 10 + (level * 2)

  const wisdomCompletions = eduCompletions.filter(c => 
    ['math', 'science', 'logic'].includes((c.edu_challenges as any)?.subject ?? '')
  )
  const wisdomBonus = wisdomCompletions.reduce((sum, c) => sum + (c.score > 0 ? 1 : 0), 0)

  const strengthCompletions = eduCompletions.filter(c => 
    ['vocabulary', 'word'].includes((c.edu_challenges as any)?.subject ?? '')
  )
  const strengthBonus = strengthCompletions.reduce((sum, c) => sum + (c.score > 0 ? 1 : 0), 0)

  const courageCompletions = eduCompletions.filter(c => 
    ['reading', 'history'].includes((c.edu_challenges as any)?.subject ?? '')
  )
  const courageBonus = courageCompletions.reduce((sum, c) => {
    let b = (c.score > 0 ? 1 : 0)
    if (c.score > 0 && ((c.edu_challenges as any)?.difficulty ?? 0) >= 3) b += 1
    return sum + b
  }, 0)

  const enduranceBonus = Math.floor(eduCompletions.length / 2) + verifiedChoresCount

  const stats = [
    { name: 'Strength',  value: baseValue + strengthBonus },
    { name: 'Wisdom',    value: baseValue + wisdomBonus },
    { name: 'Courage',   value: baseValue + courageBonus },
    { name: 'Endurance', value: baseValue + enduranceBonus },
  ]

  return (
    <ProfileView 
      profile={profile}
      classInfo={classInfo}
      stats={stats}
      completions={completions}
      purchases={purchases}
      accent={accent}
      accent2={accent2}
      primaryStat={primaryStat}
      xpIntoLevel={xpIntoLevel}
      xpNeeded={xpNeeded}
      progressPct={progressPct}
      shard={shard}
    />
  )
}
