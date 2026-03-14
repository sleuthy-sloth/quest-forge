export default function PlayHomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full p-8 text-center">
      <p
        className="text-[#c9a84c] text-[0.6rem] tracking-widest mb-4"
        style={{ fontFamily: 'var(--font-pixel), monospace' }}
      >
        The Emberlight Chronicles
      </p>
      <h1
        className="text-[#f0e6c8] text-2xl font-semibold mb-2"
        style={{ fontFamily: 'var(--font-heading), serif' }}
      >
        Your Adventure Awaits
      </h1>
      <p
        className="text-[#b09a6e]/60 text-sm max-w-sm"
        style={{ fontFamily: 'var(--font-body), serif' }}
      >
        Complete quests, learn at the Academy, and defeat the boss to unlock new story chapters.
      </p>
    </div>
  )
}
