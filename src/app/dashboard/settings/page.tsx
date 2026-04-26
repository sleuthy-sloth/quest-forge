import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader, PageDivider } from '@/components/qf'

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
