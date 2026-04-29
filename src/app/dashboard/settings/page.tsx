'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { PageHeader, PageDivider } from '@/components/qf'
import InviteGmForm from '@/components/dashboard/InviteGmForm'

export default function SettingsPage() {
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [gmList, setGmList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login'
        return
      }
      setUser(user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, role, household_id')
        .eq('id', user.id)
        .single()

      if (!profile || profile.role !== 'gm') {
        window.location.href = '/play'
        return
      }
      setProfile(profile)

      const { data: gms } = await supabase
        .from('profiles')
        .select('id, display_name, created_at')
        .eq('household_id', profile.household_id)
        .eq('role', 'gm')
        .order('created_at', { ascending: true })

      setGmList(gms ?? [])
      setLoading(false)
    }
    loadData()
  }, [supabase])

  if (loading || !profile) {
    return <div style={{ padding: 40, color: 'var(--qf-parchment-dim)' }}>Consulting the chronicles…</div>
  }

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
        <div style={{ marginBottom: 18 }}>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {gm.id === user.id ? (
                  <span className="font-pixel" style={{ fontSize: 6, color: 'var(--qf-gold-400)', letterSpacing: '0.1em' }}>YOU</span>
                ) : (
                  <button
                    onClick={async () => {
                      if (confirm(`Remove ${gm.display_name} as a Game Master? They will lose all access to this household.`)) {
                        const res = await fetch(`/api/gm/household?gmId=${gm.id}`, { method: 'DELETE' })
                        if (res.ok) window.location.reload()
                        else alert('Failed to remove GM.')
                      }
                    }}
                    className="font-pixel"
                    style={{ background: 'none', border: '1px solid rgba(220,80,80,0.3)', color: 'rgba(220,100,100,0.6)', fontSize: 6, padding: '2px 6px', borderRadius: 2, cursor: 'pointer' }}
                  >
                    REMOVE
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Invite form */}
        <div style={{ borderTop: '1px solid var(--qf-rule)', paddingTop: 16 }}>
          <div className="font-pixel" style={{ fontSize: 7, color: 'var(--qf-parchment-muted)', letterSpacing: '0.14em', marginBottom: 12 }}>
            ADD CO-GM
          </div>
          <p style={{ fontFamily: 'var(--font-heading), Cinzel, serif', fontSize: 12, color: 'var(--qf-parchment-dim)', fontStyle: 'italic', marginBottom: 14 }}>
            Invite another parent to help manage the household. They&apos;ll have full Game Master powers.
          </p>
          <InviteGmForm />
        </div>
      </div>

      {/* Danger Zone */}
      <PageDivider>Danger Zone</PageDivider>
      <div className="qf-ornate-panel" style={{ padding: 18, border: '1px solid rgba(220,80,80,0.3)', background: 'rgba(220,60,60,0.03)', marginBottom: 40 }}>
        {/* Reset Story Only */}
        <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid rgba(220,80,80,0.1)' }}>
          <div className="font-pixel" style={{ fontSize: 7, color: 'rgba(220,100,100,0.8)', letterSpacing: '0.14em', marginBottom: 12 }}>
            RESET STORY NARRATIVE
          </div>
          <p style={{ fontFamily: 'var(--font-heading), Cinzel, serif', fontSize: 12, color: 'var(--qf-parchment-dim)', fontStyle: 'italic', marginBottom: 14 }}>
            Reset the world story to Chapter 1 for all players. Player XP, Gold, and Loot will be kept.
          </p>
          <button
            onClick={async () => {
              if (confirm('Reset the story to Chapter 1? This cannot be undone.')) {
                const res = await fetch('/api/gm/household', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'reset_story' })
                })
                if (res.ok) alert('The story has been reset.')
                else alert('Failed to reset story.')
              }
            }}
            className="font-pixel"
            style={{
              background: 'rgba(220,60,60,0.05)', border: '1px solid rgba(220,80,80,0.3)',
              borderRadius: 2, color: 'rgba(220,100,100,0.8)', fontSize: 7, padding: '0.5rem 0.8rem', cursor: 'pointer'
            }}
          >
            RESET STORY ONLY
          </button>
        </div>

        {/* Hard Reset */}
        <div>
          <div className="font-pixel" style={{ fontSize: 7, color: 'rgba(220,100,100,0.8)', letterSpacing: '0.14em', marginBottom: 12 }}>
            FULL HOUSEHOLD WIPE
          </div>
          <p style={{ fontFamily: 'var(--font-heading), Cinzel, serif', fontSize: 12, color: 'var(--qf-parchment-dim)', fontStyle: 'italic', marginBottom: 14 }}>
            Wipe all deeds, loot, and level progress for every adventurer in this household. The story will return to Chapter 1.
          </p>
          <button
            onClick={async () => {
              if (confirm('ARE YOU SURE? This will permanently erase ALL player progress and reset the story.')) {
                const res = await fetch('/api/gm/household', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'reset_progress' })
                })
                if (res.ok) {
                  alert('The chronicles have been reset.')
                  window.location.reload()
                } else {
                  alert('Failed to reset progress.')
                }
              }
            }}
            className="font-pixel"
            style={{
              background: 'rgba(220,60,60,0.1)', border: '1px solid rgba(220,80,80,0.4)',
              borderRadius: 2, color: 'rgba(220,100,100,0.85)', fontSize: 8, padding: '0.6rem 1rem', cursor: 'pointer', letterSpacing: '0.05em'
            }}
          >
            PERFORM HARD RESET
          </button>
        </div>
      </div>

      {/* About & legal */}
      <PageDivider>About</PageDivider>
      <div className="qf-ornate-panel" style={{ padding: 18, marginBottom: 40 }}>
        <Link
          href="/dashboard/settings/about"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0',
            borderBottom: '1px solid var(--qf-rule)', fontFamily: 'var(--font-heading), Cinzel, serif',
            fontSize: 13, color: 'var(--qf-gold-300)', textDecoration: 'none',
          }}
        >
          <span>◆</span>
          <span>Credits &amp; Art Attribution</span>
          <span style={{ marginLeft: 'auto', fontSize: 11, opacity: 0.45 }}>›</span>
        </Link>
        {[
          { label: 'Version', value: 'Phase 4' },
          { label: 'World', value: 'Embervale' },
        ].map((row, i, all) => (
          <div
            key={row.label}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0',
              borderBottom: i < all.length - 1 ? '1px solid var(--qf-rule)' : 'none',
              fontFamily: 'var(--font-heading), Cinzel, serif', fontSize: 13, color: 'var(--qf-parchment)',
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
