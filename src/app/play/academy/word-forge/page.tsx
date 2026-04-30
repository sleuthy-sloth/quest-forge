import { redirect } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/server'
import { derivePlayerPreset } from '@/lib/constants/academy'
import ZoneManager from '@/components/player/ZoneManager'

const WordForge = dynamic(() => import('@/components/games/WordForge'), {
  loading: () => <div className="min-h-[80vh] flex items-center justify-center text-[#c9a84c]/40 font-pixel text-xs tracking-widest animate-pulse">Firing up the forge...</div>,
  ssr: true,
})

export default async function WordForgePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, age, avatar_config, household_id, avatar_class')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')
  if (!profile.avatar_class) redirect('/play/create-character')

  const ageTier: 'junior' | 'senior' =
    profile.age != null && profile.age >= 11 ? 'senior' : 'junior'
  const playerPreset = derivePlayerPreset(profile.avatar_class)

  return (
    <ZoneManager zone="academy">
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
          playerPreset={playerPreset}
        />
      </div>
    </ZoneManager>
  )
}
