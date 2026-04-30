import { Metadata } from 'next'
import LootClient from './LootClient'

export const metadata: Metadata = {
  title: 'Loot Emporium | Quest Forge',
  description: 'Spend your hard-earned XP and Gold on real-world rewards and cosmetic upgrades.',
}

export default function LootPage() {
  return <LootClient />
}
