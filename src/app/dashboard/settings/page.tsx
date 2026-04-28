import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader, PageDivider } from '@/components/qf'
import InviteGmForm from '@/components/dashboard/InviteGmForm'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, role, household_id')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'gm') redirect('/play')

  // Fetch all GMs in this household
  const { data: gms } = await supabase
    .from('profiles')
    .select('id, display_name, created_at')
    .eq('household_id', profile.household_id)
    .eq('role', 'gm')
    .order('created_at', { ascending: true })

  const gmList = gms ?? []

  return (
    <div style={{ maxWidth: 720 }}>
      <PageHeader
        kicker="HEARTHHOLD CONFIGURATION"
        title="Settings"
        sub="Account details and credits for The Emberlight Chronicles."
      />

      {/* Account */}
      <PageDivider>Account</PageDivider>
      <div className="qf-ornate-panel" style={{ padding: 18, marginBottom: 18 }}>
        {[
          { label: 'Game Master', value: profile.display_name },
          { label: 'Role', value: 'GM' },
          { label: 'Household ID', value: profile.household_id, mono: true },
        ].map((row, i, all) => (
          <div
            key={row.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.6rem 0',
              borderBottom: i < all.length - 1 ? '1px solid var(--qf-rule)' : 'none',
              fontFamily: 'var(--font-heading), Cinzel, serif',
              fontSize: 13,
              color: 'var(--qf-parchment)',
            }}
          >
            <span>{row.label}</span>
            <span
              style={{
                color: 'var(--qf-parchment-dim)',
                fontFamily: row.mono ? 'monospace' : undefined,
                fontSize: row.mono ? 11 : undefined,
              }}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* Co-GMs */}
      <PageDivider>Game Masters</PageDivider>
      <div className="qf-ornate-panel" style={{ padding: 18, marginBottom: 18 }}>
        {/* Existing GMs list */}
        <div
          style={{
            marginBottom: 18,
          }}
        >
          <div
            className="font-pixel"
            style={{
              fontSize: 7,
              color: 'var(--qf-parchment-muted)',
              letterSpacing: '0.14em',
              marginBottom: 10,
            }}
          >
            CURRENT GAME MASTERS
          </div>
          {gmList.map((gm, i) => (
            <div
              key={gm.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.55rem 0',
                borderBottom: i < gmList.length - 1 ? '1px solid var(--qf-rule)' : 'none',
                fontFamily: 'var(--font-heading), Cinzel, serif',
                fontSize: 13,
                color: 'var(--qf-parchment)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--qf-gold-500), var(--qf-gold-400))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--qf-bg-void)',
                    fontFamily: 'var(--font-heading), Cinzel, serif',
                    fontWeight: 700,
                    fontSize: 12,
                    border: '1px solid var(--qf-gold-300)',
                    flexShrink: 0,
                  }}
                >
                  {(gm.display_name || 'G').charAt(0).toUpperCase()}
                </div>
                <span>{gm.display_name}</span>
              </div>
              {gm.id === user.id && (
                <span
                  className="font-pixel"
                  style={{
                    fontSize: 6,
                    color: 'var(--qf-gold-400)',
                    letterSpacing: '0.1em',
                  }}
                >
                  YOU
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Invite form */}
        <div
          style={{
            borderTop: '1px solid var(--qf-rule)',
            paddingTop: 16,
          }}
        >
          <div
            className="font-pixel"
            style={{
              fontSize: 7,
              color: 'var(--qf-parchment-muted)',
              letterSpacing: '0.14em',
              marginBottom: 12,
            }}
          >
            ADD CO-GM
          </div>
          <p
            style={{
              fontFamily: 'var(--font-heading), Cinzel, serif',
              fontSize: 12,
              color: 'var(--qf-parchment-dim)',
              fontStyle: 'italic',
              marginBottom: 14,
            }}
          >
            Invite another parent to help manage the household. They&apos;ll have full Game Master powers.
          </p>
          <InviteGmForm />
        </div>
      </div>

      {/* About & legal */}
      <PageDivider>About</PageDivider>
      <div className="qf-ornate-panel" style={{ padding: 18 }}>
        <Link
          href="/dashboard/settings/about"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 0',
            borderBottom: '1px solid var(--qf-rule)',
            fontFamily: 'var(--font-heading), Cinzel, serif',
            fontSize: 13,
            color: 'var(--qf-gold-300)',
            textDecoration: 'none',
          }}
        >
          <span>◆</span>
          <span>Credits &amp; Art Attribution</span>
          <span
            style={{
              marginLeft: 'auto',
              fontSize: 11,
              opacity: 0.45,
            }}
          >
            ›
          </span>
        </Link>
        {[
          { label: 'Version', value: 'Phase 4' },
          { label: 'World', value: 'Embervale' },
        ].map((row, i, all) => (
          <div
            key={row.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.6rem 0',
              borderBottom: i < all.length - 1 ? '1px solid var(--qf-rule)' : 'none',
              fontFamily: 'var(--font-heading), Cinzel, serif',
              fontSize: 13,
              color: 'var(--qf-parchment)',
            }}
          >
            <span>{row.label}</span>
            <span style={{ color: 'var(--qf-parchment-dim)' }}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
