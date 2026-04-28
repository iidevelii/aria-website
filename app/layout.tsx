'use client'
import { useState, useEffect } from 'react'
import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

function AriaLogo() {
  return (
    <svg width="32" height="38" viewBox="0 0 32 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 2L28 9V13L16 6L4 13V9L16 2Z" fill="url(#g1)" strokeLinecap="round"/>
      <path d="M8 17C8 13.5 11 11 14 11C11.5 13 10 15.5 10 18.5C10 22 12.5 25 16 25C12 25 8 21.5 8 17Z" fill="url(#g2)"/>
      <path d="M24 17C24 20.5 21 23 18 23C20.5 21 22 18.5 22 15.5C22 12 19.5 9 16 9C20 9 24 12.5 24 17Z" fill="url(#g1)"/>
      <path d="M10 29L16 36L22 29L19 27L16 31L13 27L10 29Z" fill="url(#g2)"/>
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="32" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00d4ff"/><stop offset="1" stopColor="#7b2fff"/>
        </linearGradient>
        <linearGradient id="g2" x1="32" y1="0" x2="0" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7b2fff"/><stop offset="1" stopColor="#00d4ff"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

function Header() {
  const router = useRouter()
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userId = localStorage.getItem('user_id')
    if (token && userId) {
      fetch(`https://web-production-dfe62.up.railway.app/user/${userId}`)
        .then(r => r.json())
        .then(data => setUsername(data.username))
        .catch(() => {})
    }
  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user_id')
    setUsername(null)
    router.push('/')
  }

  return (
    <nav style={{
      position: 'fixed', top: 0, width: '100%', zIndex: 9999,
      background: 'rgba(5,5,8,0.6)', backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      padding: '0 24px', height: '64px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      boxSizing: 'border-box',
    }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'white' }}>
        <AriaLogo />
        <span style={{ fontWeight: 900, fontSize: '17px', letterSpacing: '-0.5px' }}>
          ARIA<span style={{ color: '#00d4ff' }}>Bot</span>
        </span>
      </Link>

      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        <Link href="/dashboard" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px', padding: '8px 14px', borderRadius: '10px' }}>الداشبورد</Link>
        <Link href="/subscribe" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px', padding: '8px 14px', borderRadius: '10px' }}>اشتراك</Link>

        {username ? (
          <>
            <span style={{ color: '#00d4ff', fontSize: '14px', padding: '8px 14px', fontWeight: 700 }}>
              👤 {username}
            </span>
            <button onClick={logout} style={{
              background: 'rgba(255,60,60,0.1)', border: '1px solid rgba(255,60,60,0.3)',
              color: '#ff7070', fontSize: '13px', padding: '7px 14px',
              borderRadius: '10px', cursor: 'pointer'
            }}>خروج</button>
          </>
        ) : (
          <>
            <Link href="/login" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px', padding: '8px 14px', borderRadius: '10px' }}>دخول</Link>
            <Link href="/register" style={{
              background: 'linear-gradient(135deg, #00d4ff, #7b2fff)',
              color: 'white', textDecoration: 'none', fontWeight: 700,
              fontSize: '14px', padding: '8px 18px', borderRadius: '10px',
            }}>مجاناً</Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head><meta charSet="utf-8" /></head>
      <body style={{ margin: 0, padding: 0, background: '#050508', paddingTop: '64px' }}>
        <Header />
        {children}
      </body>
    </html>
  )
}