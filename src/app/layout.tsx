import type { Metadata } from 'next'
import { Press_Start_2P, Cinzel, Crimson_Text } from 'next/font/google'
import { AuthProvider } from '@/lib/auth-context'
import { Toaster } from 'sonner'
import ToastListener from '@/components/ui/ToastListener'
import './globals.css'

const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pixel',
  display: 'swap',
})

const cinzel = Cinzel({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

const crimsonText = Crimson_Text({
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Quest Forge: The Emberlight Chronicles',
  description: 'A fantasy RPG adventure where real-world chores and learning earn XP, unlock stories, and defeat bosses.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${pressStart2P.variable} ${cinzel.variable} ${crimsonText.variable}`}
    >
      <body>
        <AuthProvider>
          <Toaster
            richColors
            closeButton
            position="top-center"
            toastOptions={{
              style: {
                fontFamily: 'var(--font-heading, Cinzel, serif)',
                fontSize: '0.85rem',
                background: 'linear-gradient(135deg, #1a0a2e, #0f0620)',
                border: '1px solid rgba(155,48,255,0.4)',
                color: '#d4b0ff',
              },
            }}
          />
          <ToastListener />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
