'use client'
import Link from 'next/link'
import { useLang } from './ClientShell'

/* قسم كامل مستقل لكل أداة من أدوات البوت — خلفية ملوّنة خفيفة مختلفة لكل
 * قسم، ومعاينة (mockup) حقيقية لواجهة الأداة نفسها بدل أيقونة عامة، عشان
 * يبان بالضبط شكل الميزة وهي شغّالة، مو بس وصف نصي لها. */

const mono = 'var(--mono)'

/* ── 1) السكانر: جدول مصغّر بعملات حقيقية وRSI/Score ── */
function ScannerVisual({ color }: { color: string }) {
  const rows = [
    { pair: 'INJ/USDT', rsi: 68, macd: '▲', score: 82 },
    { pair: 'SOL/USDT', rsi: 61, macd: '▲', score: 74 },
    { pair: 'DOGE/USDT', rsi: 34, macd: '▼', score: -58 },
  ]
  return (
    <MockFrame color={color} label="Scanner · 100+ coins">
      <div style={{ display: 'flex', fontSize: '10px', color: 'var(--dim)', padding: '0 4px 8px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        <span style={{ flex: 1.4 }}>Pair</span><span style={{ flex: 1 }}>RSI</span><span style={{ flex: 1 }}>MACD</span><span style={{ flex: 1, textAlign: 'right' }}>Score</span>
      </div>
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '9px 4px', borderTop: '1px solid rgba(255,255,255,0.05)', fontFamily: mono, fontSize: '12px' }}>
          <span style={{ flex: 1.4, fontWeight: 800 }}>{r.pair}</span>
          <span style={{ flex: 1, color: r.rsi > 60 ? 'var(--green)' : r.rsi < 40 ? 'var(--red)' : 'var(--muted)' }}>{r.rsi}</span>
          <span style={{ flex: 1, color: r.macd === '▲' ? 'var(--green)' : 'var(--red)' }}>{r.macd}</span>
          <span style={{ flex: 1, textAlign: 'right', fontWeight: 900, color: r.score > 0 ? 'var(--green)' : 'var(--red)' }}>{r.score > 0 ? '+' : ''}{r.score}</span>
        </div>
      ))}
    </MockFrame>
  )
}

/* ── 2) منشئ الاستراتيجيات: شروط AND/OR ── */
function StrategyBuilderVisual({ color, t }: { color: string; t: (ar: string, en: string) => string }) {
  const conds = [
    { l: 'RSI', op: '<', v: '30' },
    { l: 'ADX', op: '>', v: '25' },
    { l: 'Supertrend', op: '=', v: t('صاعد', 'Up') },
  ]
  return (
    <MockFrame color={color} label={t('شروطك', 'Your conditions')}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {conds.map((c, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {i > 0 && <span style={{ fontSize: '9px', fontWeight: 900, color, width: '28px', textAlign: 'center' }}>AND</span>}
            {i === 0 && <span style={{ width: '28px' }} />}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '7px', padding: '8px 12px', fontFamily: mono, fontSize: '12px' }}>
              <span style={{ fontWeight: 800 }}>{c.l}</span>
              <span style={{ color }}>{c.op} {c.v}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '11px', color: 'var(--dim)' }}>{t('طابقت 6 عملات', '6 coins matched')}</span>
        <span style={{ fontSize: '11px', fontWeight: 800, color, background: `${color}18`, padding: '4px 10px', borderRadius: '6px' }}>{t('تشغيل ▶', 'Run ▶')}</span>
      </div>
    </MockFrame>
  )
}

/* ── 3) الباك تست: منحنى عائد تراكمي مصغّر ── */
function BacktestVisual({ color, t }: { color: string; t: (ar: string, en: string) => string }) {
  const pts = [4, 10, 8, 18, 15, 26, 22, 34, 30, 44, 40, 55, 50, 64]
  const w = 220, h = 70
  const max = Math.max(...pts), min = Math.min(...pts)
  const path = pts.map((v, i) => {
    const x = (i / (pts.length - 1)) * w
    const y = h - ((v - min) / (max - min)) * h
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
  return (
    <MockFrame color={color} label={t('منحنى العائد التراكمي', 'Cumulative equity curve')}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
        <span style={{ fontSize: '22px', fontWeight: 900, color, fontFamily: mono }}>+2719.8%</span>
        <span style={{ fontSize: '10px', color: 'var(--dim)' }}>1335 {t('صفقة', 'trades')}</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none">
        <defs>
          <linearGradient id="bt-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${path} L${w},${h} L0,${h} Z`} fill="url(#bt-grad)" />
        <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '11px', fontFamily: mono }}>
        <span style={{ color: 'var(--muted)' }}>WR <b style={{ color: 'var(--text)' }}>77.2%</b></span>
        <span style={{ color: 'var(--muted)' }}>PF <b style={{ color: 'var(--text)' }}>3.8</b></span>
      </div>
    </MockFrame>
  )
}

/* ── 4) تتبع العملات: تنبيه سعر ── */
function CoinTrackerVisual({ color, t }: { color: string; t: (ar: string, en: string) => string }) {
  return (
    <MockFrame color={color} label={t('تنبيه حي', 'Live alert')}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: `${color}0f`, border: `1px solid ${color}35`, borderRadius: '10px', padding: '12px 14px' }}>
        <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>🔔</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: '13px' }}>BTC/USDT {t('تجاوز', 'crossed')} $65,000</div>
          <div style={{ fontSize: '11px', color: 'var(--dim)', marginTop: '2px' }}>{t('قبل 3 ثوانٍ', '3 seconds ago')}</div>
        </div>
      </div>
      <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {[t('فوق سعر', 'Above price'), t('نموذج فني', 'Chart pattern'), t('تغيّر 24س', '24h change')].map((l, i) => (
          <span key={i} style={{ fontSize: '10px', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: '5px', padding: '3px 8px' }}>{l}</span>
        ))}
      </div>
    </MockFrame>
  )
}

/* ── 5) مساعد AI: محادثة مصغّرة ── */
function AIAssistantVisual({ color, t }: { color: string; t: (ar: string, en: string) => string }) {
  return (
    <MockFrame color={color} label={t('اسأل المساعد', 'Ask the assistant')}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
        <div style={{ background: 'var(--border)', borderRadius: '10px 10px 2px 10px', padding: '8px 12px', fontSize: '12px', maxWidth: '80%' }}>
          {t('ليش RSI يعتبر تشبّع بيعي؟', 'Why is RSI considered oversold?')}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: `${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', flexShrink: 0 }}>🤖</div>
        <div style={{ background: `${color}14`, border: `1px solid ${color}30`, borderRadius: '10px 10px 10px 2px', padding: '8px 12px', fontSize: '12px', lineHeight: 1.6 }}>
          {t('لأن السعر انخفض بسرعة أكبر من قدرته على التعافي — RSI تحت 30 يعني ضغط بيع زائد قد يسبقه ارتداد.', 'Because price dropped faster than it could recover — RSI below 30 signals excess selling pressure that often precedes a bounce.')}
        </div>
      </div>
    </MockFrame>
  )
}

/* ── 6) محفظة تجريبية: رصيد + ربح ── */
function PaperTradingVisual({ color, t }: { color: string; t: (ar: string, en: string) => string }) {
  return (
    <MockFrame color={color} label={t('محفظتك التجريبية', 'Your paper portfolio')}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '14px' }}>
        <div>
          <div style={{ fontSize: '10px', color: 'var(--dim)', marginBottom: '4px' }}>{t('الرصيد', 'Balance')}</div>
          <div style={{ fontSize: '24px', fontWeight: 900, fontFamily: mono }}>$12,430</div>
        </div>
        <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--green)', fontFamily: mono }}>+24.3%</div>
      </div>
      {[
        { pair: 'ETH/USDT', side: 'LONG', pnl: '+8.1%' },
        { pair: 'AVAX/USDT', side: 'SHORT', pnl: '-2.4%' },
      ].map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '12px', fontFamily: mono }}>
          <span style={{ fontWeight: 700 }}>{p.pair}</span>
          <span className={p.side === 'LONG' ? 'pill-long' : 'pill-short'} style={{ fontSize: '10px' }}>{p.side}</span>
          <span style={{ fontWeight: 800, color: p.pnl.startsWith('+') ? 'var(--green)' : 'var(--red)' }}>{p.pnl}</span>
        </div>
      ))}
    </MockFrame>
  )
}

function MockFrame({ color, label, children }: { color: string; label: string; children: React.ReactNode }) {
  return (
    <div style={{
      borderRadius: '18px', background: 'var(--surface)', border: `1px solid ${color}30`,
      boxShadow: `0 24px 60px -20px ${color}30`, overflow: 'hidden',
    }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: color }} />
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)' }}>{label}</span>
      </div>
      <div style={{ padding: '18px' }}>{children}</div>
    </div>
  )
}

type Feature = {
  icon: string
  color: string
  eyebrow: string
  title: string
  lead: string
  points: string[]
  href: string
  cta: string
  visual: React.ReactNode
}

function FeatureBlock({ f, index }: { f: Feature; index: number }) {
  const { lang } = useLang()
  const reverse = index % 2 === 1
  // reverse يتحكم بس بترتيب عمودي النص/الصورة (تنويع بصري)، ما له علاقة
  // باتجاه القراءة الفعلي — كان مستخدم غلط كـdirection على الشبكة كلها، فسحب
  // معه صف النقاط (bullet points) وقلب ترتيبه، فطلعت العلامة "›" يسار
  // والجملة عربي (اتجاه القراءة الصحيح معكوس). نفصلهم: الشبكة تاخذ reverse
  // للتنويع، صف النقاط ياخذ اتجاه اللغة الحقيقي دايماً.
  const textDir = lang === 'ar' ? 'rtl' : 'ltr'
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px', direction: textDir }}>
            {f.points.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13.5px', color: 'var(--muted)', lineHeight: 1.6 }}>
                <span style={{ color: f.color, fontWeight: 900, flexShrink: 0, marginTop: '1px', transform: textDir === 'rtl' ? 'scaleX(-1)' : 'none' }}>›</span>
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
        <div style={{ direction: 'ltr' }}>{f.visual}</div>
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
      visual: <ScannerVisual color="#00c4ef" />,
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
      visual: <StrategyBuilderVisual color="#7c3aed" t={t} />,
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
      visual: <BacktestVisual color="#22d06e" t={t} />,
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
      visual: <CoinTrackerVisual color="#f59e0b" t={t} />,
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
      visual: <AIAssistantVisual color="#f04060" t={t} />,
    },
    {
      icon: '💼', color: 'var(--green)', eyebrow: t('09 · محفظة تجريبية', '09 · Paper Trading'),
      title: t('جرّب بدون مخاطرة فلوسك', 'Practice without risking your money'),
      lead: t('قبل ما تدخل السوق الحقيقي بفلوس حقيقية، جرّب استراتيجيتك على محفظة محاكاة كاملة — نفس خيارات الرافعة والحجم و LONG/SHORT، بدون أي خسارة فعلية.', "Before entering the real market with real money, test your strategy on a full simulated portfolio — same leverage, size, and LONG/SHORT options, with zero real risk."),
      points: [
        t('محفظة وهمية بمبلغ تحدده أنت، تتحرك بأسعار السوق الحقيقية.', 'A virtual balance you set yourself, moving with real market prices.'),
        t('نفس خيارات الصفقة الحقيقية: رافعة، حجم المركز، LONG أو SHORT.', 'The same real-trade options: leverage, position size, LONG or SHORT.'),
        t('سجل أداء كامل لكل صفقاتك التجريبية عشان تقيس نفسك قبل الجدّ.', 'A full performance log of every practice trade, so you can measure yourself before going live.'),
      ],
      href: '/paper-trading', cta: t('جرّب المحفظة ←', 'Try paper trading →'),
      visual: <PaperTradingVisual color="var(--green)" t={t} />,
    },
  ]

  return (
    <div>
      {features.map((f, i) => <FeatureBlock key={f.href} f={f} index={i} />)}
    </div>
  )
}
