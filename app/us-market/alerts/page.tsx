'use client'
import { useState, useEffect } from 'react'
import { useLang } from '../../ClientShell'
import { API_ORIGIN as API } from '../../lib/api'

type Alert = {
  symbol: string
  side: string | null
  price_at_alert: string
  strength_score: number
  price_bracket: string | null
  session: string | null
  created_at: string | null
}

const TABS = [
  { key: 'market', icon: '📡', ar: 'السوق', en: 'Market' },
  { key: 'watchlist', icon: '⭐', ar: 'المراقبة', en: 'Watchlist' },
  { key: 'events', icon: '📅', ar: 'الأحداث', en: 'Events' },
  { key: 'system', icon: '⚙️', ar: 'النظام', en: 'System' },
]

const PRICE_RANGES = ['<1', '1-5', '5-10', '10-20', '20+']

function timeAgo(iso: string | null, t: (a: string, b: string) => string) {
  if (!iso) return ''
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return t('الآن', 'now')
  if (mins < 60) return t(`منذ ${mins} دقيقة`, `${mins}m ago`)
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return t(`منذ ${hrs} ساعة`, `${hrs}h ago`)
  return t(`منذ ${Math.floor(hrs / 24)} يوم`, `${Math.floor(hrs / 24)}d ago`)
}

function AlertCard({ a, t }: { a: Alert; t: (ar: string, en: string) => string }) {
  const up = a.side === 'LONG'
  return (
    <div className="card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 900, fontSize: '15px' }}>{a.symbol}</span>
          {a.side && (
            <span style={{ fontSize: '13px', color: up ? '#22c55e' : '#ef4444' }}>{up ? '▲' : '▼'}</span>
          )}
          {a.price_bracket && (
            <span style={{ fontSize: '10.5px', color: 'var(--muted)', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', padding: '2px 7px' }}>
              ${a.price_bracket}
            </span>
          )}
        </div>
        <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '4px' }}>
          {t('السعر', 'Price')} ${a.price_at_alert} · {t('القوة', 'Strength')} {a.strength_score}
        </div>
      </div>
      <div style={{ fontSize: '11px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{timeAgo(a.created_at, t)}</div>
    </div>
  )
}

export default function USMarketAlertsPage() {
  const { t } = useLang()
  const [tab, setTab] = useState('market')
  const [priceRange, setPriceRange] = useState('')
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const qs = new URLSearchParams({ tab, ...(priceRange ? { price_range: priceRange } : {}) })
    fetch(`${API}/us/alerts?${qs.toString()}`)
      .then(r => r.json())
      .then(setAlerts)
      .catch(() => setAlerts([]))
      .finally(() => setLoading(false))
  }, [tab, priceRange])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <div style={{ padding: '32px 24px', maxWidth: '760px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 900, margin: 0 }}>🔔 {t('التنبيهات', 'Alerts')}</h1>

        <div style={{ display: 'flex', gap: '6px', marginTop: '18px', overflowX: 'auto' }}>
          {TABS.map(tb => (
            <button key={tb.key} onClick={() => setTab(tb.key)} style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
              borderRadius: '10px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer',
              border: 'none', fontFamily: 'inherit', whiteSpace: 'nowrap',
              background: tab === tb.key ? '#00c4ef' : 'rgba(255,255,255,0.05)',
              color: tab === tb.key ? 'black' : 'var(--muted)',
            }}>
              <span>{tb.icon}</span><span>{t(tb.ar, tb.en)}</span>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '6px', marginTop: '10px', overflowX: 'auto' }}>
          <button onClick={() => setPriceRange('')} style={{
            padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
            border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'inherit', whiteSpace: 'nowrap',
            background: priceRange === '' ? 'rgba(0,196,239,0.15)' : 'transparent',
            color: priceRange === '' ? '#00c4ef' : 'var(--muted)',
          }}>{t('الكل', 'All')}</button>
          {PRICE_RANGES.map(pr => (
            <button key={pr} onClick={() => setPriceRange(pr)} style={{
              padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'inherit', whiteSpace: 'nowrap',
              background: priceRange === pr ? 'rgba(0,196,239,0.15)' : 'transparent',
              color: priceRange === pr ? '#00c4ef' : 'var(--muted)',
            }}>${pr}</button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '18px' }}>
          {loading ? (
            <div style={{ color: 'var(--muted)', fontSize: '13px', textAlign: 'center', padding: '30px 0' }}>
              {t('جاري التحميل...', 'Loading...')}
            </div>
          ) : alerts.length === 0 ? (
            <div style={{ color: 'var(--muted)', fontSize: '13px', textAlign: 'center', padding: '30px 0' }}>
              {t('لا توجد تنبيهات بهذا التبويب حالياً — القسم قيد المعايرة المبكرة.',
                 'No alerts in this tab yet — this section is in early calibration.')}
            </div>
          ) : (
            alerts.map((a, i) => <AlertCard key={i} a={a} t={t} />)
          )}
        </div>
      </div>
    </div>
  )
}
