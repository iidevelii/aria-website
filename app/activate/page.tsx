'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useLang } from '../layout'

const API = 'https://web-production-97af6.up.railway.app'

export default function ActivatePage() {
  const { t } = useLang()
  const [txid, setTxid]     = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [msg, setMsg]       = useState('')

  const handleActivate = async () => {
    const txidValue = txid.trim()
    if (!txidValue) { setMsg(t('أدخل رقم التحويل', 'Enter the transfer number')); setStatus('error'); return }

    setStatus('loading')
    setMsg('')

    try {
      const r = await fetch(`${API}/auth/txid-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txid: txidValue }),
      })
      const data = await r.json()

      if (!r.ok) {
        setMsg(data.detail || t('فشل التفعيل', 'Activation failed'))
        setStatus('error')
        return
      }

      localStorage.setItem('token',   data.token)
      localStorage.setItem('user_id', String(data.user_id))
      setStatus('ok')
      setMsg(t(`مرحباً ${data.username || ''}! جاري التوجيه...`, `Welcome ${data.username || ''}! Redirecting...`))
      setTimeout(() => { window.location.href = '/dashboard' }, 1500)
    } catch {
      setMsg(t('حدث خطأ في الاتصال', 'A connection error occurred'))
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
      <div className="orb-1"></div>
      <div className="orb-2"></div>
      <div className="grid-bg"></div>

      <div style={{ width: '100%', maxWidth: '480px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
            <img src="/logo.png" alt="DevelBot" style={{ height: '80px', width: 'auto', display: 'block', borderRadius: '14px', background: '#fff', padding: '8px' }}/>
          </Link>
          <h1 style={{ fontSize: 'var(--fs-h1)', fontWeight: 900, marginBottom: '8px', color: 'var(--text)' }}>
            {t('تفعيل الحساب', 'Activate Account')}
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
            {t('أدخل رقم التحويل الذي استخدمته في بوت تلقرام', 'Enter the transfer number you used in the Telegram bot')}
          </p>
        </div>

        {/* Card */}
        <div className="glass-card">

          {/* Steps */}
          <div style={{ marginBottom: '28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {([
              ['1', 'افتح @Develpay_bot في تلقرام', 'Open @Develpay_bot on Telegram'],
              ['2', 'ادفع واحصل على TXID', 'Pay and get your TXID'],
              ['3', 'الصق TXID هنا لتفعيل حسابك', 'Paste the TXID here to activate your account'],
            ] as [string, string, string][]).map(([n, ar, en]) => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  background: 'linear-gradient(135deg,#00c4ef,#6b1fff)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 700, color: 'white', flexShrink: 0,
                }}>{n}</div>
                <span style={{ color: 'var(--muted)', fontSize: '14px' }}>{t(ar, en)}</span>
              </div>
            ))}
          </div>

          {/* Input */}
          <div style={{ marginBottom: '16px' }}>
            <label className="label">{t('رقم التحويل (TXID)', 'Transfer Number (TXID)')}</label>
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
            {status === 'loading' ? t('⏳ جاري التحقق...', '⏳ Verifying...') : t('✅ تفعيل الحساب', '✅ Activate Account')}
          </button>

          <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '12px', marginTop: '16px' }}>
            {t('كل رقم تحويل يفعّل حساباً واحداً فقط — لا مشاركة', 'Each transfer number activates only one account — no sharing')}
          </p>
        </div>

        {/* Footer links */}
        <div style={{ textAlign: 'center', marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '24px' }}>
          <Link href="/login"    style={{ color: 'var(--muted)', fontSize: '13px', textDecoration: 'none' }}>{t('تسجيل الدخول', 'Login')}</Link>
          <Link href="/register" style={{ color: 'var(--muted)', fontSize: '13px', textDecoration: 'none' }}>{t('حساب جديد', 'New Account')}</Link>
        </div>
      </div>
    </div>
  )
}
