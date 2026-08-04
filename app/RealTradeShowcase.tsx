'use client'
import { useLang } from './layout'

/* لقطات حقيقية من تلقرام (شارت + رسالة تحليل فعلية بنفس صياغة البوت) —
 * صفقة ربح، صفقة خسارة مع تحليل ليه ضرب الستوب، وتنبيه نمط — تُعرض هنا
 * كمميزات حقيقية للبوت، مو تصميم توضيحي. البيانات والأسعار كلها فعلية. */

function TgWindow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#0e1218', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: '#161b26', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '9px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #00c4ef, #6b1fff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '13px', flexShrink: 0 }}>D</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '12px' }}>DevelBot</div>
          <div style={{ fontSize: '10px', color: '#3d8b6e' }}>online</div>
        </div>
      </div>
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        {children}
      </div>
    </div>
  )
}

function TgPhoto({ src, alt }: { src: string; alt: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
      <img src={src} alt={alt} style={{ width: '100%', borderRadius: '12px 12px 12px 2px', display: 'block', border: '1px solid rgba(255,255,255,0.06)' }} />
    </div>
  )
}

function TgCaption({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
      <div style={{ background: '#1c2333', borderRadius: '12px 12px 12px 2px', padding: '10px 12px', maxWidth: '100%' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', lineHeight: 1.65, color: '#c9d1e0', whiteSpace: 'pre-wrap' }}>{text}</div>
      </div>
    </div>
  )
}

export default function RealTradeShowcase() {
  const { t } = useLang()

  const winText = t(
    `📊 تحليل ما بعد الصفقة — ADA/USDT
LONG سبوت | 🏆 ربح

🧠 سبب الدخول: اتجاه صاعد متفق عليه على الفريمين (4H:BULL_TREND|1H:BULL_TREND) — دخول عبر SMC MTF (SR)
⭐ Score: 85/100
⏱ مدة الصفقة حتى الإغلاق: 5س 40د

📍 سعر الإغلاق: 0.18
📈 السعر الآن: 0.1858 (+3.22%)

💡 السوق استمرت بنفس اتجاه التحليل.

⚠️ تحليل تعليمي، وليس دعوة لإعادة فتح الصفقة.`,
    `📊 Post-trade analysis — ADA/USDT
LONG SPOT | 🏆 Win

🧠 Why we entered: Bullish alignment across timeframes (4H:BULL_TREND|1H:BULL_TREND) — entered via SMC MTF (SR)
⭐ Score: 85/100
⏱ Trade duration to close: 5h 40m

📍 Close price: 0.18
📈 Price now: 0.1858 (+3.22%)

💡 The market continued in the analysis' direction.

⚠️ Educational analysis, not a call to re-enter the trade.`
  )

  const lossText = t(
    `📊 تحليل ما بعد الصفقة — ELSA/USDT
LONG فيوتشر | ⛔ وقف

🧠 سبب الدخول: اتجاه صاعد متفق عليه على الفريمين (2H:BULL_TREND|30M:BULL_TREND|Momentum-Turn) — دخول عبر Trend MTF (Channel Breakout+CMF)
⭐ Score: 85/100
⏱ مدة الصفقة حتى الإغلاق: 1س 2د

📍 سعر الإغلاق: 0.0527076
📈 السعر الآن: 0.0568 (+7.77%)

💡 السوق استمرت بنفس اتجاه التحليل — يعني قراءة الاتجاه كانت صحيحة رغم الوقف.

⚠️ تحليل تعليمي، وليس دعوة لإعادة فتح الصفقة.`,
    `📊 Post-trade analysis — ELSA/USDT
LONG FUTURES | ⛔ Stop

🧠 Why we entered: Bullish alignment across timeframes (2H:BULL_TREND|30M:BULL_TREND|Momentum-Turn) — entered via Trend MTF (Channel Breakout+CMF)
⭐ Score: 85/100
⏱ Trade duration to close: 1h 2m

📍 Close price: 0.0527076
📈 Price now: 0.0568 (+7.77%)

💡 The market continued in the analysis' direction — meaning the directional read was correct despite the stop.

⚠️ Educational analysis, not a call to re-enter the trade.`
  )

  const patternText = t(
    `📐 تنبيه نمط
قاع مزدوج

💱 العملة: EPICUSDT
⏱ الفريم: 15m
💰 السعر الحالي: 1.0518

القاعين: 0.9456 / 0.9432
خط الرقبة: 0.9797 (كسر صعودي ↑)

ℹ️ وصلك هذا التنبيه لأن EPICUSDT كوّنت نمط "قاع مزدوج" مؤكّد على فريم 15m.`,
    `📐 Pattern Alert
Double Bottom

💱 Pair: EPICUSDT
⏱ Timeframe: 15m
💰 Price: 1.0518

Troughs: 0.9456 / 0.9432
Neckline: 0.9797 (broke up ↑)

ℹ️ You received this because EPICUSDT confirmed a "Double Bottom" pattern on the 15m timeframe.`
  )

  const cards = [
    { badge: t('✅ صفقة رابحة حقيقية', '✅ Real winning trade'), badgeColor: '#22d06e', img: '/showcase/win-ada.png', alt: 'ADA/USDT win chart', text: winText },
    { badge: t('⛔ صفقة ضربت ستوب — وتحليل ليه', '⛔ Trade that hit stop — and why'), badgeColor: '#f04060', img: '/showcase/loss-elsa.png', alt: 'ELSA/USDT stop chart', text: lossText },
    { badge: t('📐 تنبيه نمط حقيقي', '📐 Real pattern alert'), badgeColor: '#7c3aed', img: '/showcase/pattern-epic.png', alt: 'EPICUSDT double bottom pattern chart', text: patternText },
  ]

  return (
    <section className="section">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '36px', textAlign: 'center' }}>
          <div className="section-eyebrow" style={{ textAlign: 'center' }}>{t('03 · نتائج حقيقية', '03 · Real results')}</div>
          <h2 className="section-title" style={{ textAlign: 'center' }}>{t('لقطات فعلية من تلقرام، بدون تجميل', 'Actual Telegram screenshots, no dressing up')}</h2>
          <p className="section-sub" style={{ textAlign: 'center', margin: '0 auto' }}>{t('صفقة وصلت هدفها، وصفقة ضربت وقف الخسارة مع تحليل صريح ليه صار كذا، وتنبيه نمط — كلها رسائل حقيقية وصلت لمشتركين فعليين.', 'A trade that hit its target, one that hit stop loss with an honest analysis of why, and a pattern alert — all real messages that reached real subscribers.')}</p>
        </div>
        <div className="showcase-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {cards.map((c, i) => (
            <div key={i}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, color: c.badgeColor, marginBottom: '10px' }}>
                {c.badge}
              </div>
              <TgWindow>
                <TgPhoto src={c.img} alt={c.alt} />
                <TgCaption text={c.text} />
              </TgWindow>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
