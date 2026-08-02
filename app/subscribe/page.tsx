'use client'
import Link from 'next/link'
import { useLang } from '../layout'

export default function Subscribe() {
  const { t } = useLang()
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative' }}>

      <div style={{ width: '100%', maxWidth: '560px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '8px', color: 'var(--text)' }}>{t('الاشتراك الاحترافي', 'Pro Subscription')}</h1>
          <p style={{ color: 'var(--muted)', fontSize: '15px' }}>{t('45 USDT · 30 يوم وصول كامل بدون قيود', '45 USDT · 30 days of full, unrestricted access')}</p>
        </div>

        {/* Pricing card */}
        <div style={{
          background: 'var(--surface-2)',
          border: '1px solid rgba(0,196,239,0.2)',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div>
            <div style={{ fontSize: '48px', fontWeight: 900, color: 'var(--text)' }}>$45</div>
            <div style={{ color: 'var(--muted)', fontSize: '14px' }}>{t('لمدة 30 يوم كاملة', 'For a full 30 days')}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[t('100 عملة متجددة', '100 rotating coins'), t('رافعة ديناميكية', 'Dynamic leverage'), 'Quality Score', t('إشعارات فورية', 'Instant notifications')].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--muted)' }}>
                <span style={{ color: 'var(--cyan)' }}>✓</span> {f}
              </div>
            ))}
          </div>
        </div>

        {/* Contact card */}
        <div className="glass-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>💬</div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px', color: 'var(--text)' }}>{t('للاشتراك تواصل معنا', 'Contact us to subscribe')}</h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.7, marginBottom: '28px' }}>
            {t('راسلنا على تلقرام وسنفعّل اشتراكك خلال دقائق', 'Message us on Telegram and we\'ll activate your subscription within minutes')}
          </p>

          <a
            href="https://t.me/devel_support"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '12px',
              background: 'rgba(0,196,239,0.08)',
              border: '1px solid rgba(0,196,239,0.3)',
              color: 'var(--cyan)', textDecoration: 'none',
              fontWeight: 700, fontSize: '17px',
              padding: '16px 36px', borderRadius: '16px',
              marginBottom: '20px',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.7 8.02c-.12.55-.46.68-.93.43l-2.55-1.88-1.23 1.18c-.14.14-.25.25-.5.25l.18-2.56 4.6-4.16c.2-.18-.04-.28-.31-.1L7.5 15.04l-2.49-.78c-.54-.17-.55-.54.11-.8l9.72-3.75c.45-.17.84.1.7.79z" fill="currentColor"/>
            </svg>
            {t('تواصل مع', 'Contact')} @devel_support
          </a>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
            <p style={{ color: 'var(--muted)', fontSize: '13px', lineHeight: 1.7 }}>
              {t('سيردّ عليك الدعم في أقرب وقت ويرشدك لخطوات الدفع وتفعيل الاشتراك', 'Our support team will reply shortly and guide you through payment and activation')}
            </p>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link href="/dashboard" style={{ color: 'var(--muted)', fontSize: '13px', textDecoration: 'none' }}>{t('رجوع للداشبورد ←', '← Back to dashboard')}</Link>
        </p>
      </div>
    </div>
  )
}
