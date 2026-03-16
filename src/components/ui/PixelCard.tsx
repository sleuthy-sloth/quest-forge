import React from 'react'

export interface PixelCardProps {
  header?: React.ReactNode
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export default function PixelCard({ header, children, className, style }: PixelCardProps) {
  return (
    <div className={`px-card${className ? ` ${className}` : ''}`} style={style}>
      {header && <div className="px-card-header">{header}</div>}
      {children}
    </div>
  )
}
