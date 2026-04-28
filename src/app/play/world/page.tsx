import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ZoneManager from '@/components/player/ZoneManager'
import WorldCodex from '@/components/player/WorldCodex'

export const metadata = {
  title: 'Codex of Embervale | Quest Forge',
  description: 'Learn about the world of Embervale — its regions, characters, your class, and the Embershard.',
}

export default async function WorldPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('avatar_class, level')
    .eq('id', user.id)
    .single()

  return (
    <ZoneManager zone="hub">
      <WorldCodex
        playerClass={profile?.avatar_class ?? null}
        level={profile?.level ?? 1}
      />
    </ZoneManager>
  )
}
