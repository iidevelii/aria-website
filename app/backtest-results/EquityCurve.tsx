'use client'
import { useEffect, useRef, useState } from 'react'
import { useLang } from '../layout'

type Point = { t: string; cum: number }

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

/** منحنى Equity حقيقي (مش وهمي) — مبني من تسلسل صفقات الباك تست الزمني الفعلي.
 * التصميم: بطاقة "مؤطرة" فوق خلفية متوهجة، تنكشف بحركة scroll-reveal (باهتة/بعيدة
 * ثم تتضح داخل الإطار) — نفس فكرة hala.com بصرياً، بس بهوية DevelBot (توهج بدل صورة). */
export default function EquityCurve({ points, netPct, totalTrades, label }: {
  points: Point[]; netPct: number; totalTrades: number; label: string
}) {
  const { t } = useLang()
  const { ref, revealed } = useScrollReveal<HTMLDivElement>()
  if (!points || points.length < 2) return null

  // نقلّل عدد النقاط المرسومة لأداء أخف (نفس البيانات الحقيقية، بس بعينة أقل
  // كثافة — رسم 1000+ نقطة SVG بالكامل يبطّئ المتصفح بدون أي فرق بصري ملموس)
  const MAX_POINTS = 200
  const stride = Math.max(1, Math.ceil(points.length / MAX_POINTS))
  const sampled = points.filter((_, i) => i % stride === 0 || i === points.length - 1)

  const W = 1000, H = 320, PAD = 8
  const values = sampled.map(p => p.cum)
  const min = Math.min(0, ...values)
  const max = Math.max(...values)
  const range = (max - min) || 1
  const x = (i: number) => (i / (sampled.length - 1)) * (W - PAD * 2) + PAD
  const y = (v: number) => H - PAD - ((v - min) / range) * (H - PAD * 2)

  const linePath = sampled.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(2)} ${y(p.cum).toFixed(2)}`).join(' ')
  const areaPath = `${linePath} L ${x(sampled.length - 1).toFixed(2)} ${H - PAD} L ${x(0).toFixed(2)} ${H - PAD} Z`
  const zeroY = y(0)
  const positive = netPct >= 0

  return (
    <div ref={ref} style={{ position: 'relative', marginBottom: '24px' }}>
      {/* توهج خلفي — يمثّل "العمق البعيد" قبل الكشف */}
      <div style={{
        position: 'absolute', inset: '-16px', borderRadius: '32px', zIndex: 0,
        background: 'radial-gradient(600px circle at 20% 20%, rgba(0,196,239,0.14), transparent 60%), radial-gradient(600px circle at 80% 80%, rgba(124,58,237,0.14), transparent 60%)',
        opacity: revealed ? 1 : 0, transition: 'opacity 1.4s ease',
      }} />

      {/* الإطار — البطاقة اللي "تنكشف" فيها البيانات */}
      <div style={{
        position: 'relative', zIndex: 1,
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px',
        padding: '24px 24px 16px', overflow: 'hidden',
        opacity: revealed ? 1 : 0,
        transform: revealed ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(28px)',
        willChange: 'opacity, transform',
        transition: 'opacity 0.8s cubic-bezier(.16,1,.3,1), transform 0.8s cubic-bezier(.16,1,.3,1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
              {label}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
              {t(`منحنى الربح التراكمي: ${totalTrades} صفقة بالتسلسل الزمني الحقيقي`, `Cumulative equity curve: ${totalTrades} trades in real chronological order`)}
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: positive ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--mono)' }}>
            {positive ? '+' : ''}{netPct.toFixed(1)}%
          </div>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }} preserveAspectRatio="none">
          <defs>
            <linearGradient id="eqFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={positive ? '#22d06e' : '#f04060'} stopOpacity="0.35" />
              <stop offset="100%" stopColor={positive ? '#22d06e' : '#f04060'} stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* خط الصفر */}
          <line x1={PAD} y1={zeroY} x2={W - PAD} y2={zeroY} stroke="var(--border)" strokeWidth="1" strokeDasharray="4 4" />
          <path d={areaPath} fill="url(#eqFill)" style={{
            opacity: revealed ? 1 : 0, transition: 'opacity 1s ease 0.15s',
          }} />
          <path d={linePath} fill="none" stroke={positive ? 'var(--green)' : 'var(--red)'} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
            style={{
              opacity: revealed ? 1 : 0, transition: 'opacity 1s ease 0.15s',
            }} />
        </svg>

        <div style={{ fontSize: '11px', color: 'var(--dim)', marginTop: '4px' }}>
          {t('كل نقطة = إغلاق صفقة واحدة، مرتّبة حسب وقت الإغلاق الفعلي، مو أرقام تقديرية.', 'Each point = one trade close, ordered by real close time, not an illustrative estimate.')}
        </div>
      </div>
    </div>
  )
}
