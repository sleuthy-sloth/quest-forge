'use client'

import Link from 'next/link'
import AvatarPreview from './AvatarPreview'
import EnemyRenderer from './EnemyRenderer'
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
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span className="font-pixel" style={{ fontSize: 5, color: 'var(--qf-parchment-muted)', letterSpacing: '0.1em' }}>
          {label}
        </span>
        <span className="font-pixel" style={{ fontSize: 5, color: 'var(--qf-parchment-muted)' }}>
          {pct}/100
        </span>
      </div>
      <div
        style={{
          width: '100%',
          height: 5,
          background: '#0a0a12',
          border: '1px solid var(--qf-gold-600)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: color,
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
    status === 'current'   ? 'RESUME →'
    : status === 'available' ? 'BEGIN →'
    : status === 'defeated'  ? `+ XP CLAIMED`
    : 'DEFEAT PRIOR FOE'

  const inner = (
    <div
      className="qf-ornate-panel"
      style={{
        position: 'relative',
        marginBottom: 12,
        padding: 14,
        opacity: s.dim,
        border: status === 'current' ? `1px solid ${teacher.glow}` : undefined,
        background:
          status === 'current'
            ? `linear-gradient(135deg, ${teacher.glow}18, var(--qf-bg-card-alt) 70%)`
            : undefined,
        cursor: isClickable ? 'pointer' : 'default',
        textDecoration: 'none',
      }}
    >
      <Corners />

      {/* Status pip */}
      <div
        className="font-pixel"
        style={{
          position: 'absolute',
          top: 10,
          right: 14,
          fontSize: 6,
          color: s.color,
          letterSpacing: '0.15em',
        }}
      >
        {s.label}
      </div>

      {/* Subject + level */}
      <div
        className="font-pixel"
        style={{ fontSize: 6, color: 'var(--qf-parchment-muted)', letterSpacing: '0.18em' }}
      >
        {teacher.subject.toUpperCase()} · LV {teacher.level}
      </div>

      {/* Duel stage: player vs teacher */}
      <div
        style={{
          marginTop: 10,
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {/* Player side */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div
            style={{
              width: 64,
              height: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'radial-gradient(circle, rgba(232,160,32,0.15), transparent 70%)',
              border: '1px solid var(--qf-rule)',
              filter:
                status === 'current'
                  ? 'drop-shadow(0 0 8px rgba(255,140,58,0.4))'
                  : 'none',
            }}
          >
            <AvatarPreview avatarConfig={playerAvatarConfig} size={52} />
          </div>
          <div className="font-pixel" style={{ fontSize: 5, color: 'var(--qf-gold-300)', letterSpacing: '0.1em', textAlign: 'center' }}>
            {playerName} · LV {playerLevel}
          </div>
        </div>

        {/* VS */}
        <div
          className="font-pixel"
          style={{
            fontSize: 14,
            color: 'var(--qf-ember-deep)',
            textShadow: `0 0 8px ${teacher.glow}, 0 0 4px var(--qf-ember-glow)`,
            letterSpacing: '0.1em',
          }}
        >
          VS
        </div>

        {/* Teacher side */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div
            style={{
              width: 64,
              height: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `radial-gradient(circle, ${teacher.glow}33, transparent 70%)`,
              border: `1px solid ${teacher.glow}66`,
              filter: status === 'defeated' ? 'grayscale(0.7) brightness(0.55)' : 'none',
            }}
          >
            <EnemyRenderer
              enemy={enemy}
              animationPreset={preset}
              size={52}
              autoAttack={status === 'current'}
              autoAttackInterval={8000}
            />
          </div>
          <div
            className="font-pixel"
            style={{
              fontSize: 5,
              color: teacher.glow,
              letterSpacing: '0.1em',
              textAlign: 'center',
              maxWidth: 80,
              lineHeight: 1.3,
            }}
          >
            {teacher.name.toUpperCase()}
          </div>
        </div>
      </div>

      {/* HP bars */}
      <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
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
          marginTop: 10,
          padding: '8px 10px',
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid var(--qf-rule)',
          fontFamily: 'var(--font-body)',
          fontSize: 11,
          color: 'var(--qf-parchment-dim)',
          fontStyle: 'italic',
          lineHeight: 1.4,
          textAlign: 'center',
        }}
      >
        &ldquo;{teacher.tagline}&rdquo;
      </div>

      {/* Action row */}
      <div
        style={{
          marginTop: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        <div
          className="font-pixel"
          style={{
            fontSize: 5,
            color: teacher.glow,
            border: `1px solid ${teacher.glow}`,
            padding: '3px 6px',
            letterSpacing: '0.05em',
            maxWidth: 180,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {teacher.title.toUpperCase()}
        </div>

        {isClickable ? (
          <span
            className="font-pixel"
            style={{
              fontSize: 7,
              color:
                status === 'current'
                  ? 'var(--qf-bg-void)'
                  : 'var(--qf-gold-300)',
              background:
                status === 'current'
                  ? 'linear-gradient(135deg, var(--qf-gold-500), var(--qf-gold-400))'
                  : 'transparent',
              border: `1px solid ${status === 'current' ? 'var(--qf-gold-300)' : 'var(--qf-gold-600)'}`,
              padding: '5px 10px',
              letterSpacing: '0.08em',
              flexShrink: 0,
            }}
          >
            {actionLabel}
          </span>
        ) : status === 'defeated' ? (
          <span
            className="font-pixel"
            style={{ fontSize: 6, color: '#5aab6e', letterSpacing: '0.1em' }}
          >
            {xpRange} CLAIMED
          </span>
        ) : (
          <span
            className="font-pixel"
            style={{ fontSize: 6, color: 'var(--qf-parchment-muted)', letterSpacing: '0.15em' }}
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
