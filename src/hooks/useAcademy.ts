'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EduChallenge {
  id: string
  title?: string
  subject?: string
  age_tier?: 'junior' | 'senior'
  difficulty?: number
  xp_reward: number
  content: {
    question: string
    options: string[]
    correct_answer: string
    explanation?: string
    type?: string
  }
}

export type QuestionSource = 'ai' | 'db' | 'fallback'

export interface UseAcademyResult {
  /** Currently loaded challenge set (up to 10). */
  challenges: EduChallenge[]
  /** Where the loaded challenges came from (null until first fetch resolves). */
  source: QuestionSource | null
  /** Whether challenges are still being fetched. */
  loading: boolean
  /** Human-readable error, or null when OK. */
  error: string | null
  /** Derived age tier for the current player. Null until profile age loads. */
  ageTier: 'junior' | 'senior' | null
  /** Running count of correct answers in this session. */
  sessionCorrect: number
  /** Running XP earned this session (sum of xp_reward for correct answers). */
  sessionXp: number
  /** True while a submitAnswer call is in-flight (prevents double-submission). */
  submitting: boolean
  /** Fetch a fresh random set of 10 challenges, optionally filtered by subject. */
  fetchChallenges: (subject?: string) => Promise<void>
  /**
   * Record an answer and, if correct, award XP.
   *
   * Inserts a row into edu_completions. The DB trigger
   * `handle_edu_completed` automatically updates profiles.xp_total /
   * xp_available, deals boss damage, and recalculates the player’s level.
   *
   * Callers should NOT manually update XP or boss HP — the trigger
   * handles it atomically.
   */
  submitAnswer: (challengeId: string, correct: boolean) => Promise<void>
  /** Reset session counters (does not re-fetch). */
  resetSession: () => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function deriveAgeTier(age: number | null): 'junior' | 'senior' {
  if (age === null || age <= 10) return 'junior'
  return 'senior'
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// ---------------------------------------------------------------------------
// Hardcoded fallback questions (used when both AI and DB are unavailable)
// ---------------------------------------------------------------------------

const FALLBACKS: Record<string, EduChallenge[]> = {
  math: [
    { id: 'fb_math_0', title: '3 × 7', xp_reward: 20, content: { question: 'What is 3 multiplied by 7?', options: ['18', '21', '24', '27'], correct_answer: '21', explanation: '3 × 7 = 21 because multiplication is repeated addition: 3 + 3 + 3 + 3 + 3 + 3 + 3 = 21.' } },
    { id: 'fb_math_1', title: 'Half of 50', xp_reward: 15, content: { question: 'What is half of 50?', options: ['20', '25', '30', '45'], correct_answer: '25', explanation: 'Half of a number means dividing it by 2. 50 ÷ 2 = 25.' } },
    { id: 'fb_math_2', title: '100 – 37', xp_reward: 15, content: { question: 'Subtract 37 from 100. What is the result?', options: ['63', '67', '73', '77'], correct_answer: '63', explanation: '100 − 37 = 63. You can count up from 37: 37 + 63 = 100.' } },
    { id: 'fb_math_3', title: '12 ÷ 4', xp_reward: 15, content: { question: 'What is 12 divided by 4?', options: ['2', '3', '4', '6'], correct_answer: '3', explanation: 'Division splits a number into equal groups. 12 ÷ 4 = 3, meaning 4 groups of 3 make 12.' } },
    { id: 'fb_math_4', title: 'Perimeter', xp_reward: 25, content: { question: 'A square has sides of 6 cm. What is its perimeter?', options: ['12 cm', '24 cm', '36 cm', '48 cm'], correct_answer: '24 cm', explanation: 'Perimeter is the total distance around a shape. A square has 4 equal sides, so 6 × 4 = 24 cm.' } },
  ],
  reading: [
    { id: 'fb_read_0', title: 'Passage: The Sun', xp_reward: 20, content: { question: 'The sun is a giant ball of hot gas. It gives light and warmth to all the plants and animals on Earth. Without the sun, Earth would be a dark and icy place. What would Earth be like without the sun?', options: ['Cold and dark', 'Hot and bright', 'Exactly the same', 'Covered in water'], correct_answer: 'Cold and dark', explanation: 'The passage says that without the sun Earth would be a "dark and icy place" — meaning cold and dark.' } },
    { id: 'fb_read_1', title: 'Passage: The Fox', xp_reward: 20, content: { question: 'A clever fox was looking for food. It saw a crow holding a piece of cheese in its beak. The fox told the crow that it must have a beautiful voice. When the crow opened its beak to sing, the cheese fell down. The fox caught it and ran away. Why did the crow drop the cheese?', options: ['The crow was not hungry', 'The fox scared the crow', 'The crow opened its beak to sing', 'The cheese was too heavy'], correct_answer: 'The crow opened its beak to sing', explanation: 'The fox tricked the crow into opening its beak to sing, which made the cheese fall.' } },
    { id: 'fb_read_2', title: 'Passage: Recycling', xp_reward: 25, content: { question: 'Recycling means turning old things into new things. When you recycle a plastic bottle, it can become a new bottle or even a park bench. Recycling helps reduce waste and saves energy. What can a recycled plastic bottle become?', options: ['A new bottle or a park bench', 'A book', 'A pair of shoes', 'A window'], correct_answer: 'A new bottle or a park bench', explanation: 'The passage says recycled bottles can become "a new bottle or even a park bench."' } },
    { id: 'fb_read_3', title: 'Passage: Bees', xp_reward: 25, content: { question: 'Bees are hard-working insects. They fly from flower to flower collecting nectar. When they visit flowers, pollen sticks to their bodies and gets carried to other flowers. This helps fruits and vegetables grow. What do bees carry between flowers?', options: ['Water', 'Pollen', 'Honey', 'Leaves'], correct_answer: 'Pollen', explanation: 'The passage says pollen sticks to bees and gets carried to other flowers, helping plants grow.' } },
    { id: 'fb_read_4', title: 'Passage: The Moon', xp_reward: 20, content: { question: 'The moon orbits around Earth. It takes about 27 days to go all the way around. The moon does not make its own light — it reflects light from the sun. Sometimes we see the whole moon, and sometimes only a tiny sliver. Why can we see the moon at night?', options: ['The moon makes its own light', 'It reflects light from the sun', 'The stars light it up', 'Earth lights it up'], correct_answer: 'It reflects light from the sun', explanation: 'The passage says the moon "reflects light from the sun," which is why it appears bright in the night sky.' } },
  ],
  science: [
    { id: 'fb_sci_0', title: 'States of Matter', xp_reward: 20, content: { question: 'Water can exist in three states: solid, liquid, and gas. What is the solid form of water called?', options: ['Steam', 'Ice', 'Vapor', 'Frost'], correct_answer: 'Ice', explanation: 'When water freezes at 0°C (32°F), it becomes ice — the solid state of water.' } },
    { id: 'fb_sci_1', title: 'Solar System', xp_reward: 15, content: { question: 'What is the closest planet to the sun?', options: ['Venus', 'Mercury', 'Earth', 'Mars'], correct_answer: 'Mercury', explanation: 'Mercury is the smallest planet in our solar system and the closest to the sun, orbiting at about 58 million km away.' } },
    { id: 'fb_sci_2', title: 'Human Body', xp_reward: 20, content: { question: 'What is the largest organ in the human body?', options: ['Brain', 'Liver', 'Skin', 'Heart'], correct_answer: 'Skin', explanation: 'The skin is the largest organ, covering about 1.5–2 square meters in adults and protecting the body from germs and injury.' } },
    { id: 'fb_sci_3', title: 'Gravity', xp_reward: 25, content: { question: 'Gravity is a force that pulls objects toward each other. On Earth, gravity pulls everything toward the...', options: ['Sky', 'North Pole', 'Center of the Earth', 'Sun'], correct_answer: 'Center of the Earth', explanation: 'Earth\'s gravity pulls everything toward its center, which is why objects fall downward and we stay grounded.' } },
    { id: 'fb_sci_4', title: 'Life Cycle', xp_reward: 20, content: { question: 'A caterpillar changes into a butterfly through a process called...', options: ['Evolution', 'Metamorphosis', 'Germination', 'Hibernation'], correct_answer: 'Metamorphosis', explanation: 'Metamorphosis is the process of transformation from a caterpillar to a chrysalis to a butterfly.' } },
  ],
  history: [
    { id: 'fb_hist_0', title: 'Ancient Egypt', xp_reward: 20, content: { question: 'Why did ancient Egyptians build pyramids?', options: ['As temples for worship', 'As tombs for pharaohs', 'As grain storage', 'As royal palaces'], correct_answer: 'As tombs for pharaohs', explanation: 'The pyramids were built as monumental tombs to house the bodies and treasures of pharaohs for the afterlife.' } },
    { id: 'fb_hist_1', title: 'The First Flight', xp_reward: 15, content: { question: 'The Wright brothers made the first powered airplane flight in which year?', options: ['1895', '1903', '1910', '1921'], correct_answer: '1903', explanation: 'Orville and Wilbur Wright made their historic first flight at Kitty Hawk, North Carolina on December 17, 1903.' } },
    { id: 'fb_hist_2', title: 'Roman Empire', xp_reward: 20, content: { question: 'Which sea did the Roman Empire surround and control for trade and travel?', options: ['Atlantic Ocean', 'Mediterranean Sea', 'Red Sea', 'Black Sea'], correct_answer: 'Mediterranean Sea', explanation: 'The Romans called the Mediterranean "Mare Nostrum" (Our Sea) and controlled its entire coastline for centuries.' } },
    { id: 'fb_hist_3', title: 'The Moon Landing', xp_reward: 25, content: { question: 'Who was the first person to walk on the moon?', options: ['Buzz Aldrin', 'Neil Armstrong', 'Yuri Gagarin', 'John Glenn'], correct_answer: 'Neil Armstrong', explanation: 'Neil Armstrong stepped onto the lunar surface on July 20, 1969, saying "That\'s one small step for man, one giant leap for mankind."' } },
    { id: 'fb_hist_4', title: 'Voting Rights', xp_reward: 25, content: { question: 'The 19th Amendment to the U.S. Constitution, ratified in 1920, gave what right to American women?', options: ['The right to own property', 'The right to vote', 'The right to attend college', 'The right to serve in the military'], correct_answer: 'The right to vote', explanation: 'The 19th Amendment guaranteed women\'s suffrage — the right to vote — after decades of activism by the women\'s suffrage movement.' } },
  ],
  vocabulary: [
    { id: 'fb_voc_0', title: 'Define: curious', xp_reward: 15, content: { question: 'What does the word "curious" mean?', options: ['Angry and upset', 'Eager to learn or know something', 'Very tired', 'Not interested'], correct_answer: 'Eager to learn or know something', explanation: '"Curious" means wanting to learn more about something. A curious person asks lots of questions.' } },
    { id: 'fb_voc_1', title: 'Define: ancient', xp_reward: 15, content: { question: 'What does "ancient" mean?', options: ['Brand new', 'Very old', 'Fast moving', 'Extremely large'], correct_answer: 'Very old', explanation: '"Ancient" describes something from a long time ago, like ancient Egypt or ancient Greek civilization.' } },
    { id: 'fb_voc_2', title: 'Synonym: happy', xp_reward: 15, content: { question: 'Which word is a synonym (means the same) as "happy"?', options: ['Sad', 'Joyful', 'Angry', 'Tired'], correct_answer: 'Joyful', explanation: '"Joyful" is a synonym for "happy" — both describe a feeling of pleasure or contentment.' } },
    { id: 'fb_voc_3', title: 'Antonym: brave', xp_reward: 15, content: { question: 'Which word is an antonym (means the opposite) of "brave"?', options: ['Strong', 'Cowardly', 'Bold', 'Fearless'], correct_answer: 'Cowardly', explanation: 'If "brave" means courageous and willing to face danger, its opposite is "cowardly" — lacking courage.' } },
    { id: 'fb_voc_4', title: 'Define: enormous', xp_reward: 15, content: { question: 'What does "enormous" mean?', options: ['Tiny', 'Very small', 'Very large', 'Medium-sized'], correct_answer: 'Very large', explanation: '"Enormous" means extremely large or huge. A blue whale is an enormous animal.' } },
  ],
  logic: [
    { id: 'fb_log_0', title: 'Pattern: 2, 4, 6...', xp_reward: 20, content: { question: 'What is the next number in this pattern: 2, 4, 6, ___?', options: ['7', '8', '9', '10'], correct_answer: '8', explanation: 'The pattern adds 2 each time: 2 + 2 = 4, 4 + 2 = 6, 6 + 2 = 8.' } },
    { id: 'fb_log_1', title: 'Odd One Out', xp_reward: 15, content: { question: 'Which word does NOT belong with the others?', options: ['Apple', 'Banana', 'Carrot', 'Orange'], correct_answer: 'Carrot', explanation: 'Apple, banana, and orange are fruits. A carrot is a vegetable.' } },
    { id: 'fb_log_2', title: 'Deduction', xp_reward: 25, content: { question: 'All birds have feathers. A sparrow is a bird. Which conclusion follows?', options: ['Sparrows can fly', 'Sparrows have feathers', 'Sparrows build nests', 'Sparrows eat seeds'], correct_answer: 'Sparrows have feathers', explanation: 'If all birds have feathers and a sparrow is a bird, then a sparrow must have feathers. This is a logical deduction.' } },
    { id: 'fb_log_3', title: 'Shape Pattern', xp_reward: 20, content: { question: 'A sequence of shapes goes: circle, square, triangle, circle, square, ___? What comes next?', options: ['Circle', 'Square', 'Triangle', 'Rectangle'], correct_answer: 'Triangle', explanation: 'The pattern repeats in groups of three: circle, square, triangle. After circle, square comes triangle.' } },
    { id: 'fb_log_4', title: 'Family Tree', xp_reward: 25, content: { question: 'Sarah is older than Tom. Tom is older than Ben. Who is the youngest?', options: ['Sarah', 'Tom', 'Ben', 'Cannot be determined'], correct_answer: 'Ben', explanation: 'If Sarah > Tom > Ben, then Ben is the youngest. You can compare ages transitively.' } },
  ],
}

/** Generic fallback used when no subject-specific questions exist. */
const GENERIC_FALLBACK: EduChallenge[] = [
  { id: 'fb_gen_0', title: 'Quick Math', xp_reward: 15, content: { question: 'What is 5 + 8?', options: ['11', '12', '13', '14'], correct_answer: '13', explanation: '5 + 8 = 13.' } },
  { id: 'fb_gen_1', title: 'Word Meaning', xp_reward: 15, content: { question: 'What does "brave" mean?', options: ['Scared', 'Courageous', 'Tired', 'Hungry'], correct_answer: 'Courageous', explanation: 'Brave means showing courage and not giving in to fear.' } },
  { id: 'fb_gen_2', title: 'Pattern', xp_reward: 15, content: { question: 'What is the next letter? A, B, C, ___?', options: ['D', 'E', 'F', 'A'], correct_answer: 'D', explanation: 'The alphabet goes A, B, C, D in order.' } },
]

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAcademy(
  userId: string | null,
  householdId: string | null,
): UseAcademyResult {
  const supabase = useMemo(() => createClient(), [])

  const [challenges, setChallenges] = useState<EduChallenge[]>([])
  const [source, setSource] = useState<QuestionSource | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ageTier, setAgeTier] = useState<'junior' | 'senior' | null>(null)
  const [sessionCorrect, setSessionCorrect] = useState(0)
  const [sessionXp, setSessionXp] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const submittingRef = useRef(false)

  // ── Derive age_tier from profile ──────────────────────────────────────────

  useEffect(() => {
    if (!userId) return
    ;(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('age')
        .eq('id', userId)
        .single()
      // Fallback to 'junior' if profile fetch fails — ensures questions
      // can still load even if the profiles RLS or query has an issue.
      setAgeTier(data ? deriveAgeTier(data.age) : 'junior')
    })()
  }, [userId, supabase])

  // ── Fetch challenges ──────────────────────────────────────────────────────
  // Mirrors the arena-game pattern: tries AI generation first (which now
  // persists into edu_challenges and returns real UUIDs), then the seeded DB
  // via the server proxy route — bypasses the browser-side Supabase REST hang
  // that affected direct queries.

  const fetchChallenges = useCallback(async (subject?: string) => {
    if (!ageTier) return // age not yet loaded; caller should wait
    setLoading(true)
    setError(null)
    setSource(null)
    setSessionCorrect(0)
    setSessionXp(0)

    // Quiz-style games (Reading, History, Vocab, Logic) always pass `subject`.
    // Without it we can't sensibly call the AI generator.
    const aiPromise: Promise<EduChallenge[] | null> = subject
      ? fetch('/api/edu/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject, age_tier: ageTier, count: 5 }),
          signal: AbortSignal.timeout(30000),
        })
          .then(async (res) => {
            if (!res.ok) {
              console.warn('[useAcademy] AI generate returned', res.status, '— falling back to DB')
              return null
            }
            const json = (await res.json()) as { questions?: EduChallenge[] }
            return json.questions && json.questions.length >= 5 ? json.questions : null
          })
          .catch((err) => {
            console.warn('[useAcademy] AI generate fetch failed:', err)
            return null
          })
      : Promise.resolve(null)

    const dbPromise: Promise<EduChallenge[] | null> = (async () => {
      try {
        const params = new URLSearchParams({ age_tier: ageTier, count: '5' })
        if (subject) params.set('subject', subject)
        const res = await fetch(`/api/edu/challenges?${params.toString()}`, {
          signal: AbortSignal.timeout(25000),
        })
        if (!res.ok) {
          console.error('[useAcademy] API route error:', res.status)
          return null
        }
        const json = (await res.json()) as { questions?: EduChallenge[] }
        if (!json.questions || json.questions.length === 0) return null
        return json.questions
      } catch (err) {
        console.error('[useAcademy] API route threw:', err)
        return null
      }
    })()

    const overallTimeout: Promise<never> = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 32_000),
    )

    try {
      const aiResults = await Promise.race([aiPromise, overallTimeout])
      if (aiResults) {
        setChallenges(shuffle(aiResults).slice(0, 5))
        setSource('ai')
        setLoading(false)
        return
      }

      const dbResults = await Promise.race<EduChallenge[] | null>([dbPromise, overallTimeout])
      if (dbResults) {
        setChallenges(shuffle(dbResults).slice(0, 5))
        setSource('db')
        setLoading(false)
        return
      }

      // Last resort: hardcoded fallback questions so the player always has
      // something to answer, even when both AI and DB are offline.
      const fallback = subject
        ? (FALLBACKS[subject] ?? GENERIC_FALLBACK)
        : GENERIC_FALLBACK
      setChallenges(shuffle(fallback).slice(0, 5))
      setSource('fallback')
      setLoading(false)
    } catch {
      // Even in an error path, serve the hardcoded fallback so the UI
      // never shows a blank/error state when questions were expected.
      const fallback = subject
        ? (FALLBACKS[subject] ?? GENERIC_FALLBACK)
        : GENERIC_FALLBACK
      setChallenges(shuffle(fallback).slice(0, 5))
      setSource('fallback')
      setLoading(false)
    }
  }, [ageTier])

  // ── Submit answer ─────────────────────────────────────────────────────────

  const submitAnswer = useCallback(async (
    challengeId: string,
    correct: boolean,
  ) => {
    // Guard: prevent rapid double-clicks (ref is instant, state follows)
    if (submittingRef.current) return
    if (!householdId || !userId) return

    submittingRef.current = true
    setSubmitting(true)

    try {
      const challenge = challenges.find(c => c.id === challengeId)
      if (!challenge) return

      const xpToAward = correct ? challenge.xp_reward : 0

      // Track session stats client-side for UI display
      if (correct) {
        setSessionCorrect(prev => prev + 1)
        setSessionXp(prev => prev + xpToAward)
      }

      // Skip persistence if the id isn't a UUID — protects against the FK
      // violation that would silently abort the save.
      if (!UUID_RE.test(challengeId)) return

      // Insert completion  →  DB trigger awards XP + deals boss damage
      const { error: insertError } = await supabase.from('edu_completions').insert({
        household_id: householdId,
        challenge_id: challengeId,
        player_id: userId,
        score: correct ? 1 : 0,
        completed_at: new Date().toISOString(),
        xp_awarded: xpToAward,
      })
      if (insertError) {
        console.error('[useAcademy] edu_completions insert failed:', insertError)
        setError('Failed to save answer')
        throw new Error('Database insert failed')
      }
    } catch (err) {
      console.error('[useAcademy] edu_completions insert threw:', err)
      setError('Failed to save answer')
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }, [challenges, householdId, userId, supabase])

  // ── Reset ─────────────────────────────────────────────────────────────────

  const resetSession = useCallback(() => {
    setSessionCorrect(0)
    setSessionXp(0)
    setError(null)
  }, [])

  return {
    challenges,
    source,
    loading,
    error,
    ageTier,
    sessionCorrect,
    sessionXp,
    submitting,
    fetchChallenges,
    submitAnswer,
    resetSession,
  }
}
