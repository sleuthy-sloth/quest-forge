'use client'

import { useRef, useEffect, useState } from 'react'
import BossSprite, { type BossSpriteHandle } from '@/components/boss/BossSprite'
import BossHPBar from '@/components/boss/BossHPBar'
import { useBoss } from '@/hooks/useBoss'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface BossArenaProps {
  householdId: string | null
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BossArena({ householdId }: BossArenaProps) {
  const { bossState, loading, error, refresh } = useBoss(householdId)
  const spriteRef = useRef<BossSpriteHandle>(null)

  // ── HP-change animation detection ───────────────────────────────────────
  // Must sit in BossArena (not the hook) because it needs the sprite ref.
  //
  // Key insight: we compare *consecutive* `bossState.boss.currentHp` values
  // via a ref.  Every Realtime UPDATE that alters boss_current_hp will
  // produce a new object and trigger the effect.

  const prevHpRef = useRef<number | null>(null)
  const defeatTriggeredRef = useRef(false)

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
      } else if (!defeatTriggeredRef.current) {
        defeatTriggeredRef.current = true
        // Brief delay so the last damage flash renders before disintegration
        setTimeout(() => spriteRef.current?.defeat(), 250)
      }
    }

    prevHpRef.current = currentHp
  }, [bossState?.boss?.currentHp])

  // Reset defeat flag when the chapter changes (new week)
  useEffect(() => {
    defeatTriggeredRef.current = false
    prevHpRef.current = null
  }, [bossState?.chapterId])

  // ── Loading state ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a12',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        padding: '2rem',
        fontFamily: 'var(--font-body)',
      }}>
        <div style={{ width: 280, height: 24, background: '#1a1a2e', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            width: '30%',
            height: '100%',
            background: '#2a2a42',
            borderRadius: 2,
            animation: 'shimmer 1.2s ease-in-out infinite',
          }} />
        </div>
        <div style={{
          width: 200, height: 200,
          background: '#1a1a2e',
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#333',
          fontSize: '0.8rem',
        }}>
          Summoning boss…
        </div>
        <style>{`@keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
      </div>
    )
  }

  // ── Error state ────────────────────────────────────────────────────────

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a12',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '2rem',
        fontFamily: 'var(--font-body)',
      }}>
        <div style={{ color: '#e05555', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>
        <button
          onClick={refresh}
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '0.65rem',
            color: '#f0e6c8',
            background: 'linear-gradient(135deg,#c43a00,#8b1e00)',
            border: '1px solid rgba(196,58,0,0.5)',
            borderRadius: '3px',
            padding: '10px 16px',
            cursor: 'pointer',
          }}
        >
          RETRY
        </button>
      </div>
    )
  }

  // ── No active chapter (GM hasn't started) ──────────────────────────────

  if (!bossState) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a12',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '2rem',
        fontFamily: 'var(--font-body)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '2.5rem', opacity: 0.3 }}>⚔</div>
        <div style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.1rem',
          color: '#c9a84c',
        }}>
          The next chapter has not yet begun.
        </div>
        <div style={{ color: '#7a6a44', fontSize: '0.85rem', maxWidth: 360 }}>
          Your Game Master is preparing the next story. Check back soon — the Emberlight awaits.
        </div>
        <button
          onClick={refresh}
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '0.6rem',
            color: '#c9a84c',
            background: 'transparent',
            border: '1px solid rgba(201,168,76,0.25)',
            borderRadius: '3px',
            padding: '8px 14px',
            cursor: 'pointer',
            marginTop: '0.5rem',
          }}
        >
          CHECK AGAIN
        </button>
      </div>
    )
  }

  // ── Boss without sprite data (misconfigured) ──────────────────────────

  if (!bossState.boss) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a12',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '2rem',
        fontFamily: 'var(--font-body)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '2rem', opacity: 0.3 }}>☠</div>
        <div style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.1rem',
          color: '#c9a84c',
        }}>
          A presence stirs…
        </div>
        <div style={{ color: '#7a6a44', fontSize: '0.85rem', maxWidth: 400 }}>
          Something lurks in the shadows of this chapter, but it has not yet taken form.
          The Game Master may need to complete the weekly setup.
        </div>
      </div>
    )
  }

  // ── Rewards already claimed ────────────────────────────────────────────

  if (bossState.rewardsClaimed) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a12',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '2rem',
        fontFamily: 'var(--font-body)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '2.5rem' }}>✦</div>
        <div style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.2rem',
          color: '#c9a84c',
        }}>
          {bossState.boss.name} has been defeated!
        </div>
        <div style={{ color: '#7a6a44', fontSize: '0.85rem', maxWidth: 400 }}>
          The Emberbearers&apos; combined light has cleansed this chapter&apos;s threat.
          The town is safe — for now.
        </div>
        {bossState.narrativeText && (
          <div style={{
            color: '#5a5a3a',
            fontStyle: 'italic',
            fontSize: '0.8rem',
            maxWidth: 440,
            lineHeight: 1.5,
            marginTop: '0.5rem',
            padding: '0 1rem',
          }}>
            &ldquo;{bossState.narrativeText}&rdquo;
          </div>
        )}
      </div>
    )
  }

  // ── Boss defeated this session (HP just hit 0) ────────────────────────

  const isDefeated = bossState.boss.currentHp === 0

  if (isDefeated) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a12',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        padding: '2rem',
        fontFamily: 'var(--font-body)',
        textAlign: 'center',
      }}>
        <BossSprite
          key={bossState.chapterId}
          ref={spriteRef}
          config={bossState.boss.spriteConfig}
        />

        <div style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.2rem',
          color: '#c9a84c',
        }}>
          ✦ {bossState.boss.name} is no more ✦
        </div>

        {bossState.boss.description && (
          <div style={{
            color: '#7a6a44',
            fontSize: '0.85rem',
            maxWidth: 400,
          }}>
            {bossState.boss.description}
          </div>
        )}

        {bossState.narrativeText && (
          <div style={{
            color: '#5a5a3a',
            fontStyle: 'italic',
            fontSize: '0.8rem',
            maxWidth: 440,
            lineHeight: 1.5,
          }}>
            &ldquo;{bossState.narrativeText}&rdquo;
          </div>
        )}
      </div>
    )
  }

  // ── Active boss ────────────────────────────────────────────────────────

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a12',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '2rem',
      padding: '2rem',
    }}>
      {/* Chapter / Boss title */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.3rem',
          color: '#f0e6c8',
          marginBottom: '0.2rem',
        }}>
          ⚔ {bossState.title}
        </div>
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.75rem',
          color: '#7a6a44',
        }}>
          Week {bossState.weekNumber} — Chapter {bossState.chapterNumber}
        </div>
      </div>

      {/* HP bar */}
      <BossHPBar
        currentHp={bossState.boss.currentHp}
        maxHp={bossState.boss.maxHp}
        bossName={bossState.boss.name}
      />

      {/* Boss sprite */}
      <BossSprite
        key={bossState.chapterId}
        ref={spriteRef}
        config={bossState.boss.spriteConfig}
      />

      {/* Boss description */}
      {bossState.boss.description && (
        <div style={{
          fontFamily: 'var(--font-body)',
          fontStyle: 'italic',
          fontSize: '0.8rem',
          color: '#7a6a44',
          maxWidth: 440,
          textAlign: 'center',
          lineHeight: 1.6,
        }}>
          {bossState.boss.description}
        </div>
      )}

      {bossState.narrativeText && (
        <div style={{
          fontFamily: 'var(--font-body)',
          fontStyle: 'italic',
          fontSize: '0.75rem',
          color: '#5a5a3a',
          maxWidth: 440,
          textAlign: 'center',
          lineHeight: 1.5,
        }}>
          &ldquo;{bossState.narrativeText}&rdquo;
        </div>
      )}

      {/* Narrative context */}
      <div style={{
        fontFamily: 'var(--font-pixel)',
        fontSize: '0.6rem',
        color: '#555',
        letterSpacing: '0.5px',
      }}>
        COMPLETE QUESTS AND CHALLENGES TO ATTACK
      </div>
    </div>
  )
}
