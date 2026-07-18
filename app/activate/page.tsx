'use client'
import { useState } from 'react'
import Link from 'next/link'

const API = 'https://web-production-97af6.up.railway.app'

export default function ActivatePage() {
  const [txid, setTxid]     = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [msg, setMsg]       = useState('')

  const handleActivate = async () => {
    const t = txid.trim()
    if (!t) { setMsg('أدخل رقم التحويل'); setStatus('error'); return }

    setStatus('loading')
    setMsg('')

    try {
      const r = await fetch(`${API}/auth/txid-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txid: t }),
      })
      const data = await r.json()

      if (!r.ok) {
        setMsg(data.detail || 'فشل التفعيل')
        setStatus('error')
        return
      }

      localStorage.setItem('token',   data.token)
      localStorage.setItem('user_id', String(data.user_id))
      setStatus('ok')
      setMsg(`مرحباً ${data.username || ''}! جاري التوجيه...`)
      setTimeout(() => { window.location.href = '/dashboard' }, 1500)
    } catch {
      setMsg('حدث خطأ في الاتصال')
      setStatus('error')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
    }}>

      <div style={{ width: '100%', maxWidth: '480px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '8px', color: 'var(--text)' }}>
            تفعيل الحساب
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
            أدخل رقم التحويل الذي استخدمته في بوت تلقرام
          </p>
        </div>

        {/* Card */}
        <div className="glass-card">

          {/* Steps */}
          <div style={{ marginBottom: '28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {([
              ['1', 'افتح @Develpay_bot في تلقرام'],
              ['2', 'ادفع واحصل على TXID'],
              ['3', 'الصق TXID هنا لتفعيل حسابك'],
            ] as [string, string][]).map(([n, t]) => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  background: 'linear-gradient(135deg,#00c4ef,#6b1fff)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 700, color: 'white', flexShrink: 0,
                }}>{n}</div>
                <span style={{ color: 'var(--muted)', fontSize: '14px' }}>{t}</span>
              </div>
            ))}
          </div>

          {/* Input */}
          <div style={{ marginBottom: '16px' }}>
            <label className="label">رقم التحويل (TXID)</label>
            <input
              value={txid}
              onChange={e => setTxid(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleActivate()}
              placeholder="abc123def456..."
              className="input"
              style={{
                fontFamily: 'monospace',
                direction: 'ltr',
                borderColor: status === 'error' ? 'rgba(239,68,68,0.5)' : undefined,
              }}
            />
          </div>

          {/* Message */}
          {msg && (
            <div style={{
              marginBottom: '16px',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              background: status === 'ok'
                ? 'rgba(16,185,129,0.1)'
                : 'rgba(239,68,68,0.1)',
              border: `1px solid ${status === 'ok' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
              color: status === 'ok' ? 'var(--green)' : 'var(--red)',
            }}>
              {msg}
            </div>
          )}

          {/* Button */}
          <button
            onClick={handleActivate}
            disabled={status === 'loading'}
            className="btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              opacity: status === 'loading' ? 0.6 : 1,
              cursor: status === 'loading' ? 'not-allowed' : 'pointer',
            }}
          >
            {status === 'loading' ? '⏳ جاري التحقق...' : '✅ تفعيل الحساب'}
          </button>

          <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '12px', marginTop: '16px' }}>
            كل رقم تحويل يفعّل حساباً واحداً فقط — لا مشاركة
          </p>
        </div>

        {/* Footer links */}
        <div style={{ textAlign: 'center', marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '24px' }}>
          <Link href="/login"    style={{ color: 'var(--muted)', fontSize: '13px', textDecoration: 'none' }}>تسجيل الدخول</Link>
          <Link href="/register" style={{ color: 'var(--muted)', fontSize: '13px', textDecoration: 'none' }}>حساب جديد</Link>
        </div>
      </div>
    </div>
  )
}
