#!/usr/bin/env node

/**
 * fetch-sprites.mjs — Downloads LPC sprite assets and boss sprites, saving
 * them to the paths expected by Quest Forge's sprite manifest.
 *
 * Key findings about the LPC repo structure:
 *   - Bodies: spritesheets/body/bodies/{type}/{animation}.png
 *   - Hair (simple): spritesheets/hair/{style}/adult/walk.png
 *   - Hair (layered): spritesheets/hair/{style}/adult/fg/walk.png + bg/walk.png
 *   - Clothing with per-color variants: spritesheets/{cat}/{style}/{variant}/{anim}/{color}.png
 *   - Clothing base-only: spritesheets/{cat}/{style}/{style}/{variant}/{anim}.png
 *   - Eyes: spritesheets/eyes/human/adult/{expression}/{anim}/{color}.png
 *   - Capes: spritesheets/cape/solid/{variant}/{anim}/{color}.png
 *   - Hats: spritesheets/hat/{category}/{style}/adult/{anim}.png
 *   - Weapons: from makrohn/Universal-LPC-spritesheet repo (separate)
 *   - Bosses: from OpenGameArt LPC Monsters pack + manual sources
 *
 * Color variant strategy:
 *   - Items with per-color PNGs (boots, shoes, etc.): download each color
 *   - Items with base-only PNGs (shirts, armour): download base, use
 *     compositor hexTint for runtime color application
 *   - Fallback: if a specific color PNG 404s, try the base (uncolored) PNG
 *
 * Usage:
 *   node scripts/fetch-sprites.mjs           # download all
 *   node scripts/fetch-sprites.mjs --bodies   # only bodies
 *   node scripts/fetch-sprites.mjs --hair     # only hair
 *   node scripts/fetch-sprites.mjs --clothing # only clothing
 *   node scripts/fetch-sprites.mjs --weapons  # only weapons
 *   node scripts/fetch-sprites.mjs --bosses   # only bosses
 *   node scripts/fetch-sprites.mjs --eyes      # only eyes
 *   node scripts/fetch-sprites.mjs --heads     # only head/face sprites
 *   node scripts/fetch-sprites.mjs --accessories # capes, hats
 *   node scripts/fetch-sprites.mjs --placeholders # only placeholders
 *
 * Requires: sharp (npm install --save-dev sharp)
 *
 * License: All downloaded assets are dual-licensed CC-BY-SA 3.0 / GPL 3.0
 * per the Liberated Pixel Cup. See CREDITS.md for attribution details.
 */

import { existsSync, mkdirSync, writeFileSync, copyFileSync } from 'node:fs'
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

const MAKROHN_BASE =
  'https://raw.githubusercontent.com/makrohn/Universal-LPC-spritesheet/master'

const STANDARD_COLORS = [
  'black', 'bluegray', 'blue', 'brown', 'charcoal', 'forest', 'gray',
  'green', 'lavender', 'leather', 'maroon', 'navy', 'orange', 'pink',
  'purple', 'red', 'rose', 'sky', 'slate', 'tan', 'teal', 'walnut',
  'white', 'yellow',
]

const METAL_COLORS = [
  'brass', 'bronze', 'ceramic', 'copper', 'gold', 'iron', 'silver', 'steel',
]

const EYE_COLORS = [
  'blue', 'brown', 'gray', 'green', 'orange', 'purple', 'red', 'yellow',
]

// Hair styles that have fg/bg layers (long hair behind body)
const LAYERED_HAIR_STYLES = new Set([
  'braid', 'braid2', 'bangs_bun', 'half_up', 'high_ponytail',
  'long_band', 'long_center_part', 'long_tied', 'pigtails', 'pigtails_bangs',
  'sara', 'curtains_long', 'dreadlocks_long', 'long_messy', 'long_messy2',
])

// ---------------------------------------------------------------------------
// Boss mapping: internal name → OpenGameArt source
// ---------------------------------------------------------------------------

const BOSS_MAPPING = {
  // Sheet-based bosses from LPC Monsters pack by bluecarrot16/CharlesGabriel
  // Source: https://opengameart.org/content/lpc-monsters
  // License: CC-BY-SA 3.0 / GPL 3.0
  bat:                { source: 'lpc-monsters', file: 'bat.png', format: 'sheet' },
  ghost:              { source: 'lpc-monsters', file: 'ghost.png', format: 'sheet' },
  slime:              { source: 'lpc-monsters', file: 'slime.png', format: 'sheet' },
  eyeball:            { source: 'lpc-monsters', file: 'eyeball.png', format: 'sheet' },
  pumpking:           { source: 'lpc-monsters', file: 'pumpking.png', format: 'sheet' },
  bee:                { source: 'lpc-monsters', file: 'bee.png', format: 'sheet' },
  big_worm:           { source: 'lpc-monsters', file: 'big_worm.png', format: 'sheet' },
  man_eater_flower:   { source: 'lpc-monsters', file: 'man_eater_flower.png', format: 'sheet' },
  small_worm:         { source: 'lpc-monsters', file: 'small_worm.png', format: 'sheet' },
  snake:              { source: 'lpc-monsters', file: 'snake.png', format: 'sheet' },
  // Folder-based bosses (need individual idle frames — placeholders for now)
  demon:              { source: 'placeholder', format: 'folder', basePath: 'demon', frames: ['Idle1.png', 'Idle2.png', 'Idle3.png'] },
  dragon:             { source: 'placeholder', format: 'folder', basePath: 'dragon', frames: ['Idle1.png', 'Idle2.png', 'Idle3.png'] },
  small_dragon:       { source: 'placeholder', format: 'folder', basePath: 'small_dragon', frames: ['Idle1.png', 'Idle2.png', 'Idle3.png'] },
  jinn:               { source: 'placeholder', format: 'folder', basePath: 'jinn_animation', frames: ['Idle1.png', 'Idle2.png', 'Idle3.png'] },
  medusa:             { source: 'placeholder', format: 'folder', basePath: 'medusa', frames: ['Idle1.png', 'Idle2.png', 'Idle3.png'] },
  lizard:             { source: 'placeholder', format: 'folder', basePath: 'lizard', frames: ['Idle1.png', 'Idle2.png', 'Idle3.png'] },
}

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
        if (attempt === 1) console.log(`  ✗ ${res.status} ${url.replace(LPC_BASE + '/', '').replace(MAKROHN_BASE + '/', '')}`)
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
    create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .png()
    .toFile(outputPath)

  console.log(`  ○ Placeholder: ${outputPath.replace(ROOT + '/', '')}`)
}

async function tryDownload(urlPatterns, dest) {
  for (const url of urlPatterns) {
    const result = await download(url, dest)
    if (result) return true
  }
  return false
}

/**
 * Download a sprite with color variant fallback.
 * If the specific color PNG doesn't exist, try the base (uncolored) PNG.
 * If that also fails, create a placeholder.
 */
async function downloadWithColorFallback(lpcBasePath, outputPath, color) {
  // Try the specific color variant first
  if (color) {
    const colorUrl = `${LPC_BASE}/${lpcBasePath}/walk/${color}.png`
    const result = await download(colorUrl, outputPath)
    if (result) return true
  }

  // Fallback to base (uncolored) sprite
  const baseUrl = `${LPC_BASE}/${lpcBasePath}/walk.png`
  const result = await download(baseUrl, outputPath)
  if (result) return true

  // Last resort: placeholder
  await createPlaceholder(outputPath)
  return false
}

// ---------------------------------------------------------------------------
// Download: Bodies
// ---------------------------------------------------------------------------

async function downloadBodies() {
  console.log('\n📦 Downloading body sprites...')

  const bodies = [
    { paths: ['body/bodies/female/walk.png'], output: 'bodies/female_walkcycle.png' },
    { paths: ['body/bodies/male/walk.png'], output: 'bodies/male_walkcycle.png' },
    { paths: ['body/bodies/pregnant/walk.png'], output: 'bodies/princess.png' },
    { paths: ['body/bodies/muscular/walk.png'], output: 'bodies/soldier.png' },
    { paths: ['body/bodies/male/slash.png'], output: 'bodies/male_slash.png' },
    { paths: ['body/bodies/male/spellcast.png'], output: 'bodies/male_spellcast.png' },
    { paths: ['body/bodies/male/hurt.png'], output: 'bodies/male_hurt.png' },
    { paths: ['body/bodies/male/walk.png'], output: 'bodies/male_pants.png' },
    { paths: ['body/bodies/female/slash.png'], output: 'bodies/female_slash.png' },
    { paths: ['body/bodies/female/spellcast.png'], output: 'bodies/female_spellcast.png' },
    { paths: ['body/bodies/female/hurt.png'], output: 'bodies/female_hurt.png' },
  ]

  for (const asset of bodies) {
    const outputPath = join(SPRITES_DIR, asset.output)
    const urls = asset.paths.map(p => `${LPC_BASE}/${p}`)
    const ok = await tryDownload(urls, outputPath)
    if (!ok) await createPlaceholder(outputPath)
  }
}

// ---------------------------------------------------------------------------
// Download: Hair
// ---------------------------------------------------------------------------

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

    for (const variant of ['female', 'male']) {
      const outputPath = join(SPRITES_DIR, 'hair', 'hair', style, `${variant}.png`)

      if (existsSync(outputPath) && (await import('fs')).statSync(outputPath).size > 100) {
        console.log(`  ✓ (cached) hair/hair/${style}/${variant}.png`)
        continue
      }

      let urls
      if (isLayered) {
        urls = [
          `${LPC_BASE}/hair/${style}/adult/fg/walk.png`,
          `${LPC_BASE}/hair/${style}/adult/walk.png`,
        ]
      } else {
        urls = [`${LPC_BASE}/hair/${style}/adult/walk.png`]
      }

      const ok = await tryDownload(urls, outputPath)
      if (!ok) await createPlaceholder(outputPath)
    }
  }
}

// ---------------------------------------------------------------------------
// Download: Eyes
// ---------------------------------------------------------------------------

async function downloadEyes() {
  console.log('\n📦 Downloading eye sprites...')

  // Eyes come in expressions + colors
  // We download the "neutral" expression for each color
  for (const color of EYE_COLORS) {
    const outputPath = join(SPRITES_DIR, 'eyes', 'human', `${color}.png`)
    if (existsSync(outputPath) && (await import('fs')).statSync(outputPath).size > 100) {
      console.log(`  ✓ (cached) eyes/human/${color}.png`)
      continue
    }

    const urls = [
      `${LPC_BASE}/eyes/human/adult/neutral/walk/${color}.png`,
    ]

    const ok = await tryDownload(urls, outputPath)
    if (!ok) await createPlaceholder(outputPath)
  }
}

// ---------------------------------------------------------------------------
// Download: Heads
// ---------------------------------------------------------------------------

async function downloadHeads() {
  console.log('\n📦 Downloading head/face sprites...')

  // LPC head sprites — separate face layer that overlays the body
  // Source: head/heads/human/{male|female}/walk.png
  const headVariants = [
    { variant: 'male',   output: 'heads/human/male/walk.png' },
    { variant: 'female', output: 'heads/human/female/walk.png' },
  ]

  for (const { variant, output } of headVariants) {
    const outputPath = join(SPRITES_DIR, output)
    if (existsSync(outputPath) && (await import('fs')).statSync(outputPath).size > 100) {
      console.log(`  ✓ (cached) ${output}`)
      continue
    }

    const url = `${LPC_BASE}/head/heads/human/${variant}/walk.png`
    const ok = await download(url, outputPath)
    if (!ok) await createPlaceholder(outputPath)
  }
}

// ---------------------------------------------------------------------------
// Download: Clothing (feet, legs, torso)
// ---------------------------------------------------------------------------

async function downloadClothing() {
  console.log('\n📦 Downloading clothing sprites...')

  // --- Feet (per-color variants available) ---
  const feetAssets = [
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
      if (!existsSync(femaleOutput) || (await import('fs')).statSync(femaleOutput).size <= 100) {
        const urls = [
          `${LPC_BASE}/${asset.lpcDir}/${asset.female}/walk/${color}.png`,
          `${LPC_BASE}/${asset.lpcDir}/${asset.female}/walk.png`,
        ]
        const ok = await tryDownload(urls, femaleOutput)
        if (!ok) await createPlaceholder(femaleOutput)
      }

      // Male variant
      const maleOutput = join(SPRITES_DIR, 'clothing', 'feet', asset.id, 'male', `${color}.png`)
      if (!existsSync(maleOutput) || (await import('fs')).statSync(maleOutput).size <= 100) {
        const urls = [
          `${LPC_BASE}/${asset.lpcDir}/${asset.male}/walk/${color}.png`,
          `${LPC_BASE}/${asset.lpcDir}/${asset.male}/walk.png`,
        ]
        const ok = await tryDownload(urls, maleOutput)
        if (!ok) await createPlaceholder(maleOutput)
      }
    }
  }

  // --- Legs (base-only with color fallback) ---
  const legsAssets = [
    { id: 'pants', lpcDir: 'legs/pants/pants', male: 'male', female: 'female', teen: 'teen', colors: STANDARD_COLORS },
    { id: 'plate_legs', lpcDir: 'legs/armour/plate', male: 'male', female: 'female', colors: METAL_COLORS },
  ]

  for (const asset of legsAssets) {
    for (const color of asset.colors) {
      // Female variant
      const femaleOutput = join(SPRITES_DIR, 'clothing', 'legs', asset.id, 'female', `${color}.png`)
      if (!existsSync(femaleOutput) || (await import('fs')).statSync(femaleOutput).size <= 100) {
        const urls = [
          `${LPC_BASE}/${asset.lpcDir}/${asset.female}/walk/${color}.png`,
          `${LPC_BASE}/${asset.lpcDir}/${asset.female}/walk.png`,
        ]
        const ok = await tryDownload(urls, femaleOutput)
        if (!ok) await createPlaceholder(femaleOutput)
      }

      // Male variant
      const maleDir = asset.teen || asset.male
      const maleOutput = join(SPRITES_DIR, 'clothing', 'legs', asset.id, 'male', `${color}.png`)
      if (!existsSync(maleOutput) || (await import('fs')).statSync(maleOutput).size <= 100) {
        const urls = [
          `${LPC_BASE}/${asset.lpcDir}/${maleDir}/walk/${color}.png`,
          `${LPC_BASE}/${asset.lpcDir}/${maleDir}/walk.png`,
        ]
        const ok = await tryDownload(urls, maleOutput)
        if (!ok) await createPlaceholder(maleOutput)
      }
    }
  }

  // --- Torso (base-only with color fallback) ---
  // The LPC repo uses a nested path: torso/{category}/{style}/{style}/{variant}/walk.png
  // Some items have per-color variants, others are base-only
  const torsoAssets = [
    // Items with nested path structure: torso/clothes/{style}/{style}/{variant}/
    { id: 'longsleeve', lpcDir: 'torso/clothes/longsleeve/longsleeve', male: 'male', female: 'female', colors: STANDARD_COLORS },
    { id: 'shortsleeve', lpcDir: 'torso/clothes/shortsleeve/shortsleeve', male: 'male', female: 'female', colors: STANDARD_COLORS },
    { id: 'plate_armour', lpcDir: 'torso/armour/plate', male: 'male', female: 'female', colors: METAL_COLORS },
    { id: 'leather_armour', lpcDir: 'torso/armour/leather', male: 'male', female: 'female', colors: STANDARD_COLORS },
    { id: 'chainmail', lpcDir: 'torso/chainmail/chainmail', male: 'male', female: 'female', colors: ['gray'] },
  ]

  for (const asset of torsoAssets) {
    for (const color of asset.colors) {
      if (asset.female) {
        const femaleOutput = join(SPRITES_DIR, 'clothing', 'torso', asset.id, 'female', `${color}.png`)
        if (!existsSync(femaleOutput) || (await import('fs')).statSync(femaleOutput).size <= 100) {
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
        if (!existsSync(maleOutput) || (await import('fs')).statSync(maleOutput).size <= 100) {
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

// ---------------------------------------------------------------------------
// Download: Capes
// ---------------------------------------------------------------------------

async function downloadCapes() {
  console.log('\n📦 Downloading cape sprites...')

  const capeStyles = [
    { id: 'solid', lpcDir: 'cape/solid', colors: STANDARD_COLORS },
    { id: 'tattered', lpcDir: 'cape/tattered', colors: STANDARD_COLORS },
  ]

  for (const cape of capeStyles) {
    for (const color of cape.colors) {
      for (const variant of ['female', 'male']) {
        const outputPath = join(SPRITES_DIR, 'cape', cape.id, variant, `${color}.png`)
        if (existsSync(outputPath) && (await import('fs')).statSync(outputPath).size > 100) {
          console.log(`  ✓ (cached) cape/${cape.id}/${variant}/${color}.png`)
          continue
        }

        const urls = [
          `${LPC_BASE}/${cape.lpcDir}/${variant}/walk/${color}.png`,
          `${LPC_BASE}/${cape.lpcDir}/${variant}/walk.png`,
        ]

        const ok = await tryDownload(urls, outputPath)
        if (!ok) await createPlaceholder(outputPath)
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Download: Hats / Helmets
// ---------------------------------------------------------------------------

async function downloadHats() {
  console.log('\n📦 Downloading hat/helmet sprites...')

  const hatStyles = [
    { id: 'hood', lpcDir: 'hat/cloth/hood', colors: STANDARD_COLORS },
    { id: 'bandana', lpcDir: 'hat/cloth/bandana', colors: STANDARD_COLORS },
    { id: 'crown', lpcDir: 'hat/formal/crown', colors: ['gold'] },
    { id: 'leather_cap', lpcDir: 'hat/cloth/leather_cap', colors: STANDARD_COLORS },
  ]

  for (const hat of hatStyles) {
    for (const color of hat.colors) {
      const outputPath = join(SPRITES_DIR, 'helmet', hat.id, `${color}.png`)
      if (existsSync(outputPath) && (await import('fs')).statSync(outputPath).size > 100) {
        console.log(`  ✓ (cached) helmet/${hat.id}/${color}.png`)
        continue
      }

      const urls = [
        `${LPC_BASE}/${hat.lpcDir}/adult/walk/${color}.png`,
        `${LPC_BASE}/${hat.lpcDir}/adult/walk.png`,
      ]

      const ok = await tryDownload(urls, outputPath)
      if (!ok) await createPlaceholder(outputPath)
    }
  }
}

// ---------------------------------------------------------------------------
// Download: Weapons (from makrohn repo)
// ---------------------------------------------------------------------------

async function downloadWeapons() {
  console.log('\n📦 Downloading weapon sprites...')

  // Weapon mapping from makrohn's Universal-LPC-spritesheet repo
  // These are full sprite sheets, not individual animation frames
  const weaponAssets = [
    { id: 'sword', makrohnPath: 'weapons/right%20hand/male/dagger_male.png', outputDir: 'weapons/male/slash', outputFile: '1.png' },
    { id: 'longsword', makrohnPath: 'weapons/oversize/right%20hand/male/longsword_male.png', outputDir: 'weapons/male/bigslash', outputFile: '1.png' },
    { id: 'spear', makrohnPath: 'weapons/both%20hand/spear.png', outputDir: 'weapons/male/thrust', outputFile: '1.png' },
    { id: 'bow', makrohnPath: 'weapons/right%20hand/either/bow.png', outputDir: 'weapons/male/shoot', outputFile: '1.png' },
    { id: 'sword_f', makrohnPath: 'weapons/right%20hand/female/dagger_female.png', outputDir: 'weapons/female/slash', outputFile: '1.png' },
    { id: 'longsword_f', makrohnPath: 'weapons/oversize/right%20hand/female/longsword_female.png', outputDir: 'weapons/female/bigslash', outputFile: '1.png' },
    { id: 'spear_f', makrohnPath: 'weapons/right%20hand/female/spear_female.png', outputDir: 'weapons/female/thrust', outputFile: '1.png' },
    { id: 'bow_f', makrohnPath: 'weapons/right%20hand/either/bow.png', outputDir: 'weapons/female/shoot', outputFile: '1.png' },
    // Shields
    { id: 'shield_round', makrohnPath: 'weapons/left%20hand/male/shield_male_cutoutforbody.png', outputDir: 'weapons/male/shield', outputFile: '1.png' },
    { id: 'shield_round_f', makrohnPath: 'weapons/left%20hand/male/shield_male_cutoutforbody.png', outputDir: 'weapons/female/shield', outputFile: '1.png' },
  ]

  for (const asset of weaponAssets) {
    const outputPath = join(SPRITES_DIR, asset.outputDir, asset.outputFile)
    if (existsSync(outputPath) && (await import('fs')).statSync(outputPath).size > 100) {
      console.log(`  ✓ (cached) ${asset.outputDir}/${asset.outputFile}`)
      continue
    }

    const url = `${MAKROHN_BASE}/${asset.makrohnPath}`
    const ok = await download(url, outputPath)
    if (!ok) await createPlaceholder(outputPath)
  }
}

// ---------------------------------------------------------------------------
// Download: Bosses (from OpenGameArt LPC Monsters pack)
// ---------------------------------------------------------------------------

async function downloadBosses() {
  console.log('\n📦 Downloading boss sprites...')

  // First, try to use the pre-extracted LPC Monsters pack
  const lpcMonstersDir = '/tmp/lpc-monsters-extracted/lpc-monsters'

  for (const [id, mapping] of Object.entries(BOSS_MAPPING)) {
    if (mapping.source === 'lpc-monsters') {
      // Sheet-based boss from the LPC Monsters pack
      const outputPath = join(SPRITES_DIR, 'bosses', `${id}.png`)

      if (existsSync(outputPath) && (await import('fs')).statSync(outputPath).size > 100) {
        console.log(`  ✓ (cached) bosses/${id}.png`)
        continue
      }

      // Try to copy from the extracted LPC Monsters pack
      const sourcePath = join(lpcMonstersDir, mapping.file)
      if (existsSync(sourcePath)) {
        ensureDir(outputPath)
        copyFileSync(sourcePath, outputPath)
        console.log(`  ✓ bosses/${id}.png (from LPC Monsters pack)`)
      } else {
        // Download from OpenGameArt
        const url = `https://opengameart.org/sites/default/files/lpc-monsters.zip`
        console.log(`  ⚠ LPC Monsters pack not extracted. Run: cd /tmp && curl -sL "${url}" -o lpc-monsters.zip && unzip -o lpc-monsters.zip`)
        await createPlaceholder(outputPath, 512, 256)
      }
    } else if (mapping.source === 'placeholder') {
      // Folder-based boss (needs individual idle frames)
      for (const frame of mapping.frames) {
        const outputPath = join(SPRITES_DIR, 'bosses', mapping.basePath, frame)
        if (!existsSync(outputPath)) {
          await createPlaceholder(outputPath, 256, 256)
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2)

  const runAll = args.length === 0
  const runBodies = runAll || args.includes('--bodies')
  const runHair = runAll || args.includes('--hair')
  const runEyes = runAll || args.includes('--eyes')
  const runHeads = runAll || args.includes('--heads')
  const runClothing = runAll || args.includes('--clothing')
  const runWeapons = runAll || args.includes('--weapons')
  const runBosses = runAll || args.includes('--bosses')
  const runAccessories = runAll || args.includes('--accessories')
  const runPlaceholders = args.includes('--placeholders')

  // Ensure sprites directory exists
  mkdirSync(SPRITES_DIR, { recursive: true })

  // Pre-download the LPC Monsters pack if needed
  if (runBosses || runAll) {
    const lpcMonstersDir = '/tmp/lpc-monsters-extracted/lpc-monsters'
    if (!existsSync(join(lpcMonstersDir, 'bat.png'))) {
      console.log('📦 Pre-downloading LPC Monsters pack...')
      const { execSync } = await import('node:child_process')
      try {
        execSync('curl -sL "https://opengameart.org/sites/default/files/lpc-monsters.zip" -o /tmp/lpc-monsters.zip && unzip -o /tmp/lpc-monsters.zip -d /tmp/lpc-monsters-extracted/', { stdio: 'pipe' })
        console.log('  ✓ LPC Monsters pack downloaded and extracted')
      } catch {
        console.log('  ⚠ Could not download LPC Monsters pack. Boss sprites will be placeholders.')
      }
    }
  }

  console.log('🎮 Quest Forge — Sprite Asset Fetcher v2')
  console.log('==========================================')
  console.log(`Source (LPC): ${LPC_BASE}`)
  console.log(`Source (Weapons): ${MAKROHN_BASE}`)
  console.log(`Target: ${SPRITES_DIR}`)
  console.log('')

  if (runBodies) await downloadBodies()
  if (runHair) await downloadHair()
  if (runEyes) await downloadEyes()
  if (runHeads) await downloadHeads()
  if (runClothing) await downloadClothing()
  if (runAccessories) {
    await downloadCapes()
    await downloadHats()
  }
  if (runWeapons) await downloadWeapons()
  if (runBosses) await downloadBosses()
  if (runPlaceholders) {
    console.log('\n📦 Creating placeholder sprites for empty categories...')
    console.log('  (No additional placeholders needed — compositor skips empty layers)')
  }

  // Summary
  console.log('\n📊 Asset Summary:')
  const { readdirSync, statSync } = await import('node:fs')
  const { join: pathJoin } = await import('node:path')

  function countFiles(dir, ext = '.png') {
    if (!existsSync(dir)) return { total: 0, real: 0, placeholder: 0 }
    let total = 0, real = 0, placeholder = 0
    function walk(d) {
      for (const entry of readdirSync(d, { withFileTypes: true })) {
        const fullPath = pathJoin(d, entry.name)
        if (entry.isDirectory()) walk(fullPath)
        else if (entry.name.endsWith(ext)) {
          total++
          const size = statSync(fullPath).size
          if (size > 100) real++
          else placeholder++
        }
      }
    }
    walk(dir)
    return { total, real, placeholder }
  }

  const categories = ['bodies', 'heads', 'hair', 'eyes', 'clothing', 'cape', 'helmet', 'weapons', 'bosses']
  let grandTotal = 0, grandReal = 0, grandPlaceholder = 0
  for (const cat of categories) {
    const dir = join(SPRITES_DIR, cat)
    if (existsSync(dir)) {
      const { total, real, placeholder } = countFiles(dir)
      console.log(`  ${cat}: ${real} real, ${placeholder} placeholder, ${total} total`)
      grandTotal += total; grandReal += real; grandPlaceholder += placeholder
    }
  }
  console.log(`  ─────────────────────────────`)
  console.log(`  Total: ${grandReal} real, ${grandPlaceholder} placeholder, ${grandTotal} total`)

  console.log('\n✅ Done!')
  console.log('')
  console.log('  Remaining work:')
  console.log('  1. Folder-based boss sprites (dragon, demon, medusa, etc.) need manual sourcing')
  console.log('  2. Some clothing items use base sprites with compositor tinting for color')
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})