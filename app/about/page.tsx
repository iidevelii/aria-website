'use client'
import Link from 'next/link'
import { useLang } from '../ClientShell'

export default function AboutPage() {
  const { t } = useLang()

  const values = [
    { emoji: '🔍', title: t('شفافية كاملة', 'Full transparency'), desc: t('كل رقم أداء نعرضه، سواء باك تست أو حي، مصدره بيانات Binance حقيقية، وواضح فيه إذا كان محاكاة أو نتيجة فعلية.', 'Every performance number we show, backtested or live, is sourced from real Binance data, and it\'s always clear whether it\'s a simulation or an actual result.') },
    { emoji: '🧭', title: t('تعليمي أولاً', 'Educational first'), desc: t('نبني أدوات تساعدك تفهم السوق وتتخذ قرارك بنفسك، مو تتبع توصية عمياء.', 'We build tools to help you understand the market and make your own decisions, not to blindly follow a recommendation.') },
    { emoji: '⚙️', title: t('بلا أرقام وهمية', 'No fake numbers'), desc: t('ما نعرض أبداً أرباحاً غير مثبتة أو بيانات مصطنعة، وأي بيانات توضيحية مُعلَّمة بوضوح كذلك.', 'We never display unproven profits or fabricated data, and any illustrative data is clearly labeled as such.') },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: '48px 20px' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: 'var(--fs-h1)', fontWeight: 900, marginBottom: '10px' }}>{t('عن DevelBot', 'About DevelBot')}</h1>
          <p style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: 1.8, maxWidth: '560px', margin: '0 auto' }}>
            {t('منصة تحلل السوق نيابةً عنك، وترسل لك الفرصة فقط لما تستاهل انتباهك.', 'A platform that analyzes the market on your behalf, and sends you the opportunity only when it\'s worth your attention.')}
          </p>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '28px', marginBottom: '32px', boxShadow: 'var(--shadow-card)' }}>
          <p style={{ color: 'var(--text)', fontSize: '14.5px', lineHeight: 1.9 }}>
            {t(
              'DevelBot بدأ كفكرة بسيطة: مراقبة مئات العملات الرقمية يدوياً كل يوم مهمة مستحيلة لأي متداول، بينما السوق يتحرك 24 ساعة بدون توقف. بنينا محرك تحليل آلي يفحص السوق باستمرار، من أنماط ومؤشرات فنية وهيكل السوق (Smart Money Concepts)، وعندما تظهر فرصة مطابقة لشروط محددة مسبقاً، يرسلها لك فوراً مع الدخول والأهداف ووقف الخسارة وسبب الاختيار، على الموقع وبوت تلقرام معاً.',
              "DevelBot started as a simple idea: manually watching hundreds of cryptocurrencies every day is an impossible task for any trader, while the market moves 24 hours a day without stopping. We built an automated analysis engine that continuously scans the market, including patterns, technical indicators, and market structure (Smart Money Concepts), and when an opportunity matching predefined criteria appears, it's sent to you instantly with entry, targets, stop loss, and the reasoning behind it, on both the website and the Telegram bot."
            )}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {values.map((v, i) => (
            <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>{v.emoji}</div>
              <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '6px' }}>{v.title}</div>
              <div style={{ color: 'var(--muted)', fontSize: '12.5px', lineHeight: 1.7 }}>{v.desc}</div>
            </div>
          ))}
        </div>

        <p style={{ color: 'var(--dim)', fontSize: '11.5px', lineHeight: 1.7, textAlign: 'center', marginBottom: '32px' }}>
          {t('التداول والاستثمار ينطويان على مخاطر، ولا توجد أداة أو استراتيجية تضمن الربح. المعلومات والنتائج المعروضة لأغراض تعليمية وتحليلية وليست نصيحة مالية.', 'Trading and investing involve risk. No tool or strategy can guarantee profit. Information and results are provided for educational and analytical purposes and do not constitute financial advice.')}
        </p>

        <div style={{ textAlign: 'center' }}>
          <Link href="/register" className="btn-primary">{t('ابدأ تجربتك المجانية ←', 'Start your free trial →')}</Link>
        </div>
      </div>
    </div>
  )
}
