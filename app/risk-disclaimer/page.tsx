'use client'
import Link from 'next/link'
import { useLang } from '../ClientShell'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <h2 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '10px', color: 'var(--text)' }}>{title}</h2>
      <div style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.9 }}>{children}</div>
    </div>
  )
}

export default function RiskDisclaimerPage() {
  const { t } = useLang()
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: '48px 20px' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: 'var(--fs-h1)', fontWeight: 900, marginBottom: '8px' }}>⚠️ {t('تنبيه المخاطر', 'Risk Disclaimer')}</h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>{t('اقرأ هذي الصفحة كاملة قبل استخدام DevelBot لاتخاذ أي قرار تداول.', 'Please read this page in full before using DevelBot to inform any trading decision.')}</p>
        </div>

        <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 'var(--radius-lg)', padding: '18px 20px', marginBottom: '32px', fontSize: '14px', lineHeight: 1.8 }}>
          {t(
            'التداول والاستثمار في العملات الرقمية ينطوي على مخاطر عالية، بما في ذلك احتمال خسارة كامل رأس المال المُستثمر. لا توجد أداة أو استراتيجية أو مؤشر يضمن الربح. المعلومات والإشارات والنتائج المعروضة على DevelBot هي لأغراض تعليمية وتحليلية فقط، ولا تُعتبر بأي شكل نصيحة مالية أو استثمارية.',
            'Trading and investing in cryptocurrency carries a high level of risk, including the possibility of losing your entire invested capital. No tool, strategy, or indicator can guarantee profit. The information, signals, and results shown on DevelBot are for educational and analytical purposes only and do not constitute financial or investment advice in any form.'
          )}
        </div>

        <Section title={t('١. ليست نصيحة مالية', '1. Not financial advice')}>
          {t(
            'DevelBot أداة تحليل فني آلية تراقب بيانات السوق وتُبرز فرصاً محتملة وفق شروط تقنية محددة مسبقاً. أي إشارة أو تنبيه أو نتيجة تظهر في الموقع أو بوت تلقرام لا تشكّل توصية شراء أو بيع، ولا نتحمل أي مسؤولية عن قرارات التداول التي تُتخذ بناءً عليها.',
            'DevelBot is an automated technical-analysis tool that monitors market data and surfaces potential opportunities based on predefined technical criteria. Any signal, alert, or result shown on the website or Telegram bot does not constitute a recommendation to buy or sell, and we accept no responsibility for trading decisions made based on it.'
          )}
        </Section>

        <Section title={t('٢. الأداء السابق لا يضمن النتائج المستقبلية', '2. Past performance does not guarantee future results')}>
          {t(
            'أرقام الباك تست المعروضة (مثل نسبة النجاح أو صافي الربح) مبنية على محاكاة لبيانات تاريخية حقيقية من Binance، وليست صفقات حية نُفِّذت فعلياً. لا تحتسب هذه المحاكاة رسوم التداول أو الانزلاق السعري (slippage) أو تمويل المراكز (funding rate). أداء الاستراتيجية في المستقبل قد يختلف جوهرياً عن أدائها التاريخي.',
            'The backtest figures shown (such as win rate or net profit) are based on a simulation using real historical Binance data; they are not live trades that were actually executed. This simulation does not account for trading fees, price slippage, or futures funding rates. Future strategy performance may differ materially from its historical performance.'
          )}
        </Section>

        <Section title={t('٣. مخاطر الرافعة المالية', '3. Leverage risk')}>
          {t(
            'التداول بالفيوتشر والرافعة المالية (Leverage) يُضخّم الأرباح والخسائر على حد سواء. استخدام رافعة عالية يزيد بشكل كبير من احتمال تصفية المركز (Liquidation) وخسارة رأس المال المستخدم في الصفقة بالكامل خلال وقت قصير.',
            'Futures trading with leverage amplifies both gains and losses. Using high leverage significantly increases the risk of liquidation and losing the entire capital allocated to a trade within a short period.'
          )}
        </Section>

        <Section title={t('٤. البيانات التجريبية والافتراضية', '4. Demo and simulated data')}>
          {t(
            'بعض أقسام المنصة (مثل المحفظة التجريبية "Paper Trading") تستخدم رصيداً افتراضياً بالكامل لأغراض التدريب فقط، ولا تمثّل أموالاً حقيقية أو صفقات منفَّذة على أي منصة تداول. أي بيانات موسومة بـ"توضيحي" أو "تجريبي" هي أمثلة فقط ولا تعكس صفقة حقيقية.',
            'Some sections of the platform (such as the Paper Trading portfolio) use an entirely virtual balance for practice purposes only, and do not represent real money or trades executed on any exchange. Any data labeled "illustrative" or "demo" is an example only and does not reflect a real trade.'
          )}
        </Section>

        <Section title={t('٥. مسؤوليتك الكاملة', '5. Your full responsibility')}>
          {t(
            'أنت وحدك المسؤول عن قراراتك الاستثمارية. ننصح بشدة بعدم استثمار أي مبلغ لا تستطيع تحمّل خسارته، وباستشارة مستشار مالي مرخّص قبل اتخاذ أي قرار استثماري كبير.',
            'You alone are responsible for your investment decisions. We strongly advise against investing any amount you cannot afford to lose, and recommend consulting a licensed financial advisor before making any significant investment decision.'
          )}
        </Section>

        <p style={{ marginTop: '40px' }}>
          <Link href="/" style={{ color: 'var(--cyan)', fontSize: '13px', textDecoration: 'none' }}>{t('← رجوع للرئيسية', '← Back to homepage')}</Link>
        </p>
      </div>
    </div>
  )
}
