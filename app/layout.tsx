import type { Metadata } from 'next'
import './globals.css'
import { CRMThemeProvider } from '@/providers/crm-theme-provider'

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
      <body>
        <CRMThemeProvider>
          {children}
        </CRMThemeProvider>
      </body>
    </html>
  )
}
