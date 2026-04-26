'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import SpriteCanvas from '@/components/avatar/SpriteCanvas'
import type { AvatarConfig, SpriteEntry } from '@/types/avatar'
import type { Json } from '@/types/database'
import { SPRITE_MANIFEST } from '@/lib/sprites/manifest'
import classesData from '@/lore/classes.json'
import { playBgm, stopBgm } from '@/lib/audio'
import { saveCharacter } from '@/app/actions/save-character'

// ── Types ──────────────────────────────────────────────────────────────────

interface ClassDef {
  id: string
  name: string
  motto: string
  archetype: string
  embershard_form: string
  color_primary: string
  color_secondary: string
  icon: string
}

interface EmberParticle {
  id: number
  left: string
  bottom: string
  size: string
  color: string
  duration: string
  delay: string
  drift: string
}

// ── Constants ──────────────────────────────────────────────────────────────

const CLASSES: ClassDef[] = classesData.classes as ClassDef[]

const SKIN_TONES = [
  { label: 'Fair',   value: null,       swatch: '#f5d3b0' },
  { label: 'Tanned', value: '#d4a87a',  swatch: '#d4a87a' },
  { label: 'Medium', value: '#c07840',  swatch: '#c07840' },
  { label: 'Warm',   value: '#9a5c28',  swatch: '#9a5c28' },
  { label: 'Deep',   value: '#6b3a14',  swatch: '#6b3a14' },
  { label: 'Rich',   value: '#3d1c08',  swatch: '#3d1c08' },
]

const HAIR_COLORS = [
  { label: 'Black',      value: '#1a1008' },
  { label: 'Dark Brown', value: '#3d2200' },
  { label: 'Auburn',     value: '#7a2800' },
  { label: 'Blonde',     value: '#c8a050' },
  { label: 'Ginger',     value: '#b84000' },
  { label: 'Silver',     value: '#b0a090' },
  { label: 'Midnight',   value: '#1a0a30' },
  { label: 'Rose',       value: '#a02850' },
]

/** Maps hex eye colors to the corresponding sprite entry id in SPRITE_MANIFEST.eyes. */
const EYE_COLOR_TO_ID: Record<string, string> = {
  '#3a2010': 'eyes_brown',
  '#3a6a9a': 'eyes_blue',
  '#2a6a3a': 'eyes_green',
  '#607080': 'eyes_gray',
  '#9a6a20': 'eyes_orange',
  '#6a3a8a': 'eyes_purple',
}

const EYE_COLORS = [
  { label: 'Brown',  value: '#3a2010' },
  { label: 'Blue',   value: '#3a6a9a' },
  { label: 'Green',  value: '#2a6a3a' },
  { label: 'Gray',   value: '#607080' },
  { label: 'Amber',  value: '#9a6a20' },
  { label: 'Violet', value: '#6a3a8a' },
]

const FEATURED_HAIR_STYLES = [
  'afro', 'bob', 'braid', 'buzzcut', 'cornrows', 'curly_long',
  'curly_short', 'half_up', 'high_ponytail', 'long_center_part',
  'long_messy', 'mop', 'pigtails', 'spiked', 'spiked_beehive', 'twists_fade',
]

const STANDARD_COLOR_SWATCHES = [
  { label: 'Navy',    value: 'navy',    hex: '#1a237e' },
  { label: 'Red',     value: 'red',     hex: '#c62828' },
  { label: 'Forest',  value: 'forest',  hex: '#1b5e20' },
  { label: 'Brown',   value: 'brown',   hex: '#4e342e' },
  { label: 'Black',   value: 'black',   hex: '#212121' },
  { label: 'Purple',  value: 'purple',  hex: '#6a1b9a' },
  { label: 'White',   value: 'white',   hex: '#f5f5f5' },
  { label: 'Leather', value: 'leather', hex: '#8d6e63' },
]

const METAL_COLOR_SWATCHES = [
  { label: 'Iron',    value: 'iron',    hex: '#78909c' },
  { label: 'Bronze',  value: 'bronze',  hex: '#cd7f32' },
  { label: 'Steel',   value: 'steel',   hex: '#b0bec5' },
  { label: 'Gold',    value: 'gold',    hex: '#ffd700' },
  { label: 'Silver',  value: 'silver',  hex: '#c0c0c0' },
  { label: 'Brass',   value: 'brass',   hex: '#b5a642' },
  { label: 'Copper',  value: 'copper',  hex: '#b87333' },
  { label: 'Ceramic', value: 'ceramic', hex: '#e8dcc8' },
]

const SHIRT_OPTIONS_UNIVERSAL = ['longsleeve', 'shortsleeve', 'leather_armour', 'plate_armour', 'chainmail']
const SHIRT_OPTIONS_FEMALE_EXTRA: string[] = []
const PANTS_OPTIONS_UNIVERSAL = ['pants', 'plate_legs']
const PANTS_OPTIONS_FEMALE_EXTRA: string[] = []
const BOOT_OPTIONS = ['boots', 'shoes', 'sandals', 'ghillies', 'plate_boots']
const WEAPON_OPTIONS = ['sword', 'longsword', 'spear', 'bow']

const DEFAULT_CONFIG: AvatarConfig = {
  body:    { id: 'body_female', color: null },
  head:    { id: 'human_female', color: null },
  eyes:    { id: 'eyes_blue',   color: '#3a6a9a' },
  hair:    { id: 'bob',         color: '#3d2200' },
  pants:   { id: 'pants',       color: 'navy' },
  shirt:   { id: 'longsleeve',  color: 'navy' },
  boots:   { id: 'boots',       color: 'brown' },
  hands:   { id: null,          color: null },
  belt:    { id: null,          color: null },
  cape:    { id: null,          color: null },
  helmet:  { id: null,          color: null },
  weapon:  { id: 'sword',       color: null },
  shield:  { id: null,          color: null },
}

// ── Icon SVGs ─────────────────────────────────────────────────────────────

function ClassIcon({ icon, color }: { icon: string; color: string }) {
  const style = { width: 24, height: 24, stroke: color, fill: 'none', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

  if (icon === 'sword') return (
    <svg viewBox="0 0 24 24" style={style}>
      <line x1="5" y1="19" x2="19" y2="5" />
      <polyline points="5,14 5,19 10,19" />
      <line x1="14" y1="5" x2="17" y2="8" />
    </svg>
  )
  if (icon === 'book-open') return (
    <svg viewBox="0 0 24 24" style={style}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
  if (icon === 'eye-off') return (
    <svg viewBox="0 0 24 24" style={style}>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
  if (icon === 'flame') return (
    <svg viewBox="0 0 24 24" style={style}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  )
  if (icon === 'zap') return (
    <svg viewBox="0 0 24 24" style={style} strokeWidth={2.5}>
      <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" />
    </svg>
  )
  if (icon === 'shield') return (
    <svg viewBox="0 0 24 24" style={style}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
  return null
}

// ── Helpers ───────────────────────────────────────────────────────────────

function isMetalItem(id: string | null): boolean {
  if (!id) return false
  const entries = SPRITE_MANIFEST.shirt as Record<string, SpriteEntry>
  const pantsEntries = SPRITE_MANIFEST.pants as Record<string, SpriteEntry>
  const bootEntries = SPRITE_MANIFEST.boots as Record<string, SpriteEntry>
  const entry = entries[id] ?? pantsEntries[id] ?? bootEntries[id]
  return !!(entry?.colorVariants?.includes('iron'))
}

function isMaleBodyId(id: string | null): boolean {
  return id === 'body_male' || id === 'body_soldier'
}

const PIXEL_FONT_STYLE = { fontFamily: 'var(--font-pixel), monospace' }
const HEADING_FONT_STYLE = { fontFamily: 'var(--font-heading), serif' }

// ── Sub-components ─────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ ...PIXEL_FONT_STYLE, fontSize: '0.45rem', letterSpacing: '0.15em', color: '#a08040', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
      {children}
    </p>
  )
}

function ColorSwatch({
  hex,
  selected,
  onClick,
  label,
}: {
  hex: string
  selected: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: hex,
        border: selected ? '3px solid #ffffff' : '2px solid rgba(255,255,255,0.15)',
        outline: selected ? '1px solid rgba(255,255,255,0.4)' : 'none',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'transform 0.1s',
        transform: selected ? 'scale(1.15)' : 'scale(1)',
      }}
      aria-label={label}
    />
  )
}

function ChipButton({
  label,
  selected,
  onClick,
  accentColor,
}: {
  label: string
  selected: boolean
  onClick: () => void
  accentColor?: string
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 12px',
        borderRadius: 4,
        border: selected
          ? `2px solid ${accentColor ?? '#d4440f'}`
          : '2px solid rgba(255,255,255,0.12)',
        background: selected ? (accentColor ?? '#d4440f') + '33' : 'rgba(255,255,255,0.04)',
        color: selected ? '#ffffff' : 'rgba(255,255,255,0.6)',
        cursor: 'pointer',
        fontSize: '0.75rem',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        transition: 'all 0.15s',
        fontFamily: 'var(--font-body), sans-serif',
      }}
    >
      {label}
    </button>
  )
}

function ClothingColorRow({
  itemId,
  currentColor,
  onColorChange,
}: {
  itemId: string | null
  currentColor: string | null | undefined
  onColorChange: (val: string) => void
}) {
  const isMetal = isMetalItem(itemId)
  const swatches = isMetal ? METAL_COLOR_SWATCHES : STANDARD_COLOR_SWATCHES

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
      {swatches.map(s => (
        <ColorSwatch
          key={s.value}
          hex={s.hex}
          label={s.label}
          selected={currentColor === s.value}
          onClick={() => onColorChange(s.value)}
        />
      ))}
    </div>
  )
}

// ── Step 1: Class Selection ────────────────────────────────────────────────

function StepChoosePath({
  selectedClass,
  onSelect,
  onNext,
}: {
  selectedClass: ClassDef | null
  onSelect: (c: ClassDef) => void
  onNext: () => void
}) {
  return (
    <div style={{ padding: '1.5rem 1rem 6rem', maxWidth: 700, margin: '0 auto' }}>
      <h2
        style={{
          ...HEADING_FONT_STYLE,
          fontSize: '1.6rem',
          color: '#fff8e8',
          textAlign: 'center',
          marginBottom: '0.4rem',
          textShadow: '0 0 24px rgba(255,140,66,0.5)',
        }}
      >
        Choose Your Path
      </h2>
      <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', marginBottom: '1.5rem', fontFamily: 'var(--font-body), sans-serif' }}>
        Your class shapes your legend. Choose wisely, Emberbearer.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.75rem' }}>
        {CLASSES.map(cls => {
          const isSelected = selectedClass?.id === cls.id
          return (
            <button
              key={cls.id}
              onClick={() => onSelect(cls)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                textAlign: 'left',
                padding: '1.1rem 1.1rem 1.1rem 1.3rem',
                borderRadius: 8,
                border: `1px solid ${isSelected ? cls.color_primary : 'rgba(255,255,255,0.08)'}`,
                borderLeft: `4px solid ${cls.color_primary}`,
                background: isSelected
                  ? `linear-gradient(135deg, ${cls.color_primary}22 0%, ${cls.color_secondary}11 100%)`
                  : 'rgba(255,255,255,0.03)',
                boxShadow: isSelected
                  ? `0 0 20px ${cls.color_primary}55, 0 0 40px ${cls.color_primary}22`
                  : '0 2px 8px rgba(0,0,0,0.3)',
                cursor: 'pointer',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.2s ease',
                width: '100%',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <ClassIcon icon={cls.icon} color={isSelected ? cls.color_primary : 'rgba(255,255,255,0.5)'} />
                <span style={{ ...PIXEL_FONT_STYLE, fontSize: '0.7rem', color: isSelected ? cls.color_secondary : '#fff8e8', letterSpacing: '0.08em' }}>
                  {cls.name}
                </span>
              </div>
              <span style={{ fontSize: '0.7rem', color: isSelected ? cls.color_secondary : 'rgba(255,255,255,0.55)', marginBottom: 8, fontFamily: 'var(--font-body), sans-serif' }}>
                {cls.archetype}
              </span>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)', fontStyle: 'italic', marginBottom: 8, lineHeight: 1.5, fontFamily: 'var(--font-body), sans-serif' }}>
                &ldquo;{cls.motto}&rdquo;
              </p>
              <p style={{ fontSize: '0.75rem', color: isSelected ? cls.color_secondary : 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-body), sans-serif' }}>
                ✦ {cls.embershard_form}
              </p>
            </button>
          )
        })}
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={onNext}
          disabled={!selectedClass}
          style={{
            padding: '14px 40px',
            borderRadius: 6,
            border: 'none',
            background: selectedClass
              ? `linear-gradient(135deg, ${selectedClass.color_primary}, ${selectedClass.color_secondary})`
              : 'rgba(255,255,255,0.08)',
            color: selectedClass ? '#fff' : 'rgba(255,255,255,0.25)',
            cursor: selectedClass ? 'pointer' : 'not-allowed',
            ...PIXEL_FONT_STYLE,
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            boxShadow: selectedClass
              ? `0 0 20px ${selectedClass.color_primary}88`
              : 'none',
            transition: 'all 0.2s',
          }}
        >
          Next: Forge Your Identity →
        </button>
      </div>
    </div>
  )
}

// ── Step 2: Avatar Customization ───────────────────────────────────────────

function StepForgeIdentity({
  config,
  selectedClass,
  onChange,
  onNext,
  onBack,
}: {
  config: AvatarConfig
  selectedClass: ClassDef
  onChange: (patch: Partial<AvatarConfig>) => void
  onNext: () => void
  onBack: () => void
}) {
  const isMale = isMaleBodyId(config.body.id)

  const shirtOptions = isMale
    ? SHIRT_OPTIONS_UNIVERSAL
    : [...SHIRT_OPTIONS_FEMALE_EXTRA, ...SHIRT_OPTIONS_UNIVERSAL]

  const pantsOptions = isMale
    ? PANTS_OPTIONS_UNIVERSAL
    : [...PANTS_OPTIONS_FEMALE_EXTRA, ...PANTS_OPTIONS_UNIVERSAL]

  const getEntry = (category: keyof typeof SPRITE_MANIFEST, id: string): SpriteEntry | undefined => {
    return (SPRITE_MANIFEST[category] as Record<string, SpriteEntry>)[id]
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Mobile: preview top; md+: 2-col */}
      <div className="md:grid md:grid-cols-[280px_1fr]" style={{ minHeight: '100%' }}>

        {/* Left: sticky preview */}
        <div
          className="md:sticky md:top-16"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '1.5rem 1rem 1rem',
            background: 'rgba(0,0,0,0.3)',
            alignSelf: 'flex-start',
          }}
        >
          <div
            style={{
              padding: 6,
              border: `2px solid ${selectedClass.color_primary}`,
              boxShadow: `0 0 20px ${selectedClass.color_primary}66, 0 0 40px ${selectedClass.color_primary}33`,
              borderRadius: 4,
              lineHeight: 0,
              animation: 'glowPulse 2s ease-in-out infinite',
            }}
          >
            <SpriteCanvas config={config} size={192} />
          </div>
          <p style={{ ...PIXEL_FONT_STYLE, fontSize: '0.5rem', color: selectedClass.color_secondary, marginTop: 12, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {selectedClass.name}
          </p>
          <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.55)', marginTop: 4, fontFamily: 'var(--font-body), sans-serif', textAlign: 'center' }}>
            Appearance preview
          </p>
        </div>

        {/* Right: options */}
        <div style={{ padding: '1.5rem 1rem 6rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Body Shape */}
          <div>
            <SectionLabel>Body Shape</SectionLabel>
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { id: 'body_female', label: 'Shape A' },
                { id: 'body_male',   label: 'Shape B' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => {
                    const newBodyId = opt.id
                    const newMale = isMaleBodyId(newBodyId)
                    // When switching body type, ensure pants/shirt are valid
                    const currentShirt = config.shirt.id
                    const currentPants = config.pants.id
                    let shirtId = currentShirt
                    let pantsId = currentPants

                    if (newMale) {
                      // If female-only item selected, switch to universal
                      const shirtEntry = currentShirt ? getEntry('shirt', currentShirt) : null
                      if (shirtEntry?.bodyType === 'female') shirtId = 'longsleeve'
                      const pantsEntry = currentPants ? getEntry('pants', currentPants) : null
                      if (pantsEntry?.bodyType === 'female') pantsId = 'pants'
                    }

                    // Auto-select matching head for body type
                    const headId = newMale ? 'human_male' : 'human_female'

                    onChange({
                      body: { id: newBodyId, color: config.body.color },
                      head: { id: headId, color: null },
                      shirt: { id: shirtId, color: config.shirt.color },
                      pants: { id: pantsId, color: config.pants.color },
                    })
                  }}
                  style={{
                    padding: '12px 24px',
                    borderRadius: 6,
                    border: config.body.id === opt.id
                      ? `2px solid ${selectedClass.color_primary}`
                      : '2px solid rgba(255,255,255,0.12)',
                    background: config.body.id === opt.id
                      ? `${selectedClass.color_primary}22`
                      : 'rgba(255,255,255,0.04)',
                    color: config.body.id === opt.id ? '#ffffff' : 'rgba(255,255,255,0.5)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontFamily: 'var(--font-body), sans-serif',
                    minWidth: 100,
                    transition: 'all 0.15s',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Skin Tone */}
          <div>
            <SectionLabel>Skin Tone</SectionLabel>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {SKIN_TONES.map(tone => (
                <ColorSwatch
                  key={String(tone.value)}
                  hex={tone.swatch}
                  label={tone.label}
                  selected={config.body.color === tone.value}
                  onClick={() => onChange({ body: { id: config.body.id, color: tone.value } })}
                />
              ))}
            </div>
          </div>

          {/* Hair Style */}
          <div>
            <SectionLabel>Hair Style</SectionLabel>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {FEATURED_HAIR_STYLES.map(id => {
                const entry = (SPRITE_MANIFEST.hair as Record<string, SpriteEntry>)[id]
                return (
                  <ChipButton
                    key={id}
                    label={entry?.displayName ?? id}
                    selected={config.hair.id === id}
                    onClick={() => onChange({ hair: { id, color: config.hair.color } })}
                    accentColor={selectedClass.color_primary}
                  />
                )
              })}
            </div>
          </div>

          {/* Hair Color */}
          <div>
            <SectionLabel>Hair Color</SectionLabel>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {HAIR_COLORS.map(c => (
                <ColorSwatch
                  key={c.value}
                  hex={c.value}
                  label={c.label}
                  selected={config.hair.color === c.value}
                  onClick={() => onChange({ hair: { id: config.hair.id, color: c.value } })}
                />
              ))}
            </div>
          </div>

          {/* Eye Color */}
          <div>
            <SectionLabel>Eye Color</SectionLabel>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {EYE_COLORS.map(c => (
                <ColorSwatch
                  key={c.value}
                  hex={c.value}
                  label={c.label}
                  selected={config.eyes.color === c.value}
                  onClick={() => onChange({
                    eyes: {
                      id: EYE_COLOR_TO_ID[c.value] ?? config.eyes.id,
                      color: c.value,
                    },
                  })}
                />
              ))}
            </div>
          </div>

          {/* Tunic / Armour */}
          <div>
            <SectionLabel>Tunic / Armour</SectionLabel>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {shirtOptions.map(id => {
                const entry = (SPRITE_MANIFEST.shirt as Record<string, SpriteEntry>)[id]
                return (
                  <ChipButton
                    key={id}
                    label={entry?.displayName ?? id}
                    selected={config.shirt.id === id}
                    onClick={() => {
                      const defaultColor = isMetalItem(id) ? 'iron' : 'navy'
                      const currentColor = config.shirt.color
                      // Keep current color if compatible
                      const isCurrMetal = currentColor ? METAL_COLOR_SWATCHES.some(s => s.value === currentColor) : false
                      const willBeMetal = isMetalItem(id)
                      const newColor = (willBeMetal === isCurrMetal && currentColor) ? currentColor : defaultColor
                      onChange({ shirt: { id, color: newColor } })
                    }}
                    accentColor={selectedClass.color_primary}
                  />
                )
              })}
            </div>
            <ClothingColorRow
              itemId={config.shirt.id}
              currentColor={config.shirt.color}
              onColorChange={val => onChange({ shirt: { id: config.shirt.id, color: val } })}
            />
          </div>

          {/* Pants / Skirt */}
          <div>
            <SectionLabel>Pants / Skirt</SectionLabel>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {pantsOptions.map(id => {
                const entry = (SPRITE_MANIFEST.pants as Record<string, SpriteEntry>)[id]
                return (
                  <ChipButton
                    key={id}
                    label={entry?.displayName ?? id}
                    selected={config.pants.id === id}
                    onClick={() => {
                      const defaultColor = isMetalItem(id) ? 'iron' : 'navy'
                      const currentColor = config.pants.color
                      const isCurrMetal = currentColor ? METAL_COLOR_SWATCHES.some(s => s.value === currentColor) : false
                      const willBeMetal = isMetalItem(id)
                      const newColor = (willBeMetal === isCurrMetal && currentColor) ? currentColor : defaultColor
                      onChange({ pants: { id, color: newColor } })
                    }}
                    accentColor={selectedClass.color_primary}
                  />
                )
              })}
            </div>
            <ClothingColorRow
              itemId={config.pants.id}
              currentColor={config.pants.color}
              onColorChange={val => onChange({ pants: { id: config.pants.id, color: val } })}
            />
          </div>

          {/* Footwear */}
          <div>
            <SectionLabel>Footwear</SectionLabel>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {BOOT_OPTIONS.map(id => {
                const entry = (SPRITE_MANIFEST.boots as Record<string, SpriteEntry>)[id]
                return (
                  <ChipButton
                    key={id}
                    label={entry?.displayName ?? id}
                    selected={config.boots.id === id}
                    onClick={() => {
                      const defaultColor = isMetalItem(id) ? 'iron' : 'brown'
                      const currentColor = config.boots.color
                      const isCurrMetal = currentColor ? METAL_COLOR_SWATCHES.some(s => s.value === currentColor) : false
                      const willBeMetal = isMetalItem(id)
                      const newColor = (willBeMetal === isCurrMetal && currentColor) ? currentColor : defaultColor
                      onChange({ boots: { id, color: newColor } })
                    }}
                    accentColor={selectedClass.color_primary}
                  />
                )
              })}
            </div>
            <ClothingColorRow
              itemId={config.boots.id}
              currentColor={config.boots.color}
              onColorChange={val => onChange({ boots: { id: config.boots.id, color: val } })}
            />
          </div>

          {/* Weapon */}
          <div>
            <SectionLabel>Weapon</SectionLabel>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {WEAPON_OPTIONS.map(id => {
                const entry = (SPRITE_MANIFEST.weapon as Record<string, SpriteEntry>)[id]
                return (
                  <ChipButton
                    key={id}
                    label={entry?.displayName ?? id}
                    selected={config.weapon.id === id}
                    onClick={() => onChange({ weapon: { id, color: null } })}
                    accentColor={selectedClass.color_primary}
                  />
                )
              })}
            </div>
          </div>

          {/* Next button */}
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '1rem' }}>
            <button
              onClick={onNext}
              style={{
                padding: '14px 40px',
                borderRadius: 6,
                border: 'none',
                background: `linear-gradient(135deg, ${selectedClass.color_primary}, ${selectedClass.color_secondary})`,
                color: '#fff',
                cursor: 'pointer',
                ...PIXEL_FONT_STYLE,
                fontSize: '0.6rem',
                letterSpacing: '0.1em',
                boxShadow: `0 0 20px ${selectedClass.color_primary}88`,
              }}
            >
              Next: See Your Legend →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Step 3: Confirmation Reveal ────────────────────────────────────────────

function StepReveal({
  config,
  selectedClass,
  displayName,
  onConfirm,
  isSaving,
  saveError,
  particles,
}: {
  config: AvatarConfig
  selectedClass: ClassDef
  displayName: string
  onConfirm: () => void
  isSaving: boolean
  saveError: string | null
  particles: EmberParticle[]
}) {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem 8rem', overflow: 'hidden' }}>
      {/* Ember particles */}
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: p.left,
            bottom: p.bottom,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: p.color,
            animation: `emberFloat ${p.duration} ${p.delay} ease-out infinite`,
            pointerEvents: 'none',
            filter: 'blur(1px)',
          }}
        />
      ))}

      {/* Avatar reveal */}
      <div
        style={{
          animation: 'avatarReveal 0.8s ease-out forwards',
          marginBottom: '1.5rem',
          position: 'relative',
        }}
      >
        <div
          style={{
            border: `2px solid ${selectedClass.color_primary}`,
            padding: 8,
            boxShadow: `0 0 30px ${selectedClass.color_primary}88, 0 0 60px ${selectedClass.color_primary}44`,
            animation: 'glowPulse 2s ease-in-out infinite',
            lineHeight: 0,
          }}
        >
          <SpriteCanvas config={config} size={256} />
        </div>
      </div>

      {/* Welcome text */}
      <h2
        style={{
          ...HEADING_FONT_STYLE,
          fontSize: 'clamp(1.3rem, 4vw, 2rem)',
          color: '#fff8e8',
          textAlign: 'center',
          textShadow: `0 0 30px ${selectedClass.color_primary}cc, 0 0 60px ${selectedClass.color_secondary}66`,
          marginBottom: '0.75rem',
          lineHeight: 1.3,
        }}
      >
        Welcome, {displayName} the {selectedClass.name}!
      </h2>

      <p style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.7)', marginBottom: '1.2rem', textAlign: 'center', fontFamily: 'var(--font-body), sans-serif', maxWidth: 400 }}>
        &ldquo;{selectedClass.motto}&rdquo;
      </p>

      <p style={{ color: selectedClass.color_secondary, fontSize: '0.9rem', marginBottom: '2rem', textAlign: 'center', fontFamily: 'var(--font-body), sans-serif', fontWeight: 500 }}>
        Your Embershard: ✦ {selectedClass.embershard_form}
      </p>

      <button
        onClick={onConfirm}
        disabled={isSaving}
        style={{
          padding: '16px 48px',
          borderRadius: 6,
          border: 'none',
          background: isSaving
            ? 'rgba(255,255,255,0.1)'
            : `linear-gradient(135deg, ${selectedClass.color_primary}, ${selectedClass.color_secondary})`,
          color: '#fff',
          cursor: isSaving ? 'not-allowed' : 'pointer',
          ...PIXEL_FONT_STYLE,
          fontSize: '0.65rem',
          letterSpacing: '0.12em',
          boxShadow: isSaving ? 'none' : `0 0 30px ${selectedClass.color_primary}99, 0 4px 20px rgba(0,0,0,0.5)`,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          transition: 'all 0.2s',
        }}
      >
        {isSaving ? (
          <>
            <span style={{
              display: 'inline-block',
              width: 14,
              height: 14,
              border: '2px solid rgba(255,255,255,0.4)',
              borderTopColor: '#ffffff',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
            }} />
            Inscribing your legend...
          </>
        ) : (
          'Begin Your Quest!'
        )}
      </button>

      {saveError && (
        <p style={{
          marginTop: '1rem',
          color: '#ff4444',
          fontSize: '0.85rem',
          textAlign: 'center',
          fontFamily: 'var(--font-body), sans-serif',
          maxWidth: 320,
          backgroundColor: 'rgba(0,0,0,0.6)',
          padding: '8px 12px',
          borderRadius: 4,
        }}>
          {saveError}
        </p>
      )}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────

function CreateCharacterInner() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedClass, setSelectedClass] = useState<ClassDef | null>(null)
  const [config, setConfig] = useState<AvatarConfig>(DEFAULT_CONFIG)
  const [isSaving, setIsSaving] = useState(false)
  const [displayName, setDisplayName] = useState('Emberbearer')
  const [isLoading, setIsLoading] = useState(true)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Pre-generate ember particles to avoid Math.random() in render
  const particles = useMemo<EmberParticle[]>(() => {
    const colors = ['#ff8c42', '#ff6a00', '#ffcf77', '#ff4500', '#ffa500']
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left:     `${5 + (i * 47) % 90}%`,
      bottom:   `${(i * 13) % 30}%`,
      size:     `${4 + (i * 7) % 8}px`,
      color:    colors[i % colors.length],
      duration: `${1.8 + (i * 0.3) % 1.2}s`,
      delay:    `${(i * 0.17) % 2}s`,
      drift:    `${-20 + (i * 11) % 40}px`,
    }))
  }, [])

  // Play hub music on mount, stop on unmount
  useEffect(() => {
    playBgm('hub')
    return () => stopBgm()
  }, [])

  // On mount: check auth. In edit mode, load existing config and jump to step 2.
  useEffect(() => {
    // Safety timeout: force loading off after 12s so the user never sees a
    // perpetual spinner if auth or profile query hangs.
    const safetyTimer = setTimeout(() => setIsLoading(false), 12_000)

    async function checkAuth() {
      // Determine edit mode from URL (avoids useSearchParams Suspense issue)
      const isEditMode = new URLSearchParams(window.location.search).get('mode') === 'edit'

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        clearTimeout(safetyTimer)
        setIsLoading(false)
        router.replace('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_class, display_name, avatar_config')
        .eq('id', user.id)
        .single()

      if (!profile) {
        clearTimeout(safetyTimer)
        setIsLoading(false)
        router.replace('/login')
        return
      }

      clearTimeout(safetyTimer)

      if (profile.display_name) {
        setDisplayName(profile.display_name)
      }

      if (isEditMode && profile.avatar_class) {
        // Load existing class
        const existingClass = CLASSES.find(c => c.id === profile.avatar_class) ?? null
        if (existingClass) setSelectedClass(existingClass)
        // Load existing avatar config
        if (profile.avatar_config) {
          setConfig(profile.avatar_config as unknown as AvatarConfig)
        }
        setStep(2)
        setIsLoading(false)
        return
      }

      if (profile.avatar_class && !isEditMode) {
        setIsLoading(false)
        router.replace('/play')
        return
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [supabase, router])

  const patchConfig = useCallback((patch: Partial<AvatarConfig>) => {
    setConfig(prev => ({ ...prev, ...patch }))
  }, [])

  const handleSave = useCallback(async () => {
    if (!selectedClass) return
    setIsSaving(true)
    setSaveError(null)

    try {
      const result = await saveCharacter(config as unknown as Json, selectedClass.id)
      if (result.error) {
        setSaveError(result.error)
        setIsSaving(false)
        return
      }
      router.push('/play')
    } catch (err) {
      console.error('Failed to save character:', err)
      setSaveError(
        err instanceof Error ? err.message : 'Something went wrong saving your character.',
      )
      setIsSaving(false)
    }
  }, [selectedClass, config, router])

  const stepTitles = ['CHOOSE YOUR PATH', 'FORGE YOUR IDENTITY', 'YOUR LEGEND BEGINS']

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#040812' }}>
        <div style={{ ...PIXEL_FONT_STYLE, fontSize: '0.55rem', color: '#a08040', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          Summoning the forge...
        </div>
      </div>
    )
  }

  return (
    <>
      {/* CSS keyframes */}
      <style>{`
        @keyframes avatarReveal {
          from { opacity: 0; transform: scale(0.5); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes emberFloat {
          0%   { opacity: 0.9; transform: translateY(0) translateX(0); }
          100% { opacity: 0;   transform: translateY(-120px) translateX(20px); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 20px currentColor, 0 0 40px currentColor; opacity: 1; }
          50%       { opacity: 0.75; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      <div
        className="min-h-full"
        style={{ background: '#040812', minHeight: '100%', paddingTop: '0' }}
      >
        {/* Fixed top bar */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            background: 'rgba(4,8,18,0.95)',
            backdropFilter: 'blur(8px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            padding: '0.6rem 1rem',
          }}
        >
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            {/* Back button + step label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '0.5rem' }}>
              {step > 1 && (
                <button
                  onClick={() => setStep(s => (s - 1) as 1 | 2 | 3)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255,255,255,0.5)',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: 4,
                    fontSize: '1rem',
                    lineHeight: 1,
                    transition: 'color 0.15s',
                  }}
                  aria-label="Go back"
                >
                  ←
                </button>
              )}
              <p style={{ ...PIXEL_FONT_STYLE, fontSize: '0.42rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.55)', margin: 0 }}>
                STEP {step} OF 3 · {stepTitles[step - 1]}
              </p>
            </div>

            {/* Step dots */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {[1, 2, 3].map(n => (
                <div
                  key={n}
                  style={{
                    width: n === step ? 20 : 8,
                    height: 8,
                    borderRadius: 4,
                    background: n === step
                      ? (selectedClass?.color_primary ?? '#d4440f')
                      : n < step
                        ? 'rgba(255,255,255,0.35)'
                        : 'rgba(255,255,255,0.1)',
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Step content */}
        {step === 1 && (
          <StepChoosePath
            selectedClass={selectedClass}
            onSelect={setSelectedClass}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && selectedClass && (
          <StepForgeIdentity
            config={config}
            selectedClass={selectedClass}
            onChange={patchConfig}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && selectedClass && (
          <StepReveal
            config={config}
            selectedClass={selectedClass}
            displayName={displayName}
            onConfirm={handleSave}
            isSaving={isSaving}
            saveError={saveError}
            particles={particles}
          />
        )}
      </div>
    </>
  )
}

export default function CreateCharacterPage() {
  return <CreateCharacterInner />
}
