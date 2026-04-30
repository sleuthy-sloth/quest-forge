'use client'

import dynamic from 'next/dynamic'
import PlayLoading from '../loading'

const WorldCodexContent = dynamic(() => import('@/components/player/WorldCodex'), {
  loading: () => <PlayLoading />,
  ssr: false,
})

export default function WorldCodexWrapper(props: any) {
  return <WorldCodexContent {...props} />
}