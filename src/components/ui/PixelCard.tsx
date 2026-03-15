import React from 'react'

export interface PixelCardProps {
  header?: React.ReactNode
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export default function PixelCard({ header, children, className, style }: PixelCardProps) {
  return (
    <>
      <style>{`
        .px-card {
          border-style: solid;
          border-width: 14px;
          border-image: url('/sprites/ui/9-Slice/Ancient/brown.png') 14 fill;
          image-rendering: pixelated;
          background: var(--bg-card, #1a1c2e);
          padding: 16px;
          color: var(--text-primary, #f0e6c8);
        }
        .px-card-header {
          font-family: var(--font-heading, 'Cinzel', serif);
          font-size: 11px;
          color: var(--gold-400, #e8a020);
          margin-bottom: 10px;
          letter-spacing: 0.1em;
          border-bottom: 1px solid rgba(201,168,76,0.2);
          padding-bottom: 8px;
        }
      `}</style>
      <div className={`px-card${className ? ` ${className}` : ''}`} style={style}>
        {header && <div className="px-card-header">{header}</div>}
        {children}
      </div>
    </>
  )
}
