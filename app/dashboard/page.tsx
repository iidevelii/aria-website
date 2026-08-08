'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useLang } from '../ClientShell'
import TradeChart from '../TradeChart'
import { fetchKlines } from '../lib/klines'

const API = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-97af6.up.railway.app'
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token') || ''}` })

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

function MarketChart({ symbol }: { symbol: string }) {
  const chartRef = useRef<HTMLDivElement>(null)
  const [interval, setInterval_] = useState('1h')

  useEffect(() => {
    if (!chartRef.current) return
    let chart: any
    let resizeObs: ResizeObserver | null = null
    let cancelled = false

    const init = async () => {
      const { createChart, CandlestickSeries } = await import('lightweight-charts')
      if (cancelled || !chartRef.current) return
      chartRef.current.innerHTML = ''
      chart = createChart(chartRef.current, {
        width: chartRef.current.clientWidth,
        height: 450,
        layout: { background: { color: 'transparent' }, textColor: 'var(--muted)' },
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

      const series = chart.addSeries(CandlestickSeries, {
        upColor: 'var(--green)', downColor: 'var(--red)',
        borderUpColor: 'var(--green)', borderDownColor: 'var(--red)',
        wickUpColor: 'var(--green)', wickDownColor: 'var(--red)',
      })

      try {
        const candles = await fetchKlines(`${symbol}USDT`, interval, 200, 'SPOT')
        if (cancelled) return
        series.setData(candles)
        chart.timeScale().fitContent()
      } catch {}
    }

    init()
    return () => { cancelled = true; resizeObs?.disconnect(); if (chart) chart.remove() }
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

function SignalCard({ s, prices }: { s: any, prices: Record<string, number> }) {
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
          side={s.side} status={s.status} createdAt={s.created_at}
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
    const uid = localStorage.getItem('user_id')
    ;(async () => {
      try {
        if (uid) {
          const r = await fetch(`${API}/user/${uid}`, { headers: authHeaders() })
          if (r.ok) setUser(await r.json())
        }
        const [sr, tr, cr, nr] = await Promise.all([
          fetch(`${API}/signals`, { headers: authHeaders() }),
          fetch('https://api.binance.com/api/v3/ticker/24hr'),
          fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1'),
          fetch('https://api.rss2json.com/v1/api.json?rss_url=https://cointelegraph.com/rss'),
        ])
        const s = await sr.json(); setSignals(Array.isArray(s) ? s : [])
        const tk = await tr.json()
        const usdt = tk.filter((t: any) => t.symbol.endsWith('USDT'))
        const sorted = [...usdt].sort((a: any, b: any) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent))
        setGainers(sorted.slice(0, 10)); setLosers(sorted.slice(-10).reverse())
        setTopCoins(await cr.json())
        const nd = await nr.json(); setNews(nd.items?.slice(0, 6) || [])
      } catch {}
      setLoading(false)
    })()
  }, [])

  const wins = signals.filter(s => s.status === 'WIN').length
  const losses = signals.filter(s => s.status === 'LOSS').length
  const open = signals.filter(s => s.status === 'OPEN').length
  const total = signals.length
  const winRate = (wins + losses) > 0 ? Math.round((wins / (wins + losses)) * 100) : 0
  const totalPnlWin = signals.filter(s => s.status === 'WIN').reduce((sum, s) => sum + parseFloat(s.pnl_pct || '0'), 0)
  const totalPnlLoss = signals.filter(s => s.status === 'LOSS').reduce((sum, s) => sum + parseFloat(s.pnl_pct || '0'), 0)
  const netPnl = totalPnlWin + totalPnlLoss

  // E1 (تأكيد الوقف بإغلاق شمعة) دخل الإنتاج بهالتوقيت -- نقسم الإحصائيات
  // قبله/بعده عشان الأداء المحدّث يبان لحاله، بدون ما يتخفّى بمتوسط تاريخي
  // يشمل فترة قبل الإصلاح.
  const STRATEGY_UPDATE_CUTOFF = new Date('2026-08-06T17:09:00Z').getTime()
  const isUpdatedEra = (s: any) => new Date(s.created_at).getTime() >= STRATEGY_UPDATE_CUTOFF
  const updatedSignals = signals.filter(isUpdatedEra)
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

        {/* Stats row -- استراتيجية محدثة (فوق) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--cyan)' }}>🆕 {t('استراتيجية محدثة', 'Updated Strategy')}</span>
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

        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: '20px' }}>
          {[
            { id: 'overview', label: t('نظرة عامة', 'Overview') },
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
                {signals.length === 0 ? (
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

            {filteredSignals.length === 0 ? (
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
