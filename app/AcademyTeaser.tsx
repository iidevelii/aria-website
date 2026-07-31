'use client'
import Link from 'next/link'
import { useLang } from './layout'

/** بادج/بانر ترويجي لأكاديمية DevelBot — رسمة SVG بأسلوب "فلات إلستريشن"
 * (شخصيات مسطّحة + ألوان جريئة + أشكال هندسية بالخلفية) بنفس هوية مرجع
 * المستخدم، محصورة داخل بطاقة فاتحة كجزيرة لونية وسط تصميم الموقع الداكن. */
export default function AcademyTeaser() {
  const { t } = useLang()
  return (
    <section className="section">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Link href="/academy" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <div className="academy-teaser-card" style={{
            background: 'linear-gradient(135deg, #eef1fb 0%, #fdf3e7 100%)',
            borderRadius: '24px', overflow: 'hidden', position: 'relative',
            display: 'grid', gridTemplateColumns: '1fr 340px', alignItems: 'center',
            border: '1px solid rgba(46,58,140,0.12)', cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}>
            <div style={{ padding: '40px 44px', position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(46,58,140,0.08)', borderRadius: '20px', padding: '5px 14px', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#2e3a8c' }}>🎓 {t('مجاناً للجميع', 'Free for everyone')}</span>
              </div>
              <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 900, color: '#1a2050', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
                {t('تعلّم التحليل الفني من الصفر', 'Learn technical analysis from scratch')}
              </h2>
              <p style={{ color: '#4a5178', fontSize: '15px', lineHeight: 1.7, margin: '0 0 20px', maxWidth: '480px' }}>
                {t('أكاديمية DevelBot: الشموع اليابانية، النماذج السعرية، المؤشرات الفنية، الدعوم والمقاومات، وإدارة المخاطر، بالعربي، بأمثلة، ومربوط مباشرة بمميزات البوت.', "DevelBot Academy: Japanese candlesticks, chart patterns, technical indicators, support & resistance, and risk management, in Arabic, with examples, and linked directly to the bot's features.")}
              </p>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '14px', color: '#2e3a8c' }}>
                {t('ابدأ التعلم', 'Start learning')} {t('←', '→')}
              </span>
            </div>
            <div style={{ position: 'relative', height: '260px' }}>
              <svg viewBox="0 0 340 260" style={{ width: '100%', height: '100%', display: 'block' }}>
                {/* أشكال هندسية بالخلفية */}
                <circle cx="255" cy="115" r="115" fill="#2e3a8c" opacity="0.9" />
                <path d="M 130 260 A 140 140 0 0 1 340 190 L 340 260 Z" fill="#f5a623" opacity="0.95" />
                <circle cx="55" cy="215" r="20" fill="#ef5350" opacity="0.9" />

                {/* شخصية مسطحة تراقب شارت صاعد */}
                <g transform="translate(150,60)">
                  {/* الجسم */}
                  <rect x="10" y="80" width="60" height="90" rx="14" fill="#2e3a8c" />
                  <rect x="10" y="80" width="60" height="34" rx="14" fill="#eef1fb" />
                  {/* الرأس */}
                  <circle cx="40" cy="55" r="26" fill="#f4a88e" />
                  {/* خوذة/قبعة */}
                  <path d="M 12 48 A 28 28 0 0 1 68 48 L 68 54 L 12 54 Z" fill="#f5a623" />
                  <rect x="8" y="52" width="64" height="8" rx="4" fill="#f5a623" />
                  {/* ذراع تشاور على شارت */}
                  <rect x="62" y="95" width="45" height="14" rx="7" fill="#f4a88e" transform="rotate(-18 62 95)" />
                </g>

                {/* لوحة شارت صاعد بيد الشخصية */}
                <g transform="translate(205,95)">
                  <rect x="0" y="0" width="86" height="64" rx="8" fill="#ffffff" />
                  <polyline points="8,50 22,38 36,44 50,24 64,30 78,10" fill="none" stroke="#00c4ef" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="78" cy="10" r="5" fill="#00e664" />
                </g>

                {/* عملة بيتكوين عائمة */}
                <g transform="translate(48,60)">
                  <circle r="22" fill="#f5a623" />
                  <circle r="22" fill="none" stroke="#fff" strokeWidth="2" opacity="0.5" />
                  <text x="0" y="8" textAnchor="middle" fontSize="24" fontWeight="900" fill="#fff">₿</text>
                </g>
              </svg>
            </div>
          </div>
        </Link>
      </div>
    </section>
  )
}
