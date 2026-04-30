'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import BossSprite, { type BossSpriteHandle } from '@/components/boss/BossSprite'
import BossHPBar from '@/components/boss/BossHPBar'
import { useBoss } from '@/hooks/useBoss'
import bossesRaw from '@/lore/bosses.json'
import { motion, AnimatePresence } from 'framer-motion'
import { PARTICLE_DEFS, PARTICLE_CSS_KEYFRAMES } from '@/lib/sprites/particles'
import CelebrationEffect from '@/components/games/CelebrationEffect'

interface LoreBoss {
  week: number
  arc: number
  name: string
  weakness_flavor: string
  victory_image?: string | null
}

interface LoreArc {
  arc_number: number
  name: string
  region: string
  weeks: number[]
  background?: string | null
}

const LORE_BOSSES = bossesRaw.bosses as LoreBoss[]
const LORE_ARCS = bossesRaw.arcs as LoreArc[]

function getLoreForWeek(weekNumber: number) {
  const boss = LORE_BOSSES.find((b) => b.week === weekNumber)
  const arc = boss ? LORE_ARCS.find((a) => a.arc_number === boss.arc) : null
  return { boss, arc }
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface BossArenaProps {
  householdId: string | null
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ParticleLayer({ type }: { type: string }) {
  const def = PARTICLE_DEFS[type]
  if (!def) return null
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {Array.from({ length: def.count }).map((_, i) => (
        <div key={i} style={def.style(i, def.count)} />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BossArena({ householdId }: BossArenaProps) {
  const { bossState, loading, error, refresh } = useBoss(householdId)
  const spriteRef = useRef<BossSpriteHandle>(null)

  // Shared keyframes used across multiple render branches (defeated view,
  // loading skeleton, etc.)
  const Keyframes = (
    <style>{`
      ${PARTICLE_CSS_KEYFRAMES}
      @keyframes spin  { to { transform: rotate(360deg); } }
      @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.3} }
      @keyframes slide-in {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `}</style>
  )

  // ── HP-change animation detection ───────────────────────────────────────
  // Must sit in BossArena (not the hook) because it needs the sprite ref.
  //
  // Key insight: we compare *consecutive* `bossState.boss.currentHp` values
  // via a ref.  Every Realtime UPDATE that alters boss_current_hp will
  // produce a new object and trigger the effect.

  const prevHpRef = useRef<number | null>(null)
  const defeatTriggeredRef = useRef(false)
  const narrativeRequestedRef = useRef(false)

  // ── AI-generated victory narrative state ──────────────────────────────

  const [victoryNarrative, setVictoryNarrative] = useState<string | null>(null)
  const [generatingNarrative, setGeneratingNarrative] = useState(false)
  const [sparkBursts, setSparkBursts] = useState<{ id: number }[]>([])

  // ── Narrative generation (called once when HP drops to 0) ─────────────

  const fetchVictoryNarrative = useCallback(
    async (chapterId: string) => {
      // Guard: only call once per chapter
      if (narrativeRequestedRef.current) return
      narrativeRequestedRef.current = true

      setGeneratingNarrative(true)
      try {
        const res = await fetch('/api/story/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chapterId }),
        })
        const data = (await res.json()) as { narrative?: string }
        if (res.ok && data.narrative) {
          setVictoryNarrative(data.narrative)
        }
      } catch {
        // Silently fail — the view falls back to bossState.narrativeText
      } finally {
        setGeneratingNarrative(false)
      }
    },
    [],
  )

  useEffect(() => {
    const currentHp = bossState?.boss?.currentHp
    if (currentHp === undefined || currentHp === null) return

    // First render — record the initial value, don't animate
    if (prevHpRef.current === null) {
      prevHpRef.current = currentHp
      if (currentHp === 0) defeatTriggeredRef.current = true
      return
    }

    // HP dropped via Realtime update
    if (currentHp < prevHpRef.current) {
      if (currentHp > 0) {
        spriteRef.current?.takeDamage()
        
        // Fire spark burst
        const id = Date.now()
        setSparkBursts(prev => [...prev, { id }])
        setTimeout(() => {
          setSparkBursts(prev => prev.filter(b => b.id !== id))
        }, 600)
      } else if (!defeatTriggeredRef.current) {
        defeatTriggeredRef.current = true
        // Brief delay so the last damage flash renders before disintegration
        setTimeout(() => spriteRef.current?.defeat(), 250)

        // Generate AI victory narrative (once) — runs async in background
        if (bossState?.chapterId) {
          fetchVictoryNarrative(bossState.chapterId)
        }
      }
    }

    prevHpRef.current = currentHp
    // chapterId is intentionally omitted — chapter-change reset is handled
    // by the separate effect below. fetchVictoryNarrative is stable via useCallback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bossState?.boss?.currentHp])

  // Reset defeat + narrative flags when the chapter changes (new week)
  useEffect(() => {
    defeatTriggeredRef.current = false
    narrativeRequestedRef.current = false
    prevHpRef.current = null
    setVictoryNarrative(null)
    setGeneratingNarrative(false)
  }, [bossState?.chapterId])

  // ── Render ─────────────────────────────────────────────────────────────

  const isDefeated = bossState?.boss?.currentHp === 0
  const { boss: loreBoss, arc: loreArc } = getLoreForWeek(bossState?.weekNumber ?? 1)

  let content: React.ReactNode

  if (loading) {
    content = (
      <div style={{
        minHeight: '100vh', background: '#0a0a12', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '1.5rem', padding: '2rem',
        fontFamily: 'var(--font-body)',
      }}>
        <div style={{ width: 280, height: 24, background: '#1a1a2e', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: '30%', height: '100%', background: '#2a2a42', borderRadius: 2, animation: 'shimmer 1.2s ease-in-out infinite' }} />
        </div>
        <div style={{ width: 200, height: 200, background: '#1a1a2e', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontSize: '0.8rem' }}>
          Summoning boss…
        </div>
      </div>
    )
  } else if (error) {
    content = (
      <div style={{
        minHeight: '100vh', background: '#0a0a12', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '2rem',
        fontFamily: 'var(--font-body)',
      }}>
        <div style={{ color: '#e05555', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>
        <button onClick={refresh} style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.65rem', color: '#f0e6c8', background: 'linear-gradient(135deg,#c43a00,#8b1e00)', border: '1px solid rgba(196,58,0,0.5)', borderRadius: '3px', padding: '10px 16px', cursor: 'pointer' }}>
          RETRY
        </button>
      </div>
    )
  } else if (!bossState) {
    content = (
      <div style={{
        minHeight: '100vh', background: '#0a0a12', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '2rem',
        fontFamily: 'var(--font-body)', textAlign: 'center',
      }}>
        <div style={{ fontSize: '2.5rem', opacity: 0.3 }}>⚔</div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: '#c9a84c' }}>The next chapter has not yet begun.</div>
        <div style={{ color: '#7a6a44', fontSize: '0.85rem', maxWidth: 360 }}>Your Game Master is preparing the next story. Check back soon — the Emberlight awaits.</div>
        <button onClick={refresh} style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.6rem', color: '#c9a84c', background: 'transparent', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '3px', padding: '8px 14px', cursor: 'pointer', marginTop: '0.5rem' }}>
          CHECK AGAIN
        </button>
      </div>
    )
  } else if (!bossState.boss) {
    content = (
      <div style={{
        minHeight: '100vh', background: '#0a0a12', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '2rem',
        fontFamily: 'var(--font-body)', textAlign: 'center',
      }}>
        <div style={{ fontSize: '2rem', opacity: 0.3 }}>☠</div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: '#c9a84c' }}>A presence stirs…</div>
        <div style={{ color: '#7a6a44', fontSize: '0.85rem', maxWidth: 400 }}>
          Something lurks in the shadows of this chapter, but it has not yet taken form. The Game Master may need to complete the weekly setup.
        </div>
      </div>
    )
  } else if (bossState.rewardsClaimed) {
    content = (
      <div style={{
        minHeight: '100vh', background: '#0a0a12', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '2rem',
        fontFamily: 'var(--font-body)', textAlign: 'center',
      }}>
        <div style={{ fontSize: '2.5rem' }}>✦</div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: '#c9a84c' }}>
          {bossState.boss.name} has been defeated!
        </div>
        <div style={{ color: '#7a6a44', fontSize: '0.85rem', maxWidth: 400 }}>
          The Emberbearers&apos; combined light has cleansed this chapter&apos;s threat. The town is safe — for now.
        </div>
        {bossState.narrativeText && (
          <div style={{ color: '#5a5a3a', fontStyle: 'italic', fontSize: '0.8rem', maxWidth: 440, lineHeight: 1.5, marginTop: '0.5rem', padding: '0 1rem' }}>
            &ldquo;{bossState.narrativeText}&rdquo;
          </div>
        )}
      </div>
    )
  } else if (isDefeated) {
    content = (
      <div style={{
        minHeight: '100vh', background: '#0a0a12', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '1.5rem', padding: '2rem',
        fontFamily: 'var(--font-body)', textAlign: 'center', position: 'relative',
        overflow: 'hidden',
      }}>
        <CelebrationEffect trigger={1} />
        <BossSprite key={bossState.chapterId} ref={spriteRef} config={bossState.boss.spriteConfig} />

        {loreBoss?.victory_image && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 2 }}
            style={{ position: 'absolute', inset: 0, zIndex: 5 }}
          >
            <Image
              src={loreBoss.victory_image}
              alt="Victory Illustration"
              fill
              style={{ objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0a0a12 10%, transparent 60%)' }} />
          </motion.div>
        )}

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', zIndex: 10 }}
        >
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: '#c9a84c' }}>
            ✦ {bossState.boss.name} is no more ✦
          </div>

          {bossState.boss.description && (
            <div style={{ color: '#7a6a44', fontSize: '0.85rem', maxWidth: 400 }}>
              {bossState.boss.description}
            </div>
          )}

          {bossState.narrativeText && (
            <div style={{ color: '#5a5a3a', fontStyle: 'italic', fontSize: '0.8rem', maxWidth: 440, lineHeight: 1.5 }}>
              &ldquo;{bossState.narrativeText}&rdquo;
            </div>
          )}

          {/* ═══ AI-generated victory narrative ═══ */}
          {generatingNarrative && (
            <div style={{ marginTop: '0.5rem', fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: '#7a6a44', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ display: 'inline-block', width: '14px', height: '14px', borderRadius: '50%', border: '2px solid rgba(201,168,76,0.2)', borderTopColor: 'rgba(201,168,76,0.8)', animation: 'spin 0.7s linear infinite' }} />
              The scribes are recording this victory…
            </div>
          )}

          {victoryNarrative && (
            <div style={{ marginTop: '1rem', fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: '#c9a84c', maxWidth: 520, lineHeight: 1.7, textAlign: 'center', background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.12)', borderRadius: '4px', padding: '1.25rem 1.5rem', animation: 'slide-in 0.6s ease both' }}>
              {victoryNarrative}
              <div style={{ marginTop: '0.75rem', fontFamily: 'var(--font-pixel)', fontSize: '0.5rem', color: 'rgba(201,168,76,0.3)', letterSpacing: '0.5px' }}>
                — RECORDED IN THE EMBERLIGHT CHRONICLES —
              </div>
            </div>
          )}
        </motion.div>
      </div>
    )
  } else {
    // ── Active boss ──
    const hpPct = (bossState.boss.currentHp / bossState.boss.maxHp) * 100
    
    content = (
      <div style={{
        minHeight: '100vh', background: '#0a0a12', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '2rem', padding: '2rem',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Ambient Particles */}
        <ParticleLayer type="ember_float" />
        {hpPct < 50 && <ParticleLayer type="ash_fall" />}
        {hpPct < 25 && <ParticleLayer type="lightning_arc" />}
        
        {/* HP-reactive background tint */}
        {hpPct < 25 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.05 }}
            style={{ position: 'absolute', inset: 0, backgroundColor: '#ff0000', pointerEvents: 'none' }}
          />
        )}

        {(() => {
          return (
            <>
              <div style={{ textAlign: 'center', zIndex: 10 }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: '#f0e6c8', marginBottom: '0.2rem' }}>
                  ⚔ {bossState.title}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: '#7a6a44' }}>
                  {loreArc
                    ? `${loreArc.name} · ${loreArc.region} · Week ${bossState.weekNumber}`
                    : `Week ${bossState.weekNumber} — Chapter ${bossState.chapterNumber}`}
                </div>
              </div>

              <div style={{ width: '100%', zIndex: 10 }}>
                <BossHPBar currentHp={bossState.boss.currentHp} maxHp={bossState.boss.maxHp} bossName={bossState.boss.name} />
              </div>

              <div style={{ position: 'relative', zIndex: 10 }}>
                <BossSprite 
                  key={bossState.chapterId} 
                  ref={spriteRef} 
                  config={bossState.boss.spriteConfig} 
                  hpPct={hpPct}
                />
                
                {/* Damage bursts */}
                <AnimatePresence>
                  {sparkBursts.map(burst => (
                    <motion.div
                      key={burst.id}
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{ position: 'absolute', inset: 0 }}
                    >
                      <ParticleLayer type="spark_burst" />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {bossState.boss.description && (
                <div style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', fontSize: '0.8rem', color: '#7a6a44', maxWidth: 440, textAlign: 'center', lineHeight: 1.6, zIndex: 10 }}>
                  {bossState.boss.description}
                </div>
              )}

              {bossState.narrativeText && (
                <div style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', fontSize: '0.75rem', color: '#5a5a3a', maxWidth: 440, textAlign: 'center', lineHeight: 1.5, zIndex: 10 }}>
                  &ldquo;{bossState.narrativeText}&rdquo;
                </div>
              )}

              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.72rem',
                color: '#6a5a34',
                maxWidth: 440,
                textAlign: 'center',
                lineHeight: 1.65,
                fontStyle: 'italic',
                background: 'rgba(201,168,76,0.04)',
                border: '1px solid rgba(201,168,76,0.1)',
                borderRadius: '3px',
                padding: '0.65rem 1rem',
                zIndex: 10,
              }}>
                <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.5rem', color: 'rgba(201,168,76,0.4)', letterSpacing: '0.8px', display: 'block', marginBottom: '0.35rem' }}>
                  ⚡ WEAKNESS
                </span>
                {loreBoss?.weakness_flavor ?? 'Complete your tasks and challenges to deal damage!'}
              </div>
            </>
          )
        })()}
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', background: '#0a0a12', overflow: 'hidden' }}>
      {Keyframes}
      
      {loreArc?.background && (
        <div style={{ position: 'absolute', inset: 0, opacity: 0.55, pointerEvents: 'none', zIndex: 0 }}>
          <Image
            src={loreArc.background}
            alt=""
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, transparent 0%, #0a0a12 90%)' }} />
        </div>
      )}
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        {content}
      </div>
    </div>
  )
}
