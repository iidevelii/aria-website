'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLang, useAuth } from '../ClientShell'
import { API_ORIGIN } from '../lib/api'

export default function Register() {
  const router = useRouter()
  const { t } = useLang()
  const { refresh } = useAuth()
  const [form, setForm] = useState({ email: '', username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_ORIGIN}/register`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('user_id', data.user_id)
        await refresh()
        router.push('/dashboard')
      } else {
        setError(data.detail || t('حدث خطأ', 'Something went wrong'))
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

      <div style={{ width: '100%', maxWidth: '460px', position: 'relative', zIndex: 1 }}>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
            <img src="/logo.png" alt="DevelBot" style={{ height: '96px', width: 'auto', display: 'block', borderRadius: '14px', background: '#fff', padding: '8px' }}/>
          </Link>

          <div className="badge" style={{ marginBottom: '20px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00ff88', display: 'inline-block' }}></span>
            {t('30 يوم تجربة مجانية، بدون بطاقة', '30-day free trial, no card required')}
          </div>

          <h1 style={{ fontSize: 'var(--fs-h1)', fontWeight: 900, marginBottom: '8px' }}>{t('انشئ حسابك', 'Create your account')}</h1>
          <p style={{ color: 'var(--muted)', fontSize: '15px' }}>{t('ابدأ رحلتك مع DevelBot مجاناً', 'Start your journey with DevelBot for free')}</p>
        </div>

        <div className="glass-card">
          {error && (
            <div style={{ background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.2)', borderRadius: '12px', padding: '12px 16px', marginBottom: '24px', color: 'var(--red)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label className="label">{t('الايميل', 'Email')}</label>
              <input type="email" required className="input" value={form.email}
                onChange={e => setForm({...form, email: e.target.value})} placeholder="your@email.com"/>
            </div>
            <div>
              <label className="label">{t('اسم المستخدم', 'Username')}</label>
              <input type="text" required className="input" value={form.username}
                onChange={e => setForm({...form, username: e.target.value})} placeholder="username"/>
            </div>
            <div>
              <label className="label">{t('كلمة السر', 'Password')}</label>
              <input type="password" required className="input" value={form.password}
                onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••"/>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '8px', opacity: loading ? 0.6 : 1 }}>
              {loading ? t('جاري التسجيل...', 'Registering...') : t('انشاء الحساب ←', 'Create account →')}
            </button>
          </form>

          {/* Features */}
          <div style={{ marginTop: '28px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { icon: '✓', text: t('كامل الاشارات', 'Full signals') },
              { icon: '✓', text: t('ربط التلقرام', 'Telegram integration') },
              { icon: '✓', text: t('30 يوم مجاناً', '30 days free') },
              { icon: '✓', text: t('بدون بطاقة', 'No card needed') },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--muted)' }}>
                <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>{f.icon}</span>
                {f.text}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
              {t('عندك حساب؟', 'Already have an account?')}{' '}
              <Link href="/login" style={{ color: 'var(--cyan)', textDecoration: 'none', fontWeight: 700 }}>{t('سجّل دخول', 'Log in')}</Link>
            </p>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link href="/backtest-results" style={{ color: 'var(--muted)', fontSize: '13px', textDecoration: 'none' }}>{t('شوف نتائج حقيقية بدون تسجيل ←', 'See real results without signing up →')}</Link>
        </p>
      </div>
    </div>
  )
}