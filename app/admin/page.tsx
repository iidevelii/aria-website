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

  const [channelEnabled, setChannelEnabled] = useState<boolean | null>(null)
  const [channelBusy, setChannelBusy] = useState(false)

  const [bcText, setBcText] = useState('')
  const [bcImage, setBcImage] = useState<string | null>(null)
  const [bcImageName, setBcImageName] = useState('')
  const [bcDestination, setBcDestination] = useState<'channel' | 'all' | 'custom'>('channel')
  const [bcCustomId, setBcCustomId] = useState('')
  const [bcSending, setBcSending] = useState(false)
  const [bcMsg, setBcMsg] = useState('')

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
    ;(async () => {
      try {
        const r = await fetch(`${API}/bot-state/channel_broadcast_enabled`)
        const d = await r.json()
        setChannelEnabled(d.value === 'true')
      } catch {}
    })()
  }, [])

  const toggleChannelBroadcast = async () => {
    setChannelBusy(true)
    try {
      const r = await fetch(`${API}/admin/channel-broadcast`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ enabled: !channelEnabled }),
      })
      if (r.ok) {
        const d = await r.json()
        setChannelEnabled(d.enabled)
      }
    } catch {}
    setChannelBusy(false)
  }

  const onImagePick = (file: File | null) => {
    if (!file) { setBcImage(null); setBcImageName(''); return }
    setBcImageName(file.name)
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setBcImage(result.split(',')[1] || null) // نشيل بادئة "data:image/...;base64,"
    }
    reader.readAsDataURL(file)
  }

  const sendBroadcast = async () => {
    if (!bcText.trim()) { setBcMsg(t('⚠️ اكتب نص الرسالة', '⚠️ Write the message text')); return }
    if (bcDestination === 'custom' && !bcCustomId.trim()) { setBcMsg(t('⚠️ اكتب آيدي تلقرام', '⚠️ Enter a Telegram ID')); return }
    setBcSending(true); setBcMsg('')
    try {
      const r = await fetch(`${API}/admin/broadcast`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          text: bcText.trim(),
          image_base64: bcImage,
          destination: bcDestination === 'custom' ? bcCustomId.trim() : bcDestination,
        }),
      })
      const d = await r.json()
      if (r.ok) {
        setBcMsg(t(`✅ أُرسلت لـ${d.sent} من ${d.total}${d.failed ? ` (فشل ${d.failed})` : ''}`, `✅ Sent to ${d.sent}/${d.total}${d.failed ? ` (${d.failed} failed)` : ''}`))
        setBcText(''); setBcImage(null); setBcImageName('')
      } else {
        setBcMsg(`⚠️ ${d.detail || t('تعذّر الإرسال', 'Could not send')}`)
      }
    } catch {
      setBcMsg(`⚠️ ${t('تعذّر الاتصال بالسيرفر', 'Could not reach the server')}`)
    }
    setBcSending(false)
  }

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
        setMsg(t(`✅ تم التفعيل، الاشتراك ساري حتى ${d.subscription_end?.slice(0, 10)}`, `✅ Activated. Subscription valid until ${d.subscription_end?.slice(0, 10)}`))
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
        <Card title={t('📢 بث القناة العامة', 'Public channel broadcast')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700 }}>
                {channelEnabled === null ? t('جاري التحقق...', 'Checking...') : channelEnabled ? t('✅ مفعّل', '✅ Enabled') : t('⏸ متوقف', '⏸ Disabled')}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                {t('عند التفعيل، كل إشارة جديدة تُنشر أيضاً بقناة @DevilAISignals العامة، بالإضافة للمشتركين.', 'When enabled, every new signal is also posted to the public @DevilAISignals channel, in addition to subscribers.')}
              </div>
            </div>
            <button onClick={toggleChannelBroadcast} disabled={channelEnabled === null || channelBusy}
              style={{ padding: '10px 18px', flexShrink: 0, background: channelEnabled ? 'rgba(255,68,85,0.1)' : 'var(--cyan)', color: channelEnabled ? '#ff7070' : '#000', border: channelEnabled ? '1px solid rgba(255,68,85,0.25)' : 'none', borderRadius: '9px', fontWeight: 800, fontSize: '13px', cursor: channelBusy ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
              {channelBusy ? '...' : channelEnabled ? t('إيقاف', 'Disable') : t('تفعيل', 'Enable')}
            </button>
          </div>
        </Card>

        <Card title={t('✍️ بث يدوي مخصص', 'Custom manual broadcast')}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
                {t('نص الرسالة', 'Message text')}
              </label>
              <textarea value={bcText} onChange={e => setBcText(e.target.value)} rows={5}
                placeholder={t('اكتب أي نص تبيه يوصل...', 'Write any text you want to send...')}
                style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '9px', padding: '11px', color: 'var(--text)', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
                {t('صورة/شارت (اختياري)', 'Image/chart (optional)')}
              </label>
              <input type="file" accept="image/*" onChange={e => onImagePick(e.target.files?.[0] || null)}
                style={{ fontSize: '12px', color: 'var(--muted)' }} />
              {bcImageName && <div style={{ fontSize: '11px', color: 'var(--cyan)', marginTop: '4px' }}>📎 {bcImageName}</div>}
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
                {t('يُرسل إلى', 'Send to')}
              </label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {([
                  ['channel', t('القناة العامة', 'Public channel')],
                  ['all', t('كل المشتركين', 'All subscribers')],
                  ['custom', t('آيدي محدد', 'Specific ID')],
                ] as const).map(([val, label]) => (
                  <button key={val} onClick={() => setBcDestination(val)}
                    style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: bcDestination === val ? 'rgba(0,196,239,0.1)' : 'var(--surface)', color: bcDestination === val ? 'var(--cyan)' : 'var(--text)', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>
                    {label}
                  </button>
                ))}
              </div>
              {bcDestination === 'custom' && (
                <input value={bcCustomId} onChange={e => setBcCustomId(e.target.value)} placeholder="123456789"
                  style={{ width: '100%', marginTop: '8px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '9px', padding: '11px', color: 'var(--text)', fontSize: '13px', fontFamily: 'var(--mono)' }} />
              )}
            </div>
            <button onClick={sendBroadcast} disabled={bcSending}
              style={{ padding: '13px', background: bcSending ? 'var(--surface-2)' : 'var(--cyan)', color: bcSending ? 'var(--muted)' : '#000', border: 'none', borderRadius: '10px', fontWeight: 900, fontSize: '14px', cursor: bcSending ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
              {bcSending ? t('جاري الإرسال...', 'Sending...') : t('📤 إرسال', '📤 Send')}
            </button>
            {bcMsg && <div style={{ fontSize: '12.5px', color: bcMsg.startsWith('✅') ? '#00e664' : '#ff4455' }}>{bcMsg}</div>}
          </div>
        </Card>

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
