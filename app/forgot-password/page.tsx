'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useLang } from '../layout'

export default function ForgotPassword() {
  const { t } = useLang()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('https://web-production-97af6.up.railway.app/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      if (res.ok) setSent(true)
      else setError(t('حدث خطأ، حاول مجدداً', 'Something went wrong, please try again'))
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
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
            <img src="/logo.png" alt="DevelBot" style={{ height: '96px', width: 'auto', display: 'block', borderRadius: '14px', background: '#fff', padding: '8px' }}/>
          </Link>
          <h1 style={{ fontSize: 'var(--fs-h1)', fontWeight: 900, color: 'var(--text)', marginBottom: '8px' }}>{t('نسيت كلمة المرور؟', 'Forgot your password?')}</h1>
          <p style={{ color: 'var(--muted)', fontSize: '15px' }}>{t('أدخل إيميلك وراح نرسل لك رابط الاستعادة', 'Enter your email and we\'ll send you a reset link')}</p>
        </div>
        <div className="glass-card">
          {sent ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
              <h2 style={{ color: 'var(--cyan)', marginBottom: '12px' }}>{t('تم الإرسال!', 'Sent!')}</h2>
              <p style={{ color: 'var(--muted)', fontSize: '15px' }}>{t('تحقق من إيميلك واضغط على الرابط', 'Check your email and click the link')}</p>
              <Link href="/login" style={{ display: 'inline-block', marginTop: '24px', color: 'var(--cyan)', textDecoration: 'none' }}>
                {t('رجوع لتسجيل الدخول', 'Back to login')}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {error && (
                <div style={{ background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.2)', borderRadius: '12px', padding: '12px 16px', color: 'var(--red)', fontSize: '14px' }}>
                  {error}
                </div>
              )}
              <div>
                <label className="label">{t('الإيميل', 'Email')}</label>
                <input type="email" required className="input" value={email}
                  onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary"
                style={{ width: '100%', opacity: loading ? 0.6 : 1 }}>
                {loading ? t('جاري الإرسال...', 'Sending...') : t('إرسال رابط الاستعادة', 'Send reset link')}
              </button>
              <div style={{ textAlign: 'center' }}>
                <Link href="/login" style={{ color: 'var(--muted)', fontSize: '14px', textDecoration: 'none' }}>
                  {t('رجوع لتسجيل الدخول', 'Back to login')}
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}