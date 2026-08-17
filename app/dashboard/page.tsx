'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useLang } from '../ClientShell'
import TradeChart from '../TradeChart'
import { fetchKlines } from '../lib/klines'
import { API_ORIGIN as API } from '../lib/api'
import { apiFetch } from '../lib/apiFetch'

// شكل صف signals بباك اند aria-bot (database.py Signal model، مصفّى للحقول
// اللي فعلياً تُستخدم بهالصفحة) -- موحّد هنا بدل any مبعثرة بكل استخدام.
type Signal = {
  id: number; pair: string; side: 'LONG' | 'SHORT'
  entry: string; tp: string; sl: string; tp_pct: string; sl_pct: string
  regime: string | null; ai_score: number; status: 'OPEN' | 'WIN' | 'LOSS'
  leverage: number; created_at: string; closed_at: string | null
  close_price: string | null; pnl_pct: string | null; market: 'SPOT' | 'FUTURES'
  engine: string | null; confirmed: boolean; confirmed_by: string | null
}

function fmt(p: number | string) {
  const n = parseFloat(String(p))
  if (isNaN(n)) return '—'
  if (n >= 10000) return n.toLocaleString(undefined, { maximumFractionDigits: 0 })
  if (n >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 2 })
  if (n >= 1) return n.toFixed(4)
  if (n >= 0.01) return n.toFixed(5)
  return n.toFixed(6)
}

function fmtDate(raw: string | undefined) {
  if (!raw) return ''
  const d = new Date(raw)
  if (isNaN(d.getTime())) return ''
  const day = d.getDate().toString().padStart(2, '0')
  const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
  const hr = d.getHours().toString().padStart(2, '0')
  const mn = d.getMinutes().toString().padStart(2, '0')
  return `${day} ${months[d.getMonth()]} · ${hr}:${mn}`
}

const MARKET_INTERVALS = [
  { key: '15m', label: '15m' }, { key: '1h', label: '1h' },
  { key: '4h', label: '4h' }, { key: '1d', label: '1D' },
]

// lightweight-charts يرسم على canvas -- ما يفهم متغيرات CSS (var(--green))،
// يفشل بصمت ويرجع للأسود الافتراضي. لازم نقرأ القيمة الفعلية المحسوبة
// (getComputedStyle) بدل تمرير النص var(...) مباشرة (مراجعة DevelBot_review.md
// بند 21). fallback احتياطي لو تعذّر القراءة لأي سبب.
function _cssVar(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return v || fallback
}

function MarketChart({ symbol }: { symbol: string }) {
  const chartRef = useRef<HTMLDivElement>(null)
  const [interval, setInterval_] = useState('1h')

  useEffect(() => {
    if (!chartRef.current) return
    let chart: any
    let series: any
    let resizeObs: ResizeObserver | null = null
    let themeObs: MutationObserver | null = null
    let cancelled = false

    const applyThemeColors = () => {
      if (!chart || !series) return
      const green = _cssVar('--green', '#22d06e')
      const red = _cssVar('--red', '#f04060')
      const muted = _cssVar('--muted', '#5a6478')
      chart.applyOptions({ layout: { textColor: muted } })
      series.applyOptions({
        upColor: green, downColor: red,
        borderUpColor: green, borderDownColor: red,
        wickUpColor: green, wickDownColor: red,
      })
    }

    const init = async () => {
      const { createChart, CandlestickSeries } = await import('lightweight-charts')
      if (cancelled || !chartRef.current) return
      chartRef.current.innerHTML = ''
      chart = createChart(chartRef.current, {
        width: chartRef.current.clientWidth,
        height: 450,
        layout: { background: { color: 'transparent' }, textColor: _cssVar('--muted', '#5a6478') },
        grid: { vertLines: { color: 'rgba(255,255,255,0.04)' }, horzLines: { color: 'rgba(255,255,255,0.04)' } },
        crosshair: { mode: 1 },
        rightPriceScale: { borderColor: 'rgba(255,255,255,0.08)' },
        timeScale: { borderColor: 'rgba(255,255,255,0.08)', timeVisible: true },
      })

      resizeObs = new ResizeObserver(entries => {
        const w = entries[0]?.contentRect?.width
        if (w && w > 0) chart.applyOptions({ width: Math.floor(w) })
      })
      resizeObs.observe(chartRef.current)

      const green = _cssVar('--green', '#22d06e')
      const red = _cssVar('--red', '#f04060')
      series = chart.addSeries(CandlestickSeries, {
        upColor: green, downColor: red,
        borderUpColor: green, borderDownColor: red,
        wickUpColor: green, wickDownColor: red,
      })

      // إعادة حساب الألوان لحظة تبديل الثيم (data-theme على <html>) --
      // بدونها الشارت يبقى بألوان الثيم القديم لحد ما تُعاد فتح الصفحة
      themeObs = new MutationObserver(applyThemeColors)
      themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

      try {
        const candles = await fetchKlines(`${symbol}USDT`, interval, 200, 'SPOT')
        if (cancelled) return
        series.setData(candles)
        chart.timeScale().fitContent()
      } catch {}
    }

    init()
    return () => { cancelled = true; resizeObs?.disconnect(); themeObs?.disconnect(); if (chart) chart.remove() }
  }, [symbol, interval])

  return (
    <div>
      <div style={{ display: 'flex', gap: '6px', padding: '10px 16px' }}>
        {MARKET_INTERVALS.map(iv => (
          <button key={iv.key} onClick={() => setInterval_(iv.key)} style={{ padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', border: 'none', fontFamily: 'inherit', background: interval === iv.key ? '#00c4ef' : 'rgba(255,255,255,0.05)', color: interval === iv.key ? 'black' : 'var(--muted)' }}>
            {iv.label}
          </button>
        ))}
      </div>
      <div ref={chartRef} style={{ width: '100%', height: 450 }} />
    </div>
  )
}

function FearGreed() {
  const [value, setValue] = useState(0)
  const [label, setLabel] = useState('')
  useEffect(() => {
    fetch('https://api.alternative.me/fng/')
      .then(r => r.json())
      .then(d => { setValue(parseInt(d.data[0].value)); setLabel(d.data[0].value_classification) })
      .catch(() => { setValue(50); setLabel('Neutral') })
  }, [])
  const color = value < 25 ? 'var(--red)' : value < 45 ? 'var(--yellow)' : value < 55 ? 'var(--yellow)' : value < 75 ? '#84cc16' : 'var(--green)'
  const pct = (value / 100) * 283
  return (
    <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
      <div className="stat-label" style={{ marginBottom: '16px' }}>Fear & Greed Index</div>
      <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 12px' }}>
        <svg viewBox="0 0 100 100" style={{ width: '80px', height: '80px', transform: 'rotate(-90deg)' }}>
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"/>
          <circle cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${pct * 0.887} 283`} strokeLinecap="round"/>
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 900, color }}>{value}</div>
      </div>
      <div style={{ fontSize: '13px', fontWeight: 700, color }}>{label}</div>
    </div>
  )
}

function SignalCard({ s, prices }: { s: Signal, prices: Record<string, number> }) {
  const { t } = useLang()
  const sym = (s.pair || '').replace('/', '')
  const cur = prices[sym]
  const entry = parseFloat(s.entry)
  const tp = parseFloat(s.tp)
  const sl = parseFloat(s.sl)
  const lev = s.leverage || 1
  const isOpen = s.status === 'OPEN'
  const isWin = s.status === 'WIN'
  const isLoss = s.status === 'LOSS'

  let livePct = 0
  if (cur && isOpen) {
    livePct = ((cur - entry) / entry) * 100 * (s.side === 'SHORT' ? -1 : 1)
  }
  const levPct = livePct * lev

  let progress = 50
  if (cur && isOpen) {
    if (s.side === 'LONG' && tp > sl) progress = Math.max(0, Math.min(100, ((cur - sl) / (tp - sl)) * 100))
    else if (s.side === 'SHORT' && sl > tp) progress = Math.max(0, Math.min(100, ((sl - cur) / (sl - tp)) * 100))
  }

  const statusColor = isWin ? 'var(--green)' : isLoss ? 'var(--red)' : 'var(--yellow)'
  const sideColor = s.side === 'LONG' ? 'var(--green)' : 'var(--red)'
  const pnlColor = levPct >= 0 ? 'var(--green)' : 'var(--red)'
  const barColor = progress > 70 ? 'var(--green)' : progress > 35 ? 'var(--yellow)' : 'var(--red)'

  const closedPnl = s.pnl_pct ? parseFloat(s.pnl_pct) : null

  const openFullChart = () => {
    const params = new URLSearchParams({
      symbol: sym, entry: String(s.entry), tp: String(s.tp), sl: String(s.sl), side: s.side,
      status: s.status || 'OPEN', market: s.market || 'FUTURES',
    })
    if (s.created_at) params.set('created_at', s.created_at)
    if (s.closed_at) params.set('closed_at', s.closed_at)
    if (s.close_price) params.set('close_price', String(s.close_price))
    if (s.pnl_pct) params.set('pnl_pct', String(s.pnl_pct))
    window.open(`/chart?${params.toString()}`, '_blank')
  }

  return (
    <div className="signal-card" style={{ cursor: 'default' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', gap: '8px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '19px', fontWeight: 900, letterSpacing: '-0.02em' }}>{s.pair}</span>
          {s.confirmed && (
            <span title={t(`إشارة مؤكدة — اتفق معها ${s.confirmed_by || ''}`, `Confirmed signal — agreed by ${s.confirmed_by || ''}`)} style={{
              background: 'rgba(251,191,36,0.14)', color: 'var(--yellow)',
              border: '1px solid rgba(251,191,36,0.4)',
              borderRadius: '6px', padding: '3px 10px', fontSize: '11px', fontWeight: 800,
            }}>{t('⭐ مؤكدة', '⭐ Confirmed')}</span>
          )}
          <span style={{
            background: s.market === 'SPOT' ? 'rgba(251,191,36,0.12)' : 'rgba(0,196,239,0.12)',
            color: s.market === 'SPOT' ? 'var(--yellow)' : '#00c4ef',
            border: `1px solid ${s.market === 'SPOT' ? 'rgba(251,191,36,0.35)' : 'rgba(0,196,239,0.35)'}`,
            borderRadius: '6px', padding: '3px 10px', fontSize: '11px', fontWeight: 800,
          }}>{s.market === 'SPOT' ? t('🟡 سبوت', '🟡 Spot') : t('🔵 فيوتشر', '🔵 Futures')}</span>
          <span style={{
            background: s.side === 'LONG' ? 'rgba(0,230,100,0.12)' : 'rgba(255,85,85,0.12)',
            color: sideColor,
            border: `1px solid ${sideColor}50`,
            borderRadius: '6px', padding: '3px 10px', fontSize: '11px', fontWeight: 800,
          }}>{s.side}</span>
          <span style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--muted)', borderRadius: '6px', padding: '3px 8px', fontSize: '11px' }}>
            {s.regime}
          </span>
          <span style={{
            background: isWin ? 'rgba(0,230,100,0.1)' : isLoss ? 'rgba(255,85,85,0.1)' : 'rgba(251,191,36,0.1)',
            color: statusColor,
            border: `1px solid ${statusColor}30`,
            borderRadius: '6px', padding: '3px 8px', fontSize: '11px', fontWeight: 700,
          }}>
            {isWin ? t('✓ ربح', '✓ Win') : isLoss ? t('✗ خسارة', '✗ Loss') : t('● مفتوحة', '● Open')}
          </span>
          {closedPnl !== null && !isOpen && (
            <span style={{ fontWeight: 800, fontSize: '13px', color: closedPnl > 0 ? 'var(--green)' : 'var(--red)' }}>
              {closedPnl > 0 ? '+' : ''}{closedPnl.toFixed(2)}%
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
          {s.created_at && (
            <span style={{ fontSize: '11px', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>
              {fmtDate(s.created_at)}
            </span>
          )}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '9px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Score</div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#00c4ef', lineHeight: 1 }}>{s.ai_score}</div>
          </div>
        </div>
      </div>

      {/* ── Price Grid ── */}
      <div className="signal-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px',
        marginBottom: '12px',
      }}>
        {/* Entry */}
        <div style={{ background: 'rgba(0,196,239,0.05)', border: '1px solid rgba(0,196,239,0.12)', borderRadius: '12px', padding: '10px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('دخول', 'Entry')}</div>
          <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '13px', fontVariantNumeric: 'tabular-nums' }}>${fmt(s.entry)}</div>
          <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '3px' }}>×{lev}</div>
        </div>
        {/* TP */}
        <div style={{ background: 'rgba(0,230,100,0.05)', border: '1px solid rgba(0,230,100,0.15)', borderRadius: '12px', padding: '10px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: 'var(--green)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('هدف', 'Target')}</div>
          <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '13px', color: 'var(--green)', fontVariantNumeric: 'tabular-nums' }}>${fmt(s.tp)}</div>
          <div style={{ fontSize: '10px', color: 'rgba(0,230,100,0.55)', marginTop: '3px' }}>+{s.tp_pct}%</div>
        </div>
        {/* SL */}
        <div style={{ background: 'rgba(255,85,85,0.05)', border: '1px solid rgba(255,85,85,0.15)', borderRadius: '12px', padding: '10px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: 'var(--red)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('وقف', 'Stop')}</div>
          <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '13px', color: 'var(--red)', fontVariantNumeric: 'tabular-nums' }}>${fmt(s.sl)}</div>
          <div style={{ fontSize: '10px', color: 'rgba(255,85,85,0.55)', marginTop: '3px' }}>-{s.sl_pct}%</div>
        </div>
        {/* Current */}
        <div style={{
          background: cur
            ? (isOpen ? (levPct >= 0 ? 'rgba(0,230,100,0.06)' : 'rgba(255,85,85,0.06)') : 'rgba(255,255,255,0.03)')
            : 'rgba(255,255,255,0.03)',
          border: `1px solid ${cur && isOpen ? (levPct >= 0 ? 'rgba(0,230,100,0.22)' : 'rgba(255,85,85,0.22)') : 'rgba(255,255,255,0.07)'}`,
          borderRadius: '12px', padding: '10px 8px', textAlign: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '5px' }}>
            {isOpen && cur && (
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00c4ef', display: 'inline-block', animation: 'pulse 2s infinite', flexShrink: 0 }}/>
            )}
            <span style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('الآن', 'Now')}</span>
          </div>
          {cur ? (
            <>
              <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '13px', color: isOpen ? pnlColor : 'white', fontVariantNumeric: 'tabular-nums' }}>${fmt(cur)}</div>
              {isOpen && (
                <div style={{ fontSize: '11px', fontWeight: 800, color: pnlColor, marginTop: '3px' }}>
                  {levPct >= 0 ? '+' : ''}{levPct.toFixed(2)}%
                </div>
              )}
            </>
          ) : (
            <div style={{ fontSize: '18px', color: 'var(--muted)', marginTop: '2px' }}>—</div>
          )}
        </div>
      </div>

      {/* ── Progress bar (OPEN only) ── */}
      {isOpen && cur && (
        <div style={{ marginTop: '4px' }}>
          <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: barColor, borderRadius: '3px', transition: 'width 0.6s ease' }}/>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginTop: '5px' }}>
            <span style={{ color: 'var(--red)' }}>{t('وقف', 'Stop')} ${fmt(sl)}</span>
            <span style={{ color: barColor, fontWeight: 700 }}>{progress.toFixed(0)}% {t('نحو الهدف', 'to target')}</span>
            <span style={{ color: 'var(--green)' }}>{t('هدف', 'Target')} ${fmt(tp)}</span>
          </div>
        </div>
      )}

      {/* ── شارت مضمّن — دخول/هدف/وقف على شموع حقيقية، زي شارت تلقرام ── */}
      <div style={{ marginTop: '12px' }}>
        <TradeChart
          symbol={sym}
          entry={parseFloat(s.entry)} tp={parseFloat(s.tp)} sl={parseFloat(s.sl)}
          side={s.side} status={s.status} createdAt={s.created_at} closedAt={s.closed_at ?? undefined}
          closePrice={s.close_price ? parseFloat(s.close_price) : undefined}
          market={s.market}
        />
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); openFullChart() }}
        style={{ marginTop: '10px', background: 'none', border: 'none', color: 'var(--cyan)', cursor: 'pointer', fontSize: '11px', fontFamily: 'inherit', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
      >
        🔍 {t('فتح بملء الشاشة ←', 'Open full screen →')}
      </button>
    </div>
  )
}

export default function Dashboard() {
  const { t, lang } = useLang()
  const [user, setUser] = useState<any>(null)
  const [signals, setSignals] = useState<any[]>([])
  const [signalsError, setSignalsError] = useState(false)
  const [news, setNews] = useState<any[]>([])
  const [gainers, setGainers] = useState<any[]>([])
  const [losers, setLosers] = useState<any[]>([])
  const [topCoins, setTopCoins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')
  const [chartSymbol, setChartSymbol] = useState('BTC')
  const [nextScan, setNextScan] = useState(900)
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'WIN' | 'LOSS'>('ALL')
  const [marketFilter, setMarketFilter] = useState<'ALL' | 'SPOT' | 'FUTURES'>('ALL')

  useEffect(() => {
    const calc = () => { const n = new Date(); return 900 - ((n.getMinutes() % 15) * 60 + n.getSeconds()) }
    setNextScan(calc())
    const t = setInterval(() => setNextScan(calc()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const fetchPrices = async () => {
      const open = signals.filter(s => s.status === 'OPEN')
      if (!open.length) return
      try {
        const syms = open.map(s => (s.pair || '').replace('/', ''))
        const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbols=${JSON.stringify(syms)}`)
        const data = await res.json()
        const map: Record<string, number> = {}
        data.forEach((d: any) => { map[d.symbol] = parseFloat(d.price) })
        setPrices(map)
      } catch {}
    }
    fetchPrices()
    const t = setInterval(fetchPrices, 10000)
    return () => clearInterval(t)
  }, [signals])

  useEffect(() => {
    // كل مصدر بيانات بمحاولته المستقلة -- قبل كان try/catch وحد يلف الكل،
    // فأي مصدر ثانوي يفشل (RSS، CoinGecko...) كان يفرّغ حتى الإشارات نفسها
    // (المصدر الأهم بالصفحة) بدون سبب. تحسينات.md: "Error State مستقل لكل
    // Widget؛ فشل الأخبار لا يعطل الإشارات."
    fetch(`${API}/me`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(u => { if (u) setUser(u) })
      .catch(() => {})

    const fetchSignals = () => apiFetch<any[]>(`${API}/signals`, { credentials: 'include' })
      .then(res => {
        if (res.ok) {
          setSignals(Array.isArray(res.data) ? res.data : [])
          setSignalsError(false)
        } else {
          setSignalsError(true)
        }
      })
      .finally(() => setLoading(false))
    fetchSignals()
    // تحديث دوري -- بدونه محاكي المحفظة (وباقي التبويبات) يجمد على أول تحميل
    // للصفحة، لازم يبقى حي مع كل صفقة جديدة تُقفل بدون ما المستخدم يعيد التحميل يدوياً
    const signalsPoll = setInterval(fetchSignals, 60000)

    fetch('https://api.binance.com/api/v3/ticker/24hr')
      .then(r => r.json())
      .then(tk => {
        const usdt = tk.filter((x: any) => x.symbol.endsWith('USDT'))
        const sorted = [...usdt].sort((a: any, b: any) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent))
        setGainers(sorted.slice(0, 10)); setLosers(sorted.slice(-10).reverse())
      })
      .catch(() => {})

    fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1')
      .then(r => r.json())
      .then(setTopCoins)
      .catch(() => {})

    fetch('https://api.rss2json.com/v1/api.json?rss_url=https://cointelegraph.com/rss')
      .then(r => r.json())
      .then(nd => setNews(nd.items?.slice(0, 6) || []))
      .catch(() => {})

    return () => clearInterval(signalsPoll)
  }, [])

  const wins = signals.filter(s => s.status === 'WIN').length
  const losses = signals.filter(s => s.status === 'LOSS').length
  const open = signals.filter(s => s.status === 'OPEN').length
  const total = signals.length

  // E1 (تأكيد الوقف بإغلاق شمعة) دخل الإنتاج بهالتوقيت -- نقسم الإحصائيات
  // قبله/بعده عشان الأداء المحدّث يبان لحاله، بدون ما يتخفّى بمتوسط تاريخي
  // يشمل فترة قبل الإصلاح.
  const STRATEGY_UPDATE_CUTOFF = new Date('2026-08-06T17:09:00Z').getTime()
  const isUpdatedEra = (s: any) => new Date(s.created_at).getTime() >= STRATEGY_UPDATE_CUTOFF

  // دفعة تحسينات 2026-08-10 (MIN_SCORE=90+بولنجر+بوابة جسم الشمعة لـRETEST_MTF،
  // تقسيم Breakout/Sweep + تحسين سعر دخول m1 لـSMC_MTF) -- قائمة إحصائيات
  // ثالثة جديدة، منفصلة عن دفعة 8/6 القديمة، عشان الأداء الأحدث يبان لحاله
  // بدل ما يتخفّى بمتوسط يشمل فترة قبل هالتحسينات.
  const LATEST_UPDATE_CUTOFF = new Date('2026-08-10T10:55:00Z').getTime()
  const isLatestEra = (s: any) => new Date(s.created_at).getTime() >= LATEST_UPDATE_CUTOFF
  const latestSignals = signals.filter(isLatestEra)
  const updatedSignals = signals.filter(s => isUpdatedEra(s) && !isLatestEra(s))
  const oldSignals = signals.filter(s => !isUpdatedEra(s))

  function computeEraStats(list: any[]) {
    const w = list.filter(s => s.status === 'WIN').length
    const l = list.filter(s => s.status === 'LOSS').length
    const o = list.filter(s => s.status === 'OPEN').length
    const t = list.length
    const wr = (w + l) > 0 ? Math.round((w / (w + l)) * 100) : 0
    const pnlW = list.filter(s => s.status === 'WIN').reduce((sum, s) => sum + parseFloat(s.pnl_pct || '0'), 0)
    const pnlL = list.filter(s => s.status === 'LOSS').reduce((sum, s) => sum + parseFloat(s.pnl_pct || '0'), 0)
    return { total: t, open: o, wins: w, losses: l, winRate: wr, netPnl: pnlW + pnlL }
  }
  const latestStats = computeEraStats(latestSignals)
  const updatedStats = computeEraStats(updatedSignals)
  const oldStats = computeEraStats(oldSignals)
  const mins = Math.floor(nextScan / 60)
  const secs = nextScan % 60

  const filteredSignals = signals
    .filter(s => filter === 'ALL' || s.status === filter)
    .filter(s => marketFilter === 'ALL' || s.market === marketFilter)
  const spotCount = signals.filter(s => s.market === 'SPOT').length
  const futuresCount = signals.filter(s => s.market === 'FUTURES').length

  // مقارنة LONG مقابل SHORT — الفيوتشر بس (السبوت LONG فقط دائماً)
  const futuresSignals = signals.filter(s => s.market === 'FUTURES')
  const sideStats = (['LONG', 'SHORT'] as const).map(side => {
    const rows = futuresSignals.filter(s => s.side === side)
    const w = rows.filter(s => s.status === 'WIN').length
    const l = rows.filter(s => s.status === 'LOSS').length
    const o = rows.filter(s => s.status === 'OPEN').length
    const wr = (w + l) > 0 ? Math.round((w / (w + l)) * 100) : 0
    const net = rows.filter(s => s.status === 'WIN' || s.status === 'LOSS').reduce((sum, s) => sum + parseFloat(s.pnl_pct || '0'), 0)
    return { side, count: rows.length, wins: w, losses: l, open: o, winRate: wr, net }
  })
  const betterSide = sideStats[0].net === sideStats[1].net ? null : (sideStats[0].net > sideStats[1].net ? sideStats[0].side : sideStats[1].side)

  // ── محاكي المحفظة: "لو دخلت بـ1000$" -- يُعاد حسابه من صفر كل مرة signals
  // يتحدّث (مو state منفصل)، فيبقى حي مع كل صفقة تُقفل بدون أي منطق تخزين
  // إضافي. صفقات مقفولة فقط (WIN/LOSS) -- المفتوحة نتيجتها غير معروفة بعد. ──
  const PORTFOLIO_START = 1000
  const PORTFOLIO_SLOTS = 5 // لكل سوق (5 سبوت + 5 فيوتشر = 10 حصص من رأس المال)
  const closedChrono = signals
    .filter(s => s.status === 'WIN' || s.status === 'LOSS')
    .slice()
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  // سيناريو 1: رأس المال مقسّم -- 500$ سبوت (5 حصص × 100$) + 500$ فيوتشر
  // (5 حصص × 100$)، كل صفقة تاخذ حصة ثابتة (بدون إعادة استثمار الربح/الخسارة
  // على الصفقة اللي بعدها -- توزيع محافظ، مو Compounding)
  const diversifiedStake = (PORTFOLIO_START / 2) / PORTFOLIO_SLOTS // 100$ لكل صفقة
  const spotClosed = closedChrono.filter(s => s.market === 'SPOT')
  const futuresClosed = closedChrono.filter(s => s.market === 'FUTURES')
  const spotPnlUsd = spotClosed.reduce((sum, s) => sum + diversifiedStake * (parseFloat(s.pnl_pct || '0') / 100), 0)
  const futuresPnlUsd = futuresClosed.reduce((sum, s) => sum + diversifiedStake * (parseFloat(s.pnl_pct || '0') / 100), 0)
  const diversifiedEnd = PORTFOLIO_START + spotPnlUsd + futuresPnlUsd

  // سيناريو 2: ALL-IN -- رأس مال مستقل 1000$ لكل مسار (سبوت/فيوتشر)، كل
  // صفقة تاخذ الرصيد بالكامل وتعيد استثمار النتيجة بالصفقة اللي بعدها
  // (Compounding حقيقي -- هذا اللي يفسّر تقلّب الرقم بقوة صعوداً أو هبوطاً)
  function allInCapital(rows: Signal[]) {
    return rows.reduce((cap, s) => cap * (1 + parseFloat(s.pnl_pct || '0') / 100), PORTFOLIO_START)
  }
  const allInSpotEnd = allInCapital(spotClosed)
  const allInFuturesEnd = allInCapital(futuresClosed)

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <img src="/logo.png" alt="DevelBot" style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#fff', padding: '6px', margin: '0 auto 16px', display: 'block' }}/>
        <div style={{ color: '#00c4ef', fontWeight: 700, fontSize: '16px' }}>{t('جاري التحميل...', 'Loading...')}</div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Next-scan status (rest of the identity/nav chrome already lives in the shared sidebar/topbar) */}
      <div className="dash-status-bar" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'pulse 2s infinite', flexShrink: 0 }}/>
        <span style={{ color: 'var(--muted)', fontSize: '13px' }}>
          {t('الفحص القادم:', 'Next scan:')} <span style={{ color: 'var(--muted)', fontFamily: 'monospace', fontVariantNumeric: 'tabular-nums' }}>{mins}:{secs.toString().padStart(2, '0')}</span>
        </span>
        {user && (
          <span className={user.is_active ? 'status-active' : 'status-inactive'} style={{ marginInlineStart: 'auto' }}>{user.is_active ? `${t('نشط', 'Active')} · ${user.days_left}${t('د', 'd')}` : t('منتهي', 'Expired')}</span>
        )}
      </div>

      {!user && (
        <div style={{ background: 'linear-gradient(135deg, rgba(0,196,239,0.06), rgba(107,31,255,0.06))', borderBottom: '1px solid rgba(0,196,239,0.12)', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: '14px' }}>{t('تبي الاشارات تجيك فوراً على التلقرام؟', 'Want signals delivered instantly on Telegram?')} </span>
            <span style={{ color: 'var(--muted)', fontSize: '13px' }}>{t('سجّل مجاناً وابدأ 30 يوم تجربة', 'Sign up free and start a 30-day trial')}</span>
          </div>
          <Link href="/register" className="btn-primary" style={{ padding: '10px 20px', fontSize: '13px' }}>{t('ابدأ مجاناً ←', 'Start free →')}</Link>
        </div>
      )}

      {user?.is_admin && (
        <div style={{ background: 'rgba(107,31,255,0.06)', borderBottom: '1px solid rgba(107,31,255,0.12)', padding: '10px 24px', textAlign: 'center' }}>
          <Link href="/admin" style={{ color: 'var(--purple)', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>🛠 {t('لوحة تحكم الأدمن', 'Admin Panel')}</Link>
        </div>
      )}

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px' }}>

        {/* Tabs -- الإشارات المفتوحة أول شي (مراجعة تحسينات.md: "ماذا يحتاج
            انتباهي الآن؟" قبل إحصائيات الأداء التاريخية) */}
        <div className="tabs" style={{ marginBottom: '20px' }}>
          {[
            { id: 'overview', label: t('نظرة عامة', 'Overview') },
            { id: 'portfolio', label: t('محاكي المحفظة', 'Portfolio Sim') },
            { id: 'signals', label: `${t('الاشارات', 'Signals')} (${total})` },
            { id: 'chart', label: t('الشارت', 'Chart') },
            { id: 'market', label: t('السوق', 'Market') },
            { id: 'news', label: t('الاخبار', 'News') },
          ].map(tb => (
            <button key={tb.id} className={`tab ${tab === tb.id ? 'active' : ''}`} onClick={() => setTab(tb.id)}>
              {tb.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div className="overview-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Latest signal */}
              <div className="card-glow-cyan" style={{ padding: '24px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>{t('آخر اشارة', 'Latest Signal')}</div>
                {signalsError ? (
                  <div style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)' }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
                    <div style={{ fontWeight: 600 }}>{t('تعذّر تحميل الإشارات', 'Failed to load signals')}</div>
                    <div style={{ fontSize: '13px', marginTop: '4px' }}>{t('تحقق من الاتصال وحدّث الصفحة', 'Check your connection and refresh the page')}</div>
                  </div>
                ) : signals.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)' }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</div>
                    <div style={{ fontWeight: 600 }}>{t('البوت يراقب السوق', 'The bot is watching the market')}</div>
                    <div style={{ fontSize: '13px', marginTop: '4px' }}>{t('الفحص القادم خلال', 'Next scan in')} {mins}:{secs.toString().padStart(2, '0')}</div>
                  </div>
                ) : (() => {
                  const s = signals[0]
                  const sym = (s.pair || '').replace('/', '')
                  const cur = prices[sym]
                  const entry = parseFloat(s.entry)
                  const lev = s.leverage || 1
                  let levPct = 0
                  if (cur && s.status === 'OPEN') levPct = ((cur - entry) / entry) * 100 * (s.side === 'SHORT' ? -1 : 1) * lev
                  return (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '24px', fontWeight: 900 }}>{s.pair}</span>
                          <span style={{ background: s.market === 'SPOT' ? 'rgba(251,191,36,0.12)' : 'rgba(0,196,239,0.12)', color: s.market === 'SPOT' ? 'var(--yellow)' : '#00c4ef', border: `1px solid ${s.market === 'SPOT' ? 'rgba(251,191,36,0.35)' : 'rgba(0,196,239,0.35)'}`, borderRadius: '8px', padding: '4px 12px', fontSize: '13px', fontWeight: 800 }}>{s.market === 'SPOT' ? t('🟡 سبوت', '🟡 Spot') : t('🔵 فيوتشر', '🔵 Futures')}</span>
                          <span style={{ background: s.side === 'LONG' ? 'rgba(0,230,100,0.12)' : 'rgba(255,85,85,0.12)', color: s.side === 'LONG' ? 'var(--green)' : 'var(--red)', border: `1px solid ${s.side === 'LONG' ? 'rgba(0,230,100,0.25)' : 'rgba(255,85,85,0.25)'}`, borderRadius: '8px', padding: '4px 12px', fontSize: '13px', fontWeight: 800 }}>{s.side}</span>
                          <span style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--muted)', borderRadius: '6px', padding: '4px 10px', fontSize: '12px' }}>{s.regime}</span>
                          {s.created_at && <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{fmtDate(s.created_at)}</span>}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '2px' }}>Quality Score</div>
                          <div style={{ fontSize: '28px', fontWeight: 900, color: '#00c4ef' }}>{s.ai_score}<span style={{ fontSize: '13px', color: 'var(--muted)' }}>/100</span></div>
                        </div>
                      </div>
                      <div className="signal-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                        <div className="price-box" style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '4px' }}>{t('دخول', 'Entry')}</div>
                          <div style={{ fontFamily: 'monospace', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>${fmt(s.entry)}</div>
                          <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>×{lev}</div>
                        </div>
                        <div style={{ background: 'rgba(0,230,100,0.06)', border: '1px solid rgba(0,230,100,0.15)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
                          <div style={{ fontSize: '10px', color: 'var(--green)', marginBottom: '4px' }}>{t('هدف', 'Target')} +{s.tp_pct}%</div>
                          <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--green)', fontVariantNumeric: 'tabular-nums' }}>${fmt(s.tp)}</div>
                        </div>
                        <div style={{ background: 'rgba(255,85,85,0.06)', border: '1px solid rgba(255,85,85,0.15)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
                          <div style={{ fontSize: '10px', color: 'var(--red)', marginBottom: '4px' }}>{t('وقف', 'Stop')} -{s.sl_pct}%</div>
                          <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--red)', fontVariantNumeric: 'tabular-nums' }}>${fmt(s.sl)}</div>
                        </div>
                        <div style={{ background: cur && s.status === 'OPEN' ? (levPct >= 0 ? 'rgba(0,230,100,0.06)' : 'rgba(255,85,85,0.06)') : 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '4px' }}>
                            {s.status === 'OPEN' && cur && <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00c4ef', display: 'inline-block', animation: 'pulse 2s infinite' }}/>}
                            <span style={{ fontSize: '10px', color: 'var(--muted)' }}>{t('الآن', 'Now')}</span>
                          </div>
                          {cur ? (
                            <>
                              <div style={{ fontFamily: 'monospace', fontWeight: 700, color: levPct >= 0 ? 'var(--green)' : 'var(--red)', fontVariantNumeric: 'tabular-nums' }}>${fmt(cur)}</div>
                              {s.status === 'OPEN' && <div style={{ fontSize: '11px', fontWeight: 800, color: levPct >= 0 ? 'var(--green)' : 'var(--red)', marginTop: '2px' }}>{levPct >= 0 ? '+' : ''}{levPct.toFixed(2)}%</div>}
                            </>
                          ) : <div style={{ color: 'var(--muted)' }}>—</div>}
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>

              {!user && (
                <div style={{ background: 'linear-gradient(135deg, rgba(0,196,239,0.06), rgba(107,31,255,0.06))', border: '1px solid rgba(0,196,239,0.15)', borderRadius: '18px', padding: '24px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>{t('تبي الاشارات على تلقرامك؟', 'Want signals on your Telegram?')}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '20px' }}>{t('سجّل مجاناً وابدأ 30 يوم تجربة', 'Sign up free and start a 30-day trial')}</div>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <Link href="/register" className="btn-primary">{t('سجّل مجاناً', 'Sign up free')}</Link>
                    <Link href="/login" className="btn-secondary">{t('دخول', 'Login')}</Link>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <FearGreed />
              <div className="card">
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>{t('افضل الرابحين', 'Top Gainers')}</div>
                {gainers.slice(0, 6).map((t: any, i: number) => (
                  <div key={t.symbol} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--muted)', fontSize: '11px', width: '16px' }}>{i + 1}</span>
                      <span style={{ fontWeight: 700, fontSize: '13px' }}>{t.symbol.replace('USDT', '')}</span>
                    </div>
                    <span style={{ color: 'var(--green)', fontSize: '13px', fontWeight: 700 }}>+{parseFloat(t.priceChangePercent).toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PORTFOLIO SIMULATOR ── */}
        {tab === 'portfolio' && (() => {
          const diversifiedNet = diversifiedEnd - PORTFOLIO_START
          const diversifiedNetPct = (diversifiedNet / PORTFOLIO_START) * 100
          const allInSpotNet = allInSpotEnd - PORTFOLIO_START
          const allInFuturesNet = allInFuturesEnd - PORTFOLIO_START
          const money = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          const PnlCard = ({ label, sub, start, end, netPct, count }: { label: string; sub: string; start: number; end: number; netPct: number; count: number }) => {
            const up = end >= start
            return (
              <div className="card" style={{ padding: '20px' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, marginBottom: '2px' }}>{label}</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '16px' }}>{sub}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{t('رأس المال', 'Capital')}</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '15px', color: 'var(--muted)', textDecoration: 'line-through', fontVariantNumeric: 'tabular-nums' }}>${money(start)}</span>
                  <span style={{ color: 'var(--muted)' }}>←</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '26px', fontWeight: 900, color: up ? 'var(--green)' : 'var(--red)', fontVariantNumeric: 'tabular-nums' }}>${money(end)}</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ background: up ? 'rgba(0,230,100,0.12)' : 'rgba(255,85,85,0.12)', color: up ? 'var(--green)' : 'var(--red)', border: `1px solid ${up ? 'rgba(0,230,100,0.25)' : 'rgba(255,85,85,0.25)'}`, borderRadius: '8px', padding: '4px 12px', fontSize: '13px', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                    {up ? '+' : ''}{netPct.toFixed(2)}%
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{count} {t('صفقة مقفولة', 'closed trades')}</span>
                </div>
              </div>
            )
          }
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: 'rgba(0,196,239,0.06)', border: '1px solid rgba(0,196,239,0.15)', borderRadius: '14px', padding: '14px 18px', fontSize: '13px', color: 'var(--muted)' }}>
                {t(
                  'محاكاة توضيحية فقط، مبنية على صفقات البوت المقفولة الفعلية (WIN/LOSS) بترتيبها الزمني الحقيقي — تتحدّث تلقائياً مع كل صفقة جديدة تُقفل. مو نصيحة استثمارية، وأداء الماضي لا يضمن نتيجة مستقبلية.',
                  'Illustrative simulation only, built from the bot\'s actual closed trades (WIN/LOSS) in real chronological order — updates automatically as each new trade closes. Not investment advice; past performance does not guarantee future results.'
                )}
              </div>

              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, marginBottom: '12px' }}>{t('السيناريو 1 — رأس مال موزَّع', 'Scenario 1 — Diversified capital')}</div>
                <PnlCard
                  label={t('1,000$ مقسومة: 5 صفقات سبوت + 5 صفقات فيوتشر', '$1,000 split: 5 spot + 5 futures trades')}
                  sub={t(`كل صفقة تاخذ حصة ثابتة 100$ (500$ سبوت + 500$ فيوتشر) — بدون إعادة استثمار`, 'Each trade gets a fixed $100 slot ($500 spot + $500 futures) — no reinvestment')}
                  start={PORTFOLIO_START} end={diversifiedEnd} netPct={diversifiedNetPct} count={spotClosed.length + futuresClosed.length}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                  <div className="card" style={{ padding: '14px 18px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--yellow)', fontWeight: 700, marginBottom: '6px' }}>🟡 {t('مساهمة السبوت', 'Spot contribution')}</div>
                    <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '18px', color: spotPnlUsd >= 0 ? 'var(--green)' : 'var(--red)', fontVariantNumeric: 'tabular-nums' }}>{spotPnlUsd >= 0 ? '+' : ''}${money(spotPnlUsd)}</div>
                  </div>
                  <div className="card" style={{ padding: '14px 18px' }}>
                    <div style={{ fontSize: '11px', color: '#00c4ef', fontWeight: 700, marginBottom: '6px' }}>🔵 {t('مساهمة الفيوتشر', 'Futures contribution')}</div>
                    <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '18px', color: futuresPnlUsd >= 0 ? 'var(--green)' : 'var(--red)', fontVariantNumeric: 'tabular-nums' }}>{futuresPnlUsd >= 0 ? '+' : ''}${money(futuresPnlUsd)}</div>
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, marginBottom: '4px' }}>{t('السيناريو 2 — ALL-IN (رأس المال كامل كل صفقة)', 'Scenario 2 — ALL-IN (full balance every trade)')}</div>
                <div style={{ fontSize: '12px', color: 'var(--red)', marginBottom: '12px' }}>
                  ⚠️ {t('توضيحي بحت لإظهار أثر التركيز الكامل — مخاطرة قصوى وغير مُوصى بها إطلاقاً عملياً (خسارة صفقة وحدة تمسح كل شي).', 'Purely illustrative to show the effect of full concentration — extreme risk, never recommended in practice (a single loss wipes everything).')}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <PnlCard
                    label={t('🟡 ALL-IN سبوت', '🟡 ALL-IN Spot')}
                    sub={t('كل صفقة سبوت تاخذ الرصيد بالكامل، إعادة استثمار كاملة', 'Every spot trade takes the full balance, fully compounded')}
                    start={PORTFOLIO_START} end={allInSpotEnd} netPct={(allInSpotNet / PORTFOLIO_START) * 100} count={spotClosed.length}
                  />
                  <PnlCard
                    label={t('🔵 ALL-IN فيوتشر', '🔵 ALL-IN Futures')}
                    sub={t('كل صفقة فيوتشر تاخذ الرصيد بالكامل، إعادة استثمار كاملة', 'Every futures trade takes the full balance, fully compounded')}
                    start={PORTFOLIO_START} end={allInFuturesEnd} netPct={(allInFuturesNet / PORTFOLIO_START) * 100} count={futuresClosed.length}
                  />
                </div>
              </div>
            </div>
          )
        })()}

        {/* ── SIGNALS ── */}
        {tab === 'signals' && (
          <div>
            {/* Filter bar */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {(['ALL', 'OPEN', 'WIN', 'LOSS'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: '8px 18px', borderRadius: '10px', fontSize: '12px', fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                  background: filter === f
                    ? (f === 'WIN' ? 'rgba(0,230,100,0.2)' : f === 'LOSS' ? 'rgba(255,85,85,0.2)' : f === 'OPEN' ? 'rgba(251,191,36,0.2)' : 'rgba(0,196,239,0.2)')
                    : 'rgba(255,255,255,0.04)',
                  color: filter === f
                    ? (f === 'WIN' ? 'var(--green)' : f === 'LOSS' ? 'var(--red)' : f === 'OPEN' ? 'var(--yellow)' : '#00c4ef')
                    : 'var(--muted)',
                  border: filter === f
                    ? `1px solid ${f === 'WIN' ? 'rgba(0,230,100,0.35)' : f === 'LOSS' ? 'rgba(255,85,85,0.35)' : f === 'OPEN' ? 'rgba(251,191,36,0.35)' : 'rgba(0,196,239,0.35)'}`
                    : '1px solid rgba(255,255,255,0.06)',
                }}>
                  {f === 'ALL' ? `${t('الكل', 'All')} (${total})` : f === 'OPEN' ? `${t('مفتوحة', 'Open')} (${open})` : f === 'WIN' ? `${t('رابحة', 'Win')} (${wins})` : `${t('خاسرة', 'Loss')} (${losses})`}
                </button>
              ))}
            </div>

            {/* LONG مقابل SHORT — فيوتشر بس */}
            {futuresSignals.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                {sideStats.map(st => {
                  const color = st.side === 'LONG' ? 'var(--green)' : 'var(--red)'
                  const isBetter = betterSide === st.side
                  return (
                    <div key={st.side} className="card" style={{ padding: '16px', position: 'relative', border: isBetter ? `1px solid ${color}55` : undefined }}>
                      {isBetter && (
                        <span style={{ position: 'absolute', top: '10px', [lang === 'en' ? 'right' : 'left']: '10px', fontSize: '10px', fontWeight: 800, color, background: `${color}20`, padding: '3px 8px', borderRadius: '6px' }}>{t('الأكثر ربحاً', 'Most Profitable')}</span>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 900, color }}>{st.side === 'LONG' ? '🟢 LONG' : '🔴 SHORT'}</span>
                        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>({st.count} {t('صفقة · فيوتشر', 'trades · Futures')})</span>
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
                      <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span style={{ color: 'var(--muted)' }}>{t('مفتوحة', 'Open')}: {st.open}</span>
                        <span style={{ fontWeight: 700, color: st.net >= 0 ? 'var(--green)' : 'var(--red)' }}>{st.net >= 0 ? '+' : ''}{st.net.toFixed(1)}% {t('صافي', 'net')}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Market filter — سبوت مقابل فيوتشر */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {(['ALL', 'SPOT', 'FUTURES'] as const).map(m => (
                <button key={m} onClick={() => setMarketFilter(m)} style={{
                  padding: '8px 18px', borderRadius: '10px', fontSize: '12px', fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                  background: marketFilter === m
                    ? (m === 'SPOT' ? 'rgba(251,191,36,0.2)' : m === 'FUTURES' ? 'rgba(0,196,239,0.2)' : 'rgba(255,255,255,0.1)')
                    : 'rgba(255,255,255,0.04)',
                  color: marketFilter === m
                    ? (m === 'SPOT' ? 'var(--yellow)' : m === 'FUTURES' ? '#00c4ef' : 'var(--text)')
                    : 'var(--muted)',
                  border: marketFilter === m
                    ? `1px solid ${m === 'SPOT' ? 'rgba(251,191,36,0.35)' : m === 'FUTURES' ? 'rgba(0,196,239,0.35)' : 'rgba(255,255,255,0.2)'}`
                    : '1px solid rgba(255,255,255,0.06)',
                }}>
                  {m === 'ALL' ? `${t('كل الأسواق', 'All Markets')} (${total})` : m === 'SPOT' ? `${t('🟡 سبوت', '🟡 Spot')} (${spotCount})` : `${t('🔵 فيوتشر', '🔵 Futures')} (${futuresCount})`}
                </button>
              ))}
            </div>

            {signalsError ? (
              <div className="card" style={{ textAlign: 'center', padding: '64px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                <div style={{ fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>{t('تعذّر تحميل الإشارات', 'Failed to load signals')}</div>
                <div style={{ color: 'var(--muted)' }}>{t('تحقق من الاتصال وحدّث الصفحة', 'Check your connection and refresh the page')}</div>
              </div>
            ) : filteredSignals.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '64px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                <div style={{ fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>
                  {total === 0 ? t('البوت يراقب السوق', 'The bot is watching the market') : t('لا توجد اشارات في هذا التصنيف', 'No signals in this category')}
                </div>
                <div style={{ color: 'var(--muted)' }}>
                  {total === 0 ? `${t('الفحص القادم خلال', 'Next scan in')} ${mins}:${secs.toString().padStart(2, '0')}` : t('جرّب تصنيفاً آخر', 'Try another category')}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredSignals.map((s: any) => (
                  <SignalCard key={s.id} s={s} prices={prices} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CHART ── */}
        {tab === 'chart' && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', gap: '8px', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto' }}>
              {['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX'].map(sym => (
                <button key={sym} onClick={() => setChartSymbol(sym)} style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', border: 'none', fontFamily: 'inherit', background: chartSymbol === sym ? '#00c4ef' : 'rgba(255,255,255,0.05)', color: chartSymbol === sym ? 'black' : 'var(--muted)', whiteSpace: 'nowrap', transition: 'all 0.15s' }}>
                  {sym}
                </button>
              ))}
            </div>
            <MarketChart symbol={chartSymbol} />
          </div>
        )}

        {/* ── MARKET ── */}
        {tab === 'market' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {[
              { title: t('🚀 الأكثر ارتفاعاً', '🚀 Top Gainers'), data: gainers, colorFn: () => 'var(--green)', valFn: (t: any) => `+${parseFloat(t.priceChangePercent).toFixed(2)}%` },
              { title: t('📉 الأكثر انخفاضاً', '📉 Top Losers'), data: losers, colorFn: () => 'var(--red)', valFn: (t: any) => `${parseFloat(t.priceChangePercent).toFixed(2)}%` },
              { title: t('👑 القيمة السوقية', '👑 Market Cap'), data: topCoins, colorFn: (c: any) => c.price_change_percentage_24h >= 0 ? 'var(--green)' : 'var(--red)', valFn: (c: any) => `${c.price_change_percentage_24h >= 0 ? '+' : ''}${c.price_change_percentage_24h?.toFixed(2)}%`, isCG: true },
            ].map((col, ci) => (
              <div key={ci} className="card">
                <div style={{ fontWeight: 800, marginBottom: '20px', fontSize: '15px' }}>{col.title}</div>
                {col.data.map((item: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < col.data.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', cursor: 'pointer' }}
                    onClick={() => { setChartSymbol((col as any).isCG ? item.symbol.toUpperCase() : item.symbol.replace('USDT', '')); setTab('chart') }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--muted)', fontSize: '11px', width: '18px' }}>{i + 1}</span>
                      <span style={{ fontWeight: 700, fontSize: '13px' }}>{(col as any).isCG ? item.symbol.toUpperCase() : item.symbol.replace('USDT', '')}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>${(col as any).isCG ? item.current_price.toLocaleString() : parseFloat(item.lastPrice) > 1 ? parseFloat(item.lastPrice).toLocaleString() : parseFloat(item.lastPrice).toFixed(5)}</div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: col.colorFn(item) }}>{col.valFn(item)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ── NEWS ── */}
        {tab === 'news' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {news.map((item: any, i: number) => (
              <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'var(--text)' }}>
                <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {item.thumbnail && <img src={item.thumbnail} alt="" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '12px', opacity: 0.85 }} />}
                  <div style={{ fontWeight: 700, fontSize: '14px', lineHeight: 1.6, flex: 1 }}>{item.title}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: 'var(--muted)', fontSize: '12px' }}>{new Date(item.pubDate).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}</span>
                    <span style={{ color: '#00c4ef', fontSize: '12px', fontWeight: 700 }}>{t('اقرأ المزيد ←', 'Read more →')}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* أداء النظام -- ثانوي، بعد ما المستخدم يشوف إشاراته المفتوحة أولاً
            (مراجعة تحسينات.md). الحسابات نفسها ما تغيّرت، بس الموضع تحرّك. */}
        <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
            {t('أداء النظام', 'System Performance')}
          </div>

          {/* Stats row -- آخر تحسينات الاستراتيجيات (الأحدث، فوق الكل) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--green)' }}>✨ {t('آخر التحسينات', 'Latest Improvements')}</span>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
              {t('الأداء منذ آخر دفعة تحسينات (بولنجر + بوابة جودة الدخول لـRETEST_MTF، تقسيم وتحسين سعر الدخول لـSMC_MTF) -- قيد المعايرة، الأرقام تبني تدريجياً',
                 'Performance since the latest improvement batch (Bollinger + entry-quality gate for RETEST_MTF, split + entry-price refinement for SMC_MTF) -- still calibrating, numbers build up gradually')}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            {[
              { label: t('الكل', 'All'), value: latestStats.total, color: 'var(--text)' },
              { label: t('مفتوحة', 'Open'), value: latestStats.open, color: 'var(--yellow)' },
              { label: t('الرابحة', 'Wins'), value: latestStats.wins, color: 'var(--green)' },
              { label: t('الخاسرة', 'Losses'), value: latestStats.losses, color: 'var(--red)' },
              { label: t('نسبة الفوز', 'Win Rate'), value: `${latestStats.winRate}%`, color: latestStats.winRate >= 60 ? 'var(--green)' : 'var(--yellow)' },
              { label: t('صافي الربح', 'Net Profit'), value: `${latestStats.netPnl >= 0 ? '+' : ''}${latestStats.netPnl.toFixed(1)}%`, color: latestStats.netPnl >= 0 ? 'var(--green)' : 'var(--red)' },
            ].map((s, i) => (
              <div key={i} className="stat-card" style={{ border: '1px solid rgba(34,208,110,0.3)' }}>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Stats row -- استراتيجية محدثة (وسط) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--cyan)' }}>🔄 {t('استراتيجية محدثة', 'Updated Strategy')}</span>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{t('الأداء بعد آخر تحسين على إدارة الوقف', 'Performance since the latest stop-management improvement')}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            {[
              { label: t('الكل', 'All'), value: updatedStats.total, color: 'var(--text)' },
              { label: t('مفتوحة', 'Open'), value: updatedStats.open, color: 'var(--yellow)' },
              { label: t('الرابحة', 'Wins'), value: updatedStats.wins, color: 'var(--green)' },
              { label: t('الخاسرة', 'Losses'), value: updatedStats.losses, color: 'var(--red)' },
              { label: t('نسبة الفوز', 'Win Rate'), value: `${updatedStats.winRate}%`, color: updatedStats.winRate >= 60 ? 'var(--green)' : 'var(--yellow)' },
              { label: t('صافي الربح', 'Net Profit'), value: `${updatedStats.netPnl >= 0 ? '+' : ''}${updatedStats.netPnl.toFixed(1)}%`, color: updatedStats.netPnl >= 0 ? 'var(--green)' : 'var(--red)' },
            ].map((s, i) => (
              <div key={i} className="stat-card" style={{ border: '1px solid rgba(0,196,239,0.25)' }}>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Stats row -- استراتيجية قديمة (تحت) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--muted)' }}>📁 {t('استراتيجية قديمة', 'Old Strategy')}</span>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{t('الأرشيف -- قبل آخر تحسين', 'Archive -- before the latest improvement')}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px', marginBottom: '24px', opacity: 0.7 }}>
            {[
              { label: t('الكل', 'All'), value: oldStats.total, color: 'var(--text)' },
              { label: t('مفتوحة', 'Open'), value: oldStats.open, color: 'var(--yellow)' },
              { label: t('الرابحة', 'Wins'), value: oldStats.wins, color: 'var(--green)' },
              { label: t('الخاسرة', 'Losses'), value: oldStats.losses, color: 'var(--red)' },
              { label: t('نسبة الفوز', 'Win Rate'), value: `${oldStats.winRate}%`, color: oldStats.winRate >= 60 ? 'var(--green)' : 'var(--yellow)' },
              { label: t('صافي الربح', 'Net Profit'), value: `${oldStats.netPnl >= 0 ? '+' : ''}${oldStats.netPnl.toFixed(1)}%`, color: oldStats.netPnl >= 0 ? 'var(--green)' : 'var(--red)' },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="https://t.me/devel_support" target="_blank" style={{ background: 'linear-gradient(135deg,rgba(0,196,239,0.1),rgba(107,31,255,0.1))', border: '1px solid rgba(0,196,239,0.25)', color: '#00c4ef', textDecoration: 'none', fontWeight: 700, padding: '10px 20px', borderRadius: '12px', fontSize: '14px' }}>💬 {t('تواصل مع الدعم', 'Contact Support')}</a>
          <Link href="/subscribe" style={{ background: 'linear-gradient(135deg,rgba(0,196,239,0.15),rgba(107,31,255,0.15))', border: '1px solid rgba(0,196,239,0.35)', color: '#00c4ef', textDecoration: 'none', fontWeight: 700, padding: '10px 20px', borderRadius: '12px', fontSize: '14px' }}>{t('اشتراك احترافي', 'Pro Subscription')}</Link>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @media (max-width: 640px) {
          .signal-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 900px) {
          .overview-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
