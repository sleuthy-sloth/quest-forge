// src/components/ui/PixelButton.tsx
import React from 'react'
import { spriteUrl } from '@/lib/sprites/manifest'

const SPRITE_MAP = {
  primary:   { n: spriteUrl('ui/9-Slice/Colored/yellow.png'),  p: spriteUrl('ui/9-Slice/Colored/yellow_pressed.png')  },
  secondary: { n: spriteUrl('ui/9-Slice/Colored/grey.png'),    p: spriteUrl('ui/9-Slice/Colored/grey_pressed.png')    },
  danger:    { n: spriteUrl('ui/9-Slice/Colored/red.png'),     p: spriteUrl('ui/9-Slice/Colored/red_pressed.png')     },
  success:   { n: spriteUrl('ui/9-Slice/Colored/green.png'),   p: spriteUrl('ui/9-Slice/Colored/green_pressed.png')   },
} as const

// borderSlice: unitless integer for CSS border-image-slice (e.g. "14")
// borderWidth: px value for CSS border-width layout (e.g. "14px")
// These MUST be separate — border-image-slice does not accept px units.
const SIZE_MAP = {
  sm: { fontSize: '7px',  padding: '0px 6px',  borderWidth: '12px', borderSlice: '12' },
  md: { fontSize: '9px',  padding: '2px 8px',  borderWidth: '14px', borderSlice: '14' },
  lg: { fontSize: '11px', padding: '4px 14px', borderWidth: '16px', borderSlice: '16' },
} as const

export interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
}

export default function PixelButton({
  variant = 'primary',
  size = 'md',
  disabled,
  style,
  children,
  ...rest
}: PixelButtonProps) {
  const spr = SPRITE_MAP[variant]
  const sz  = SIZE_MAP[size]

  // Returns a plain <button> — no Fragment wrapper. This is intentional.
  // The .px-btn class styles live in globals.css so no <style> tag is needed
  // here, which prevents the style element from becoming a flex child when
  // this button is used inside flex containers with gap.
  return (
    <button
      className="px-btn"
      disabled={disabled}
      style={{
        '--spr':   `url(${spr.n})`,
        '--spr-p': `url(${spr.p})`,
        '--slice': sz.borderSlice,   // unitless: "12", "14", or "16"
        fontSize:    sz.fontSize,
        padding:     sz.padding,
        borderWidth: sz.borderWidth, // with px: "12px", "14px", or "16px"
        ...style,
      } as React.CSSProperties}
      {...rest}
    >
      {children}
    </button>
  )
}
