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
    }, { threshold: 0.15 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, revealed }
}

/** قسم "كيف يعمل" — 5 مراحل من بيانات السوق حتى إرسال الإشارة، بحركة
 * scroll-reveal متدرجة (opacity/transform فقط، بدون blur/SMIL ثقيل). */
export default function HowItWorks() {
  const { t } = useLang()
  const { ref, revealed } = useScrollReveal<HTMLDivElement>()

  const stages = [
    { icon: '📡', color: '#00c4ef', title: t('جمع بيانات السوق', 'Market data collection'), desc: t('سحب أسعار وحجوم أكثر من 100 عملة من Binance لحظياً.', 'Pulling live prices and volume for 100+ coins from Binance.') },
    { icon: '🧹', color: '#22d06e', title: t('فلترة العملات', 'Coin filtering'), desc: t('استبعاد العملات ضعيفة السيولة أو غير المستقرة تلقائياً.', 'Automatically excluding low-liquidity or unstable coins.') },
    { icon: '📐', color: '#7c3aed', title: t('التحليل الفني وSMC', 'Technical & SMC analysis'), desc: t('فحص المؤشرات، الأنماط، وهيكل السوق (Smart Money Concepts).', 'Checking indicators, patterns, and market structure (Smart Money Concepts).') },
    { icon: '🎯', color: '#f59e0b', title: t('حساب Score', 'Scoring the opportunity'), desc: t('تقييم كل إشارة محتملة برقم واحد يلخّص قوتها.', 'Rating every candidate signal with one number summarizing its strength.') },
    { icon: '📬', color: 'var(--green)', title: t('إرسال الإشارة والمتابعة', 'Signal delivery & tracking'), desc: t('وصول الإشارة فوراً على الموقع وتلقرام، مع متابعة النتيجة حتى الإغلاق.', 'The signal reaches you instantly on the site and Telegram, tracked through to close.') },
  ]

  return (
    <section className="section" id="how-it-works" style={{ scrollMarginTop: '90px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '48px', textAlign: 'center' }}>
          <div className="section-eyebrow" style={{ textAlign: 'center' }}>{t('كيف يعمل', 'How it works')}</div>
          <h2 className="section-title" style={{ textAlign: 'center' }}>{t('من بيانات السوق إلى إشارة جاهزة', 'From raw market data to a ready signal')}</h2>
        </div>

        <div ref={ref} className="how-it-works-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px', position: 'relative' }}>
          <div className="how-it-works-line" style={{ position: 'absolute', top: '27px', insetInlineStart: '10%', insetInlineEnd: '10%', height: '2px', background: 'linear-gradient(90deg, #00c4ef, #22d06e, #7c3aed, #f59e0b, var(--green))', opacity: revealed ? 0.35 : 0, transition: 'opacity 1s ease 0.3s' }} />
          {stages.map((s, i) => (
            <div key={i} style={{
              position: 'relative', textAlign: 'center', padding: '0 8px',
              opacity: revealed ? 1 : 0, transform: revealed ? 'translateY(0)' : 'translateY(16px)',
              transition: `opacity 0.6s ease ${i * 0.12}s, transform 0.6s ease ${i * 0.12}s`,
            }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%', margin: '0 auto 16px',
                background: 'var(--surface)', border: `2px solid ${s.color}`, display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: '22px', position: 'relative', zIndex: 1,
                boxShadow: `0 0 24px ${s.color}33`,
              }}>{s.icon}</div>
              <div style={{ fontWeight: 800, fontSize: '13px', marginBottom: '6px' }}>{s.title}</div>
              <div style={{ color: 'var(--muted)', fontSize: '11.5px', lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .how-it-works-row { grid-template-columns: 1fr !important; gap: 28px !important; }
          .how-it-works-line { display: none; }
        }
      `}</style>
    </section>
  )
}
