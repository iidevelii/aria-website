'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLang } from '../layout'

const API = 'https://web-production-97af6.up.railway.app'
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token') || ''}` })

type UserData = { id: number; email: string; username: string; is_admin: boolean }

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '22px', marginBottom: '20px' }}>
      <h2 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px' }}>{title}</h2>
      {children}
    </div>
  )
}

export default function AdminPage() {
  const { t } = useLang()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  const [identifier, setIdentifier] = useState('')
  const [days, setDays] = useState(30)
  const [granting, setGranting] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    (async () => {
      const uid = localStorage.getItem('user_id')
      if (!uid) { setLoading(false); return }
      try {
        const r = await fetch(`${API}/user/${uid}`, { headers: authHeaders() })
        if (r.ok) setUser(await r.json())
      } catch {}
      setLoading(false)
    })()
  }, [])

  const grantSubscription = async () => {
    if (!identifier.trim()) { setMsg(t('⚠️ اكتب آيدي تلقرام أو يوزرنيم أو إيميل', '⚠️ Enter a Telegram ID/username or email')); return }
    if (!days || days <= 0 || days > 3650) { setMsg(t('⚠️ عدد الأيام لازم يكون بين 1 و 3650', '⚠️ Days must be between 1 and 3650')); return }
    setGranting(true); setMsg('')
    try {
      const r = await fetch(`${API}/admin/grant-subscription`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ identifier: identifier.trim(), days }),
      })
      const d = await r.json()
      if (r.ok) {
        setMsg(t(`✅ تم التفعيل — الاشتراك ساري حتى ${d.subscription_end?.slice(0, 10)}`, `✅ Activated — subscription valid until ${d.subscription_end?.slice(0, 10)}`))
        setIdentifier('')
      } else {
        setMsg(`⚠️ ${d.detail || t('تعذّر التفعيل', 'Could not activate')}`)
      }
    } catch {
      setMsg(`⚠️ ${t('تعذّر الاتصال بالسيرفر', 'Could not reach the server')}`)
    }
    setGranting(false)
  }

  if (loading) {
    return <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>...</div>
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
        <div style={{ fontSize: '14px', color: 'var(--muted)' }}>{t('سجّل الدخول أولاً', 'Please log in first')}</div>
        <Link href="/login" className="btn-primary" style={{ padding: '10px 20px', fontSize: '13px' }}>{t('دخول', 'Login')}</Link>
      </div>
    )
  }

  if (!user.is_admin) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '14px', color: 'var(--muted)' }}>⛔ {t('غير مصرح لك بالوصول لهذه الصفحة', 'You are not authorized to access this page')}</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <div style={{ background: 'linear-gradient(135deg, rgba(0,196,239,0.06) 0%, rgba(107,31,255,0.06) 100%)', borderBottom: '1px solid var(--border)', padding: '28px 32px' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 4px' }}>🛠 {t('لوحة تحكم الأدمن', 'Admin Panel')}</h1>
          <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>{t('فعّل اشتراك لأي مشترك يدوياً وحدد المدة بنفسك', 'Manually activate a subscription for any user and set the duration yourself')}</p>
        </div>
      </div>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '28px 32px' }}>
        <Card title={t('تفعيل اشتراك', 'Activate a subscription')}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
                {t('آيدي تلقرام أو يوزرنيم (@user) أو إيميل الموقع', 'Telegram ID / username (@user) or website email')}
              </label>
              <input value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="123456789 / @username / user@email.com"
                style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '9px', padding: '11px', color: 'var(--text)', fontSize: '13px', fontFamily: 'inherit' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
                {t('عدد أيام الاشتراك', 'Subscription duration (days)')}
              </label>
              <input type="number" value={days} onChange={e => setDays(Number(e.target.value))} min={1} max={3650}
                style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '9px', padding: '11px', color: 'var(--cyan)', fontSize: '13px', fontFamily: 'var(--mono)', fontWeight: 700 }} />
              <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                {[30, 90, 180, 365].map(n => (
                  <button key={n} onClick={() => setDays(n)}
                    style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: days === n ? 'rgba(0,196,239,0.1)' : 'var(--surface)', color: days === n ? 'var(--cyan)' : 'var(--text)', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>
                    {n} {t('يوم', 'days')}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={grantSubscription} disabled={granting}
              style={{ padding: '13px', background: granting ? 'var(--surface-2)' : 'var(--cyan)', color: granting ? 'var(--muted)' : '#000', border: 'none', borderRadius: '10px', fontWeight: 900, fontSize: '14px', cursor: granting ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
              {granting ? t('جاري التفعيل...', 'Activating...') : t('✅ فعّل الاشتراك', '✅ Activate subscription')}
            </button>
            {msg && <div style={{ fontSize: '12.5px', color: msg.startsWith('✅') ? '#00e664' : '#ff4455' }}>{msg}</div>}
            <div style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.6 }}>
              {t('لو المشترك عنده اشتراك فعّال حالياً، الأيام تُضاف فوق النهاية الحالية بدل ما تستبدلها.', 'If the user already has an active subscription, the days are added on top of the current end date instead of replacing it.')}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
