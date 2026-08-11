'use client'
import { useEffect, useRef, useState } from 'react'
import { useLang } from './ClientShell'

function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [revealed, setRevealed] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') { setRevealed(true); return }
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setRevealed(true); obs.disconnect() }
    }, { threshold: 0.2 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, revealed }
}

// دالة عشوائية زائفة حتمية (pure function of i) — نفس النتيجة بالسيرفر والمتصفح
// (تفادي أي hydration mismatch لو استخدمنا Math.random() مباشرة أثناء الرندر)
function noise(i: number) {
  const x = Math.sin(i * 12.9898) * 43758.5453
  return (x - Math.floor(x)) * 2 - 1
}

const N = 46
const ENTRY_IDX = 16
const ENTRY = 101.55
const SL = 98.5
const TP = 112

function buildCandles() {
  const out: { o: number; c: number; h: number; l: number }[] = []
  let price = 100
  for (let i = 0; i < N; i++) {
    const trend = i < ENTRY_IDX ? 0.05 : 0.62
    const n = noise(i) * 1.5
    const o = price
    const c = o + trend + n
    const h = Math.max(o, c) + Math.abs(noise(i + 100)) * 0.7
    const l = Math.min(o, c) - Math.abs(noise(i + 200)) * 0.7
    out.push({ o, c, h, l })
    price = c
  }
  return out
}

const CANDLES = buildCandles()
const TP_IDX = CANDLES.findIndex(k => k.c >= TP)

/** شارت شموع حي (SVG) يوضّح دخول/هدف/وقف صفقة نموذجية — الشموع "ترسم" نفسها
 * بحركة scroll-reveal، ونقطة السعر الحالي تنبض باستمرار (نفس نمط live-dot
 * بالموقع). بيانات توضيحية ثابتة (deterministic) مو Live فعلي — موضّح بالتسمية. */
export default function LiveChartDemo() {
  const { t } = useLang()
  const { ref, revealed } = useScrollReveal<HTMLDivElement>()

  const W = 1000, H = 440, PAD_X = 16, PAD_Y = 28
  const allLows = CANDLES.map(k => k.l).concat([SL])
  const allHighs = CANDLES.map(k => k.h).concat([TP])
  const min = Math.min(...allLows) - 1
  const max = Math.max(...allHighs) + 1
  const range = max - min

  const slot = (W - PAD_X * 2) / N
  const bodyW = slot * 0.55
  const x = (i: number) => PAD_X + i * slot + slot / 2
  const y = (v: number) => PAD_Y + (1 - (v - min) / range) * (H - PAD_Y * 2)

  const last = CANDLES[CANDLES.length - 1]
  const tpPct = ((TP - ENTRY) / ENTRY * 100).toFixed(1)
  const slPct = ((ENTRY - SL) / ENTRY * 100).toFixed(1)

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div style={{
        position: 'absolute', inset: '-40px', borderRadius: '32px', zIndex: 0,
        background: 'radial-gradient(600px circle at 15% 15%, rgba(0,196,239,0.14), transparent 60%), radial-gradient(600px circle at 85% 85%, rgba(0,230,100,0.12), transparent 60%)',
        opacity: revealed ? 1 : 0, transition: 'opacity 1.4s ease',
      }} />

      <div style={{
        position: 'relative', zIndex: 1, background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '20px', padding: '20px 20px 14px', overflow: 'hidden',
        opacity: revealed ? 1 : 0, transform: revealed ? 'scale(1) translateY(0)' : 'scale(0.97) translateY(20px)',
        transition: 'opacity 0.8s cubic-bezier(.16,1,.3,1), transform 0.8s cubic-bezier(.16,1,.3,1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {t('كيف تشتغل الإشارة', 'How a signal plays out')} · SOL/USDT
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="live-dot" />
            <span style={{ fontSize: '11px', color: 'var(--green)' }}>{t('توضيحي', 'illustrative')}</span>
          </div>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }} preserveAspectRatio="none">
          {/* منطقة الربح (بين الدخول والهدف) ومنطقة الخطر (بين الدخول والوقف) */}
          <rect x={PAD_X} y={y(TP)} width={W - PAD_X * 2} height={y(ENTRY) - y(TP)} fill="var(--green)" opacity={revealed ? 0.07 : 0} style={{ transition: 'opacity 1s ease 0.3s' }} />
          <rect x={PAD_X} y={y(ENTRY)} width={W - PAD_X * 2} height={y(SL) - y(ENTRY)} fill="var(--red)" opacity={revealed ? 0.06 : 0} style={{ transition: 'opacity 1s ease 0.3s' }} />

          {/* خطوط الدخول/الهدف/الوقف */}
          {[
            { v: ENTRY, color: 'var(--cyan)', label: `${t('دخول', 'Entry')} $${ENTRY.toFixed(2)}` },
            { v: TP, color: 'var(--green)', label: `${t('هدف', 'Target')} $${TP.toFixed(2)} (+${tpPct}%)` },
            { v: SL, color: 'var(--red)', label: `${t('وقف', 'Stop')} $${SL.toFixed(2)} (-${slPct}%)` },
          ].map((ln, i) => (
            <g key={i} style={{ opacity: revealed ? 1 : 0, transition: `opacity 0.6s ease ${0.4 + i * 0.1}s` }}>
              <line x1={PAD_X} y1={y(ln.v)} x2={W - PAD_X} y2={y(ln.v)} stroke={ln.color} strokeWidth="1.5" strokeDasharray="5 5" opacity="0.7" />
              <text x={PAD_X + 4} y={y(ln.v) - 5} fill={ln.color} fontSize="13" fontWeight="700" fontFamily="var(--mono)"
                style={{ direction: 'ltr' }} textAnchor="start">{ln.label}</text>
            </g>
          ))}

          {/* الشموع — تُرسم شمعة بعد شمعة (تأخير متدرج opacity/scaleY فقط، رخيص حتى مع 46 عنصر) */}
          {CANDLES.map((k, i) => {
            const bull = k.c >= k.o
            const color = bull ? 'var(--green)' : 'var(--red)'
            const bodyTop = y(Math.max(k.o, k.c))
            const bodyH = Math.max(2, Math.abs(y(k.o) - y(k.c)))
            const delay = 0.15 + i * 0.035
            return (
              <g key={i} style={{
                opacity: revealed ? 1 : 0,
                transform: revealed ? 'scaleY(1)' : 'scaleY(0.4)',
                transformOrigin: `${x(i)}px ${y(min)}px`,
                transformBox: 'fill-box',
                transition: `opacity 0.35s ease ${delay}s, transform 0.35s ease ${delay}s`,
              }}>
                <line x1={x(i)} y1={y(k.h)} x2={x(i)} y2={y(k.l)} stroke={color} strokeWidth="1.5" opacity="0.85" />
                <rect x={x(i) - bodyW / 2} y={bodyTop} width={bodyW} height={bodyH} fill={color} opacity="0.9" rx="1" />
              </g>
            )
          })}

          {/* شعاع مسح يتحرك من اليسار لليمين باستمرار بعد اكتمال الرسم (CSS transform فقط) */}
          <g style={{ opacity: revealed ? 1 : 0, transition: `opacity 0.5s ease ${0.15 + N * 0.035 + 0.3}s` }}>
            <rect className="chart-scan-beam" x={PAD_X} y={PAD_Y} width="40" height={H - PAD_Y * 2} fill="url(#scanGradient)" />
          </g>
          <defs>
            <linearGradient id="scanGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0" />
              <stop offset="50%" stopColor="var(--cyan)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* بادج "تحقق الهدف" عند أول شمعة تخترق TP */}
          {TP_IDX > 0 && (
            <g style={{ opacity: revealed ? 1 : 0, transition: 'opacity 0.6s ease 0.9s' }}>
              <text x={x(TP_IDX)} y={y(CANDLES[TP_IDX].h) - 14} fill="var(--green)" fontSize="13" fontWeight="800" textAnchor="middle">
                {t('✓ تحقق الهدف', '✓ Target hit')}
              </text>
            </g>
          )}

          {/* نقطة السعر الحالي — تنبض باستمرار (CSS transform/opacity فقط، أرخص من تحريك r/opacity كخاصية SVG) */}
          <g style={{ opacity: revealed ? 1 : 0, transition: 'opacity 0.5s ease 1s' }}>
            <circle cx={x(N - 1)} cy={y(last.c)} r="6" fill="var(--cyan)" className="live-price-dot" />
          </g>
        </svg>

        <div style={{ fontSize: '11px', color: 'var(--dim)', marginTop: '2px' }}>
          {t('مثال توضيحي لآلية عمل إشارة (دخول → هدف/وقف)، مو بيانات سعر حقيقية.', 'An illustrative example of how a signal plays out (entry → target/stop), not real price data.')}
        </div>
      </div>

      <style>{`
        @keyframes livePriceDotPulse { 0%,100% { transform: scale(1); opacity: 1 } 50% { transform: scale(1.5); opacity: 0.5 } }
        .live-price-dot { transform-box: fill-box; transform-origin: center; animation: livePriceDotPulse 2s ease-in-out infinite; }
        @keyframes chartScanBeam { 0% { transform: translateX(-40px); } 100% { transform: translateX(${W - PAD_X * 2}px); } }
        .chart-scan-beam { animation: chartScanBeam 5s linear infinite; }
      `}</style>
    </div>
  )
}
