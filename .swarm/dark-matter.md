## Dark Matter: Hidden Couplings

Found 20 file pairs that frequently co-change but have no import relationship:

| File A | File B | NPMI | Co-Changes | Lift |
|--------|--------|------|------------|------|
| package-lock.json | package.json | 0.974 | 12 | 20.69 |
| src/components/shop/ShopModal.tsx | src/types/shop.ts | 0.936 | 3 | 67.25 |
| src/components/dashboard/GmWalkthroughOverlay.tsx | src/components/play/WalkthroughOverlay.tsx | 0.936 | 3 | 67.25 |
| src/app/api/loot/purchase/route.ts | src/lib/__tests__/purchase.test.ts | 0.886 | 3 | 53.80 |
| src/components/games/ScienceLabyrinth.tsx | src/components/games/WordForge.tsx | 0.879 | 21 | 9.42 |
| src/types/database.ts | src/types/shop.ts | 0.835 | 4 | 33.63 |
| src/components/games/MathArena.tsx | src/components/games/WordForge.tsx | 0.800 | 20 | 8.01 |
| src/components/games/MathArena.tsx | src/components/games/ScienceLabyrinth.tsx | 0.785 | 20 | 7.69 |
| src/store/useQuestStore.ts | src/types/shop.ts | 0.782 | 4 | 26.90 |
| src/components/shop/ShopModal.tsx | src/types/database.ts | 0.782 | 3 | 33.63 |
| src/app/login/page.tsx | src/middleware.ts | 0.748 | 3 | 28.82 |
| src/components/shop/ShopModal.tsx | src/store/useQuestStore.ts | 0.732 | 3 | 26.90 |
| src/app/api/gm/household/route.ts | src/app/dashboard/settings/page.tsx | 0.732 | 3 | 26.90 |
| src/components/games/MathArena.tsx | src/components/games/QuizInterface.tsx | 0.700 | 14 | 7.91 |
| src/components/avatar/AvatarPreview.tsx | src/lib/sprites/manifest.ts | 0.692 | 3 | 22.42 |
| src/hooks/useAvatar.ts | src/lib/sprites/compositor.ts | 0.674 | 3 | 20.69 |
| src/components/boss/BossSprite.tsx | src/lib/sprites/proceduralBosses.tsx | 0.668 | 3 | 20.18 |
| src/app/layout.tsx | src/app/page.tsx | 0.668 | 3 | 20.18 |
| src/components/boss/BossSprite.tsx | src/lib/sprites/palette.ts | 0.668 | 3 | 20.18 |
| src/app/play/create-character/page.tsx | src/components/avatar/AvatarPreview.tsx | 0.668 | 3 | 20.18 |

These pairs likely share an architectural concern invisible to static analysis.
Consider adding explicit documentation or extracting the shared concern.