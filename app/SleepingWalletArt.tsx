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
    }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, revealed }
}

const BAL_START = 4200
const BAL_END = 6850

/** رسمة SVG/CSS (مو صورة فوتوغرافية) — شخص نايم ومحفظته تكبر — توضّح فكرة
 * "الفلوس تشتغل وأنت نايم" بهوية الموقع البصرية (خلفية داكنة + توهج سماوي/بنفسجي). */
export default function SleepingWalletArt() {
  const { t } = useLang()
  const { ref, revealed } = useScrollReveal<HTMLDivElement>()
  const [bal, setBal] = useState(BAL_START)

  useEffect(() => {
    if (!revealed) return
    const start = performance.now()
    const dur = 1800
    let raf: number
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur)
      const eased = 1 - Math.pow(1 - p, 3)
      setBal(Math.round(BAL_START + (BAL_END - BAL_START) * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [revealed])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div style={{
        position: 'absolute', inset: '-40px', borderRadius: '32px', zIndex: 0,
        background: 'radial-gradient(600px circle at 25% 20%, rgba(124,58,237,0.16), transparent 60%), radial-gradient(600px circle at 80% 75%, rgba(0,196,239,0.12), transparent 60%)',
        opacity: revealed ? 1 : 0, transition: 'opacity 1.4s ease',
      }} />

      <div style={{
        position: 'relative', zIndex: 1, background: 'linear-gradient(180deg, var(--bg) 0%, #10131d 100%)',
        border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden',
        opacity: revealed ? 1 : 0, transform: revealed ? 'scale(1) translateY(0)' : 'scale(0.97) translateY(20px)',
        transition: 'opacity 0.8s cubic-bezier(.16,1,.3,1), transform 0.8s cubic-bezier(.16,1,.3,1)',
        minHeight: '340px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}>
        <svg viewBox="0 0 400 260" style={{ width: '100%', height: 'auto', display: 'block', position: 'absolute', inset: 0 }} preserveAspectRatio="xMidYMid slice">
          {/* نجوم — CSS opacity keyframe فقط (رخيصة)، بدون SMIL */}
          {revealed && [[30,30,1.4],[340,40,1.3],[370,110,1],[130,25,1],[220,20,0.8]].map(([cx,cy,r],i)=>(
            <circle key={i} cx={cx} cy={cy} r={r as number} fill="#ffffff" className="twinkle-star" style={{ animationDelay: `${i*0.4}s` }} />
          ))}
          {/* هلال */}
          <circle cx="345" cy="42" r="18" fill="#f4e9c9" opacity="0.9" />
          <circle cx="352" cy="36" r="16" fill="var(--bg)" />

          {/* السرير */}
          <rect x="60" y="196" width="230" height="14" rx="6" fill="var(--surface-2)" />
          <rect x="70" y="150" width="60" height="52" rx="14" fill="var(--surface-2)" />
          {/* اللحاف */}
          <path d="M 95 170 Q 190 150 260 178 Q 270 195 260 200 L 100 200 Q 90 185 95 170 Z" fill="url(#blanket)" />
          <defs>
            <linearGradient id="blanket" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#00c4ef" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.55" />
            </linearGradient>
          </defs>
          {/* الرأس */}
          <circle cx="108" cy="168" r="15" fill="#2a3348" />

          {/* Zzz — CSS transform/opacity keyframe فقط */}
          {revealed && [0,1].map(i => (
            <text key={i} x={130 + i*14} y={148 - i*16} fontSize={16 - i*2} fill="#00c4ef" fontWeight="800"
              className="zzz-float" style={{ transformBox: 'fill-box', transformOrigin: 'center', animationDelay: `${i*0.6}s` }}>
              Z
            </text>
          ))}

          {/* عملتين طايرتين نحو المحفظة — CSS transform/opacity keyframe فقط */}
          {revealed && [0,1].map(i => (
            <g key={i} className="coin-float" style={{ transformBox: 'fill-box', transformOrigin: 'center', animationDelay: `${i*0.7}s` }}>
              <circle cx={230 + i*35} cy={188} r="5" fill="#ffd166" />
            </g>
          ))}
        </svg>

        {/* بطاقة المحفظة العائمة */}
        <div style={{
          position: 'relative', margin: '0 20px 20px auto', maxWidth: '190px',
          background: 'rgba(16,19,29,0.94)', border: '1px solid rgba(0,196,239,0.28)',
          borderRadius: '14px', padding: '14px 16px', boxShadow: '0 8px 30px rgba(0,196,239,0.15)',
          opacity: revealed ? 1 : 0, transform: revealed ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.7s ease 0.5s, transform 0.7s ease 0.5s',
        }}>
          <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
            {t('محفظتك', 'Your balance')}
          </div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#fff', fontFamily: 'var(--mono)' }}>${bal.toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: 'var(--green)', fontWeight: 700, marginTop: '2px' }}>▲ +{(((BAL_END-BAL_START)/BAL_START)*100).toFixed(0)}%</div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '14px' }}>
        <div style={{ fontWeight: 800, fontSize: '16px', marginBottom: '4px' }}>{t('الفلوس تشتغل وأنت نايم 😴', 'Your money works while you sleep 😴')}</div>
        <div style={{ color: 'var(--muted)', fontSize: '13px' }}>{t('البوت يراقب السوق 24/7 ويرسل لك الفرص، حتى وأنت مو أونلاين.', 'The bot watches the market 24/7 and sends you opportunities, even while you\'re offline.')}</div>
      </div>

      <style>{`
        @keyframes twinkleStar { 0%,100% { opacity: 0.15 } 50% { opacity: 0.7 } }
        .twinkle-star { animation: twinkleStar 3s ease-in-out infinite; }
        @keyframes zzzFloat { 0% { transform: translate(0,0); opacity: 0 } 20% { opacity: 0.9 } 100% { transform: translate(6px,-22px); opacity: 0 } }
        .zzz-float { animation: zzzFloat 2.6s ease-in-out infinite; }
        @keyframes coinFloat { 0% { transform: translate(0,0); opacity: 0.9 } 70% { opacity: 0.7 } 100% { transform: translate(70px,-120px); opacity: 0 } }
        .coin-float { animation: coinFloat 2.4s ease-out infinite; }
      `}</style>
    </div>
  )
}
