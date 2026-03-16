// src/components/ui/PixelModal.tsx
'use client'

import React, { useEffect, useId } from 'react'

// Note for callers: wrap your onClose handler with useCallback to avoid
// unnecessary effect re-registrations on each parent render:
//   const handleClose = useCallback(() => setOpen(false), [])
//   <PixelModal open={open} onClose={handleClose} ...>

export interface PixelModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  maxWidth?: number
}

export default function PixelModal({
  open,
  onClose,
  title,
  children,
  maxWidth = 380,
}: PixelModalProps) {
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="px-modal-overlay" onClick={onClose}>
      <div
        className="px-modal-box"
        style={{ maxWidth }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
      >
        <button className="px-modal-close" onClick={onClose} aria-label="Close">✕</button>
        {title && <div id={titleId} className="px-modal-title">{title}</div>}
        {children}
      </div>
    </div>
  )
}
