'use client'
import Link from 'next/link'
import { useLang } from './layout'

/* قسم كامل مستقل لكل أداة من أدوات البوت — خلفية ملوّنة خفيفة مختلفة لكل
 * قسم (بنفس لون الأداة المعتمد أصلاً بالموقع) عشان يبان بوضوح إنك دخلت
 * قسم جديد كامل لميزة مختلفة، مو مجرد بطاقة بشبكة عامة. */

type Feature = {
  icon: string
  color: string
  eyebrow: string
  title: string
  lead: string
  points: string[]
  href: string
  cta: string
}

function FeatureBlock({ f, index }: { f: Feature; index: number }) {
  const reverse = index % 2 === 1
  return (
    <section style={{ position: 'relative', padding: '72px 24px', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 80% 60% at ${reverse ? '85%' : '15%'} 50%, ${f.color}14, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <div className="feature-block-grid" style={{
        position: 'relative', maxWidth: '1100px', margin: '0 auto', display: 'grid',
        gridTemplateColumns: '1fr 1fr', gap: '56px', alignItems: 'center',
        direction: reverse ? 'rtl' : 'ltr',
      }}>
        <div style={{ direction: 'inherit' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px', marginBottom: '20px',
            background: `${f.color}1c`, border: `1px solid ${f.color}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px',
          }}>{f.icon}</div>
          <div className="section-eyebrow" style={{ color: f.color }}>{f.eyebrow}</div>
          <h2 className="section-title" style={{ marginBottom: '16px' }}>{f.title}</h2>
          <p style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: 1.8, marginBottom: '20px', maxWidth: '460px' }}>{f.lead}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
            {f.points.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13.5px', color: '#c9d1e0', lineHeight: 1.6 }}>
                <span style={{ color: f.color, fontWeight: 900, flexShrink: 0, marginTop: '1px' }}>›</span>
                <span>{p}</span>
              </div>
            ))}
          </div>
          <Link href={f.href} style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px', color: f.color, textDecoration: 'none',
            fontWeight: 800, fontSize: '13.5px', background: `${f.color}12`, border: `1px solid ${f.color}35`,
            padding: '10px 20px', borderRadius: '8px',
          }}>{f.cta}</Link>
        </div>
        <div style={{ direction: 'ltr' }}>
          <div style={{
            aspectRatio: '4/3', borderRadius: '18px', background: 'var(--surface)',
            border: `1px solid ${f.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '72px', boxShadow: `0 24px 60px -20px ${f.color}30`,
          }}>{f.icon}</div>
        </div>
      </div>
    </section>
  )
}

export default function FeatureSections() {
  const { t } = useLang()

  const features: Feature[] = [
    {
      icon: '📡', color: '#00c4ef', eyebrow: t('04 · السكانر', '04 · Scanner'),
      title: t('يفحص كل السوق كل دقيقة', 'Scans the whole market every minute'),
      lead: t('السكانر يراقب عشرات العملات لحظياً على كل الفريمات، ويحسب أربعة مؤشرات فنية كلاسيكية لكل عملة في نفس الوقت — بدون ما تفتح شارت واحد بنفسك.', 'The Scanner watches dozens of coins in real time across every timeframe, calculating four classical technical indicators per coin simultaneously — without you opening a single chart yourself.'),
      points: [
        t('RSI و MACD و ADX و Supertrend محسوبة لحظياً لكل عملة بالقائمة.', 'RSI, MACD, ADX, and Supertrend calculated live for every coin on the list.'),
        t('كل عملة تاخذ Score من -100 (بيع قوي) إلى +100 (شراء قوي).', 'Every coin gets a Score from -100 (strong sell) to +100 (strong buy).'),
        t('تقدر تفرز وتفلتر حسب أي مؤشر أو نطاق Score تحدده.', 'Sort and filter by any indicator or Score range you choose.'),
      ],
      href: '/scanner', cta: t('افتح السكانر ←', 'Open the Scanner →'),
    },
    {
      icon: '⚙️', color: '#7c3aed', eyebrow: t('05 · منشئ الاستراتيجيات', '05 · Strategy Builder'),
      title: t('اصنع شروط الفحص الخاصة فيك', 'Build your own scan conditions'),
      lead: t('لو عندك فكرة استراتيجية معينة، منشئ الاستراتيجيات يخليك تركّب شروطها (AND/OR بين أي عدد من المؤشرات) وتشغّلها على كامل السوق بضغطة زر، بدون كتابة كود.', "If you have a specific strategy idea, the Strategy Builder lets you combine conditions (AND/OR across any number of indicators) and run them across the whole market with one click — no code required."),
      points: [
        t('اختر من كل المؤشرات المتاحة بالسكانر وركّبها بمنطق AND/OR.', 'Pick from every indicator available in the Scanner and combine them with AND/OR logic.'),
        t('احفظ استراتيجيتك وشغّلها تلقائياً — تجيك تنبيهات كل ما طابقت عملة شروطك.', 'Save your strategy and run it automatically — get alerted whenever a coin matches your conditions.'),
        t('نفس محرك الفحص اللي يشتغل عليه السكانر، بدون فرق بالدقة.', 'The exact same scanning engine the Scanner uses, with no difference in accuracy.'),
      ],
      href: '/strategy-builder', cta: t('ابنِ استراتيجيتك ←', 'Build your strategy →'),
    },
    {
      icon: '📊', color: '#22d06e', eyebrow: t('06 · نتائج الباك تست', '06 · Backtest Results'),
      title: t('شفافية كاملة، رقم برقم', 'Full transparency, number by number'),
      lead: t('كل استراتيجية نشغّلها عليها باك تست حقيقي على بيانات Binance الفعلية — مو تقدير أو محاكاة تسويقية. تقدر تشوف نتيجة كل عملة على حدة، والعملات الضعيفة تُستبعد تلقائياً قبل ما توصلك أي إشارة عليها.', "Every strategy we run has a real backtest on actual Binance data — not an estimate or a marketing simulation. You can see the result for each coin individually, and weak coins are automatically excluded before any signal on them reaches you."),
      points: [
        t('منحنى العائد التراكمي الحقيقي لكل استراتيجية (Equity Curve).', "The real cumulative equity curve for each strategy."),
        t('Win Rate و Profit Factor منفصلين لكل عملة، مو رقم إجمالي مضلّل.', 'Win Rate and Profit Factor broken down per coin, not one misleading aggregate number.'),
        t('العملات اللي أداؤها ضعيف بالباك تست تُستبعد من الإشارات الحية تلقائياً.', "Coins that perform poorly in the backtest are automatically excluded from live signals."),
      ],
      href: '/backtest-results', cta: t('شوف الأرقام ←', 'See the numbers →'),
    },
    {
      icon: '🔔', color: '#f59e0b', eyebrow: t('07 · تتبع العملات', '07 · Coin Tracker'),
      title: t('تنبيهات مخصصة على أي عملة', 'Custom alerts on any coin'),
      lead: t('مو محتاج تحدّث السعر بنفسك كل شوي — حدد السعر أو النسبة اللي تهمك، ونحن نراقبها كل 30 ثانية ونرسل لك تنبيه لحظة ما توصل.', "No need to keep refreshing the price yourself — set the price or percentage you care about, and we check it every 30 seconds and alert you the instant it hits."),
      points: [
        t('تنبيه فوق أو تحت سعر محدد تحدده أنت بنفسك.', 'Alert above or below a specific price you set yourself.'),
        t('تنبيه على نسبة التغيّر خلال 24 ساعة.', 'Alert on the 24-hour percentage change.'),
        t('تنبيهات نماذج فنية (قمة مزدوجة، رأس وكتفين، مثلثات، وأكثر) بشارت موضّح.', 'Chart-pattern alerts (double top, head & shoulders, triangles, and more) with an annotated chart.'),
      ],
      href: '/coin-tracker', cta: t('أضف تنبيه ←', 'Add an alert →'),
    },
    {
      icon: '🤖', color: '#f04060', eyebrow: t('08 · مساعد AI', '08 · AI Assistant'),
      title: t('اسأله، يشرحلك', 'Ask it, it explains'),
      lead: t('ما تفهم ليش صار مؤشر معين أو ليش انرسلت إشارة؟ اسأل مساعد الذكاء الاصطناعي مباشرة — يشرحلك بالعربي وبأسلوب مبسّط، مع أساسيات إدارة المخاطر. تعليمي بالكامل، مو نصيحة مالية.', "Don't understand why an indicator fired or why a signal was sent? Ask the AI assistant directly — it explains in plain Arabic, plus risk-management basics. Fully educational, not financial advice."),
      points: [
        t('يشرح أي مؤشر أو إشارة بلغة مبسّطة وقت ما تحتاجها.', 'Explains any indicator or signal in plain language whenever you need it.'),
        t('أساسيات إدارة المخاطر: حجم المركز، وقف الخسارة، الرافعة.', 'Risk-management basics: position sizing, stop loss, leverage.'),
        t('متاح داخل الموقع مباشرة، بدون ما تطلع لتطبيق ثاني.', 'Available right inside the site, no need to open a separate app.'),
      ],
      href: '/ai-assistant', cta: t('جرّب المساعد ←', 'Try the assistant →'),
    },
    {
      icon: '💼', color: '#00e664', eyebrow: t('09 · محفظة تجريبية', '09 · Paper Trading'),
      title: t('جرّب بدون مخاطرة فلوسك', 'Practice without risking your money'),
      lead: t('قبل ما تدخل السوق الحقيقي بفلوس حقيقية، جرّب استراتيجيتك على محفظة محاكاة كاملة — نفس خيارات الرافعة والحجم و LONG/SHORT، بدون أي خسارة فعلية.', "Before entering the real market with real money, test your strategy on a full simulated portfolio — same leverage, size, and LONG/SHORT options, with zero real risk."),
      points: [
        t('محفظة وهمية بمبلغ تحدده أنت، تتحرك بأسعار السوق الحقيقية.', 'A virtual balance you set yourself, moving with real market prices.'),
        t('نفس خيارات الصفقة الحقيقية: رافعة، حجم المركز، LONG أو SHORT.', 'The same real-trade options: leverage, position size, LONG or SHORT.'),
        t('سجل أداء كامل لكل صفقاتك التجريبية عشان تقيس نفسك قبل الجدّ.', 'A full performance log of every practice trade, so you can measure yourself before going live.'),
      ],
      href: '/paper-trading', cta: t('جرّب المحفظة ←', 'Try paper trading →'),
    },
  ]

  return (
    <div>
      {features.map((f, i) => <FeatureBlock key={f.href} f={f} index={i} />)}
    </div>
  )
}
