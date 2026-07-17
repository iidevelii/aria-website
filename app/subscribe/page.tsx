'use client'
import Link from 'next/link'

function DevelLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
      <circle cx="26" cy="26" r="25" fill="#050508" stroke="rgba(0,196,239,0.25)" strokeWidth="1.6"/>
      <rect x="9"  y="22" width="5" height="9"  rx="2" fill="#00c4ef"/>
      <rect x="16" y="17" width="5" height="14" rx="2" fill="#00c4ef"/>
      <rect x="23" y="14" width="5" height="18" rx="2" fill="url(#lg1)"/>
      <rect x="30" y="17" width="5" height="14" rx="2" fill="url(#lg2)"/>
      <rect x="37" y="22" width="5" height="9"  rx="2" fill="#6b1fff"/>
      <circle cx="26" cy="26" r="3" fill="white"/>
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#00c4ef"/><stop offset="1" stopColor="#8b5cf6"/></linearGradient>
        <linearGradient id="lg2" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#8b5cf6"/><stop offset="1" stopColor="#6b1fff"/></linearGradient>
      </defs>
    </svg>
  )
}

export default function Subscribe() {
  return (
    <div style={{ minHeight: '100vh', background: '#050508', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative' }}>
      <div className="grid-bg"></div>

      <div style={{ width: '100%', maxWidth: '560px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
            <DevelLogo size={40} />
            <span style={{ fontWeight: 900, fontSize: '20px', color: 'white' }}>Devel<span style={{ color: '#00c4ef' }}>Bot</span></span>
          </Link>
          <h1 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '8px' }}>الاشتراك الاحترافي</h1>
          <p style={{ color: '#6b7280', fontSize: '15px' }}>35 USDT — 30 يوم وصول كامل بدون قيود</p>
        </div>

        {/* Pricing card */}
        <div style={{ background: 'linear-gradient(135deg, rgba(0,196,239,0.06), rgba(107,31,255,0.06))', border: '1px solid rgba(0,196,239,0.2)', borderRadius: '20px', padding: '24px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '48px', fontWeight: 900 }}>$35</div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>لمدة 30 يوم كاملة</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {['100 عملة متجددة', 'رافعة ديناميكية', 'Quality Score', 'إشعارات فورية'].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#9ca3af' }}>
                <span style={{ color: '#00c4ef' }}>✓</span> {f}
              </div>
            ))}
          </div>
        </div>

        {/* Contact card */}
        <div className="glass-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>💬</div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>للاشتراك تواصل معنا</h2>
          <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: 1.7, marginBottom: '28px' }}>
            راسلنا على تلقرام وسنفعّل اشتراكك خلال دقائق
          </p>

          <a
            href="https://t.me/devel_support"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '12px',
              background: 'linear-gradient(135deg, rgba(0,196,239,0.15), rgba(107,31,255,0.15))',
              border: '1px solid rgba(0,196,239,0.35)',
              color: '#00c4ef', textDecoration: 'none',
              fontWeight: 700, fontSize: '17px',
              padding: '16px 36px', borderRadius: '16px',
              marginBottom: '20px',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.7 8.02c-.12.55-.46.68-.93.43l-2.55-1.88-1.23 1.18c-.14.14-.25.25-.5.25l.18-2.56 4.6-4.16c.2-.18-.04-.28-.31-.1L7.5 15.04l-2.49-.78c-.54-.17-.55-.54.11-.8l9.72-3.75c.45-.17.84.1.7.79z" fill="currentColor"/>
            </svg>
            تواصل مع @devel_support
          </a>

          <div style={{ borderTop: '1px solid rgba(0,196,239,0.08)', paddingTop: '20px' }}>
            <p style={{ color: '#4b5563', fontSize: '13px', lineHeight: 1.7 }}>
              سيردّ عليك الدعم في أقرب وقت ويرشدك لخطوات الدفع وتفعيل الاشتراك
            </p>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link href="/dashboard" style={{ color: '#374151', fontSize: '13px', textDecoration: 'none' }}>رجوع للداشبورد ←</Link>
        </p>
      </div>
    </div>
  )
}
