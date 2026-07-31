'use client'
import { useLang } from '../layout'

export default function ContactPage() {
  const { t } = useLang()

  const channels = [
    {
      emoji: '💬', title: t('الدعم عبر تلقرام', 'Telegram Support'),
      desc: t('لأي استفسار عن الحساب أو الاشتراك أو مشكلة تقنية — أسرع طريقة توصلنا فيها.', 'For any question about your account, subscription, or a technical issue — the fastest way to reach us.'),
      href: 'https://t.me/devel_support', label: '@devel_support',
    },
    {
      emoji: '🤖', title: t('بوت تلقرام', 'Telegram Bot'),
      desc: t('البوت الرسمي لاستلام الإشارات وإدارة اشتراكك مباشرة من تلقرام.', 'The official bot for receiving signals and managing your subscription directly from Telegram.'),
      href: 'https://t.me/Develpay_bot', label: '@Develpay_bot',
    },
    {
      emoji: '📢', title: t('قناة تلقرام', 'Telegram Channel'),
      desc: t('تحديثات المنصة والإعلانات المهمة.', 'Platform updates and important announcements.'),
      href: 'https://t.me/DevilAISignals', label: '@DevilAISignals',
    },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: '48px 20px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: 'var(--fs-h1)', fontWeight: 900, marginBottom: '8px' }}>{t('تواصل معنا', 'Contact Us')}</h1>
          <p style={{ color: 'var(--muted)', fontSize: '15px' }}>{t('كل قنوات التواصل الرسمية بمكان واحد', 'All official contact channels in one place')}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {channels.map((c, i) => (
            <a key={i} href={c.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', boxShadow: 'var(--shadow-card)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(0,196,239,0.1)', border: '1px solid rgba(0,196,239,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>{c.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '15px', marginBottom: '4px' }}>{c.title}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '13px', lineHeight: 1.6 }}>{c.desc}</div>
                </div>
                <div style={{ color: 'var(--cyan)', fontWeight: 700, fontSize: '13px', whiteSpace: 'nowrap' }}>{c.label} ←</div>
              </div>
            </a>
          ))}
        </div>

        <p style={{ color: 'var(--muted)', fontSize: '12.5px', textAlign: 'center', marginTop: '28px', lineHeight: 1.7 }}>
          {t('نرد عادةً خلال دقائق خلال ساعات العمل. لأي مشكلة بالدفع أو التفعيل، أرسل تفاصيل عملية التحويل مباشرة.', "We typically reply within minutes during working hours. For any payment or activation issue, send your transfer details directly.")}
        </p>
      </div>
    </div>
  )
}
