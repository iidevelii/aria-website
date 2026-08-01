'use client'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { useLang } from '../layout'

function parseTs(raw: string) {
  return new Date(raw.endsWith('Z') || raw.includes('+') ? raw : raw + 'Z').getTime()
}

function ChartView() {
  const { t } = useLang()
  const searchParams = useSearchParams()
  const symbol = searchParams.get('symbol') || 'BTCUSDT'
  const entry = parseFloat(searchParams.get('entry') || '0')
  const tp = parseFloat(searchParams.get('tp') || '0')
  const sl = parseFloat(searchParams.get('sl') || '0')
  const side = searchParams.get('side') || 'LONG'
  const status = searchParams.get('status') || 'OPEN'
  const createdAt = searchParams.get('created_at') || ''
  const closedAt = searchParams.get('closed_at') || ''
  const closePriceParam = parseFloat(searchParams.get('close_price') || '0')
  const pnlPctParam = parseFloat(searchParams.get('pnl_pct') || '0')
  const isClosed = status === 'WIN' || status === 'LOSS'

  const [duration, setDuration] = useState('—')
  useEffect(() => {
    if (!createdAt) return
    const start = parseTs(createdAt)
    if (isNaN(start)) return
    const fixedEnd = isClosed && closedAt ? parseTs(closedAt) : null
    const update = () => {
      const end = fixedEnd && !isNaN(fixedEnd) ? fixedEnd : Date.now()
      const mins = Math.floor((end - start) / 60000)
      const days = Math.floor(mins / 1440)
      const hours = Math.floor((mins % 1440) / 60)
      const m = mins % 60
      setDuration(days > 0 ? `${days}${t('ي','d')} ${hours}${t('س','h')}` : hours > 0 ? `${hours}${t('س','h')} ${m}${t('د','m')}` : `${m}${t('د','m')}`)
    }
    update()
    if (isClosed) return
    const iv = setInterval(update, 60000)
    return () => clearInterval(iv)
  }, [createdAt, closedAt, isClosed])

  const chartRef = useRef<HTMLDivElement>(null)
  const [currentPrice, setCurrentPrice] = useState(0)
  const [live, setLive] = useState(false)

  useEffect(() => {
    if (!chartRef.current) return
    let chart: any, series: any

    const init = async () => {
      const { createChart, CandlestickSeries, LineStyle, createSeriesMarkers } = await import('lightweight-charts')
      chart = createChart(chartRef.current!, {
        width: chartRef.current!.clientWidth,
        height: 500,
        layout: { background: { color: '#050508' }, textColor: '#9ca3af' },
        grid: { vertLines: { color: 'rgba(255,255,255,0.04)' }, horzLines: { color: 'rgba(255,255,255,0.04)' } },
        crosshair: { mode: 1 },
        rightPriceScale: { borderColor: 'rgba(255,255,255,0.1)' },
        timeScale: { borderColor: 'rgba(255,255,255,0.1)', timeVisible: true, rightOffset: 6 },
      })

      series = chart.addSeries(CandlestickSeries, {
        upColor: '#00e664', downColor: '#ff5555',
        borderUpColor: '#00e664', borderDownColor: '#ff5555',
        wickUpColor: '#00e664', wickDownColor: '#ff5555',
        priceLineVisible: false, lastValueVisible: false,
      })
      // نوسّع نطاق المقياس يدوياً عشان الهدف يبقى ظاهر حتى لو بعيد عن مدى
      // الشموع الحالي (خط/marker وحدهم ما يوسّعون النطاق بشكل موثوق دايماً)
      series.applyOptions({
        autoscaleInfoProvider: (original: () => any) => {
          const res = original()
          if (res?.priceRange) {
            const vals = [entry, tp, sl].filter((v: number) => v > 0)
            res.priceRange.minValue = Math.min(res.priceRange.minValue, ...vals)
            res.priceRange.maxValue = Math.max(res.priceRange.maxValue, ...vals)
          }
          return res
        },
      } as any)

      // جلب الكاندلز
      const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=4h&limit=100`)
      const data = await res.json()
      const candles = data.map((d: any) => ({
        time: d[0] / 1000,
        open: parseFloat(d[1]),
        high: parseFloat(d[2]),
        low: parseFloat(d[3]),
        close: parseFloat(d[4]),
      }))
      series.setData(candles)

      // السعر الحالي (نقطة انطلاق قبل أول تحديث لايف) — للصفقات المغلقة نستخدم
      // سعر الإغلاق الفعلي المُمرَّر بدل آخر شمعة حية، عشان ما يطغى عليه لايف
      const lastClose = candles[candles.length - 1].close
      if (!(isClosed && closePriceParam > 0)) setCurrentPrice(lastClose)

      // خطين فقط — دخول ووقف. الهدف نقطة/شارة بدون خط كامل، وبدون خط سعر حالي.
      // (نستخدم priceLine بلا خط ظاهر للهدف — badge على المحور بس — لأن خط
      // السعر يوسّع نطاق المقياس تلقائياً بعكس marker مخصص عند سعر بعيد عن الشموع)
      if (entry > 0) {
        series.createPriceLine({ price: entry, color: '#00d4ff', lineWidth: 2, lineStyle: LineStyle.Dashed, title: t('دخول', 'Entry') })
      }
      if (sl > 0) {
        series.createPriceLine({ price: sl, color: '#ff5555', lineWidth: 2, lineStyle: LineStyle.Dashed, title: t('وقف', 'Stop') })
      }
      if (tp > 0) {
        series.createPriceLine({ price: tp, color: '#fbbf24', lineVisible: false, axisLabelVisible: true, title: t('أخذ الربح', 'Take Profit') })
      }

      // أقرب شمعة لوقت فتح الصفقة لوضع سهم الدخول عليها
      let entryTime = candles[0]?.time
      if (createdAt) {
        const target = parseTs(createdAt)
        if (!isNaN(target)) {
          let best = candles[0], bestDiff = Infinity
          for (const c of candles) {
            const diff = Math.abs(c.time - target / 1000)
            if (diff < bestDiff) { bestDiff = diff; best = c }
          }
          entryTime = best.time
        }
      }
      const isLong = side === 'LONG'
      const markers: any[] = []
      if (entryTime != null) {
        markers.push({
          time: entryTime, position: isLong ? 'belowBar' : 'aboveBar',
          shape: isLong ? 'arrowUp' : 'arrowDown', color: isLong ? '#00e664' : '#ff5555',
          text: t(isLong ? 'شراء' : 'بيع', isLong ? 'Buy' : 'Sell'),
        })
      }
      if (markers.length) createSeriesMarkers(series, markers)

      chart.timeScale().fitContent()
    }

    init()
    return () => { if (chart) chart.remove() }
  }, [symbol, entry, tp, sl, isClosed, closePriceParam, createdAt, side])

  // تحديث السعر الحالي لايف كل 8 ثواني — يحدّث رقم السعر بأعلى الصفحة بس
  // (بدون خط على الشارت نفسه). الصفقات المغلقة ما تحتاج تحديث حي.
  useEffect(() => {
    if (isClosed) { if (closePriceParam > 0) setCurrentPrice(closePriceParam); return }
    const poll = async () => {
      try {
        const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`)
        const d = await res.json()
        const p = parseFloat(d.price)
        if (!isFinite(p) || p <= 0) return
        setCurrentPrice(p)
        setLive(true)
      } catch {}
    }
    poll()
    const t = setInterval(poll, 8000)
    return () => clearInterval(t)
  }, [symbol, isClosed, closePriceParam])

  const livePct = entry > 0 ? ((currentPrice - entry) / entry) * 100 * (side === 'SHORT' ? -1 : 1) : 0
  const pct = isClosed && pnlPctParam ? pnlPctParam : livePct

  // كم باقي (بالنسبة المئوية من السعر الحالي) عشان توصل الهدف أو الوقف
  const toTargetPct = tp > 0 && currentPrice > 0 ? ((tp - currentPrice) / currentPrice) * 100 * (side === 'SHORT' ? -1 : 1) : null
  const toStopPct   = sl > 0 && currentPrice > 0 ? ((sl - currentPrice) / currentPrice) * 100 * (side === 'SHORT' ? -1 : 1) : null
  let progress = 50
  if (currentPrice > 0 && tp > 0 && sl > 0) {
    if (side === 'LONG' && tp > sl) progress = Math.max(0, Math.min(100, ((currentPrice - sl) / (tp - sl)) * 100))
    else if (side === 'SHORT' && sl > tp) progress = Math.max(0, Math.min(100, ((sl - currentPrice) / (sl - tp)) * 100))
  }
  const barColor = status === 'WIN' ? '#00e664' : status === 'LOSS' ? '#ff5555' : progress > 70 ? '#00e664' : progress > 35 ? '#fbbf24' : '#ff5555'

  return (
    <div style={{ minHeight: '100vh', background: '#050508', color: 'white', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 900, margin: 0 }}>{symbol.replace('USDT', '')}/USDT</h1>
            <span style={{ background: side === 'LONG' ? 'rgba(0,230,100,0.12)' : 'rgba(255,85,85,0.12)', color: side === 'LONG' ? '#00e664' : '#ff5555', border: `1px solid ${side === 'LONG' ? 'rgba(0,230,100,0.3)' : 'rgba(255,85,85,0.3)'}`, borderRadius: '8px', padding: '4px 12px', fontSize: '13px', fontWeight: 800 }}>{side}</span>
            {status === 'WIN' && <span style={{ background: 'rgba(0,230,100,0.15)', color: '#00e664', border: '1px solid rgba(0,230,100,0.35)', borderRadius: '8px', padding: '4px 12px', fontSize: '13px', fontWeight: 800 }}>🏆 {t('ربح', 'Win')}</span>}
            {status === 'LOSS' && <span style={{ background: 'rgba(255,85,85,0.15)', color: '#ff5555', border: '1px solid rgba(255,85,85,0.35)', borderRadius: '8px', padding: '4px 12px', fontSize: '13px', fontWeight: 800 }}>❌ {t('خسارة', 'Loss')}</span>}
            {status === 'OPEN' && <span style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.35)', borderRadius: '8px', padding: '4px 12px', fontSize: '13px', fontWeight: 800 }}>● {t('مفتوحة', 'Open')}</span>}
            {duration !== '—' && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#9ca3af', fontSize: '13px' }}>
                ⏱ {t('المدة', 'Duration')}: <span style={{ fontFamily: 'monospace', color: 'white', fontWeight: 700 }}>{duration}</span>
              </span>
            )}
          </div>
          {currentPrice > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {!isClosed && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: live ? '#00e664' : '#00d4ff', display: 'inline-block', animation: 'pulse 2s infinite' }}></span>}
              {!isClosed && live && <span style={{ fontSize: '10px', color: '#00e664', fontWeight: 700 }}>{t('لايف', 'Live')}</span>}
              {isClosed && <span style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 700 }}>{t('سعر الإغلاق', 'Close price')}</span>}
              <span style={{ fontFamily: 'monospace', fontSize: '20px', fontWeight: 900 }}>${currentPrice.toLocaleString()}</span>
              <span style={{ fontWeight: 800, fontSize: '16px', color: pct >= 0 ? '#00e664' : '#ff5555', background: pct >= 0 ? 'rgba(0,230,100,0.1)' : 'rgba(255,85,85,0.1)', padding: '4px 10px', borderRadius: '8px' }}>
                {pct >= 0 ? '+' : ''}{pct.toFixed(2)}%
              </span>
            </div>
          )}
        </div>

        {/* Levels */}
        {entry > 0 && (
          <div className="chart-levels-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#00d4ff', marginBottom: '6px', fontWeight: 700 }}>{t('سعر الدخول', 'Entry Price')}</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '18px' }}>${entry.toLocaleString()}</div>
            </div>
            <div style={{ background: 'rgba(0,230,100,0.06)', border: '1px solid rgba(0,230,100,0.2)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#00e664', marginBottom: '6px', fontWeight: 700 }}>{t('الهدف', 'Target')}</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '18px', color: '#00e664' }}>${tp.toLocaleString()}</div>
              {toTargetPct !== null && <div style={{ fontSize: '11px', color: 'rgba(0,230,100,0.7)', marginTop: '4px' }}>{t('باقي', 'Remaining')} {Math.abs(toTargetPct).toFixed(2)}%</div>}
            </div>
            <div style={{ background: 'rgba(255,85,85,0.06)', border: '1px solid rgba(255,85,85,0.2)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#ff5555', marginBottom: '6px', fontWeight: 700 }}>{t('الوقف', 'Stop')}</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '18px', color: '#ff5555' }}>${sl.toLocaleString()}</div>
              {toStopPct !== null && <div style={{ fontSize: '11px', color: 'rgba(255,85,85,0.7)', marginTop: '4px' }}>{t('باقي', 'Remaining')} {Math.abs(toStopPct).toFixed(2)}%</div>}
            </div>
          </div>
        )}

        {/* Progress bar — كم باقي نحو الهدف مقابل الوقف */}
        {entry > 0 && tp > 0 && sl > 0 && currentPrice > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: barColor, borderRadius: '4px', transition: 'width 0.6s ease' }}/>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '6px' }}>
              <span style={{ color: '#ff5555' }}>{t('وقف', 'Stop')}</span>
              <span style={{ color: barColor, fontWeight: 700 }}>
                {status === 'WIN' ? t('🎯 وصل الهدف', '🎯 Target hit')
                  : status === 'LOSS' ? t('⛔ وصل الوقف', '⛔ Stop hit')
                  : t(`${progress.toFixed(0)}% نحو الهدف`, `${progress.toFixed(0)}% to Target`)}
              </span>
              <span style={{ color: '#00e664' }}>{t('هدف', 'Target')}</span>
            </div>
          </div>
        )}

        {/* Chart */}
        <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div ref={chartRef} style={{ width: '100%' }} />
        </div>
      </div>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @media (max-width: 480px) {
          .chart-levels-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

function ChartFallback() {
  const { t } = useLang()
  return (
    <div style={{ minHeight: '100vh', background: '#050508', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00d4ff', fontWeight: 700 }}>{t('جاري التحميل...', 'Loading...')}</div>
  )
}

export default function ChartPage() {
  return (
    <Suspense fallback={<ChartFallback />}>
      <ChartView />
    </Suspense>
  )
}