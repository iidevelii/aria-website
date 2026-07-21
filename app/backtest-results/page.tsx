'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

type CoinRow = {
  symbol: string; trades: number; wins: number; losses: number
  winRate: number | null; pf: number | null; netPct: number | null
  status: 'active' | 'blacklisted' | 'insufficient_data' | 'no_signal'
}
type MarketData = {
  key?: string; engine: string; universe: number
  summary: { totalTrades: number; wins: number; losses: number; winRate: number; pf: number | null; netPct: number }
  coins: CoinRow[]
  blacklistNote: string
}
type BacktestData = {
  generatedNote: string; period: string
  futures: MarketData; spotStrategies: MarketData[]
}

function StatusBadge({ status }: { status: CoinRow['status'] }) {
  const map = {
    active:             { text: '✅ نشطة',        bg: 'rgba(0,230,100,0.12)',  color: 'var(--green)' },
    blacklisted:        { text: '🚫 مستبعدة',     bg: 'rgba(255,68,85,0.12)',  color: 'var(--red)' },
    insufficient_data:  { text: '⏳ بيانات قليلة', bg: 'rgba(251,191,36,0.12)', color: 'var(--yellow)' },
    no_signal:          { text: '— بدون إشارة',   bg: 'transparent',           color: 'var(--muted)' },
  }[status]
  return (
    <span style={{ background: map.bg, color: map.color, borderRadius: '6px', padding: '3px 10px', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap' }}>
      {map.text}
    </span>
  )
}

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '18px', textAlign: 'center' }}>
      <div style={{ fontSize: '22px', fontWeight: 900, color: color || 'var(--text)' }}>{value}</div>
      <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
    </div>
  )
}

function MarketSection({ data, title, emoji }: { data: MarketData; title: string; emoji: string }) {
  const [sortBy, setSortBy] = useState<'trades' | 'winRate' | 'pf' | 'netPct'>('trades')
  const tested = data.coins.filter(c => c.trades > 0)
  const sorted = [...tested].sort((a, b) => (b[sortBy] ?? -Infinity) - (a[sortBy] ?? -Infinity))

  return (
    <div style={{ marginBottom: '48px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <span style={{ fontSize: '24px' }}>{emoji}</span>
        <h2 style={{ fontSize: '22px', fontWeight: 900, margin: 0 }}>{title}</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <StatCard label="عملات مُختبَرة" value={`${data.universe}`} />
        <StatCard label="إجمالي الصفقات" value={`${data.summary.totalTrades}`} />
        <StatCard label="نسبة النجاح" value={`${data.summary.winRate}%`} color={data.summary.winRate >= 60 ? 'var(--green)' : 'var(--yellow)'} />
        <StatCard label="Profit Factor" value={data.summary.pf ? `${data.summary.pf}` : '—'} color="var(--cyan)" />
        <StatCard label="صافي %" value={`${data.summary.netPct >= 0 ? '+' : ''}${data.summary.netPct}%`} color={data.summary.netPct >= 0 ? 'var(--green)' : 'var(--red)'} />
      </div>

      <div style={{
        background: 'rgba(0,196,239,0.06)', border: '1px solid rgba(0,196,239,0.2)',
        borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.7,
      }}>
        ℹ️ {data.blacklistNote}
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <span style={{ fontWeight: 700, fontSize: '14px' }}>نتائج كل عملة ({tested.length} من {data.coins.length})</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {([['trades', 'عدد الصفقات'], ['winRate', 'نسبة النجاح'], ['pf', 'Profit Factor'], ['netPct', 'صافي %']] as const).map(([key, label]) => (
              <button key={key} onClick={() => setSortBy(key)}
                style={{
                  padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                  border: 'none', fontFamily: 'inherit',
                  background: sortBy === key ? 'var(--cyan)' : 'var(--surface-2)',
                  color: sortBy === key ? '#000' : 'var(--muted)',
                }}>{label}</button>
            ))}
          </div>
        </div>
        <div style={{ overflowX: 'auto', maxHeight: '520px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ position: 'sticky', top: 0, background: 'var(--surface)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                <th style={{ padding: '10px 16px', textAlign: 'right', fontSize: '11px' }}>العملة</th>
                <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: '11px' }}>صفقات</th>
                <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: '11px' }}>رابحة/خاسرة</th>
                <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: '11px' }}>نسبة النجاح</th>
                <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: '11px' }}>Profit Factor</th>
                <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: '11px' }}>صافي %</th>
                <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: '11px' }}>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(c => (
                <tr key={c.symbol} style={{ borderBottom: '1px solid var(--border)', opacity: c.status === 'blacklisted' ? 0.55 : 1 }}>
                  <td style={{ padding: '10px 16px', fontWeight: 800, fontFamily: 'var(--mono)' }}>{c.symbol}</td>
                  <td style={{ padding: '10px 16px', textAlign: 'center' }}>{c.trades}</td>
                  <td style={{ padding: '10px 16px', textAlign: 'center', fontFamily: 'var(--mono)' }}>
                    <span style={{ color: 'var(--green)' }}>{c.wins}</span> / <span style={{ color: 'var(--red)' }}>{c.losses}</span>
                  </td>
                  <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 700, color: (c.winRate ?? 0) >= 60 ? 'var(--green)' : 'var(--yellow)' }}>
                    {c.winRate}%
                  </td>
                  <td style={{ padding: '10px 16px', textAlign: 'center', fontFamily: 'var(--mono)' }}>{c.pf ?? '—'}</td>
                  <td style={{ padding: '10px 16px', textAlign: 'center', fontFamily: 'var(--mono)', color: (c.netPct ?? 0) >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {(c.netPct ?? 0) >= 0 ? '+' : ''}{c.netPct}%
                  </td>
                  <td style={{ padding: '10px 16px', textAlign: 'center' }}><StatusBadge status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function BacktestResults() {
  const [data, setData] = useState<BacktestData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/backtest-results.json')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: '32px 20px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '30px', fontWeight: 900, marginBottom: '6px' }}>📊 نتائج الباك تست التاريخي</h1>
            <p style={{ color: 'var(--muted)', fontSize: '14px' }}>{data?.period || 'آخر 365 يوم'} — بيانات Binance حقيقية، لكل عملة على حدة</p>
          </div>
          <Link href="/dashboard" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', textDecoration: 'none', padding: '10px 20px', borderRadius: '12px', fontSize: '13px', fontWeight: 700 }}>← الداشبورد</Link>
        </div>

        {/* ── إخلاء مسؤولية صريح — إلزامي، مو اختياري ── */}
        <div style={{
          background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)',
          borderRadius: '14px', padding: '16px 20px', marginBottom: '32px',
          display: 'flex', gap: '12px', alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: '20px' }}>⚠️</span>
          <div style={{ fontSize: '13px', lineHeight: 1.8, color: 'var(--text)' }}>
            <strong>هذي نتائج باك تست (محاكاة تاريخية) على بيانات Binance الحقيقية — مو صفقات حية نُفِّذت فعلياً.</strong>
            <br />
            محدودياتها بصراحة: تشغيلة واحدة (مو walk-forward)، بدون احتساب رسوم التداول أو الانزلاق السعري (slippage) أو تمويل
            المراكز (funding rate بالفيوتشر). الأداء الماضي لا يضمن نتائج مستقبلية، وظروف السوق تتغير — الاستراتيجيات تحتاج
            مراجعة دورية. هذي أرقام واعدة، مو وعد بربح مضمون.
          </div>
        </div>

        {loading && <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '60px 0' }}>جاري التحميل...</p>}
        {!loading && !data && <p style={{ textAlign: 'center', color: 'var(--red)', padding: '60px 0' }}>تعذّر تحميل البيانات</p>}

        {data && (
          <>
            <MarketSection data={data.futures} title="الفيوتشر" emoji="🔵" />

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <span style={{ fontSize: '24px' }}>🟡</span>
                <h2 style={{ fontSize: '22px', fontWeight: 900, margin: 0 }}>السبوت — مقارنة استراتيجيتين</h2>
              </div>
              <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>
                نختبر أكثر من استراتيجية على نفس عملات السبوت — نشوف الأداء الحقيقي لكل وحدة قبل ما نعتمد النهائية.
              </p>
            </div>
            {data.spotStrategies.map((s, i) => (
              <MarketSection key={s.key || i} data={s} title={`استراتيجية ${i + 1}`} emoji={i === 0 ? '🥇' : '🥈'} />
            ))}
          </>
        )}

      </div>
    </div>
  )
}
