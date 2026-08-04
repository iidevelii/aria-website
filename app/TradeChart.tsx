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
 * ما تشغّل عشرات شارتات لايف بنفس الوقت.
 *
 * ثلاث خطوط بس: دخول (أزرق)، هدف (أخضر)، وقف (أحمر) — بدون خط سعر حالي،
 * والدخول عليه كمان سهم شراء/بيع بالإضافة لخطه. */
export default function TradeChart({
  symbol, entry, tp, sl, side, status = 'OPEN', closePrice, createdAt, height = 200, market = 'FUTURES',
}: {
  symbol: string; entry: number; tp: number; sl: number; side: string
  status?: string; closePrice?: number; createdAt?: string; height?: number; market?: string
}) {
  const { ref, visible } = useLazyMount<HTMLDivElement>()
  const chartRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)
  const isClosed = status === 'WIN' || status === 'LOSS'
  const isLong = side === 'LONG'

  useEffect(() => {
    if (!visible || !chartRef.current) return
    let chart: any
    let resizeObs: ResizeObserver | null = null
    let cancelled = false

    const init = async () => {
      const { createChart, CandlestickSeries, LineStyle, createSeriesMarkers } = await import('lightweight-charts')
      if (cancelled || !chartRef.current) return
      chart = createChart(chartRef.current, {
        width: chartRef.current.clientWidth,
        height,
        layout: { background: { color: 'transparent' }, textColor: '#9ca3af', fontSize: 10 },
        grid: { vertLines: { color: 'rgba(255,255,255,0.03)' }, horzLines: { color: 'rgba(255,255,255,0.03)' } },
        crosshair: { mode: 1 },
        rightPriceScale: { borderColor: 'rgba(255,255,255,0.08)' },
        timeScale: { borderColor: 'rgba(255,255,255,0.08)', timeVisible: true, rightOffset: 6 },
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
        priceLineVisible: false, lastValueVisible: false,
      })
      // نوسّع نطاق المقياس يدوياً عشان الهدف يبقى ظاهر حتى لو بعيد عن مدى
      // الشموع الحالي (خط/marker وحدهم ما يوسّعون النطاق بشكل موثوق دايماً)
      series.applyOptions({
        autoscaleInfoProvider: (original: () => any) => {
          const res = original()
          if (res?.priceRange) {
            const vals = [entry, tp, sl].filter(v => v > 0)
            res.priceRange.minValue = Math.min(res.priceRange.minValue, ...vals)
            res.priceRange.maxValue = Math.max(res.priceRange.maxValue, ...vals)
          }
          return res
        },
      } as any)
      try {
        // فيوتشر يجيب من /fapi — رموز كثيرة (زي RIVERUSDT) موجودة بالفيوتشر بس
        // وما تشتغل عبر endpoint السبوت (يرجع "Invalid symbol")
        const base = market === 'FUTURES' ? 'https://fapi.binance.com/fapi/v1' : 'https://api.binance.com/api/v3'
        const res = await fetch(`${base}/klines?symbol=${symbol}&interval=15m&limit=150`)
        const data = await res.json()
        if (cancelled) return
        const candles = data.map((d: any) => ({
          time: d[0] / 1000, open: parseFloat(d[1]), high: parseFloat(d[2]), low: parseFloat(d[3]), close: parseFloat(d[4]),
        }))
        series.setData(candles)

        // ثلاث خطوط: دخول أزرق، هدف أخضر، وقف أحمر
        if (entry > 0) series.createPriceLine({ price: entry, color: '#00d4ff', lineWidth: 1, lineStyle: LineStyle.Dashed, title: 'Entry' })
        if (tp > 0) series.createPriceLine({ price: tp, color: '#00e664', lineWidth: 1, lineStyle: LineStyle.Dashed, title: 'TP' })
        if (sl > 0) series.createPriceLine({ price: sl, color: '#ff5555', lineWidth: 1, lineStyle: LineStyle.Dashed, title: 'SL' })

        // أقرب شمعة لوقت فتح الصفقة (لو موجود)، وإلا أول شمعة بالمدى
        let entryTime = candles[0]?.time
        if (createdAt) {
          const target = new Date(createdAt.endsWith('Z') || createdAt.includes('+') ? createdAt : createdAt + 'Z').getTime() / 1000
          if (!isNaN(target)) {
            let best = candles[0], bestDiff = Infinity
            for (const c of candles) {
              const diff = Math.abs(c.time - target)
              if (diff < bestDiff) { bestDiff = diff; best = c }
            }
            entryTime = best.time
          }
        }
        const markers: any[] = []
        if (entryTime != null) {
          markers.push({
            time: entryTime, position: isLong ? 'belowBar' : 'aboveBar',
            shape: isLong ? 'arrowUp' : 'arrowDown', color: isLong ? '#00e664' : '#ff5555',
            text: isLong ? 'شراء' : 'بيع',
          })
        }
        if (markers.length) createSeriesMarkers(series, markers)

        chart.timeScale().fitContent()
        setLoaded(true)
      } catch {}
    }

    init()
    return () => { cancelled = true; resizeObs?.disconnect(); if (chart) chart.remove() }
  }, [visible, symbol, entry, tp, sl, isClosed, closePrice, createdAt, isLong, height])

  return (
    <div ref={ref} style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)', minHeight: visible ? height : 40 }}>
      {visible && !loaded && (
        <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '11px' }}>···</div>
      )}
      <div ref={chartRef} style={{ width: '100%', display: loaded ? 'block' : 'none' }} />
    </div>
  )
}
