// src/components/ui/PixelModal.tsx
'use client'

import React, { useEffect, useId, useRef, useCallback } from 'react'

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
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // ── Focus trap: cycle tab within modal ─────────────────────────────────
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
      return
    }

    if (e.key === 'Tab' && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
  }, [onClose])

  useEffect(() => {
    if (!open) return

    // Save the currently focused element to restore later
    previousFocusRef.current = document.activeElement as HTMLElement

    // Auto-focus the modal close button on open
    const timer = requestAnimationFrame(() => {
      if (modalRef.current) {
        const closeBtn = modalRef.current.querySelector<HTMLElement>('button')
        closeBtn?.focus()
      }
    })

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      cancelAnimationFrame(timer)

      // Restore focus to the element that was active before opening
      previousFocusRef.current?.focus()
    }
  }, [open, handleKeyDown])

  if (!open) return null

  return (
    <div className="px-modal-overlay" onClick={onClose}>
      <div
        ref={modalRef}
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