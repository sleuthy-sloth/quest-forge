'use client'

import Link from 'next/link'
import EnemyRenderer from './EnemyRenderer'
import type { EncounterConfig } from '@/types/encounter'
import type { TeacherDef } from '@/lib/constants/academy'
import type { AnimationPreset } from '@/lib/constants/lpc-animations'

interface NowDuelingCalloutProps {
  teacher: TeacherDef
  enemy: EncounterConfig
  animationPreset: AnimationPreset
}

export default function NowDuelingCallout({ teacher, enemy, animationPreset }: NowDuelingCalloutProps) {
  return (
    <Link
      href={`/play/academy/${teacher.slug}`}
      style={{ textDecoration: 'none', display: 'block', marginBottom: 14 }}
      aria-label={`Now dueling ${teacher.name} — enter the academy`}
    >
      <div
        style={{
          position: 'relative',
          padding: '10px 12px',
          background: `linear-gradient(135deg, ${teacher.glow}18, rgba(15,17,24,0.85))`,
          border: `1px solid ${teacher.glow}44`,
          borderLeft: `3px solid ${teacher.glow}`,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          cursor: 'pointer',
        }}
      >
        {/* Label */}
        <div
          style={{
            position: 'absolute',
            top: 6,
            left: 12,
            fontFamily: 'var(--font-pixel)',
            fontSize: 5,
            color: teacher.glow,
            letterSpacing: '0.22em',
          }}
        >
          NOW DUELING
        </div>

        {/* Enemy avatar */}
        <div
          style={{
            marginTop: 12,
            flexShrink: 0,
            width: 48,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `radial-gradient(circle, ${teacher.glow}22, transparent 70%)`,
            border: `1px solid ${teacher.glow}44`,
          }}
        >
          <EnemyRenderer
            enemy={enemy}
            animationPreset={animationPreset}
            size={40}
            autoAttack
            autoAttackInterval={9000}
          />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0, marginTop: 10 }}>
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: 7,
              color: teacher.glow,
              letterSpacing: '0.1em',
              marginBottom: 3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {teacher.name.toUpperCase()}
          </div>
          <div
            style={{
              fontSize: 11,
              color: 'var(--qf-parchment-dim)',
              fontStyle: 'italic',
              lineHeight: 1.3,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            &ldquo;{teacher.tagline}&rdquo;
          </div>
        </div>

        {/* CTA */}
        <div
          style={{
            flexShrink: 0,
            fontFamily: 'var(--font-pixel)',
            fontSize: 7,
            color: 'var(--qf-bg-void)',
            background: `linear-gradient(135deg, ${teacher.glow}, ${teacher.glow}cc)`,
            padding: '6px 10px',
            letterSpacing: '0.08em',
            whiteSpace: 'nowrap',
          }}
        >
          FIGHT →
        </div>
      </div>
    </Link>
  )
}
