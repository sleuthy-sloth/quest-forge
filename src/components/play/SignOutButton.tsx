'use client'

import { signOut } from '@/app/actions/auth'

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="w-full px-3 py-2 text-center text-[0.65rem] tracking-wider uppercase
          rounded-[3px] transition-all duration-150 cursor-pointer
          hover:bg-[#e05555]/15 active:scale-[0.97]"
        style={{
          fontFamily: 'var(--font-heading), serif',
          color: 'rgba(230,80,100,1.0)',
          textShadow: '0 0 10px rgba(200,40,70,0.35)',
          border: '1px solid rgba(230,80,100,0.45)',
          boxShadow: '0 0 8px rgba(200,40,70,0.15)',
        }}
      >
        ⬡ Sign Out
      </button>
    </form>
  )
}
