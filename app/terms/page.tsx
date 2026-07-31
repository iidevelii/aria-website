'use client'
import Link from 'next/link'
import { useLang } from '../layout'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '26px' }}>
      <h2 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '8px', color: 'var(--text)' }}>{title}</h2>
      <div style={{ color: 'var(--muted)', fontSize: '13.5px', lineHeight: 1.85 }}>{children}</div>
    </div>
  )
}

export default function TermsPage() {
  const { t } = useLang()
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: '48px 20px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: 'var(--fs-h1)', fontWeight: 900, marginBottom: '8px' }}>{t('الشروط والأحكام', 'Terms & Conditions')}</h1>
          <p style={{ color: 'var(--muted)', fontSize: '13px' }}>{t('آخر تحديث: يوليو 2026', 'Last updated: July 2026')}</p>
        </div>

        <Section title={t('١. طبيعة الخدمة', '1. Nature of the service')}>
          {t(
            'DevelBot منصة تحليل فني آلي تراقب بيانات السوق وتُرسل إشارات وتنبيهات وفق شروط تقنية مُعرَّفة مسبقاً. الخدمة تعليمية وتحليلية بطبيعتها، ولا تُعتبر بأي حال توصية استثمارية أو نصيحة مالية مرخّصة.',
            'DevelBot is an automated technical-analysis platform that monitors market data and sends signals and alerts based on predefined technical criteria. The service is educational and analytical in nature, and does not constitute an investment recommendation or licensed financial advice under any circumstances.'
          )}
        </Section>

        <Section title={t('٢. مسؤوليات الحساب', '2. Account responsibilities')}>
          {t(
            'أنت مسؤول عن الحفاظ على سرية بيانات دخولك، وعن أي نشاط يحدث من حسابك. يجب تزويدنا بمعلومات دقيقة عند التسجيل.',
            'You are responsible for keeping your login credentials confidential, and for any activity that occurs under your account. You must provide accurate information when registering.'
          )}
        </Section>

        <Section title={t('٣. الاشتراك والدفع', '3. Subscription & payment')}>
          {t(
            'التفعيل والتجديد يتمّان يدوياً عبر التواصل مع فريق الدعم على تلقرام. لا يوجد تجديد تلقائي — ينتهي الوصول تلقائياً بانتهاء المدة المدفوعة ما لم يُجدَّد. أي استفسار متعلق برد المبلغ يُدرَس حالة بحالة عبر التواصل المباشر مع الدعم.',
            'Activation and renewal are handled manually by contacting the support team on Telegram. There is no auto-renewal — access automatically ends when the paid period expires unless renewed. Any refund inquiry is reviewed on a case-by-case basis through direct contact with support.'
          )}
        </Section>

        <Section title={t('٤. الاستخدام المقبول', '4. Acceptable use')}>
          {t(
            'يُمنع استخدام الحساب لأي غرض غير قانوني، أو مشاركة رقم تحويل واحد (TXID) بين أكثر من حساب، أو محاولة الوصول غير المصرّح به لأنظمتنا.',
            'It is prohibited to use your account for any unlawful purpose, share a single transfer number (TXID) across more than one account, or attempt unauthorized access to our systems.'
          )}
        </Section>

        <Section title={t('٥. إخلاء المسؤولية', '5. Disclaimer of liability')}>
          {t(
            'لا نتحمل أي مسؤولية عن خسائر مالية ناتجة عن قرارات تداول اتُّخذت بناءً على إشارات أو تحليلات المنصة. الخدمة تُقدَّم "كما هي" بدون أي ضمانات صريحة أو ضمنية بشأن الدقة أو الربحية. راجع صفحة',
            'We accept no liability for financial losses resulting from trading decisions made based on the platform\'s signals or analysis. The service is provided "as is" without any express or implied warranties regarding accuracy or profitability. See our'
          )} <Link href="/risk-disclaimer" style={{ color: 'var(--cyan)' }}>{t('تنبيه المخاطر', 'risk disclaimer')}</Link> {t('لتفاصيل أوسع.', 'for more detail.')}
        </Section>

        <Section title={t('٦. إنهاء الخدمة', '6. Termination')}>
          {t(
            'نحتفظ بالحق في تعليق أو إنهاء أي حساب يخالف هذه الشروط دون إشعار مسبق.',
            'We reserve the right to suspend or terminate any account that violates these terms without prior notice.'
          )}
        </Section>

        <Section title={t('٧. تعديل الشروط', '7. Changes to these terms')}>
          {t(
            'قد نحدّث هذه الشروط من وقت لآخر. استمرارك باستخدام المنصة بعد أي تعديل يعني موافقتك على الشروط المحدَّثة.',
            'We may update these terms from time to time. Continuing to use the platform after any change constitutes acceptance of the updated terms.'
          )}
        </Section>

        <p style={{ marginTop: '32px' }}>
          <Link href="/" style={{ color: 'var(--cyan)', fontSize: '13px', textDecoration: 'none' }}>{t('← رجوع للرئيسية', '← Back to homepage')}</Link>
        </p>
      </div>
    </div>
  )
}
