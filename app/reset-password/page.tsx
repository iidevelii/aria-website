'use client'
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function ResetForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) return setError('كلمات المرور غير متطابقة')
    if (password.length < 6) return setError('كلمة المرور قصيرة جداً')
    setLoading(true)
    setError('')
    try {
      const res = await fetch('https://web-production-97af6.up.railway.app/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password })
      })
      const data = await res.json()
      if (res.ok) setSuccess(true)
      else setError(data.detail || 'حدث خطأ')
    } catch {
      setError('تعذر الاتصال بالسيرفر')
    }
    setLoading(false)
  }

  if (success) return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
      <h2 style={{ color: '#00d4ff', marginBottom: '12px' }}>تم تغيير كلمة المرور</h2>
      <Link href="/login" style={{ display: 'inline-block', marginTop: '16px', background: 'linear-gradient(135deg,#00d4ff,#7b2fff)', color: 'white', padding: '10px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: 700 }}>
        تسجيل الدخول
      </Link>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {error && (
        <div style={{ background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.2)', borderRadius: '12px', padding: '12px 16px', color: '#ff7070', fontSize: '14px' }}>
          {error}
        </div>
      )}
      <div>
        <label className="label">كلمة المرور الجديدة</label>
        <input type="password" required className="input" value={password}
          onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
      </div>
      <div>
        <label className="label">تأكيد كلمة المرور</label>
        <input type="password" required className="input" value={confirm}
          onChange={e => setConfirm(e.target.value)} placeholder="••••••••" />
      </div>
      <button type="submit" disabled={loading} className="btn-primary"
        style={{ width: '100%', opacity: loading ? 0.6 : 1 }}>
        {loading ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
      </button>
    </form>
  )
}

export default function ResetPassword() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 900, color: 'white', marginBottom: '8px' }}>كلمة مرور جديدة</h1>
          <p style={{ color: '#6b7280', fontSize: '15px' }}>اختر كلمة مرور قوية</p>
        </div>
        <div className="glass-card">
          <Suspense fallback={<div style={{color:'#9ca3af',textAlign:'center'}}>جاري التحميل...</div>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}