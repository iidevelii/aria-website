'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPassword() {
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
      else setError('حدث خطأ — حاول مجدداً')
    } catch {
      setError('تعذر الاتصال بالسيرفر')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#050508', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 900, color: 'white', marginBottom: '8px' }}>نسيت كلمة المرور؟</h1>
          <p style={{ color: '#6b7280', fontSize: '15px' }}>أدخل إيميلك وراح نرسل لك رابط الاستعادة</p>
        </div>
        <div className="glass-card">
          {sent ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
              <h2 style={{ color: '#00d4ff', marginBottom: '12px' }}>تم الإرسال!</h2>
              <p style={{ color: '#9ca3af', fontSize: '15px' }}>تحقق من إيميلك واضغط على الرابط</p>
              <Link href="/login" style={{ display: 'inline-block', marginTop: '24px', color: '#00d4ff', textDecoration: 'none' }}>
                رجوع لتسجيل الدخول
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {error && (
                <div style={{ background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.2)', borderRadius: '12px', padding: '12px 16px', color: '#ff7070', fontSize: '14px' }}>
                  {error}
                </div>
              )}
              <div>
                <label className="label">الإيميل</label>
                <input type="email" required className="input" value={email}
                  onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary"
                style={{ width: '100%', opacity: loading ? 0.6 : 1 }}>
                {loading ? 'جاري الإرسال...' : 'إرسال رابط الاستعادة'}
              </button>
              <div style={{ textAlign: 'center' }}>
                <Link href="/login" style={{ color: '#6b7280', fontSize: '14px', textDecoration: 'none' }}>
                  رجوع لتسجيل الدخول
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}