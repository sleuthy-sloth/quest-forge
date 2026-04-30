import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import PlayLoading from '../loading'

const StoryClient = dynamic(() => import('./StoryClient'), {
  loading: () => <PlayLoading />,
  ssr: false
})

export const metadata: Metadata = {
  title: 'Chronicle Hall | Quest Forge',
  description: 'Relive the epic legends of Embervale and your household\'s journey through the ages.',
}

export default function StoryPage() {
  return <StoryClient />
}
