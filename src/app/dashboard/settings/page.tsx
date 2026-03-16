import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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
    <main style={{ padding: '2rem', maxWidth: 640, margin: '0 auto' }}>
      <style suppressHydrationWarning>{`
        .settings-section {
          border-style: solid;
          border-width: 1px;
          border-color: rgba(201,168,76,0.12);
          background: #0d0f1a;
          padding: 1.5rem;
          margin-bottom: 1.25rem;
        }
        .settings-section-title {
          font-family: var(--font-heading, 'Cinzel', serif);
          font-size: 0.75rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--gold-400, #c9a84c);
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(201,168,76,0.1);
        }
        .settings-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.6rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          font-size: 0.8rem;
          color: rgba(240,230,200,0.7);
          font-family: var(--font-heading, 'Cinzel', serif);
        }
        .settings-row:last-child { border-bottom: none; }
        .settings-row-muted {
          font-size: 0.68rem;
          color: rgba(176,154,110,0.45);
          font-family: var(--font-heading, 'Cinzel', serif);
        }
        .settings-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 0;
          font-size: 0.8rem;
          font-family: var(--font-heading, 'Cinzel', serif);
          color: rgba(201,168,76,0.7);
          text-decoration: none;
          transition: color 0.15s;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .settings-link:hover { color: #c9a84c; }
        .settings-link:last-child { border-bottom: none; }
      `}</style>

      <h1 style={{
        fontFamily: 'var(--font-heading, "Cinzel", serif)',
        fontSize: '1rem',
        letterSpacing: '0.15em',
        color: '#c9a84c',
        marginBottom: '1.75rem',
        textTransform: 'uppercase',
      }}>
        ⚙ Settings
      </h1>

      {/* Account info */}
      <section className="settings-section">
        <div className="settings-section-title">Account</div>
        <div className="settings-row">
          <span>Game Master</span>
          <span className="settings-row-muted">{profile.display_name}</span>
        </div>
        <div className="settings-row">
          <span>Role</span>
          <span className="settings-row-muted">GM</span>
        </div>
        <div className="settings-row">
          <span>Household ID</span>
          <span className="settings-row-muted" style={{ fontFamily: 'monospace', fontSize: '0.6rem' }}>
            {profile.household_id}
          </span>
        </div>
      </section>

      {/* About & legal */}
      <section className="settings-section">
        <div className="settings-section-title">About</div>
        <Link href="/dashboard/settings/about" className="settings-link">
          <span>◆</span>
          <span>Credits &amp; Art Attribution</span>
          <span style={{ marginLeft: 'auto', fontSize: '0.6rem', opacity: 0.45 }}>›</span>
        </Link>
        <div className="settings-row">
          <span>Version</span>
          <span className="settings-row-muted">Phase 4</span>
        </div>
        <div className="settings-row">
          <span>World</span>
          <span className="settings-row-muted">Embervale</span>
        </div>
      </section>
    </main>
  )
}
