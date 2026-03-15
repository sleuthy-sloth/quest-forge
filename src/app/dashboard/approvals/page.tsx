// src/app/dashboard/approvals/page.tsx
'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

// ── Types ──────────────────────────────────────────────────────────────────

interface PendingCompletion {
  id: string
  completed_at: string
  player_id: string
  chore_id: string
  profiles: { display_name: string; username: string } | null
  chores: {
    title: string
    quest_flavor_text: string | null
    description: string | null
    xp_reward: number
    gold_reward: number
  } | null
}

interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}

// ── Helpers ────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60)  return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// Deterministic avatar colour — matches palette in dashboard/page.tsx
const PALETTES = [
  { bg: 'rgba(100,30,140,0.85)',  border: 'rgba(160,80,220,0.6)',  text: '#d4a8f0' },
  { bg: 'rgba(20,60,140,0.85)',   border: 'rgba(60,120,220,0.6)',  text: '#8ab4f8' },
  { bg: 'rgba(20,100,70,0.85)',   border: 'rgba(40,180,120,0.6)',  text: '#6ed9a8' },
  { bg: 'rgba(140,60,20,0.85)',   border: 'rgba(220,110,40,0.6)',  text: '#f0a86e' },
  { bg: 'rgba(130,20,50,0.85)',   border: 'rgba(210,50,90,0.6)',   text: '#f08aaa' },
  { bg: 'rgba(20,100,120,0.85)',  border: 'rgba(40,160,200,0.6)',  text: '#6ecef0' },
  { bg: 'rgba(100,95,20,0.85)',   border: 'rgba(200,180,40,0.6)',  text: '#f0dc6e' },
  { bg: 'rgba(60,20,100,0.85)',   border: 'rgba(120,50,200,0.6)',  text: '#b08af0' },
]
function avatarPalette(username: string) {
  let h = 0
  for (const c of username) h = (Math.imul(h, 31) + c.charCodeAt(0)) | 0
  return PALETTES[Math.abs(h) % PALETTES.length]
}

// ── Main component ──────────────────────────────────────────────────────────

export default function ApprovalQueuePage() {
  const [pending, setPending]             = useState<PendingCompletion[]>([])
  const [loading, setLoading]             = useState(true)
  const [householdId, setHouseholdId]     = useState<string | null>(null)
  const [processing, setProcessing]       = useState<Set<string>>(new Set())
  const [rejectExpanded, setRejectExpanded] = useState<Record<string, boolean>>({})
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({})
  const [toasts, setToasts]              = useState<Toast[]>([])
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null)

  // useMemo stabilises the client reference so useEffect hooks don't re-fire
  // on every render due to a new supabase object being created each time.
  const supabase = useMemo(() => createClient(), [])
  // useRef keeps the counter stable across re-renders so toast IDs are unique.
  const toastCounter = useRef(0)
  const toastTimers = useRef<ReturnType<typeof setTimeout>[]>([])

  // Clear all pending toast timers on unmount
  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      toastTimers.current.forEach(clearTimeout)
    }
  }, [])

  // ── Toast helpers ──
  function addToast(message: string, type: Toast['type']) {
    const id = ++toastCounter.current
    setToasts(t => [...t, { id, message, type }])
    const timer = setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
    toastTimers.current.push(timer)
  }

  // ── Initial data fetch ──
  const fetchPending = useCallback(async (hid: string) => {
    const { data, error } = await supabase
      .from('chore_completions')
      .select(`
        id,
        completed_at,
        player_id,
        chore_id,
        profiles!player_id ( display_name, username ),
        chores ( title, quest_flavor_text, description, xp_reward, gold_reward )
      `)
      .eq('household_id', hid)
      .eq('verified', false)
      .order('completed_at', { ascending: true })

    if (error) {
      console.error('[ApprovalQueue] fetch error:', error)
      return
    }
    setPending((data ?? []) as unknown as PendingCompletion[])
  }, [supabase])

  // ── Bootstrap: get profile → household_id → fetch queue ──
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('household_id')
        .eq('id', user.id)
        .single()

      if (!profile?.household_id) return

      setHouseholdId(profile.household_id)
      await fetchPending(profile.household_id)
      setLoading(false)
    }
    init()
  }, [supabase, fetchPending])

  // ── Realtime subscription ──
  useEffect(() => {
    if (!householdId) return

    const channel = supabase
      .channel('pending-approvals')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chore_completions',
          filter: `household_id=eq.${householdId}`,
        },
        async (payload) => {
          // Realtime INSERT payload only has raw columns — refetch with joins.
          const newId = (payload.new as { id: string }).id
          const { data } = await supabase
            .from('chore_completions')
            .select(`
              id,
              completed_at,
              player_id,
              chore_id,
              profiles!player_id ( display_name, username ),
              chores ( title, quest_flavor_text, description, xp_reward, gold_reward )
            `)
            .eq('id', newId)
            .eq('verified', false)
            .single()

          if (data) {
            setPending(prev =>
              prev.some(x => x.id === (data as unknown as PendingCompletion).id)
                ? prev
                : [...prev, data as unknown as PendingCompletion]
            )
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [householdId, supabase])

  // ── Approve a single completion ──
  async function approve(id: string): Promise<boolean> {
    setProcessing(p => new Set(p).add(id))
    // Optimistic removal
    setPending(p => p.filter(x => x.id !== id))

    const res = await fetch('/api/chores/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completionId: id }),
    })

    if (!res.ok) {
      // Restore: refetch to get accurate state
      if (householdId) await fetchPending(householdId)
      const { error } = await res.json().catch(() => ({ error: 'Unknown error' }))
      addToast(error ?? 'Failed to approve.', 'error')
      setProcessing(p => { const next = new Set(p); next.delete(id); return next })
      return false
    }

    let xpAwarded = 0
    let goldAwarded = 0
    try {
      const json = await res.json()
      xpAwarded = json.xpAwarded ?? 0
      goldAwarded = json.goldAwarded ?? 0
    } catch {
      // Server returned 200 but non-JSON body — trigger still fired, treat as success
    }
    addToast(`Quest approved! +${xpAwarded} XP, +${goldAwarded} GP awarded.`, 'success')
    setProcessing(p => { const next = new Set(p); next.delete(id); return next })
    return true
  }

  // ── Reject a single completion ──
  async function reject(id: string) {
    setProcessing(p => new Set(p).add(id))
    setPending(p => p.filter(x => x.id !== id))

    const res = await fetch('/api/chores/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completionId: id }),
    })

    if (!res.ok) {
      if (householdId) await fetchPending(householdId)
      addToast('Failed to reject. Please try again.', 'error')
    }

    setProcessing(p => { const next = new Set(p); next.delete(id); return next })
    setRejectExpanded(r => { const next = { ...r }; delete next[id]; return next })
    setRejectReasons(r => { const next = { ...r }; delete next[id]; return next })
  }

  // ── Batch approve all ──
  async function batchApproveAll() {
    if (!householdId) return
    const ids = pending.map(p => p.id)
    if (ids.length === 0) return

    setBatchProgress({ current: 0, total: ids.length })
    let errors = 0

    for (let i = 0; i < ids.length; i++) {
      setBatchProgress({ current: i + 1, total: ids.length })
      const ok = await approve(ids[i])
      if (!ok) errors++
    }

    setBatchProgress(null)

    // Check if new items arrived via Realtime during the batch run
    // pending state at this point reflects optimistic removals + any new arrivals
    const remainingAfterBatch = pending.filter(p => !ids.includes(p.id))
    const newArrivals = remainingAfterBatch.length

    if (errors === 0) {
      addToast('All quests approved!', 'success')
    } else {
      addToast(`Done. ${errors} approval${errors > 1 ? 's' : ''} failed.`, 'error')
    }
    if (newArrivals > 0) {
      addToast(`${newArrivals} new quest${newArrivals > 1 ? 's' : ''} arrived during batch — please review.`, 'error')
    }
  }

  const isBatching = batchProgress !== null

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <>
      <style suppressHydrationWarning>{`
        .aq-card {
          background: rgba(255,255,255,0.022);
          border: 1px solid rgba(201,168,76,0.12);
          border-radius: 3px;
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .aq-card.processing {
          opacity: 0.45;
          pointer-events: none;
        }
        .aq-btn {
          font-family: 'Cinzel', serif;
          font-size: 0.68rem;
          letter-spacing: 0.06em;
          border-radius: 2px;
          padding: 0.45rem 1rem;
          cursor: pointer;
          border: 1px solid;
          transition: opacity 0.15s, background 0.15s;
        }
        .aq-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .aq-btn-approve {
          background: rgba(40,160,90,0.12);
          border-color: rgba(40,160,90,0.35);
          color: rgba(80,200,130,0.9);
        }
        .aq-btn-approve:hover:not(:disabled) {
          background: rgba(40,160,90,0.22);
        }
        .aq-btn-reject {
          background: rgba(220,60,60,0.08);
          border-color: rgba(220,60,60,0.25);
          color: rgba(230,100,90,0.85);
        }
        .aq-btn-reject:hover:not(:disabled) {
          background: rgba(220,60,60,0.18);
        }
        .aq-btn-batch {
          background: rgba(201,168,76,0.08);
          border-color: rgba(201,168,76,0.25);
          color: rgba(201,168,76,0.85);
        }
        .aq-btn-batch:hover:not(:disabled) {
          background: rgba(201,168,76,0.16);
        }
        .aq-reject-input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(220,60,60,0.2);
          border-radius: 2px;
          color: rgba(200,215,255,0.7);
          font-family: 'Cinzel', serif;
          font-size: 0.7rem;
          padding: 0.4rem 0.65rem;
          outline: none;
          margin-bottom: 0.6rem;
          box-sizing: border-box;
        }
        .aq-reject-input:focus {
          border-color: rgba(220,60,60,0.45);
        }
        .aq-skeleton {
          background: linear-gradient(90deg,
            rgba(255,255,255,0.03) 25%,
            rgba(255,255,255,0.07) 50%,
            rgba(255,255,255,0.03) 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 2px;
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .aq-toast {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          pointer-events: none;
        }
        .aq-toast-item {
          font-family: 'Cinzel', serif;
          font-size: 0.72rem;
          padding: 0.65rem 1rem;
          border-radius: 3px;
          letter-spacing: 0.04em;
          animation: toast-in 0.25s ease both;
          pointer-events: none;
        }
        .aq-toast-item.success {
          background: rgba(20,80,50,0.92);
          border: 1px solid rgba(40,160,90,0.35);
          color: rgba(80,200,130,0.95);
        }
        .aq-toast-item.error {
          background: rgba(80,20,20,0.92);
          border: 1px solid rgba(220,60,60,0.35);
          color: rgba(230,100,90,0.95);
        }
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .section-rule {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .section-rule h2 {
          font-family: 'Cinzel', serif;
          font-size: 0.72rem;
          font-weight: 700;
          color: rgba(201,168,76,0.65);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .section-rule .rule-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, rgba(201,168,76,0.2), transparent);
        }
      `}</style>

      {/* ── Top bar ───────────────────────────────────────────────── */}
      <div className="dash-topbar">
        <span className="dash-page-title">⚑ Approval Queue</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {!loading && pending.length > 0 && (
            <span style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '0.48rem',
              color: 'rgba(230,110,90,0.9)',
              background: 'rgba(220,80,60,0.12)',
              border: '1px solid rgba(220,80,60,0.3)',
              borderRadius: 2,
              padding: '3px 8px',
              imageRendering: 'pixelated',
            }}>
              {pending.length} pending
            </span>
          )}
          <button
            className="aq-btn aq-btn-batch"
            disabled={loading || pending.length === 0 || isBatching}
            onClick={batchApproveAll}
          >
            {batchProgress
              ? `Approving ${batchProgress.current} of ${batchProgress.total}…`
              : 'Batch Approve All'}
          </button>
        </div>
      </div>

      <div className="dash-content">

        {/* ── Loading skeleton ───────────────────────────────────── */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.022)',
                border: '1px solid rgba(201,168,76,0.08)',
                borderRadius: 3,
                padding: '1.25rem 1.5rem',
              }}>
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div className="aq-skeleton" style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="aq-skeleton" style={{ height: 12, width: '40%', marginBottom: 8 }} />
                    <div className="aq-skeleton" style={{ height: 10, width: '25%' }} />
                  </div>
                </div>
                <div className="aq-skeleton" style={{ height: 10, width: '70%', marginBottom: 6 }} />
                <div className="aq-skeleton" style={{ height: 10, width: '55%' }} />
              </div>
            ))}
          </div>
        )}

        {/* ── Empty state ────────────────────────────────────────── */}
        {!loading && pending.length === 0 && (
          <div style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            background: 'rgba(255,255,255,0.015)',
            border: '1px dashed rgba(201,168,76,0.1)',
            borderRadius: 3,
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: 0.2 }}>⚑</div>
            <p style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '0.82rem',
              color: 'rgba(200,215,255,0.3)',
              letterSpacing: '0.06em',
            }}>
              No quests awaiting your judgment, Game Master.
            </p>
          </div>
        )}

        {/* ── Pending item list ──────────────────────────────────── */}
        {!loading && pending.length > 0 && (
          <>
            <div className="section-rule">
              <h2>Pending Quests</h2>
              <div className="rule-line" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {pending.map(item => {
                const player   = item.profiles
                const chore    = item.chores
                const username = player?.username ?? 'unknown'
                const pal      = avatarPalette(username)
                const isProcessing = processing.has(item.id)
                const rejectOpen   = rejectExpanded[item.id] ?? false

                const flavorText = chore?.quest_flavor_text
                  || chore?.description
                  || chore?.title
                  || '—'

                return (
                  <div
                    key={item.id}
                    className={`aq-card${isProcessing ? ' processing' : ''}`}
                  >
                    <div style={{ padding: '1.25rem 1.5rem' }}>

                      {/* ── Player row ── */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        marginBottom: '0.85rem',
                        flexWrap: 'wrap',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          {/* Avatar */}
                          <div style={{
                            width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                            background: pal.bg,
                            border: `2px solid ${pal.border}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <span style={{
                              fontFamily: "'Press Start 2P', monospace",
                              fontSize: 11,
                              color: pal.text,
                              imageRendering: 'pixelated',
                            }}>
                              {(player?.display_name ?? '?').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div style={{
                              fontFamily: 'Cinzel, serif',
                              fontSize: '0.88rem',
                              fontWeight: 600,
                              color: '#e8f0ff',
                            }}>
                              {player?.display_name ?? 'Unknown Player'}
                            </div>
                            <div style={{
                              fontFamily: 'Cinzel, serif',
                              fontWeight: 300,
                              fontSize: '0.65rem',
                              color: 'rgba(200,215,255,0.28)',
                            }}>
                              @{username}
                            </div>
                          </div>
                        </div>

                        {/* Submitted time */}
                        <span style={{
                          fontFamily: 'Cinzel, serif',
                          fontWeight: 300,
                          fontSize: '0.65rem',
                          color: 'rgba(200,215,255,0.3)',
                          flexShrink: 0,
                        }}>
                          {timeAgo(item.completed_at)}
                        </span>
                      </div>

                      {/* ── Chore info ── */}
                      <div style={{ marginBottom: '0.85rem' }}>
                        <div style={{
                          fontFamily: 'Cinzel, serif',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          color: 'rgba(200,215,255,0.85)',
                          marginBottom: '0.3rem',
                        }}>
                          {chore?.title ?? 'Unknown Quest'}
                        </div>
                        <div style={{
                          fontFamily: 'Cinzel, serif',
                          fontWeight: 300,
                          fontSize: '0.75rem',
                          color: 'rgba(200,215,255,0.4)',
                          fontStyle: 'italic',
                          lineHeight: 1.55,
                        }}>
                          {flavorText}
                        </div>
                      </div>

                      {/* ── Rewards ── */}
                      <div style={{
                        display: 'flex',
                        gap: '1rem',
                        marginBottom: '1rem',
                        paddingBottom: '1rem',
                        borderBottom: '1px solid rgba(201,168,76,0.06)',
                      }}>
                        <span style={{
                          fontFamily: "'Press Start 2P', monospace",
                          fontSize: '0.45rem',
                          color: 'rgba(201,168,76,0.75)',
                          imageRendering: 'pixelated',
                        }}>
                          +{chore?.xp_reward ?? 0} XP
                        </span>
                        {(chore?.gold_reward ?? 0) > 0 && (
                          <span style={{
                            fontFamily: "'Press Start 2P', monospace",
                            fontSize: '0.45rem',
                            color: 'rgba(249,200,70,0.75)',
                            imageRendering: 'pixelated',
                          }}>
                            +{chore?.gold_reward} GP
                          </span>
                        )}
                      </div>

                      {/* ── Reject reason input (expands on first Reject click) ── */}
                      {rejectOpen && (
                        <input
                          className="aq-reject-input"
                          type="text"
                          placeholder="Reason for rejection (optional, not saved)"
                          value={rejectReasons[item.id] ?? ''}
                          onChange={e =>
                            setRejectReasons(r => ({ ...r, [item.id]: e.target.value }))
                          }
                          onKeyDown={e => {
                            if (e.key === 'Enter') reject(item.id)
                            if (e.key === 'Escape') {
                              setRejectExpanded(r => ({ ...r, [item.id]: false }))
                            }
                          }}
                          autoFocus
                        />
                      )}

                      {/* ── Action buttons ── */}
                      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <button
                          className="aq-btn aq-btn-approve"
                          disabled={isProcessing || isBatching}
                          onClick={() => approve(item.id)}
                        >
                          ✓ Approve
                        </button>

                        <button
                          className="aq-btn aq-btn-reject"
                          disabled={isProcessing || isBatching}
                          onClick={() => {
                            if (!rejectOpen) {
                              setRejectExpanded(r => ({ ...r, [item.id]: true }))
                            } else {
                              reject(item.id)
                            }
                          }}
                        >
                          {rejectOpen ? '✕ Confirm Reject' : '✕ Reject'}
                        </button>

                        {rejectOpen && (
                          <button
                            className="aq-btn"
                            style={{
                              background: 'transparent',
                              borderColor: 'rgba(200,215,255,0.12)',
                              color: 'rgba(200,215,255,0.35)',
                            }}
                            onClick={() => {
                              setRejectExpanded(r => ({ ...r, [item.id]: false }))
                              setRejectReasons(r => { const n = { ...r }; delete n[item.id]; return n })
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>

                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

      </div>

      {/* ── Toast notifications ──────────────────────────────────── */}
      <div className="aq-toast" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`aq-toast-item ${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>
    </>
  )
}
