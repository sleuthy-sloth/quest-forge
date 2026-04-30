import { redirect } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import { derivePlayerPreset } from '@/lib/constants/academy'
import ZoneManager from '@/components/player/ZoneManager'

const MathArena = dynamic(() => import('@/components/games/MathArena'), {
  loading: () => <div className="min-h-[80vh] flex items-center justify-center text-[#c9a84c]/40 font-pixel text-xs tracking-widest animate-pulse">Preparing the arena...</div>,
  ssr: true,
})

export default async function MathArenaPage() {
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
          background: 'var(--qf-bg-void)',
          paddingBottom: '32px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Scenic Background */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.2 }}>
          <Image
            src="/images/lore/heartwood.png"
            alt=""
            fill
            style={{ objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, transparent 0%, var(--qf-bg-void) 90%)' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <MathArena
            ageTier={ageTier}
            householdId={profile.household_id}
            playerId={user.id}
            avatarConfig={profile.avatar_config as Record<string, unknown> | null}
            displayName={profile.display_name}
            playerPreset={playerPreset}
          />
        </div>
      </div>
    </ZoneManager>
  )
}
