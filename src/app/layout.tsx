import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Issa Compass — AI Assistant',
  description: 'Self-learning AI assistant for DTV visa support',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
