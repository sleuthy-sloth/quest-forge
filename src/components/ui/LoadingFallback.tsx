'use client'

import { Embershard } from '@/components/qf/Embershard'

export type LoadingTheme = 'play' | 'dashboard' | 'auth' | 'academy'

interface LoadingFallbackProps {
  theme?: LoadingTheme
  message?: string
}

const THEME_CONFIG: Record<LoadingTheme, {
  defaultMessage: string
  bgClass: string
}> = {
  play: {
    defaultMessage: 'Consulting the Scribes...',
    bgClass: 'bg-[#040812]',
  },
  dashboard: {
    defaultMessage: 'Opening the Tome of Mastery...',
    bgClass: 'bg-[#0a0b0f]',
  },
  auth: {
    defaultMessage: 'Deciphering the ancient wards...',
    bgClass: 'bg-[#0a0a12]',
  },
  academy: {
    defaultMessage: 'Preparing the lesson...',
    bgClass: 'bg-[#040812]',
  },
}

export default function LoadingFallback({
  theme = 'play',
  message,
}: LoadingFallbackProps) {
  const config = THEME_CONFIG[theme]

  return (
    <div className={`min-h-[80vh] flex flex-col items-center justify-center p-8 text-center ${config.bgClass}`}>
      <div className="relative mb-8">
        <Embershard size={48} level={1} />
      </div>

      <div className="max-w-xs w-full space-y-4">
        <div className="h-3 bg-white/5 rounded-full w-2/3 mx-auto overflow-hidden relative">
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-[#c9a84c]/20 to-transparent"
            style={{ animation: 'shimmer 1.5s infinite linear' }}
          />
        </div>
        <p className="font-pixel text-[0.45rem] text-[#c9a84c]/40 uppercase tracking-widest animate-pulse">
          {message ?? config.defaultMessage}
        </p>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}