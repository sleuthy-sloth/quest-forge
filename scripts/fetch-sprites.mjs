#!/usr/bin/env node

/**
 * fetch-sprites.mjs — Downloads LPC sprite assets from the Universal LPC
 * Spritesheet Character Generator repo and saves them to the paths expected
 * by Quest Forge's sprite manifest.
 *
 * Key findings about the LPC repo structure:
 *   - Bodies: spritesheets/body/bodies/{type}/{animation}.png
 *   - Hair (simple): spritesheets/hair/{style}/adult/walk.png
 *   - Hair (layered): spritesheets/hair/{style}/adult/fg/walk.png + bg/walk.png
 *   - Clothing: spritesheets/{category}/{style}/{variant}/{animation}/{color}.png
 *     where variant is "male" or "thin" (thin = female)
 *   - Color variants are in subdirectories: walk/black.png, walk/blue.png, etc.
 *   - Base (uncolored) version is at: walk.png (no color subdirectory)
 *
 * Usage:
 *   node scripts/fetch-sprites.mjs           # download all
 *   node scripts/fetch-sprites.mjs --bodies   # only bodies
 *   node scripts/fetch-sprites.mjs --hair     # only hair
 *   node scripts/fetch-sprites.mjs --clothing # only clothing
 *   node scripts/fetch-sprites.mjs --weapons  # only weapons
 *   node scripts/fetch-sprites.mjs --bosses   # only bosses
 *   node scripts/fetch-sprites.mjs --placeholders # only placeholders
 *
 * Requires: sharp (npm install --save-dev sharp)
 *
 * License: All downloaded assets are dual-licensed CC-BY-SA 3.0 / GPL 3.0
 * per the Liberated Pixel Cup. See CREDITS.md for attribution details.
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SPRITES_DIR = join(ROOT, 'public', 'sprites')

const LPC_BASE =
  'https://raw.githubusercontent.com/LiberatedPixelCup/Universal-LPC-Spritesheet-Character-Generator/master/spritesheets'

const STANDARD_COLORS = [
  'black', 'bluegray', 'blue', 'brown', 'charcoal', 'forest', 'gray',
  'green', 'lavender', 'leather', 'maroon', 'navy', 'orange', 'pink',
  'purple', 'red', 'rose', 'sky', 'slate', 'tan', 'teal', 'walnut',
  'white', 'yellow',
]

const METAL_COLORS = [
  'brass', 'bronze', 'ceramic', 'copper', 'gold', 'iron', 'silver', 'steel',
]

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function ensureDir(filePath) {
  const dir = dirname(filePath)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}

async function download(url, dest) {
  if (existsSync(dest)) {
    console.log(`  ✓ (cached) ${dest.replace(ROOT + '/', '')}`)
    return true
  }

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'QuestForge-SpriteFetcher/1.0' },
      })
      if (!res.ok) {
        if (attempt === 1) console.log(`  ✗ ${res.status} ${url.replace(LPC_BASE + '/', '')}`)
        return false
      }
      const buf = Buffer.from(await res.arrayBuffer())
      ensureDir(dest)
      writeFileSync(dest, buf)
      console.log(`  ✓ ${dest.replace(ROOT + '/', '')}`)
      return true
    } catch (err) {
      if (attempt === 3) {
        console.log(`  ✗ Failed after 3 attempts: ${url}`)
        return false
      }
      await new Promise(r => setTimeout(r, 1000 * attempt))
    }
  }
  return false
}

async function createPlaceholder(outputPath, width = 64, height = 64) {
  const sharp = (await import('sharp')).default
  ensureDir(outputPath)

  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .png()
    .toFile(outputPath)

  console.log(`  ○ Placeholder: ${outputPath.replace(ROOT + '/', '')}`)
}

/**
 * Download a sprite from the LPC repo, trying multiple URL patterns.
 * Returns true if successful, false otherwise.
 */
async function tryDownload(urlPatterns, dest) {
  for (const url of urlPatterns) {
    const result = await download(url, dest)
    if (result) return true
  }
  return false
}

// ---------------------------------------------------------------------------
// Download: Bodies
// ---------------------------------------------------------------------------

async function downloadBodies() {
  console.log('\n📦 Downloading body sprites...')

  const bodies = [
    { id: 'female', paths: ['body/bodies/female/walk.png'], output: 'bodies/female_walkcycle.png' },
    { id: 'male', paths: ['body/bodies/male/walk.png'], output: 'bodies/male_walkcycle.png' },
    { id: 'princess', paths: ['body/bodies/pregnant/walk.png'], output: 'bodies/princess.png' },
    { id: 'soldier', paths: ['body/bodies/muscular/walk.png'], output: 'bodies/soldier.png' },
  ]

  const extraBodies = [
    { path: 'body/bodies/male/slash.png', output: 'bodies/male_slash.png' },
    { path: 'body/bodies/male/spellcast.png', output: 'bodies/male_spellcast.png' },
    { path: 'body/bodies/male/hurt.png', output: 'bodies/male_hurt.png' },
    { path: 'body/bodies/male/walk.png', output: 'bodies/male_pants.png' },
    { path: 'body/bodies/female/slash.png', output: 'bodies/female_slash.png' },
    { path: 'body/bodies/female/spellcast.png', output: 'bodies/female_spellcast.png' },
    { path: 'body/bodies/female/hurt.png', output: 'bodies/female_hurt.png' },
  ]

  for (const asset of bodies) {
    const outputPath = join(SPRITES_DIR, asset.output)
    const urls = asset.paths.map(p => `${LPC_BASE}/${p}`)
    const ok = await tryDownload(urls, outputPath)
    if (!ok) await createPlaceholder(outputPath)
  }

  for (const asset of extraBodies) {
    const outputPath = join(SPRITES_DIR, asset.output)
    const url = `${LPC_BASE}/${asset.path}`
    const ok = await download(url, outputPath)
    if (!ok) await createPlaceholder(outputPath)
  }
}

// ---------------------------------------------------------------------------
// Download: Hair
// ---------------------------------------------------------------------------

// Hair styles that have fg/bg layers (long hair that goes behind the body)
const LAYERED_HAIR_STYLES = new Set([
  'braid', 'braid2', 'bangs_bun', 'half_up', 'high_ponytail',
  'long_band', 'long_center_part', 'long_tied', 'pigtails', 'pigtails_bangs',
  'sara', 'curtains_long', 'dreadlocks_long', 'long_messy', 'long_messy2',
])

async function downloadHair() {
  console.log('\n📦 Downloading hair sprites...')

  const styles = [
    'afro', 'balding', 'bangs_bun', 'bob', 'bob_side_part',
    'braid', 'braid2', 'buzzcut', 'cornrows', 'cowlick',
    'cowlick_tall', 'curly_long', 'curly_short', 'curtains',
    'curtains_long', 'dreadlocks_long', 'dreadlocks_short',
    'flat_top_fade', 'flat_top_straight', 'half_up', 'halfmessy',
    'high_and_tight', 'high_ponytail', 'idol', 'lob',
    'long_band', 'long_center_part', 'long_messy', 'long_messy2',
    'long_tied', 'messy3', 'mop', 'natural', 'part2',
    'pigtails', 'pigtails_bangs', 'sara', 'spiked', 'spiked2',
    'spiked_beehive', 'spiked_liberty', 'spiked_liberty2',
    'spiked_porcupine', 'twists_fade', 'twists_straight',
  ]

  for (const style of styles) {
    const isLayered = LAYERED_HAIR_STYLES.has(style)

    // For each style, we need both female and male variants.
    // In the LPC repo, most hair uses "adult" which works for both.
    // Layered styles have fg/bg subdirectories.
    for (const variant of ['female', 'male']) {
      const outputPath = join(SPRITES_DIR, 'hair', 'hair', style, `${variant}.png`)

      if (existsSync(outputPath)) {
        console.log(`  ✓ (cached) hair/hair/${style}/${variant}.png`)
        continue
      }

      let urls
      if (isLayered) {
        // Use the fg (foreground) layer as the main sprite
        urls = [
          `${LPC_BASE}/hair/${style}/adult/fg/walk.png`,
          `${LPC_BASE}/hair/${style}/adult/walk.png`,
        ]
      } else {
        urls = [
          `${LPC_BASE}/hair/${style}/adult/walk.png`,
        ]
      }

      const ok = await tryDownload(urls, outputPath)
      if (!ok) await createPlaceholder(outputPath)
    }
  }
}

// ---------------------------------------------------------------------------
// Download: Clothing (feet, legs, torso)
// ---------------------------------------------------------------------------

async function downloadClothing() {
  console.log('\n📦 Downloading clothing sprites...')

  // --- Feet ---
  const feetAssets = [
    // id, lpcDir, hasMale, hasFemale (thin), colors
    { id: 'boots', lpcDir: 'feet/boots/basic', male: 'male', female: 'thin', colors: STANDARD_COLORS },
    { id: 'shoes', lpcDir: 'feet/shoes/basic', male: 'male', female: 'thin', colors: STANDARD_COLORS },
    { id: 'sandals', lpcDir: 'feet/sandals', male: 'male', female: 'thin', colors: STANDARD_COLORS },
    { id: 'slippers', lpcDir: 'feet/slippers', male: 'male', female: 'thin', colors: STANDARD_COLORS },
    { id: 'ghillies', lpcDir: 'feet/shoes/ghillies', male: 'male', female: 'thin', colors: STANDARD_COLORS },
    { id: 'plate_boots', lpcDir: 'feet/armour/plate', male: 'male', female: 'thin', colors: METAL_COLORS },
  ]

  for (const asset of feetAssets) {
    for (const color of asset.colors) {
      // Female (thin) variant
      const femaleOutput = join(SPRITES_DIR, 'clothing', 'feet', asset.id, 'female', `${color}.png`)
      if (!existsSync(femaleOutput)) {
        const urls = [
          `${LPC_BASE}/${asset.lpcDir}/${asset.female}/walk/${color}.png`,
          `${LPC_BASE}/${asset.lpcDir}/${asset.female}/walk.png`,
        ]
        const ok = await tryDownload(urls, femaleOutput)
        if (!ok) await createPlaceholder(femaleOutput)
      }

      // Male variant
      const maleOutput = join(SPRITES_DIR, 'clothing', 'feet', asset.id, 'male', `${color}.png`)
      if (!existsSync(maleOutput)) {
        const urls = [
          `${LPC_BASE}/${asset.lpcDir}/${asset.male}/walk/${color}.png`,
          `${LPC_BASE}/${asset.lpcDir}/${asset.male}/walk.png`,
        ]
        const ok = await tryDownload(urls, maleOutput)
        if (!ok) await createPlaceholder(maleOutput)
      }
    }
  }

  // --- Legs ---
  // The LPC repo has legs under spritesheets/legs/
  // Let me check the actual paths
  const legsDir = await fetchLpcDirStructure('legs')
  // For now, download what we can
  const legsAssets = [
    { id: 'pants', lpcDir: 'legs/pants', male: 'male', female: 'female', colors: STANDARD_COLORS },
    { id: 'plate_legs', lpcDir: 'legs/armour/plate', male: 'male', female: 'female', colors: METAL_COLORS },
  ]

  for (const asset of legsAssets) {
    for (const color of asset.colors) {
      const femaleOutput = join(SPRITES_DIR, 'clothing', 'legs', asset.id, 'female', `${color}.png`)
      if (!existsSync(femaleOutput)) {
        const urls = [
          `${LPC_BASE}/${asset.lpcDir}/${asset.female}/walk/${color}.png`,
          `${LPC_BASE}/${asset.lpcDir}/${asset.female}/walk.png`,
        ]
        const ok = await tryDownload(urls, femaleOutput)
        if (!ok) await createPlaceholder(femaleOutput)
      }

      const maleOutput = join(SPRITES_DIR, 'clothing', 'legs', asset.id, 'male', `${color}.png`)
      if (!existsSync(maleOutput)) {
        const urls = [
          `${LPC_BASE}/${asset.lpcDir}/${asset.male}/walk/${color}.png`,
          `${LPC_BASE}/${asset.lpcDir}/${asset.male}/walk.png`,
        ]
        const ok = await tryDownload(urls, maleOutput)
        if (!ok) await createPlaceholder(maleOutput)
      }
    }
  }

  // --- Torso ---
  const torsoAssets = [
    { id: 'longsleeve', lpcDir: 'torso/clothes/longsleeve', male: 'male', female: 'female', colors: STANDARD_COLORS },
    { id: 'shortsleeve', lpcDir: 'torso/clothes/shortsleeve', male: 'male', female: 'female', colors: STANDARD_COLORS },
    { id: 'plate_armour', lpcDir: 'torso/armour/plate', male: 'male', female: 'female', colors: METAL_COLORS },
    { id: 'leather_armour', lpcDir: 'torso/armour/leather', male: 'male', female: 'female', colors: STANDARD_COLORS },
    { id: 'chainmail', lpcDir: 'torso/chainmail', male: 'male', female: 'female', colors: ['gray'] },
  ]

  for (const asset of torsoAssets) {
    for (const color of asset.colors) {
      if (asset.female) {
        const femaleOutput = join(SPRITES_DIR, 'clothing', 'torso', asset.id, 'female', `${color}.png`)
        if (!existsSync(femaleOutput)) {
          const urls = [
            `${LPC_BASE}/${asset.lpcDir}/${asset.female}/walk/${color}.png`,
            `${LPC_BASE}/${asset.lpcDir}/${asset.female}/walk.png`,
          ]
          const ok = await tryDownload(urls, femaleOutput)
          if (!ok) await createPlaceholder(femaleOutput)
        }
      }

      if (asset.male) {
        const maleOutput = join(SPRITES_DIR, 'clothing', 'torso', asset.id, 'male', `${color}.png`)
        if (!existsSync(maleOutput)) {
          const urls = [
            `${LPC_BASE}/${asset.lpcDir}/${asset.male}/walk/${color}.png`,
            `${LPC_BASE}/${asset.lpcDir}/${asset.male}/walk.png`,
          ]
          const ok = await tryDownload(urls, maleOutput)
          if (!ok) await createPlaceholder(maleOutput)
        }
      }
    }
  }
}

async function fetchLpcDirStructure(category) {
  // Helper - not used for now but available for future expansion
  return []
}

// ---------------------------------------------------------------------------
// Download: Weapons
// ---------------------------------------------------------------------------

async function downloadWeapons() {
  console.log('\n📦 Downloading weapon sprites...')

  // The LPC repo has weapons under spritesheets/weapon/
  // Let me check the actual paths
  const weaponPaths = {
    sword: { actions: ['slash'], lpcDir: 'weapon/sword' },
    longsword: { actions: ['bigslash'], lpcDir: 'weapon/sword_big' },
    spear: { actions: ['thrust'], lpcDir: 'weapon/spear' },
    bow: { actions: ['shoot'], lpcDir: 'weapon/bow' },
  }

  for (const [id, spec] of Object.entries(weaponPaths)) {
    for (const variant of ['female', 'male']) {
      for (const action of spec.actions) {
        const outputPath = join(SPRITES_DIR, 'weapons', variant, action, '1.png')
        if (existsSync(outputPath)) {
          console.log(`  ✓ (cached) weapons/${variant}/${action}/1.png`)
          continue
        }

        // Try multiple path patterns
        const urls = [
          `${LPC_BASE}/${spec.lpcDir}/${variant}/${action}/walk.png`,
          `${LPC_BASE}/${spec.lpcDir}/${action}/${variant}/walk.png`,
          `${LPC_BASE}/weapon/${variant}/${action}/walk.png`,
        ]

        const ok = await tryDownload(urls, outputPath)
        if (!ok) await createPlaceholder(outputPath)
      }
    }
  }

  // Shields
  for (const variant of ['female', 'male']) {
    for (const shieldNum of ['1', '2']) {
      const outputPath = join(SPRITES_DIR, 'weapons', variant, 'shield', `${shieldNum}.png`)
      if (existsSync(outputPath)) {
        console.log(`  ✓ (cached) weapons/${variant}/shield/${shieldNum}.png`)
        continue
      }

      const urls = [
        `${LPC_BASE}/weapon/${variant}/shield/walk.png`,
        `${LPC_BASE}/weapon/shield/${variant}/walk.png`,
      ]

      const ok = await tryDownload(urls, outputPath)
      if (!ok) await createPlaceholder(outputPath)
    }
  }
}

// ---------------------------------------------------------------------------
// Download: Bosses (placeholders for now)
// ---------------------------------------------------------------------------

async function downloadBosses() {
  console.log('\n📦 Creating boss sprite placeholders...')

  const bosses = [
    { id: 'demon', type: 'folder', basePath: 'demon', frames: ['Idle1.png', 'Idle2.png', 'Idle3.png'] },
    { id: 'dragon', type: 'folder', basePath: 'dragon', frames: ['Idle1.png', 'Idle2.png', 'Idle3.png'] },
    { id: 'small_dragon', type: 'folder', basePath: 'small_dragon', frames: ['Idle1.png', 'Idle2.png', 'Idle3.png'] },
    { id: 'jinn', type: 'folder', basePath: 'jinn_animation', frames: ['Idle1.png', 'Idle2.png', 'Idle3.png'] },
    { id: 'medusa', type: 'folder', basePath: 'medusa', frames: ['Idle1.png', 'Idle2.png', 'Idle3.png'] },
    { id: 'lizard', type: 'folder', basePath: 'lizard', frames: ['Idle1.png', 'Idle2.png', 'Idle3.png'] },
    { id: 'bat', type: 'sheet' },
    { id: 'ghost', type: 'sheet' },
    { id: 'slime', type: 'sheet' },
    { id: 'eyeball', type: 'sheet' },
    { id: 'pumpking', type: 'sheet' },
    { id: 'bee', type: 'sheet' },
    { id: 'big_worm', type: 'sheet' },
    { id: 'man_eater_flower', type: 'sheet' },
    { id: 'small_worm', type: 'sheet' },
    { id: 'snake', type: 'sheet' },
  ]

  for (const boss of bosses) {
    if (boss.type === 'folder') {
      for (const frame of boss.frames) {
        const outputPath = join(SPRITES_DIR, 'bosses', boss.basePath, frame)
        if (!existsSync(outputPath)) {
          await createPlaceholder(outputPath, 256, 256)
        }
      }
    } else {
      const outputPath = join(SPRITES_DIR, 'bosses', `${boss.id}.png`)
      if (!existsSync(outputPath)) {
        await createPlaceholder(outputPath, 512, 256)
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Placeholders for empty categories
// ---------------------------------------------------------------------------

async function createPlaceholders() {
  console.log('\n📦 Creating placeholder sprites for empty categories...')
  // Eyes, hands, belt, cape, helmet are empty in the manifest
  // The compositor skips null layers, so no placeholders needed
  console.log('  (No placeholders needed — compositor skips empty layers)')
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2)

  const runAll = args.length === 0
  const runBodies = runAll || args.includes('--bodies')
  const runHair = runAll || args.includes('--hair')
  const runClothing = runAll || args.includes('--clothing')
  const runWeapons = runAll || args.includes('--weapons')
  const runBosses = runAll || args.includes('--bosses')
  const runPlaceholders = runAll || args.includes('--placeholders')

  // Ensure sprites directory exists
  mkdirSync(SPRITES_DIR, { recursive: true })

  console.log('🎮 Quest Forge — Sprite Asset Fetcher')
  console.log('=====================================')
  console.log(`Source: ${LPC_BASE}`)
  console.log(`Target: ${SPRITES_DIR}`)
  console.log('')

  let totalDownloaded = 0
  let totalPlaceholders = 0

  if (runBodies) await downloadBodies()
  if (runHair) await downloadHair()
  if (runClothing) await downloadClothing()
  if (runWeapons) await downloadWeapons()
  if (runBosses) await downloadBosses()
  if (runPlaceholders) await createPlaceholders()

  console.log('\n✅ Done! Sprite assets are in public/sprites/')
  console.log('   Note: Some assets may be placeholders (marked with ○).')
  console.log('   Boss sprites are all placeholders and need to be sourced manually.')
  console.log('')
  console.log('   Next steps:')
  console.log('   1. Source boss sprites from OpenGameArt.org')
  console.log('   2. Add missing clothing variants (skirts, leggings, etc.)')
  console.log('   3. Add weapon and shield sprites')
  console.log('   4. Run npm run type-check to verify manifest paths match')
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})