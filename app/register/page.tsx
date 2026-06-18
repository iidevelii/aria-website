'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Register() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('https://web-production-97af6.up.railway.app/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user_id', data.user_id)
        router.push('/dashboard')
      } else {
        setError(data.detail || 'حدث خطأ')
      }
    } catch {
      setError('تعذر الاتصال بالسيرفر')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#050508', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative' }}>
      <div className="orb-1"></div>
      <div className="orb-2"></div>
      <div className="grid-bg"></div>

      <div style={{ width: '100%', maxWidth: '460px', position: 'relative', zIndex: 1 }}>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #00d4ff, #7b2fff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '18px', color: 'white' }}>A</div>
            <span style={{ fontWeight: 900, fontSize: '20px', color: 'white' }}>ARIA<span style={{ color: '#00d4ff' }}>Bot</span></span>
          </Link>

          <div className="badge" style={{ marginBottom: '20px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00ff88', display: 'inline-block' }}></span>
            14 يوم تجربة مجانية — بدون بطاقة
          </div>

          <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px' }}>انشئ حسابك</h1>
          <p style={{ color: '#6b7280', fontSize: '15px' }}>ابدأ رحلتك مع ARIA Bot مجاناً</p>
        </div>

        <div className="glass-card">
          {error && (
            <div style={{ background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.2)', borderRadius: '12px', padding: '12px 16px', marginBottom: '24px', color: '#ff7070', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label className="label">الايميل</label>
              <input type="email" required className="input" value={form.email}
                onChange={e => setForm({...form, email: e.target.value})} placeholder="your@email.com"/>
            </div>
            <div>
              <label className="label">اسم المستخدم</label>
              <input type="text" required className="input" value={form.username}
                onChange={e => setForm({...form, username: e.target.value})} placeholder="username"/>
            </div>
            <div>
              <label className="label">كلمة السر</label>
              <input type="password" required className="input" value={form.password}
                onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••"/>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '8px', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'جاري التسجيل...' : 'انشاء الحساب ←'}
            </button>
          </form>

          {/* Features */}
          <div style={{ marginTop: '28px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { icon: '✓', text: 'كامل الاشارات' },
              { icon: '✓', text: 'ربط التلقرام' },
              { icon: '✓', text: '14 يوم مجاناً' },
              { icon: '✓', text: 'بدون بطاقة' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#9ca3af' }}>
                <span style={{ color: '#00d4ff', fontWeight: 700 }}>{f.icon}</span>
                {f.text}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              عندك حساب؟{' '}
              <Link href="/login" style={{ color: '#00d4ff', textDecoration: 'none', fontWeight: 700 }}>سجّل دخول</Link>
            </p>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link href="/dashboard" style={{ color: '#374151', fontSize: '13px', textDecoration: 'none' }}>تصفح بدون تسجيل ←</Link>
        </p>
      </div>
    </div>
  )
}