'use client'
import Link from 'next/link'
import { useLang } from './layout'

export default function NotFound() {
  const { t } = useLang()
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative' }}>
      <div className="orb-1"></div>
      <div className="orb-2"></div>
      <div className="grid-bg"></div>

      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', marginBottom: '32px' }}>
          <img src="/logo.png" alt="DevelBot" style={{ height: '80px', width: 'auto', borderRadius: '14px', background: '#fff', padding: '8px' }}/>
        </Link>
        <div style={{ fontSize: 'var(--fs-display)', fontWeight: 900, color: 'var(--cyan)', lineHeight: 1 }}>404</div>
        <h1 style={{ fontSize: 'var(--fs-h2)', fontWeight: 900, margin: '16px 0 8px' }}>{t('الصفحة غير موجودة', 'Page not found')}</h1>
        <p style={{ color: 'var(--muted)', fontSize: '15px', marginBottom: '32px', maxWidth: '440px' }}>
          {t('الرابط اللي دخلت عليه مو موجود أو تم نقله لمكان ثاني.', "The link you followed doesn't exist or has moved.")}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn-primary">{t('الرئيسية', 'Homepage')}</Link>
          <Link href="/dashboard" className="btn-ghost">{t('الداشبورد', 'Dashboard')}</Link>
        </div>
      </div>
    </div>
  )
}
