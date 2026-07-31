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

export default function PrivacyPage() {
  const { t } = useLang()
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: '48px 20px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: 'var(--fs-h1)', fontWeight: 900, marginBottom: '8px' }}>{t('سياسة الخصوصية', 'Privacy Policy')}</h1>
          <p style={{ color: 'var(--muted)', fontSize: '13px' }}>{t('آخر تحديث: يوليو 2026', 'Last updated: July 2026')}</p>
        </div>

        <Section title={t('١. البيانات التي نجمعها', '1. Data we collect')}>
          {t(
            'عند إنشاء حساب نجمع اسم المستخدم والبريد الإلكتروني وكلمة مرور مشفّرة. إذا ربطت حسابك بتلقرام، نخزّن معرّف تلقرام (Telegram ID) لإرسال الإشارات لك. نخزّن أيضاً تفضيلاتك (نوع الإشارات، العملات المستبعدة شخصياً) لتخصيص تجربتك. لا نطلب ولا نخزّن أي بيانات بطاقات دفع على منصتنا — التفعيل يتم يدوياً عبر الدعم.',
            'When you create an account we collect your username, email, and an encrypted password. If you link your account to Telegram, we store your Telegram ID to deliver signals to you. We also store your preferences (signal types, personally excluded coins) to personalize your experience. We do not request or store any payment card data on our platform — activation is handled manually through support.'
          )}
        </Section>

        <Section title={t('٢. كيف نستخدم بياناتك', '2. How we use your data')}>
          {t(
            'نستخدم بياناتك فقط لتشغيل الخدمة: تسجيل الدخول، إرسال الإشارات على الموقع وتلقرام، وتذكّر تفضيلاتك. لا نبيع بياناتك لأي طرف ثالث، ولا نستخدمها لأغراض إعلانية.',
            "We use your data solely to operate the service: authenticating you, delivering signals on the website and Telegram, and remembering your preferences. We do not sell your data to any third party, and we do not use it for advertising purposes."
          )}
        </Section>

        <Section title={t('٣. بيانات السوق من أطراف ثالثة', '3. Third-party market data')}>
          {t(
            'يعرض الموقع أسعاراً وبيانات سوق حية من مصادر عامة مثل Binance وCoinGecko وAlternative.me، تُستدعى مباشرة من متصفحك لعرض الأسعار الحالية. هذه الطلبات لا تحمل بيانات حسابك الشخصية.',
            'The site displays live prices and market data from public sources such as Binance, CoinGecko, and Alternative.me, called directly from your browser to display current prices. These requests do not carry your personal account data.'
          )}
        </Section>

        <Section title={t('٤. التخزين المحلي (Local Storage)', '4. Local storage')}>
          {t(
            'نستخدم التخزين المحلي بمتصفحك لحفظ رمز الدخول (Token) وبعض الإعدادات مثل المحفظة التجريبية واستراتيجياتك المحفوظة وتنبيهات الأسعار — هذه البيانات تبقى على جهازك ولا تُرسل لسيرفراتنا إلا عند الحاجة الفعلية (مثل جلب بيانات حسابك).',
            'We use your browser\'s local storage to save your login token and certain settings such as the paper-trading portfolio, saved strategies, and price alerts — this data stays on your device and is only sent to our servers when actually needed (such as fetching your account data).'
          )}
        </Section>

        <Section title={t('٥. أمن البيانات', '5. Data security')}>
          {t(
            'نستخدم اتصالات مشفّرة (HTTPS) لكل التفاعل مع سيرفراتنا، وكلمات المرور تُخزَّن بصيغة مشفّرة لا يمكن استرجاعها كنص عادي.',
            'We use encrypted connections (HTTPS) for all interaction with our servers, and passwords are stored in an encrypted form that cannot be retrieved as plain text.'
          )}
        </Section>

        <Section title={t('٦. حقوقك', '6. Your rights')}>
          {t(
            'يمكنك طلب حذف حسابك وبياناتك بالكامل بالتواصل معنا عبر تلقرام في أي وقت.',
            'You may request full deletion of your account and data by contacting us via Telegram at any time.'
          )}
        </Section>

        <Section title={t('٧. التواصل', '7. Contact')}>
          {t('لأي استفسار عن الخصوصية، راسلنا على ', 'For any privacy questions, message us at ')}
          <a href="https://t.me/devel_support" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--cyan)' }}>@devel_support</a>.
        </Section>

        <p style={{ marginTop: '32px' }}>
          <Link href="/" style={{ color: 'var(--cyan)', fontSize: '13px', textDecoration: 'none' }}>{t('← رجوع للرئيسية', '← Back to homepage')}</Link>
        </p>
      </div>
    </div>
  )
}
