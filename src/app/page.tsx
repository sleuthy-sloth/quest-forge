import { Metadata } from 'next'
import LandingClient from './LandingClient'

export const metadata: Metadata = {
  title: 'Quest Forge | Turn Chores into Quests',
  description: 'The ultimate fantasy RPG adventure for households. Turn your daily chores and learning into epic rewards, unlock stories, and defeat bosses.',
  openGraph: {
    title: 'Quest Forge | Turn Chores into Quests',
    description: 'The ultimate fantasy RPG adventure for households. Turn your daily chores and learning into epic rewards.',
    images: ['/images/landing/hero.png'],
  },
}

export default function Page() {
  return <LandingClient />
}
