'use client'
import { useLang } from '../ClientShell'
import ComingSoonUSMarket from '../ComingSoonUSMarket'

export default function USMarketPage() {
  const { t } = useLang()
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <div style={{ padding: '32px 24px 0', maxWidth: '1100px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>
          🇺🇸 {t('السوق الأمريكي والأوبشن', 'US Market & Options')}
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '6px' }}>
          {t('توسّع مستقبلي — التفاصيل الكاملة أدناه.', 'A future expansion — full details below.')}
        </p>
      </div>
      <ComingSoonUSMarket />
    </div>
  )
}
