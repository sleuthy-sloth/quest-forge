import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-void":    "var(--bg-void)",
        "bg-deep":    "var(--bg-deep)",
        "bg-surface": "var(--bg-surface)",
        "bg-card":    "var(--bg-card)",
        "gold-100": "var(--gold-100)",
        "gold-200": "var(--gold-200)",
        "gold-300": "var(--gold-300)",
        "gold-400": "var(--gold-400)",
        "gold-500": "var(--gold-500)",
        "gold-600": "var(--gold-600)",
        "ember-bright": "var(--ember-bright)",
        "ember-glow":   "var(--ember-glow)",
        "parchment":     "var(--text-primary)",
        "parchment-dim": "var(--text-secondary)",
        "quest-error":   "var(--error)",
        "quest-success": "var(--success)",
      },
      fontFamily: {
        pixel:   ["'Press Start 2P'", "monospace"],
        heading: ["Cinzel", "Georgia", "serif"],
        body:    ["'Crimson Text'", "Georgia", "serif"],
      },
      backgroundImage: {
        "radial-ember":
          "radial-gradient(ellipse at 50% 100%, rgba(201,125,10,0.18) 0%, transparent 65%)",
      },
    },
  },
  plugins: [],
};
export default config;
