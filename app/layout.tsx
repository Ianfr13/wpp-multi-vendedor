import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WPP Connect - Multi Vendedor',
  description: 'Sistema de gerenciamento WhatsApp',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
