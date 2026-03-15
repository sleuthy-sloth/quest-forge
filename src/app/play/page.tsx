import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { xpForLevel, xpProgressPercent, embershardState } from '@/lib/xp'
import classesData from '@/lore/classes.json'

// ── Nav grid config ──────────────────────────────────────────────────────

const NAV_ITEMS = [
  {
    href:  '/play/quests',
    label: 'Quest Board',
    icon:  (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className="w-10 h-10">
        {/* Sword */}
        <rect x="15" y="3" width="3" height="20" fill="currentColor" rx="1" />
        <rect x="9"  y="11" width="15" height="3" fill="currentColor" rx="1" />
        <rect x="13" y="23" width="7"  height="4" fill="currentColor" rx="1" />
        <circle cx="16" cy="4" r="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    href:  '/play/academy',
    label: 'Academy',
    icon:  (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className="w-10 h-10">
        {/* Open book */}
        <rect x="3"  y="7" width="12" height="18" fill="currentColor" rx="1" opacity="0.8" />
        <rect x="17" y="7" width="12" height="18" fill="currentColor" rx="1" />
        <rect x="14" y="5" width="4"  height="22" fill="currentColor" rx="1" />
        <rect x="5"  y="11" width="8" height="1.5" fill="#040812" rx="0.5" opacity="0.6" />
        <rect x="5"  y="15" width="8" height="1.5" fill="#040812" rx="0.5" opacity="0.6" />
        <rect x="5"  y="19" width="5" height="1.5" fill="#040812" rx="0.5" opacity="0.6" />
        <rect x="19" y="11" width="8" height="1.5" fill="#040812" rx="0.5" opacity="0.6" />
        <rect x="19" y="15" width="8" height="1.5" fill="#040812" rx="0.5" opacity="0.6" />
      </svg>
    ),
  },
  {
    href:  '/play/story',
    label: 'Story',
    icon:  (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className="w-10 h-10">
        {/* Scroll */}
        <rect x="7" y="4" width="18" height="24" fill="currentColor" rx="2" />
        <ellipse cx="7"  cy="9"  rx="4" ry="5" fill="currentColor" />
        <ellipse cx="25" cy="9"  rx="4" ry="5" fill="currentColor" />
        <ellipse cx="7"  cy="23" rx="4" ry="5" fill="currentColor" opacity="0.7" />
        <ellipse cx="25" cy="23" rx="4" ry="5" fill="currentColor" opacity="0.7" />
        <rect x="10" y="9"  width="12" height="1.5" fill="#040812" rx="0.5" opacity="0.5" />
        <rect x="10" y="13" width="12" height="1.5" fill="#040812" rx="0.5" opacity="0.5" />
        <rect x="10" y="17" width="8"  height="1.5" fill="#040812" rx="0.5" opacity="0.5" />
      </svg>
    ),
  },
  {
    href:  '/play/boss',
    label: 'Boss Battle',
    icon:  (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className="w-10 h-10">
        {/* Skull */}
        <ellipse cx="16" cy="13" rx="10" ry="11" fill="currentColor" />
        <rect x="9" y="21" width="14" height="8" fill="currentColor" rx="1" />
        <circle cx="12" cy="13" r="3" fill="#040812" />
        <circle cx="20" cy="13" r="3" fill="#040812" />
        <rect x="11" y="24" width="3" height="4" fill="#040812" rx="0.5" />
        <rect x="15" y="24" width="3" height="4" fill="#040812" rx="0.5" />
        <rect x="19" y="24" width="3" height="4" fill="#040812" rx="0.5" />
        <rect x="13" y="18" width="6" height="2" fill="#040812" rx="0.5" />
      </svg>
    ),
  },
  {
    href:  '/play/loot',
    label: 'Loot Store',
    icon:  (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className="w-10 h-10">
        {/* Treasure chest */}
        <rect x="4" y="16" width="24" height="13" fill="currentColor" rx="1" />
        <path d="M4 16 Q4 10 16 10 Q28 10 28 16Z" fill="currentColor" opacity="0.8" />
        <rect x="4" y="14" width="24" height="4" fill="currentColor" />
        <rect x="3" y="13" width="26" height="4" fill="currentColor" rx="1" opacity="0.6" />
        <rect x="13" y="18" width="6" height="5" fill="#040812" rx="1" opacity="0.5" />
        <circle cx="16" cy="20" r="2" fill="currentColor" opacity="0.8" />
        <rect x="7" y="18" width="3" height="2" fill="#040812" rx="0.3" opacity="0.4" />
        <rect x="22" y="18" width="3" height="2" fill="#040812" rx="0.3" opacity="0.4" />
      </svg>
    ),
  },
  {
    href:  '/play/profile',
    label: 'Character',
    icon:  (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className="w-10 h-10">
        {/* Shield */}
        <path d="M16 3 L28 8 L28 18 Q28 26 16 30 Q4 26 4 18 L4 8 Z" fill="currentColor" />
        <path d="M16 7 L24 11 L24 18 Q24 24 16 27 Q8 24 8 18 L8 11 Z" fill="#040812" opacity="0.35" />
        <path d="M16 11 L16 23 M11 17 L21 17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
      </svg>
    ),
  },
] as const

// ── Page ─────────────────────────────────────────────────────────────────

export default async function PlayHomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_class, level, xp_total, xp_available, gold, household_id')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  // First-login guard — no class chosen yet
  if (!profile.avatar_class) redirect('/play/create-character')

  // Class metadata
  const classInfo = classesData.classes.find(c => c.id === profile.avatar_class) ?? null

  // XP math
  const level       = profile.level     ?? 1
  const xpTotal     = profile.xp_total  ?? 0
  const xpAvailable = profile.xp_available ?? 0
  const gold        = profile.gold      ?? 0
  const progressPct = xpProgressPercent(xpTotal)
  const shard       = embershardState(level)
  const nextLevelXP = xpForLevel(level + 1)
  const curLevelXP  = xpForLevel(level)
  const xpIntoLevel = xpTotal - curLevelXP
  const xpNeeded    = nextLevelXP - curLevelXP

  // Active boss
  const { data: boss } = await supabase
    .from('story_chapters')
    .select('boss_name, boss_hp, boss_current_hp, title')
    .eq('household_id', profile.household_id)
    .eq('is_unlocked', false)
    .gt('boss_current_hp', 0)
    .order('week_number', { ascending: true })
    .limit(1)
    .maybeSingle()

  const bossHpPct    = boss ? Math.round((boss.boss_current_hp / boss.boss_hp) * 100) : 0
  const damageDealt  = boss ? boss.boss_hp - boss.boss_current_hp : 0

  // Class accent colour (safe fallback)
  const accent  = classInfo?.color_primary  ?? '#c9a84c'
  const accent2 = classInfo?.color_secondary ?? '#ff8c42'

  return (
    <div className="flex flex-col gap-0 min-h-full">

      {/* ── TOP SECTION ─────────────────────────────────────────────── */}
      <section
        className="relative px-5 pt-7 pb-6 overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse 120% 80% at 50% 0%, ${accent}18 0%, transparent 70%),
            linear-gradient(180deg, #0a0f1e 0%, #040812 100%)
          `,
          borderBottom: `1px solid ${accent}20`,
        }}
      >
        {/* Subtle ember glow behind name */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${accent}25 0%, transparent 70%)`,
          }}
          aria-hidden="true"
        />

        {/* Player name */}
        <h1
          className="relative text-center text-[#f0e6c8] text-3xl font-bold leading-tight mb-1"
          style={{ fontFamily: 'var(--font-heading), serif', textShadow: `0 0 24px ${accent}60` }}
        >
          {profile.display_name}
        </h1>

        {/* Class + motto */}
        {classInfo && (
          <div className="text-center mb-4">
            <p
              className="text-[0.48rem] tracking-[0.2em] uppercase mb-1"
              style={{ fontFamily: 'var(--font-pixel), monospace', color: accent2 }}
            >
              {classInfo.name}
            </p>
            <p
              className="text-[#b09a6e]/50 text-xs italic leading-snug"
              style={{ fontFamily: 'var(--font-body), serif' }}
            >
              &ldquo;{classInfo.motto}&rdquo;
            </p>
          </div>
        )}

        {/* Level badge + embershard */}
        <div className="flex items-center justify-center gap-3 mb-5">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-sm"
            style={{
              background: `${accent}18`,
              border: `1px solid ${accent}35`,
            }}
          >
            <span
              className="text-[0.42rem] tracking-widest uppercase"
              style={{ fontFamily: 'var(--font-pixel), monospace', color: accent }}
            >
              Lv
            </span>
            <span
              className="text-xl font-bold leading-none"
              style={{ fontFamily: 'var(--font-pixel), monospace', color: accent, textShadow: `0 0 12px ${accent}80` }}
            >
              {level}
            </span>
            <span
              className="text-[#b09a6e]/60 text-[0.42rem] tracking-wider"
              style={{ fontFamily: 'var(--font-pixel), monospace' }}
            >
              ·
            </span>
            <span
              className="text-[0.42rem] tracking-widest"
              style={{ fontFamily: 'var(--font-pixel), monospace', color: `${accent}cc` }}
            >
              {shard.toUpperCase()}
            </span>
          </div>
        </div>

        {/* XP progress bar */}
        <div className="mb-4">
          {/* Bar labels */}
          <div className="flex justify-between items-baseline mb-1.5 px-0.5">
            <span
              className="text-[0.4rem] tracking-widest text-[#b09a6e]/45 uppercase"
              style={{ fontFamily: 'var(--font-pixel), monospace' }}
            >
              XP
            </span>
            <span
              className="text-[0.4rem] tracking-wide"
              style={{ fontFamily: 'var(--font-pixel), monospace', color: `${accent}90` }}
            >
              {xpIntoLevel} / {xpNeeded}
            </span>
          </div>

          {/* Pixel-style bar track */}
          <div
            className="relative w-full overflow-hidden"
            style={{
              height: 14,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.4)',
              imageRendering: 'pixelated',
            }}
          >
            {/* Filled portion */}
            <div
              style={{
                position: 'absolute',
                inset: '2px',
                width: `calc(${Math.min(progressPct, 100)}% - 4px)`,
                background: `linear-gradient(90deg, #c95a00, #ff7c1f, #ffa040)`,
                boxShadow: '0 0 8px rgba(255,120,0,0.5)',
                transition: 'width 0.6s ease',
              }}
            />
            {/* Pixel tick marks every 25% */}
            {[25, 50, 75].map(tick => (
              <div
                key={tick}
                className="absolute top-0 bottom-0 w-px"
                style={{ left: `${tick}%`, background: 'rgba(0,0,0,0.35)' }}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>

        {/* Currency counters */}
        <div className="flex justify-center gap-6">
          {/* XP available */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-sm"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {/* Gem icon */}
            <svg viewBox="0 0 16 16" className="w-4 h-4 flex-shrink-0" style={{ imageRendering: 'pixelated' }} aria-hidden="true">
              <polygon points="8,1 14,6 14,10 8,15 2,10 2,6" fill="#6eb5ff" stroke="#3a7acc" strokeWidth="0.5" />
              <polygon points="8,1 14,6 8,7 2,6" fill="#9fd0ff" opacity="0.8" />
              <line x1="2" y1="6" x2="14" y2="6" stroke="#3a7acc" strokeWidth="0.5" />
            </svg>
            <div>
              <p
                className="text-[0.38rem] text-[#b09a6e]/45 tracking-widest uppercase leading-none mb-0.5"
                style={{ fontFamily: 'var(--font-pixel), monospace' }}
              >
                XP
              </p>
              <p
                className="text-sm font-bold text-[#9fd0ff] leading-none"
                style={{ fontFamily: 'var(--font-pixel), monospace' }}
              >
                {xpAvailable.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Gold */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-sm"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {/* Coin icon */}
            <svg viewBox="0 0 16 16" className="w-4 h-4 flex-shrink-0" style={{ imageRendering: 'pixelated' }} aria-hidden="true">
              <circle cx="8" cy="8" r="6.5" fill="#c9a84c" stroke="#9c7b2e" strokeWidth="0.5" />
              <circle cx="8" cy="8" r="4.5" fill="#e8c55a" opacity="0.7" />
              <text x="8" y="11" textAnchor="middle" fontSize="6" fill="#9c7b2e" fontWeight="bold">G</text>
            </svg>
            <div>
              <p
                className="text-[0.38rem] text-[#b09a6e]/45 tracking-widest uppercase leading-none mb-0.5"
                style={{ fontFamily: 'var(--font-pixel), monospace' }}
              >
                Gold
              </p>
              <p
                className="text-sm font-bold text-[#c9a84c] leading-none"
                style={{ fontFamily: 'var(--font-pixel), monospace' }}
              >
                {gold.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── MIDDLE SECTION — Boss ────────────────────────────────────── */}
      <section className="px-5 py-5">
        {boss ? (
          <div
            className="rounded-sm overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(200,40,40,0.2)',
            }}
          >
            <div className="px-4 py-3">
              {/* Boss header */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p
                    className="text-[0.38rem] text-red-400/50 tracking-[0.25em] uppercase leading-none mb-1"
                    style={{ fontFamily: 'var(--font-pixel), monospace' }}
                  >
                    Current Threat
                  </p>
                  <p
                    className="text-[#f0e6c8]/90 font-semibold leading-tight"
                    style={{ fontFamily: 'var(--font-heading), serif', fontSize: '0.95rem' }}
                  >
                    {boss.boss_name ?? boss.title}
                  </p>
                </div>
                <span
                  className="text-[0.42rem] px-2 py-1 rounded-sm mt-0.5"
                  style={{
                    fontFamily: 'var(--font-pixel), monospace',
                    color: 'rgba(255,100,80,0.8)',
                    background: 'rgba(200,40,40,0.1)',
                    border: '1px solid rgba(200,40,40,0.2)',
                  }}
                >
                  {bossHpPct}% HP
                </span>
              </div>

              {/* HP bar */}
              <div className="mb-3">
                <div
                  className="relative w-full"
                  style={{
                    height: 16,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.5)',
                    imageRendering: 'pixelated',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: '2px',
                      width: `calc(${bossHpPct}% - 4px)`,
                      background: bossHpPct > 50
                        ? 'linear-gradient(90deg, #8b1010, #d42020, #ff3b3b)'
                        : bossHpPct > 25
                          ? 'linear-gradient(90deg, #8b4500, #d47000, #ff9020)'
                          : 'linear-gradient(90deg, #6b0000, #b00000, #ff2020)',
                      boxShadow: '0 0 8px rgba(220,40,40,0.6)',
                      transition: 'width 0.6s ease',
                    }}
                  />
                  {/* Segment ticks */}
                  {[25, 50, 75].map(tick => (
                    <div
                      key={tick}
                      className="absolute top-0 bottom-0 w-px"
                      style={{ left: `${tick}%`, background: 'rgba(0,0,0,0.4)' }}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                {/* HP numbers */}
                <div className="flex justify-between mt-1 px-0.5">
                  <span
                    className="text-[0.38rem] text-red-400/45"
                    style={{ fontFamily: 'var(--font-pixel), monospace' }}
                  >
                    {boss.boss_current_hp.toLocaleString()} HP remaining
                  </span>
                  <span
                    className="text-[0.38rem] text-[#b09a6e]/35"
                    style={{ fontFamily: 'var(--font-pixel), monospace' }}
                  >
                    {boss.boss_hp.toLocaleString()} max
                  </span>
                </div>
              </div>

              {/* Damage dealt */}
              <p
                className="text-center text-[0.42rem] tracking-wide"
                style={{ fontFamily: 'var(--font-pixel), monospace', color: 'rgba(255,140,80,0.65)' }}
              >
                ⚔ Your household has dealt {damageDealt.toLocaleString()} damage!
              </p>
            </div>
          </div>
        ) : (
          <div
            className="rounded-sm px-4 py-4 text-center"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px dashed rgba(255,255,255,0.08)',
            }}
          >
            <p
              className="text-[0.42rem] text-[#b09a6e]/35 tracking-widest"
              style={{ fontFamily: 'var(--font-pixel), monospace' }}
            >
              No active threat — the realm is at peace.
            </p>
          </div>
        )}
      </section>

      {/* ── BOTTOM SECTION — Navigation grid ────────────────────────── */}
      <section className="px-4 pb-6 flex-1">
        <p
          className="text-[0.38rem] tracking-[0.25em] text-[#b09a6e]/35 uppercase text-center mb-4"
          style={{ fontFamily: 'var(--font-pixel), monospace' }}
        >
          Where to next?
        </p>

        <div className="grid grid-cols-3 gap-3">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative flex flex-col items-center justify-center
                rounded-sm gap-2 transition-all duration-150 active:scale-95"
              style={{
                minHeight: 96,
                background: 'rgba(255,255,255,0.028)',
                border: '1px solid rgba(201,168,76,0.1)',
              }}
            >
              {/* Hover glow */}
              <span
                className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 50% 40%, ${accent}14, transparent 70%)` }}
                aria-hidden="true"
              />

              {/* Icon */}
              <span
                className="relative text-[#c9a84c]/70 group-hover:text-[#c9a84c] transition-colors duration-150"
                style={{ imageRendering: 'pixelated' }}
              >
                {item.icon}
              </span>

              {/* Label */}
              <span
                className="relative text-[0.38rem] tracking-widest uppercase text-[#b09a6e]/55 group-hover:text-[#c9a84c]/80 transition-colors duration-150"
                style={{ fontFamily: 'var(--font-pixel), monospace' }}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

    </div>
  )
}
