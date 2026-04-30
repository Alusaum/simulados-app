// src/app/layout.tsx
// Layout raiz — configura fontes, providers globais e metadata SEO.

import type { Metadata } from 'next'
import { DM_Sans, DM_Mono } from 'next/font/google'
import Providers from '@/components/layout/Providers'
import './globals.css'

const dmSans = DM_Sans({
  subsets:  ['latin'],
  variable: '--font-sans',
  display:  'swap',
})

const dmMono = DM_Mono({
  subsets:  ['latin'],
  weight:   ['400', '500'],
  variable: '--font-mono',
  display:  'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s | SimulaAí',
    default:  'SimulaAí — Plataforma de Simulados Online',
  },
  description: 'Pratique com simulados inteligentes, acompanhe seu desempenho e conquiste sua aprovação.',
  keywords:    ['simulados', 'concursos', 'vestibular', 'ENEM', 'questões'],
  openGraph: {
    type:        'website',
    locale:      'pt_BR',
    url:         'https://simulaai.com.br',
    siteName:    'SimulaAí',
    title:       'SimulaAí — Simulados que aprovam',
    description: 'Mais de 3.000 questões comentadas. Grátis para começar.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${dmSans.variable} ${dmMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body className="bg-[#0d0f14] text-white font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
