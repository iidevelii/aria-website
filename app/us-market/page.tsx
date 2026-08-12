'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLang } from '../ClientShell'
import ComingSoonUSMarket from '../ComingSoonUSMarket'
import { API_ORIGIN as API } from '../lib/api'

type HomeSummary = {
  count_24h: number
  top_mover: { symbol: string; price: string; strength: number } | null
  avg_strength: number
  by_strength: Record<string, number>
}

function StrengthBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{ fontSize: '11px', color: 'var(--muted)', width: '48px' }}>{label}</span>
      <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: '#00c4ef', borderRadius: '3px' }} />
      </div>
      <span style={{ fontSize: '11px', color: 'var(--text)', width: '20px', textAlign: 'right' }}>{value}</span>
    </div>
  )
}

function QuickLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link href={href} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
      padding: '18px 12px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)', textDecoration: 'none', color: 'var(--text)',
    }}>
      <span style={{ fontSize: '22px' }}>{icon}</span>
      <span style={{ fontSize: '12.5px', fontWeight: 700 }}>{label}</span>
    </Link>
  )
}

export default function USMarketPage() {
  const { t } = useLang()
  const [summary, setSummary] = useState<HomeSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/us/home-summary`)
      .then(r => r.json())
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setLoading(false))
  }, [])

  const maxBucket = summary ? Math.max(1, ...Object.values(summary.by_strength)) : 1

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <div style={{ padding: '32px 24px 0', maxWidth: '1100px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>
          🇺🇸 {t('السوق الأمريكي', 'US Market')}
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '6px' }}>
          {t('تنبيهات الأسهم الأمريكية — قسم جديد قيد المعايرة، الأرقام أدناه حية من قاعدة البيانات.',
             'US-stock alerts — a new section still being calibrated; the numbers below are live from the database.')}
        </p>

        <div style={{
          marginTop: '18px', display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(0,196,239,0.08)', border: '1px solid rgba(0,196,239,0.25)',
          borderRadius: '20px', padding: '5px 14px',
        }}>
          <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#00c4ef' }}>
            🧪 {t('وصول مبكر — التنبيهات الحية لسا معطّلة لحد ما يُراجَع باك تست رسمي', 'Early access — live alerts stay off until a formal backtest is reviewed')}
          </span>
        </div>

        {/* بطاقة ملخص الجلسة */}
        <div className="card" style={{ marginTop: '20px', padding: '22px' }}>
          {loading ? (
            <div style={{ color: 'var(--muted)', fontSize: '13px' }}>{t('جاري التحميل...', 'Loading...')}</div>
          ) : !summary || summary.count_24h === 0 ? (
            <div style={{ color: 'var(--muted)', fontSize: '13px', textAlign: 'center', padding: '12px 0' }}>
              {t('لا توجد تنبيهات بآخر 24 ساعة بعد — القسم بمرحلة معايرة مبكرة.',
                 'No alerts in the last 24 hours yet — this section is in early calibration.')}
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', marginBottom: '18px' }}>
                <div>
                  <div className="stat-label">{t('تنبيهات آخر 24 ساعة', 'Alerts, last 24h')}</div>
                  <div style={{ fontSize: '26px', fontWeight: 900 }}>{summary.count_24h}</div>
                </div>
                {summary.top_mover && (
                  <div>
                    <div className="stat-label">{t('الأنشط', 'Top mover')}</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#22c55e' }}>{summary.top_mover.symbol}</div>
                  </div>
                )}
                <div>
                  <div className="stat-label">{t('متوسط القوة', 'Avg strength')}</div>
                  <div style={{ fontSize: '18px', fontWeight: 800 }}>{summary.avg_strength}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.entries(summary.by_strength).map(([label, value]) => (
                  <StrengthBar key={label} label={label} value={value} max={maxBucket} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* اختصارات سريعة */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px', marginTop: '18px' }}>
          <QuickLink href="/us-market/alerts" icon="🔔" label={t('التنبيهات', 'Alerts')} />
          <QuickLink href="/us-market/watchlist" icon="⭐" label={t('المتابعة', 'Watchlist')} />
        </div>
      </div>

      {/* ميزات لسا قادمة (أوبشن/Gamma/مطّلعين/كونغرس) -- غير مبنية بعد */}
      <div style={{ marginTop: '48px' }}>
        <ComingSoonUSMarket />
      </div>
    </div>
  )
}
