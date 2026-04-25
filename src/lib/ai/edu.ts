import { generateWithFallback } from './client'
import { canMakeRequest, incrementUsage } from './rate-limiter'

// ── Types ─────────────────────────────────────────────────────────────────────

export type EduSubject = 'math' | 'reading' | 'science' | 'history' | 'vocabulary' | 'logic'
export type AgeTier = 'junior' | 'senior'

export interface GeneratedQuestion {
  id: string                 // UUID-ish identifier (not persisted)
  title: string
  content: {
    question: string
    options: string[]        // length 4
    correct_answer: string   // must equal one of options
    explanation: string
  }
  xp_reward: number
}

// ── Subject prompts ──────────────────────────────────────────────────────────

const TIER_DESCRIPTION: Record<AgeTier, string> = {
  junior: 'ages 6 through 10 (early elementary, beginning readers)',
  senior: 'ages 11 through 16 (middle school through high school)',
}

const SUBJECT_GUIDANCE: Record<EduSubject, string> = {
  math:        'arithmetic, geometry, fractions, word problems — show the operation in the title',
  reading:     'short reading passage (2–4 sentences) followed by a comprehension question — title is "Passage: <theme>"',
  science:     'biology, chemistry, physics, earth science, astronomy — concept-level recall and applied reasoning',
  history:     'world and US history from antiquity to the late 20th century — events, people, dates, causes',
  vocabulary:  'definitions, synonyms, antonyms, usage in context — title is "Define: <word>"',
  logic:       'pattern completion, deduction, sequences, simple set reasoning — no advanced math required',
}

function buildPrompt(subject: EduSubject, ageTier: AgeTier, count: number): { system: string; user: string } {
  const system = `You generate engaging, age-appropriate educational quiz questions for a fantasy RPG learning app called Quest Forge. Output strict JSON ONLY — no prose, no markdown fences, no commentary.`

  const user = `Generate ${count} ${subject} questions for ${TIER_DESCRIPTION[ageTier]}.

Subject focus: ${SUBJECT_GUIDANCE[subject]}.

For each question, return:
- "title": short 1-5 word label (e.g. "6 × 7", "Passage: The Brave Seed", "Define: ancient")
- "question": full question text the kid sees
- "options": array of exactly 4 answer choices (strings); ONE must be correct
- "correct_answer": EXACTLY one of the four option strings (case- and punctuation-identical)
- "explanation": one or two sentences explaining why the answer is correct
- "xp_reward": integer 15–40 reflecting difficulty

Vary difficulty across the set. No duplicates. Avoid topics that require visuals.

Return JSON shaped EXACTLY:
{"questions":[{"title":"...","question":"...","options":["a","b","c","d"],"correct_answer":"...","explanation":"...","xp_reward":25}, ...]}`

  return { system, user }
}

// ── Response parsing ─────────────────────────────────────────────────────────

interface RawQuestion {
  title?: unknown
  question?: unknown
  options?: unknown
  correct_answer?: unknown
  explanation?: unknown
  xp_reward?: unknown
}

function tryParseJson(text: string): { questions?: unknown } | null {
  // The model occasionally wraps JSON in markdown fences despite instructions.
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()
  try {
    return JSON.parse(cleaned) as { questions?: unknown }
  } catch {
    // Try to extract the first {...} block.
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (!match) return null
    try {
      return JSON.parse(match[0]) as { questions?: unknown }
    } catch {
      return null
    }
  }
}

function isValidQuestion(raw: RawQuestion, idPrefix: string, idx: number): GeneratedQuestion | null {
  if (typeof raw.title !== 'string' || !raw.title.trim()) return null
  if (typeof raw.question !== 'string' || !raw.question.trim()) return null
  if (!Array.isArray(raw.options) || raw.options.length !== 4) return null
  if (!raw.options.every((o) => typeof o === 'string' && o.trim().length > 0)) return null
  if (typeof raw.correct_answer !== 'string') return null
  if (!raw.options.includes(raw.correct_answer)) return null
  const explanation = typeof raw.explanation === 'string' ? raw.explanation : ''
  const xp = typeof raw.xp_reward === 'number' && raw.xp_reward >= 5 && raw.xp_reward <= 100
    ? Math.round(raw.xp_reward)
    : 25

  return {
    id: `ai_${idPrefix}_${idx}`,
    title: raw.title.trim(),
    content: {
      question: raw.question.trim(),
      options: raw.options as string[],
      correct_answer: raw.correct_answer,
      explanation: explanation.trim(),
    },
    xp_reward: xp,
  }
}

// ── Main generator ───────────────────────────────────────────────────────────

/**
 * Generates a fresh batch of quiz questions via the AI client. Returns null
 * if the rate limit is hit, the API key is missing, or both providers fail —
 * the caller should then fall back to the seeded edu_challenges DB rows.
 */
export async function generateEduChallenges(
  subject: EduSubject,
  ageTier: AgeTier,
  count = 10,
): Promise<GeneratedQuestion[] | null> {
  if (!(await canMakeRequest())) return null

  const { system, user } = buildPrompt(subject, ageTier, count)
  const raw = await generateWithFallback({
    system,
    user,
    maxTokens: 2400,
    temperature: 0.85,
  })
  if (!raw) return null

  const parsed = tryParseJson(raw)
  if (!parsed || !Array.isArray((parsed as { questions: unknown }).questions)) return null

  const idPrefix = `${subject}_${ageTier}_${Date.now().toString(36)}`
  const out: GeneratedQuestion[] = []
  for (let i = 0; i < (parsed.questions as unknown[]).length; i++) {
    const q = isValidQuestion((parsed.questions as RawQuestion[])[i], idPrefix, i)
    if (q) out.push(q)
  }

  if (out.length === 0) return null

  // Only count usage when we actually got something useful.
  await incrementUsage().catch(() => { /* ignore */ })
  return out
}
