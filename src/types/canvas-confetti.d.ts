declare module 'canvas-confetti' {
  interface Options {
    particleCount?: number
    angle?: number
    spread?: number
    startVelocity?: number
    decay?: number
    gravity?: number
    drift?: number
    ticks?: number
    origin?: {
      x?: number
      y?: number
    }
    colors?: string[]
    shapes?: ('square' | 'circle')[]
    scalar?: number
    zIndex?: number
    disableForReducedMotion?: boolean
  }

  type ConfettiFunction = (options?: Options) => Promise<null>

  interface ConfettiCanvas extends ConfettiFunction {
    create: (canvas: HTMLCanvasElement, options?: { resize?: boolean }) => ConfettiFunction
  }

  const confetti: ConfettiCanvas
  export default confetti
}