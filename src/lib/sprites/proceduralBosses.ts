// src/lib/sprites/proceduralBosses.ts

import type { BossPalette } from './palette'

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Converts #rrggbb to rgba(r,g,b,a) */
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

// ── Type ─────────────────────────────────────────────────────────────────────

export type ProceduralDrawFn = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: BossPalette,
  timestamp: number,
) => void

// ── Registry ─────────────────────────────────────────────────────────────────

export const PROCEDURAL_BOSS_REGISTRY: Record<string, ProceduralDrawFn> = {
  procedural_treant: drawTreant,
  procedural_giant: drawGiant,
  procedural_golem: drawGolem,
  procedural_flame: drawFlame,
  procedural_hollow_king: drawHollowKing,
}

// ── 1. Blighted Treant ───────────────────────────────────────────────────────

function drawTreant(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: BossPalette,
  timestamp: number,
): void {
  ctx.imageSmoothingEnabled = false

  const cx = width / 2
  const trunkBottomY = height * 0.95
  const trunkTopY = height * 0.35
  const trunkBottomW = width * 0.22
  const trunkTopW = width * 0.12

  // Trunk fill
  ctx.beginPath()
  ctx.moveTo(cx - trunkTopW / 2, trunkTopY)
  ctx.lineTo(cx + trunkTopW / 2, trunkTopY)
  ctx.lineTo(cx + trunkBottomW / 2, trunkBottomY)
  ctx.lineTo(cx - trunkBottomW / 2, trunkBottomY)
  ctx.closePath()
  ctx.fillStyle = hexToRgba(palette.primary, 1)
  ctx.fill()

  // Bark texture: 9 wavy vertical strokes
  for (let i = 0; i < 9; i++) {
    const t = i / 8
    const xBase = cx - trunkBottomW / 2 + trunkBottomW * t
    const topX = cx - trunkTopW / 2 + trunkTopW * t
    const steps = 6
    ctx.beginPath()
    ctx.moveTo(topX, trunkTopY)
    for (let s = 1; s <= steps; s++) {
      const frac = s / steps
      const y = trunkTopY + (trunkBottomY - trunkTopY) * frac
      const wave = Math.sin(xBase * 0.03 + s * 1.2) * (width * 0.015)
      ctx.lineTo(topX + wave, y)
    }
    ctx.strokeStyle = hexToRgba(palette.secondary, 0.5)
    ctx.lineWidth = 2
    ctx.stroke()
  }

  // Hollow core cavity – glowing oval
  const cavityPulse = Math.sin(timestamp / 800) * 0.15 + 0.35
  const cavityW = width * 0.06
  const cavityH = height * 0.12
  ctx.beginPath()
  ctx.ellipse(cx, height * 0.58, cavityW, cavityH, 0, 0, Math.PI * 2)
  ctx.fillStyle = hexToRgba(palette.accent, cavityPulse)
  ctx.fill()

  // Blight spots – 6 small irregular circles
  const blightPositions = [
    { x: 0.3, y: 0.45 },
    { x: 0.7, y: 0.5 },
    { x: 0.4, y: 0.65 },
    { x: 0.65, y: 0.6 },
    { x: 0.25, y: 0.72 },
    { x: 0.55, y: 0.78 },
  ]
  for (let i = 0; i < 6; i++) {
    const bp = blightPositions[i]
    const bx = cx - trunkBottomW * 0.4 + trunkBottomW * 0.8 * bp.x
    const by = trunkTopY + (trunkBottomY - trunkTopY) * bp.y
    const pulse = (Math.sin(timestamp / 600 + i * 1.3) + 1) / 2
    const alpha = 0.4 + pulse * 0.2
    const r = width * 0.025 * (0.8 + pulse * 0.4)
    ctx.beginPath()
    ctx.arc(bx, by, r, 0, Math.PI * 2)
    ctx.fillStyle = hexToRgba(palette.accent, alpha)
    ctx.fill()
  }

  // Branch system — recursive
  function drawBranch(
    x: number,
    y: number,
    angle: number,
    len: number,
    depth: number,
    idx: number,
  ) {
    if (depth === 0 || len < 4) return
    const sway = Math.sin(timestamp / 2000 + idx * 0.7) * 0.12
    const a = angle + sway
    const ex = x + Math.cos(a) * len
    const ey = y + Math.sin(a) * len
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(ex, ey)
    ctx.strokeStyle = hexToRgba(palette.primary, 1)
    ctx.lineWidth = Math.max(1.5, depth * 2)
    ctx.stroke()

    if (depth > 1) {
      const spread = Math.PI / 3.5
      const count = 3
      for (let j = 0; j < count; j++) {
        const a2 = a - spread / 2 + (spread / (count - 1 || 1)) * j
        drawBranch(ex, ey, a2, len * 0.62, depth - 1, idx * 10 + j)
      }
    }
  }

  const primaryBranches = 4
  for (let i = 0; i < primaryBranches; i++) {
    const baseAngle = -Math.PI / 2 + (i - primaryBranches / 2 + 0.5) * (Math.PI / 6)
    const baseX = cx - trunkTopW / 2 + trunkTopW * ((i + 0.5) / primaryBranches)
    drawBranch(baseX, trunkTopY, baseAngle, height * 0.22, 3, i)
  }

  // Blight tip wisps – 12 small circles at varied positions near branch tips
  for (let i = 0; i < 12; i++) {
    const bx = cx + (Math.sin(i * 1.7) * width * 0.35)
    const by = height * 0.18 + Math.abs(Math.sin(i * 2.3)) * height * 0.12
    const alpha = (Math.sin(timestamp / 600 + i * 0.9) + 1) / 2
    const r = width * 0.012
    ctx.beginPath()
    ctx.arc(bx, by, r, 0, Math.PI * 2)
    ctx.fillStyle = hexToRgba(palette.accent, alpha * 0.8)
    ctx.fill()
  }

  // Root system – 5 curving lines from base
  const rootCount = 5
  for (let i = 0; i < rootCount; i++) {
    const dir = i < rootCount / 2 ? -1 : 1
    const startX = cx + dir * trunkBottomW * 0.3
    const steps = 5
    ctx.beginPath()
    ctx.moveTo(startX, trunkBottomY)
    let rx = startX
    let ry = trunkBottomY
    for (let s = 1; s <= steps; s++) {
      const frac = s / steps
      const wave = Math.sin(i * 2.1 + s * 1.5) * width * 0.04
      rx = startX + dir * width * 0.18 * frac + wave
      ry = trunkBottomY + height * 0.04 * frac
      ctx.lineTo(rx, ry)
    }
    ctx.strokeStyle = hexToRgba(palette.secondary, 0.7)
    ctx.lineWidth = 2.5
    ctx.stroke()
  }
}

// ── 2. Ashen Giant ───────────────────────────────────────────────────────────

function drawGiant(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: BossPalette,
  timestamp: number,
): void {
  ctx.imageSmoothingEnabled = false

  const cx = width / 2
  const headCY = height * 0.12
  const headW = width * 0.18
  const headH = height * 0.1

  // Head ellipse
  ctx.beginPath()
  ctx.ellipse(cx, headCY, headW, headH, 0, 0, Math.PI * 2)
  ctx.fillStyle = hexToRgba(palette.primary, 1)
  ctx.fill()

  // Body: hunched tapering rectangle
  const shoulderY = headCY + headH
  const waistY = height * 0.68
  const shoulderW = width * 0.32
  const waistW = width * 0.45
  ctx.beginPath()
  ctx.moveTo(cx - shoulderW / 2, shoulderY)
  ctx.lineTo(cx + shoulderW / 2, shoulderY)
  ctx.lineTo(cx + waistW / 2, waistY)
  ctx.lineTo(cx - waistW / 2, waistY)
  ctx.closePath()
  ctx.fillStyle = hexToRgba(palette.primary, 1)
  ctx.fill()

  // Arms – two thick tapered strokes
  function drawArm(side: -1 | 1) {
    const shoulderX = cx + side * shoulderW / 2
    const handY = height * 0.55
    const handX = cx + side * width * 0.42
    ctx.beginPath()
    ctx.moveTo(shoulderX, shoulderY + height * 0.04)
    ctx.lineTo(handX, handY)
    ctx.lineWidth = width * 0.07
    ctx.strokeStyle = hexToRgba(palette.primary, 1)
    ctx.lineCap = 'round'
    ctx.stroke()

    // 3 claw strokes
    for (let c = 0; c < 3; c++) {
      const clawAngle = side * (Math.PI / 2 + (c - 1) * 0.35)
      ctx.beginPath()
      ctx.moveTo(handX, handY)
      const clawLen = width * 0.06
      ctx.lineTo(handX + Math.cos(clawAngle) * clawLen, handY + Math.sin(clawAngle) * clawLen)
      ctx.lineWidth = 3
      ctx.strokeStyle = hexToRgba(palette.primary, 0.8)
      ctx.stroke()
    }
  }
  drawArm(-1)
  drawArm(1)

  // Legs – short wide rectangles, partially buried
  const legW = width * 0.15
  const legH = height * 0.15
  const legY = height * 0.82
  ctx.fillStyle = hexToRgba(palette.primary, 1)
  ctx.fillRect(cx - legW * 1.3, legY, legW, legH)
  ctx.fillRect(cx + legW * 0.3, legY, legW, legH)

  // Ground ash / fog
  ctx.beginPath()
  ctx.ellipse(cx, height * 0.95, width * 0.55, height * 0.06, 0, 0, Math.PI * 2)
  ctx.fillStyle = hexToRgba(palette.secondary, 0.3)
  ctx.fill()

  // Crumbling edges – 25 tiny 2×2 squares
  const edgePoints = [
    // head scatter
    { x: cx - headW * 1.1, y: headCY - headH * 0.3 }, { x: cx + headW * 1.05, y: headCY + headH * 0.2 },
    { x: cx - headW * 0.9, y: headCY + headH * 0.8 }, { x: cx + headW * 1.1, y: headCY - headH * 0.5 },
    // shoulder scatter
    { x: cx - shoulderW * 1.15, y: shoulderY + height * 0.05 },
    { x: cx + shoulderW * 1.1, y: shoulderY - height * 0.02 },
    { x: cx - shoulderW * 1.2, y: shoulderY + height * 0.12 },
    { x: cx + shoulderW * 1.18, y: shoulderY + height * 0.1 },
    // arm scatter
    { x: cx - width * 0.52, y: height * 0.4 }, { x: cx + width * 0.5, y: height * 0.42 },
    { x: cx - width * 0.5, y: height * 0.5 }, { x: cx + width * 0.52, y: height * 0.48 },
    // waist scatter
    { x: cx - waistW * 1.08, y: waistY + height * 0.05 },
    { x: cx + waistW * 1.06, y: waistY - height * 0.02 },
    { x: cx - waistW * 1.1, y: waistY + height * 0.1 },
    { x: cx + waistW * 1.08, y: waistY + height * 0.08 },
    // leg scatter
    { x: cx - legW * 1.4, y: legY + height * 0.03 },
    { x: cx + legW * 1.2, y: legY + height * 0.05 },
    { x: cx - legW * 1.5, y: legY + height * 0.08 },
    { x: cx + legW * 1.35, y: legY + height * 0.06 },
    // extra fill
    { x: cx - headW * 0.5, y: headCY - headH * 1.1 },
    { x: cx + headW * 0.6, y: headCY - headH * 0.9 },
    { x: cx - shoulderW * 0.8, y: shoulderY - height * 0.08 },
    { x: cx + shoulderW * 0.85, y: shoulderY + height * 0.06 },
    { x: cx - waistW * 0.9, y: waistY - height * 0.06 },
  ]
  for (let i = 0; i < 25; i++) {
    const ep = edgePoints[i]
    const drift = Math.sin(timestamp / 1000 + i * 1.1) * 2
    ctx.fillStyle = hexToRgba(palette.secondary, 0.4)
    ctx.fillRect((ep.x + drift) | 0, (ep.y + drift) | 0, 2, 2)
  }

  // Chest crack – jagged line
  ctx.beginPath()
  ctx.moveTo(cx, shoulderY + height * 0.06)
  ctx.lineTo(cx - width * 0.04, shoulderY + height * 0.15)
  ctx.lineTo(cx + width * 0.03, shoulderY + height * 0.22)
  ctx.lineTo(cx - width * 0.02, shoulderY + height * 0.3)
  ctx.lineTo(cx + width * 0.01, shoulderY + height * 0.38)
  ctx.strokeStyle = hexToRgba(palette.accent, 0.3)
  ctx.lineWidth = 2
  ctx.stroke()
}

// ── 3. Rusted Golem ──────────────────────────────────────────────────────────

function drawGolem(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: BossPalette,
  timestamp: number,
): void {
  ctx.imageSmoothingEnabled = false

  const cx = width / 2
  const platePositions = [
    // [x, y, w, h, colorKey]  — colorKey: 0=primary, 1=secondary
    { x: cx - width * 0.25, y: height * 0.18, w: width * 0.5, h: height * 0.18, c: 0 },
    { x: cx - width * 0.3, y: height * 0.33, w: width * 0.6, h: height * 0.16, c: 1 },
    { x: cx - width * 0.22, y: height * 0.46, w: width * 0.44, h: height * 0.2, c: 0 },
    { x: cx - width * 0.32, y: height * 0.63, w: width * 0.64, h: height * 0.14, c: 1 },
    { x: cx - width * 0.2, y: height * 0.74, w: width * 0.4, h: height * 0.18, c: 0 },
  ]
  for (const p of platePositions) {
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
    ctx.lineTo(p.x + p.w, p.y)
    ctx.lineTo(p.x + p.w * 1.05, p.y + p.h)
    ctx.lineTo(p.x - p.w * 0.05, p.y + p.h)
    ctx.closePath()
    ctx.fillStyle = hexToRgba(p.c === 0 ? palette.primary : palette.secondary, 1)
    ctx.fill()
  }

  // Gear circles – 4 concentric ring pairs
  const gearCenters = [
    { x: cx - width * 0.3, y: height * 0.25 },
    { x: cx + width * 0.28, y: height * 0.25 },
    { x: cx, y: height * 0.38 },
    { x: cx - width * 0.25, y: height * 0.7 },
    { x: cx + width * 0.2, y: height * 0.85 },
  ]
  const gearSizes = [width * 0.1, width * 0.08, width * 0.12, width * 0.09, width * 0.07]
  for (let i = 0; i < gearCenters.length; i++) {
    const g = gearCenters[i]
    const outerR = gearSizes[i]
    const innerR = outerR * 0.55
    // Outer ring
    ctx.beginPath()
    ctx.arc(g.x, g.y, outerR, 0, Math.PI * 2)
    ctx.strokeStyle = hexToRgba(palette.secondary, 0.9)
    ctx.lineWidth = 3
    ctx.stroke()
    // Inner fill
    ctx.beginPath()
    ctx.arc(g.x, g.y, innerR, 0, Math.PI * 2)
    ctx.fillStyle = hexToRgba(palette.primary, 1)
    ctx.fill()
  }

  // Corruption cracks – 6 diagonal/zigzag strokes
  const crackStarts = [
    { x: cx - width * 0.18, y: height * 0.22 },
    { x: cx + width * 0.12, y: height * 0.35 },
    { x: cx - width * 0.25, y: height * 0.5 },
    { x: cx + width * 0.18, y: height * 0.6 },
    { x: cx - width * 0.1, y: height * 0.7 },
    { x: cx + width * 0.05, y: height * 0.4 },
  ]
  for (let i = 0; i < 6; i++) {
    const cs = crackStarts[i]
    const len = width * 0.12
    const angle = -Math.PI / 4 + i * 0.3
    ctx.beginPath()
    ctx.moveTo(cs.x, cs.y)
    ctx.lineTo(cs.x + Math.cos(angle) * len, cs.y + Math.sin(angle) * len * 0.4)
    ctx.lineTo(cs.x + Math.cos(angle) * len * 1.4, cs.y + Math.sin(angle) * len * 0.9)
    ctx.strokeStyle = hexToRgba(palette.accent, 0.3 + (i % 3) * 0.08)
    ctx.lineWidth = 2
    ctx.stroke()
  }

  // Eye slits – 2 narrow horizontal glowing rectangles
  const eyeY = height * 0.2
  const eyeW = width * 0.08
  const eyeH = height * 0.025
  const eyeAlpha = Math.abs(Math.sin(timestamp / 800)) * 0.7 + 0.3
  ctx.fillStyle = hexToRgba(palette.accent, eyeAlpha)
  ctx.fillRect(cx - width * 0.12 - eyeW / 2, eyeY, eyeW, eyeH)
  ctx.fillRect(cx + width * 0.12 - eyeW / 2, eyeY, eyeW, eyeH)

  // Hollow energy exhaust – 5 small glowing circles at intersections
  const exhaustPositions = [
    { x: cx - width * 0.15, y: height * 0.38 },
    { x: cx + width * 0.18, y: height * 0.45 },
    { x: cx - width * 0.05, y: height * 0.55 },
    { x: cx + width * 0.08, y: height * 0.65 },
    { x: cx, y: height * 0.75 },
  ]
  for (let i = 0; i < 5; i++) {
    const e = exhaustPositions[i]
    const pulse = (Math.sin(timestamp / 400 + i * 1.2) + 1) / 2
    const alpha = 0.5 + pulse * 0.3
    const r = width * 0.015 + pulse * width * 0.008
    ctx.beginPath()
    ctx.arc(e.x, e.y, r, 0, Math.PI * 2)
    ctx.fillStyle = hexToRgba(palette.glow, alpha)
    ctx.fill()
  }
}

// ── 4. Formless False Fire ───────────────────────────────────────────────────

function drawFlame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: BossPalette,
  timestamp: number,
): void {
  ctx.imageSmoothingEnabled = false

  const cx = width / 2
  const cy = height * 0.5

  // Anti-light core: radial gradient centered, secondary → transparent
  const coreRadius = (Math.sin(timestamp / 1000) * 0.1 + 0.6) * Math.min(width, height)
  const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius)
  coreGrad.addColorStop(0, hexToRgba(palette.secondary, 0.9))
  coreGrad.addColorStop(0.5, hexToRgba(palette.secondary, 0.4))
  coreGrad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.beginPath()
  ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2)
  ctx.fillStyle = coreGrad
  ctx.fill()

  // Flame layers – 3 bezier closed paths
  const layers = [
    { scale: 0.9, color: palette.primary, alpha: 0.5, offset: 0 },
    { scale: 0.7, color: palette.secondary, alpha: 0.6, offset: 0.3 },
    { scale: 0.5, color: palette.accent, alpha: 0.4, offset: 0.6 },
  ]
  for (let li = 0; li < layers.length; li++) {
    const layer = layers[li]
    const tilt = Math.sin(timestamp / 600 + li * 0.8) * 0.15
    const baseW = width * 0.3 * layer.scale
    const tipY = height * 0.08
    const baseY = height * 0.88

    ctx.beginPath()
    ctx.moveTo(cx, baseY)
    // Left side bezier: bottom → mid-left → mid-right (tip)
    const cp1x = cx - baseW * 1.2 + Math.sin(timestamp / 700 + li) * width * 0.05
    const cp1y = baseY - (baseY - tipY) * 0.4
    const cp2x = cx - baseW * 0.4 + tilt * width
    const cp2y = tipY + (baseY - tipY) * 0.3
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, cx + tilt * width * 0.3, tipY)
    // Right side bezier: tip → mid-right → bottom
    const cp3x = cx + baseW * 0.4 + tilt * width
    const cp3y = tipY + (baseY - tipY) * 0.3
    const cp4x = cx + baseW * 1.2 + Math.sin(timestamp / 700 + li + 2) * width * 0.05
    const cp4y = baseY - (baseY - tipY) * 0.4
    ctx.bezierCurveTo(cp3x, cp3y, cp4x, cp4y, cx, baseY)
    ctx.closePath()
    ctx.fillStyle = hexToRgba(layer.color, layer.alpha)
    ctx.fill()
  }

  // Crown sparks – 9 radiating strokes from flame tip area
  const tipX = cx
  const tipY = height * 0.08
  for (let i = 0; i < 9; i++) {
    const baseAngle = (i / 9) * Math.PI * 2
    const angle = baseAngle + timestamp / 2000
    const len = 5 + (i % 3) * 5
    const sparkX = tipX + Math.cos(angle) * width * 0.08
    const sparkY = tipY + Math.sin(angle) * height * 0.06
    ctx.beginPath()
    ctx.moveTo(sparkX, sparkY)
    ctx.lineTo(sparkX + Math.cos(angle) * len, sparkY + Math.sin(angle) * len)
    ctx.strokeStyle = hexToRgba(palette.accent, 0.8)
    ctx.lineWidth = 2
    ctx.stroke()
  }

  // Anti-glow border: darkening at edges
  const borderGrad = ctx.createRadialGradient(cx, cy, Math.min(width, height) * 0.3, cx, cy, Math.min(width, height) * 0.8)
  borderGrad.addColorStop(0, 'rgba(0,0,0,0)')
  borderGrad.addColorStop(0.6, hexToRgba(palette.primary, 0.3))
  borderGrad.addColorStop(1, hexToRgba(palette.primary, 0.7))
  ctx.fillStyle = borderGrad
  ctx.fillRect(0, 0, width, height)
}

// ── 5. Final Boss: Hollow King ───────────────────────────────────────────────

function drawHollowKing(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: BossPalette,
  timestamp: number,
): void {
  ctx.imageSmoothingEnabled = false

  const cx = width / 2
  const cy = height * 0.45

  // Void form: 8 overlapping filled ellipses at low alpha, massive silhouette
  const voidEllipses = [
    { x: cx, y: cy - height * 0.25, w: width * 0.28, h: height * 0.18, a: 0.2 },
    { x: cx - width * 0.1, y: cy - height * 0.1, w: width * 0.38, h: height * 0.28, a: 0.18 },
    { x: cx + width * 0.08, y: cy + height * 0.05, w: width * 0.35, h: height * 0.3, a: 0.22 },
    { x: cx, y: cy + height * 0.18, w: width * 0.32, h: height * 0.22, a: 0.17 },
    { x: cx - width * 0.2, y: cy + height * 0.12, w: width * 0.25, h: height * 0.2, a: 0.15 },
    { x: cx + width * 0.18, y: cy - height * 0.05, w: width * 0.22, h: height * 0.25, a: 0.19 },
    { x: cx - width * 0.15, y: cy - height * 0.18, w: width * 0.2, h: height * 0.15, a: 0.16 },
    { x: cx + width * 0.12, y: cy + height * 0.22, w: width * 0.28, h: height * 0.18, a: 0.14 },
  ]
  for (const e of voidEllipses) {
    ctx.beginPath()
    ctx.ellipse(e.x, e.y, e.w, e.h, 0, 0, Math.PI * 2)
    ctx.fillStyle = hexToRgba(palette.primary, e.a)
    ctx.fill()
  }

  // Crown: 7 pointed triangular spikes at top of form
  const crownY = cy - height * 0.28
  const crownCount = 7
  for (let i = 0; i < crownCount; i++) {
    const baseT = i / (crownCount - 1)
    const baseX = cx - width * 0.2 + width * 0.4 * baseT
    const rotDrift = Math.sin(timestamp / 3000 + i * 0.4) * 0.08
    const spikeH = height * 0.12
    const spikeW = width * 0.05
    const tipX = baseX + rotDrift * width
    const tipY = crownY - spikeH

    ctx.beginPath()
    ctx.moveTo(baseX - spikeW, crownY)
    ctx.lineTo(tipX, tipY)
    ctx.lineTo(baseX + spikeW, crownY)
    ctx.closePath()
    ctx.fillStyle = hexToRgba(palette.secondary, 0.7)
    ctx.fill()

    // Small circle at tip
    ctx.beginPath()
    ctx.arc(tipX, tipY, 4, 0, Math.PI * 2)
    ctx.fillStyle = hexToRgba(palette.accent, 0.9)
    ctx.fill()
  }

  // Face eyes: 2 tall narrow vertical glowing slots, flickering
  const eyeVisible = Math.abs(Math.sin(timestamp / 500)) > 0.9
  if (eyeVisible) {
    const eyeX1 = cx - width * 0.08
    const eyeX2 = cx + width * 0.08
    const eyeY = cy - height * 0.12
    const eyeW = width * 0.025
    const eyeH = height * 0.06
    ctx.fillStyle = hexToRgba(palette.accent, 0.95)
    ctx.fillRect(eyeX1 - eyeW / 2, eyeY, eyeW, eyeH)
    ctx.fillRect(eyeX2 - eyeW / 2, eyeY, eyeW, eyeH)
  }

  // Orbiting fragments: 5 small rectangles at ~40% radius
  const orbitRadius = Math.min(width, height) * 0.4
  const fragmentSpeeds = [1.0, 1.3, 0.8, 1.1, 0.9]
  const fragmentOffsets = [0, 1.2, 2.5, 3.7, 5.1]
  const fragmentSizes = [6, 8, 10, 7, 9]
  for (let i = 0; i < 5; i++) {
    const angle = (timestamp / 2000) * fragmentSpeeds[i] + fragmentOffsets[i]
    const fx = cx + Math.cos(angle) * orbitRadius
    const fy = cy + Math.sin(angle) * orbitRadius
    const fs = fragmentSizes[i]
    ctx.fillStyle = hexToRgba(palette.secondary, 0.8)
    ctx.fillRect(fx - fs / 2, fy - fs / 2, fs, fs)
  }

  // Void tendrils: 6 curved bezier lines from body edges
  const tendrilBaseAngles = [-0.8, -0.4, 0.0, 0.4, 0.8, 1.2]
  for (let i = 0; i < 6; i++) {
    const baseAngle = tendrilBaseAngles[i] + Math.sin(timestamp / 1500 + i) * 0.1
    const baseR = Math.min(width, height) * 0.35
    const bx = cx + Math.cos(baseAngle) * baseR
    const by = cy + Math.sin(baseAngle) * baseR * 0.7
    const lengthMult = 0.6 + Math.sin(timestamp / 1500 + i) * 0.3
    const ex = cx + Math.cos(baseAngle) * baseR * (1.5 + lengthMult * 0.5)
    const ey = cy + Math.sin(baseAngle) * baseR * (1.2 + lengthMult * 0.4)

    const cp1x = bx + Math.cos(baseAngle + 0.3) * width * 0.1
    const cp1y = by + Math.sin(baseAngle + 0.3) * height * 0.08
    const cp2x = ex - Math.cos(baseAngle + 0.2) * width * 0.08
    const cp2y = ey - Math.sin(baseAngle + 0.2) * height * 0.06

    ctx.beginPath()
    ctx.moveTo(bx, by)
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, ex, ey)
    const grad = ctx.createLinearGradient(bx, by, ex, ey)
    grad.addColorStop(0, hexToRgba(palette.secondary, 0.5))
    grad.addColorStop(1, hexToRgba(palette.secondary, 0))
    ctx.strokeStyle = grad
    ctx.lineWidth = 2.5
    ctx.stroke()
  }
}
