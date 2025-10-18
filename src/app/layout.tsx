// src/app/layout.tsx
import './globals.css' // Ensure your global styles are imported
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DarkLink Finder',
  description: 'Advanced forensic tool for detecting hidden redirections, dark web connections, and suspicious URL patterns.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // The 'dark' class will be added/removed by the theme toggle in page.tsx
    // The transition-colors on html makes theme changes smooth
    <html lang="en" className="dark transition-colors duration-300">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
