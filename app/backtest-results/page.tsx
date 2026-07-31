'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLang } from '../layout'
import EquityCurve from './EquityCurve'

type EquityCurveData = { engine: string; universe: number; totalTrades: number; netPct: number; points: { t: string; cum: number }[] }

type CoinRow = {
  symbol: string; trades: number; wins: number; losses: number
  winRate: number | null; pf: number | null; netPct: number | null
  status: 'active' | 'blacklisted' | 'insufficient_data' | 'no_signal'
}
type SideStat = { side: 'LONG' | 'SHORT'; trades: number; wins: number; losses: number; winRate: number; pf: number | null; netPct: number }
type MarketData = {
  key?: string; engine: string; universe: number
  summary: { totalTrades: number; wins: number; losses: number; winRate: number; pf: number | null; netPct: number }
  coins: CoinRow[]
  blacklistNote: string
  sideBreakdown?: SideStat[]
}
type BacktestData = {
  generatedNote: string; period: string
  futures: MarketData; spotStrategies: MarketData[]
}

function StatusBadge({ status }: { status: CoinRow['status'] }) {
  const { t } = useLang()
  const map = {
    active:             { text: t('✅ نشطة', '✅ Active'),                 bg: 'rgba(0,230,100,0.12)',  color: 'var(--green)' },
    blacklisted:        { text: t('🚫 مستبعدة', '🚫 Blacklisted'),         bg: 'rgba(255,68,85,0.12)',  color: 'var(--red)' },
    insufficient_data:  { text: t('⏳ بيانات قليلة', '⏳ Insufficient Data'), bg: 'rgba(251,191,36,0.12)', color: 'var(--yellow)' },
    no_signal:          { text: t('● بدون إشارة', '● No Signal'),         bg: 'transparent',           color: 'var(--muted)' },
  }[status]
  return (
    <span style={{ background: map.bg, color: map.color, borderRadius: '6px', padding: '3px 10px', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap' }}>
      {map.text}
    </span>
  )
}

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', padding: '18px', textAlign: 'center' }}>
      <div style={{ fontSize: '22px', fontWeight: 900, color: color || 'var(--text)' }}>{value}</div>
      <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
    </div>
  )
}

function MarketSection({ data, title, emoji }: { data: MarketData; title: string; emoji: string }) {
  const { t, lang } = useLang()
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
        <StatCard label={t('عملات مُختبَرة', 'Coins Tested')} value={`${data.universe}`} />
        <StatCard label={t('إجمالي الصفقات', 'Total Trades')} value={`${data.summary.totalTrades}`} />
        <StatCard label={t('نسبة النجاح', 'Win Rate')} value={`${data.summary.winRate}%`} color={data.summary.winRate >= 60 ? 'var(--green)' : 'var(--yellow)'} />
        <StatCard label="Profit Factor" value={data.summary.pf ? `${data.summary.pf}` : '—'} color="var(--cyan)" />
        <StatCard label={t('صافي %', 'Net %')} value={`${data.summary.netPct >= 0 ? '+' : ''}${data.summary.netPct}%`} color={data.summary.netPct >= 0 ? 'var(--green)' : 'var(--red)'} />
      </div>

      <div style={{
        background: 'rgba(0,196,239,0.06)', border: '1px solid rgba(0,196,239,0.2)',
        borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.7,
      }}>
        ℹ️ {data.blacklistNote}
      </div>

      {data.sideBreakdown && data.sideBreakdown.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          {(() => {
            const better = data.sideBreakdown!.reduce((a, b) => (b.netPct > a.netPct ? b : a))
            return data.sideBreakdown!.map(st => {
              const color = st.side === 'LONG' ? 'var(--green)' : 'var(--red)'
              const isBetter = better.side === st.side
              return (
                <div key={st.side} style={{ background: 'var(--surface)', border: `1px solid ${isBetter ? color + '55' : 'var(--border)'}`, borderRadius: '14px', padding: '16px', position: 'relative' }}>
                  {isBetter && (
                    <span style={{ position: 'absolute', top: '10px', [lang === 'en' ? 'right' : 'left']: '10px', fontSize: '10px', fontWeight: 800, color, background: `${color}20`, padding: '3px 8px', borderRadius: '6px' }}>{t('الأكثر ربحاً', 'Most Profitable')}</span>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 900, color }}>{st.side === 'LONG' ? '🟢 LONG' : '🔴 SHORT'}</span>
                    <span style={{ fontSize: '12px', color: 'var(--muted)' }}>({st.trades} {t('صفقة', 'trades')})</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '12px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 800, fontSize: '16px' }}>{st.winRate}%</div>
                      <div style={{ color: 'var(--muted)', fontSize: '10px' }}>{t('نسبة الفوز', 'Win Rate')}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--green)' }}>{st.wins}</div>
                      <div style={{ color: 'var(--muted)', fontSize: '10px' }}>{t('رابحة', 'Wins')}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--red)' }}>{st.losses}</div>
                      <div style={{ color: 'var(--muted)', fontSize: '10px' }}>{t('خاسرة', 'Losses')}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: 'var(--muted)' }}>PF: {st.pf ?? '—'}</span>
                    <span style={{ fontWeight: 700, color: st.netPct >= 0 ? 'var(--green)' : 'var(--red)' }}>{t(`${st.netPct >= 0 ? '+' : ''}${st.netPct}% صافي`, `Net: ${st.netPct >= 0 ? '+' : ''}${st.netPct}%`)}</span>
                  </div>
                </div>
              )
            })
          })()}
        </div>
      )}

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <span style={{ fontWeight: 700, fontSize: '14px' }}>{t(`نتائج كل عملة (${tested.length} من ${data.coins.length})`, `Results per coin (${tested.length} of ${data.coins.length})`)}</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {([['trades', 'عدد الصفقات', 'Trades'], ['winRate', 'نسبة النجاح', 'Win Rate'], ['pf', 'Profit Factor', 'Profit Factor'], ['netPct', 'صافي %', 'Net %']] as const).map(([key, label, labelEn]) => (
              <button key={key} onClick={() => setSortBy(key)}
                style={{
                  padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                  border: 'none', fontFamily: 'inherit',
                  background: sortBy === key ? 'var(--cyan)' : 'var(--surface-2)',
                  color: sortBy === key ? '#000' : 'var(--muted)',
                }}>{t(label, labelEn)}</button>
            ))}
          </div>
        </div>
        <div style={{ overflowX: 'auto', maxHeight: '520px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ position: 'sticky', top: 0, background: 'var(--surface)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                <th style={{ padding: '10px 16px', textAlign: lang === 'en' ? 'left' : 'right', fontSize: '11px' }}>{t('العملة', 'Coin')}</th>
                <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: '11px' }}>{t('صفقات', 'Trades')}</th>
                <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: '11px' }}>{t('رابحة/خاسرة', 'Wins/Losses')}</th>
                <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: '11px' }}>{t('نسبة النجاح', 'Win Rate')}</th>
                <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: '11px' }}>Profit Factor</th>
                <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: '11px' }}>{t('صافي %', 'Net %')}</th>
                <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: '11px' }}>{t('الحالة', 'Status')}</th>
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
  const { t } = useLang()
  const [data, setData] = useState<BacktestData | null>(null)
  const [loading, setLoading] = useState(true)
  const [equity, setEquity] = useState<EquityCurveData | null>(null)
  const [spotEquity, setSpotEquity] = useState<EquityCurveData | null>(null)

  useEffect(() => {
    fetch('/backtest-results.json')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
    fetch('/trend-equity-curve.json')
      .then(r => r.json())
      .then(d => setEquity(d))
      .catch(() => {})
    fetch('/spot-equity-curve.json')
      .then(r => r.json())
      .then(d => setSpotEquity(d))
      .catch(() => {})
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: '32px 20px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '30px', fontWeight: 900, marginBottom: '6px' }}>{t('📊 نتائج الباك تست التاريخي', '📊 Historical Backtest Results')}</h1>
            <p style={{ color: 'var(--muted)', fontSize: '14px' }}>{data?.period || t('آخر 365 يوم', 'Last 365 days')} · {t('بيانات Binance حقيقية، لكل عملة على حدة', 'Real Binance data, coin by coin')}</p>
          </div>
          <Link href="/dashboard" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', textDecoration: 'none', padding: '10px 20px', borderRadius: '12px', fontSize: '13px', fontWeight: 700 }}>{t('← الداشبورد', '← Dashboard')}</Link>
        </div>

        {/* ── إخلاء مسؤولية صريح — إلزامي، مو اختياري ── */}
        <div style={{
          background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)',
          borderRadius: '14px', padding: '16px 20px', marginBottom: '32px',
          display: 'flex', gap: '12px', alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: '20px' }}>📈</span>
          <div style={{ fontSize: '13px', lineHeight: 1.8, color: 'var(--text)' }}>
            <strong>{t(
              'لو كنت مشترك معنا خلال آخر 365 يوم، هذي تقريباً النتائج اللي كانت طالعة لك، بمحاكاة دقيقة على بيانات Binance الحقيقية لكل صفقة.',
              'If you had been subscribed with us over the last 365 days, these are roughly the results you would have seen, based on an accurate simulation using real Binance data for every trade.'
            )}</strong>
            <br />
            {t(
              'بكل شفافية: هذي أرقام محاكاة (باك تست) على بيانات تاريخية من تشغيلة واحدة، مو صفقات حية نُفِّذت فعلياً، وما تحتسب رسوم التداول أو الانزلاق السعري (slippage) أو تمويل المراكز (funding rate بالفيوتشر). السوق يتغير باستمرار والأداء الفعلي ممكن يختلف عن الماضي، لكنها مؤشر قوي على الاستراتيجية اللي يشتغل فيها البوت كل يوم، ونراجعها بشكل دوري لنحافظ على جودتها.',
              'In full transparency: these are simulated (backtested) numbers from a single run on historical data, not live trades that were actually executed, and they do not account for trading fees, price slippage, or futures funding rates. Markets are constantly changing and actual performance may differ from the past, but this is a strong indicator of the strategy the bot runs every day, and we review it periodically to maintain its quality.'
            )}
          </div>
        </div>

        {loading && <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '60px 0' }}>{t('جاري التحميل...', 'Loading...')}</p>}
        {!loading && !data && <p style={{ textAlign: 'center', color: 'var(--red)', padding: '60px 0' }}>{t('تعذّر تحميل البيانات', 'Failed to load data')}</p>}

        {equity && (
          <div style={{ marginBottom: '8px' }}>
            <EquityCurve
              points={equity.points}
              netPct={equity.netPct}
              totalTrades={equity.totalTrades}
              label={`🔵 ${t('منحنى الفيوتشر (TREND_MTF)', 'Futures Equity Curve (TREND_MTF)')}`}
            />
            <p style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '-8px', marginBottom: '32px', lineHeight: 1.7 }}>
              {t(
                `⚠️ هذا المنحنى مبني من إعادة تشغيل حقيقية بنفس إعدادات البوت الحي بالضبط (SL 0.6×ATR / TP 1.2R) على عيّنة ${equity.universe} عملة/365 يوم: ${equity.totalTrades} صفقة حقيقية بترتيبها الزمني الفعلي، مو أرقام تقديرية. الجدول والإحصائيات بالأسفل مبنية على عيّنة أوسع (${data?.futures.universe ?? 529} عملة) ولذلك أرقامها تختلف قليلاً عن هذا المنحنى.`,
                `⚠️ This curve is built from a real re-run using the exact live bot settings (SL 0.6×ATR / TP 1.2R) on a ${equity.universe}-coin/365-day sample: ${equity.totalTrades} real trades in actual chronological order, not an estimate. The table and stats below come from a broader ${data?.futures.universe ?? 529}-coin sample, so the numbers differ slightly from this curve.`
              )}
            </p>
          </div>
        )}

        {data && (
          <>
            <MarketSection data={data.futures} title={t('الفيوتشر', 'Futures')} emoji="🔵" />

            {spotEquity && (
              <div style={{ marginBottom: '8px' }}>
                <EquityCurve
                  points={spotEquity.points}
                  netPct={spotEquity.netPct}
                  totalTrades={spotEquity.totalTrades}
                  label={`🟡 ${t('منحنى السبوت (SMC_MTF)', 'Spot Equity Curve (SMC_MTF)')}`}
                />
                <p style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '-8px', marginBottom: '32px', lineHeight: 1.7 }}>
                  {t(
                    `⚠️ نفس المبدأ: إعادة تشغيل حقيقية بنفس إعدادات البوت الحي (SL 0.3×ATR / TP 2.0R) على عيّنة ${spotEquity.universe} عملة/365 يوم، ${spotEquity.totalTrades} صفقة حقيقية فقط (تردد السبوت أقل بطبيعته من الفيوتشر). الجدول بالأسفل مبني على عيّنة أوسع (462 عملة).`,
                    `⚠️ Same principle: a real re-run using the exact live bot settings (SL 0.3×ATR / TP 2.0R) on a ${spotEquity.universe}-coin/365-day sample, only ${spotEquity.totalTrades} real trades (spot is naturally lower-frequency than futures). The table below comes from a broader 462-coin sample.`
                  )}
                </p>
              </div>
            )}

            {data.spotStrategies.map((s, i) => (
              <MarketSection key={s.key || i} data={s} title={t(`استراتيجية ${i + 1}`, `Strategy ${i + 1}`)} emoji={i === 0 ? '🥇' : '🥈'} />
            ))}
          </>
        )}

      </div>
    </div>
  )
}
