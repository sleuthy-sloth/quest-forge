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
          padding: '14px 14px 12px',
          background: `linear-gradient(135deg, ${teacher.glow}18, rgba(15,17,24,0.85))`,
          border: `1px solid ${teacher.glow}44`,
          borderLeft: `3px solid ${teacher.glow}`,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          cursor: 'pointer',
        }}
      >
        {/* Label */}
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: 14,
            fontFamily: 'var(--font-pixel)',
            fontSize: 9,
            color: teacher.glow,
            letterSpacing: '0.18em',
          }}
        >
          NOW DUELING
        </div>

        {/* Enemy avatar / Portrait */}
        <div
          style={{
            marginTop: 14,
            flexShrink: 0,
            width: 56,
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: teacher.portrait ? 'none' : `radial-gradient(circle, ${teacher.glow}22, transparent 70%)`,
            border: `1px solid ${teacher.glow}44`,
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {teacher.portrait ? (
            <img
              src={teacher.portrait}
              alt={teacher.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <EnemyRenderer
              enemy={enemy}
              animationPreset={animationPreset}
              size={44}
              autoAttack
              autoAttackInterval={9000}
            />
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0, marginTop: 12 }}>
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: 10,
              color: teacher.glow,
              letterSpacing: '0.1em',
              marginBottom: 4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {teacher.name.toUpperCase()}
          </div>
          <div
            style={{
              fontSize: 13,
              color: 'var(--qf-parchment-dim)',
              fontStyle: 'italic',
              lineHeight: 1.4,
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
            fontSize: 9,
            color: 'var(--qf-bg-void)',
            background: `linear-gradient(135deg, ${teacher.glow}, ${teacher.glow}cc)`,
            padding: '10px 14px',
            letterSpacing: '0.08em',
            whiteSpace: 'nowrap',
            minHeight: 44,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          FIGHT →
        </div>
      </div>
    </Link>
  )
}
