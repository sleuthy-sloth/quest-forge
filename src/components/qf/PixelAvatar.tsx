type ClassId =
  | 'blazewarden'
  | 'lorescribe'
  | 'shadowstep'
  | 'hearthkeeper'
  | 'stormcaller'
  | 'ironvow'

interface Palette {
  skin: string
  hair: string
  armor: string
  accent: string
  weapon: string
}

const PALETTES: Record<ClassId, Palette> = {
  blazewarden:  { skin: '#e8b896', hair: '#3d2818', armor: '#a83c1a', accent: '#f9c846', weapon: '#cccccc' },
  lorescribe:   { skin: '#e8b896', hair: '#5d3a1a', armor: '#2a4575', accent: '#b070d4', weapon: '#8b4513' },
  shadowstep:   { skin: '#d8a888', hair: '#1a1a1a', armor: '#1a1a2a', accent: '#6890d4', weapon: '#888888' },
  hearthkeeper: { skin: '#e8c098', hair: '#c8a040', armor: '#dca830', accent: '#fff8e7', weapon: '#f9c846' },
  stormcaller:  { skin: '#e0b08a', hair: '#6a4f30', armor: '#3a6a4a', accent: '#8ad0a0', weapon: '#7a5530' },
  ironvow:      { skin: '#d8a888', hair: '#888888', armor: '#5a5a5a', accent: '#cccccc', weapon: '#aaaaaa' },
}

// 12x12 sprite — '.' = transparent. H=hair, S=skin, e=eye(accent), m=mouth,
// w=weapon, A/P=armor, a=belt(accent), b=boot.
const GRID = [
  '....HHHH....',
  '...HHHHHH...',
  '..HSSSSSSH..',
  '..HSeeSeeS..',
  '..HSSmSSSS..',
  '..wAAAAAAw..',
  '..AAAAAAAA..',
  '..AAaAAaAA..',
  '..AAAAAAAA..',
  '..PPPPPPPP..',
  '..PP.PP.PP..',
  '..bb.bb.bb..',
]

interface PixelAvatarProps {
  klass?: string | null
  size?: number
}

/**
 * Class-themed pixel-art avatar drawn as a 12x12 CSS grid. Class-specific
 * palette colors swap in for hair/armor/accent. Falls back to blazewarden
 * for unknown class IDs.
 */
export function PixelAvatar({ klass = 'blazewarden', size = 48 }: PixelAvatarProps) {
  const id = (klass ?? 'blazewarden') as ClassId
  const p = PALETTES[id] ?? PALETTES.blazewarden
  const colorMap: Record<string, string> = {
    H: p.hair,
    S: p.skin,
    A: p.armor,
    P: p.armor,
    b: '#2a1810',
    a: p.accent,
    e: p.accent,
    m: '#5a2a1a',
    w: p.weapon,
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gridTemplateRows: 'repeat(12, 1fr)',
        imageRendering: 'pixelated',
      }}
      aria-hidden="true"
    >
      {GRID.flatMap((row, ri) =>
        row.split('').map((ch, ci) => (
          <div
            key={`${ri}-${ci}`}
            style={{ background: colorMap[ch] || 'transparent' }}
          />
        )),
      )}
    </div>
  )
}

export default PixelAvatar
