'use client'
import { useLang } from './ClientShell'

/* توسّع مستقبلي: سوق الأسهم الأمريكي والأوبشن — خلفية متمايزة عمداً (بنفسجي/ذهبي
 * غامق) عن باقي أقسام الميزات الحالية، عشان تُقرأ بوضوح كـ"قادم" مو ميزة شغّالة الآن. */

function ComingSoonCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(245,158,11,0.18)',
      borderRadius: '14px', padding: '22px', backdropFilter: 'blur(2px)',
    }}>
      <div style={{ fontSize: '22px', marginBottom: '10px' }}>{icon}</div>
      <div style={{ fontWeight: 800, fontSize: '14.5px', marginBottom: '6px', color: '#fff' }}>{title}</div>
      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12.5px', lineHeight: 1.7 }}>{desc}</div>
    </div>
  )
}

export default function ComingSoonUSMarket() {
  const { t } = useLang()

  const items = [
    { icon: '📊', title: t('خريطة Gamma الحية', 'Live gamma heatmap'), desc: t('مستويات Call/Put Wall وتحيّز الاتجاه المبني على GEX، لحظة بلحظة.', 'Call/put wall levels and GEX-based directional bias, updated live.') },
    { icon: '📈', title: t('تدفق الأوبشن', 'Options flow tape'), desc: t('تتبّع حي لصفقات الأوبشن الكبيرة وقت حدوثها.', 'Live tracking of large options trades as they happen.') },
    { icon: '🔄', title: t('مساعد الرول', 'Roll Assistant'), desc: t('قارن سيناريوهات ترحيل صفقتك (Roll) بوضوح قبل ما تقرر.', 'Compare your position-roll scenarios clearly before you decide.') },
    { icon: '🧲', title: t('حاسبة Max Pain', 'Max Pain Calculator'), desc: t('وين يتجمّع العقد المفتوح للأوبشن قرب تاريخ الانتهاء.', 'Where options open interest clusters near expiration.') },
    { icon: '🏛️', title: t('صفقات المطّلعين', 'Insider trades'), desc: t('صفقات المسؤولين التنفيذيين الحقيقية من إفصاحات SEC.', 'Real executive insider trades from SEC filings.') },
    { icon: '🏦', title: t('صفقات الكونغرس', 'Congressional trades'), desc: t('إفصاحات تداول أعضاء الكونغرس (STOCK Act).', "Congressional trading disclosures (STOCK Act).") },
    { icon: '📅', title: t('الأنماط الموسمية', 'Seasonality patterns'), desc: t('أنماط تاريخية متكررة عبر أكثر من 500 أصل.', 'Recurring historical patterns across 500+ assets.') },
    { icon: '👥', title: t('نسخ الصفقات', 'Copy trading'), desc: t('تابع متداولين موثّقين، صفقات منفّذة فعلياً بحسابات حقيقية.', 'Follow verified traders whose trades were actually executed in real accounts.') },
  ]

  return (
    <section style={{ position: 'relative', padding: '80px 24px', overflow: 'hidden', background: 'linear-gradient(160deg, #150f28 0%, #0d0a1a 55%, #0a0812 100%)' }}>
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '480px', height: '480px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.10), transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-15%', left: '-10%', width: '420px', height: '420px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.12), transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '20px', padding: '5px 16px', marginBottom: '18px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#f59e0b' }}>🚀 {t('قادم قريباً', 'Coming soon')}</span>
          </div>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: '14px' }}>
            {t('DevelBot يتوسّع للسوق الأمريكي والأوبشن', 'DevelBot is expanding to US stocks and options')}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '15px', lineHeight: 1.8, maxWidth: '620px', margin: '0 auto' }}>
            {t('نفس مبدأ التحليل الآلي المستمر اللي تعرفه بالكريبتو، ينتقل للأسهم الأمريكية والأوبشن — بميزات مبنية لمتداولي الأوبشن الجادين وأصحاب رأس المال الحقيقي.', 'The same continuous automated-analysis principle you know from crypto, extended to US stocks and options — with features built for serious options traders and real capital deployment.')}
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '14px' }}>
          {items.map((it, i) => <ComingSoonCard key={i} {...it} />)}
        </div>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: '12px', marginTop: '32px' }}>
          {t('قيد التخطيط حالياً — لا تاريخ إطلاق محدد بعد.', 'Currently in planning — no launch date set yet.')}
        </p>
      </div>
    </section>
  )
}
