'use client'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ChartView() {
  const searchParams = useSearchParams()
  const symbol = searchParams.get('symbol') || 'BTCUSDT'
  const entry = parseFloat(searchParams.get('entry') || '0')
  const tp = parseFloat(searchParams.get('tp') || '0')
  const sl = parseFloat(searchParams.get('sl') || '0')
  const side = searchParams.get('side') || 'LONG'

  const chartRef = useRef<HTMLDivElement>(null)
  const [currentPrice, setCurrentPrice] = useState(0)

  useEffect(() => {
    if (!chartRef.current) return
    let chart: any, series: any

    const init = async () => {
      const { createChart, LineStyle } = await import('lightweight-charts')
      chart = createChart(chartRef.current!, {
        width: chartRef.current!.clientWidth,
        height: 500,
        layout: { background: { color: '#050508' }, textColor: '#9ca3af' },
        grid: { vertLines: { color: 'rgba(255,255,255,0.04)' }, horzLines: { color: 'rgba(255,255,255,0.04)' } },
        crosshair: { mode: 1 },
        rightPriceScale: { borderColor: 'rgba(255,255,255,0.1)' },
        timeScale: { borderColor: 'rgba(255,255,255,0.1)', timeVisible: true },
      })

      series = chart.addCandlestickSeries({
        upColor: '#00e664', downColor: '#ff5555',
        borderUpColor: '#00e664', borderDownColor: '#ff5555',
        wickUpColor: '#00e664', wickDownColor: '#ff5555',
      })

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

      // السعر الحالي
      const lastClose = candles[candles.length - 1].close
      setCurrentPrice(lastClose)

      // خطوط
      if (entry > 0) {
        series.createPriceLine({ price: entry, color: '#00d4ff', lineWidth: 2, lineStyle: LineStyle.Dashed, title: 'دخول' })
      }
      if (tp > 0) {
        series.createPriceLine({ price: tp, color: '#00e664', lineWidth: 2, lineStyle: LineStyle.Dashed, title: 'هدف' })
      }
      if (sl > 0) {
        series.createPriceLine({ price: sl, color: '#ff5555', lineWidth: 2, lineStyle: LineStyle.Dashed, title: 'وقف' })
      }
      if (lastClose > 0) {
        series.createPriceLine({ price: lastClose, color: '#fbbf24', lineWidth: 1, lineStyle: LineStyle.Solid, title: 'الحالي' })
      }

      chart.timeScale().fitContent()
    }

    init()
    return () => { if (chart) chart.remove() }
  }, [symbol, entry, tp, sl])

  const pct = entry > 0 ? ((currentPrice - entry) / entry) * 100 * (side === 'SHORT' ? -1 : 1) : 0

  return (
    <div style={{ minHeight: '100vh', background: '#050508', color: 'white', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 900, margin: 0 }}>{symbol.replace('USDT', '')}/USDT</h1>
            <span style={{ background: side === 'LONG' ? 'rgba(0,230,100,0.12)' : 'rgba(255,85,85,0.12)', color: side === 'LONG' ? '#00e664' : '#ff5555', border: `1px solid ${side === 'LONG' ? 'rgba(0,230,100,0.3)' : 'rgba(255,85,85,0.3)'}`, borderRadius: '8px', padding: '4px 12px', fontSize: '13px', fontWeight: 800 }}>{side}</span>
          </div>
          {currentPrice > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00d4ff', display: 'inline-block', animation: 'pulse 2s infinite' }}></span>
              <span style={{ fontFamily: 'monospace', fontSize: '20px', fontWeight: 900 }}>${currentPrice.toLocaleString()}</span>
              <span style={{ fontWeight: 800, fontSize: '16px', color: pct >= 0 ? '#00e664' : '#ff5555', background: pct >= 0 ? 'rgba(0,230,100,0.1)' : 'rgba(255,85,85,0.1)', padding: '4px 10px', borderRadius: '8px' }}>
                {pct >= 0 ? '+' : ''}{pct.toFixed(2)}%
              </span>
            </div>
          )}
        </div>

        {/* Levels */}
        {entry > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
            <div style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#00d4ff', marginBottom: '6px', fontWeight: 700 }}>سعر الدخول</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '18px' }}>${entry.toLocaleString()}</div>
            </div>
            <div style={{ background: 'rgba(0,230,100,0.06)', border: '1px solid rgba(0,230,100,0.2)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#00e664', marginBottom: '6px', fontWeight: 700 }}>الهدف</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '18px', color: '#00e664' }}>${tp.toLocaleString()}</div>
            </div>
            <div style={{ background: 'rgba(255,85,85,0.06)', border: '1px solid rgba(255,85,85,0.2)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#ff5555', marginBottom: '6px', fontWeight: 700 }}>الوقف</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '18px', color: '#ff5555' }}>${sl.toLocaleString()}</div>
            </div>
          </div>
        )}

        {/* Chart */}
        <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div ref={chartRef} style={{ width: '100%' }} />
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  )
}

export default function ChartPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#050508', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00d4ff', fontWeight: 700 }}>جاري التحميل...</div>}>
      <ChartView />
    </Suspense>
  )
}