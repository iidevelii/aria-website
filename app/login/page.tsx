'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLang, useAuth } from '../layout'

export default function Login() {
  const router = useRouter()
  const { t } = useLang()
  const { refresh } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('https://web-production-97af6.up.railway.app/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user_id', data.user_id)
        await refresh()
        router.push('/dashboard')
      } else {
        setError(data.detail || t('خطأ في الدخول', 'Login error'))
      }
    } catch {
      setError(t('تعذر الاتصال بالسيرفر', 'Could not connect to the server'))
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative' }}>
      <div className="orb-1"></div>
      <div className="orb-2"></div>
      <div className="grid-bg"></div>

      <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
            <img src="/logo.png" alt="DevelBot" style={{ height: '96px', width: 'auto', display: 'block', borderRadius: '14px', background: '#fff', padding: '8px' }}/>
          </Link>
          <h1 style={{ fontSize: 'var(--fs-h1)', fontWeight: 900, marginBottom: '8px' }}>{t('مرحباً بعودتك', 'Welcome back')}</h1>
          <p style={{ color: 'var(--muted)', fontSize: '15px' }}>{t('سجّل دخولك للوصول لإشاراتك', 'Log in to access your signals')}</p>
        </div>

        {/* Card */}
        <div className="glass-card">
          {error && (
            <div style={{ background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.2)', borderRadius: '12px', padding: '12px 16px', marginBottom: '24px', color: 'var(--red)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label className="label">{t('الايميل', 'Email')}</label>
              <input
                type="email" required
                className="input"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="label">{t('كلمة السر', 'Password')}</label>
              <input
                type="password" required
                className="input"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '8px', opacity: loading ? 0.6 : 1 }}>
              {loading ? t('جاري الدخول...', 'Logging in...') : t('دخول ←', 'Login →')}
            </button>
          </form>

          <div style={{ marginTop: '28px', paddingTop: '24px', borderTop: '1px solid var(--border)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ color: 'var(--muted)', fontSize: '14px', margin: 0 }}>
              {t('ما عندك حساب؟', "Don't have an account?")}{' '}
              <Link href="/register" style={{ color: 'var(--cyan)', textDecoration: 'none', fontWeight: 700 }}>{t('سجّل مجاناً', 'Sign up free')}</Link>
            </p>
            <Link href="/forgot-password" style={{ color: 'var(--muted)', fontSize: '13px', textDecoration: 'none' }}>
              {t('نسيت كلمة المرور؟', 'Forgot your password?')}
            </Link>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <Link href="/activate" style={{ color: '#00c4ef', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>
            🔑 {t('تفعيل برقم التحويل', 'Activate with transfer number')}
          </Link>
          <Link href="/dashboard" style={{ color: 'var(--muted)', fontSize: '13px', textDecoration: 'none' }}>{t('تصفح بدون تسجيل ←', 'Browse without signing in →')}</Link>
        </div>
      </div>
    </div>
  )
}
