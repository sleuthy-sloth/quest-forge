'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import classesData from '@/lore/classes.json'

const LS_KEY = 'questforge_walkthrough_dismissed'

interface ClassDef {
  id: string
  name: string
  archetype: string
  embershard_form: string
  color_primary: string
  color_secondary: string
  icon: string
}

const CLASSES: ClassDef[] = (classesData as { classes: ClassDef[] }).classes

interface Slide {
  title: string
  subtitle: string
  body: string[]
  icon: string
}

function buildSlides(avatarClass: string | null): Slide[] {
  const cls = CLASSES.find(c => c.id === avatarClass)
  const arch = cls?.archetype ?? 'Champion'
  const shard = cls?.embershard_form ?? 'a spark of Emberlight'
  const color = cls?.color_primary ?? '#c9a84c'

  return [
    {
      title: 'Welcome to Embervale',
      subtitle: 'A world sustained by light',
      icon: '⟡',
      body: [
        'Long ago, the Emberlight was kindled — a primordial force that flows through all living things, warming the land and holding back the darkness.',
        'But the Emberlight has been dimming. The Hollow creeps in at the edges, and without heroes to tend the flame, it will go out entirely.',
        'You have been chosen as an Emberbearer — one who can channel the Emberlight through deeds, knowledge, and courage.',
      ],
    },
    {
      title: `The ${arch}`,
      subtitle: 'Your Embershard awaits',
      icon: cls?.icon ?? '⟡',
      body: [
        `Your Embershard takes the form of ${shard}. It grows stronger as you do.`,
        `As a ${cls?.name ?? 'hero'} of Hearthhold, your calling is to venture out, complete quests, and prove your worth.`,
        'Every challenge you overcome feeds the Emberlight — and pushes the Hollow back a little further.',
      ],
    },
    {
      title: 'The Quest Board',
      subtitle: 'Real efforts, real rewards',
      icon: '📜',
      body: [
        'The village square board in Hearthhold bears decrees from Elder Maren and the folk of the village. These are your daily quests.',
        'Complete chores and tasks in the real world to earn XP and gold. Your Game Master will assign these and verify your victories.',
        'Every completed quest deals damage to the week\'s boss and brings you closer to the next level.',
      ],
    },
    {
      title: 'The Academy',
      subtitle: 'Sharpen your mind',
      icon: '⚗',
      body: [
        'In the Wizard\'s Tower of Knowledge, Professor Ignis awaits with challenges of the mind.',
        'Math, vocabulary, history, science, logic — each discipline you master earns XP and reveals more of Embervale\'s ancient lore.',
        'Return daily for new exercises. Knowledge is the truest light against the Hollow.',
      ],
    },
    {
      title: 'The Loot Store & Boss Battles',
      subtitle: 'Gear up and stand together',
      icon: '💎',
      body: [
        'Rook the merchant runs the Loot Emporium. Spend your gold on items, cosmetics, and real-world rewards.',
        'Each week, a new boss rises from the Hollow. Your entire household fights together — every quest and lesson deals damage to the boss.',
        'Defeat the boss to unlock the next chapter of the story. The fate of Embervale rests in your hands.',
      ],
    },
  ]
}

export default function WalkthroughOverlay({
  avatarClass,
}: {
  avatarClass: string | null
}) {
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

  const slides = buildSlides(avatarClass)
  const slide = slides[slideIdx]

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
          {slides.map((_, i) => (
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

        {/* Icon */}
        <div
          style={{
            fontSize: '2rem',
            textAlign: 'center',
            marginBottom: '0.75rem',
            color: 'rgba(201,168,76,0.8)',
          }}
          aria-hidden="true"
        >
          {slide.icon}
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
          {slideIdx < slides.length - 1 ? (
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
              Begin Your Quest!
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
