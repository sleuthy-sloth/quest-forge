import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import WordForge from '@/components/games/WordForge'

export default async function WordForgePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, age, avatar_config, household_id, level, avatar_class, xp_total, xp_available')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')
  if (!profile.avatar_class) redirect('/play/create-character')

  const ageTier: 'junior' | 'senior' =
    profile.age != null && profile.age >= 11 ? 'senior' : 'junior'

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a0f1e 0%, #040812 100%)',
        paddingBottom: '32px',
      }}
    >
      <WordForge
        ageTier={ageTier}
        householdId={profile.household_id}
        playerId={user.id}
        avatarConfig={profile.avatar_config as Record<string, unknown> | null}
        displayName={profile.display_name}
        xpTotal={profile.xp_total ?? 0}
        xpAvailable={profile.xp_available ?? 0}
      />
    </div>
  )
}
