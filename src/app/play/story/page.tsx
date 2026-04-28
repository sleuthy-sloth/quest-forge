'use client'

import ZoneManager from '@/components/player/ZoneManager'
import ChronicleHall from '@/components/story/ChronicleHall'

export default function StoryPage() {
  return (
    <ZoneManager zone="hub">
      <ChronicleHall />
    </ZoneManager>
  )
}
