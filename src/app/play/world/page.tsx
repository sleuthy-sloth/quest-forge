import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ZoneManager from '@/components/player/ZoneManager'
import WorldCodex from '@/components/player/WorldCodex'

export const metadata = {
  title: 'Codex of Embervale | Quest Forge',
  description: 'Learn about the world of Embervale — its regions, characters, your class, and the Embershard.',
  icons: {
    icon: '/images/ui/icons/icon_embershard.png',
    apple: '/images/ui/icons/icon_embershard_radiant.png',
  },
}

export default async function WorldPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('avatar_class, level, household_id')
    .eq('id', user.id)
    .single()

  const { data: householdPlayers } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_class, avatar_config, level, story_chapter')
    .eq('household_id', profile?.household_id ?? '')
    .eq('role', 'player')

  const { data: eduCompletions } = await supabase
    .from('edu_completions')
    .select('edu_challenges(subject)')
    .eq('player_id', user.id)

  const { data: bossDefeats } = await supabase
    .from('boss_defeats')
    .select('boss_id')
    .eq('household_id', profile?.household_id ?? '')

  return (
    <ZoneManager zone="hub">
      <WorldCodex
        playerClass={profile?.avatar_class ?? null}
        level={profile?.level ?? 1}
        householdPlayers={householdPlayers ?? []}
        eduCompletions={eduCompletions ?? []}
        bossDefeats={bossDefeats ?? []}
      />
    </ZoneManager>
  )
}
