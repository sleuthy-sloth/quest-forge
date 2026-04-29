'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Embershard } from '@/components/qf/Embershard'
import { Embers } from '@/components/qf/Embers'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#040812] text-[#f0e6c8] overflow-x-hidden">
      <Embers count={12} />
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-black/20 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <Embershard size={24} />
          <span className="font-heading text-lg tracking-[0.2em] text-[#c9a84c] uppercase">Quest Forge</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-pixel text-[#b09a6e] hover:text-[#c9a84c] transition-colors tracking-widest uppercase">
            Login
          </Link>
          <Link href="/login?signup=true" className="px-6 py-2 bg-[#c9a84c] text-[#040812] font-heading font-bold text-sm tracking-widest uppercase rounded-sm hover:scale-105 transition-transform active:scale-95 shadow-[0_0_15px_rgba(201,168,76,0.3)]">
            Begin Journey
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center px-6">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/landing/hero.png" 
            alt="The World of Embervale" 
            fill 
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#040812] via-transparent to-[#040812]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 max-w-4xl"
        >
          <h2 className="font-pixel text-[0.6rem] sm:text-[0.8rem] text-[#c9a84c] uppercase tracking-[0.4em] mb-6 animate-glow-pulse">
            The Emberlight Chronicles
          </h2>
          <h1 className="font-heading text-5xl sm:text-7xl lg:text-8xl mb-8 leading-tight text-white text-shadow-glow">
            Turn Your Chores <br />
            <span className="text-[#c9a84c]">Into Quests</span>
          </h1>
          <p className="font-body text-lg sm:text-xl text-[#b09a6e]/80 max-w-2xl mx-auto mb-12 leading-relaxed">
            Embervale is falling to the Hollow. Only your daily deeds can fuel the light. 
            Earn XP, unlock powerful artifacts, and defeat legendary bosses through the power of responsibility.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/login?signup=true" className="group relative px-10 py-5 bg-[#c9a84c] text-[#040812] font-heading font-bold text-lg tracking-[0.2em] uppercase rounded-sm overflow-hidden shadow-[0_0_30px_rgba(201,168,76,0.4)] transition-all">
              <span className="relative z-10">Start Your Adventure</span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
            </Link>
            <Link href="#features" className="px-10 py-5 border-2 border-[#c9a84c]/30 text-[#c9a84c] font-heading font-bold text-lg tracking-[0.2em] uppercase rounded-sm hover:bg-[#c9a84c]/10 transition-all">
              Learn More
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-32 px-6 bg-[#080c14]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="font-pixel text-[0.5rem] text-[#c9a84c]/60 uppercase tracking-[0.3em] mb-4">Core Mechanics</h2>
            <h3 className="font-heading text-4xl sm:text-5xl text-white mb-6">Deeds Before Victory</h3>
            <div className="w-24 h-1 bg-[#c9a84c]/30 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: "Daily Deeds",
                desc: "Every real-world chore is a quest. Brushing teeth, finishing homework, or cleaning your room grants XP and Gold.",
                icon: "📜",
                color: "rgba(201,168,76,1)"
              },
              {
                title: "Academy Trials",
                desc: "Face educational duels in Math, Science, and Lore. Your knowledge is your greatest weapon in the fight against the Hollow.",
                icon: "📖",
                color: "rgba(110,181,255,1)"
              },
              {
                title: "Boss Raids",
                desc: "Collaborate with your household to defeat procedural bosses. Their strength scales with your group, requiring unity to prevail.",
                icon: "⚔️",
                color: "rgba(224,85,85,1)"
              }
            ].map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="p-10 bg-[#121620] border border-white/5 rounded-sm relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform rotate-12">
                  <span className="text-8xl">{f.icon}</span>
                </div>
                <div className="text-4xl mb-6">{f.icon}</div>
                <h4 className="font-heading text-2xl text-white mb-4 tracking-wide">{f.title}</h4>
                <p className="font-body text-[#b09a6e]/70 leading-relaxed text-sm">
                  {f.desc}
                </p>
                <div className="mt-8 h-1 w-12 bg-[#c9a84c]/40 group-hover:w-full transition-all duration-500" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Narrative Section */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/backgrounds/dashboard.png')] opacity-10 grayscale" />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="p-12 border-2 border-[#c9a84c]/20 bg-[#040812]/80 backdrop-blur-sm"
          >
            <p className="font-body italic text-2xl text-[#f0e6c8]/90 leading-loose mb-12">
              "The Light of the Embershard is not found in grand battles, but in the quiet discipline of the every day. 
              Each deed is a spark. Together, we shall build a fire that the Hollow cannot quench."
            </p>
            <div className="font-pixel text-[0.5rem] text-[#c9a84c] tracking-widest uppercase">
              — The High Scribe of Hearthhold
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 text-center">
        <div className="flex flex-col items-center gap-8">
          <div className="flex items-center gap-3">
            <Embershard size={32} />
            <span className="font-heading text-2xl tracking-[0.2em] text-[#c9a84c] uppercase">Quest Forge</span>
          </div>
          <p className="font-body text-sm text-[#b09a6e]/40 max-w-sm">
            A premium experience for families, built with love and the fire of Emberlight. 
            © 2026 Quest Forge Platform.
          </p>
          <div className="flex gap-8">
            <Link href="/play" className="text-[0.6rem] font-pixel text-[#b09a6e]/60 hover:text-[#c9a84c] uppercase tracking-widest transition-colors">Play</Link>
            <Link href="/dashboard" className="text-[0.6rem] font-pixel text-[#b09a6e]/60 hover:text-[#c9a84c] uppercase tracking-widest transition-colors">GM Tools</Link>
            <Link href="/login" className="text-[0.6rem] font-pixel text-[#b09a6e]/60 hover:text-[#c9a84c] uppercase tracking-widest transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
