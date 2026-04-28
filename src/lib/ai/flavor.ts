import { generateWithFallback } from './client'
import { canMakeRequest, incrementUsage } from './rate-limiter'

// ── Fallback template bank ────────────────────────────────────────────────────
// Each entry: keywords to match against (chore title + description, lowercase),
// and the fantasy quest flavor text to return.

interface FlavorTemplate {
  keywords: string[]
  text: string
}

export const FLAVOR_TEMPLATES: FlavorTemplate[] = [
  // ── Kitchen ──────────────────────────────────────────────────────────────────
  {
    keywords: ['dish', 'dishes', 'wash dish', 'washing dish', 'dishwasher load', 'dishwasher unload'],
    text: 'The enchanted cookware of Embervale grows restless with the residue of countless feasts! Venture to the Cleansing Pool, where the sacred waters await, and restore each vessel to its gleaming glory. Leave not a single goblet clouded, lest the ancient Grease Sprites multiply and spread their sticky curse through the Hearthhold.',
  },
  {
    keywords: ['unload dishwasher', 'empty dishwasher', 'put away dishes'],
    text: 'The great Purification Chamber has completed its ritual! The enchanted vessels, now cleansed of all corruption, await a steady hand to guide them back to their rightful places upon the sacred shelves. Return each goblet, plate, and pot to its proper resting place so the Hearthhold may feast again.',
  },
  {
    keywords: ['load dishwasher', 'fill dishwasher'],
    text: 'The great Purification Chamber stands empty, hungry for its duty! Gather every soiled vessel from across the Hearthhold and arrange them in the sacred racks within. Only through perfect placement may the cleansing ritual begin and the cookware be restored to its former glory.',
  },
  {
    keywords: ['cook', 'cooking', 'make dinner', 'make lunch', 'make breakfast', 'prepare meal', 'prepare food'],
    text: 'The Hearthhold hungers, and the fires of the sacred kitchen must be lit! Call upon your knowledge of culinary alchemy to transform raw ingredients into a magnificent feast worthy of the mightiest adventurers. Season with courage, stir with patience, and present the finished creation to those who await sustenance.',
  },
  {
    keywords: ['set table', 'setting table', 'table setting'],
    text: 'Before the great feast may commence, the Banquet Hall must be prepared! Lay the ceremonial cloth, position each plate and goblet with precision, and arrange the silverware as the ancient traditions demand. Only a properly prepared table may honor the meal and those who gather to share it.',
  },
  {
    keywords: ['clear table', 'clearing table', 'wipe table', 'wipe down table'],
    text: 'The feast has ended, and the Banquet Hall must be restored to its former dignity! Clear away the remnants of the celebration, gather every vessel and utensil, and purify the great table so it stands ready for the next gathering of your noble household.',
  },
  {
    keywords: ['wipe counter', 'wipe counters', 'kitchen counter', 'clean counter'],
    text: 'The alchemical workbenches of the kitchen bear the marks of great culinary experiments! Arm yourself with the Cloth of Cleansing and banish every crumb, splash, and smear from the sacred surfaces. A clean workspace is the foundation of all great culinary magic.',
  },

  // ── Cleaning ─────────────────────────────────────────────────────────────────
  {
    keywords: ['vacuum', 'vacuuming', 'hoover'],
    text: 'Dark forces have scattered debris across the floors of the Hearthhold! Wield the mighty Suction Vortex — an ancient relic that devours dust and banishes grime to the void — and sweep every chamber until the ground gleams underfoot. No crumb shall escape your righteous passage.',
  },
  {
    keywords: ['sweep', 'sweeping', 'broom'],
    text: 'Dust and debris have conspired to defile the sacred floors of Embervale Manor! Take up the enchanted broom and guide the impurities into a single pile, then banish them forever from the realm. Leave no corner unchallenged, no doorway ignored.',
  },
  {
    keywords: ['mop', 'mopping', 'mop floor', 'mop the floor'],
    text: 'Even after the broom has done its work, a deeper corruption lingers upon the stone! The Mop of Purification must be drawn across every flagstone, imbued with the sacred cleansing solution, until the floors shine like still water under moonlight. Let no muddy footprint survive your vigil.',
  },
  {
    keywords: ['bathroom', 'toilet', 'scrub toilet', 'clean bathroom'],
    text: 'The Purification Chambers of the Hearthhold have fallen to corruption and must be reclaimed! Arm yourself with the sacred scrubbing tools and the alchemical cleansing solutions. Scour every surface, banish every stain, and restore this vital chamber to a state of radiant cleanliness worthy of the household\'s champions.',
  },
  {
    keywords: ['clean room', 'tidy room', 'bedroom', 'pick up room', 'straighten room'],
    text: 'Your personal Adventurer\'s Quarters have fallen into disarray after countless quests and celebrations! Items lie scattered where battles were planned, treasures rest unprotected on the floor. Restore order to your domain — return every artifact to its proper place and make your quarters worthy of the great hero who dwells within.',
  },
  {
    keywords: ['make bed', 'making bed', 'bed'],
    text: 'The sleeping platform where you restore your strength between quests lies in chaos! Smooth the enchanted linens, align the pillows of comfort, and fold back the great protective cover with military precision. A properly made resting place restores morale and signals that the day\'s adventures may truly begin.',
  },
  {
    keywords: ['dust', 'dusting', 'dust furniture'],
    text: 'Centuries of magical residue — disguised as mere dust — has settled upon every surface in the Hearthhold! Take up the feathered implement and drive this invisible enemy from every shelf, table, and ledge. Be thorough, for dust left undisturbed grows bold and seeks to multiply in the shadows.',
  },
  {
    keywords: ['window', 'windows', 'clean windows', 'wash windows'],
    text: 'The great crystal viewing portals of the Hearthhold have been clouded by the elements! Apply the sacred transparency solution and polish each pane until the outside world shines through without distortion. Clear windows let in the light of clarity and ward against the gloom that breeds in dark places.',
  },
  {
    keywords: ['mirror', 'clean mirror', 'wipe mirror'],
    text: 'The enchanted reflection portals have grown clouded, obscuring the true visage of all who gaze within! Armed with the crystal-clear solution and polishing cloth, restore each mirror to perfect clarity — for a hero must always see themselves clearly before embarking on the day\'s quests.',
  },

  // ── Laundry ───────────────────────────────────────────────────────────────────
  {
    keywords: ['laundry', 'wash clothes', 'washing clothes', 'do laundry'],
    text: 'The great Cloth Purification ritual must be performed! Gather the battle-worn garments from across the Hearthhold, sort them by color and material as the ancient washers\' code demands, and entrust them to the mighty Washing Vortex. When the ritual is complete, the adventurers\' garments shall be restored to their former freshness.',
  },
  {
    keywords: ['fold clothes', 'folding clothes', 'fold laundry', 'fold the laundry'],
    text: 'The freshly purified garments await skilled hands to restore them to proper form! Each shirt must be folded with geometric precision, each pair of trousers aligned along its natural crease. This is a meditative practice — the folding of cloth — that separates the disciplined adventurer from the chaotic wanderer.',
  },
  {
    keywords: ['put away clothes', 'hang clothes', 'put laundry away', 'put clothes away'],
    text: 'The purified and folded garments must now be returned to their proper places of safekeeping! Each item belongs in a specific drawer or upon a designated hanger within the wardrobe vault. Perform this task with care, and your adventuring gear will always be at hand when the next quest calls you forth.',
  },
  {
    keywords: ['iron', 'ironing', 'iron clothes'],
    text: 'The garments bear the marks of their journey through the washing ritual — wrinkled and creased where they ought to flow smooth! Wield the mighty Steam Blade across every fold and crease until the fabric surrenders its wrinkles. A hero in pressed attire commands far more respect in the courts of Embervale.',
  },

  // ── Waste & Recycling ─────────────────────────────────────────────────────────
  {
    keywords: ['trash', 'garbage', 'take out trash', 'empty trash', 'bin'],
    text: 'A great corruption spreads through the Hearthhold — the Foul Remnants have accumulated and must be expelled before they poison the realm! Gather every bag of corruption, carry them beyond the settlement\'s borders, and seal them within the Iron Receptacle that stands at the edge of your domain. Act before the corruption spreads further!',
  },
  {
    keywords: ['recycl', 'recycle', 'recycling'],
    text: 'The alchemists of Embervale have decreed that certain materials may be reborn through the great Recycling Ritual! Gather the glass, metal, and parchment designated for transformation, separate them as the guild laws demand, and deliver them to the sacred collection point. Through your actions, waste becomes resource and the realm grows stronger.',
  },
  {
    keywords: ['compost', 'composting'],
    text: 'The earth-shamans speak of a sacred cycle — where the remains of feasts may be returned to the soil to nurture new growth! Gather the organic remnants designated for transformation and carry them to the composting shrine. In time, your offering will become rich earth that feeds the gardens of Embervale.',
  },

  // ── Yard & Outdoors ───────────────────────────────────────────────────────────
  {
    keywords: ['mow', 'mow lawn', 'mow the lawn', 'cut grass', 'cut the grass'],
    text: 'The grasses of the Hearthhold\'s outer grounds have grown wild and unruly, threatening to reclaim the cultivated lands for the wilderness! Mount the great Blade Carriage and guide it in precise formation across every inch of turf until the grounds are tamed and orderly once more. The realm\'s dignity depends upon well-kept borders.',
  },
  {
    keywords: ['rake', 'rake leaves', 'raking', 'leaves'],
    text: 'The ancient trees have shed their autumn cloaks, blanketing the grounds in a tide of fallen glory! Take up the gathering rake and herd these wanderers into great piles, then collect them for the composting shrine or the void beyond the walls. The grounds must be cleared before the next frost claims the realm.',
  },
  {
    keywords: ['water plant', 'water the plant', 'water garden', 'watering', 'plants'],
    text: 'The green guardians of the Hearthhold — ancient plant spirits in leafy form — call out for sustenance! Carry the vessel of life-giving water to each plant spirit in turn, offering enough to satisfy but not so much as to drown their delicate roots. A gardener\'s steady hand keeps these guardians strong and the air of Embervale pure.',
  },
  {
    keywords: ['garden', 'gardening', 'weed', 'weeding', 'pull weeds'],
    text: 'Chaos plants — the Weed Invaders — have infiltrated the sacred garden and seek to strangle the legitimate inhabitants! Arm yourself with gloves and courage, then root out every interloper with firm conviction. The garden shall not fall to these wild usurpers while a vigilant champion stands watch.',
  },
  {
    keywords: ['shovel snow', 'shoveling', 'snow', 'clear snow', 'clear driveway'],
    text: 'The Winter Sovereign has blanketed the paths of Embervale in impenetrable white! Wield the great Snow Blade and carve a clear path through the frozen obstacle. The Hearthhold\'s roads must remain passable for all who journey to and from your realm — no frost shall bar the way while you stand ready.',
  },

  // ── Pets ─────────────────────────────────────────────────────────────────────
  {
    keywords: ['feed pet', 'feed dog', 'feed cat', 'pet food', 'animal', 'feed the'],
    text: 'Your loyal animal companion — a brave creature that guards the Hearthhold and offers its friendship freely — awaits its daily sustenance! Prepare the ceremonial meal bowl and present it with the respect owed to a trusted ally. A well-fed companion is a happy companion, and a happy companion is the mightiest guardian.',
  },
  {
    keywords: ['walk dog', 'walk the dog', 'dog walk', 'take dog out'],
    text: 'Your canine champion grows restless within the walls of the Hearthhold, yearning for the open roads of Embervale! Equip the ceremonial lead and escort your four-legged ally on a patrol of the surrounding territory. This daily expedition keeps your companion sharp, happy, and ready for whatever threats may emerge.',
  },
  {
    keywords: ['clean litter', 'litter box', 'cat litter', 'scoop litter'],
    text: 'The feline sovereign of your household has graced their sacred sand chamber, and now tradition demands that the waste be removed! Wield the ceremonial scooping tool and clear the chamber of all corruption. Your fastidious companion will reward this service with the most profound gratitude — or at minimum, slightly less judgment in their gaze.',
  },
  {
    keywords: ['bathe pet', 'wash dog', 'groom', 'grooming'],
    text: 'Your loyal companion has returned from adventuring in the wild and carries the evidence of their exploits upon their coat! Prepare the Cleansing Basin, gather the enchanted grooming implements, and restore your companion to the dignified appearance befitting a household guardian of their prestigious rank.',
  },

  // ── Learning ──────────────────────────────────────────────────────────────────
  {
    keywords: ['homework', 'home work', 'school work', 'assignment'],
    text: 'The Lorescribes have issued scrolls of knowledge that must be studied and completed before the next sunrise! Open each assignment and apply your full intellectual might to every problem and question within. Every completed lesson brings you closer to true mastery and opens new paths of power in Embervale\'s grand adventure.',
  },
  {
    keywords: ['read', 'reading', 'read book', 'study'],
    text: 'The great Library of Embervale holds wisdom that cannot be gained through swords or spells alone! Open the chosen tome and let the words carry your mind across distant lands and through the ages. Each page turned adds to your vast reservoir of knowledge — the most powerful weapon any adventurer can possess.',
  },
  {
    keywords: ['math', 'mathematics', 'practice math', 'math drill'],
    text: 'The ancient Numeromancers have left behind codices of numerical power, and their secrets must be mastered! Work through each equation and formula as an alchemist refines ore — with patience, precision, and unflinching focus. Those who command numbers command the unseen forces that govern trade, construction, and strategy throughout the realm.',
  },
  {
    keywords: ['practice instrument', 'practice music', 'piano', 'guitar', 'violin', 'instrument'],
    text: 'The sacred bardic arts demand daily devotion lest the skill grow rusty and the magic fade! Take up your instrument and let the notes flow through the chambers of the Hearthhold. Every session of practice deepens the enchantment, and one day your mastery will move the hearts of all who hear you perform.',
  },

  // ── Organisation & Chores ─────────────────────────────────────────────────────
  {
    keywords: ['organiz', 'sort', 'tidy', 'declutter', 'clean up'],
    text: 'Chaos has crept into a corner of the Hearthhold while the household\'s champions were busy with greater quests! Now it falls to a diligent hero to impose order upon the disorder — sorting, stacking, and returning each item to its rightful place. An organized Hearthhold is a fortress that chaos cannot breach.',
  },
  {
    keywords: ['groceries', 'grocery', 'put away groceries', 'shopping'],
    text: 'A great expedition to the Market District has returned bearing provisions! The supplies must be correctly catalogued and stored before spoilage claims any of the precious cargo. Organize every item by its nature — cold things to the ice vault, dry goods to the pantry shelves — so the Hearthhold remains well-stocked for the weeks ahead.',
  },

  // ── Errands & General ─────────────────────────────────────────────────────────
  {
    keywords: ['clean car', 'wash car', 'vacuum car'],
    text: 'Your travelling carriage, faithful vehicle of a hundred journeys, has accumulated the dust and debris of many roads! Clean and restore this trusted conveyance — scrub its hull, purify its interior, and make it worthy once again of carrying your household\'s champions from adventure to adventure across the realm.',
  },
  {
    keywords: ['help', 'assist', 'chore', 'task', 'job'],
    text: 'A worthy task has appeared on the quest board of the Hearthhold, calling for a capable and willing champion! Rise to meet this challenge with full determination — for every deed of service to the household, however humble it may appear, strengthens the bonds that hold the Hearthhold together and earns the respect of all within.',
  },
]

const GENERIC_FALLBACK =
  'A worthy quest has appeared on the Hearthhold\'s board, calling for a capable champion to step forward! Rise to this challenge with determination and skill. Complete the task faithfully, for every deed of service to the household — however humble it may appear — strengthens the bonds of the Hearthhold and brings glory to all who dwell within.'

export function getFallbackFlavorText(choreTitle: string, choreDescription = ''): string {
  const haystack = `${choreTitle} ${choreDescription}`.toLowerCase()

  for (const template of FLAVOR_TEMPLATES) {
    if (template.keywords.some(kw => haystack.includes(kw))) {
      return template.text
    }
  }

  return GENERIC_FALLBACK
}

// ── AI prompt ─────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a quest scribe for the fantasy kingdom of Embervale. Your role is to transform mundane household chores into epic fantasy quest descriptions for children aged 6–16.

Rules:
- Write 2–3 vivid sentences in a heroic RPG style
- Never mention the real-world chore by name — describe it only in fantasy terms
- Keep language age-appropriate and exciting, not scary
- Use Embervale-specific terminology: "Hearthhold" (home), "Emberbearer" (hero), "the realm" (neighborhood/world)
- End with a sense of purpose or reward
- Output ONLY the quest description text, no titles, no quotes, no preamble`

// ── Main export ───────────────────────────────────────────────────────────────

export async function generateFlavorText(
  choreTitle: string,
  choreDescription = ''
): Promise<string> {
  const fallback = getFallbackFlavorText(choreTitle, choreDescription)

  const allowed = await canMakeRequest().catch(() => false)
  if (!allowed) {
    console.warn('[flavor] Daily AI limit reached — serving fallback')
    return fallback
  }

  const userPrompt = choreDescription.trim()
    ? `Chore: "${choreTitle}"\nDetails: "${choreDescription}"`
    : `Chore: "${choreTitle}"`

  const text = await generateWithFallback({
    system: SYSTEM_PROMPT,
    user: userPrompt,
    maxTokens: 400,  // Some models include thinking before the answer; extra budget prevents truncation
    temperature: 0.85,
  })

  if (!text) {
    return fallback
  }

  await incrementUsage().catch(err =>
    console.error('[flavor] Failed to increment usage counter:', err)
  )

  return text
}
