# Quest Forge — Art Pipeline Guide

## Overview
All art is free/open-source pixel art. The visual identity combines Liberated Pixel Cup (LPC) modular character sprites, Kenney.nl UI packs, and OpenGameArt monster sprites. Every asset is legally free for commercial use under CC0, CC-BY, CC-BY-SA, or GPL licenses.

This document provides exact sources, download links, and organization steps.

---

## 1. Character Sprites (LPC System)

The Liberated Pixel Cup is a massive open-source project that created a standardized, modular pixel art character system. Every body part, hair style, clothing piece, and weapon is a separate sprite sheet designed to layer perfectly with all the others. This is the core of our avatar system.

### Base Assets (Required)

**LPC Base Sprites — Bodies**
- URL: https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles
- Author: Lanea Zimmerman (Sharm), Stephen Challener (Redshrike), et al.
- License: CC-BY-SA 3.0 / GPL 3.0
- What you get: Base body sprite sheets in multiple skin tones. Each sheet is a full walk/attack/cast animation cycle (64×64 frames).
- Save to: `/public/sprites/bodies/`

**LPC Character Generator Assets**
- URL: https://lpc.opengameart.org/
- This is a web tool AND a download source. The "Download" section has ALL community-contributed parts as individual sprite sheets.
- Browse categories: Hair, Hats, Torso, Legs, Feet, Hands, Accessories, Weapons, Shields
- License: Each part lists its license. Stick to CC-BY-SA 3.0 items.

### Recommended Downloads (Pick at Least These)

**Hair Styles**
- URL: https://opengameart.org/content/lpc-medieval-fantasy-character-sprites
- Author: wulax
- Includes: 20+ hair styles in multiple colors (blonde, brown, black, red, white, blue)
- Save to: `/public/sprites/hair/`

**Clothing & Armor**
- URL: https://opengameart.org/content/lpc-medieval-fantasy-character-sprites (same pack — includes chainmail, leather, robes, plate)
- Additional: https://opengameart.org/content/lpc-armor-repack (various armor types repackaged)
- Save to: `/public/sprites/clothing/`

**Weapons**
- URL: https://opengameart.org/content/lpc-weapons (swords, axes, bows, staves, hammers)
- Save to: `/public/sprites/weapons/`

**Capes & Accessories**
- URL: https://opengameart.org/content/lpc-capes-and-scarves
- URL: https://opengameart.org/content/lpc-accessories
- Save to: `/public/sprites/accessories/`

### How LPC Sprite Sheets Work

Each sprite sheet is a PNG grid, typically 832×1344 pixels (13 columns × 21 rows for a 64×64 frame size). The grid layout follows a standard:

```
Row 0:      Spellcast Up (7 frames)
Row 1:      Spellcast Left (7 frames)
Row 2:      Spellcast Down (7 frames)
Row 3:      Spellcast Right (7 frames)
Row 4-6:    Thrust Up/Left/Down/Right (8 frames each, but only 4-6 rows used)
Row 7:      Thrust Right (8 frames)
Row 8:      Walk Up (9 frames)
Row 9:      Walk Left (9 frames)
Row 10:     Walk Down (9 frames)
Row 11:     Walk Right (9 frames)
Row 12:     Slash Up (6 frames)
Row 13:     Slash Left (6 frames)
Row 14:     Slash Down (6 frames)
Row 15:     Slash Right (6 frames)
Row 16:     Shoot Up (13 frames)
Row 17:     Shoot Left (13 frames)
Row 18:     Shoot Down (13 frames)
Row 19:     Shoot Right (13 frames)
Row 20:     Hurt/Death (6 frames)
```

For our app, we primarily need:
- **Walk Down frame 0** — the static front-facing idle portrait
- **Walk cycle (rows 8-11)** — for animated avatars on the home screen
- **Slash cycle (rows 12-15)** — for boss battle damage animations

The SpriteCanvas component extracts the correct frame from each layer's sheet and composites them.

### Sprite Organization

```
/public/sprites/
├── bodies/
│   ├── body_light.png
│   ├── body_medium.png
│   ├── body_dark.png
│   ├── body_olive.png
│   └── body_pale.png
├── hair/
│   ├── hair_bangs_blonde.png
│   ├── hair_bangs_brown.png
│   ├── hair_long_black.png
│   ├── hair_long_red.png
│   ├── hair_curly_white.png
│   ├── hair_mohawk_blue.png
│   └── ... (aim for 10-20 styles × 4-6 colors each)
├── clothing/
│   ├── torso/
│   │   ├── shirt_basic_white.png
│   │   ├── shirt_chainmail.png
│   │   ├── shirt_leather.png
│   │   ├── shirt_robe_blue.png
│   │   └── shirt_plate_iron.png
│   ├── legs/
│   │   ├── pants_basic_brown.png
│   │   ├── pants_leather.png
│   │   ├── pants_plate.png
│   │   └── pants_robe.png
│   ├── feet/
│   │   ├── boots_leather.png
│   │   ├── boots_iron.png
│   │   └── shoes_basic.png
│   └── head/
│       ├── helmet_iron.png
│       ├── helmet_leather.png
│       ├── hood_cloth.png
│       └── crown_gold.png
├── weapons/
│   ├── weapon_longsword.png
│   ├── weapon_staff.png
│   ├── weapon_bow.png
│   ├── weapon_axe.png
│   ├── weapon_dagger.png
│   └── weapon_hammer.png
├── accessories/
│   ├── cape_red.png
│   ├── cape_blue.png
│   ├── shield_wood.png
│   ├── shield_iron.png
│   └── necklace_ember.png
```

### Sprite Manifest File

Create `/src/lib/sprites/manifest.ts` that catalogs every available part:

```typescript
export const SPRITE_MANIFEST = {
  bodies: [
    { id: "body_light", name: "Light", path: "/sprites/bodies/body_light.png" },
    { id: "body_medium", name: "Medium", path: "/sprites/bodies/body_medium.png" },
    // ...
  ],
  hair: [
    { id: "hair_bangs_blonde", name: "Bangs", color: "Blonde", path: "/sprites/hair/hair_bangs_blonde.png" },
    // ...
  ],
  torso: [ /* ... */ ],
  legs: [ /* ... */ ],
  feet: [ /* ... */ ],
  head: [ /* ... */ ],
  weapons: [ /* ... */ ],
  accessories: [ /* ... */ ],
};
```

This manifest drives the character creator UI — it dynamically generates the selection options.

---

## 2. Boss / Monster Sprites

### Sources

**Creatures by Stealthix**
- URL: https://opengameart.org/content/creature-sprites
- License: CC-BY 3.0
- What you get: Various fantasy creatures (demons, undead, elementals, beasts) as animated sprite sheets
- Great for: Arc bosses, Hollow creatures

**Monsters by Calciumtrice**
- URL: https://opengameart.org/content/lpc-style-farm-animals (and related packs)
- License: CC-BY 3.0
- What you get: LPC-compatible creature sprites

**Dungeon Crawl Stone Soup (DCSS) Tiles**
- URL: https://opengameart.org/content/dungeon-crawl-32x32-tiles-supplemental
- License: CC0
- What you get: Massive library of 32×32 monster tiles. Scale to 64×64 or 128×128.
- Great for: The sheer variety — hundreds of unique monsters.

**RPG Enemies by Buch**
- URL: https://opengameart.org/content/rpg-enemies-2
- License: CC0
- What you get: Classic RPG enemy sprites (slimes, skeletons, spirits, golems)

### Recommended: Minimum 15 Base Sprites

Download at least 15 distinct monster bases to cover the 52-week boss rotation:

| Base | Used For | Source |
|------|----------|--------|
| Treant/Tree creature | Thornmaw, Blighted Root | Stealthix or DCSS |
| Moth/Insect swarm | Whispering Swarm | DCSS tiles |
| Stone golem | Grulk, Crumble Golems | Stealthix |
| Flame wisp | Cindra, False Flame | DCSS |
| Ghost/Wraith | Captain Murk, Hush Wraiths | RPG Enemies / DCSS |
| Sea serpent | Leviathan, Abyssal Maw | DCSS |
| Siren/Harpy | Siren of Still Tide | DCSS |
| Iron golem/automaton | Rustvein, Siege Engine | Stealthix |
| Spider/Arachnid | Gloomweaver Prime | DCSS / RPG Enemies |
| Fungus creature | Sporecrown | DCSS |
| Crystal entity | Crystal Mimic | DCSS |
| Shadow figure | Hollow King, Shadows | DCSS |
| Skeletal warrior | General Decay | RPG Enemies |
| Demon/Noble | Ashen Duchess, Lord Cinder | Stealthix / DCSS |
| Dragon/Large beast | Arc finale bosses | Stealthix / DCSS |

Save to: `/public/sprites/bosses/`

### Palette Swap System

To make 15 bases feel like 52+ unique bosses, we use programmatic palette swaps:

```typescript
// In /src/lib/sprites/palette.ts

export const BOSS_PALETTES = {
  hollow_dark: {    // Grays and deep purples
    primary: "#2D1B2E",
    secondary: "#5C4D7D",
    accent: "#9B72CF",
    glow: "#4A0080"
  },
  ember_corrupt: {  // Sickly oranges and blacks
    primary: "#1A0A00",
    secondary: "#8B4513",
    accent: "#FF6B35",
    glow: "#FF4500"
  },
  frost_hollow: {   // Cold blues and whites
    primary: "#0A1628",
    secondary: "#4A6FA5",
    accent: "#B8D4E3",
    glow: "#00BFFF"
  },
  ash_gray: {       // Muted grays — the Ashlands
    primary: "#2C2C2C",
    secondary: "#6B6B6B",
    accent: "#999999",
    glow: "#CCCCCC"
  }
};
```

The palette swap works by:
1. Drawing the base sprite to an offscreen Canvas
2. Reading pixel data with `getImageData()`
3. Mapping source colors to palette colors
4. Writing back with `putImageData()`
5. Drawing the recolored sprite to the display Canvas

Combined with CSS particle effects (ember glow, shadow tendrils, pulsing aura), each boss feels visually distinct.

---

## 3. UI Assets

### Kenney.nl Packs (All CC0 — Public Domain)

**Pixel UI Pack**
- URL: https://kenney.nl/assets/pixel-ui-pack
- What you get: Buttons, panels, progress bars, checkboxes, sliders, scroll bars — all in consistent pixel art style
- Save to: `/public/sprites/ui/`

**Game Icons**
- URL: https://kenney.nl/assets/game-icons
- What you get: 100+ game-related icons (swords, shields, potions, coins, hearts, stars)
- Save to: `/public/sprites/icons/`

**Emote Pack**
- URL: https://kenney.nl/assets/emote-pack
- What you get: Pixel art emotes (happy, sad, angry, surprised, etc.) for feedback UI
- Save to: `/public/sprites/ui/emotes/`

### Custom UI Elements to Build

Some UI elements are better built in CSS/SVG than sourced as images:

- **XP Progress Bar:** Use Kenney's progress bar frame as a container, fill with animated CSS gradient (ember orange → gold)
- **Boss HP Bar:** Red → yellow → green gradient fill inside a decorative pixel frame. Add a screen-shake CSS animation when damage is dealt.
- **Pixel Art Cards:** 9-slice the Kenney panel sprites to create scalable card backgrounds
- **Scroll/Parchment:** CSS-only with a parchment background color, pixel-art border image, and subtle texture
- **Gold Coin Counter:** Animated spinning coin sprite (4 frames) next to the number

---

## 4. Background / Environment Art

### Tilesets

**LPC Terrain Tiles**
- Included in the base LPC asset pack (same download as bodies)
- Provides: Grass, dirt, water, stone, wood tiles for scene backgrounds
- Use for: Quest board background, story page illustrations, boss arena backdrops

**Kenney RPG Pack**
- URL: https://kenney.nl/assets/rpg-base
- Provides: Additional terrain and building tiles

### How Backgrounds Are Used

The app doesn't need scrolling game maps. Backgrounds are used as:
1. **Page backgrounds:** Tiled textures behind content (e.g., stone tile pattern behind the Quest Board)
2. **Scene vignettes:** Small composed scenes for story chapters (a forest clearing, a mountain pass)
3. **Boss arenas:** A themed backdrop behind the boss sprite (dark cave, burning field, ocean)

Build 5-6 background compositions from the tilesets:
- Forest clearing (Heartwood)
- Coastal shore (Shattered Coast)
- Mountain cavern (Ironspine)
- Grassland (Dustmere Plains)
- Dark void (Ashlands / Boss arena default)
- Village square (Hearthhold)

These can be simple 800×400 tilemap compositions created in a free tool like **Tiled** (https://www.mapeditor.org/) or even manually assembled in the Canvas.

---

## 5. Sound Effects (Optional)

All sounds are optional but add immersion, especially for the 9-year-old on a tablet.

**Freesound.org** — Free sound effects (various licenses, filter by CC0)
- XP gain: coin chime / sparkle sound
- Level up: triumphant fanfare (short)
- Boss damage: impact thud
- Boss defeat: victory jingle
- Quest complete: scroll unrolling
- Button click: soft click / tap
- Loot purchase: chest open creak + sparkle

Save to: `/public/audio/` as small .mp3 or .ogg files.

**Important:** All sounds must be toggleable. Add a sound toggle in settings. Default to OFF — let kids turn it on if they want it.

---

## 6. License Compliance

Create `/CREDITS.md` in the project root:

```markdown
# Art Credits & Licenses

## Liberated Pixel Cup (LPC) Assets
- **Authors:** Lanea Zimmerman (Sharm), Stephen Challener (Redshrike), and contributors
- **License:** CC-BY-SA 3.0 / GPL 3.0 (dual-licensed)
- **Source:** https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles
- **Extensions:** https://lpc.opengameart.org/

## LPC Community Extensions
[List each additional pack with author, license, and URL]

## Kenney.nl Assets
- **Author:** Kenney Vleugels
- **License:** CC0 (Public Domain)
- **Source:** https://kenney.nl/

## Monster/Creature Sprites
[List each pack with author, license, and URL]

## Sound Effects
[List each sound with author, license, and source URL]
```

**CC-BY-SA 3.0 requirements:**
- Credit the author
- Link to the license: https://creativecommons.org/licenses/by-sa/3.0/
- If you modify the work, your modifications must also be CC-BY-SA 3.0
- Include this in the app's About/Credits page (accessible from settings)

**CC-BY 3.0 requirements:**
- Credit the author
- Link to the license
- Modifications allowed under any license

**CC0 requirements:**
- None (public domain). Attribution is nice but not required.

---

## 7. Quick-Start Download Checklist

Do these downloads during Phase 1 of the project plan:

- [ ] LPC base sprites (bodies, tilesets): https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles
- [ ] LPC character parts (browse and download): https://lpc.opengameart.org/
- [ ] At minimum: 4 body skin tones, 10 hair styles, 5 clothing sets, 5 weapons
- [ ] Kenney Pixel UI Pack: https://kenney.nl/assets/pixel-ui-pack
- [ ] Kenney Game Icons: https://kenney.nl/assets/game-icons
- [ ] Monster sprites: search OpenGameArt for "pixel monster," "pixel boss," "DCSS tiles"
- [ ] At minimum: 15 distinct monster base sprites
- [ ] Organize everything into `/public/sprites/` per the folder structure above
- [ ] Build the sprite manifest file cataloging every asset
- [ ] Create CREDITS.md with proper attribution
