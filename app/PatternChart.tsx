'use client'
import { useEffect, useRef, useState } from 'react'
import { fetchKlines } from './lib/klines'

// نفس ملاحظة TradeChart.tsx -- متغيرات CSS ما تنحل جوا سياق الكانفاس،
// لازم قيم hex حقيقية.
const CHART_GREEN = '#22d06e'
const CHART_RED = '#f04060'
const CHART_MUTED = '#5a6478'
const CHART_PURPLE = '#8b5cf6'

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

export type OverlayLine = { time: number; price: number }
export type Overlay = { lines: OverlayLine[][]; markerTime?: number; bullish: boolean | null } | null

/** شارت شموع كامل لبطاقة السكانر -- يرسم النموذج المختار فعلياً فوق
 * الشموع (خط/خطوط لكل نموذج، أو سهم لحظة Pump/Dump)، بدل sparkline
 * مصغّر بلا معنى بصري. نفس نمط TradeChart.tsx (lazy mount + lightweight-charts)
 * لكن بدون خطوط دخول/هدف/وقف -- التركيز هنا على هندسة النموذج نفسه. */
export default function PatternChart({
  symbol, timeframe, overlay, height = 180, market = 'SPOT',
}: {
  symbol: string; timeframe: string; overlay: Overlay; height?: number; market?: string
}) {
  const { ref, visible } = useLazyMount<HTMLDivElement>()
  const chartRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!visible || !chartRef.current) return
    let chart: any
    let resizeObs: ResizeObserver | null = null
    let cancelled = false

    const init = async () => {
      const { createChart, CandlestickSeries, LineSeries, LineStyle, createSeriesMarkers } = await import('lightweight-charts')
      if (cancelled || !chartRef.current) return
      chart = createChart(chartRef.current, {
        width: chartRef.current.clientWidth,
        height,
        layout: { background: { color: 'transparent' }, textColor: CHART_MUTED, fontSize: 10 },
        grid: { vertLines: { color: 'rgba(255,255,255,0.03)' }, horzLines: { color: 'rgba(255,255,255,0.03)' } },
        crosshair: { mode: 1 },
        rightPriceScale: { borderColor: 'rgba(255,255,255,0.08)' },
        timeScale: { borderColor: 'rgba(255,255,255,0.08)', timeVisible: true, rightOffset: 4 },
      })

      resizeObs = new ResizeObserver(entries => {
        const w = entries[0]?.contentRect?.width
        if (w && w > 0) chart.applyOptions({ width: Math.floor(w) })
      })
      resizeObs.observe(chartRef.current)

      try {
        // limit=150 يطابق نطاق المسح نفسه (scan() بصفحة السكانر يجيب 150
        // شمعة) -- يضمن تغطية أعمق فحص (كوب وعروة، لوك باك 60 شمعة).
        // market لازم يطابق مصدر التطابق الفعلي -- رموز فيوتشر كثيرة
        // (زي 1000SHIBUSDT) أصلاً مو موجودة بالسبوت، طلبها كسبوت يرجّع
        // خطأ Binance بدون ترويسة CORS (يظهر كـ"CORS policy" مضلّل
        // بالمتصفح، السبب الحقيقي رمز غير موجود بهالسوق -- اكتُشف من
        // مطابقات سكانر كامل السوق الفيوتشر، 2026-08-22).
        const candles = await fetchKlines(symbol, timeframe, 150, market)
        if (cancelled || candles.length === 0) return

        const refPrice = candles[candles.length - 1]?.close || 1
        const pricePrecision = refPrice >= 100 ? 2 : refPrice >= 1 ? 4 : refPrice >= 0.01 ? 6 : 8
        const priceMinMove = 1 / Math.pow(10, pricePrecision)

        const series = chart.addSeries(CandlestickSeries, {
          upColor: CHART_GREEN, downColor: CHART_RED,
          borderUpColor: CHART_GREEN, borderDownColor: CHART_RED,
          wickUpColor: CHART_GREEN, wickDownColor: CHART_RED,
          priceLineVisible: false, lastValueVisible: false,
          priceFormat: { type: 'price', precision: pricePrecision, minMove: priceMinMove },
        })
        series.setData(candles)

        if (overlay) {
          const lineColor = overlay.bullish === true ? CHART_GREEN : overlay.bullish === false ? CHART_RED : CHART_PURPLE
          for (const line of overlay.lines) {
            if (line.length < 2) continue
            const ls = chart.addSeries(LineSeries, {
              color: lineColor, lineWidth: 2, lineStyle: LineStyle.Solid,
              priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false,
            })
            ls.setData(line.map(p => ({ time: p.time as any, value: p.price })))
          }
          if (overlay.markerTime != null) {
            createSeriesMarkers(series, [{
              time: overlay.markerTime as any,
              position: overlay.bullish ? 'belowBar' : 'aboveBar',
              shape: overlay.bullish ? 'arrowUp' : 'arrowDown',
              color: overlay.bullish ? CHART_GREEN : CHART_RED,
              text: overlay.bullish ? 'Pump' : 'Dump',
            }])
          }
        }

        chart.timeScale().fitContent()
        setLoaded(true)
      } catch {}
    }

    init()
    return () => { cancelled = true; resizeObs?.disconnect(); if (chart) chart.remove() }
  }, [visible, symbol, timeframe, overlay, height, market])

  return (
    <div ref={ref} style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)', minHeight: visible ? height : 40 }}>
      {visible && !loaded && (
        <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '11px' }}>···</div>
      )}
      <div ref={chartRef} style={{ width: '100%', display: loaded ? 'block' : 'none' }} />
    </div>
  )
}
