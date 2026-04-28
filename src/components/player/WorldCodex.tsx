'use client'

import { useState } from 'react'
import worldRaw from '@/lore/world.json'
import classesRaw from '@/lore/classes.json'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Region {
  name: string
  type: string
  description: string
  associated_arcs: number[]
}

interface NPC {
  name: string
  role: string
  personality: string
  speaking_style: string
}

interface EmberState {
  level_range: [number, number]
  name: string
  description: string
}

interface ClassDef {
  id: string
  name: string
  motto: string
  archetype: string
  embershard_form: string
  personality: string
  story_role: string
  color_primary: string
  color_secondary: string
}

// ── Static data ───────────────────────────────────────────────────────────────

const WORLD = worldRaw as typeof worldRaw
const CLASSES = classesRaw.classes as ClassDef[]
const REGIONS = WORLD.regions as Region[]
const NPCS = WORLD.npcs as NPC[]
const EMBER_STATES = WORLD.embershard_states as EmberState[]

const HOME_LOCS = Object.entries(WORLD.home_base.locations)

type Section = 'world' | 'class' | 'embershard' | 'hearthhold' | 'npcs' | 'regions'

const SECTIONS: { id: Section; label: string; icon: string }[] = [
  { id: 'world',      label: 'The World',   icon: '🌍' },
  { id: 'class',      label: 'Your Class',  icon: '⚔' },
  { id: 'embershard', label: 'Embershard',  icon: '💎' },
  { id: 'hearthhold', label: 'Hearthhold',  icon: '🏡' },
  { id: 'npcs',       label: 'Characters',  icon: '👥' },
  { id: 'regions',    label: 'Regions',     icon: '🗺' },
]

const NPC_ICONS: Record<string, string> = {
  'Elder Maren':         '🌿',
  'Rook':                '🎪',
  'Professor Ignis':     '🔬',
  'Kaya':                '⚔',
  'The Chronicler':      '📜',
  'Hollow-Touched Orrin':'💀',
}

const REGION_ICONS: Record<string, string> = {
  forest:      '🌲',
  coastal:     '🌊',
  mountains:   '⛰',
  grasslands:  '🌾',
  wasteland:   '🌑',
  underground: '💡',
}

const LOC_ICONS: Record<string, string> = {
  quest_board:    '📋',
  academy:        '🎓',
  loot_emporium:  '🛒',
  chronicle_hall: '📖',
  boss_gate:      '🚪',
}

// ── Sub-sections ──────────────────────────────────────────────────────────────

function WorldSection() {
  return (
    <div style={{ padding: '16px' }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🌍</div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, color: '#f0e6c8', margin: 0 }}>
          {WORLD.world_name}
        </h2>
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 6, color: '#7a6a44', letterSpacing: '0.15em', marginTop: 4 }}>
          THE EMBER REALM
        </div>
      </div>

      <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#b0c0e0', lineHeight: 1.7, marginBottom: 16 }}>
        {WORLD.summary}
      </p>

      {/* Two forces */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 4, padding: '12px 10px', textAlign: 'center' }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>🔥</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 13, color: '#c9a84c', marginBottom: 4 }}>
            {WORLD.core_force}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#7a6a44', lineHeight: 1.5 }}>
            The primordial warmth that flows through all living things. Where it burns, the world thrives.
          </div>
        </div>
        <div style={{ background: 'rgba(80,20,20,0.15)', border: '1px solid rgba(196,58,0,0.2)', borderRadius: 4, padding: '12px 10px', textAlign: 'center' }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>🌑</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 13, color: '#ff8c42', marginBottom: 4 }}>
            {WORLD.core_threat}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#7a6a44', lineHeight: 1.5 }}>
            An entropy made manifest. Where the Emberlight dims, the Hollow creeps in.
          </div>
        </div>
      </div>

      <div style={{ background: 'rgba(26,28,46,0.6)', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 4, padding: '12px 14px' }}>
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 6, color: '#7a6a44', letterSpacing: '0.12em', marginBottom: 6 }}>
          YOU ARE
        </div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 15, color: '#c9a84c', marginBottom: 4 }}>
          An Emberbearer
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#b09a6e', lineHeight: 1.6 }}>
          Chosen to strengthen the Emberlight through effort, learning, and courage. Every quest completed, every lesson learned — it all pushes back the Hollow.
        </div>
      </div>
    </div>
  )
}

function ClassSection({ playerClass }: { playerClass: string | null }) {
  const [selected, setSelected] = useState<string>(playerClass ?? CLASSES[0].id)
  const cls = CLASSES.find(c => c.id === selected) ?? CLASSES[0]

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 6, color: '#7a6a44', letterSpacing: '0.15em', marginBottom: 10 }}>
        CHOOSE A CLASS TO LEARN ABOUT
      </div>

      {/* Class picker */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
        {CLASSES.map(c => (
          <button
            key={c.id}
            onClick={() => setSelected(c.id)}
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 12,
              padding: '5px 10px',
              borderRadius: 3,
              border: `1px solid ${selected === c.id ? c.color_primary : 'rgba(90,58,26,0.4)'}`,
              background: selected === c.id ? `${c.color_primary}22` : 'transparent',
              color: selected === c.id ? c.color_secondary : '#7a6a44',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {c.name}
            {c.id === playerClass && (
              <span style={{ marginLeft: 4, fontSize: 9 }}>★</span>
            )}
          </button>
        ))}
      </div>

      {/* Class card */}
      <div style={{
        background: `linear-gradient(135deg, ${cls.color_primary}18, rgba(13,15,28,0.9))`,
        border: `1px solid ${cls.color_primary}44`,
        borderRadius: 6,
        padding: 16,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {cls.id === playerClass && (
          <div style={{
            position: 'absolute', top: 8, right: 10,
            fontFamily: 'var(--font-pixel)', fontSize: 5,
            color: cls.color_secondary, letterSpacing: '0.1em',
          }}>
            ★ YOUR CLASS
          </div>
        )}

        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 6, color: cls.color_primary, letterSpacing: '0.15em', marginBottom: 4 }}>
          {cls.archetype.toUpperCase()}
        </div>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, color: cls.color_secondary, margin: '0 0 8px' }}>
          {cls.name}
        </h3>

        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#b0c0e0', fontStyle: 'italic', marginBottom: 14, lineHeight: 1.5 }}>
          &ldquo;{cls.motto}&rdquo;
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
          {[
            { label: 'PERSONALITY', value: cls.personality },
            { label: 'ROLE IN STORY', value: cls.story_role },
          ].map(item => (
            <div key={item.label} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 3, padding: '8px 10px' }}>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 5, color: '#7a6a44', letterSpacing: '0.1em', marginBottom: 4 }}>
                {item.label}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#c9a84c', lineHeight: 1.5 }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 3, padding: '8px 10px' }}>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 5, color: '#7a6a44', letterSpacing: '0.1em', marginBottom: 4 }}>
            💎 EMBERSHARD FORM
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: cls.color_secondary, lineHeight: 1.5 }}>
            {cls.embershard_form}
          </div>
        </div>
      </div>
    </div>
  )
}

function EmberShardSection({ level }: { level: number }) {
  const current = EMBER_STATES.find(s => level >= s.level_range[0] && level <= s.level_range[1]) ?? EMBER_STATES[0]
  const nextIdx = EMBER_STATES.indexOf(current) + 1
  const next = EMBER_STATES[nextIdx] ?? null

  return (
    <div style={{ padding: 16 }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>💎</div>
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 6, color: '#7a6a44', letterSpacing: '0.15em', marginBottom: 4 }}>
          YOUR EMBERSHARD
        </div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, color: '#c9a84c', margin: 0 }}>
          {current.name}
        </h2>
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 5, color: '#5a4a2a', letterSpacing: '0.1em', marginTop: 4 }}>
          LEVELS {current.level_range[0]}–{current.level_range[1]} · YOU ARE LV {level}
        </div>
      </div>

      <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 6, padding: 14, marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#b0c0e0', lineHeight: 1.7 }}>
          {current.description}
        </div>
      </div>

      {next && (
        <div style={{ background: 'rgba(26,28,46,0.4)', border: '1px dashed rgba(201,168,76,0.12)', borderRadius: 4, padding: 12 }}>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 5, color: '#5a4a2a', letterSpacing: '0.1em', marginBottom: 6 }}>
            NEXT FORM — REACH LEVEL {next.level_range[0]}
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 14, color: '#7a6a44', marginBottom: 4 }}>
            {next.name}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#5a4a2a', lineHeight: 1.5 }}>
            {next.description}
          </div>
        </div>
      )}

      {/* All states timeline */}
      <div style={{ marginTop: 20 }}>
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 5, color: '#7a6a44', letterSpacing: '0.12em', marginBottom: 10 }}>
          THE SHARD&apos;S JOURNEY
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {EMBER_STATES.map((s, i) => {
            const isActive = s === current
            const isPast = level > s.level_range[1]
            return (
              <div key={i} style={{
                display: 'flex', gap: 10, alignItems: 'flex-start',
                opacity: isPast ? 0.45 : isActive ? 1 : 0.35,
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                  background: isActive ? 'rgba(201,168,76,0.3)' : isPast ? 'rgba(90,58,26,0.3)' : 'rgba(26,28,46,0.5)',
                  border: `1px solid ${isActive ? '#c9a84c' : isPast ? '#5a3a1a' : '#2a1e0e'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, color: isActive ? '#c9a84c' : '#5a3a1a',
                }}>
                  {isPast ? '✓' : isActive ? '●' : '○'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: 12, color: isActive ? '#c9a84c' : '#7a6a44' }}>
                    {s.name}
                  </div>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 5, color: '#5a3a1a', letterSpacing: '0.08em' }}>
                    LV {s.level_range[0]}–{s.level_range[1] > 50 ? '∞' : s.level_range[1]}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function HearthholdSection() {
  return (
    <div style={{ padding: 16 }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🏡</div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, color: '#f0e6c8', margin: 0 }}>
          {WORLD.home_base.name}
        </h2>
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 6, color: '#7a6a44', letterSpacing: '0.1em', marginTop: 4 }}>
          YOUR HOME BASE
        </div>
      </div>

      <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#b0c0e0', lineHeight: 1.7, marginBottom: 16 }}>
        {WORLD.home_base.description}
      </p>

      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 5, color: '#7a6a44', letterSpacing: '0.12em', marginBottom: 10 }}>
        LOCATIONS
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {HOME_LOCS.map(([key, desc]) => (
          <div key={key} style={{
            background: 'rgba(26,28,46,0.6)',
            border: '1px solid rgba(201,168,76,0.12)',
            borderRadius: 4,
            padding: '10px 12px',
            display: 'flex', gap: 10, alignItems: 'flex-start',
          }}>
            <div style={{ fontSize: 22, flexShrink: 0 }}>{LOC_ICONS[key] ?? '✦'}</div>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 13, color: '#c9a84c', marginBottom: 2 }}>
                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#7a6a44', lineHeight: 1.5 }}>
                {desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function NPCSection() {
  const [selected, setSelected] = useState<string>(NPCS[0].name)
  const npc = NPCS.find(n => n.name === selected) ?? NPCS[0]

  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 5, color: '#7a6a44', letterSpacing: '0.12em', marginBottom: 10 }}>
        THE PEOPLE OF EMBERVALE
      </div>

      {/* NPC picker */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
        {NPCS.map(n => (
          <button
            key={n.name}
            onClick={() => setSelected(n.name)}
            style={{
              fontFamily: 'var(--font-heading)', fontSize: 12,
              padding: '5px 10px', borderRadius: 3,
              border: `1px solid ${selected === n.name ? 'rgba(201,168,76,0.5)' : 'rgba(90,58,26,0.3)'}`,
              background: selected === n.name ? 'rgba(201,168,76,0.08)' : 'transparent',
              color: selected === n.name ? '#c9a84c' : '#7a6a44',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {NPC_ICONS[n.name] ?? '✦'} {n.name}
          </button>
        ))}
      </div>

      {/* NPC card */}
      <div style={{
        background: 'rgba(26,28,46,0.7)',
        border: '1px solid rgba(201,168,76,0.18)',
        borderRadius: 6,
        padding: 16,
      }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 4, flexShrink: 0,
            background: 'rgba(201,168,76,0.06)',
            border: '1px solid rgba(201,168,76,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28,
          }}>
            {NPC_ICONS[npc.name] ?? '✦'}
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, color: '#f0e6c8', margin: '0 0 4px' }}>
              {npc.name}
            </h3>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 6, color: '#7a6a44', letterSpacing: '0.1em' }}>
              {npc.role.toUpperCase()}
            </div>
          </div>
        </div>

        {[
          { label: 'PERSONALITY', value: npc.personality },
          { label: 'SPEAKING STYLE', value: npc.speaking_style },
        ].map(item => (
          <div key={item.label} style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 3, padding: '8px 10px', marginBottom: 8 }}>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 5, color: '#5a4a2a', letterSpacing: '0.1em', marginBottom: 4 }}>
              {item.label}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#b09a6e', lineHeight: 1.6 }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RegionsSection() {
  const [selected, setSelected] = useState<string>(REGIONS[0].name)
  const region = REGIONS.find(r => r.name === selected) ?? REGIONS[0]

  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 5, color: '#7a6a44', letterSpacing: '0.12em', marginBottom: 10 }}>
        THE LANDS OF EMBERVALE
      </div>

      {/* Region picker */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
        {REGIONS.map(r => (
          <button
            key={r.name}
            onClick={() => setSelected(r.name)}
            style={{
              fontFamily: 'var(--font-heading)', fontSize: 11,
              padding: '5px 10px', borderRadius: 3,
              border: `1px solid ${selected === r.name ? 'rgba(201,168,76,0.5)' : 'rgba(90,58,26,0.3)'}`,
              background: selected === r.name ? 'rgba(201,168,76,0.08)' : 'transparent',
              color: selected === r.name ? '#c9a84c' : '#7a6a44',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {REGION_ICONS[r.type] ?? '🌍'} {r.name}
          </button>
        ))}
      </div>

      {/* Region card */}
      <div style={{
        background: 'rgba(26,28,46,0.7)',
        border: '1px solid rgba(201,168,76,0.15)',
        borderRadius: 6,
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '14px 16px',
          background: 'rgba(201,168,76,0.04)',
          borderBottom: '1px solid rgba(201,168,76,0.1)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ fontSize: 36 }}>{REGION_ICONS[region.type] ?? '🌍'}</div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, color: '#f0e6c8', margin: '0 0 2px' }}>
              {region.name}
            </h3>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 5, color: '#7a6a44', letterSpacing: '0.1em' }}>
              {region.type.toUpperCase()} · ARCS {region.associated_arcs.map(a => `${a}`).join(', ')}
            </div>
          </div>
        </div>
        <div style={{ padding: '14px 16px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#b0c0e0', lineHeight: 1.7, margin: 0 }}>
            {region.description}
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

interface WorldCodexProps {
  playerClass: string | null
  level: number
}

export default function WorldCodex({ playerClass, level }: WorldCodexProps) {
  const [section, setSection] = useState<Section>('world')

  function renderSection() {
    switch (section) {
      case 'world':      return <WorldSection />
      case 'class':      return <ClassSection playerClass={playerClass} />
      case 'embershard': return <EmberShardSection level={level} />
      case 'hearthhold': return <HearthholdSection />
      case 'npcs':       return <NPCSection />
      case 'regions':    return <RegionsSection />
    }
  }

  return (
    <div style={{ background: '#0e0a14', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '10px 16px 0', borderBottom: '1px solid rgba(90,58,26,0.3)', flexShrink: 0 }}>
        <div style={{ marginBottom: 10 }}>
          <h1 style={{ fontFamily: 'var(--font-pixel)', fontSize: 9, color: '#c9a84c', letterSpacing: '0.15em', margin: 0 }}>
            CODEX OF EMBERVALE
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#5a4a2a', margin: '2px 0 0', fontStyle: 'italic' }}>
            Everything you need to know about the world you&apos;re protecting
          </p>
        </div>

        {/* Section tabs */}
        <div 
          className="flex gap-4 overflow-x-auto scrollbar-none pb-0"
          style={{ paddingLeft: 16, paddingRight: 16 }}
        >
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              style={{
                flexShrink: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                padding: '6px 4px 8px',
                background: 'transparent',
                border: 'none',
                borderBottom: `2px solid ${section === s.id ? '#c9a84c' : 'transparent'}`,
                color: section === s.id ? '#c9a84c' : '#5a4a2a',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 16, opacity: section === s.id ? 1 : 0.5 }}>{s.icon}</span>
              <span style={{ 
                fontFamily: 'var(--font-pixel)', 
                fontSize: 5, 
                letterSpacing: '0.08em',
                opacity: section === s.id ? 1 : 0.7 
              }}>
                {s.label.toUpperCase()}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {renderSection()}
      </div>
    </div>
  )
}
