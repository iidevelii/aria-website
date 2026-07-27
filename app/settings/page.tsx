'use client'
import { useState, useEffect } from 'react'
import { useLang } from '../layout'

const API = 'https://web-production-97af6.up.railway.app'

type UserData = {
  id: number; email: string; username: string; telegram_id: string | null
  notify_prefs: { signals: boolean; futures: boolean; spot: boolean }
  personal_blacklist: string[]
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '22px', marginBottom: '20px' }}>
      <h2 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px' }}>{title}</h2>
      {children}
    </div>
  )
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', cursor: 'pointer' }}>
      <span style={{ fontSize: '13px' }}>{label}</span>
      <span
        onClick={() => onChange(!checked)}
        style={{
          width: '42px', height: '24px', borderRadius: '12px', position: 'relative', flexShrink: 0,
          background: checked ? 'var(--cyan)' : 'var(--surface-2)', border: '1px solid var(--border)', transition: 'background 0.15s',
        }}
      >
        <span style={{
          position: 'absolute', top: '2px', [checked ? 'right' : 'left']: '2px', width: '18px', height: '18px',
          borderRadius: '50%', background: checked ? '#000' : 'var(--muted)', transition: 'all 0.15s',
        }} />
      </span>
    </label>
  )
}

export default function SettingsPage() {
  const { t } = useLang()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [linkCode, setLinkCode] = useState<{ code: string; deep_link: string } | null>(null)
  const [linking, setLinking] = useState(false)

  const [blSymbol, setBlSymbol] = useState('')
  const [blError, setBlError] = useState('')

  const load = async () => {
    const uid = localStorage.getItem('user_id')
    if (!uid) { setLoading(false); return }
    try {
      const r = await fetch(`${API}/user/${uid}`)
      if (r.ok) setUser(await r.json())
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const savePrefs = async (prefs: { signals: boolean; futures: boolean; spot: boolean }) => {
    if (!user) return
    setSaving(true)
    try {
      await fetch(`${API}/user/${user.id}/notify-prefs`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefs }),
      })
      setUser({ ...user, notify_prefs: prefs })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {}
    setSaving(false)
  }

  const startLink = async () => {
    if (!user) return
    setLinking(true)
    try {
      const r = await fetch(`${API}/link-telegram/start`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id }),
      })
      const d = await r.json()
      if (d.code) setLinkCode(d)
    } catch {}
    setLinking(false)
  }

  const addToBlacklist = async () => {
    if (!user) return
    const symbol = blSymbol.trim().toUpperCase()
    if (!symbol) return
    setBlError('')
    try {
      const r = await fetch(`${API}/user/${user.id}/blacklist`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', symbol }),
      })
      const d = await r.json()
      if (d.ok) { setUser({ ...user, personal_blacklist: d.personal_blacklist }); setBlSymbol('') }
      else setBlError(t('تعذّر الإضافة', 'Could not add'))
    } catch { setBlError(t('تعذّر الإضافة', 'Could not add')) }
  }

  const removeFromBlacklist = async (symbol: string) => {
    if (!user) return
    try {
      const r = await fetch(`${API}/user/${user.id}/blacklist`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove', symbol }),
      })
      const d = await r.json()
      if (d.ok) setUser({ ...user, personal_blacklist: d.personal_blacklist })
    } catch {}
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
      {t('جاري التحميل...', 'Loading...')}
    </div>
  )

  if (!user) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
      {t('سجّل دخولك عشان تشوف الإعدادات', 'Log in to view settings')}
    </div>
  )

  const prefs = user.notify_prefs || { signals: true, futures: true, spot: true }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: '32px 20px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 900, marginBottom: '24px' }}>⚙️ {t('الإعدادات', 'Settings')}</h1>

        {/* ── ربط تلقرام ── */}
        <Card title={`📱 ${t('ربط حساب تلقرام', 'Link Telegram Account')}`}>
          {user.telegram_id ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--green)', fontSize: '13px', fontWeight: 700 }}>
              ✅ {t('حسابك مربوط بالتلقرام', 'Your account is linked to Telegram')}
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '14px' }}>
                {t('اربط حسابك بالتلقرام عشان أي صفقة تنرسل من الموقع توصلك مباشرة على بوت تلقرام.', 'Link your account to Telegram so signals from the site reach you directly on the Telegram bot.')}
              </p>
              {!linkCode ? (
                <button onClick={startLink} disabled={linking} className="btn-primary" style={{ padding: '10px 20px', fontSize: '13px' }}>
                  {linking ? t('جاري التجهيز...', 'Preparing...') : t('اربط الآن', 'Link now')}
                </button>
              ) : (
                <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
                  <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginBottom: '12px' }}>
                    {t('اضغط الزر وبيفتح تلقرام — اضغط Start هناك وبيتربط حسابك تلقائياً.', 'Click the button, it opens Telegram — press Start there and your account links automatically.')}
                  </p>
                  <a href={linkCode.deep_link} target="_blank" rel="noopener noreferrer"
                     className="btn-primary" style={{ display: 'inline-block', padding: '10px 20px', fontSize: '13px', textDecoration: 'none' }}>
                    {t('افتح تلقرام واربط الحساب ←', 'Open Telegram and link →')}
                  </a>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '10px' }}>
                    {t('الرابط صالح لمدة 10 دقائق', 'Link is valid for 10 minutes')}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* ── تفضيلات الإشارات ── */}
        <Card title={`🔔 ${t('تفضيلات الإشارات', 'Signal Preferences')}`}>
          <Toggle checked={prefs.signals} onChange={(v) => savePrefs({ ...prefs, signals: v })}
                  label={t('استلام إشارات (تفعيل عام)', 'Receive signals (master switch)')} />
          <div style={{ opacity: prefs.signals ? 1 : 0.4, pointerEvents: prefs.signals ? 'auto' : 'none' }}>
            <Toggle checked={prefs.futures} onChange={(v) => savePrefs({ ...prefs, futures: v })}
                    label={t('🔵 إشارات الفيوتشر', '🔵 Futures signals')} />
            <Toggle checked={prefs.spot} onChange={(v) => savePrefs({ ...prefs, spot: v })}
                    label={t('🟡 إشارات السبوت', '🟡 Spot signals')} />
          </div>
          {saving && <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '8px' }}>{t('جاري الحفظ...', 'Saving...')}</div>}
          {saved && <div style={{ fontSize: '11px', color: 'var(--green)', marginTop: '8px' }}>✓ {t('تم الحفظ', 'Saved')}</div>}
        </Card>

        {/* ── قائمة الاستبعاد الشخصية ── */}
        <Card title={`🚫 ${t('عملات مستبعدة (خاصة بك)', 'Excluded Coins (personal)')}`}>
          <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginBottom: '14px' }}>
            {t('أي عملة تضيفها هنا، ما تنرسل لك إشاراتها — باقي المشتركين يستلمونها عادي.', 'Any coin you add here won\'t be sent to you — other subscribers still receive it normally.')}
          </p>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            <input
              value={blSymbol} onChange={e => setBlSymbol(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addToBlacklist()}
              placeholder="BTCUSDT"
              style={{ flex: 1, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', fontFamily: 'inherit' }}
            />
            <button onClick={addToBlacklist} className="btn-primary" style={{ padding: '9px 18px', fontSize: '13px' }}>
              {t('إضافة', 'Add')}
            </button>
          </div>
          {blError && <div style={{ color: 'var(--red)', fontSize: '12px', marginBottom: '10px' }}>{blError}</div>}
          {user.personal_blacklist.length === 0 ? (
            <div style={{ fontSize: '12.5px', color: 'var(--muted)' }}>{t('ما فيه عملات مستبعدة حالياً', 'No excluded coins yet')}</div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {user.personal_blacklist.map(sym => (
                <span key={sym} style={{
                  display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,68,85,0.1)',
                  border: '1px solid rgba(255,68,85,0.25)', color: 'var(--red)', borderRadius: '8px',
                  padding: '5px 10px', fontSize: '12px', fontWeight: 700, fontFamily: 'var(--mono)',
                }}>
                  {sym}
                  <button onClick={() => removeFromBlacklist(sym)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: '13px', padding: 0, lineHeight: 1 }}>✕</button>
                </span>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
