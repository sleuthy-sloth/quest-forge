<!-- PLAN_HASH: 30uzp63lucvzo -->
# Next.js 14 to 16 Upgrade
Swarm: default
Phase: 1 [COMPLETE] | Updated: 2026-04-30T18:43:51.250Z

---
## Phase 1: Foundation & Baseline [COMPLETE]
- [x] 1.1: Capture pre-upgrade baseline: run npm run build, type-check, lint, and test. Record all outputs in .swarm/evidence/upgrade-baseline/ [SMALL]
- [x] 1.2: Create git branch for upgrade work. Run npm audit and pin current package-lock.json as rollback reference. [SMALL]

---
## Phase 2: Next.js 14 to 15 Upgrade [PENDING]
- [x] 2.1: Upgrade core dependencies: update package.json with next@^15, react@^19, react-dom@^19, @types/react@^19, @types/react-dom@^19, eslint-config-next@^15. Run npm install. [SMALL] (depends: 1.2)
- [x] 2.2: Run @next/codemod on src/app/ directory transforms. Then run on src/components/ and src/lib/. Review each codemod output file for correctness before committing. [MEDIUM] (depends: 2.1)
- [ ] 2.3: Update Supabase SSR integration: verify @supabase/ssr version, update cookie handling in src/lib/supabase/client.ts, server.ts, middleware.ts. Fix middleware.ts edge runtime patterns for Next.js 15. [MEDIUM] (depends: 2.2)
- [ ] 2.4: Fix React 19: update useEffect cleanup patterns, forwardRef usage, and children prop types across hooks/ (10 files), lib/ (40 files), and store/ (2 files). [LARGE] (depends: 2.3)
- [ ] 2.5: Fix React 19: update components/ directory — avatar, boss, combat, dashboard, games, hud, play, player, qf, quests, shop, story, ui component patterns for React 19 breaking changes. [LARGE] (depends: 2.4)
- [ ] 2.6: Fix React 19: update app/ route pages and server action files. Fix any dynamic/static export changes. [MEDIUM] (depends: 2.5)
- [ ] 2.7: Update existing test files (14 files) for React 19 compatibility: fix act() wrapping, cleanup patterns, type changes. [MEDIUM] (depends: 2.6)
- [ ] 2.8: Full QA pass on Next.js 15: npm run build, type-check, lint, test all pass. Verify no high-severity npm audit findings. [SMALL] (depends: 2.7)

---
## Phase 3: Next.js 15 to 16 Upgrade [PENDING]
- [ ] 3.1: Upgrade next@^16 and eslint-config-next@^16. Run npm install. Run @next/codemod for 15-to-16 transforms. [MEDIUM] (depends: 2.8)
- [ ] 3.2: Update build config for Turbopack: verify next.config.mjs images.remotePatterns, async headers(), reactStrictMode work. Fix any PostCSS/Tailwind pipeline issues. [SMALL] (depends: 3.1)
- [ ] 3.3: Fix Next.js 16 specific issues: edge middleware cookie API changes, server component rendering differences, and any remaining API deprecations. [MEDIUM] (depends: 3.2)
- [ ] 3.4: Update test files if any Next.js 16 related changes needed. Run full test suite. [SMALL] (depends: 3.3)
- [ ] 3.5: Full QA pass on Next.js 16: build, type-check, lint, tests. Run npm audit to confirm 0 high-severity vulns. [SMALL] (depends: 3.4)

---
## Phase 4: Runtime Verification [PENDING]
- [ ] 4.1: Manual smoke test: load login, signup, dashboard (all sub-routes), play (all sub-routes). Check for console errors, hydration mismatches, and auth flow (login as GM, login as player, logout). [MEDIUM] (depends: 3.5)
- [ ] 4.2: Run regression sweep with test_runner scope:impact on changed auth, middleware, and layout files. Run full test suite one final time. [SMALL] (depends: 4.1)
