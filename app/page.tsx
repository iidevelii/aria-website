'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

/* ── Logo ── */
function Logo({ size = 28 }: { size?: number }) {
  return (
    <img src="/logo.png" alt="DevelBot" style={{ height: size, width: 'auto', display: 'block', borderRadius: '6px', background: '#fff', padding: '3px' }}/>
  )
}

/* ── Static signal row for hero preview ── */
function SigRow({ pair, side, entry, tp, score, pct, age }: {
  pair: string; side: 'LONG'|'SHORT'; entry: string; tp: string; score: number; pct: string; age: string
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px' }}>
      <span style={{ fontWeight: 800, minWidth: '90px', fontFamily: 'var(--mono)' }}>{pair}</span>
      <span className={side === 'LONG' ? 'pill-long' : 'pill-short'}>{side}</span>
      <span style={{ color: '#5a6272', fontFamily: 'var(--mono)', fontSize: '12px', flex: 1 }}>${entry}</span>
      <span style={{ color: '#00e664', fontFamily: 'var(--mono)', fontSize: '12px', minWidth: '72px', textAlign: 'left' }}>→ ${tp}</span>
      <span style={{ color: '#00c4ef', fontWeight: 700, fontFamily: 'var(--mono)', minWidth: '38px', textAlign: 'right' }}>{score}</span>
      <span style={{ color: side === 'LONG' ? '#00e664' : '#ff4455', fontFamily: 'var(--mono)', minWidth: '52px', textAlign: 'right' }}>{pct}</span>
      <span style={{ color: '#2a2e38', fontSize: '11px', minWidth: '36px', textAlign: 'right' }}>{age}</span>
    </div>
  )
}

/* ── Telegram message mockup ── */
function TgMsg({ text, time }: { text: string; time: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '8px' }}>
      <div style={{ background: '#1c2333', borderRadius: '12px 12px 12px 2px', padding: '10px 14px', maxWidth: '300px' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', lineHeight: 1.7, color: '#c9d1e0', whiteSpace: 'pre-wrap' }}>{text}</div>
        <div style={{ fontSize: '10px', color: '#3d4d66', marginTop: '4px', textAlign: 'right' }}>{time} ✓✓</div>
      </div>
    </div>
  )
}

export default function Home() {
  const [btcPrice, setBtcPrice] = useState<string|null>(null)
  const [btcChg, setBtcChg] = useState(0)

  useEffect(() => {
    fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT')
      .then(r => r.json())
      .then(d => { setBtcPrice(parseFloat(d.lastPrice).toLocaleString()); setBtcChg(parseFloat(d.priceChangePercent)) })
      .catch(() => {})
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>

      {/* ══ NAV ══ */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid var(--border)', background: 'rgba(8,9,15,0.85)', backdropFilter: 'blur(16px)', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}>
          <Logo size={36}/>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {[['الإشارات','/dashboard'],['الأسعار','/subscribe'],['تواصل','https://t.me/devel_support']].map(([label,href]) => (
            <Link key={href} href={href} style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, padding: '6px 12px', borderRadius: '6px', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color='var(--text)')}
              onMouseLeave={e => (e.currentTarget.style.color='var(--muted)')}
            >{label}</Link>
          ))}
          <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 6px' }}/>
          <Link href="/login" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, padding: '6px 12px' }}>دخول</Link>
          <Link href="/register" className="btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>ابدأ مجاناً ←</Link>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px 80px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>
        {/* Left — copy */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,230,100,0.08)', border: '1px solid rgba(0,230,100,0.18)', borderRadius: '6px', padding: '5px 12px', marginBottom: '28px' }}>
            <span className="live-dot"/>
            <span style={{ fontSize: '12px', color: '#00e664', fontWeight: 600 }}>online · 100+ عملة · فحص كل 15 دقيقة</span>
          </div>

          <h1 style={{ fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: '20px' }}>
            إشارات كريبتو<br/>
            <span className="gradient-text">+ بوت تلقرام.</span><br/>
            اشتراك واحد.
          </h1>

          <p style={{ color: 'var(--muted)', fontSize: '16px', lineHeight: 1.75, marginBottom: '36px', maxWidth: '400px' }}>
            DevelBot يراقب Binance Spot و Futures ويرسل إشارات عالية الجودة فوراً — مع الدخول، الهدف، الوقف، والرافعة.
          </p>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '48px' }}>
            <Link href="/register" className="btn-primary" style={{ padding: '12px 28px', fontSize: '15px', borderRadius: '8px' }}>ابدأ مجاناً — 14 يوم ←</Link>
            <Link href="/dashboard" className="btn-ghost" style={{ padding: '12px 24px', fontSize: '15px', borderRadius: '8px' }}>شوف الإشارات</Link>
          </div>

          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
            {[
              { v: '100+', l: 'عملة' },
              { v: '~60%', l: 'معدل الفوز' },
              { v: '24/7', l: 'مراقبة' },
              { v: '$0', l: '14 يوم' },
            ].map((s,i) => (
              <div key={i}>
                <div style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{s.v}</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — signal feed preview */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>آخر الإشارات</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="live-dot"/>
              <span style={{ fontSize: '11px', color: '#00e664' }}>live</span>
            </div>
          </div>
          <div style={{ padding: '4px 16px 4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', fontSize: '10px', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid rgba(255,255,255,0.04)', fontWeight: 700 }}>
              <span style={{ minWidth: '90px' }}>زوج</span>
              <span style={{ minWidth: '42px' }}>جانب</span>
              <span style={{ flex: 1 }}>دخول</span>
              <span style={{ minWidth: '72px' }}>هدف</span>
              <span style={{ minWidth: '38px', textAlign: 'right' }}>Score</span>
              <span style={{ minWidth: '52px', textAlign: 'right' }}>P&L</span>
              <span style={{ minWidth: '36px', textAlign: 'right' }}>وقت</span>
            </div>
            <SigRow pair="INJ/USDT"    side="LONG"  entry="24.31"     tp="27.89"    score={82} pct="+11.2%" age="2h" />
            <SigRow pair="SOL/USDT"    side="LONG"  entry="162.40"    tp="186.50"   score={79} pct="+7.4%"  age="5h" />
            <SigRow pair="FLOKI/USDT"  side="SHORT" entry="0.0001840" tp="0.0001590" score={74} pct="+13.6%" age="8h" />
            <SigRow pair="XLM/USDT"    side="SHORT" entry="0.2841"    tp="0.2450"   score={71} pct="+5.8%"  age="11h"/>
            <SigRow pair="AVAX/USDT"   side="LONG"  entry="35.12"     tp="40.30"    score={68} pct="+3.1%"  age="1d" />
          </div>
          <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>هذه بيانات توضيحية</span>
            <Link href="/dashboard" style={{ fontSize: '12px', color: 'var(--cyan)', textDecoration: 'none', fontWeight: 700 }}>الإشارات الحقيقية ←</Link>
          </div>
        </div>
      </section>

      {/* ══ 01 · الداشبورد ══ */}
      <section className="section">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '40px' }}>
            <div className="section-eyebrow">01 · الداشبورد</div>
            <h2 className="section-title">كل إشاراتك في مكان واحد</h2>
            <p className="section-sub">لوحة تحكم حية — كل صفقة ببوكس مستقل مع السعر الحالي ونسبة الربح أو الخسارة.</p>
          </div>

          {/* mock signal cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
            {[
              { pair: 'INJ/USDT',   side: 'LONG',  type: 'FUTURES', entry: '24.31',     tp: '27.89',    sl: '22.80', tpp: '+14.8%', slp: '-6.2%', cur: '26.87', score: 82, pnl: '+10.5%', status: 'OPEN' },
              { pair: 'SOL/USDT',   side: 'LONG',  type: 'SPOT',    entry: '162.40',    tp: '186.50',   sl: '150.00', tpp: '+14.8%', slp: '-7.6%', cur: '174.20', score: 79, pnl: '+7.3%',  status: 'OPEN' },
              { pair: 'FLOKI/USDT', side: 'SHORT', type: 'FUTURES', entry: '0.0001840', tp: '0.0001590', sl: '0.0001990', tpp: '+13.6%', slp: '-8.2%', cur: '0.0001650', score: 74, pnl: '+10.3%', status: 'WIN' },
            ].map((s,i) => (
              <div key={i} className="signal-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 900, fontSize: '16px' }}>{s.pair}</span>
                    <span className={s.side === 'LONG' ? 'pill-long' : 'pill-short'}>{s.side}</span>
                    <span className="pill-type">{s.type}</span>
                    <span className={s.status === 'WIN' ? 'pill-win' : 'pill-open'}>
                      {s.status === 'WIN' ? '✓ ربح' : '● مفتوحة'}
                    </span>
                  </div>
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: '9px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Score</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--cyan)', lineHeight: 1 }}>{s.score}</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '6px' }}>
                  <div className="price-box">
                    <div style={{ fontSize: '9px', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>دخول</div>
                    <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: '12px' }}>${s.entry}</div>
                  </div>
                  <div style={{ background: 'rgba(0,230,100,0.05)', border: '1px solid rgba(0,230,100,0.14)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '9px', color: 'var(--green)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>هدف</div>
                    <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: '12px', color: 'var(--green)' }}>${s.tp}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(0,230,100,0.5)', marginTop: '2px' }}>{s.tpp}</div>
                  </div>
                  <div style={{ background: 'rgba(255,68,85,0.05)', border: '1px solid rgba(255,68,85,0.14)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '9px', color: 'var(--red)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>وقف</div>
                    <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: '12px', color: 'var(--red)' }}>${s.sl}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,68,85,0.5)', marginTop: '2px' }}>{s.slp}</div>
                  </div>
                  <div style={{ background: 'rgba(0,196,239,0.05)', border: '1px solid rgba(0,196,239,0.14)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', marginBottom: '4px' }}>
                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--cyan)', display: 'inline-block', animation: 'pulse 2s infinite' }}/>
                      <span style={{ fontSize: '9px', color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>الآن</span>
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: '12px', color: 'var(--green)' }}>${s.cur}</div>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--green)', marginTop: '2px' }}>{s.pnl}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <Link href="/dashboard" className="btn-ghost" style={{ padding: '10px 28px', fontSize: '13px' }}>فتح الداشبورد ←</Link>
          </div>
        </div>
      </section>

      {/* ══ 02 · تلقرام ══ */}
      <section className="section">
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>
          <div>
            <div className="section-eyebrow">02 · تلقرام</div>
            <h2 className="section-title">كل إشارة تجيك فوراً</h2>
            <p className="section-sub">بمجرد اكتشاف فرصة، البوت يرسل تفاصيل كاملة على تلقرامك — الزوج، الجانب، الدخول، الهدف، الوقف، الرافعة، والـ Score.</p>
            <div style={{ marginTop: '28px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a href="https://t.me/Devel100_bot" target="_blank" className="btn-primary" style={{ padding: '10px 22px', fontSize: '13px' }}>فتح البوت في تلقرام ↗</a>
              <Link href="/register" className="btn-ghost" style={{ padding: '10px 20px', fontSize: '13px' }}>سجّل للحصول على الكود</Link>
            </div>
          </div>
          {/* Telegram UI mockup */}
          <div style={{ background: '#0e1218', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ background: '#161b26', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #00c4ef, #6b1fff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '14px' }}>D</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '13px' }}>DevelBot</div>
                <div style={{ fontSize: '11px', color: '#3d8b6e' }}>online</div>
              </div>
            </div>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px', minHeight: '260px' }}>
              <TgMsg
                text={`🟢 LONG · FUTURES\n━━━━━━━━━━━━━━\n📌 INJ/USDT\n\n🎯 دخول:   $24.31\n✅ هدف:    $27.89 (+14.8%)\n🛑 وقف:    $22.80 (-6.2%)\n⚡ رافعة:  ×5\n\n🤖 Score: 82/100\n📊 RSI Dip · Spot v11`}
                time="14:22"
              />
              <TgMsg
                text={`🔴 SHORT · FUTURES\n━━━━━━━━━━━━━━\n📌 FLOKI/USDT\n\n🎯 دخول:   $0.0001840\n✅ هدف:    $0.0001590 (+13.6%)\n🛑 وقف:    $0.0001990 (-8.2%)\n⚡ رافعة:  ×3\n\n🤖 Score: 74/100\n📊 RSI OB · Futures v13`}
                time="09:47"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ══ 03 · البداية ══ */}
      <section className="section">
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ marginBottom: '40px', textAlign: 'center' }}>
            <div className="section-eyebrow">03 · البداية</div>
            <h2 className="section-title" style={{ textAlign: 'center' }}>3 خطوات وتبدأ</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { n: '01', title: 'سجّل مجاناً', desc: 'حساب في ثوانٍ — بدون بطاقة ائتمان، 14 يوم تجربة كاملة', href: '/register', cta: 'سجّل ←' },
              { n: '02', title: 'اربط بوت التلقرام', desc: 'أرسل كود التفعيل لـ @DevelBot وابدأ استقبال الإشارات فوراً', href: 'https://t.me/Devel100_bot', cta: 'فتح ↗' },
              { n: '03', title: 'تداول بثقة', desc: 'كل إشارة تصلك مع الاستراتيجية، الدخول، الهدف، الوقف، والرافعة', href: '/dashboard', cta: 'الإشارات ←' },
            ].map((s,i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px 24px' }}>
                <span style={{ fontSize: '36px', fontWeight: 900, color: 'var(--dim)', minWidth: '48px', fontVariantNumeric: 'tabular-nums' }}>{s.n}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '16px', marginBottom: '4px' }}>{s.title}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '13px', lineHeight: 1.6 }}>{s.desc}</div>
                </div>
                <Link href={s.href} style={{ color: 'var(--cyan)', textDecoration: 'none', fontWeight: 700, fontSize: '13px', background: 'rgba(0,196,239,0.07)', border: '1px solid rgba(0,196,239,0.18)', padding: '8px 16px', borderRadius: '7px', whiteSpace: 'nowrap' }}>{s.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ الأسعار ══ */}
      <section className="section">
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div className="section-eyebrow">الأسعار</div>
            <h2 className="section-title" style={{ textAlign: 'center' }}>بسيط وشفاف</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '32px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '20px' }}>تجربة مجانية</div>
              <div style={{ fontSize: '52px', fontWeight: 900, marginBottom: '4px', letterSpacing: '-0.03em' }}>$0</div>
              <div style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '28px' }}>14 يوم كاملة</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                {['كامل الإشارات','ربط التلقرام','الداشبورد الكامل','بدون بطاقة'].map((item,i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#9ca3af' }}>
                    <span style={{ color: 'var(--green)', fontWeight: 700 }}>✓</span> {item}
                  </div>
                ))}
              </div>
              <Link href="/register" className="btn-ghost" style={{ display: 'block', textAlign: 'center', width: '100%', padding: '12px' }}>ابدأ مجاناً</Link>
            </div>
            <div style={{ background: 'var(--surface)', border: '1px solid rgba(0,196,239,0.28)', borderRadius: '14px', padding: '32px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-11px', right: '20px', background: 'var(--cyan)', color: '#000', fontSize: '11px', fontWeight: 800, padding: '4px 12px', borderRadius: '5px' }}>الأشهر</div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '20px' }}>احترافي</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', marginBottom: '4px' }}>
                <span style={{ fontSize: '52px', fontWeight: 900, letterSpacing: '-0.03em' }}>$35</span>
                <span style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '10px' }}>/ 30 يوم</span>
              </div>
              <div style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '28px' }}>وصول كامل بدون قيود</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                {['كل مميزات المجاني','100 عملة متجددة','رافعة ديناميكية','Quality Score','دعم فوري'].map((item,i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#d1d5db' }}>
                    <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>✓</span> {item}
                  </div>
                ))}
              </div>
              <Link href="/subscribe" className="btn-primary" style={{ display: 'block', textAlign: 'center', width: '100%', padding: '12px', borderRadius: '8px' }}>اشترك الآن</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid var(--border)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '16px' }}>
            ابدأ التداول بالذكاء<br/>
            <span className="gradient-text">الحين.</span>
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '15px', marginBottom: '32px' }}>لا بطاقة، لا التزامات — 14 يوم مجاناً</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn-primary" style={{ padding: '13px 32px', fontSize: '15px' }}>ابدأ مجاناً الآن ←</Link>
            <Link href="/dashboard" className="btn-ghost" style={{ padding: '13px 24px', fontSize: '15px' }}>شوف الإشارات</Link>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '48px 24px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '40px', marginBottom: '40px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Logo size={30}/>
              </div>
              <p style={{ color: 'var(--muted)', fontSize: '13px', lineHeight: 1.6, maxWidth: '220px' }}>منصة إشارات تداول مبنية على استراتيجيات محسوبة وبيانات حقيقية.</p>
            </div>
            <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
              {[
                { title: 'المنتج',  links: [['الإشارات','/dashboard'],['الأسعار','/subscribe']] },
                { title: 'الحساب', links: [['تسجيل','/register'],['دخول','/login']] },
                { title: 'تواصل',  links: [['تلقرام','https://t.me/Devel100_bot'],['القناة','https://t.me/DevilAISignals']] },
              ].map((col,i) => (
                <div key={i}>
                  <div style={{ color: 'var(--text)', fontWeight: 700, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>{col.title}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {col.links.map(([label,href],j) => (
                      <Link key={j} href={href} style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '13px', transition: 'color 0.15s' }}
                        onMouseEnter={e=>(e.currentTarget.style.color='var(--text)')}
                        onMouseLeave={e=>(e.currentTarget.style.color='var(--muted)')}
                      >{label}</Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ color: 'var(--dim)', fontSize: '12px' }}>© 2026 DevelBot</span>
            <span style={{ color: 'var(--dim)', fontSize: '12px' }}>للأغراض التعليمية فقط — التداول ينطوي على مخاطر.</span>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
        @media (max-width: 768px) {
          section[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; gap: 40px !important; }
          h1 { font-size: 36px !important; }
        }
      `}</style>
    </div>
  )
}
