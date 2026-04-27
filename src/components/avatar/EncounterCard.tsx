'use client'

import Link from 'next/link'
import EnemyRenderer from './EnemyRenderer'
import type { AnimationPreset } from '@/lib/constants/lpc-animations'
import type { GameEntry } from '@/lib/constants/academy'
import type { EncounterConfig } from '@/types/encounter'

// ── Animation preset map ─────────────────────────────────────────────────────
// Maps each game slug to an animation preset that determines the attack action
// (slash / thrust / cast) used by AnimatedAvatar during auto-attack bursts.
//
// Warrior → slash row, Mage → cast row, Rogue → thrust row, Scholar → slash row.
// Presets are chosen to match each enemy's visual theme and equipment.

const SLUG_PRESET: Record<string, AnimationPreset> = {
  'math-arena':        'warrior',  // Abyssal Calculator — armored, longsword
  'word-forge':        'warrior',  // Rune Smith — leather, sword
  'science-labyrinth': 'scholar',  // Alchemical Horror — hood, spear
  'reading-tome':      'mage',     // Eldritch Scribe — robes, no weapon (caster)
  'history-scroll':    'warrior',  // Time Shade — sword, tattered cape
  'vocab-duel':        'mage',     // Hexweaver — robes, crown (caster)
  'logic-gate':        'warrior',  // Construct Sentinel — plate, sword + shield
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface EncounterCardProps {
  /** The game entry from GAMES array (slug, name, accent, tagline). */
  game: GameEntry
  /** The enemy encounter config (avatar, glowColor, display name). */
  enemy: EncounterConfig
  /** Formatted XP range string like "20–30 XP". */
  xpRange: string
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * A battle-selection card for the Academy hub.
 *
 * Renders an animated enemy avatar (via AnimatedAvatar) with an ambient glow
 * effect, enemy name, game tagline, and XP badge.  Wraps the whole card in a
 * `<Link>` to `/play/academy/{slug}`.
 *
 * **Glow animation:**
 * - A radial-gradient circle pulses via CSS `@keyframes` behind the avatar.
 * - Brightens on card hover for a reactive feel.
 * - Paused under `prefers-reduced-motion: reduce`.
 *
 * **Auto-attack:**
 * - The enemy avatar periodically plays an attack animation burst.
 * - First attack fires ~8 s after mount; subsequent attacks every ~8 s.
 * - Attack animation uses the preset derived from SLUG_PRESET.
 */
export default function EncounterCard({ game, enemy, xpRange }: EncounterCardProps) {
  const preset = SLUG_PRESET[game.slug] ?? 'warrior'
  const glowId = `ec-glow-${game.slug}`

  return (
    <>
      <style>
        {`
          @keyframes ec-pulse-${game.slug} {
            0%, 100% { opacity: 0.3; transform: translate(-50%, -60%) scale(1); }
            50%      { opacity: 0.6; transform: translate(-50%, -60%) scale(1.06); }
          }
          .encounter-card:hover .${glowId} {
            opacity: 0.85 !important;
            transform: translate(-50%, -60%) scale(1.1) !important;
          }
          @media (prefers-reduced-motion: reduce) {
            .${glowId} {
              animation: none !important;
              opacity: 0.4 !important;
            }
            .encounter-card .group-hover\\:-translate-y-0\\.5 {
              transform: none !important;
            }
          }
        `}
      </style>

      <Link
        href={`/play/academy/${game.slug}`}
        className="encounter-card group flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(201,168,76,0.6)]"
        style={{ minWidth: 0, textDecoration: 'none' }}
        aria-label={`${enemy.name} — ${game.name}: ${game.tagline}. Rewards ${xpRange}.`}
      >
        <div
          className="transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:border-[rgba(201,168,76,0.5)]"
          style={{
            position: 'relative',
            background: 'linear-gradient(135deg, #1a1c2e 0%, #12131f 100%)',
            border: '1px solid rgba(201,168,76,0.18)',
            borderRadius: '3px',
            padding: '8px 4px 10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            borderTopColor: game.accent,
            borderTopWidth: '2px',
            overflow: 'hidden',
          }}
        >
          {/* ── Ambient glow ── */}
          <div
            className={glowId}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${enemy.glowColor}40, transparent 70%)`,
              pointerEvents: 'none',
              animation: `ec-pulse-${game.slug} 3s ease-in-out infinite`,
              transition: 'opacity 0.3s, transform 0.3s',
            }}
          />

          {/* ── Enemy avatar with auto-attack ── */}
          <EnemyRenderer
            enemy={enemy}
            animationPreset={preset}
            size={128}
            autoAttack
            autoAttackInterval={8000}
          />

          {/* ── Enemy name ── */}
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '6px',
              color: '#f0e6c8',
              textAlign: 'center',
              lineHeight: 1.4,
              marginTop: '2px',
            }}
          >
            {enemy.name}
          </div>

          {/* ── Game tagline ── */}
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontStyle: 'italic',
              fontSize: '9px',
              color: '#7a6a44',
              textAlign: 'center',
              lineHeight: 1.3,
            }}
          >
            {game.tagline}
          </div>

          {/* ── XP badge ── */}
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '5px',
              color: '#c9a84c',
              marginTop: '2px',
            }}
          >
            {xpRange}
          </div>
        </div>
      </Link>
    </>
  )
}
