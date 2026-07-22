'use client'
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLang } from '../layout'

function ResetForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { t } = useLang()
  const token = searchParams.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) return setError(t('كلمات المرور غير متطابقة', 'Passwords do not match'))
    if (password.length < 6) return setError(t('كلمة المرور قصيرة جداً', 'Password is too short'))
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
      else setError(data.detail || t('حدث خطأ', 'Something went wrong'))
    } catch {
      setError(t('تعذر الاتصال بالسيرفر', 'Could not connect to the server'))
    }
    setLoading(false)
  }

  if (success) return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
      <h2 style={{ color: 'var(--cyan)', marginBottom: '12px' }}>{t('تم تغيير كلمة المرور', 'Password changed successfully')}</h2>
      <Link href="/login" style={{ display: 'inline-block', marginTop: '16px', background: 'linear-gradient(135deg,#00d4ff,#7b2fff)', color: '#fff', padding: '10px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: 700 }}>
        {t('تسجيل الدخول', 'Log in')}
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
        <label className="label">{t('كلمة المرور الجديدة', 'New password')}</label>
        <input type="password" required className="input" value={password}
          onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
      </div>
      <div>
        <label className="label">{t('تأكيد كلمة المرور', 'Confirm password')}</label>
        <input type="password" required className="input" value={confirm}
          onChange={e => setConfirm(e.target.value)} placeholder="••••••••" />
      </div>
      <button type="submit" disabled={loading} className="btn-primary"
        style={{ width: '100%', opacity: loading ? 0.6 : 1 }}>
        {loading ? t('جاري التغيير...', 'Changing...') : t('تغيير كلمة المرور', 'Change password')}
      </button>
    </form>
  )
}

export default function ResetPassword() {
  const { t } = useLang()
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text)', marginBottom: '8px' }}>{t('كلمة مرور جديدة', 'New password')}</h1>
          <p style={{ color: 'var(--muted)', fontSize: '15px' }}>{t('اختر كلمة مرور قوية', 'Choose a strong password')}</p>
        </div>
        <div className="glass-card">
          <Suspense fallback={<div style={{color:'var(--muted)',textAlign:'center'}}>{t('جاري التحميل...', 'Loading...')}</div>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}