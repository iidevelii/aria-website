'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

function DevelLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="26" cy="26" r="25" fill="#050508" stroke="rgba(255,255,255,0.14)" strokeWidth="1.6"/>
      <rect x="10" y="22" width="5" height="9" rx="1" fill="#00d4ff"/>
      <rect x="17" y="17" width="5" height="14" rx="1" fill="#00d4ff"/>
      <rect x="30" y="17" width="5" height="14" rx="1" fill="#7b2fff"/>
      <rect x="37" y="22" width="5" height="9" rx="1" fill="#7b2fff"/>
      <circle cx="26" cy="26" r="3" fill="white"/>
    </svg>
  )
}

export default function Home() {
  const [price, setPrice] = useState('...')
  const [change, setChange] = useState(0)

  useEffect(() => {
    fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT')
      .then(r => r.json())
      .then(d => {
        setPrice(parseFloat(d.lastPrice).toLocaleString())
        setChange(parseFloat(d.priceChangePercent))
      }).catch(() => {})
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#050508', color: 'white' }}>
      {/* ambient orbs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '20%', left: '30%', width: '600px', height: '400px', background: '#00d4ff', borderRadius: '50%', filter: 'blur(150px)', opacity: 0.04 }}/>
        <div style={{ position: 'absolute', top: '30%', right: '20%', width: '500px', height: '400px', background: '#7b2fff', borderRadius: '50%', filter: 'blur(150px)', opacity: 0.04 }}/>
      </div>
      {/* grid */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.02, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '50px 50px' }}/>

      {/* ===== HERO ===== */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px', position: 'relative' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>

          {/* live badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '100px', padding: '8px 20px', marginBottom: '40px', fontSize: '13px', color: '#00d4ff' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00ff88', display: 'inline-block', animation: 'pulse 2s infinite' }}/>
            النظام يعمل الآن — 100 عملة تحت المراقبة المستمرة
            <span style={{ color: '#374151', margin: '0 4px' }}>|</span>
            <span style={{ color: '#6b7280' }}>فحص كل 15 دقيقة</span>
          </div>

          {/* logo lockup */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '32px' }}>
            <DevelLogo size={52}/>
            <span style={{ fontSize: '38px', fontWeight: 900, letterSpacing: '-1px' }}>
              Devel<span style={{ color: '#00d4ff' }}>Bot</span>
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(48px, 7vw, 88px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-2px', marginBottom: '32px' }}>
            <span style={{ display: 'block', color: 'white' }}>تحليل دقيق للبيانات</span>
            <span style={{ display: 'block', background: 'linear-gradient(135deg, #00d4ff, #a78bfa, #7b2fff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              قرارات تداول واضحة
            </span>
          </h1>

          <p style={{ color: '#9ca3af', fontSize: '20px', lineHeight: 1.7, marginBottom: '48px', maxWidth: '640px', margin: '0 auto 48px' }}>
            Devel يراقب <strong style={{ color: 'white' }}>100 عملة</strong> على Binance Futures ويرسل إشارات <strong style={{ color: 'white' }}>عالية الجودة</strong> فوراً على تلقرام
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '64px' }}>
            <Link href="/register" style={{ background: 'linear-gradient(135deg, #00d4ff, #7b2fff)', color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: '17px', padding: '16px 36px', borderRadius: '16px', display: 'inline-block' }}>
              ابدأ مجاناً — 14 يوم
            </Link>
            <Link href="/dashboard" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: '17px', padding: '16px 36px', borderRadius: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              شوف الإشارات <span style={{ color: '#00d4ff' }}>←</span>
            </Link>
          </div>

          {/* stats strip */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '40px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '20px 40px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { value: '100+', label: 'عملة مراقبة' },
              { value: '6', label: 'استراتيجية' },
              { value: '24/7', label: 'مراقبة' },
              { value: '15M', label: 'تايم فريم الدخول' },
              { value: '14', label: 'يوم مجاناً' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 900, color: 'white' }}>{s.value}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <div style={{ color: '#00d4ff', fontSize: '12px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>المميزات</div>
            <h2 style={{ fontSize: '52px', fontWeight: 900, marginBottom: '16px' }}>كل ما تحتاجه</h2>
            <p style={{ color: '#6b7280', fontSize: '18px' }}>منظومة متكاملة مبنية على أحدث تقنيات تحليل السوق</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {[
              { icon: '🧠', tag: 'AI-Powered', title: '6 استراتيجيات مدمجة', desc: 'EMA Cross، RSI Divergence، BB Squeeze، VWAP، Pullback، RSI OB/OS', color: '#00d4ff' },
              { icon: '📊', tag: 'Multi-TF', title: 'تأكيد متعدد التايم فريم', desc: 'دخول 15M مع تأكيد 1H و4H وفلتر EMA200 الإلزامي', color: '#a78bfa' },
              { icon: '⚡', tag: 'Dynamic', title: 'رافعة ديناميكية', desc: 'البوت يحسب الرافعة المثلى تلقائياً بناءً على ATR والسيولة', color: '#fbbf24' },
              { icon: '🎯', tag: 'Precision', title: 'ATR True Range', desc: 'SL/TP دقيق مع نسبة مخاطرة ديناميكية 1:2 و1:3', color: '#34d399' },
              { icon: '🔔', tag: 'Instant', title: 'إشعارات فورية', desc: 'كل إشارة تصلك على تلقرام فوراً مع كامل التفاصيل', color: '#60a5fa' },
              { icon: '🌊', tag: 'Smart', title: '100 عملة يومياً', desc: 'فحص شامل كل 15 دقيقة بناءً على السيولة والنشاط', color: '#f472b6' },
            ].map((f, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${f.color}20`, borderRadius: '20px', padding: '28px' }}>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>{f.icon}</div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: f.color, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '10px' }}>{f.tag}</div>
                <h3 style={{ fontWeight: 800, fontSize: '17px', marginBottom: '10px' }}>{f.title}</h3>
                <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STEPS ===== */}
      <section style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <div style={{ color: '#00d4ff', fontSize: '12px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>البداية</div>
            <h2 style={{ fontSize: '52px', fontWeight: 900 }}>ابدأ في 3 خطوات</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { num: '01', title: 'سجّل حساب مجاني', desc: 'أنشئ حسابك في ثوانٍ بدون بطاقة ائتمان — 14 يوم تجربة كاملة', href: '/register', color: '#00d4ff' },
              { num: '02', title: 'اربط بوت التلقرام', desc: 'أرسل كود التفعيل لبوت @Devel100_bot وابدأ استقبال الإشارات فوراً', href: 'https://t.me/Devel100_bot', color: '#7b2fff' },
              { num: '03', title: 'تداول بثقة', desc: 'كل إشارة تصلك مع الاستراتيجية، الدخول، الهدف، الوقف، والرافعة', href: '/dashboard', color: '#34d399' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: '24px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px 28px' }}>
                <div style={{ fontSize: '48px', fontWeight: 900, color: s.color, opacity: 0.3, minWidth: '60px' }}>{s.num}</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontWeight: 800, fontSize: '18px', marginBottom: '6px' }}>{s.title}</h3>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>{s.desc}</p>
                </div>
                <Link href={s.href} style={{ color: s.color, textDecoration: 'none', fontWeight: 700, fontSize: '14px', border: `1px solid ${s.color}40`, padding: '8px 16px', borderRadius: '10px', whiteSpace: 'nowrap' }}>
                  ابدأ ←
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 style={{ fontSize: '52px', fontWeight: 900 }}>يثقون في Devel</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {[
              { name: 'أحمد م.', role: 'متداول فيوتشر', text: 'البوت وفّر علي ساعات من التحليل — الإشارات واضحة ومفصلة وتصل فوراً. الرافعة الديناميكية ميزة ممتازة' },
              { name: 'خالد ع.', role: 'مستثمر كريبتو', text: 'Quality Score يساعدني أختار الإشارات الأقوى فقط. من أفضل الأدوات للتداول على الفيوتشر' },
              { name: 'سارة ف.', role: 'متداولة مبتدئة', text: 'سهل الاستخدام جداً — سجلت وربطت التلقرام في دقيقتين وبدأت استقبال الإشارات فوراً' },
            ].map((t, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '28px' }}>
                <div style={{ marginBottom: '16px' }}>{'★★★★★'.split('').map((s, j) => <span key={j} style={{ color: '#fbbf24' }}>{s}</span>)}</div>
                <p style={{ color: '#d1d5db', lineHeight: 1.7, fontSize: '15px', marginBottom: '24px' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #00d4ff, #7b2fff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '14px' }}>{t.name[0]}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{t.name}</div>
                    <div style={{ color: '#6b7280', fontSize: '12px' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <div style={{ color: '#00d4ff', fontSize: '12px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>الأسعار</div>
            <h2 style={{ fontSize: '52px', fontWeight: 900 }}>بسيط وشفاف</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '36px' }}>
              <div style={{ color: '#6b7280', fontSize: '12px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '24px' }}>تجربة مجانية</div>
              <div style={{ fontSize: '64px', fontWeight: 900, marginBottom: '4px' }}>$0</div>
              <div style={{ color: '#6b7280', marginBottom: '32px' }}>لمدة 14 يوم كاملة</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                {['كامل الإشارات', 'ربط التلقرام', 'الداشبورد الكامل', 'بدون بطاقة'].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#9ca3af' }}>
                    <span style={{ color: '#00ff88' }}>✓</span> {item}
                  </div>
                ))}
              </div>
              <Link href="/register" style={{ display: 'block', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)', color: 'white', textDecoration: 'none', fontWeight: 700, padding: '14px', borderRadius: '14px', fontSize: '15px' }}>
                ابدأ مجاناً
              </Link>
            </div>
            <div style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.06), rgba(123,47,255,0.06))', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '24px', padding: '36px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-14px', right: '24px', background: 'linear-gradient(135deg, #00d4ff, #7b2fff)', color: 'white', fontSize: '12px', fontWeight: 800, padding: '6px 16px', borderRadius: '100px' }}>الأكثر شعبية</div>
              <div style={{ color: '#00d4ff', fontSize: '12px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '24px' }}>احترافي</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '64px', fontWeight: 900 }}>$35</span>
                <span style={{ color: '#6b7280', marginBottom: '12px' }}>/ 30 يوم</span>
              </div>
              <div style={{ color: '#6b7280', marginBottom: '32px' }}>وصول كامل بدون قيود</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                {['كل مميزات المجاني', '100 عملة متجددة', 'رافعة ديناميكية', 'Quality Score', 'دعم فوري'].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#d1d5db' }}>
                    <span style={{ color: '#00d4ff' }}>✓</span> {item}
                  </div>
                ))}
              </div>
              <Link href="/subscribe" style={{ display: 'block', textAlign: 'center', background: 'linear-gradient(135deg, #00d4ff, #7b2fff)', color: 'white', textDecoration: 'none', fontWeight: 800, padding: '14px', borderRadius: '14px', fontSize: '15px' }}>
                اشترك الآن
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section style={{ padding: '120px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '500px', height: '300px', background: '#7b2fff', borderRadius: '50%', filter: 'blur(120px)', opacity: 0.08, pointerEvents: 'none' }}/>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <h2 style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 900, lineHeight: 1.1, marginBottom: '24px' }}>
            ابدأ التداول
            <br />
            <span style={{ background: 'linear-gradient(135deg, #00d4ff, #7b2fff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              بالذكاء الحين
            </span>
          </h2>
          <p style={{ color: '#6b7280', fontSize: '18px', marginBottom: '48px' }}>انضم الآن وابدأ تجربتك المجانية — لا بطاقة، لا التزامات</p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" style={{ background: 'white', color: 'black', textDecoration: 'none', fontWeight: 800, fontSize: '17px', padding: '16px 40px', borderRadius: '16px' }}>
              ابدأ مجاناً الآن
            </Link>
            <Link href="/dashboard" style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: '17px', padding: '16px 40px', borderRadius: '16px' }}>
              شوف الإشارات
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '60px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '40px', marginBottom: '48px' }}>
            <div style={{ maxWidth: '280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <DevelLogo size={28}/>
                <span style={{ fontWeight: 900, fontSize: '18px' }}>Devel<span style={{ color: '#00d4ff' }}>Bot</span></span>
              </div>
              <p style={{ color: '#4b5563', fontSize: '14px', lineHeight: 1.7 }}>منصة إشارات تداول الفيوتشر المدعومة بالذكاء الاصطناعي</p>
              <a href="https://twitter.com/devel_l" target="_blank" style={{ color: '#00d4ff', fontSize: '14px', textDecoration: 'none', display: 'inline-block', marginTop: '12px' }}>@devel_l — Eng. Mohammed Eid</a>
            </div>
            <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
              {[
                { title: 'المنتج', links: [['الإشارات', '/dashboard'], ['السوق', '/dashboard'], ['الأخبار', '/dashboard'], ['الأسعار', '/subscribe']] },
                { title: 'الحساب', links: [['تسجيل', '/register'], ['دخول', '/login'], ['اشتراك', '/subscribe']] },
                { title: 'تواصل', links: [['تلقرام', 'https://t.me/Devel100_bot'], ['تويتر', 'https://twitter.com/devel_l'], ['القناة', 'https://t.me/DevilAISignals']] },
              ].map((col, i) => (
                <div key={i}>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px' }}>{col.title}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {col.links.map(([label, href], j) => (
                      <Link key={j} href={href} style={{ color: '#4b5563', textDecoration: 'none', fontSize: '14px' }}>{label}</Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ color: '#374151', fontSize: '13px' }}>© 2026 DevelBot — جميع الحقوق محفوظة</div>
            <div style={{ color: '#1f2937', fontSize: '12px', maxWidth: '400px', textAlign: 'center' }}>للأغراض التعليمية فقط. التداول ينطوي على مخاطر.</div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
