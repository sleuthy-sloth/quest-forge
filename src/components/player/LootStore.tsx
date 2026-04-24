'use client'

import { useLootStore } from '@/hooks/useLootStore'
import type { LootItem } from '@/hooks/useLootStore'

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

const CAT_META = {
  real_reward:  { label: 'Real Reward',  color: '#2eb85c', bg: 'rgba(46,184,92,0.12)',  border: 'rgba(46,184,92,0.4)'  },
  cosmetic:     { label: 'Cosmetic',     color: '#b060e0', bg: 'rgba(176,96,224,0.12)', border: 'rgba(176,96,224,0.4)' },
  power_up:     { label: 'Power-Up',     color: '#e86a20', bg: 'rgba(232,106,32,0.12)', border: 'rgba(232,106,32,0.4)' },
  story_unlock: { label: 'Story Unlock', color: '#4d8aff', bg: 'rgba(77,138,255,0.12)', border: 'rgba(77,138,255,0.4)' },
} as const

// ---------------------------------------------------------------------------
// Inline pixel icons
// ---------------------------------------------------------------------------

function XpIcon({ size = 12 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} style={{ imageRendering: 'pixelated', flexShrink: 0 }} aria-hidden="true">
      <polygon points="8,1 14,6 14,10 8,15 2,10 2,6" fill="#6eb5ff" stroke="#3a7acc" strokeWidth="0.5" />
      <polygon points="8,1 14,6 8,7 2,6" fill="#9fd0ff" opacity="0.8" />
    </svg>
  )
}

function GoldIcon({ size = 12 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} style={{ imageRendering: 'pixelated', flexShrink: 0 }} aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" fill="#c9a84c" stroke="#9c7b2e" strokeWidth="0.5" />
      <circle cx="8" cy="8" r="4.5" fill="#e8c55a" opacity="0.7" />
      <text x="8" y="11" textAnchor="middle" fontSize="6" fill="#9c7b2e" fontWeight="bold">G</text>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function LootStore() {
  const { items, loading, error, xpAvailable, gold, purchasing, purchaseItem, refresh } = useLootStore()

  // Animation keyframes
  const Styles = (
    <style>{`
      @keyframes loot-in {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .ls-card { animation: loot-in 0.25s ease both; }
    `}</style>
  )

  // ── Loading ──
  if (loading) {
    return <>
      {Styles}
      <div style={{ padding: '3rem 1rem', textAlign: 'center', fontFamily: 'var(--font-heading), serif', fontSize: '0.85rem', color: 'rgba(200,215,255,0.2)' }}>
        Rook is stocking the shelves…
      </div>
    </>
  }

  // ── Error ──
  if (error) {
    return <>
      {Styles}
      <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
        <div style={{ color: '#e05555', fontSize: '0.85rem', marginBottom: '0.75rem', fontFamily: 'var(--font-heading), serif' }}>{error}</div>
        <button onClick={refresh} style={{ fontFamily: 'var(--font-pixel), monospace', fontSize: '0.6rem', color: '#f0e6c8', background: 'linear-gradient(135deg,#c43a00,#8b1e00)', border: '1px solid rgba(196,58,0,0.5)', borderRadius: '3px', padding: '8px 14px', cursor: 'pointer' }}>
          RETRY
        </button>
      </div>
    </>
  }

  // ── Empty ──
  if (items.length === 0) {
    return <>
      {Styles}
      <div style={{ padding: '4rem 1.5rem', textAlign: 'center', background: 'rgba(255,255,255,0.015)', border: '1px dashed rgba(201,168,76,0.1)', borderRadius: 3, margin: '1rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: 0.25 }}>🏺</div>
        <div style={{ fontFamily: 'var(--font-heading), serif', fontSize: '0.85rem', color: 'rgba(200,215,255,0.3)' }}>The shelves are bare.</div>
        <div style={{ fontFamily: 'var(--font-heading), serif', fontSize: '0.72rem', color: 'rgba(200,215,255,0.18)', marginTop: '0.35rem' }}>Ask your Game Master to stock the store.</div>
      </div>
    </>
  }

  // ── Grid ──
  return (
    <>
      {Styles}

      {/* Currency bar */}
      <div style={{ display: 'flex', gap: '1.5rem', padding: '0.75rem 1.25rem', background: 'rgba(255,255,255,0.025)', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <XpIcon size={16} />
          <span style={{ fontFamily: 'var(--font-pixel), monospace', fontSize: '0.48rem', color: 'rgba(110,181,255,0.9)' }}>
            {xpAvailable.toLocaleString()} XP
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <GoldIcon size={16} />
          <span style={{ fontFamily: 'var(--font-pixel), monospace', fontSize: '0.48rem', color: 'rgba(201,168,76,0.9)' }}>
            {gold.toLocaleString()} GP
          </span>
        </div>
      </div>

      {/* Item grid — 2 columns on mobile, 3 on tablet, 4 on desktop */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: '0.75rem',
          padding: '1rem',
        }}
        className="md:grid-cols-3 lg:grid-cols-4"
      >
        {items.map((item, idx) => {
          const cat = CAT_META[item.category]
          const canAfford = xpAvailable >= item.cost_xp && gold >= item.cost_gold

          return (
            <article
              key={item.id}
              className="ls-card"
              style={{
                animationDelay: `${idx * 0.04}s`,
                position: 'relative',
                background: canAfford
                  ? 'linear-gradient(170deg, #1a1208 0%, #0e0804 60%, #181006 100%)'
                  : 'rgba(255,255,255,0.02)',
                border: `1px solid ${canAfford ? 'rgba(201,168,76,0.18)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 3,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                opacity: canAfford ? 1 : 0.65,
              }}
            >
              {/* Category accent bar */}
              <div aria-hidden="true" style={{ height: 2, background: cat.color, opacity: canAfford ? 0.8 : 0.4 }} />

              <div style={{ padding: '0.85rem 0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {/* Category pill */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-pixel), monospace',
                      fontSize: '0.34rem',
                      padding: '2px 4px',
                      borderRadius: 2,
                      background: cat.bg,
                      border: `1px solid ${cat.border}`,
                      color: cat.color,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {cat.label.toUpperCase()}
                  </span>
                </div>

                {/* Name */}
                <p style={{ fontFamily: 'var(--font-heading), serif', fontWeight: 700, fontSize: '0.82rem', color: canAfford ? '#f0e6c8' : 'rgba(240,230,200,0.45)', lineHeight: 1.25 }}>
                  {item.name}
                </p>

                {/* Description */}
                {item.description && (
                  <p style={{ fontFamily: 'var(--font-body), serif', fontSize: '0.73rem', fontStyle: 'italic', color: 'rgba(200,215,255,0.3)', lineHeight: 1.5, flex: 1 }}>
                    {item.description}
                  </p>
                )}

                {/* Cost */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  {item.cost_xp > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <XpIcon size={12} />
                      <span style={{ fontFamily: 'var(--font-pixel), monospace', fontSize: '0.38rem', color: xpAvailable >= item.cost_xp ? 'rgba(110,181,255,0.9)' : 'rgba(220,80,80,0.7)' }}>
                        {item.cost_xp.toLocaleString()} XP
                      </span>
                    </div>
                  )}
                  {item.cost_gold > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <GoldIcon size={12} />
                      <span style={{ fontFamily: 'var(--font-pixel), monospace', fontSize: '0.38rem', color: gold >= item.cost_gold ? 'rgba(201,168,76,0.9)' : 'rgba(220,80,80,0.7)' }}>
                        {item.cost_gold.toLocaleString()} GP
                      </span>
                    </div>
                  )}
                </div>

                {/* Buy button */}
                <button
                  disabled={!canAfford || purchasing}
                  onClick={() => purchaseItem(item.id)}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.5rem',
                    borderRadius: 2,
                    fontFamily: 'var(--font-pixel), monospace',
                    fontSize: '0.44rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    border: canAfford ? `1px solid ${cat.border}` : '1px solid rgba(255,255,255,0.06)',
                    background: canAfford ? `linear-gradient(160deg, rgba(22,15,5,0.98), rgba(14,9,2,0.98))` : 'rgba(255,255,255,0.03)',
                    color: canAfford ? cat.color : 'rgba(200,215,255,0.2)',
                    cursor: canAfford && !purchasing ? 'pointer' : 'not-allowed',
                    minHeight: '44px',
                    transition: 'all 0.15s',
                    opacity: purchasing ? 0.5 : 1,
                  }}
                >
                  {canAfford ? 'Buy' : "Can't Afford"}
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}
