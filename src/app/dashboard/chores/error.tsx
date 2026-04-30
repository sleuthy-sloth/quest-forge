'use client'

import ErrorFallback from '@/components/ui/ErrorFallback'

export default function ChoresError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorFallback error={error} reset={reset} theme="dashboard" />
}