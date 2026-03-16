import Link from 'next/link'

interface CreditEntry {
  name: string
  url: string
  author: string
  license: string
  licenseUrl: string
}

interface CreditGroup {
  category: string
  description: string
  entries: CreditEntry[]
}

const CREDITS: CreditGroup[] = [
  {
    category: 'Character Sprites — Liberated Pixel Cup',
    description: 'Player character bodies, hair, clothing, weapons, and the avatar compositor system.',
    entries: [
      {
        name: 'LPC Base Assets',
        url: 'https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles',
        author: 'Bart, Cce, Eliza Wyatt, Johann Charlot, Jrconway3, Lanea Zimmermann (Sharm), and others',
        license: 'CC-BY-SA 3.0 / GPL 3.0',
        licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
      },
      {
        name: 'Universal LPC Spritesheet (hair & armor variants)',
        url: 'https://opengameart.org/content/liberated-pixel-cup-character-generator',
        author: 'AntumDeluge, bluecarrot16, ElizaWy, Evert, Redshrike, Sharm, and LPC community contributors',
        license: 'CC-BY-SA 3.0 / GPL 3.0',
        licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
      },
    ],
  },
  {
    category: 'UI — Kenney',
    description: '9-slice panel borders for buttons, cards, modals, and progress bars. All Kenney assets are public domain.',
    entries: [
      {
        name: 'Pixel UI Pack',
        url: 'https://kenney.nl/assets/pixel-ui-pack',
        author: 'Kenney (kenney.nl)',
        license: 'CC0 1.0 — Public Domain',
        licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
      },
      {
        name: 'Game Icons',
        url: 'https://kenney.nl/assets/game-icons',
        author: 'Kenney (kenney.nl)',
        license: 'CC0 1.0 — Public Domain',
        licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
      },
    ],
  },
  {
    category: 'Boss & Monster Sprites',
    description: 'Enemy art used in weekly boss encounters, with palette swapping and CSS particle effects applied.',
    entries: [
      {
        name: 'Creatures (demon, medusa, jinn, dragon, lizard)',
        url: 'https://opengameart.org/content/creatures',
        author: 'Stealthix',
        license: 'CC-BY 3.0',
        licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
      },
      {
        name: 'Monster Pack (bat, bee, slime, worm, ghost, snake, and others)',
        url: 'https://opengameart.org/content/monster-pack',
        author: 'Calciumtrice',
        license: 'CC-BY 3.0',
        licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
      },
    ],
  },
  {
    category: 'Fonts',
    description: 'Typography used throughout the interface.',
    entries: [
      {
        name: 'Press Start 2P',
        url: 'https://fonts.google.com/specimen/Press+Start+2P',
        author: 'CodeMan38',
        license: 'SIL Open Font License 1.1',
        licenseUrl: 'https://scripts.sil.org/OFL',
      },
      {
        name: 'Cinzel',
        url: 'https://fonts.google.com/specimen/Cinzel',
        author: 'Natanael Gama',
        license: 'SIL Open Font License 1.1',
        licenseUrl: 'https://scripts.sil.org/OFL',
      },
      {
        name: 'Crimson Text',
        url: 'https://fonts.google.com/specimen/Crimson+Text',
        author: 'Sebastian Kosch',
        license: 'SIL Open Font License 1.1',
        licenseUrl: 'https://scripts.sil.org/OFL',
      },
    ],
  },
]

export default function AboutPage() {
  return (
    <main style={{ padding: '2rem', maxWidth: 720, margin: '0 auto' }}>
      <style suppressHydrationWarning>{`
        .credits-back {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-family: var(--font-heading, 'Cinzel', serif);
          font-size: 0.68rem;
          color: rgba(201,168,76,0.55);
          text-decoration: none;
          margin-bottom: 1.75rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          transition: color 0.15s;
        }
        .credits-back:hover { color: #c9a84c; }
        .credits-group {
          margin-bottom: 2rem;
        }
        .credits-group-title {
          font-family: var(--font-heading, 'Cinzel', serif);
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--gold-400, #c9a84c);
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(201,168,76,0.15);
          margin-bottom: 0.35rem;
        }
        .credits-group-desc {
          font-family: var(--font-heading, 'Cinzel', serif);
          font-size: 0.65rem;
          color: rgba(176,154,110,0.45);
          margin-bottom: 1rem;
          font-style: italic;
        }
        .credits-entry {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 0.35rem 1rem;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          align-items: start;
        }
        .credits-entry:last-child { border-bottom: none; }
        .credits-entry-name {
          font-family: var(--font-heading, 'Cinzel', serif);
          font-size: 0.75rem;
          color: rgba(240,230,200,0.85);
          text-decoration: none;
        }
        .credits-entry-name:hover { color: #c9a84c; text-decoration: underline; }
        .credits-entry-author {
          font-family: var(--font-heading, 'Cinzel', serif);
          font-size: 0.6rem;
          color: rgba(176,154,110,0.5);
          grid-column: 1;
        }
        .credits-entry-license {
          font-family: var(--font-pixel, 'Press Start 2P', monospace);
          font-size: 0.42rem;
          padding: 2px 5px;
          border: 1px solid rgba(201,168,76,0.25);
          color: rgba(201,168,76,0.65);
          text-decoration: none;
          white-space: nowrap;
          align-self: start;
          line-height: 1.6;
          image-rendering: pixelated;
          transition: color 0.15s, border-color 0.15s;
        }
        .credits-entry-license:hover { color: #c9a84c; border-color: rgba(201,168,76,0.6); }
        .credits-note {
          font-family: var(--font-heading, 'Cinzel', serif);
          font-size: 0.62rem;
          color: rgba(176,154,110,0.35);
          margin-top: 2rem;
          padding-top: 1.25rem;
          border-top: 1px solid rgba(201,168,76,0.08);
          line-height: 1.7;
        }
        .credits-note a {
          color: rgba(201,168,76,0.55);
          text-decoration: underline;
        }
        .credits-note a:hover { color: #c9a84c; }
      `}</style>

      <Link href="/dashboard/settings" className="credits-back">
        ‹ Settings
      </Link>

      <h1 style={{
        fontFamily: 'var(--font-heading, "Cinzel", serif)',
        fontSize: '1rem',
        letterSpacing: '0.15em',
        color: '#c9a84c',
        marginBottom: '0.4rem',
        textTransform: 'uppercase',
      }}>
        Credits &amp; Art Attribution
      </h1>
      <p style={{
        fontFamily: 'var(--font-heading, "Cinzel", serif)',
        fontSize: '0.68rem',
        color: 'rgba(176,154,110,0.4)',
        marginBottom: '2rem',
        fontStyle: 'italic',
      }}>
        Quest Forge is built with open-source art. Full attribution below.
      </p>

      {CREDITS.map((group) => (
        <section key={group.category} className="credits-group">
          <div className="credits-group-title">{group.category}</div>
          <p className="credits-group-desc">{group.description}</p>
          {group.entries.map((entry) => (
            <div key={entry.name} className="credits-entry">
              <a
                href={entry.url}
                target="_blank"
                rel="noopener noreferrer"
                className="credits-entry-name"
              >
                {entry.name}
              </a>
              <a
                href={entry.licenseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="credits-entry-license"
              >
                {entry.license}
              </a>
              <span className="credits-entry-author">{entry.author}</span>
            </div>
          ))}
        </section>
      ))}

      <p className="credits-note">
        Full attribution details and contributor lists are maintained in{' '}
        <a
          href="https://github.com/sleuthy-sloth/quest-forge/blob/main/CREDITS.md"
          target="_blank"
          rel="noopener noreferrer"
        >
          CREDITS.md
        </a>{' '}
        in the project repository. All assets are used in accordance with their respective licenses.
        Quest Forge source code is not covered by these licenses.
      </p>
    </main>
  )
}
