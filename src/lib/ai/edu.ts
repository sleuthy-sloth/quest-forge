import { generateWithFallback } from './client'
import { canMakeRequest, incrementUsage } from './rate-limiter'

// ── Types ─────────────────────────────────────────────────────────────────────

export type EduSubject = 'math' | 'reading' | 'science' | 'history' | 'vocabulary' | 'logic' | 'general_knowledge' | 'life_skills'
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
  math:        'arithmetic, geometry, fractions, word problems — focus on logical steps, not just recall',
  reading:     'short reading passage (2–4 sentences) followed by a comprehension question that requires inference or detail recall',
  science:     'biology, chemistry, physics, earth science — use precise scientific definitions (e.g., "dog" is an "animal", not just a "pet")',
  history:     'world and US history — focus on significant events and cause-effect relationships',
  vocabulary:  'definitions, synonyms, antonyms — use high-quality, unambiguous choices. Synonyms must be true synonyms (e.g., "cat" and "feline", not "cat" and "kitten"). Antonyms must be direct opposites (e.g., "hot" and "cold").',
  logic:       'a DIVERSE MIX of question types. Each set of 5 questions MUST include at least 4 different types from this list — do NOT repeat the same type more than once:\n  1. NUMBER SEQUENCE: "2, 5, 8, 11, ___?" (arithmetic or geometric progressions)\n  2. SYMBOL PATTERN: Use Unicode symbols inline — "◯ ■ △ ◯ ■ ___" (put symbol answers in options too)\n  3. WORD ANALOGY: "Hot is to cold as day is to ___?"\n  4. SYLLOGISM: "All birds have feathers. A sparrow is a bird. Does a sparrow have feathers?"\n  5. ODD ONE OUT: "Apple, banana, carrot, grape — which does not belong and why?"\n  6. ORDERING PUZZLE: "Sarah is older than Tom. Tom is older than Ben. Who is youngest?"\n  7. IF/THEN DEDUCTION: "If all knights are brave, and Alric is a knight, is Alric brave?"\n  8. RIDDLE/LATERAL: A short, age-appropriate riddle with a clear logical answer (e.g. "I have hands but cannot clap. What am I?")',
  general_knowledge: 'trivia across geography, art, pop culture, and sports — keep it globally relevant and fun.',
  life_skills: 'emotional intelligence, social etiquette, safety, and basic health — focus on positive behaviors and problem solving.',
}

// Lower temperature for fact-based subjects, higher for creative passages.
const SUBJECT_TEMPERATURE: Record<EduSubject, number> = {
  math:       0.55,
  logic:      0.60,
  science:    0.65,
  history:    0.7,
  vocabulary: 0.7,
  reading:    0.85,
  general_knowledge: 0.75,
  life_skills: 0.8,
}

function buildPrompt(subject: EduSubject, ageTier: AgeTier, count: number): { system: string; user: string } {
  const system = `You generate engaging, age-appropriate educational quiz questions for a fantasy RPG learning app called Quest Forge. Output strict JSON ONLY — no prose, no markdown fences, no commentary.`

  const readingExtra = subject === 'reading'
    ? '\n- The "question" field MUST start with a 2–4 sentence reading passage, followed by the comprehension question. Do NOT put the passage in "title".'
    : ''

  const logicExtra = subject === 'logic'
    ? '\n- LOGIC VARIETY RULE: Distribute the questions across DIFFERENT types (number sequence, symbol pattern, word analogy, syllogism, odd one out, ordering, deduction, riddle). Do NOT use the same type more than once in a 5-question set.\n- For SYMBOL PATTERN questions: embed Unicode symbols directly in the question text (e.g. "◯ ■ △ ◯ ■ ___") and use the raw symbols as answer options. Do NOT write "circle" or "square".\n- For RIDDLE questions: keep them short, concrete, and appropriate for the age tier. Always ensure only one answer is correct.'
    : ''

  const user = `Generate ${count} ${subject} questions for ${TIER_DESCRIPTION[ageTier]}.

Subject focus: ${SUBJECT_GUIDANCE[subject]}.

For each question, return:
- "title": short 1-5 word label (e.g. "6 × 7", "Passage: The Brave Seed", "Define: ancient")
- "question": full question text the kid sees${readingExtra}${logicExtra}
- "options": array of exactly 4 DISTINCT answer choices (strings); ONE must be correct
- "correct_answer": EXACTLY one of the four option strings (case- and punctuation-identical, no extra whitespace)
- "explanation": one or two sentences explaining why the answer is correct
- "xp_reward": integer 15–40 reflecting difficulty

Vary difficulty across the set. No duplicate questions. No duplicate options within a question.

CRITICAL: Ensure logical rigor. 
- Definitions must be accurate (e.g., a "dog" is an "animal"). 
- Synonyms must have near-identical meanings. 
- Antonyms must be clear opposites (avoid "sun/night", use "day/night" or "hot/cold").
- Distractors (wrong options) should be plausible but clearly incorrect to someone who knows the subject.
- Avoid vague phrasing like "Which word replaces X?".
- NEVER create questions that depend on visuals EXCEPT for logic pattern questions — those MUST use actual Unicode symbols (◯ ■ △ ★ ◆ ▲ ●) in both the question and answer options, not spelled-out words like "circle" or "square".

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
    // Walk forward from each '{' to find the first balanced, parse-able JSON
    // block.  A greedy /\{[\s\S]*\}/ would start at the FIRST '{' which could
    // be inside thinking prose (e.g. "here {is} my plan"), causing parse errors.
    for (let i = 0; i < cleaned.length; i++) {
      if (cleaned[i] !== '{') continue
      let depth = 0
      let j = i
      for (; j < cleaned.length; j++) {
        if (cleaned[j] === '{') depth++
        else if (cleaned[j] === '}') { depth--; if (depth === 0) break }
      }
      if (depth === 0) {
        const candidate = cleaned.slice(i, j + 1)
        try { return JSON.parse(candidate) as { questions?: unknown } } catch { /* keep walking */ }
      }
    }
    return null
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
    console.warn(`[edu] AI rate limit reached — falling back to DB questions for ${subject}/${ageTier}`)
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
