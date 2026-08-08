import type { Metadata } from 'next'
import './globals.css'
import ClientShell from './ClientShell'

const SITE_URL = 'https://devel-bot.space'
const TITLE = 'DevelBot | منصة إشارات التداول'
const DESCRIPTION = 'DevelBot يراقب Binance Spot وFutures ويرسل إشارات دخول عالية الجودة فوراً، مع الدخول، الهدف، والوقف.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  icons: {
    icon: '/favicon.ico',
    apple: '/logo.png',
  },
  openGraph: {
    type: 'website',
    siteName: 'DevelBot',
    title: TITLE,
    description: 'إشارات كريبتو + بوت تلقرام، Spot وFutures، إشارات عالية الجودة فوراً مع الدخول والهدف والوقف.',
    images: ['/logo.png'],
    url: SITE_URL,
  },
  twitter: {
    card: 'summary',
    title: TITLE,
    description: 'إشارات كريبتو + بوت تلقرام، Spot وFutures، إشارات عالية الجودة فوراً.',
    images: ['/logo.png'],
  },
}

export default function RootLayout({children}:{children:React.ReactNode}) {
  return (
    <html lang="ar" dir="rtl">
      <body style={{margin:0,padding:0}}>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  )
}
