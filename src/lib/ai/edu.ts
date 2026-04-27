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
  reading:     'short reading passage (2–4 sentences) embedded in the question text itself, followed by a comprehension question — title is "Passage: <theme>"',
  science:     'biology, chemistry, physics, earth science, astronomy — concept-level recall and applied reasoning',
  history:     'world and US history from antiquity to the late 20th century — events, people, dates, causes',
  vocabulary:  'definitions, synonyms, antonyms, usage in context — title is "Define: <word>"',
  logic:       'pattern completion, deduction, sequences, simple set reasoning — no advanced math required',
}

// Lower temperature for fact-based subjects, higher for creative passages.
const SUBJECT_TEMPERATURE: Record<EduSubject, number> = {
  math:       0.55,
  logic:      0.55,
  science:    0.65,
  history:    0.7,
  vocabulary: 0.7,
  reading:    0.85,
}

function buildPrompt(subject: EduSubject, ageTier: AgeTier, count: number): { system: string; user: string } {
  const system = `You generate engaging, age-appropriate educational quiz questions for a fantasy RPG learning app called Quest Forge. Output strict JSON ONLY — no prose, no markdown fences, no commentary.`

  const readingExtra = subject === 'reading'
    ? '\n- The "question" field MUST start with a 2–4 sentence reading passage, followed by the comprehension question. Do NOT put the passage in "title".'
    : ''

  const user = `Generate ${count} ${subject} questions for ${TIER_DESCRIPTION[ageTier]}.

Subject focus: ${SUBJECT_GUIDANCE[subject]}.

For each question, return:
- "title": short 1-5 word label (e.g. "6 × 7", "Passage: The Brave Seed", "Define: ancient")
- "question": full question text the kid sees${readingExtra}
- "options": array of exactly 4 DISTINCT answer choices (strings); ONE must be correct
- "correct_answer": EXACTLY one of the four option strings (case- and punctuation-identical, no extra whitespace)
- "explanation": one or two sentences explaining why the answer is correct
- "xp_reward": integer 15–40 reflecting difficulty

Vary difficulty across the set. No duplicate questions. No duplicate options within a question. Avoid topics that require visuals.

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
  if (typeof raw.title !== 'string') return null
  const title = raw.title.trim()
  if (!title || title.length > 80) return null

  if (typeof raw.question !== 'string') return null
  const question = raw.question.trim()
  if (question.length < 8 || question.length > 600) return null

  if (!Array.isArray(raw.options) || raw.options.length !== 4) return null
  // Trim every option; reject empty / oversized strings.
  const options: string[] = []
  for (const opt of raw.options) {
    if (typeof opt !== 'string') return null
    const trimmed = opt.trim()
    if (trimmed.length === 0 || trimmed.length > 140) return null
    options.push(trimmed)
  }
  // Reject duplicate options (case-insensitive).
  const seen = new Set<string>()
  for (const opt of options) {
    const key = opt.toLowerCase()
    if (seen.has(key)) return null
    seen.add(key)
  }

  if (typeof raw.correct_answer !== 'string') return null
  const correct = raw.correct_answer.trim()
  if (!options.includes(correct)) return null

  const explanation = typeof raw.explanation === 'string' ? raw.explanation.trim() : ''
  if (explanation.length > 400) return null

  const xp = typeof raw.xp_reward === 'number' && raw.xp_reward >= 5 && raw.xp_reward <= 100
    ? Math.round(raw.xp_reward)
    : 25

  return {
    id: `ai_${idPrefix}_${idx}`,
    title,
    content: {
      question,
      options,
      correct_answer: correct,
      explanation,
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
  if (!(await canMakeRequest())) {
    return null
  }

  const { system, user } = buildPrompt(subject, ageTier, count)
  const raw = await generateWithFallback({
    system,
    user,
    maxTokens: 2400,
    temperature: SUBJECT_TEMPERATURE[subject],
  })
  if (!raw) {
    console.warn(`[edu] AI providers returned no text for ${subject}/${ageTier}`)
    return null
  }

  const parsed = tryParseJson(raw)
  if (!parsed || !Array.isArray((parsed as { questions: unknown }).questions)) {
    console.warn(`[edu] AI response could not be parsed as JSON for ${subject}/${ageTier}`)
    return null
  }

  const idPrefix = `${subject}_${ageTier}_${Date.now().toString(36)}`
  const out: GeneratedQuestion[] = []
  let rejected = 0
  for (let i = 0; i < (parsed.questions as unknown[]).length; i++) {
    const q = isValidQuestion((parsed.questions as RawQuestion[])[i], idPrefix, i)
    if (q) out.push(q)
    else rejected++
  }

  if (rejected > 0) {
    console.warn(`[edu] rejected ${rejected}/${(parsed.questions as unknown[]).length} questions for ${subject}/${ageTier} (failed validation)`)
  }

  if (out.length === 0) return null

  // Only count usage when we actually got something useful.
  await incrementUsage().catch(() => { /* ignore */ })
  return out
}
