'use client'

import dynamic from 'next/dynamic'
import PlayLoading from '../loading'

const StoryContent = dynamic(() => import('./StoryClient'), {
  loading: () => <PlayLoading />,
  ssr: false,
})

export default function StoryClientWrapper() {
  return <StoryContent />
}