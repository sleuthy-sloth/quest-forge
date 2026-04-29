'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

// ── Types ─────────────────────────────────────────────────────────────────────

type LootCategory = 'real_reward' | 'cosmetic' | 'power_up' | 'story_unlock'

interface LootItem {
  id: string
  title: string
  description: string
  cost_xp: number
  cost_gold: number
  category: LootCategory
  sprite_icon: string | null
}

interface PurchasedItem {
  id: string
  reward_id: string
  created_at: string
  status: 'pending' | 'approved' | 'redeemed'
  approved_at: string | null
  reward: {
    title: string
    description: string
    category: LootCategory
  } | null
}

// ── Display metadata ──────────────────────────────────────────────────────────

const CAT_META: Record<LootCategory, { label: string; color: string; bg: string; border: string }> = {
  real_reward:  { label: 'Real Reward',  color: '#2eb85c', bg: 'rgba(46,184,92,0.12)',  border: 'rgba(46,184,92,0.4)'  },
  cosmetic:     { label: 'Cosmetic',     color: '#b060e0', bg: 'rgba(176,96,224,0.12)', border: 'rgba(176,96,224,0.4)' },
  power_up:     { label: 'Power-Up',     color: '#e86a20', bg: 'rgba(232,106,32,0.12)', border: 'rgba(232,106,32,0.4)' },
  story_unlock: { label: 'Story Unlock', color: '#4d8aff', bg: 'rgba(77,138,255,0.12)', border: 'rgba(77,138,255,0.4)' },
}

// ── Pixel art category icons ───────────────────────────────────────────────────

function CategoryIcon({ category, size = 44 }: { category: LootCategory; size?: number }) {
  const c = CAT_META[category].color
  switch (category) {
    case 'real_reward':
      return (
        <svg viewBox="0 0 32 32" width={size} height={size} style={{ imageRendering: 'pixelated' }} aria-hidden="true">
          {/* Gift box lid */}
          <rect x="3"  y="11" width="26" height="5"  fill={c} rx="1" />
          {/* Gift box body */}
          <rect x="4"  y="16" width="24" height="13" fill={c} opacity="0.8" rx="1" />
          {/* Ribbon vertical */}
          <rect x="14" y="11" width="4"  height="18" fill="white" opacity="0.25" />
          {/* Bow left */}
          <path d="M16 11 Q10 5 10 9 Q10 12 16 11" fill={c} opacity="0.9" />
          {/* Bow right */}
          <path d="M16 11 Q22 5 22 9 Q22 12 16 11" fill={c} opacity="0.9" />
          {/* Bow knot */}
          <circle cx="16" cy="11" r="2" fill="white" opacity="0.4" />
        </svg>
      )
    case 'cosmetic':
      return (
        <svg viewBox="0 0 32 32" width={size} height={size} style={{ imageRendering: 'pixelated' }} aria-hidden="true">
          {/* 4-point star burst */}
          <polygon points="16,3 18,13 28,16 18,19 16,29 14,19 4,16 14,13" fill={c} opacity="0.9" />
          <polygon points="16,3 18,13 28,16 18,19 16,29 14,19 4,16 14,13" fill="white" opacity="0.2" clipPath="inset(0 0 50% 50%)" />
          {/* Small accent sparks */}
          <circle cx="5"  cy="6"  r="1.5" fill={c} opacity="0.7" />
          <circle cx="27" cy="7"  r="1"   fill={c} opacity="0.5" />
          <circle cx="26" cy="26" r="1.5" fill={c} opacity="0.6" />
        </svg>
      )
    case 'power_up':
      return (
        <svg viewBox="0 0 32 32" width={size} height={size} style={{ imageRendering: 'pixelated' }} aria-hidden="true">
          {/* Lightning bolt */}
          <polygon points="20,2 8,18 16,18 12,30 24,12 16,12" fill={c} opacity="0.9" />
          {/* Highlight edge */}
          <polygon points="20,2 14,12 16,12 12,30 16,20 14,20 20,2" fill="white" opacity="0.22" />
        </svg>
      )
    case 'story_unlock':
      return (
        <svg viewBox="0 0 32 32" width={size} height={size} style={{ imageRendering: 'pixelated' }} aria-hidden="true">
          {/* Book pages left */}
          <rect x="5"  y="5" width="11" height="22" fill={c} opacity="0.8" rx="1" />
          {/* Book pages right */}
          <rect x="16" y="5" width="11" height="22" fill={c} rx="1" />
          {/* Spine */}
          <rect x="13" y="3" width="6" height="26" fill={c} opacity="0.55" rx="1" />
          {/* Lines left */}
          <rect x="7"  y="10" width="7" height="1.5" fill="rgba(0,0,0,0.3)" rx="0.5" />
          <rect x="7"  y="14" width="7" height="1.5" fill="rgba(0,0,0,0.3)" rx="0.5" />
          <rect x="7"  y="18" width="5" height="1.5" fill="rgba(0,0,0,0.3)" rx="0.5" />
          {/* Lines right */}
          <rect x="18" y="10" width="7" height="1.5" fill="rgba(0,0,0,0.3)" rx="0.5" />
          <rect x="18" y="14" width="7" height="1.5" fill="rgba(0,0,0,0.3)" rx="0.5" />
          {/* Lock emblem on cover */}
          <rect x="20" y="18" width="3" height="3" fill="rgba(255,255,255,0.3)" rx="0.5" />
          <path d="M20.5 18 Q20.5 16 21.5 16 Q22.5 16 22.5 18" stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none" />
        </svg>
      )
  }
}

// ── Currency icons ─────────────────────────────────────────────────────────────

function XpIcon({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} style={{ imageRendering: 'pixelated', flexShrink: 0 }} aria-hidden="true">
      <polygon points="8,1 14,6 14,10 8,15 2,10 2,6" fill="#6eb5ff" stroke="#3a7acc" strokeWidth="0.5" />
      <polygon points="8,1 14,6 8,7 2,6" fill="#9fd0ff" opacity="0.8" />
    </svg>
  )
}

function GoldIcon({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} style={{ imageRendering: 'pixelated', flexShrink: 0 }} aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" fill="#c9a84c" stroke="#9c7b2e" strokeWidth="0.5" />
      <circle cx="8" cy="8" r="4.5" fill="#e8c55a" opacity="0.7" />
      <text x="8" y="11" textAnchor="middle" fontSize="6" fill="#9c7b2e" fontWeight="bold">G</text>
    </svg>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LootPage() {
  const supabase = useMemo(() => createClient(), [])

  const [items,        setItems]        = useState<LootItem[]>([])
  const [purchases,    setPurchases]    = useState<PurchasedItem[]>([])
  const [xpAvailable,  setXpAvailable]  = useState(0)
  const [gold,         setGold]         = useState(0)
  const [loading,      setLoading]      = useState(true)
  const [activeTab,    setActiveTab]    = useState<'buy' | 'inventory'>('buy')

  // Modal state
  const [confirmItem,    setConfirmItem]    = useState<LootItem | null>(null)
  const [purchasing,     setPurchasing]     = useState(false)
  const [purchaseError,  setPurchaseError]  = useState<string | null>(null)
  const [justBought,     setJustBought]     = useState<string | null>(null) // item id

  // ── Data fetch ──────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: profile } = await supabase
      .from('profiles')
      .select('household_id, xp_available, gold')
      .eq('id', user.id)
      .single()
    if (!profile) { setLoading(false); return }

    setXpAvailable(profile.xp_available)
    setGold(profile.gold)

    const [{ data: itemData }, { data: purchaseData }] = await Promise.all([
      supabase
        .from('rewards')
        .select('id, title, description, cost_xp, cost_gold, category, sprite_icon')
        .eq('household_id', profile.household_id)
        .eq('is_available', true)
        .order('cost_gold', { ascending: true }),
      supabase
        .from('redemptions')
        .select('id, reward_id, created_at, status, approved_at, household_id, rewards (title, description, category)'),
    ])

    setItems((itemData ?? []) as unknown as LootItem[])
    // Flatten the nested rewards key from the join
    type RawPurchase = {
      id: string; reward_id: string; created_at: string; status: PurchasedItem['status'];
      approved_at: string | null; household_id: string
      rewards: PurchasedItem['reward']
    }
    setPurchases(
      ((purchaseData ?? []) as unknown as RawPurchase[])
        .filter(p => p.household_id === profile.household_id)
        .map(p => ({
          id:           p.id,
          reward_id:    p.reward_id,
          created_at:   p.created_at,
          status:       p.status,
          approved_at:  p.approved_at,
          reward:       p.rewards ?? null,
        }))
        .reverse()
    )
    setLoading(false)
  }, [supabase])

  useEffect(() => { loadData() }, [loadData])

  // ── Purchase flow ───────────────────────────────────────────────────────────
  function openConfirm(item: LootItem) {
    setPurchaseError(null)
    setConfirmItem(item)
  }

  function closeConfirm() {
    if (purchasing) return
    setConfirmItem(null)
    setPurchaseError(null)
  }

  async function handlePurchase() {
    if (!confirmItem) return
    setPurchasing(true)
    setPurchaseError(null)

    try {
      const { data, error: rpcError } = await supabase.rpc('purchase_reward', {
        p_player_id: (await supabase.auth.getUser()).data.user?.id,
        p_reward_id: confirmItem.id,
      })

      const resData = data as {
        error?: string
        redemptionId?: string
        newXpAvailable?: number
        newGold?: number
      }

      if (rpcError || resData.error) {
        setPurchaseError(rpcError?.message || resData.error || 'Purchase failed. Please try again.')
        return
      }

      setXpAvailable(resData.newXpAvailable ?? 0)
      setGold(resData.newGold ?? 0)

      const newPurchase: PurchasedItem = {
        id:           resData.redemptionId!,
        reward_id:    confirmItem.id,
        created_at:   new Date().toISOString(),
        status:       confirmItem.category === 'cosmetic' ? 'redeemed' : 'pending',
        approved_at:  null,
        reward: {
          title:                   confirmItem.title,
          description:             confirmItem.description,
          category:                confirmItem.category,
        },
      }
      setPurchases(prev => [newPurchase, ...prev])
      setJustBought(confirmItem.id)
      setTimeout(() => setJustBought(null), 2500)
      setConfirmItem(null)
    } catch {
      setPurchaseError('Something went wrong. Please try again.')
    } finally {
      setPurchasing(false)
    }
  }

  function canAfford(item: LootItem): boolean {
    return xpAvailable >= item.cost_xp && gold >= item.cost_gold
  }

  const affordable  = items.filter(i => canAfford(i))
  const unaffordable = items.filter(i => !canAfford(i))
  const sortedItems = [...affordable, ...unaffordable]

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <style suppressHydrationWarning>{`
        @keyframes loot-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { opacity: 0.8; }
          50%  { opacity: 1; }
          100% { opacity: 0.8; }
        }
        .loot-card { animation: loot-in 0.22s ease both; }
        .just-bought { animation: shimmer 0.6s ease 3; }

        .shop-tab {
          flex: 1;
          padding: 0.85rem 0;
          font-family: var(--font-pixel, 'Press Start 2P', monospace);
          font-size: 0.58rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          image-rendering: pixelated;
          cursor: pointer;
          transition: all 0.15s;
          border: none;
          outline: none;
          position: relative;
        }

        .buy-btn {
          width: 100%;
          padding: 0.9rem 1rem;
          border-radius: 3px;
          font-family: var(--font-pixel, 'Press Start 2P', monospace);
          font-size: 0.58rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          image-rendering: pixelated;
          cursor: pointer;
          transition: all 0.15s;
          min-height: 52px;
        }
        .buy-btn:hover:not(:disabled) { filter: brightness(1.18); }
        .buy-btn:active:not(:disabled) { transform: scale(0.98); }
        .buy-btn:disabled { cursor: not-allowed; opacity: 0.5; }

        .modal-btn {
          flex: 1;
          padding: 1rem;
          border-radius: 3px;
          font-family: var(--font-pixel, 'Press Start 2P', monospace);
          font-size: 0.58rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          image-rendering: pixelated;
          cursor: pointer;
          min-height: 56px;
          transition: all 0.15s;
          border: none;
        }
        .modal-btn:hover:not(:disabled) { filter: brightness(1.12); }
        .modal-btn:active:not(:disabled) { transform: scale(0.97); }
        .modal-btn:disabled { cursor: wait; opacity: 0.6; }

        .loot-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.9rem;
        }
        @media (min-width: 640px) {
          .loot-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
        @media (min-width: 1024px) {
          .loot-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        }
      `}</style>

      {/* ── Shop sign ───────────────────────────────────────────────────── */}
      <div
        style={{
          position:   'relative',
          margin:     '1.25rem 1rem 0',
          padding:    '1.25rem 1.5rem 1rem',
          background: 'linear-gradient(170deg, #2a1806 0%, #180e03 55%, #221405 100%)',
          border:     '1px solid rgba(201,168,76,0.35)',
          borderRadius: 3,
        }}
      >
        {/* Corner ornaments */}
        {([
          { top: -1, left: -1,  borderWidth: '2px 0 0 2px' },
          { top: -1, right: -1, borderWidth: '2px 2px 0 0' },
          { bottom: -1, left: -1,  borderWidth: '0 0 2px 2px' },
          { bottom: -1, right: -1, borderWidth: '0 2px 2px 0' },
        ] as const).map((s, i) => (
          <div
            key={i}
            aria-hidden="true"
            style={{
              position:    'absolute',
              width:        14,
              height:       14,
              borderColor: 'rgba(201,168,76,0.55)',
              borderStyle: 'solid',
              ...s,
            }}
          />
        ))}

        {/* Shop name */}
        <h1
          className="text-center"
          style={{
            fontFamily:    'var(--font-pixel), monospace',
            fontSize:      '0.85rem',
            letterSpacing: '0.2em',
            color:         'rgba(201,168,76,0.95)',
            imageRendering: 'pixelated',
            textShadow:    '0 0 20px rgba(201,168,76,0.5), 0 0 40px rgba(201,168,76,0.2)',
            marginBottom:  '0.4rem',
          }}
        >
          ROOK&apos;S EMPORIUM
        </h1>

        {/* Tagline */}
        <p
          className="text-center"
          style={{
            fontFamily: 'var(--font-body), serif',
            fontSize:   '0.9rem',
            fontStyle:  'italic',
            color:      'rgba(176,155,110,0.55)',
            marginBottom: '0.85rem',
          }}
        >
          Where valor meets its reward.
        </p>

        {/* Decorative divider */}
        <div
          aria-hidden="true"
          style={{
            height:     1,
            background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)',
            marginBottom: '0.85rem',
          }}
        />

        {/* Currency display */}
        <div className="flex justify-center gap-6">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <XpIcon size={16} />
            <span
              style={{
                fontFamily:     'var(--font-pixel), monospace',
                fontSize:       '0.62rem',
                imageRendering: 'pixelated',
                color:          'rgba(110,181,255,0.9)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {xpAvailable.toLocaleString()} XP
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <GoldIcon size={16} />
            <span
              style={{
                fontFamily:     'var(--font-pixel), monospace',
                fontSize:       '0.62rem',
                imageRendering: 'pixelated',
                color:          'rgba(201,168,76,0.9)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {gold.toLocaleString()} GP
            </span>
          </div>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <div
        className="flex mx-4 mt-4"
        style={{ borderBottom: '1px solid rgba(201,168,76,0.15)' }}
        role="tablist"
      >
        {([
          { key: 'buy',       label: 'Buy' },
          { key: 'inventory', label: `My Items${purchases.length > 0 ? ` (${purchases.length})` : ''}` },
        ] as const).map(tab => {
          const active = activeTab === tab.key
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={active}
              className="shop-tab"
              onClick={() => setActiveTab(tab.key)}
              style={{
                background:  active ? 'rgba(201,168,76,0.07)' : 'transparent',
                color:       active ? 'rgba(201,168,76,0.95)' : 'rgba(200,215,255,0.3)',
                borderBottom: active ? '2px solid rgba(201,168,76,0.7)' : '2px solid transparent',
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ── Loading ─────────────────────────────────────────────────────── */}
      {loading && (
        <div
          className="text-center py-16"
          style={{ fontFamily: 'var(--font-heading), serif', fontSize: '0.82rem', color: 'rgba(200,215,255,0.2)' }}
        >
          Rook is checking the shelves…
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB: BUY
      ════════════════════════════════════════════════════════════════════ */}
      {!loading && activeTab === 'buy' && (
        <div className="px-4 py-5" role="tabpanel">
          {sortedItems.length === 0 ? (
            <div
              className="text-center py-16 rounded-sm"
              style={{ background: 'rgba(255,255,255,0.015)', border: '1px dashed rgba(201,168,76,0.1)' }}
            >
              <div className="text-4xl mb-3 opacity-25">🏺</div>
              <p style={{ fontFamily: 'var(--font-heading), serif', fontSize: '0.82rem', color: 'rgba(200,215,255,0.3)' }}>
                The shelves are bare.
              </p>
              <p style={{ fontFamily: 'var(--font-heading), serif', fontWeight: 300, fontSize: '0.72rem', color: 'rgba(200,215,255,0.18)', marginTop: '0.35rem' }}>
                Ask your Game Master to stock the Emporium.
              </p>
            </div>
          ) : (
            <div className="loot-grid">
              {sortedItems.map((item, idx) => {
                const cat       = CAT_META[item.category]
                const afford    = canAfford(item)
                const boughtNow = justBought === item.id

                return (
                  <article
                    key={item.id}
                    className={`loot-card${boughtNow ? ' just-bought' : ''}`}
                    style={{
                      animationDelay: `${idx * 0.04}s`,
                      position:   'relative',
                      background: afford
                        ? 'linear-gradient(170deg, #1a1208 0%, #0e0804 60%, #181006 100%)'
                        : 'rgba(255,255,255,0.02)',
                      border:     `1px solid ${afford ? 'rgba(201,168,76,0.18)' : 'rgba(255,255,255,0.06)'}`,
                      borderRadius: 3,
                      overflow:    'hidden',
                      display:     'flex',
                      flexDirection: 'column',
                      opacity:     afford ? 1 : 0.65,
                    }}
                  >
                    {/* Category colour accent top-bar */}
                    <div
                      aria-hidden="true"
                      style={{ height: 2, background: cat.color, opacity: afford ? 0.8 : 0.4 }}
                    />

                    <div style={{ padding: '1.1rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {/* Icon + category pill */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <CategoryIcon category={item.category} size={44} />
                        <span
                          style={{
                            fontFamily:     'var(--font-pixel), monospace',
                            fontSize:       '0.46rem',
                            imageRendering: 'pixelated',
                            padding:        '3px 6px',
                            borderRadius:    3,
                            background:      cat.bg,
                            border:         `1px solid ${cat.border}`,
                            color:           cat.color,
                            whiteSpace:     'nowrap',
                          }}
                        >
                          {cat.label.toUpperCase()}
                        </span>
                      </div>

                      {/* Item name */}
                      <p
                        style={{
                          fontFamily: 'var(--font-heading), serif',
                          fontWeight: 700,
                          fontSize:   '1rem',
                          color:      afford ? '#f0e6c8' : 'rgba(240,230,200,0.45)',
                          lineHeight:  1.25,
                        }}
                      >
                        {item.title}
                      </p>

                      {/* Flavor text */}
                      {item.description && (
                        <p
                          style={{
                            fontFamily: 'var(--font-body), serif',
                            fontSize:   '0.88rem',
                            fontStyle:  'italic',
                            color:      'rgba(200,215,255,0.38)',
                            lineHeight:  1.5,
                            flex:        1,
                          }}
                        >
                          {item.description}
                        </p>
                      )}

                      {/* Cost */}
                      <div
                        style={{
                          display:       'flex',
                          flexDirection: 'column',
                          gap:           '0.25rem',
                          paddingTop:    '0.6rem',
                          borderTop:     '1px solid rgba(255,255,255,0.07)',
                        }}
                      >
                        {item.cost_xp > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <XpIcon size={14} />
                            <span style={{ fontFamily: 'var(--font-pixel), monospace', fontSize: '0.52rem', imageRendering: 'pixelated', color: xpAvailable >= item.cost_xp ? 'rgba(110,181,255,0.9)' : 'rgba(220,80,80,0.7)' }}>
                              {item.cost_xp.toLocaleString()} XP
                            </span>
                          </div>
                        )}
                        {item.cost_gold > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <GoldIcon size={14} />
                            <span style={{ fontFamily: 'var(--font-pixel), monospace', fontSize: '0.52rem', imageRendering: 'pixelated', color: gold >= item.cost_gold ? 'rgba(201,168,76,0.9)' : 'rgba(220,80,80,0.7)' }}>
                              {item.cost_gold.toLocaleString()} GP
                            </span>
                          </div>
                        )}
                        {item.cost_xp === 0 && item.cost_gold === 0 && (
                          <span style={{ fontFamily: 'var(--font-pixel), monospace', fontSize: '0.52rem', imageRendering: 'pixelated', color: 'rgba(46,184,92,0.7)' }}>
                            FREE
                          </span>
                        )}
                      </div>

                      {/* Buy button */}
                      <button
                        className="buy-btn"
                        disabled={!afford}
                        onClick={() => openConfirm(item)}
                        aria-disabled={!afford}
                        style={{
                          border:     afford ? `1px solid ${cat.border}` : '1px solid rgba(255,255,255,0.06)',
                          background: afford
                            ? `linear-gradient(160deg, rgba(22,15,5,0.98), rgba(14,9,2,0.98))`
                            : 'rgba(255,255,255,0.03)',
                          color:      afford ? cat.color : 'rgba(200,215,255,0.2)',
                          boxShadow:  afford ? `0 0 8px ${cat.color}20` : 'none',
                        }}
                      >
                        {afford ? '🛒 Buy' : "Can't Afford"}
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB: MY ITEMS
      ════════════════════════════════════════════════════════════════════ */}
      {!loading && activeTab === 'inventory' && (
        <div className="px-4 py-5" role="tabpanel">
          {purchases.length === 0 ? (
            <div
              className="text-center py-16 rounded-sm"
              style={{ background: 'rgba(255,255,255,0.015)', border: '1px dashed rgba(201,168,76,0.1)' }}
            >
              <div className="text-4xl mb-3 opacity-25">📦</div>
              <p style={{ fontFamily: 'var(--font-heading), serif', fontSize: '0.82rem', color: 'rgba(200,215,255,0.3)' }}>
                Your hoard awaits its first treasure.
              </p>
              <p style={{ fontFamily: 'var(--font-heading), serif', fontWeight: 300, fontSize: '0.72rem', color: 'rgba(200,215,255,0.18)', marginTop: '0.35rem' }}>
                Head to the Buy tab to spend your hard-earned XP.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {purchases.map((p, idx) => {
                const cat  = p.reward ? CAT_META[p.reward.category] : CAT_META.real_reward
                return (
                  <div
                    key={p.id}
                    className="loot-card"
                    style={{
                      animationDelay: `${idx * 0.04}s`,
                      position:      'relative',
                      background:    p.status === 'redeemed'
                        ? 'rgba(46,184,92,0.04)'
                        : 'linear-gradient(170deg, #1a1208 0%, #0e0804 60%, #181006 100%)',
                      border:        p.status === 'redeemed'
                        ? '1px solid rgba(46,184,92,0.25)'
                        : '1px solid rgba(201,168,76,0.15)',
                      borderRadius:   3,
                      overflow:      'hidden',
                    }}
                  >
                    {/* Top accent */}
                    <div
                      aria-hidden="true"
                      style={{ height: 2, background: cat.color, opacity: 0.6 }}
                    />

                    <div style={{ padding: '1rem 1rem 1rem 1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      {/* Icon */}
                      <div style={{ flexShrink: 0 }}>
                        {p.reward && <CategoryIcon category={p.reward.category} size={40} />}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Name + badge row */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.35rem' }}>
                          <p
                            style={{
                              fontFamily: 'var(--font-heading), serif',
                              fontWeight: 700,
                              fontSize:   '0.9rem',
                              color:      '#f0e6c8',
                              lineHeight:  1.25,
                            }}
                          >
                            {p.reward?.title ?? 'Unknown Item'}
                          </p>

                          {/* Redemption badge */}
                          {p.status === 'redeemed' ? (
                            <span
                              style={{
                                fontFamily:     'var(--font-pixel), monospace',
                                fontSize:       '0.36rem',
                                imageRendering: 'pixelated',
                                padding:        '2px 6px',
                                borderRadius:    2,
                                background:     'rgba(46,184,92,0.12)',
                                border:         '1px solid rgba(46,184,92,0.4)',
                                color:          'rgba(46,184,92,0.9)',
                                flexShrink:      0,
                                whiteSpace:     'nowrap',
                              }}
                            >
                              ✓ Redeemed
                            </span>
                          ) : (
                            <span
                              style={{
                                fontFamily:     'var(--font-pixel), monospace',
                                fontSize:       '0.36rem',
                                imageRendering: 'pixelated',
                                padding:        '2px 6px',
                                borderRadius:    2,
                                background:     'rgba(251,191,36,0.1)',
                                border:         '1px solid rgba(251,191,36,0.3)',
                                color:          'rgba(251,191,36,0.75)',
                                flexShrink:      0,
                                whiteSpace:     'nowrap',
                              }}
                            >
                              {p.status === 'approved' ? 'Approved' : 'Pending'}
                            </span>
                          )}
                        </div>

                        {/* Real reward description */}
                        {p.reward?.description && (
                          <div
                            style={{
                              marginBottom:  '0.4rem',
                              padding:       '0.4rem 0.6rem',
                              borderRadius:   2,
                              background:    'rgba(255,255,255,0.04)',
                              border:        '1px solid rgba(255,255,255,0.07)',
                            }}
                          >
                            <p
                              style={{
                                fontFamily:    'var(--font-body), serif',
                                fontSize:      '0.78rem',
                                color:         'rgba(240,230,200,0.7)',
                                lineHeight:     1.5,
                              }}
                            >
                              {p.reward.description}
                            </p>
                          </div>
                        )}

                        {/* Dates */}
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-heading), serif',
                              fontWeight: 300,
                              fontSize:   '0.65rem',
                              color:      'rgba(200,215,255,0.28)',
                            }}
                          >
                            Purchased {fmtDate(p.created_at)}
                          </span>
                          {p.status === 'redeemed' && p.approved_at && (
                            <span
                              style={{
                                fontFamily: 'var(--font-heading), serif',
                                fontWeight: 300,
                                fontSize:   '0.65rem',
                                color:      'rgba(46,184,92,0.5)',
                              }}
                            >
                              ✓ Redeemed {fmtDate(p.approved_at)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          CONFIRMATION MODAL
      ════════════════════════════════════════════════════════════════════ */}
      {confirmItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          style={{
            position:   'fixed',
            inset:       0,
            zIndex:      100,
            display:    'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.78)',
            backdropFilter: 'blur(4px)',
            padding:    '0 0 env(safe-area-inset-bottom, 0)',
          }}
          onClick={e => { if (e.target === e.currentTarget) closeConfirm() }}
        >
          <div
            style={{
              width:        '100%',
              maxWidth:      480,
              background:   'linear-gradient(170deg, #1e1306 0%, #120c03 100%)',
              border:       '1px solid rgba(201,168,76,0.35)',
              borderBottom: 'none',
              borderRadius: '6px 6px 0 0',
              padding:      '1.75rem 1.5rem 2rem',
            }}
          >
            {/* Modal header */}
            <div className="text-center mb-5">
              <p
                id="modal-title"
                style={{
                  fontFamily:     'var(--font-pixel), monospace',
                  fontSize:       '0.62rem',
                  letterSpacing:  '0.18em',
                  color:          'rgba(201,168,76,0.8)',
                  imageRendering: 'pixelated',
                  textShadow:     '0 0 16px rgba(201,168,76,0.3)',
                  marginBottom:   '0.5rem',
                }}
              >
                CONFIRM PURCHASE
              </p>
              <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)' }} />
            </div>

            {/* Item name — big and clear */}
            <p
              className="text-center"
              style={{
                fontFamily: 'var(--font-heading), serif',
                fontWeight: 700,
                fontSize:   '1.35rem',
                color:      '#f0e6c8',
                lineHeight:  1.2,
                marginBottom: '0.3rem',
              }}
            >
              {confirmItem.title}
            </p>

            {/* Category */}
            <p
              className="text-center"
              style={{
                fontFamily: 'var(--font-heading), serif',
                fontWeight: 300,
                fontSize:   '0.72rem',
                color:      CAT_META[confirmItem.category].color,
                opacity:     0.8,
                marginBottom: '1.5rem',
              }}
            >
              {CAT_META[confirmItem.category].label}
            </p>

            {/* Cost box */}
            <div
              style={{
                padding:      '1rem',
                borderRadius:  3,
                background:   'rgba(255,255,255,0.04)',
                border:       '1px solid rgba(255,255,255,0.08)',
                marginBottom: '1rem',
              }}
            >
              <p
                style={{
                  fontFamily:     'var(--font-pixel), monospace',
                  fontSize:       '0.52rem',
                  imageRendering: 'pixelated',
                  color:          'rgba(200,215,255,0.45)',
                  letterSpacing:  '0.12em',
                  marginBottom:   '0.6rem',
                }}
              >
                THIS WILL COST YOU:
              </p>

              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem' }}>
                {confirmItem.cost_xp > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <XpIcon size={18} />
                    <span style={{ fontFamily: 'var(--font-pixel), monospace', fontSize: '0.55rem', imageRendering: 'pixelated', color: 'rgba(110,181,255,0.95)' }}>
                      {confirmItem.cost_xp.toLocaleString()} XP
                    </span>
                  </div>
                )}
                {confirmItem.cost_gold > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <GoldIcon size={18} />
                    <span style={{ fontFamily: 'var(--font-pixel), monospace', fontSize: '0.55rem', imageRendering: 'pixelated', color: 'rgba(201,168,76,0.95)' }}>
                      {confirmItem.cost_gold.toLocaleString()} GP
                    </span>
                  </div>
                )}
              </div>

              {/* Before / after balance */}
              <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: '0.75rem' }} />
              <p
                style={{
                  fontFamily:     'var(--font-pixel), monospace',
                  fontSize:       '0.48rem',
                  imageRendering: 'pixelated',
                  color:          'rgba(200,215,255,0.4)',
                  letterSpacing:  '0.1em',
                  marginBottom:   '0.45rem',
                }}
              >
                YOUR BALANCE AFTER:
              </p>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                {confirmItem.cost_xp > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <XpIcon size={14} />
                    <span style={{ fontFamily: 'var(--font-pixel), monospace', fontSize: '0.44rem', imageRendering: 'pixelated', color: (xpAvailable - confirmItem.cost_xp) >= 0 ? 'rgba(110,181,255,0.75)' : 'rgba(220,80,80,0.8)' }}>
                      {(xpAvailable - confirmItem.cost_xp).toLocaleString()} XP
                    </span>
                  </div>
                )}
                {confirmItem.cost_gold > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <GoldIcon size={14} />
                    <span style={{ fontFamily: 'var(--font-pixel), monospace', fontSize: '0.44rem', imageRendering: 'pixelated', color: (gold - confirmItem.cost_gold) >= 0 ? 'rgba(201,168,76,0.75)' : 'rgba(220,80,80,0.8)' }}>
                      {(gold - confirmItem.cost_gold).toLocaleString()} GP
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Error message */}
            {purchaseError && (
              <div
                role="alert"
                style={{
                  padding:      '0.7rem 0.85rem',
                  borderRadius:  2,
                  background:   'rgba(220,60,60,0.08)',
                  border:       '1px solid rgba(220,60,60,0.3)',
                  fontFamily:   'var(--font-heading), serif',
                  fontSize:     '0.78rem',
                  color:        'rgba(220,100,100,0.9)',
                  marginBottom: '1rem',
                  display:      'flex',
                  gap:          '0.4rem',
                }}
              >
                <span>⚠</span> {purchaseError}
              </div>
            )}

            {/* Action buttons — Cancel first (easier to tap accidentally → safest) */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className="modal-btn"
                disabled={purchasing}
                onClick={closeConfirm}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  color:      'rgba(200,215,255,0.6)',
                  fontWeight:  600,
                  border:     '1px solid rgba(255,255,255,0.1)',
                }}
              >
                Cancel
              </button>
              <button
                className="modal-btn"
                disabled={purchasing}
                onClick={handlePurchase}
                aria-busy={purchasing}
                style={{
                  background:   'linear-gradient(135deg, rgba(40,28,8,0.98), rgba(28,16,4,0.98))',
                  color:        'rgba(201,168,76,0.95)',
                  border:       '1px solid rgba(201,168,76,0.45)',
                  boxShadow:    '0 0 16px rgba(201,168,76,0.12)',
                  fontWeight:    700,
                }}
              >
                {purchasing ? '⏳ Spending…' : '✓ Spend It!'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
