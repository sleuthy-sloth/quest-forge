'use client'

import { useEffect } from 'react'

export default function ApprovalsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[ApprovalQueue] Error:', error)
  }, [error])

  return (
    <div className="mx-auto my-8 max-w-[480px] rounded border border-red-500/15 bg-red-500/5 p-12 text-center">
      <div className="mb-3 text-3xl opacity-40">⚠</div>
      <p className="mb-5 font-heading text-sm tracking-wide text-red-400/85">
        The Approval Queue encountered an error.
      </p>
      <button
        onClick={reset}
        className="rounded border border-amber-400/20 bg-amber-400/5 px-5 py-3 font-heading text-xs uppercase tracking-widest text-amber-400/80 hover:bg-amber-400/10"
      >
        Try Again
      </button>
    </div>
  )
}
