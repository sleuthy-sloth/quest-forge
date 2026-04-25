'use client'

import { useState, useMemo } from 'react'
import type { AvatarLayerCategory, SpriteEntry } from '@/types/avatar'
import { SPRITE_MANIFEST } from '@/lib/sprites/manifest'
import { useAvatar } from '@/hooks/useAvatar'
import AvatarDisplay from '@/components/avatar/AvatarDisplay'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  userId: string
  onSaved?: () => void
}

// ---------------------------------------------------------------------------
// Category configuration
// ---------------------------------------------------------------------------

const CATEGORIES_WITH_ENTRIES = (Object.keys(SPRITE_MANIFEST) as AvatarLayerCategory[]).filter(
  cat => Object.keys(SPRITE_MANIFEST[cat]).length > 0,
)

const CATEGORY_LABELS: Record<AvatarLayerCategory, string> = {
  body: 'Body',
  head: 'Face',
  eyes: 'Eyes',
  hair: 'Hair',
  pants: 'Legs',
  shirt: 'Torso',
  boots: 'Feet',
  hands: 'Hands',
  belt: 'Belt',
  cape: 'Cape',
  helmet: 'Head',
  weapon: 'Weapon',
  shield: 'Shield',
}

// ---------------------------------------------------------------------------
// Color mapping for named swatch display
// ---------------------------------------------------------------------------

const COLOR_HEX_MAP: Record<string, string> = {
  black: '#2d2d2d',
  bluegray: '#7a9eb1',
  blue: '#2c5f8a',
  brown: '#6b4226',
  charcoal: '#3a3a3a',
  forest: '#2d5a27',
  gray: '#8a8a8a',
  green: '#4a7c3f',
  lavender: '#a88dc2',
  leather: '#7a5c3a',
  maroon: '#6b2a2a',
  navy: '#1a2a4a',
  orange: '#c85a1a',
  pink: '#c27a8a',
  purple: '#6a3f8a',
  red: '#8a2a2a',
  rose: '#b84a5a',
  sky: '#7ab8d4',
  slate: '#5a6a7a',
  tan: '#c4a882',
  teal: '#2a6b6b',
  walnut: '#4a3020',
  white: '#e8e8e8',
  yellow: '#c4a82a',
  brass: '#b5a642',
  bronze: '#a67a44',
  ceramic: '#d4d4d4',
  copper: '#b87333',
  gold: '#c8a82a',
  iron: '#4a4a4a',
  silver: '#a8a8a8',
  steel: '#6a7a7a',
}

const TINT_PRESETS: { label: string; value: string | null }[] = [
  { label: 'None', value: null },
  { label: 'Black', value: '#1a1a1a' },
  { label: 'DkBrow', value: '#3d2200' },
  { label: 'Brown', value: '#8B4513' },
  { label: 'Blonde', value: '#D2B48C' },
  { label: 'Golden', value: '#FFD700' },
  { label: 'Silver', value: '#C0C0C0' },
  { label: 'White', value: '#f0f0f0' },
  { label: 'Red', value: '#cc3333' },
  { label: 'Blue', value: '#3366cc' },
  { label: 'Pink', value: '#ff69b4' },
  { label: 'Purple', value: '#9933cc' },
  { label: 'Green', value: '#33aa33' },
  { label: 'Orange', value: '#ff8c00' },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CharacterCreator({ userId, onSaved }: Props) {
  const {
    draftConfig,
    isDirty,
    saving,
    loading,
    updateLayer,
    setLayerId,
    setLayerColor,
    saveAvatar,
    resetConfig,
  } = useAvatar(userId)

  const [activeTab, setActiveTab] = useState<AvatarLayerCategory>('body')
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const currentEntries = SPRITE_MANIFEST[activeTab] as Record<string, SpriteEntry>
  const currentLayer = draftConfig[activeTab]
  const currentEntryDef = currentLayer?.id ? currentEntries[currentLayer.id] : null

  const hasColorVariants = currentEntryDef
    ? (currentEntryDef.colorVariants?.length ?? 0) > 0
    : false

  const supportsTint = currentEntryDef
    ? !currentEntryDef.path.includes('{color}')
    : false

  const activeLayerCount = useMemo(
    () => Object.values(draftConfig).filter(l => l.id !== null).length,
    [draftConfig],
  )

  async function handleSave() {
    setSaveMessage(null)
    const result = await saveAvatar()
    if (result?.error) {
      setSaveMessage('Failed to save')
    } else {
      setSaveMessage('Saved!')
      setTimeout(() => setSaveMessage(null), 2000)
      onSaved?.()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ember-bright border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-10">
      {/* ── Left: Preview ── */}
      <div className="flex-shrink-0 flex flex-col items-center md:sticky md:top-4 md:self-start">
        <AvatarDisplay config={draftConfig} size={256} className="mb-3" />
        <p className="text-xs text-gray-300">
          {activeLayerCount} / {Object.keys(SPRITE_MANIFEST).length} layers
        </p>
      </div>

      {/* ── Right: Controls ── */}
      <div className="flex-1 min-w-0">
        {/* Tabs */}
        <div className="flex flex-wrap gap-1 mb-4 border-b border-gray-700 pb-2 overflow-x-auto">
          {CATEGORIES_WITH_ENTRIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-3 py-1.5 text-sm rounded-t whitespace-nowrap transition-colors ${
                activeTab === cat
                  ? 'bg-gray-700 text-white font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* ── Style options ── */}
        <div className="mb-5">
          <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Style</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {currentLayer?.id !== undefined && activeTab !== 'body' && (
              <button
                onClick={() => setLayerId(activeTab, null)}
                className={`px-3 py-2 text-xs border rounded transition-colors ${
                  currentLayer.id === null
                    ? 'border-ember-bright bg-ember-bright/10 text-white'
                    : 'border-gray-600 text-gray-400 hover:border-gray-400'
                }`}
              >
                None
              </button>
            )}
            {Object.values(currentEntries).map(entry => {
              const isSelected = currentLayer?.id === entry.id
              return (
                <button
                  key={entry.id}
                  onClick={() => setLayerId(activeTab, entry.id)}
                  className={`px-3 py-2 text-xs border rounded transition-colors ${
                    isSelected
                      ? 'border-ember-bright bg-ember-bright/10 text-white'
                      : 'border-gray-600 text-gray-300 hover:border-gray-400'
                  }`}
                >
                  {entry.displayName}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Color controls ── */}
        {currentEntryDef && hasColorVariants && (
          <div className="mb-5">
            <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Color</p>
            <div className="flex flex-wrap gap-1.5">
              {(currentEntryDef.colorVariants as readonly string[]).map(colorName => {
                const hex = COLOR_HEX_MAP[colorName] ?? '#888'
                const selected = currentLayer?.color === colorName
                return (
                  <button
                    key={colorName}
                    onClick={() => setLayerColor(activeTab, colorName)}
                    className="w-7 h-7 rounded-full border-2 overflow-hidden transition-transform"
                    style={{
                      backgroundColor: hex,
                      borderColor: selected ? '#fff' : '#444',
                      transform: selected ? 'scale(1.2)' : undefined,
                    }}
                    title={colorName}
                  />
                )
              })}
            </div>
          </div>
        )}

        {currentEntryDef && !hasColorVariants && supportsTint && (
          <div className="mb-5">
            <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Tint Color</p>
            <div className="flex flex-wrap gap-1.5 items-center">
              {TINT_PRESETS.map(preset => (
                <button
                  key={preset.label}
                  onClick={() => setLayerColor(activeTab, preset.value)}
                  className="w-7 h-7 rounded-full border-2 overflow-hidden transition-transform"
                  style={{
                    backgroundColor: preset.value ?? 'transparent',
                    borderColor: currentLayer?.color === preset.value ? '#fff' : '#444',
                    borderStyle: preset.value ? 'solid' : 'dashed',
                    transform: currentLayer?.color === preset.value ? 'scale(1.2)' : undefined,
                  }}
                  title={preset.label}
                />
              ))}
              <input
                type="color"
                value={(currentLayer?.color as string) ?? '#000000'}
                onChange={e => setLayerColor(activeTab, e.target.value)}
                className="w-7 h-7 rounded cursor-pointer border-0 p-0 bg-transparent"
                title="Custom"
              />
            </div>
          </div>
        )}

        {/* ── Action buttons ── */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={!isDirty || saving}
            className="px-6 py-2 bg-ember-bright text-white font-medium rounded transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving\u2026' : 'Save Changes'}
          </button>

          {isDirty && (
            <button
              onClick={resetConfig}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Reset
            </button>
          )}

          {saveMessage && (
            <span className="text-sm text-green-400 font-medium">{saveMessage}</span>
          )}
        </div>
      </div>
    </div>
  )
}
