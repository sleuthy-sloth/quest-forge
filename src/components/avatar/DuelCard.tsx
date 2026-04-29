'use client'

import Link from 'next/link'
import Image from 'next/image'
import AvatarPreview from './AvatarPreview'
import EnemyRenderer from './EnemyRenderer'
import { PixelIcon } from '../qf/PixelIcon'
import type { EncounterConfig } from '@/types/encounter'
import type { TeacherDef, TeacherStatus } from '@/lib/constants/academy'
import { TEACHER_STATUS_STYLE, SLUG_PRESET } from '@/lib/constants/academy'

// ── Props ─────────────────────────────────────────────────────────────────────

interface DuelCardProps {
  teacher: TeacherDef
  enemy: EncounterConfig
  status: TeacherStatus
  playerAvatarConfig: Record<string, unknown> | null
  playerName: string
  playerLevel: number
  playerClass: string
  playerHp?: number
  enemyHp?: number
  xpRange: string
}

// ── Subject icons ─────────────────────────────────────────────────────────────

const SUBJECT_ICONS: Record<string, string> = {
  'Math Arena':        'sword',
  'Reading Tome':      'scroll',
  'Science Labyrinth': 'flask',
  'History Scroll':    'scroll',
  'Vocab Duel':        'book',
  'Logic Gate':        'circuit',
  'Word Forge':        'hammer',
  'General Knowledge': 'globe',
  'Life Skills':       'heart',
}

// ── Corners helper ────────────────────────────────────────────────────────────

function Corners() {
  return (
    <>
      <span className="qf-corner-tl" />
      <span className="qf-corner-tr" />
      <span className="qf-corner-bl" />
      <span className="qf-corner-br" />
    </>
  )
}

// ── HP Strip ──────────────────────────────────────────────────────────────────

function HpStrip({ pct, label, color = '#e05555' }: { pct: number; label: string; color?: string }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span className="font-pixel" style={{ fontSize: 8, color: 'var(--qf-parchment-muted)', letterSpacing: '0.1em' }}>
          {label}
        </span>
        <span className="font-pixel" style={{ fontSize: 8, color: 'var(--qf-parchment-muted)' }}>
          {pct}/100
        </span>
      </div>
      <div
        style={{
          width: '100%',
          height: 10,
          background: '#0a0a12',
          border: '1px solid var(--qf-gold-600)',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: color,
            borderRadius: 3,
            transition: 'width 0.6s ease',
          }}
        />
      </div>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DuelCard({
  teacher,
  enemy,
  status,
  playerAvatarConfig,
  playerName,
  playerLevel,
  playerClass,
  playerHp = 100,
  enemyHp,
  xpRange,
}: DuelCardProps) {
  const s = TEACHER_STATUS_STYLE[status]
  const preset = SLUG_PRESET[teacher.slug] ?? 'warrior'

  const computedEnemyHp =
    enemyHp ??
    (status === 'defeated' ? 0 : status === 'current' ? 45 : 100)

  const isClickable = status === 'current' || status === 'available'
  const actionLabel =
    status === 'current'   ? 'ENTER THE DUEL →'
    : status === 'available' ? 'BEGIN →'
    : status === 'defeated'  ? `+ XP CLAIMED`
    : 'DEFEAT PRIOR FOE'

  const spriteSize = status === 'current' ? 96 : 80

  const inner = (
    <div
      className="qf-ornate-panel"
      style={{
        position: 'relative',
        marginBottom: 12,
        padding: 0,
        opacity: s.dim,
        border: status === 'current' ? `2px solid ${teacher.glow}` : undefined,
        background:
          status === 'current'
            ? `linear-gradient(135deg, ${teacher.glow}18, var(--qf-bg-card-alt) 70%)`
            : undefined,
        cursor: isClickable ? 'pointer' : 'default',
        textDecoration: 'none',
        overflow: 'hidden',
      }}
    >
      <Corners />

      {/* Subject colour stripe at top */}
      <div style={{
        height: 4,
        background: `linear-gradient(90deg, ${teacher.glow}, ${teacher.glow}44)`,
        opacity: status === 'defeated' ? 0.4 : 1,
      }} />

      <div style={{ padding: status === 'current' ? '18px 16px 16px' : '14px 14px 12px' }}>

        {/* Subject icon + label row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PixelIcon id={(SUBJECT_ICONS[teacher.subject] || 'star') as any} size={status === 'current' ? 24 : 18} color={teacher.glow} />
            <span
              className="font-pixel"
              style={{ fontSize: status === 'current' ? 9 : 8, color: teacher.glow, letterSpacing: '0.15em' }}
            >
              {teacher.subject.toUpperCase()} · LV {teacher.level}
            </span>
          </div>
          {/* Status pip */}
          <div
            className="font-pixel"
            style={{
              fontSize: 8,
              color: s.color,
              letterSpacing: '0.12em',
            }}
          >
            {s.label}
          </div>
        </div>

        {/* Duel stage: player vs teacher */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            gap: 10,
            marginBottom: 14,
          }}
        >
          {/* Player side */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                width: spriteSize,
                height: spriteSize,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(circle, rgba(232,160,32,0.15), transparent 70%)',
                border: '1px solid var(--qf-rule)',
                borderRadius: 4,
                filter:
                  status === 'current'
                    ? 'drop-shadow(0 0 10px rgba(255,140,58,0.45))'
                    : 'none',
              }}
            >
              <AvatarPreview avatarConfig={playerAvatarConfig} size={spriteSize - 16} />
            </div>
            <div className="font-pixel" style={{ fontSize: 7, color: 'var(--qf-gold-300)', letterSpacing: '0.08em', textAlign: 'center', lineHeight: 1.4 }}>
              {playerName}<br />LV {playerLevel}
            </div>
          </div>

          {/* VS */}
          <div
            className="font-pixel"
            style={{
              fontSize: status === 'current' ? 18 : 14,
              color: 'var(--qf-ember-deep)',
              textShadow: `0 0 10px ${teacher.glow}, 0 0 4px var(--qf-ember-glow)`,
              letterSpacing: '0.1em',
            }}
          >
            VS
          </div>

          {/* Teacher side */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                width: spriteSize,
                height: spriteSize,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: teacher.portrait
                  ? 'none'
                  : `radial-gradient(circle, ${teacher.glow}33, transparent 70%)`,
                border: `2px solid ${teacher.glow}66`,
                borderRadius: 4,
                filter: status === 'defeated' ? 'grayscale(0.7) brightness(0.55)' : 'none',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {teacher.portrait ? (
                <Image
                  src={teacher.portrait}
                  alt={teacher.name}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <EnemyRenderer
                  enemy={enemy}
                  animationPreset={preset}
                  size={spriteSize - 12}
                  autoAttack={status === 'current'}
                  autoAttackInterval={8000}
                />
              )}
            </div>
            <div
              className="font-pixel"
              style={{
                fontSize: 7,
                color: teacher.glow,
                letterSpacing: '0.08em',
                textAlign: 'center',
                maxWidth: spriteSize + 16,
                lineHeight: 1.4,
              }}
            >
              {teacher.name.toUpperCase()}
            </div>
          </div>
        </div>

        {/* HP bars */}
        <div style={{ marginBottom: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <HpStrip
            pct={playerHp}
            label="HERO"
            color="linear-gradient(180deg, #5aab6e 0%, #2eb85c 50%, #207040 100%)"
          />
          <HpStrip
            pct={computedEnemyHp}
            label="FOE"
            color="linear-gradient(180deg, #ff5050 0%, #c43a00 50%, #8a1f00 100%)"
          />
        </div>

        {/* Teacher tagline */}
        <div
          style={{
            marginBottom: 12,
            padding: '10px 12px',
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid var(--qf-rule)',
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            color: 'var(--qf-parchment-dim)',
            fontStyle: 'italic',
            lineHeight: 1.5,
            textAlign: 'center',
          }}
        >
          &ldquo;{teacher.tagline}&rdquo;
        </div>

        {/* Action row */}
        {isClickable ? (
          status === 'current' ? (
            /* Full-width CTA for the active teacher */
            <div
              className="font-pixel"
              style={{
                width: '100%',
                display: 'block',
                textAlign: 'center',
                fontSize: 10,
                color: 'var(--qf-bg-void)',
                background: `linear-gradient(135deg, ${teacher.glow}, ${teacher.glow}cc)`,
                border: `1px solid ${teacher.glow}`,
                padding: '12px 16px',
                letterSpacing: '0.1em',
                borderRadius: 3,
                boxSizing: 'border-box',
              }}
            >
              {actionLabel}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
              <div
                className="font-pixel"
                style={{
                  fontSize: 7,
                  color: teacher.glow,
                  border: `1px solid ${teacher.glow}`,
                  padding: '4px 8px',
                  letterSpacing: '0.05em',
                  maxWidth: 200,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {teacher.title.toUpperCase()}
              </div>
              <span
                className="font-pixel"
                style={{
                  fontSize: 9,
                  color: 'var(--qf-gold-300)',
                  border: `1px solid var(--qf-gold-600)`,
                  padding: '6px 12px',
                  letterSpacing: '0.08em',
                  flexShrink: 0,
                }}
              >
                {actionLabel}
              </span>
            </div>
          )
        ) : status === 'defeated' ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
            <div
              className="font-pixel"
              style={{
                fontSize: 7,
                color: teacher.glow,
                border: `1px solid ${teacher.glow}`,
                padding: '4px 8px',
                letterSpacing: '0.05em',
                maxWidth: 200,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {teacher.title.toUpperCase()}
            </div>
            <span
              className="font-pixel"
              style={{ fontSize: 8, color: '#5aab6e', letterSpacing: '0.1em' }}
            >
              {xpRange} CLAIMED
            </span>
          </div>
        ) : (
          <span
            className="font-pixel"
            style={{ fontSize: 8, color: 'var(--qf-parchment-muted)', letterSpacing: '0.12em' }}
          >
            {actionLabel}
          </span>
        )}
      </div>
    </div>
  )

  if (!isClickable) return inner

  return (
    <Link
      href={`/play/academy/${teacher.slug}`}
      style={{ textDecoration: 'none', display: 'block' }}
      aria-label={`${teacher.name} — ${teacher.subject}: ${teacher.tagline}`}
    >
      {inner}
    </Link>
  )
}
