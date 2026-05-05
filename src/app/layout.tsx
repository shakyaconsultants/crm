import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bee CRM',
  description: 'Bee CRM for managing leads and operations.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  )
}

