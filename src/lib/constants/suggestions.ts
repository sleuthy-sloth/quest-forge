export interface ChoreSuggestion {
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard' | 'epic'
}

export interface LootSuggestion {
  name: string
  description: string
  category: 'real_reward' | 'cosmetic' | 'power_up' | 'story_unlock'
  cost_gold: number
}

export const CHORE_SUGGESTIONS: ChoreSuggestion[] = [
  { title: 'Make your bed', description: 'Ensure your sleeping quarters are tidy.', difficulty: 'easy' },
  { title: 'Feed the pets', description: 'Tending to our animal companions.', difficulty: 'easy' },
  { title: 'Brush teeth without being asked', description: 'A daily ritual of cleanliness.', difficulty: 'easy' },
  { title: 'Set the table', description: 'Prepare for the coming feast.', difficulty: 'medium' },
  { title: 'Help with dishes', description: 'Many hands make light work.', difficulty: 'medium' },
  { title: 'Clean your room', description: 'Banish the chaos from your sanctuary.', difficulty: 'hard' },
  { title: 'Fold a load of laundry', description: 'Mastering the fabric of life.', difficulty: 'hard' },
  { title: 'Read for 20 minutes', description: 'Expanding your horizons through the written word.', difficulty: 'medium' },
  { title: 'Practice instrument/sport', description: 'Honing your skills for future challenges.', difficulty: 'hard' },
  { title: 'Complete your homework', description: 'The greatest battle is with the mind.', difficulty: 'epic' },
]

export const LOOT_SUGGESTIONS: LootSuggestion[] = [
  { name: '15 Mins Screen Time', description: 'Sanctioned leisure in the digital realm.', category: 'real_reward', cost_gold: 50 },
  { name: 'Choice of Dessert', description: 'A sweet reward for a job well done.', category: 'real_reward', cost_gold: 100 },
  { name: 'Pick Movie Night', description: 'The power to choose the company\'s entertainment.', category: 'real_reward', cost_gold: 200 },
  { name: 'Small Toy ($5 range)', description: 'A physical artifact of your achievements.', category: 'real_reward', cost_gold: 500 },
  { name: 'Stay up 15 mins late', description: 'Holding back the night for a little longer.', category: 'real_reward', cost_gold: 75 },
  { name: 'Chore Pass (Small)', description: 'One easy decree is automatically satisfied.', category: 'power_up', cost_gold: 300 },
]
