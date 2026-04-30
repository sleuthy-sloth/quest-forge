# Specification: Next.js 14 → 16 Upgrade

## Feature Description
Upgrade the Next.js framework from version 14.2.35 to version 16.2.4, along with all associated dependencies (React 18 → 19, TypeScript types, ESLint config). This resolves 5 remaining high/moderate dependency vulnerabilities pinned to the Next.js 14 dependency tree and unlocks the latest framework features, performance improvements, and security patches.

The upgrade spans two major versions (14 → 15 → 16). Each major version must be executed as a discrete step with a full QA pass before proceeding to the next, ensuring regressions are caught early.

## Who Needs This
- The project needs the dependency audit to show zero high-severity CVEs
- Developers need access to Next.js 16 features (improved Turbopack, React Server Components enhancements, stable performance improvements)
- The app must continue working correctly across all 42 routes, 22 API routes, and authentication flows

## User Scenarios

### Scenario 1: Next.js 14 → 15 Migration
**Given** the project is on Next.js 14.2.35 with React 18  
**When** Next.js 15 is installed along with React 19 and all associated dependency updates  
**Then** the project builds, type-checks, and all tests pass. All 42 routes render correctly. Auth flows work. No console errors on any page.

### Scenario 2: Next.js 15 → 16 Migration
**Given** the project is on Next.js 15 with React 19  
**When** Next.js 16 is installed  
**Then** the project builds, type-checks, and all tests pass. No regressions from the 14→15 step.

### Scenario 3: Breaking Change Remediation
**Given** a breaking change identified during the upgrade (e.g., React 18 API removal, Turbopack configuration change, Supabase SSR cookie handling)  
**When** the affected code is updated to use the new API  
**Then** the change compiles, type-checks pass, and the affected feature behaves identically to the pre-upgrade behavior.

## Functional Requirements

### FR-001: Next.js 14 → 15 Upgrade (Step 1)
The system MUST:
- Upgrade `next` from `14.2.35` to the latest `^15` release
- Upgrade `react` and `react-dom` from `^18` to `^19`
- Upgrade `@types/react` and `@types/react-dom` from `^18` to `^19`
- Upgrade `eslint-config-next` to match the Next.js 15 version
- Run `npx @next/codemod@latest` to apply automatic migration transforms
- Verify `@supabase/ssr` version is compatible with Next.js 15 (upgrade if needed)
- Verify `framer-motion` ^12 works with React 19
- Run the full build, type-check, lint, and test suite after each dependency change

### FR-002: Next.js 15 → 16 Upgrade (Step 2)
The system MUST:
- Upgrade `next` from `^15` to `^16`
- Upgrade `eslint-config-next` to match
- Run `npx @next/codemod@latest` for Next.js 16-specific transforms
- Run the full build, type-check, lint, and test suite

### FR-003: React 18 → 19 Migration
The system MUST address all React 18→19 breaking changes:
- `ReactDOM.render` removal — verify no legacy render calls exist
- `useEffect` cleanup timing changes — verify no component relies on synchronous cleanup
- `forwardRef` and `createRef` API stability — verify no breakage in 60+ components
- `children` prop typing — verify proper `ReactNode` usage across server/client boundaries
- `act()` testing utility changes — verify all 144+ tests pass

### FR-004: Turbopack Configuration Compatibility
The system MUST verify the Next.js build configuration works with Turbopack (default in Next.js 16):
- `next.config.mjs` — verify `images.remotePatterns` and `async headers()` work with Turbopack
- Tailwind CSS — verify PostCSS pipeline works with Turbopack
- SWC configuration — verify all customizations are Turbopack-compatible

### FR-005: Auth and Middleware Compatibility
The system MUST verify:
- `src/middleware.ts` (Edge Runtime) works with Next.js 16's edge runtime
- `@supabase/ssr` cookie-based session handling works with new middleware semantics
- `src/app/auth/callback/route.ts` cookie setAll/getAll pattern works
- All 8 auth-related API routes continue to function

### FR-006: Build and Test Integrity
After each upgrade step, the system MUST:
- `npm run build` MUST exit with code 0
- `npm run type-check` MUST exit with code 0  
- `npm run lint` MUST exit with code 0
- `npm test` MUST show 0 failures (unchanged from pre-upgrade baseline)

### FR-007: Runtime Verification
After the full upgrade, these runtime behaviors MUST be confirmed:
- Root layout renders without hydration errors
- Login page loads and allows GM/Player tab switching
- Dashboard loads and shows GM data
- Academy page renders with all 8 game cards
- Server actions (auth.ts, cache.ts, save-character.ts) return correct responses
- API routes return expected status codes and response shapes

## Success Criteria

### SC-001: Build Green
Both upgrade steps complete with `npm run build`, `npm run type-check`, and `npm run lint` all passing. All 14 test files pass with 144+ tests at 0 failures.

### SC-002: No User-Facing Regressions
After the upgrade, every major route loads without console errors: login, signup, dashboard (all sub-routes), play (all sub-routes), and all API routes return expected responses.

### SC-003: Dependency Vulnerabilities Resolved
`npm audit` shows 0 high-severity vulnerabilities. The 5 remaining CVEs (pinned to Next.js 14's dependency tree) are resolved by the upgrade.

### SC-004: Incremental Rollback Path
Each upgrade step (14→15, 15→16) is a discrete commit with a clear rollback point. If step 2 fails, the project can remain on step 1 (Next.js 15) while issues are resolved.

## Key Entities
- **Next.js versions**: 14.2.35 (current), ^15.x (intermediate), ^16.x (target)
- **React versions**: 18.x (current), 19.x (target)
- **Build pipeline**: next.config.mjs, PostCSS/Tailwind, SWC, Turbopack
- **Runtime**: Edge Middleware, Node.js API routes, React Server/Client Components
- **Auth**: Supabase SSR, middleware session handling, cookie management

## Edge Cases and Failure Modes
- `@supabase/ssr` may have breaking changes in a newer version that's required for Next.js 15/16 compatibility — pin version during debugging
- Turbopack may not support all next.config options — fall back to webpack if needed
- React 19's stricter `act()` may cause existing tests to fail — update test wrappers
- `framer-motion` React 19 support was added in v12 — verify no animation breakage
- Some `'use client'` components may need to be converted to server components for Turbopack optimization
- The `dynamic = 'force-dynamic'` export on login and signup pages may need updating for Next.js 16
- Edge middleware cookie handling changed significantly between Next.js 14 and 16 — this is the highest-risk area

[NEEDS CLARIFICATION] Should the upgrade be done in a single PR/commit, or as two sequential PRs (one for 14→15, one for 15→16)?

[NEEDS CLARIFICATION] Is there a staging/testing environment where the upgraded app can be exercised before merging to main?
