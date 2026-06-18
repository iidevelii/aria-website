'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function TradingViewWidget({ symbol }: { symbol: string }) {
  const container = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!container.current) return
    container.current.innerHTML = ''
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      symbol: `BINANCE:${symbol}USDT`,
      interval: '240', timezone: 'Asia/Riyadh',
      theme: 'dark', style: '1', locale: 'ar',
      height: 450, width: '100%',
    })
    container.current.appendChild(script)
  }, [symbol])
  return <div ref={container} style={{ height: 450 }} />
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
  const color = value < 25 ? '#ff5555' : value < 45 ? '#f97316' : value < 55 ? '#fbbf24' : value < 75 ? '#84cc16' : '#00e664'
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

function MarketBar() {
  const [coins, setCoins] = useState<any[]>([])
  useEffect(() => {
    fetch('https://api.binance.com/api/v3/ticker/24hr')
      .then(r => r.json())
      .then(d => {
        const usdt = d.filter((t: any) => t.symbol.endsWith('USDT'))
        setCoins([...usdt].sort((a: any, b: any) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume)).slice(0, 30))
      }).catch(() => {})
  }, [])
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', padding: '10px 0', background: 'rgba(255,255,255,0.01)' }}>
      <div className="animate-marquee" style={{ display: 'flex', gap: '32px', width: 'max-content' }}>
        {[...coins, ...coins].map((t: any, i: number) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', fontSize: '12px' }}>
            <span style={{ color: '#9ca3af', fontWeight: 700 }}>{t.symbol.replace('USDT', '')}</span>
            <span style={{ fontFamily: 'monospace' }}>${parseFloat(t.lastPrice) > 1 ? parseFloat(t.lastPrice).toLocaleString() : parseFloat(t.lastPrice).toFixed(4)}</span>
            <span style={{ color: parseFloat(t.priceChangePercent) >= 0 ? '#00e664' : '#ff5555', fontWeight: 600 }}>
              {parseFloat(t.priceChangePercent) >= 0 ? '▲' : '▼'}{Math.abs(parseFloat(t.priceChangePercent)).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const router = useRouter()
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
  const [scanLoaded, setScanLoaded] = useState(false)
  const [prices, setPrices] = useState<Record<string, number>>({})

  useEffect(() => {
    const calcRemaining = () => {
      const now = new Date()
      const minutes = now.getMinutes()
      const seconds = now.getSeconds()
      const totalSeconds = (minutes % 15) * 60 + seconds
      return 900 - totalSeconds
    }
    setNextScan(calcRemaining())
    const t = setInterval(() => setNextScan(calcRemaining()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const fetchPrices = async () => {
      const openSignals = signals.filter(s => s.status === 'OPEN')
      if (openSignals.length === 0) return
      try {
        const symbols = openSignals.map(s => s.pair.replace('/', ''))
        const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbols=${JSON.stringify(symbols)}`)
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
    const fetchData = async () => {
      try {
        if (uid) {
          const r = await fetch(`https://web-production-97af6.up.railway.app/user/${uid}`)
          if (r.ok) setUser(await r.json())
        }
        const [sr, tr, cr, nr] = await Promise.all([
          fetch('https://web-production-97af6.up.railway.app/signals'),
          fetch('https://api.binance.com/api/v3/ticker/24hr'),
          fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1'),
          fetch('https://api.rss2json.com/v1/api.json?rss_url=https://cointelegraph.com/rss')
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
    }
    fetchData()
  }, [])

  const wins = signals.filter(s => s.status === 'WIN').length
  const losses = signals.filter(s => s.status === 'LOSS').length
  const total = signals.length
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0
  const totalPnlWin = signals.filter(s => s.status === 'WIN').reduce((sum, s) => sum + parseFloat(s.pnl_pct || '0'), 0)
  const totalPnlLoss = signals.filter(s => s.status === 'LOSS').reduce((sum, s) => sum + parseFloat(s.pnl_pct || '0'), 0)
  const mins = Math.floor(nextScan / 60)
  const secs = nextScan % 60

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#050508', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #00d4ff, #7b2fff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '22px', margin: '0 auto 16px' }}>A</div>
        <div style={{ color: '#00d4ff', fontWeight: 700, fontSize: '16px' }}>جاري التحميل...</div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#050508', color: 'white' }}>
      <MarketBar />

      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00e664', display: 'inline-block', animation: 'pulse 2s infinite' }}></span>
            <span style={{ fontSize: '13px', color: '#6b7280' }}>Live Trading</span>
          </div>
          <span style={{ color: '#374151', fontSize: '13px' }}>الفحص القادم: <span style={{ color: '#9ca3af', fontFamily: 'monospace' }}>{mins}:{secs.toString().padStart(2, '0')}</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <>
              <span style={{ fontSize: '13px', color: '#6b7280' }}>مرحباً <span style={{ color: 'white', fontWeight: 600 }}>{user.username}</span></span>
              <span className={user.is_active ? 'status-active' : 'status-inactive'}>{user.is_active ? `نشط · ${user.days_left}د` : 'منتهي'}</span>
              <button onClick={() => { localStorage.clear(); router.push('/') }} style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>خروج</button>
            </>
          ) : (
            <>
              <Link href="/login" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '13px' }}>دخول</Link>
              <Link href="/register" className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>سجّل مجاناً</Link>
            </>
          )}
        </div>
      </div>

      {!user && (
        <div style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.06), rgba(123,47,255,0.06))', borderBottom: '1px solid rgba(0,212,255,0.12)', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: '14px' }}>تبي الاشارات تجيك فوراً على التلقرام؟ </span>
            <span style={{ color: '#6b7280', fontSize: '13px' }}>سجّل مجاناً وابدأ 30 يوم تجربة</span>
          </div>
          <Link href="/register" className="btn-primary" style={{ padding: '10px 20px', fontSize: '13px' }}>ابدأ مجاناً ←</Link>
        </div>
      )}

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'الاشارات', value: total, color: 'white' },
            { label: 'الرابحة', value: wins, color: '#00e664' },
            { label: 'الخاسرة', value: losses, color: '#ff5555' },
            { label: 'نسبة الفوز', value: `${winRate}%`, color: winRate >= 60 ? '#00e664' : '#fbbf24' },
            { label: 'إجمالي الربح', value: `+${totalPnlWin.toFixed(1)}%`, color: '#00e664' },
            { label: 'إجمالي الخسارة', value: `${totalPnlLoss.toFixed(1)}%`, color: '#ff5555' },
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
            { id: 'overview', label: 'نظرة عامة' },
            { id: 'signals', label: 'الاشارات' },
            { id: 'chart', label: 'الشارت' },
            { id: 'market', label: 'السوق' },
            { id: 'news', label: 'الاخبار' },
          ].map(t => (
            <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="card-glow-cyan" style={{ padding: '24px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>آخر اشارة</div>
                {signals.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px', color: '#4b5563' }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</div>
                    <div style={{ fontWeight: 600 }}>البوت يراقب السوق</div>
                    <div style={{ fontSize: '13px', marginTop: '4px' }}>الفحص القادم خلال {mins}:{secs.toString().padStart(2, '0')}</div>
                  </div>
                ) : (() => {
                  const s = signals[0]
                  return (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '24px', fontWeight: 900 }}>{s.pair}</span>
                          <span style={{ background: s.side === 'LONG' ? 'rgba(0,230,100,0.12)' : 'rgba(255,85,85,0.12)', color: s.side === 'LONG' ? '#00e664' : '#ff5555', border: `1px solid ${s.side === 'LONG' ? 'rgba(0,230,100,0.25)' : 'rgba(255,85,85,0.25)'}`, borderRadius: '8px', padding: '4px 12px', fontSize: '13px', fontWeight: 800 }}>{s.side}</span>
                          <span style={{ background: 'rgba(255,255,255,0.05)', color: '#6b7280', borderRadius: '6px', padding: '4px 10px', fontSize: '12px' }}>{s.regime}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>Quality Score</div>
                          <div style={{ fontSize: '28px', fontWeight: 900, color: '#00d4ff' }}>{s.ai_score}<span style={{ fontSize: '13px', color: '#4b5563' }}>/100</span></div>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                        <div className="price-box">
                          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>دخول</div>
                          <div style={{ fontFamily: 'monospace', fontWeight: 700 }}>${s.entry}</div>
                        </div>
                        <div style={{ background: 'rgba(0,230,100,0.06)', border: '1px solid rgba(0,230,100,0.15)', borderRadius: '12px', padding: '12px 16px', textAlign: 'center' }}>
                          <div style={{ fontSize: '11px', color: '#00e664', marginBottom: '4px' }}>هدف +{s.tp_pct}%</div>
                          <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#00e664' }}>${s.tp}</div>
                        </div>
                        <div style={{ background: 'rgba(255,85,85,0.06)', border: '1px solid rgba(255,85,85,0.15)', borderRadius: '12px', padding: '12px 16px', textAlign: 'center' }}>
                          <div style={{ fontSize: '11px', color: '#ff5555', marginBottom: '4px' }}>وقف -{s.sl_pct}%</div>
                          <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#ff5555' }}>${s.sl}</div>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>

              {user && !user.telegram_id && (
                <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '18px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: '4px' }}>فعّل اشعارات التلقرام</div>
                    <div style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: '8px', padding: '6px 14px', fontFamily: 'monospace', color: '#00d4ff', fontSize: '14px', display: 'inline-block', marginTop: '8px' }}>/link {user.id}</div>
                  </div>
                  <a href="https://t.me/Devel100_bot" target="_blank" className="btn-primary" style={{ padding: '10px 20px', fontSize: '13px' }}>فتح البوت</a>
                </div>
              )}

              {!user && (
                <div style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.06), rgba(123,47,255,0.06))', border: '1px solid rgba(0,212,255,0.15)', borderRadius: '18px', padding: '24px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>تبي الاشارات على تلقرامك؟</div>
                  <div style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>سجّل مجاناً وابدأ 30 يوم تجربة</div>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <Link href="/register" className="btn-primary">سجّل مجاناً</Link>
                    <Link href="/login" className="btn-secondary">دخول</Link>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <FearGreed />
              <div className="card">
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>افضل الرابحين</div>
                {gainers.slice(0, 6).map((t: any, i: number) => (
                  <div key={t.symbol} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#374151', fontSize: '11px', width: '16px' }}>{i+1}</span>
                      <span style={{ fontWeight: 700, fontSize: '13px' }}>{t.symbol.replace('USDT','')}</span>
                    </div>
                    <span style={{ color: '#00e664', fontSize: '13px', fontWeight: 700 }}>+{parseFloat(t.priceChangePercent).toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'signals' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {signals.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '64px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                <div style={{ fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>البوت يراقب السوق</div>
                <div style={{ color: '#6b7280' }}>الفحص القادم خلال {mins}:{secs.toString().padStart(2,'0')}</div>
              </div>
            ) : signals.map((s: any) => (
              <div key={s.id} className="signal-card" onClick={() => { window.open(`/chart?symbol=${s.pair.replace('/','')}USDT&entry=${s.entry}&tp=${s.tp}&sl=${s.sl}&side=${s.side}`, '_blank') }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '18px', fontWeight: 900 }}>{s.pair}</span>
                    <span style={{ background: s.side === 'LONG' ? 'rgba(0,230,100,0.12)' : 'rgba(255,85,85,0.12)', color: s.side === 'LONG' ? '#00e664' : '#ff5555', border: `1px solid ${s.side === 'LONG' ? 'rgba(0,230,100,0.25)' : 'rgba(255,85,85,0.25)'}`, borderRadius: '6px', padding: '3px 10px', fontSize: '12px', fontWeight: 800 }}>{s.side}</span>
                    <span style={{ background: 'rgba(255,255,255,0.04)', color: '#6b7280', borderRadius: '6px', padding: '3px 8px', fontSize: '11px' }}>{s.regime}</span>
                    <span style={{ background: s.status === 'WIN' ? 'rgba(0,230,100,0.1)' : s.status === 'LOSS' ? 'rgba(255,85,85,0.1)' : 'rgba(251,191,36,0.1)', color: s.status === 'WIN' ? '#00e664' : s.status === 'LOSS' ? '#ff5555' : '#fbbf24', borderRadius: '6px', padding: '3px 8px', fontSize: '11px', fontWeight: 700 }}>
                      {s.status === 'WIN' ? '✓ ربح' : s.status === 'LOSS' ? '✗ خسارة' : '● مفتوحة'}
                    </span>
                    {s.pnl_pct && s.status !== 'OPEN' && (
                      <span style={{ background: parseFloat(s.pnl_pct) > 0 ? 'rgba(0,230,100,0.1)' : 'rgba(255,85,85,0.1)', color: parseFloat(s.pnl_pct) > 0 ? '#00e664' : '#ff5555', borderRadius: '6px', padding: '3px 8px', fontSize: '11px', fontWeight: 700 }}>
                        {parseFloat(s.pnl_pct) > 0 ? '+' : ''}{parseFloat(s.pnl_pct).toFixed(2)}%
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>x{s.leverage}</span>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '10px', color: '#4b5563' }}>Score</div>
                      <div style={{ fontSize: '20px', fontWeight: 900, color: '#00d4ff' }}>{s.ai_score}</div>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div className="price-box">
                    <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '3px' }}>دخول</div>
                    <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '13px' }}>${s.entry}</div>
                  </div>
                  <div style={{ background: 'rgba(0,230,100,0.05)', border: '1px solid rgba(0,230,100,0.12)', borderRadius: '10px', padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#00e664', marginBottom: '3px' }}>+{s.tp_pct}%</div>
                    <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '13px', color: '#00e664' }}>${s.tp}</div>
                  </div>
                  <div style={{ background: 'rgba(255,85,85,0.05)', border: '1px solid rgba(255,85,85,0.12)', borderRadius: '10px', padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#ff5555', marginBottom: '3px' }}>-{s.sl_pct}%</div>
                    <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '13px', color: '#ff5555' }}>${s.sl}</div>
                  </div>
                </div>
                {(() => {
                  const sym = s.pair.replace('/', '')
                  const cur = prices[sym]
                  const entry = parseFloat(s.entry)
                  const tp = parseFloat(s.tp)
                  const sl = parseFloat(s.sl)
                  if (!cur) return <div style={{ marginTop: '10px', fontSize: '11px', color: '#374151' }}>اضغط لرؤية الشارت ←</div>
                  const pct = ((cur - entry) / entry) * 100 * (s.side === 'SHORT' ? -1 : 1)
                  const lev = s.leverage || 5
                  const levPct = pct * lev
                  const isWin = s.side === 'LONG' ? cur >= tp : cur <= tp
                  const isLoss = s.side === 'LONG' ? cur <= sl : cur >= sl
                  const color = levPct >= 0 ? '#00e664' : '#ff5555'
                  return (
                    <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00d4ff', display: 'inline-block', animation: 'pulse 2s infinite' }}></span>
                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>السعر الحالي:</span>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '13px' }}>${cur.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>x{lev}</span>
                        <span style={{ fontWeight: 800, fontSize: '14px', color, background: `${color}15`, padding: '4px 10px', borderRadius: '8px' }}>
                          {levPct >= 0 ? '+' : ''}{levPct.toFixed(2)}%
                        </span>
                        {isWin && <span style={{ fontSize: '12px', color: '#00e664', fontWeight: 700 }}>🎯 وصل الهدف</span>}
                        {isLoss && <span style={{ fontSize: '12px', color: '#ff5555', fontWeight: 700 }}>⛔ وصل الوقف</span>}
                      </div>
                    </div>
                  )
                })()}
              </div>
            ))}
          </div>
        )}

        {tab === 'chart' && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', gap: '8px', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto' }}>
              {['BTC','ETH','BNB','SOL','XRP','ADA','DOGE','AVAX'].map(sym => (
                <button key={sym} onClick={() => setChartSymbol(sym)} style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', border: 'none', fontFamily: 'inherit', background: chartSymbol === sym ? '#00d4ff' : 'rgba(255,255,255,0.05)', color: chartSymbol === sym ? 'black' : '#9ca3af', whiteSpace: 'nowrap', transition: 'all 0.15s' }}>
                  {sym}
                </button>
              ))}
            </div>
            <TradingViewWidget symbol={chartSymbol} />
          </div>
        )}

        {tab === 'market' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {[
              { title: '🚀 Top Gainers', data: gainers, colorFn: () => '#00e664', valFn: (t: any) => `+${parseFloat(t.priceChangePercent).toFixed(2)}%` },
              { title: '📉 Top Losers', data: losers, colorFn: () => '#ff5555', valFn: (t: any) => `${parseFloat(t.priceChangePercent).toFixed(2)}%` },
              { title: '👑 Market Cap', data: topCoins, colorFn: (c: any) => c.price_change_percentage_24h >= 0 ? '#00e664' : '#ff5555', valFn: (c: any) => `${c.price_change_percentage_24h >= 0 ? '+' : ''}${c.price_change_percentage_24h?.toFixed(2)}%`, isCG: true },
            ].map((col, ci) => (
              <div key={ci} className="card">
                <div style={{ fontWeight: 800, marginBottom: '20px', fontSize: '15px' }}>{col.title}</div>
                {col.data.map((item: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < col.data.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', cursor: 'pointer' }}
                    onClick={() => { setChartSymbol(col.isCG ? item.symbol.toUpperCase() : item.symbol.replace('USDT','')); setTab('chart') }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#374151', fontSize: '11px', width: '18px' }}>{i+1}</span>
                      <span style={{ fontWeight: 700, fontSize: '13px' }}>{col.isCG ? item.symbol.toUpperCase() : item.symbol.replace('USDT','')}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#6b7280' }}>${col.isCG ? item.current_price.toLocaleString() : parseFloat(item.lastPrice) > 1 ? parseFloat(item.lastPrice).toLocaleString() : parseFloat(item.lastPrice).toFixed(5)}</div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: col.colorFn(item) }}>{col.valFn(item)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {tab === 'news' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {news.map((item: any, i: number) => (
              <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'white' }}>
                <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {item.thumbnail && <img src={item.thumbnail} alt="" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '12px', opacity: 0.85 }}/>}
                  <div style={{ fontWeight: 700, fontSize: '14px', lineHeight: 1.6, flex: 1 }}>{item.title}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: '#4b5563', fontSize: '12px' }}>{new Date(item.pubDate).toLocaleDateString('ar-SA')}</span>
                    <span style={{ color: '#00d4ff', fontSize: '12px', fontWeight: 700 }}>اقرأ المزيد ←</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        <div style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="https://t.me/Devel100_bot" target="_blank" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa', textDecoration: 'none', fontWeight: 700, padding: '10px 20px', borderRadius: '12px', fontSize: '14px' }}>فتح البوت</a>
          <Link href="/subscribe" className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>تجديد الاشتراك</Link>
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  )
}
