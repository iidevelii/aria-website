'use client'
import { useEffect, useRef, useState } from 'react'
import { useLang } from './layout'

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

// دالة عشوائية زائفة حتمية — نفس النتيجة بالسيرفر والمتصفح (بدون Math.random)
function noise(i: number) {
  const x = Math.sin(i * 78.233) * 43758.5453
  return x - Math.floor(x)
}

const TICKERS = ['BTC','ETH','SOL','XRP','DOGE','ADA','AVAX','LINK','LTC','BNB','DOT','MATIC','TRX','SHIB','UNI','ATOM','XLM','ETC','FIL','APT','NEAR','ARB','OP','SUI','INJ','RNDR','TIA','SEI','PEPE','WIF']

/** قسم "من الفوضى إلى الفرصة" — شبكة عملات باهتة تتلاشى تدريجياً على الكشف،
 * تاركة بطاقة فرصة واحدة واضحة بالمنتصف. عناصر ثابتة (deterministic) لتفادي
 * أي اختلاف سيرفر/متصفح، وحركة opacity/transform فقط. */
export default function ChaosToOpportunity() {
  const { t } = useLang()
  const { ref, revealed } = useScrollReveal<HTMLDivElement>()

  return (
    <section className="section">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <div className="section-eyebrow" style={{ textAlign: 'center' }}>{t('الفلترة الذكية', 'Smart filtering')}</div>
          <h2 className="section-title" style={{ textAlign: 'center' }}>{t('من مئات العملات، فرصة واحدة واضحة', 'From hundreds of coins, one clear opportunity')}</h2>
          <p className="section-sub" style={{ textAlign: 'center', margin: '0 auto' }}>
            {t('البوت يفحص السوق كامل باستمرار، ويستبعد كل شي غير مطابق لشروطك، إلى أن تبقى فرصة واحدة تستاهل انتباهك.', 'The bot continuously scans the whole market and rules out everything that doesn\'t match your criteria, until one opportunity worth your attention remains.')}
          </p>
        </div>

        <div ref={ref} style={{ position: 'relative', minHeight: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* شبكة العملات الباهتة */}
          <div style={{
            position: 'absolute', inset: 0, display: 'grid',
            gridTemplateColumns: 'repeat(10, 1fr)', gap: '8px', padding: '8px',
            opacity: revealed ? 0.22 : 0.55, transition: 'opacity 1.2s ease 0.2s',
          }}>
            {TICKERS.map((sym, i) => (
              <div key={i} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', color: noise(i) > 0.5 ? 'var(--red)' : 'var(--green)', fontFamily: 'var(--mono)',
                opacity: revealed ? 0.5 : 1,
                transform: revealed ? `scale(0.9)` : 'scale(1)',
                transition: `opacity 0.8s ease ${0.3 + (i % 10) * 0.03}s, transform 0.8s ease ${0.3 + (i % 10) * 0.03}s`,
              }}>
                <span style={{ color: 'var(--muted)', fontWeight: 700 }}>{sym}</span>
                <span>{noise(i) > 0.5 ? '-' : '+'}{(noise(i + 50) * 9 + 0.5).toFixed(1)}%</span>
              </div>
            ))}
          </div>

          {/* بطاقة الفرصة المختارة */}
          <div className="signal-card" style={{
            position: 'relative', zIndex: 1, maxWidth: '340px', width: '100%',
            background: 'var(--surface)', boxShadow: revealed ? 'var(--shadow-card-lg), var(--glow-cyan)' : 'none',
            opacity: revealed ? 1 : 0, transform: revealed ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(16px)',
            transition: 'opacity 0.7s ease 0.6s, transform 0.7s ease 0.6s, box-shadow 0.7s ease 0.6s',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <span style={{ fontWeight: 900, fontSize: '17px' }}>SOL/USDT</span>
                <span className="pill-long">LONG</span>
                <span className="pill-type">FUTURES</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '9px', color: 'var(--muted)', textTransform: 'uppercase' }}>Score</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--cyan)', lineHeight: 1 }}>86</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '12px' }}>
              <div className="price-box">
                <div style={{ fontSize: '9px', color: 'var(--muted)', marginBottom: '4px' }}>{t('دخول', 'Entry')}</div>
                <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: '13px' }}>$162.40</div>
              </div>
              <div style={{ background: 'rgba(34,208,110,0.06)', border: '1px solid rgba(34,208,110,0.16)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '9px', color: 'var(--green)', marginBottom: '4px' }}>{t('هدف', 'Target')}</div>
                <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: '13px', color: 'var(--green)' }}>$186.50</div>
              </div>
              <div style={{ background: 'rgba(240,64,96,0.06)', border: '1px solid rgba(240,64,96,0.16)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '9px', color: 'var(--red)', marginBottom: '4px' }}>{t('وقف', 'Stop')}</div>
                <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: '13px', color: 'var(--red)' }}>$150.00</div>
              </div>
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--muted)', display: 'flex', justifyContent: 'space-between' }}>
              <span>{t('الاستراتيجية', 'Strategy')}: SMC_MTF</span>
              <span>R/R 1:2.1</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
