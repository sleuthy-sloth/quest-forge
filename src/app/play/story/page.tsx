'use client'

import ZoneManager from '@/components/player/ZoneManager'
import StoryPlayer from '@/components/story/StoryPlayer'

export default function StoryPage() {
  return (
    <ZoneManager zone="academy">
      <StoryPlayer />
    </ZoneManager>
  )
}
