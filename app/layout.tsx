'use client'
import { useState, useEffect } from 'react'
import './globals.css'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

function AriaLogo({ size = 36 }: { size?: number }) {
  return (
    <img
      src="/logo.png"
      width={size}
      height={size}
      alt="ARIA Bot Logo"
      style={{ objectFit: 'contain' }}
    />
  )
}

function Header() {
  const router = useRouter()
  const [username, setUsername] = useState<string | null>(null)

  const fetchUser = () => {
    const token = localStorage.getItem('token')
    const userId = localStorage.getItem('user_id')
    if (token && userId) {
      fetch(`https://web-production-97af6.up.railway.app/user/${userId}`)
        .then(r => r.json())
        .then(data => {
          if (data.username) setUsername(data.username)
          else setUsername(null)
        })
        .catch(() => setUsername(null))
    } else {
      setUsername(null)
    }
  }

  useEffect(() => {
    fetchUser()
    window.addEventListener('auth-changed', fetchUser)
    return () => window.removeEventListener('auth-changed', fetchUser)
  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user_id')
    setUsername(null)
    window.dispatchEvent(new Event('auth-changed'))
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
        <AriaLogo size={36} />
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
              borderRadius: '10px', cursor: 'pointer', fontFamily: 'inherit'
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
