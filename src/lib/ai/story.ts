import { generateWithFallback } from './client'
import { canMakeRequest, incrementUsage } from './rate-limiter'
import classesData from '@/lore/classes.json'
import bossesData from '@/lore/bosses.json'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BossData {
  name: string
  description: string | null
  weekNumber: number
}

export interface PlayerData {
  displayName: string
  avatarClass: string | null
}

// ---------------------------------------------------------------------------
// Prompt engineering
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are the Narrator of Embervale, a fantasy kingdom lit only by the Emberlight — the collective effort and hope of its people. You write cinematic, emotionally resonant victory narratives in 3–4 paragraphs.

Tone and style:
- Epic but intimate; like a campfire story told by a veteran Emberbearer
- Celebrate each hero by name and class title, referencing how their unique Embershard form contributed
- Describe the boss's defeat as a moment of transformation, not just violence — the Hollow energy leaving, something healing, something being restored
- End with a forward-looking note: the Emberbearers are stronger, the Hearthhold is safer, but new challenges await
- Use Embervale-specific terminology: "Hearthhold" (home), "Emberbearer" (hero), "the Emberlight" (hope/collective power), "the Hollow" (the enemy)
- NEVER assume gender — use the hero's name, class title, or they/them
- Output ONLY the narrative text. No titles, no labels, no preamble.`

const FALLBACK_SCRIPTS: Record<number, string> = {}

// Pre-load boss defeat narratives from bosses.json as fallbacks keyed by week
for (const boss of bossesData.bosses) {
  if (boss.defeat_narrative) {
    FALLBACK_SCRIPTS[boss.week] = boss.defeat_narrative
  }
}

const GENERIC_FALLBACK =
  'With a final surge of combined Emberlight, the Emberbearers stand victorious. The Hollow retreats — for now. The Hearthstone glows a little brighter tonight, and the Hearthhold rests easier knowing its heroes are watching.'

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function generateVictoryNarrative(
  boss: BossData,
  players: PlayerData[],
): Promise<string> {
  // ── 1. Enrich player data with class metadata ──────────────────────────

  const enrichedPlayers = players.map((p) => {
    const classInfo = classesData.classes.find(
      (c) => c.id === p.avatarClass,
    )
    return {
      name: p.displayName,
      className: classInfo?.name ?? p.avatarClass ?? 'an Emberbearer',
      embershardForm: classInfo?.embershard_form ?? 'an Emberlight shard',
      personality: classInfo?.personality ?? 'a steadfast hero',
    }
  })

  // ── 2. Select fallback ─────────────────────────────────────────────────

  const fallback =
    FALLBACK_SCRIPTS[boss.weekNumber] ?? GENERIC_FALLBACK

  // ── 3. Rate-limit check ────────────────────────────────────────────────

  const allowed = await canMakeRequest().catch(() => false)
  if (!allowed) {
    console.warn('[story] Daily AI limit reached — serving fallback')
    return fallback
  }

  // ── 4. Build user prompt ───────────────────────────────────────────────

  const playerList = enrichedPlayers.map((p) => {
    return `- ${p.name}, the ${p.className} (Embershard form: ${p.embershardForm}). ${p.personality}`
  }).join('\n')

  const userPrompt = [
    `**Boss:** ${boss.name}`,
    `**Week:** ${boss.weekNumber}`,
    boss.description ? `**Description:** ${boss.description}` : '',
    '',
    '**The Emberbearers who fought this week:**',
    playerList || '(Unknown heroes)',
    '',
    'Write the victory narrative for this battle.',
  ].filter(Boolean).join('\n')

  // ── 5. Call AI ─────────────────────────────────────────────────────────

  const text = await generateWithFallback({
    system: SYSTEM_PROMPT,
    user: userPrompt,
    maxTokens: 500,
    temperature: 0.9,
  })

  // ── 6. Fallback if AI failed ───────────────────────────────────────────

  if (!text) {
    console.warn('[story] AI generation failed — serving fallback')
    return fallback
  }

  // ── 7. Track usage ─────────────────────────────────────────────────────

  await incrementUsage().catch((err) =>
    console.error('[story] Failed to increment usage counter:', err),
  )

  return text
}
