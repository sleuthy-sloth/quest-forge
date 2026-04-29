'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { SignOutButton } from './SignOutButton'
import AvatarPreview from '@/components/avatar/AvatarPreview'

// ── Icons (Pixel Art SVGs) ──────────────────────────────────────────────────

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

function StatIcon({ stat, color }: { stat: string; color: string }) {
  switch (stat) {
    case 'Strength':
      return (
        <svg viewBox="0 0 20 20" width={16} height={16} style={{ imageRendering: 'pixelated' }} aria-hidden="true">
          <rect x="9" y="1"  width="2" height="14" fill={color} rx="0.5" />
          <rect x="5" y="7"  width="10" height="2" fill={color} rx="0.5" />
          <rect x="7" y="15" width="6"  height="3" fill={color} rx="0.5" />
          <circle cx="10" cy="2" r="1.5" fill={color} />
        </svg>
      )
    case 'Wisdom':
      return (
        <svg viewBox="0 0 20 20" width={16} height={16} style={{ imageRendering: 'pixelated' }} aria-hidden="true">
          <polygon points="10,1 12,7 18,7 13,11 15,18 10,14 5,18 7,11 2,7 8,7" fill={color} opacity="0.9" />
        </svg>
      )
    case 'Courage':
      return (
        <svg viewBox="0 0 20 20" width={16} height={16} style={{ imageRendering: 'pixelated' }} aria-hidden="true">
          <polygon points="10,1 12,8 19,8 14,13 16,19 10,15 4,19 6,13 1,8 8,8" fill={color} opacity="0.85" />
          <polygon points="10,1 11,7 15,9 10,15 5,9 9,7" fill="white" opacity="0.2" />
        </svg>
      )
    case 'Endurance':
      return (
        <svg viewBox="0 0 20 20" width={16} height={16} style={{ imageRendering: 'pixelated' }} aria-hidden="true">
          <path d="M10 2 L18 6 L18 12 Q18 18 10 19 Q2 18 2 12 L2 6 Z" fill={color} opacity="0.85" />
          <path d="M10 5 L15 8 L15 12 Q15 16 10 17 Q5 16 5 12 L5 8 Z" fill="rgba(0,0,0,0.25)" />
        </svg>
      )
    default: return null
  }
}

// ── Components ───────────────────────────────────────────────────────────────

function SectionHeading({ label, accent }: { label: string; accent: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
      <h2
        style={{
          fontFamily:     'var(--font-pixel), monospace',
          fontSize:       '0.65rem',
          letterSpacing:  '0.2em',
          color:          accent,
          imageRendering: 'pixelated',
          whiteSpace:     'nowrap',
          flexShrink:      0,
          textShadow:     `0 0 10px ${accent}44`,
        }}
      >
        {label}
      </h2>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${accent}44, transparent)` }} />
    </div>
  )
}

// ── Props ───────────────────────────────────────────────────────────────────

interface ProfileViewProps {
  profile: any
  classInfo: any
  stats: { name: string; value: number }[]
  completions: any[]
  purchases: any[]
  accent: string
  accent2: string
  primaryStat: string
  xpIntoLevel: number
  xpNeeded: number
  progressPct: number
  shard: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function ProfileView({
  profile,
  classInfo,
  stats,
  completions,
  purchases,
  accent,
  accent2,
  primaryStat,
  xpIntoLevel,
  xpNeeded,
  progressPct,
  shard,
}: ProfileViewProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="qf-phone-shell"
      style={{ padding: '1.5rem 1.25rem 4rem', minHeight: '100vh', overflowY: 'auto' }}
    >
      <div className="qf-ember-bg" />
      
      {/* ── Header / Avatar ────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} style={{ position: 'relative', marginBottom: '2.5rem', zIndex: 1 }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: '12px',
                background: `radial-gradient(circle at center, ${accent}22 0%, transparent 70%)`,
                border: `2px solid ${accent}44`,
                padding: '8px',
                boxShadow: `0 0 30px ${accent}11`,
                position: 'relative',
              }}
            >
              <div className="qf-corner-tl" /><div className="qf-corner-tr" />
              <div className="qf-corner-bl" /><div className="qf-corner-br" />
              
              <div style={{ width: '100%', height: '100%', borderRadius: '6px', overflow: 'hidden', background: 'rgba(0,0,0,0.2)' }}>
                {classInfo?.portrait ? (
                  <Image src={classInfo.portrait} alt="" fill style={{ objectFit: 'cover' }} />
                ) : (
                  <AvatarPreview avatarConfig={profile.avatar_config} size={120} />
                )}
              </div>
            </div>
            
            <Link
              href="/play/create-character?mode=edit"
              style={{
                position: 'absolute',
                bottom: -10,
                right: -10,
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'var(--qf-bg-card)',
                border: `1px solid ${accent}66`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                color: accent,
                fontSize: '1.2rem',
                textDecoration: 'none',
              }}
            >
              ✎
            </Link>
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <motion.h1
              className="qf-shimmer"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '2.2rem',
                fontWeight: 800,
                lineHeight: 1,
                marginBottom: '0.25rem',
              }}
            >
              {profile.display_name}
            </motion.h1>
            <p style={{ color: 'var(--qf-parchment)', fontSize: '0.85rem', marginBottom: '0.75rem', opacity: 0.8 }}>
              @{profile.username}
            </p>
            
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  background: `${accent}15`,
                  border: `1px solid ${accent}33`,
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '0.55rem',
                  color: accent,
                  letterSpacing: '0.1em',
                }}
              >
                LV {profile.level} {shard.toUpperCase()}
              </div>
              <div
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '0.55rem',
                  color: 'var(--qf-parchment-dim)',
                  letterSpacing: '0.1em',
                }}
              >
                {classInfo?.name.toUpperCase() ?? 'ADVENTURER'}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Resources ────────────────────────────────────────────────── */}
      <motion.div
        variants={itemVariants}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginBottom: '2.5rem',
          zIndex: 1,
        }}
      >
        <div className="qf-ornate-panel" style={{ padding: '1rem', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <XpIcon size={18} />
            <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.55rem', color: 'var(--qf-parchment-muted)' }}>XP POOL</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#6eb5ff' }}>
            {profile.xp_available.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--qf-parchment-muted)', fontStyle: 'italic' }}>
            {profile.xp_total.toLocaleString()} total earned
          </div>
        </div>
        
        <div className="qf-ornate-panel" style={{ padding: '1rem', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <GoldIcon size={18} />
            <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.55rem', color: 'var(--qf-parchment-muted)' }}>GOLD</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--qf-gold-300)' }}>
            {profile.gold.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--qf-parchment-muted)', fontStyle: 'italic' }}>
            Emporium currency
          </div>
        </div>
      </motion.div>

      {/* ── Progress ─────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} style={{ marginBottom: '2.5rem', zIndex: 1 }}>
        <SectionHeading label="LEVEL PROGRESSION" accent={accent} />
        <div style={{ padding: '0 0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--qf-parchment-dim)' }}>Next Level: {profile.level + 1}</span>
            <span style={{ color: accent }}>{xpIntoLevel} / {xpNeeded} XP</span>
          </div>
          <div className="qf-xp-bar" style={{ height: '14px', borderRadius: '7px' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="qf-xp-fill"
              style={{ borderRadius: '7px' }}
            />
          </div>
        </div>
      </motion.div>

      {/* ── Stats ───────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} style={{ marginBottom: '2.5rem', zIndex: 1 }}>
        <SectionHeading label="ATTRIBUTES" accent={accent} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
          {stats.map((stat) => {
            const isPrimary = stat.name === primaryStat
            return (
              <div
                key={stat.name}
                className="qf-ornate-panel"
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  background: isPrimary ? `linear-gradient(135deg, ${accent}15, var(--qf-bg-card))` : 'var(--qf-bg-card)',
                  border: isPrimary ? `1px solid ${accent}66` : '1px solid var(--qf-rule)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <StatIcon stat={stat.name} color={isPrimary ? accent : 'var(--qf-parchment-muted)'} />
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: isPrimary ? accent : 'var(--qf-parchment)' }}>
                    {stat.value}
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.5rem', color: 'var(--qf-parchment-muted)', letterSpacing: '0.05em' }}>
                  {stat.name.toUpperCase()}
                </div>
                {isPrimary && (
                  <div style={{ fontSize: '0.6rem', color: accent, marginTop: '0.25rem', fontStyle: 'italic' }}>
                    Primary Stat
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* ── Adventure Log ───────────────────────────────────────────── */}
      <motion.div variants={itemVariants} style={{ marginBottom: '2.5rem', zIndex: 1 }}>
        <SectionHeading label="ADVENTURE LOG" accent={accent} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {completions.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--qf-parchment)', fontStyle: 'italic', padding: '3.5rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              Your chronicles are empty. Begin your deeds!
            </p>
          ) : (
            completions.map((c, i) => (
              <div
                key={c.id}
                style={{
                  padding: '1rem',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: c.verified ? 'rgba(90,171,110,0.1)' : 'rgba(232,160,32,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                    color: c.verified ? 'var(--qf-success)' : 'var(--qf-gold-300)',
                  }}
                >
                  {c.verified ? '✓' : '⏳'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--qf-parchment)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.chores?.title ?? 'Epic Deed'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--qf-parchment-muted)' }}>
                    {new Date(c.completed_at).toLocaleDateString()}
                  </div>
                </div>
                {c.xp_awarded > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#6eb5ff', fontSize: '0.75rem', fontWeight: 600 }}>
                    +{c.xp_awarded} <XpIcon size={12} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* ── Inventory ────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} style={{ marginBottom: '3rem', zIndex: 1 }}>
        <SectionHeading label="LEGENDARY LOOT" accent={accent} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
          {purchases.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--qf-parchment)', fontStyle: 'italic', padding: '3.5rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              No loot found. Visit the Emporium.
            </div>
          ) : (
            purchases.map((p) => (
              <div
                key={p.id}
                className="qf-ornate-panel"
                style={{ padding: '1rem', borderRadius: '8px', opacity: p.redeemed ? 0.6 : 1 }}
              >
                <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--qf-gold-200)' }}>
                  {p.loot_store_items?.name ?? 'Mystic Item'}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--qf-parchment-dim)', marginBottom: '0.75rem' }}>
                  {p.loot_store_items?.category.toUpperCase()}
                </div>
                <div
                  style={{
                    fontSize: '0.55rem',
                    fontFamily: 'var(--font-pixel)',
                    color: p.redeemed ? 'var(--qf-success)' : 'var(--qf-gold-400)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  {p.redeemed ? 'CLAIMED' : 'READY TO CLAIM'}
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* ── Actions ──────────────────────────────────────────────────── */}
      <motion.div
        variants={itemVariants}
        style={{
          display: 'flex',
          gap: '1rem',
          marginTop: 'auto',
          paddingTop: '2rem',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          zIndex: 1,
        }}
      >
        <Link
          href="/play"
          style={{
            flex: 1,
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '6px',
            color: 'var(--qf-parchment)',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          Back to Dashboard
        </Link>
        <div style={{ flex: 1 }}>
          <SignOutButton />
        </div>
      </motion.div>
      
      {/* Floating Embers Component (Simplified Inline) */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: '100vh', x: `${Math.random() * 100}vw` }}
            animate={{ 
              opacity: [0, 0.8, 0],
              y: '-10vh',
              x: `${Math.random() * 100}vw`
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            style={{
              position: 'absolute',
              width: 2 + Math.random() * 3,
              height: 2 + Math.random() * 3,
              background: 'var(--qf-ember-bright)',
              borderRadius: '50%',
              boxShadow: '0 0 6px var(--qf-ember-glow)',
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}
