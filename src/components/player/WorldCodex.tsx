'use client'

import { useState } from 'react'
import Image from 'next/image'
import worldRaw from '@/lore/world.json'
import classesRaw from '@/lore/classes.json'
import AvatarPreview from '@/components/avatar/AvatarPreview'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Region {
  name: string
  type: string
  description: string
  associated_arcs: number[]
  coords?: { x: number; y: number }
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
  icon: string
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
  { id: 'world',      label: 'The World',   icon: '/images/ui/icons/icon_world.png' },
  { id: 'class',      label: 'Your Class',  icon: '/images/ui/icons/icon_class.png' },
  { id: 'embershard', label: 'Embershard',  icon: '/images/ui/icons/icon_embershard.png' },
  { id: 'hearthhold', label: 'Hearthhold',  icon: '/images/ui/icons/icon_hearthhold.png' },
  { id: 'npcs',       label: 'Characters',  icon: '/images/ui/icons/icon_characters.png' },
  { id: 'regions',    label: 'Regions',     icon: '/images/ui/icons/icon_regions.png' },
]

const NPC_IMAGES: Record<string, string> = {
  'Elder Maren':         '/images/ui/intro_elder.png',
  'Rook':                '/images/lore/rook.png',
  'Professor Ignis':     '/images/lore/ignis.png',
  'Kaya':                '/images/lore/kaya.png',
  'The Chronicler':      '/images/lore/chronicler.png',
  'Hollow-Touched Orrin':'/images/lore/orrin.png',
}

const REGION_IMAGES: Record<string, string> = {
  forest:      '/images/lore/heartwood.png',
  coastal:     '/images/lore/shattered_coast.png',
  mountains:   '/images/lore/ironspine.png',
  grasslands:  '/images/lore/dustmere.png',
  wasteland:   '/images/lore/ashlands.png',
  underground: '/images/lore/underbright.png',
}

const CLASS_IMAGES: Record<string, string> = {
  blazewarden:  '/images/lore/blazewarden.png',
  lorescribe:   '/images/lore/lorescribe.png',
  shadowstep:   '/images/lore/shadowstep.png',
  hearthkeeper: '/images/lore/hearthkeeper.png',
  stormcaller:  '/images/lore/stormcaller.png',
  ironvow:      '/images/lore/ironvow.png',
}

const LOC_ICONS: Record<string, string> = {
  quest_board:    '📋',
  academy:        '🎓',
  loot_emporium:  '🛒',
  chronicle_hall: '📖',
  boss_gate:      '🚪',
}

// ── Sub-sections ──────────────────────────────────────────────────────────────

function WorldSection({ householdPlayers = [] }: { householdPlayers?: any[] }) {
  return (
    <div style={{ padding: '0 0 40px 0' }}>
      <div style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16/9',
        marginBottom: 32,
        background: '#040812',
        borderBottom: '2px solid rgba(201,168,76,0.2)',
        overflow: 'hidden',
      }}>
        <Image
          src="/images/ui/chronicle_map.png"
          alt="Map of Embervale"
          fill
          style={{ objectFit: 'contain', opacity: 0.9 }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, #0e0a14 0%, transparent 40%, rgba(14,10,20,0.4) 100%)'
        }} />

        {/* Player Avatars on Map */}
        {householdPlayers?.map((p, idx) => {
          const arc = Math.floor(((p.story_chapter || 1) - 1) / 4) + 1
          const region = WORLD.regions.find(r => r.associated_arcs.includes(arc))
          const coords = region?.coords || { x: 50, y: 48 }
          
          // Jitter slightly so they don't overlap perfectly
          const jitterX = (idx % 3 - 1) * 3
          const jitterY = (Math.floor(idx / 3) - 1) * 3

          return (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                left: `${coords.x + jitterX}%`,
                top: `${coords.y + jitterY}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.8))',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: '2px solid var(--qf-gold-400)',
                background: 'rgba(14,10,20,0.8)',
                overflow: 'hidden',
                boxShadow: '0 0 15px rgba(201,168,76,0.3)'
              }}>
                <AvatarPreview 
                  avatarConfig={p.avatar_config} 
                  className="w-full h-full"
                />
              </div>
              <div style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: 6,
                color: '#f0e6c8',
                marginTop: 4,
                background: 'rgba(0,0,0,0.6)',
                padding: '2px 4px',
                borderRadius: 2,
                whiteSpace: 'nowrap'
              }}>
                {p.display_name}
              </div>
            </div>
          )
        })}

        <div style={{
          position: 'absolute', bottom: 24, left: 24, right: 24, textAlign: 'center'
        }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 42, color: '#f0e6c8', margin: 0, textShadow: '0 4px 12px rgba(0,0,0,0.9)' }}>
            {WORLD.world_name}
          </h2>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 11, color: '#c9a84c', letterSpacing: '0.2em', marginTop: 8, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
            THE EMBER REALM
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: '#c0b08a', lineHeight: 1.75, marginBottom: 20 }}>
          {WORLD.summary}
        </p>

        {/* Two forces */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
          <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 6, padding: '16px 14px', textAlign: 'center' }}>
            <div style={{ marginBottom: 12 }}>
              <Image src="/images/ui/icons/icon_emberlight.png" alt="" width={48} height={48} style={{ objectFit: 'contain' }} />
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 15, color: '#c9a84c', marginBottom: 6 }}>
              {WORLD.core_force}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#9a8a64', lineHeight: 1.6 }}>
              The primordial warmth that flows through all living things. Where it burns, the world thrives.
            </div>
          </div>
          <div style={{ background: 'rgba(80,20,20,0.15)', border: '1px solid rgba(196,58,0,0.2)', borderRadius: 6, padding: '16px 14px', textAlign: 'center' }}>
            <div style={{ marginBottom: 12 }}>
              <Image src="/images/ui/icons/icon_hollow.png" alt="" width={48} height={48} style={{ objectFit: 'contain' }} />
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 15, color: '#ff8c42', marginBottom: 6 }}>
              {WORLD.core_threat}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#9a8a64', lineHeight: 1.6 }}>
              An entropy made manifest. Where the Emberlight dims, the Hollow creeps in.
            </div>
          </div>
        </div>

        <div style={{ background: 'rgba(26,28,46,0.6)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 6, padding: '16px 18px' }}>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 8, color: '#7a6a44', letterSpacing: '0.12em', marginBottom: 8 }}>
            YOU ARE
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18, color: '#c9a84c', marginBottom: 6 }}>
            An Emberbearer
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#b09a6e', lineHeight: 1.7 }}>
            Chosen to strengthen the Emberlight through effort, learning, and courage. Every quest completed, every lesson learned — it all pushes back the Hollow.
          </div>
        </div>
      </div>
    </div>
  )
}

function ClassSection({ playerClass }: { playerClass: string | null }) {
  const [selected, setSelected] = useState<string>(playerClass ?? CLASSES[0].id)
  const cls = CLASSES.find(c => c.id === selected) ?? CLASSES[0]

  return (
    <>
      <style>{`
        @media (min-width: 768px) {
          .codex-class-layout {
            display: grid !important;
            grid-template-columns: 220px 1fr !important;
            gap: 24px !important;
            align-items: start !important;
          }
          .codex-class-picker { position: sticky !important; top: 0 !important; }
        }
      `}</style>
      <div className="codex-class-layout" style={{ padding: '20px 20px 24px' }}>
        {/* Class picker — sticky sidebar on desktop */}
        <div className="codex-class-picker">
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 8, color: '#7a6a44', letterSpacing: '0.15em', marginBottom: 14 }}>
            CHOOSE A CLASS
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {CLASSES.map(c => (
              <button
                key={c.id}
                onClick={() => setSelected(c.id)}
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 14,
                  padding: '8px 14px',
                  borderRadius: 4,
                  border: `2px solid ${selected === c.id ? c.color_primary : 'rgba(90,58,26,0.35)'}`,
                  background: selected === c.id ? `${c.color_primary}22` : 'transparent',
                  color: selected === c.id ? c.color_secondary : '#9a8a64',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {c.name}
                {c.id === playerClass && (
                  <span style={{ fontSize: 11, color: c.color_primary }}>★</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Class card */}
        <div style={{
          background: `linear-gradient(160deg, ${cls.color_primary}18, rgba(13,15,28,0.95))`,
          border: `2px solid ${cls.color_primary}55`,
          borderRadius: 8,
          overflow: 'hidden',
          position: 'relative',
        }}>
          {cls.id === playerClass && (
            <div style={{
              position: 'absolute', top: 12, right: 14, zIndex: 2,
              fontFamily: 'var(--font-pixel)', fontSize: 8,
              color: cls.color_secondary, letterSpacing: '0.1em',
            }}>
              ★ YOUR CLASS
            </div>
          )}

          {/* Full-width hero banner */}
          <div style={{ position: 'relative', width: '100%', aspectRatio: '1', background: '#080c14' }}>
            <Image
              src={CLASS_IMAGES[cls.id as keyof typeof CLASS_IMAGES]}
              alt={cls.name}
              fill
              style={{ objectFit: 'contain' }}
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: `linear-gradient(to top, ${cls.color_primary}aa 0%, transparent 50%, rgba(13,15,28,0.3) 100%)`
            }} />
            <div style={{ position: 'absolute', bottom: 20, left: 24, right: 24 }}>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 11, color: cls.color_primary, letterSpacing: '0.2em', marginBottom: 8 }}>
                {cls.archetype.toUpperCase()}
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 36, color: '#fff', margin: 0, textShadow: `0 4px 15px rgba(0,0,0,0.9), 0 0 25px ${cls.color_primary}88` }}>
                {cls.name}
              </h3>
            </div>
          </div>

          {/* Class details */}
          <div style={{ padding: '20px 20px 24px' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: '#c0d0f0', fontStyle: 'italic', lineHeight: 1.6, marginBottom: 16 }}>
              &ldquo;{cls.motto}&rdquo;
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              {[
                { label: 'PERSONALITY', value: cls.personality },
                { label: 'ROLE IN STORY', value: cls.story_role },
              ].map(item => (
                <div key={item.label} style={{ background: 'rgba(0,0,0,0.35)', borderRadius: 4, padding: '12px 14px' }}>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 8, color: '#7a6a44', letterSpacing: '0.1em', marginBottom: 6 }}>
                    {item.label}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#c9a84c', lineHeight: 1.6 }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 4, padding: '12px 14px' }}>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 8, color: '#7a6a44', letterSpacing: '0.1em', marginBottom: 6 }}>
                💎 EMBERSHARD FORM
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: cls.color_secondary, lineHeight: 1.6 }}>
                {cls.embershard_form}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function EmberShardSection({ level }: { level: number }) {
  const current = EMBER_STATES.find(s => level >= s.level_range[0] && level <= s.level_range[1]) ?? EMBER_STATES[0]
  const nextIdx = EMBER_STATES.indexOf(current) + 1
  const next = EMBER_STATES[nextIdx] ?? null

  return (
    <div style={{ padding: 20 }}>
      <div style={{ textAlign: 'center', marginBottom: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
          <Image 
            src={current.icon || "/images/ui/icons/icon_embershard.png"} 
            alt={current.name} 
            width={120} 
            height={120} 
            style={{ objectFit: 'contain' }} 
          />
        </div>
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 8, color: '#7a6a44', letterSpacing: '0.15em', marginBottom: 6 }}>
          YOUR EMBERSHARD
        </div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, color: '#c9a84c', margin: 0 }}>
          {current.name}
        </h2>
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 7, color: '#5a4a2a', letterSpacing: '0.1em', marginTop: 6 }}>
          LEVELS {current.level_range[0]}–{current.level_range[1]} · YOU ARE LV {level}
        </div>
      </div>

      <div style={{ background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.22)', borderRadius: 8, padding: 18, marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: '#c0c8e0', lineHeight: 1.75 }}>
          {current.description}
        </div>
      </div>

      {next && (
        <div style={{ background: 'rgba(26,28,46,0.4)', border: '1px dashed rgba(201,168,76,0.15)', borderRadius: 6, padding: 16, marginBottom: 24 }}>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 7, color: '#5a4a2a', letterSpacing: '0.1em', marginBottom: 8 }}>
            NEXT FORM — REACH LEVEL {next.level_range[0]}
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 17, color: '#7a6a44', marginBottom: 6 }}>
            {next.name}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#5a4a2a', lineHeight: 1.6 }}>
            {next.description}
          </div>
        </div>
      )}

      {/* All states timeline */}
      <div style={{ marginTop: 20 }}>
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 8, color: '#7a6a44', letterSpacing: '0.12em', marginBottom: 14 }}>
          THE SHARD&apos;S JOURNEY
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {EMBER_STATES.map((s, i) => {
            const isActive = s === current
            const isPast = level > s.level_range[1]
            return (
              <div key={i} style={{
                display: 'flex', gap: 14, alignItems: 'flex-start',
                opacity: isPast ? 0.45 : isActive ? 1 : 0.35,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: isActive ? 'rgba(201,168,76,0.3)' : isPast ? 'rgba(90,58,26,0.3)' : 'rgba(26,28,46,0.5)',
                  border: `2px solid ${isActive ? '#c9a84c' : isPast ? '#5a3a1a' : '#2a1e0e'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, color: isActive ? '#c9a84c' : '#5a3a1a',
                }}>
                  {isPast ? '✓' : isActive ? '●' : '○'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: 15, color: isActive ? '#c9a84c' : '#7a6a44' }}>
                    {s.name}
                  </div>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 7, color: '#5a3a1a', letterSpacing: '0.08em', marginTop: 2 }}>
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
    <div style={{ padding: '0 0 20px 0' }}>
      <div style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16/9',
        marginBottom: 32,
        background: '#080c14',
        borderBottom: '2px solid rgba(201,168,76,0.2)',
        overflow: 'hidden',
      }}>
        <Image
          src="/images/lore/heartwood.png"
          alt="Hearthhold"
          fill
          style={{ objectFit: 'contain', opacity: 0.9 }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, #0e0a14 0%, transparent 50%, rgba(14,10,20,0.6) 100%)'
        }} />
        <div style={{
          position: 'absolute', bottom: 24, left: 24, right: 24, textAlign: 'center'
        }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 36, color: '#f0e6c8', margin: 0, textShadow: '0 4px 12px rgba(0,0,0,0.9)' }}>
            {WORLD.home_base.name}
          </h2>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 11, color: '#c9a84c', letterSpacing: '0.15em', marginTop: 8, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
            YOUR HOME BASE
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: '#c0b08a', lineHeight: 1.75, marginBottom: 20 }}>
          {WORLD.home_base.description}
        </p>

        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 8, color: '#7a6a44', letterSpacing: '0.12em', marginBottom: 14 }}>
          LOCATIONS
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {HOME_LOCS.map(([key, desc]) => (
            <div key={key} style={{
              background: 'rgba(26,28,46,0.6)',
              border: '1px solid rgba(201,168,76,0.14)',
              borderRadius: 6,
              padding: '14px 16px',
              display: 'flex', gap: 14, alignItems: 'flex-start',
            }}>
              <div style={{ fontSize: 28, flexShrink: 0 }}>{LOC_ICONS[key] ?? '✦'}</div>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 15, color: '#c9a84c', marginBottom: 4 }}>
                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#9a8a64', lineHeight: 1.6 }}>
                  {desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function NPCSection() {
  const [selected, setSelected] = useState<string>(NPCS[0].name)
  const npc = NPCS.find(n => n.name === selected) ?? NPCS[0]

  return (
    <div style={{ padding: 20 }}>
      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 8, color: '#7a6a44', letterSpacing: '0.12em', marginBottom: 14 }}>
        THE PEOPLE OF EMBERVALE
      </div>

      {/* NPC picker */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {NPCS.map(n => (
          <button
            key={n.name}
            onClick={() => setSelected(n.name)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: 'var(--font-heading)', fontSize: 13,
              padding: '6px 12px', borderRadius: 4,
              border: `2px solid ${selected === n.name ? 'rgba(201,168,76,0.55)' : 'rgba(90,58,26,0.3)'}`,
              background: selected === n.name ? 'rgba(201,168,76,0.1)' : 'transparent',
              color: selected === n.name ? '#c9a84c' : '#9a8a64',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ position: 'relative', width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', border: '1px solid rgba(201,168,76,0.3)' }}>
              <Image src={NPC_IMAGES[n.name]} alt={n.name} fill style={{ objectFit: 'cover' }} />
            </div>
            {n.name}
          </button>
        ))}
      </div>

      {/* NPC card */}
      <div style={{
        background: 'rgba(26,28,46,0.7)',
        border: '1px solid rgba(201,168,76,0.2)',
        borderRadius: 8,
        overflow: 'hidden',
      }}>
        {/* NPC portrait banner */}
        <div style={{ position: 'relative', aspectRatio: '1', width: '100%', background: '#080c14' }}>
          <Image src={NPC_IMAGES[npc.name]} alt={npc.name} fill style={{ objectFit: 'contain' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,28,46,1) 0%, transparent 40%)' }} />
          <div style={{ position: 'absolute', bottom: 20, left: 24, right: 24 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 32, color: '#f0e6c8', margin: '0 0 6px', textShadow: '0 4px 8px rgba(0,0,0,0.9)' }}>
              {npc.name}
            </h3>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 11, color: '#c9a84c', letterSpacing: '0.15em' }}>
              {npc.role.toUpperCase()}
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 18px 20px' }}>
          {[
            { label: 'PERSONALITY', value: npc.personality },
            { label: 'SPEAKING STYLE', value: npc.speaking_style },
          ].map(item => (
            <div key={item.label} style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 4, padding: '12px 14px', marginBottom: 10 }}>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 8, color: '#5a4a2a', letterSpacing: '0.1em', marginBottom: 6 }}>
                {item.label}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#b09a6e', lineHeight: 1.7 }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function RegionsSection() {
  const [selected, setSelected] = useState<string>(REGIONS[0].name)
  const region = REGIONS.find(r => r.name === selected) ?? REGIONS[0]

  return (
    <div style={{ padding: 20 }}>
      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 8, color: '#7a6a44', letterSpacing: '0.12em', marginBottom: 14 }}>
        THE LANDS OF EMBERVALE
      </div>

      {/* Region picker */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {REGIONS.map(r => (
          <button
            key={r.name}
            onClick={() => setSelected(r.name)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: 'var(--font-heading)', fontSize: 13,
              padding: '6px 12px', borderRadius: 4,
              border: `2px solid ${selected === r.name ? 'rgba(201,168,76,0.55)' : 'rgba(90,58,26,0.3)'}`,
              background: selected === r.name ? 'rgba(201,168,76,0.1)' : 'transparent',
              color: selected === r.name ? '#c9a84c' : '#9a8a64',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ position: 'relative', width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', border: '1px solid rgba(201,168,76,0.3)' }}>
              <Image src={REGION_IMAGES[r.type]} alt={r.name} fill style={{ objectFit: 'cover' }} />
            </div>
            {r.name}
          </button>
        ))}
      </div>

      {/* Region card */}
      <div style={{
        background: 'rgba(26,28,46,0.7)',
        border: '1px solid rgba(201,168,76,0.17)',
        borderRadius: 8,
        overflow: 'hidden',
      }}>
        <div style={{ position: 'relative', aspectRatio: '1', width: '100%', background: '#080c14' }}>
          <Image src={REGION_IMAGES[region.type]} alt={region.name} fill style={{ objectFit: 'contain' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,28,46,1) 0%, transparent 40%)' }} />
          <div style={{ position: 'absolute', bottom: 20, left: 24, right: 24 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 36, color: '#f0e6c8', margin: '0 0 8px', textShadow: '0 4px 12px rgba(0,0,0,0.9)' }}>
              {region.name}
            </h3>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 11, color: '#c9a84c', letterSpacing: '0.15em', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
              {region.type.toUpperCase()} · ARCS {region.associated_arcs.map(a => `${a}`).join(', ')}
            </div>
          </div>
        </div>
        <div style={{ padding: '18px 20px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: '#c0c8e0', lineHeight: 1.75, margin: 0 }}>
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
  householdPlayers?: any[]
}

export default function WorldCodex({ playerClass, level, householdPlayers = [] }: WorldCodexProps) {
  const [section, setSection] = useState<Section>('world')

  function renderSection() {
    switch (section) {
      case 'world':      return <WorldSection householdPlayers={householdPlayers} />
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
      <div style={{ padding: '14px 20px 0', borderBottom: '1px solid rgba(90,58,26,0.3)', flexShrink: 0 }}>
        <div style={{ marginBottom: 12 }}>
          <h1 style={{ fontFamily: 'var(--font-pixel)', fontSize: 11, color: '#c9a84c', letterSpacing: '0.15em', margin: 0 }}>
            CODEX OF EMBERVALE
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#7a6a44', margin: '4px 0 0', fontStyle: 'italic' }}>
            Everything you need to know about the world you&apos;re protecting
          </p>
        </div>

        {/* Section tabs */}
        <div
          className="flex gap-2 overflow-x-auto scrollbar-none pb-0"
          style={{ paddingLeft: 0, paddingRight: 0 }}
        >
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              style={{
                flexShrink: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                padding: '8px 8px 10px',
                background: 'transparent',
                border: 'none',
                borderBottom: `2px solid ${section === s.id ? '#c9a84c' : 'transparent'}`,
                color: section === s.id ? '#c9a84c' : '#5a4a2a',
                cursor: 'pointer',
                transition: 'all 0.15s',
                minWidth: 60,
              }}
            >
              <span style={{ fontSize: 20, opacity: section === s.id ? 1 : 0.55 }}>
                <Image src={s.icon} alt="" width={32} height={32} style={{ objectFit: 'contain' }} />
              </span>
              <span style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: 7,
                letterSpacing: '0.06em',
                opacity: section === s.id ? 1 : 0.65,
                lineHeight: 1.4,
                textAlign: 'center',
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
