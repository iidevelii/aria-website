'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLang } from './layout'
import EquityCurve from './backtest-results/EquityCurve'

type EquityCurveData = { engine: string; universe: number; totalTrades: number; netPct: number; points: { t: string; cum: number }[] }

/** معاينة الأداء بالصفحة الرئيسية — يعيد استخدام EquityCurve الحقيقي من صفحة
 * الباك تست (بدون بناء منحنى جديد)، مع رابط لكامل التفاصيل وتنويه مخاطر واضح. */
export default function PerformancePreview() {
  const { t } = useLang()
  const [data, setData] = useState<EquityCurveData | null>(null)

  useEffect(() => {
    fetch('/trend-equity-curve.json').then(r => r.json()).then(setData).catch(() => {})
  }, [])

  return (
    <section className="section">
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div className="section-eyebrow" style={{ textAlign: 'center' }}>{t('الأداء والشفافية', 'Performance & transparency')}</div>
          <h2 className="section-title" style={{ textAlign: 'center' }}>{t('نتائج حقيقية موثّقة، بدون تجميل', 'Real, documented results, no embellishment')}</h2>
        </div>

        {data && data.points?.length > 1 && (
          <EquityCurve points={data.points} netPct={data.netPct} totalTrades={data.totalTrades} label={t('منحنى أداء استراتيجية Futures (بيانات حقيقية)', 'Futures strategy equity curve (real data)')} />
        )}

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link href="/backtest-results" className="btn-ghost" style={{ padding: '10px 24px', fontSize: '13px' }}>
            {t('شوف نتائج كل عملة على حدة ←', 'See per-coin results →')}
          </Link>
        </div>

        <p style={{ color: 'var(--dim)', fontSize: '11.5px', lineHeight: 1.7, textAlign: 'center', maxWidth: '640px', margin: '24px auto 0' }}>
          {t('الأداء السابق لا يضمن النتائج المستقبلية. التداول والاستثمار ينطويان على مخاطر، ولا توجد أداة أو استراتيجية تضمن الربح.', 'Past performance does not guarantee future results. Trading and investing involve risk, and no tool or strategy can guarantee profit.')}
        </p>
      </div>
    </section>
  )
}
