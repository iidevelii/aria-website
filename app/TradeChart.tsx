'use client'
import { useEffect, useRef, useState } from 'react'

function useLazyMount<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') { setVisible(true); return }
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.1, rootMargin: '200px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, visible }
}

/** شارت مصغّر مضمّن داخل بطاقة الصفقة مباشرة (زي شارت تلقرام) — يتحمّل بس
 * لمّا يوصل النظر له (IntersectionObserver)، عشان صفحة فيها عشرات الصفقات
 * ما تشغّل عشرات شارتات لايف بنفس الوقت. */
export default function TradeChart({
  symbol, entry, tp, sl, side, status = 'OPEN', closePrice, height = 200,
}: {
  symbol: string; entry: number; tp: number; sl: number; side: string
  status?: string; closePrice?: number; height?: number
}) {
  const { ref, visible } = useLazyMount<HTMLDivElement>()
  const chartRef = useRef<HTMLDivElement>(null)
  const curLineRef = useRef<any>(null)
  const [loaded, setLoaded] = useState(false)
  const isClosed = status === 'WIN' || status === 'LOSS'

  useEffect(() => {
    if (!visible || !chartRef.current) return
    let chart: any
    let resizeObs: ResizeObserver | null = null
    let cancelled = false

    const init = async () => {
      const { createChart, CandlestickSeries, LineStyle } = await import('lightweight-charts')
      if (cancelled || !chartRef.current) return
      chart = createChart(chartRef.current, {
        width: chartRef.current.clientWidth,
        height,
        layout: { background: { color: 'transparent' }, textColor: '#9ca3af', fontSize: 10 },
        grid: { vertLines: { color: 'rgba(255,255,255,0.03)' }, horzLines: { color: 'rgba(255,255,255,0.03)' } },
        crosshair: { mode: 1 },
        rightPriceScale: { borderColor: 'rgba(255,255,255,0.08)' },
        timeScale: { borderColor: 'rgba(255,255,255,0.08)', timeVisible: true },
      })

      // نتابع عرض الحاوية فعلياً بدل الاعتماد على قراءة clientWidth مرة وحدة
      // عند الإنشاء — بطاقات الإشارات تترسم داخل تخطيط flex/grid وقد يكون
      // العرض الحقيقي غير مستقر بعد باللحظة اللي يتنشئ فيها الشارت
      resizeObs = new ResizeObserver(entries => {
        const w = entries[0]?.contentRect?.width
        if (w && w > 0) chart.applyOptions({ width: Math.floor(w) })
      })
      resizeObs.observe(chartRef.current)

      const series = chart.addSeries(CandlestickSeries, {
        upColor: '#00e664', downColor: '#ff5555',
        borderUpColor: '#00e664', borderDownColor: '#ff5555',
        wickUpColor: '#00e664', wickDownColor: '#ff5555',
      })
      try {
        const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=100`)
        const data = await res.json()
        if (cancelled) return
        const candles = data.map((d: any) => ({
          time: d[0] / 1000, open: parseFloat(d[1]), high: parseFloat(d[2]), low: parseFloat(d[3]), close: parseFloat(d[4]),
        }))
        series.setData(candles)
        const lastClose = candles[candles.length - 1]?.close

        if (entry > 0) series.createPriceLine({ price: entry, color: '#00d4ff', lineWidth: 1, lineStyle: LineStyle.Dashed, title: 'Entry' })
        if (tp > 0) series.createPriceLine({ price: tp, color: '#00e664', lineWidth: 1, lineStyle: LineStyle.Dashed, title: 'TP' })
        if (sl > 0) series.createPriceLine({ price: sl, color: '#ff5555', lineWidth: 1, lineStyle: LineStyle.Dashed, title: 'SL' })
        if (isClosed && closePrice) {
          series.createPriceLine({ price: closePrice, color: '#fbbf24', lineWidth: 1, lineStyle: LineStyle.Solid, title: 'Close' })
        } else if (lastClose) {
          curLineRef.current = series.createPriceLine({ price: lastClose, color: '#fbbf24', lineWidth: 1, lineStyle: LineStyle.Solid, title: 'Now' })
        }
        chart.timeScale().fitContent()
        setLoaded(true)
      } catch {}
    }

    init()
    return () => { cancelled = true; resizeObs?.disconnect(); if (chart) chart.remove() }
  }, [visible, symbol, entry, tp, sl, isClosed, closePrice, height])

  // تحديث لايف بسيط — الصفقات المفتوحة بس، كل 10 ثواني
  useEffect(() => {
    if (!visible || isClosed) return
    const poll = async () => {
      try {
        const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`)
        const d = await res.json()
        const p = parseFloat(d.price)
        if (isFinite(p) && p > 0) curLineRef.current?.applyOptions({ price: p })
      } catch {}
    }
    const iv = setInterval(poll, 10000)
    return () => clearInterval(iv)
  }, [visible, isClosed, symbol])

  return (
    <div ref={ref} style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)', minHeight: visible ? height : 40 }}>
      {visible && !loaded && (
        <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '11px' }}>···</div>
      )}
      <div ref={chartRef} style={{ width: '100%', display: loaded ? 'block' : 'none' }} />
    </div>
  )
}
