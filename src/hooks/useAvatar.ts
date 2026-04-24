'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { AvatarConfig, AvatarLayerCategory, SpriteLayer } from '@/types/avatar'
import { usePlayer } from '@/hooks/usePlayer'

export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  body:   { id: 'body_female', color: null },
  eyes:   { id: null },
  hair:   { id: 'bob', color: '#3d2200' },
  pants:  { id: 'pants', color: 'brown' },
  shirt:  { id: 'longsleeve', color: 'navy' },
  boots:  { id: 'boots', color: 'brown' },
  hands:  { id: null },
  belt:   { id: null },
  cape:   { id: null },
  helmet: { id: null },
  weapon: { id: null },
  shield: { id: null },
}

export interface UseAvatarResult {
  draftConfig: AvatarConfig
  isDirty: boolean
  saving: boolean
  loading: boolean
  updateLayer: (category: AvatarLayerCategory, changes: Partial<SpriteLayer>) => void
  setLayerId: (category: AvatarLayerCategory, id: string | null) => void
  setLayerColor: (category: AvatarLayerCategory, color: string | null) => void
  saveAvatar: () => Promise<{ error: unknown } | undefined>
  resetConfig: () => void
}

export function useAvatar(userId: string | null): UseAvatarResult {
  const { profile, loading: profileLoading, refresh } = usePlayer(userId)
  const supabase = createClient()

  const [draftConfig, setDraftConfig] = useState<AvatarConfig>(() => ({ ...DEFAULT_AVATAR_CONFIG }))
  const [isDirty, setIsDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (initialized) return

    if (profileLoading) return

    const config = profile?.avatar_config as AvatarConfig | null
    if (config) {
      setDraftConfig(config)
    }
    setInitialized(true)
  }, [profile, profileLoading, initialized])

  const updateLayer = useCallback((category: AvatarLayerCategory, changes: Partial<SpriteLayer>) => {
    setDraftConfig(prev => ({
      ...prev,
      [category]: { ...prev[category], ...changes },
    }))
    setIsDirty(true)
  }, [])

  const setLayerId = useCallback((category: AvatarLayerCategory, id: string | null) => {
    updateLayer(category, { id })
  }, [updateLayer])

  const setLayerColor = useCallback((category: AvatarLayerCategory, color: string | null) => {
    updateLayer(category, { color })
  }, [updateLayer])

  const saveAvatar = useCallback(async () => {
    if (!userId) return
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_config: draftConfig as never })
      .eq('id', userId)
    if (!error) {
      setIsDirty(false)
      refresh()
    }
    setSaving(false)
    return { error }
  }, [userId, draftConfig, supabase, refresh])

  const resetConfig = useCallback(() => {
    setDraftConfig({ ...DEFAULT_AVATAR_CONFIG })
    setIsDirty(true)
  }, [])

  return {
    draftConfig,
    isDirty,
    saving,
    loading: !initialized && profileLoading,
    updateLayer,
    setLayerId,
    setLayerColor,
    saveAvatar,
    resetConfig,
  }
}
