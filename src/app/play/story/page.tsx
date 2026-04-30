import { Metadata } from 'next'
import StoryClientWrapper from './StoryClientWrapper'

export const metadata: Metadata = {
  title: 'Chronicle Hall | Quest Forge',
  description: 'Relive the epic legends of Embervale and your household\'s journey through the ages.',
}

export default function StoryPage() {
  return <StoryClientWrapper />
}