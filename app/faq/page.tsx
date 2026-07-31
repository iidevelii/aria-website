'use client'
import Link from 'next/link'
import { useLang } from '../layout'

type QA = { q: [string, string]; a: [string, string] }
type Cat = { title: [string, string]; emoji: string; items: QA[] }

const CATS: Cat[] = [
  {
    title: ['الحساب والاشتراك', 'Account & Subscription'], emoji: '👤',
    items: [
      { q: ['كيف أبدأ التجربة المجانية؟', 'How do I start the free trial?'], a: ['سجّل حساباً جديداً من صفحة "سجّل مجاناً"، تحصل مباشرة على 14 يوم وصول كامل بدون أي بطاقة بنكية.', 'Create a new account from the "Sign up free" page, you get instant access to a full 14-day trial with no card required.'] },
      { q: ['كيف أشترك بعد انتهاء التجربة؟', 'How do I subscribe after the trial ends?'], a: ['تواصل معنا عبر تلقرام (@devel_support) وسنرشدك لخطوات الدفع والتفعيل خلال دقائق.', 'Message us on Telegram (@devel_support) and we\'ll guide you through payment and activation within minutes.'] },
      { q: ['أقدر ألغي اشتراكي وقت ما أبي؟', 'Can I cancel my subscription anytime?'], a: ['نعم، الاشتراك بدون التزام طويل الأمد، وينتهي تلقائياً بنهاية المدة المدفوعة بدون تجديد تلقائي.', 'Yes, there\'s no long-term commitment. The subscription simply expires at the end of the paid period with no auto-renewal.'] },
      { q: ['فقدت رقم التحويل (TXID)، شسوي؟', 'I lost my transfer number (TXID), what do I do?'], a: ['راسل الدعم على تلقرام وأرسل تفاصيل عملية الدفع، وسنساعدك بتفعيل حسابك يدوياً.', 'Message support on Telegram with your payment details, and we\'ll help activate your account manually.'] },
    ],
  },
  {
    title: ['الإشارات والبوت', 'Signals & Bot'], emoji: '📡',
    items: [
      { q: ['كيف توصلني الإشارة؟', 'How does a signal reach me?'], a: ['فور ما يرصد البوت فرصة مطابقة لشروطه، ترسل الإشارة فوراً على الموقع وبوت تلقرام معاً، مع الدخول والهدف ووقف الخسارة وسبب الاختيار.', 'The moment the bot detects a matching opportunity, the signal is sent instantly to both the website and the Telegram bot, with entry, target, stop loss, and the reasoning behind it.'] },
      { q: ['كم مرة يفحص البوت السوق؟', 'How often does the bot scan the market?'], a: ['كل 15 دقيقة يفحص البوت أكثر من 100 عملة على Binance عبر عدة أطر زمنية.', 'Every 15 minutes the bot scans 100+ coins on Binance across multiple timeframes.'] },
      { q: ['وش الفرق بين إشارات السبوت والفيوتشر؟', "What's the difference between Spot and Futures signals?"], a: ['السبوت شراء مباشر بدون رافعة، مناسب للمدى الأطول. الفيوتشر يدعم LONG وSHORT برافعة ديناميكية، وأعلى في التردد والمخاطر.', 'Spot is a direct purchase with no leverage, suited for longer horizons. Futures supports LONG and SHORT with dynamic leverage, and carries higher frequency and risk.'] },
      { q: ['أقدر أستبعد عملة معينة من إشاراتي؟', 'Can I exclude a specific coin from my signals?'], a: ['نعم، من صفحة الإعدادات أضف أي عملة لقائمة الاستبعاد الشخصية ولن تصلك إشاراتها، بينما باقي المشتركين يستلمونها عادي.', 'Yes, from the Settings page, add any coin to your personal exclusion list and you\'ll stop receiving its signals, while other subscribers still get them normally.'] },
      { q: ['أقدر أبني شروط فحص خاصة فيني؟', 'Can I build my own custom scan conditions?'], a: ['نعم، عبر "منشئ الاستراتيجيات" تقدر تركّب شروطك الخاصة (RSI, MACD, ADX, Score...) وتفعّلها كتنبيه على الموقع أو تلقرام.', 'Yes, through the Strategy Builder you can combine your own conditions (RSI, MACD, ADX, Score...) and activate them as an alert on the website or Telegram.'] },
    ],
  },
  {
    title: ['الأداء والمخاطر', 'Performance & Risk'], emoji: '📊',
    items: [
      { q: ['هل النتائج مضمونة؟', 'Are the results guaranteed?'], a: ['لا. الأرقام المعروضة (باك تست أو حية) لأغراض تحليلية وتعليمية فقط، ولا يوجد أي ضمان للربح. راجع', 'No. The figures shown (backtest or live) are for analytical and educational purposes only, and there is no guarantee of profit. See our'] },
      { q: ['وش الفرق بين الباك تست والصفقات الحية؟', 'What is the difference between backtesting and live trades?'], a: ['الباك تست محاكاة على بيانات تاريخية بنفس إعدادات البوت الحي، بدون احتساب الرسوم أو الانزلاق السعري. الصفقات الحية هي الإشارات الفعلية التي يرسلها البوت يومياً.', 'Backtesting is a simulation on historical data using the exact live bot settings, without accounting for fees or slippage. Live trades are the actual signals the bot sends daily.'] },
      { q: ['وش المحفظة التجريبية (Paper Trading)؟', 'What is the Paper Trading portfolio?'], a: ['رصيد افتراضي بالكامل لتجربة استراتيجيتك بأسعار حية بدون أي مخاطرة مالية فعلية.', 'A fully virtual balance to test your strategy with live prices without any real financial risk.'] },
    ],
  },
  {
    title: ['تقني', 'Technical'], emoji: '⚙️',
    items: [
      { q: ['البوت يدعم منصات تداول ثانية غير Binance؟', 'Does the bot support exchanges other than Binance?'], a: ['حالياً كل بيانات الأسعار والحجوم مصدرها Binance حصرياً.', 'Currently all price and volume data is sourced exclusively from Binance.'] },
      { q: ['كيف أربط حسابي بتلقرام؟', 'How do I link my account to Telegram?'], a: ['من صفحة الإعدادات اضغط "اربط الآن"، بيفتح لك رابط تلقرام، اضغط Start هناك وبيتربط حسابك تلقائياً خلال ثوانٍ.', 'From the Settings page press "Link now": it opens a Telegram link. Press Start there and your account links automatically within seconds.'] },
    ],
  },
]

export default function FaqPage() {
  const { t } = useLang()
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: '48px 20px' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: 'var(--fs-h1)', fontWeight: 900, marginBottom: '8px' }}>{t('الأسئلة الشائعة', 'Frequently Asked Questions')}</h1>
          <p style={{ color: 'var(--muted)', fontSize: '15px' }}>{t('كل شي تحتاج تعرفه عن DevelBot', 'Everything you need to know about DevelBot')}</p>
        </div>

        {CATS.map((cat, ci) => (
          <div key={ci} style={{ marginBottom: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <span style={{ fontSize: '18px' }}>{cat.emoji}</span>
              <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>{t(cat.title[0], cat.title[1])}</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {cat.items.map((qa, i) => (
                <details key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px 18px' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 700, fontSize: '14px', listStyle: 'none' }}>{t(qa.q[0], qa.q[1])}</summary>
                  <p style={{ color: 'var(--muted)', fontSize: '13.5px', lineHeight: 1.8, marginTop: '10px' }}>
                    {t(qa.a[0], qa.a[1])}
                    {qa.q[0] === 'هل النتائج مضمونة؟' && <Link href="/risk-disclaimer" style={{ color: 'var(--cyan)' }}> {t('تنبيه المخاطر', 'risk disclaimer')}.</Link>}
                  </p>
                </details>
              ))}
            </div>
          </div>
        ))}

        <div style={{ textAlign: 'center', marginTop: '32px', padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>{t('ما لقيت جوابك؟', "Didn't find your answer?")}</div>
          <a href="https://t.me/devel_support" target="_blank" rel="noopener noreferrer" className="btn-primary">{t('تواصل مع الدعم', 'Contact support')}</a>
        </div>
      </div>
    </div>
  )
}
