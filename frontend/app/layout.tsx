import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

// Configure the Inter font
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Blogito by Snehal 123',
  description: 'Posts from Google Drive',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      {/* This applies the font and base styles to your entire app */}
      <body className={inter.className}>{children}</body>
    </html>
  )
}