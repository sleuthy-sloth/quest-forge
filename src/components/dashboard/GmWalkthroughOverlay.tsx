'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'

const LS_KEY = 'questforge_gm_walkthrough_v1'

interface Slide {
  title: string
  subtitle: string
  body: string[]
  image: string
}

const SLIDES: Slide[] = [
  {
    title: "You're the Game Master",
    subtitle: "Lead your family's legend",
    image: '/images/walkthrough/gm_1.png',
    body: [
      "Quest Forge turns everyday tasks into a fantasy RPG for your family. You build the world; your kids live in it.",
      "As the GM, you manage the story, approve quests, and set the rewards that keep the Emberlight burning.",
    ],
  },
  {
    title: "Issue Quest Decrees",
    subtitle: "Assign the path",
    image: '/images/walkthrough/gm_2.png',
    body: [
      "Create chores with difficulty, XP, and gold rewards. Use our suggestions or create your own custom deeds.",
      "When a kid completes a task, it appears in your Approvals queue. You verify completions before rewards are awarded.",
    ],
  },
  {
    title: "The Weekly Boss",
    subtitle: "A shared challenge",
    image: '/images/walkthrough/gm_3.png',
    body: [
      "Each week, a boss appears. Every approved chore and completed challenge deals damage equal to its XP value.",
      "All household members attack the same boss together. Boss HP scales to your number of players.",
    ],
  },
  {
    title: "Rook's Emporium",
    subtitle: "Loot and legacy",
    image: '/images/walkthrough/gm_4.png',
    body: [
      "Stock the loot store with real-world rewards (screen time, choosing dinner, small cash).",
      "Kids spend their hard-earned XP and gold to claim them. You fulfill the redemptions when they're ready.",
    ],
  },
  {
    title: "The Chronicle Arc",
    subtitle: "The Chronicles of Embervale",
    image: '/images/walkthrough/gm_5.png',
    body: [
      "As your kids earn XP, the story of Embervale unfolds. New chapters unlock automatically.",
      "13 arcs, 52 bosses, and a narrative personalized to your family's heroes.",
    ],
  },
  {
    title: "Success is Effort",
    subtitle: "A world blooming with light",
    image: '/images/walkthrough/gm_6.png',
    body: [
      "Quest Forge is designed to reward process, not just results. Celebrate every small victory as the Light grows stronger.",
      "You can replay this tour anytime from Settings. Now, go forth and build your legend!",
    ],
  },
]

export default function GmWalkthroughOverlay() {
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const [slideIdx, setSlideIdx] = useState(0)

  const shouldShow = useCallback(() => {
    if (typeof window === 'undefined') return false
    const walkthroughParam = searchParams.get('walkthrough')
    if (walkthroughParam === '1') return true
    return !localStorage.getItem(LS_KEY)
  }, [searchParams])

  useEffect(() => {
    setOpen(shouldShow())
  }, [shouldShow])

  function dismiss() {
    try { localStorage.setItem(LS_KEY, '1') } catch { /* noop */ }
    setOpen(false)
  }

  const slide = SLIDES[slideIdx]

  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(2,4,12,0.92)',
        backdropFilter: 'blur(6px)',
        padding: '1rem',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 480,
          background: 'linear-gradient(160deg, rgba(12,8,24,0.98), rgba(6,4,16,0.98))',
          border: '1px solid rgba(201,168,76,0.3)',
          borderRadius: 6,
          padding: '2rem 1.5rem 1.5rem',
          boxShadow: '0 0 60px rgba(201,168,76,0.08), inset 0 0 40px rgba(201,168,76,0.02)',
        }}
      >
        {/* Step indicator */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            justifyContent: 'center',
            marginBottom: '1.25rem',
          }}
        >
          {SLIDES.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === slideIdx ? 24 : 8,
                height: 6,
                borderRadius: 3,
                background: i === slideIdx
                  ? 'rgba(201,168,76,0.75)'
                  : i < slideIdx
                    ? 'rgba(255,255,255,0.25)'
                    : 'rgba(255,255,255,0.08)',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Image */}
        <div
          style={{
            width: '100%',
            height: 180,
            borderRadius: 4,
            overflow: 'hidden',
            marginBottom: '1.25rem',
            border: '1px solid rgba(201,168,76,0.2)',
          }}
        >
          <img
            src={slide.image}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Title */}
        <h2
          style={{
            fontFamily: 'var(--font-heading), serif',
            fontSize: '1.1rem',
            fontWeight: 700,
            color: '#f0e6c8',
            textAlign: 'center',
            marginBottom: '0.25rem',
            letterSpacing: '0.02em',
          }}
        >
          {slide.title}
        </h2>

        {/* Subtitle */}
        <p
          style={{
            fontFamily: 'var(--font-heading), serif',
            fontSize: '0.75rem',
            color: 'rgba(201,168,76,0.55)',
            textAlign: 'center',
            marginBottom: '1.25rem',
            fontStyle: 'italic',
            letterSpacing: '0.06em',
          }}
        >
          {slide.subtitle}
        </p>

        {/* Body text */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
          {slide.body.map((paragraph, i) => (
            <p
              key={i}
              style={{
                fontFamily: 'var(--font-body), serif',
                fontSize: '0.85rem',
                lineHeight: 1.7,
                color: 'rgba(240,235,220,0.85)',
              }}
            >
              {paragraph}
            </p>
          ))}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {slideIdx < SLIDES.length - 1 ? (
            <>
              <button
                onClick={dismiss}
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  borderRadius: 4,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'transparent',
                  color: 'rgba(200,215,255,0.4)',
                  fontFamily: 'var(--font-heading), serif',
                  fontSize: '0.7rem',
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                Skip
              </button>
              <button
                onClick={() => setSlideIdx(i => i + 1)}
                style={{
                  flex: 2,
                  padding: '0.65rem',
                  borderRadius: 4,
                  border: '1px solid rgba(201,168,76,0.45)',
                  background: 'linear-gradient(135deg, rgba(30,24,80,0.9), rgba(50,30,100,0.9))',
                  color: 'rgba(201,168,76,0.95)',
                  fontFamily: 'var(--font-heading), serif',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                Next →
              </button>
            </>
          ) : (
            <button
              onClick={dismiss}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 4,
                border: '1px solid rgba(201,168,76,0.5)',
                background: 'linear-gradient(135deg, rgba(30,24,80,0.95), rgba(50,30,100,0.95))',
                color: 'rgba(201,168,76,1)',
                fontFamily: 'var(--font-heading), serif',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                cursor: 'pointer',
                textTransform: 'uppercase',
                transition: 'all 0.15s',
              }}
            >
              Master the Ember!
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
