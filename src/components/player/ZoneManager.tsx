'use client'

import { useEffect, useRef } from 'react'
import { playBgm, stopBgm, type BgmTrack } from '@/lib/audio'

type Zone = 'hub' | 'academy' | 'boss'

interface ZoneManagerProps {
  /**
   * The current zone the player is in.
   * - `'hub'`     → plays bgm_hub.mp3
   * - `'academy'` → plays bgm_academy.mp3
   * - `'boss'`    → plays bgm_boss.mp3
   *
   * Pass `null` to stop all BGM.
   */
  zone: Zone | null
  /** Optional children; the component renders nothing visible on its own. */
  children?: React.ReactNode
}

/**
 * Wraps a section of the UI and auto-switches BGM based on the `zone` prop.
 *
 * - Starts the zone's BGM track on mount / zone change.
 * - Stops BGM on unmount (so navigating to an unmanaged page doesn't leave
 *   stale audio playing).
 *
 * Usage:
 *   <ZoneManager zone="boss">
 *     <BossArena />
 *   </ZoneManager>
 *
 * Nesting:
 *   Only the innermost mounted ZoneManager takes effect, so nested zones
 *   don't create crossfade fighting. If you need to avoid this, unmount
 *   the outer zone listener before mounting the inner one.
 */
export default function ZoneManager({ zone, children }: ZoneManagerProps) {
  // Ref so the cleanup closure captures the zone at mount, not at unmount
  const zoneRef = useRef(zone)
  zoneRef.current = zone

  useEffect(() => {
    if (!zone) {
      stopBgm()
      return
    }

    const track: BgmTrack = zone
    playBgm(track)

    return () => {
      // Only stop if no newer ZoneManager has mounted with a different zone
      if (zoneRef.current === zone) {
        stopBgm()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zone])

  return <>{children}</>
}
