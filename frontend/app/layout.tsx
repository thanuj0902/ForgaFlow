import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'App Generator',
  description: 'Config-driven app generator',
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
