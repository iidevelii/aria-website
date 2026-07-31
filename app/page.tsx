'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLang } from './layout'
import LiveChartDemo from './LiveChartDemo'
import SleepingWalletArt from './SleepingWalletArt'
import AcademyTeaser from './AcademyTeaser'
import HowItWorks from './HowItWorks'
import ChaosToOpportunity from './ChaosToOpportunity'
import PerformancePreview from './PerformancePreview'

/* ── Logo ── */
function Logo({ size = 28 }: { size?: number }) {
  return (
    <img src="/logo.png" alt="DevelBot" style={{ height: size, width: 'auto', display: 'block', borderRadius: '6px', background: '#fff', padding: '3px' }}/>
  )
}

/* ── Static signal row for hero preview ── */
function SigRow({ pair, side, entry, tp, score, pct, age, delay = 0 }: {
  pair: string; side: 'LONG'|'SHORT'; entry: string; tp: string; score: number; pct: string; age: string; delay?: number
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px', animation: `sigRowIn 0.5s ease ${delay}s both` }}>
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
  const { t, lang, setLang } = useLang()
  const [btcPrice, setBtcPrice] = useState<string|null>(null)
  const [btcChg, setBtcChg] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT')
      .then(r => r.json())
      .then(d => { setBtcPrice(parseFloat(d.lastPrice).toLocaleString()); setBtcChg(parseFloat(d.priceChangePercent)) })
      .catch(() => {})
  }, [])

  const navLinks = [[t('الإشارات','Signals'),'/dashboard'],[t('الأكاديمية','Academy'),'/academy'],[t('نتائج الباك تست','Backtest Results'),'/backtest-results'],[t('الأسعار','Pricing'),'/subscribe'],[t('تواصل','Contact'),'https://t.me/devel_support']]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>

      {/* ══ NAV ══ */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid var(--border)', background: 'rgba(8,9,15,0.85)', backdropFilter: 'blur(16px)', padding: '0 24px', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}>
          <Logo size={52}/>
        </Link>
        <div className="home-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {navLinks.map(([label,href]) => (
            <Link key={href} href={href} style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, padding: '6px 12px', borderRadius: '6px', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color='var(--text)')}
              onMouseLeave={e => (e.currentTarget.style.color='var(--muted)')}
            >{label}</Link>
          ))}
          <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 6px' }}/>
          <button onClick={() => setLang(lang==='ar'?'en':'ar')} title="Language / اللغة" style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: '12px', fontWeight: 700, borderRadius: '6px', padding: '5px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>
            {lang==='ar'?'EN':'ع'}
          </button>
          <Link href="/login" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, padding: '6px 12px' }}>{t('دخول','Login')}</Link>
          <Link href="/register" className="btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>{t('ابدأ مجاناً ←','Start free →')}</Link>
        </div>

        {/* Mobile hamburger — hidden on desktop via CSS */}
        <button
          className="home-nav-toggle"
          onClick={() => setMobileMenuOpen(v => !v)}
          aria-label={t('القائمة','Menu')}
          style={{ display: 'none', width: '38px', height: '38px', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', cursor: 'pointer' }}
        >
          {mobileMenuOpen ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          )}
        </button>
      </nav>

      {/* Mobile dropdown panel */}
      {mobileMenuOpen && (
        <div className="home-nav-toggle" style={{ position: 'sticky', top: '72px', zIndex: 49, background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '12px 20px', flexDirection: 'column', gap: '4px' }}>
          {navLinks.map(([label,href]) => (
            <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text)', textDecoration: 'none', fontSize: '14px', fontWeight: 600, padding: '11px 8px', borderBottom: '1px solid var(--border)' }}>{label}</Link>
          ))}
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button onClick={() => setLang(lang==='ar'?'en':'ar')} style={{ flex: 1, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '13px', fontWeight: 700, borderRadius: '8px', padding: '10px', cursor: 'pointer', fontFamily: 'inherit' }}>
              {lang==='ar'?'English':'العربية'}
            </button>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="btn-ghost" style={{ flex: 1, justifyContent: 'center', fontSize: '13px' }}>{t('دخول','Login')}</Link>
            <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: '13px' }}>{t('ابدأ مجاناً','Start free')}</Link>
          </div>
        </div>
      )}

      {/* ══ HERO ══ */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px 80px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>
        {/* Left — copy */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,230,100,0.08)', border: '1px solid rgba(0,230,100,0.18)', borderRadius: '6px', padding: '5px 12px', marginBottom: '28px' }}>
            <span className="live-dot"/>
            <span style={{ fontSize: '12px', color: '#00e664', fontWeight: 600 }}>{t('online · 100+ عملة · فحص كل 15 دقيقة', 'online · 100+ coins · scanned every 15 minutes')}</span>
          </div>

          <h1 style={{ fontSize: 'clamp(36px, 5vw, 58px)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.03em', marginBottom: '20px' }}>
            {t('اترك مراقبة السوق', 'Let DevelBot watch')}<br/>
            <span className="gradient-text">{t('لـ DevelBot.', 'the market for you.')}</span>
          </h1>

          <p style={{ color: 'var(--muted)', fontSize: '16px', lineHeight: 1.75, marginBottom: '36px', maxWidth: '420px' }}>
            {t('نحلل مئات العملات والاستراتيجيات باستمرار، وعندما تظهر فرصة مطابقة لشروطك نرسلها إليك فوراً مع الدخول والأهداف ووقف الخسارة وأسباب الاختيار.', 'We continuously analyze hundreds of assets and strategies. When an opportunity matches your criteria, you receive it instantly with entry, targets, stop loss, and a clear explanation.')}
          </p>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '48px' }}>
            <Link href="/register" className="btn-primary" style={{ padding: '12px 28px', fontSize: '15px', borderRadius: '8px' }}>{t('ابدأ تجربتك المجانية ←', 'Start your free trial →')}</Link>
            <a href="#how-it-works" className="btn-ghost" style={{ padding: '12px 24px', fontSize: '15px', borderRadius: '8px' }}>{t('شاهد كيف يعمل', 'See how it works')}</a>
          </div>

          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
            {[
              { v: '100+', l: t('عملة', 'coins') },
              { v: '77.2%', l: t('نسبة نجاح (باك تست)', 'win rate (backtest)') },
              { v: '24/7', l: t('مراقبة', 'monitoring') },
              { v: '$0', l: t('14 يوم', '14 days') },
            ].map((s,i) => (
              <div key={i}>
                <div style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{s.v}</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{s.l}</div>
              </div>
            ))}
          </div>
          <Link href="/backtest-results" style={{ display: 'inline-block', marginTop: '14px', fontSize: '12px', color: 'var(--cyan)', textDecoration: 'none' }}>
            {t('شوف تفاصيل الباك تست لكل عملة ←', 'See backtest details for every coin →')}
          </Link>
        </div>

        {/* Right — signal feed preview */}
        <div className="hero-feed-card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden', position: 'relative' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('آخر الإشارات', 'Latest signals')}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="live-dot"/>
              <span style={{ fontSize: '11px', color: '#00e664' }}>live</span>
            </div>
          </div>
          <div style={{ padding: '4px 16px 4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', fontSize: '10px', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid rgba(255,255,255,0.04)', fontWeight: 700 }}>
              <span style={{ minWidth: '90px' }}>{t('زوج', 'Pair')}</span>
              <span style={{ minWidth: '42px' }}>{t('جانب', 'Side')}</span>
              <span style={{ flex: 1 }}>{t('دخول', 'Entry')}</span>
              <span style={{ minWidth: '72px' }}>{t('هدف', 'Target')}</span>
              <span style={{ minWidth: '38px', textAlign: 'right' }}>Score</span>
              <span style={{ minWidth: '52px', textAlign: 'right' }}>P&L</span>
              <span style={{ minWidth: '36px', textAlign: 'right' }}>{t('وقت', 'Time')}</span>
            </div>
            <SigRow pair="INJ/USDT"    side="LONG"  entry="24.31"     tp="27.89"    score={82} pct="+11.2%" age="2h"  delay={0} />
            <SigRow pair="SOL/USDT"    side="LONG"  entry="162.40"    tp="186.50"   score={79} pct="+7.4%"  age="5h"  delay={0.08} />
            <SigRow pair="FLOKI/USDT"  side="SHORT" entry="0.0001840" tp="0.0001590" score={74} pct="+13.6%" age="8h" delay={0.16} />
            <SigRow pair="XLM/USDT"    side="SHORT" entry="0.2841"    tp="0.2450"   score={71} pct="+5.8%"  age="11h" delay={0.24} />
            <SigRow pair="AVAX/USDT"   side="LONG"  entry="35.12"     tp="40.30"    score={68} pct="+3.1%"  age="1d"  delay={0.32} />
          </div>
          <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{t('هذه بيانات توضيحية', 'This is sample data')}</span>
            <Link href="/dashboard" style={{ fontSize: '12px', color: 'var(--cyan)', textDecoration: 'none', fontWeight: 700 }}>{t('الإشارات الحقيقية ←', 'Real signals →')}</Link>
          </div>
        </div>
      </section>

      <HowItWorks />

      {/* ══ شارت حي + الفلوس تشتغل وأنت نايم ══ */}
      <section className="section">
        <div className="hero-visuals-grid" style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '32px', alignItems: 'stretch' }}>
          <LiveChartDemo />
          <SleepingWalletArt />
        </div>
      </section>

      <ChaosToOpportunity />

      <AcademyTeaser />

      {/* ══ 01 · الداشبورد ══ */}
      <section className="section">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '40px' }}>
            <div className="section-eyebrow">{t('01 · الداشبورد', '01 · Dashboard')}</div>
            <h2 className="section-title">{t('كل إشاراتك في مكان واحد', 'All your signals in one place')}</h2>
            <p className="section-sub">{t('لوحة تحكم حية — كل صفقة ببوكس مستقل مع السعر الحالي ونسبة الربح أو الخسارة.', 'A live dashboard — every trade in its own card with the current price and profit/loss percentage.')}</p>
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
                      {s.status === 'WIN' ? `✓ ${t('ربح', 'Win')}` : `● ${t('مفتوحة', 'Open')}`}
                    </span>
                  </div>
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: '9px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Score</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--cyan)', lineHeight: 1 }}>{s.score}</div>
                  </div>
                </div>
                <div className="price-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '6px' }}>
                  <div className="price-box">
                    <div style={{ fontSize: '9px', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('دخول', 'Entry')}</div>
                    <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: '12px' }}>${s.entry}</div>
                  </div>
                  <div style={{ background: 'rgba(0,230,100,0.05)', border: '1px solid rgba(0,230,100,0.14)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '9px', color: 'var(--green)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('هدف', 'Target')}</div>
                    <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: '12px', color: 'var(--green)' }}>${s.tp}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(0,230,100,0.5)', marginTop: '2px' }}>{s.tpp}</div>
                  </div>
                  <div style={{ background: 'rgba(255,68,85,0.05)', border: '1px solid rgba(255,68,85,0.14)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '9px', color: 'var(--red)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('وقف', 'Stop')}</div>
                    <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: '12px', color: 'var(--red)' }}>${s.sl}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,68,85,0.5)', marginTop: '2px' }}>{s.slp}</div>
                  </div>
                  <div style={{ background: 'rgba(0,196,239,0.05)', border: '1px solid rgba(0,196,239,0.14)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', marginBottom: '4px' }}>
                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--cyan)', display: 'inline-block', animation: 'pulse 2s infinite' }}/>
                      <span style={{ fontSize: '9px', color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('الآن', 'Now')}</span>
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: '12px', color: 'var(--green)' }}>${s.cur}</div>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--green)', marginTop: '2px' }}>{s.pnl}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <Link href="/dashboard" className="btn-ghost" style={{ padding: '10px 28px', fontSize: '13px' }}>{t('فتح الداشبورد ←', 'Open dashboard →')}</Link>
          </div>
        </div>
      </section>

      {/* ══ 02 · تلقرام ══ */}
      <section className="section">
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>
          <div>
            <div className="section-eyebrow">{t('02 · تلقرام', '02 · Telegram')}</div>
            <h2 className="section-title">{t('كل إشارة تجيك فوراً', 'Every signal reaches you instantly')}</h2>
            <p className="section-sub">{t('بمجرد اكتشاف فرصة، البوت يرسل تفاصيل كاملة على تلقرامك — الزوج، الجانب، الدخول، الهدف، الوقف، الرافعة، والـ Score.', 'As soon as an opportunity is found, the bot sends full details to your Telegram — pair, side, entry, target, stop loss, leverage, and Score.')}</p>
            <div style={{ marginTop: '28px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a href="https://t.me/Develpay_bot" target="_blank" className="btn-primary" style={{ padding: '10px 22px', fontSize: '13px' }}>{t('فتح البوت في تلقرام ↗', 'Open the bot on Telegram ↗')}</a>
              <Link href="/register" className="btn-ghost" style={{ padding: '10px 20px', fontSize: '13px' }}>{t('سجّل للحصول على الكود', 'Sign up to get your code')}</Link>
            </div>

            <div style={{ marginTop: '28px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['/start', '/status', '/pay', '/settings', '/website', '/help'].map(cmd => (
                <span key={cmd} style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--cyan)', background: 'rgba(0,196,239,0.06)', border: '1px solid rgba(0,196,239,0.16)', borderRadius: '6px', padding: '4px 10px' }}>{cmd}</span>
              ))}
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
                text={`🟢 LONG · FUTURES\n━━━━━━━━━━━━━━\n📌 INJ/USDT\n\n🎯 ${t('دخول','Entry')}:   $24.31\n✅ ${t('هدف','Target')}:    $27.89 (+14.8%)\n🛑 ${t('وقف','Stop')}:    $22.80 (-6.2%)\n⚡ ${t('رافعة','Leverage')}:  ×5\n\n🤖 Score: 82/100\n📊 RSI Dip · Spot v11`}
                time="14:22"
              />
              <TgMsg
                text={`🔴 SHORT · FUTURES\n━━━━━━━━━━━━━━\n📌 FLOKI/USDT\n\n🎯 ${t('دخول','Entry')}:   $0.0001840\n✅ ${t('هدف','Target')}:    $0.0001590 (+13.6%)\n🛑 ${t('وقف','Stop')}:    $0.0001990 (-8.2%)\n⚡ ${t('رافعة','Leverage')}:  ×3\n\n🤖 Score: 74/100\n📊 RSI OB · Futures v13`}
                time="09:47"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ══ 03 · كل الأدوات ══ */}
      <section className="section">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '40px', textAlign: 'center' }}>
            <div className="section-eyebrow" style={{ textAlign: 'center' }}>{t('03 · كل الأدوات', '03 · All the tools')}</div>
            <h2 className="section-title" style={{ textAlign: 'center' }}>{t('مو بس إشارات — منصة كاملة', 'Not just signals — a complete platform')}</h2>
            <p className="section-sub" style={{ textAlign: 'center', margin: '0 auto' }}>{t('كل أداة تحتاجها لتحليل السوق واتخاذ القرار، بدون ما تدفع لأدوات خارجية إضافية.', 'Every tool you need to analyze the market and make decisions, without paying for extra third-party tools.')}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {[
              { icon: '📡', color: '#00c4ef', title: t('السكانر', 'Scanner'), desc: t('يفحص عشرات العملات لحظياً ويحسب RSI وMACD وADX وSupertrend، ويعطي Score من -100 إلى +100 لكل عملة.', 'Scans dozens of coins in real time and calculates RSI, MACD, ADX and Supertrend, giving each coin a Score from -100 to +100.'), href: '/scanner' },
              { icon: '⚙️', color: '#7c3aed', title: t('منشئ الاستراتيجيات', 'Strategy Builder'), desc: t('ابنِ شروط الفحص الخاصة فيك (AND/OR بين المؤشرات) وشغّلها على كل السوق بضغطة زر.', 'Build your own scan conditions (AND/OR between indicators) and run them across the whole market with one click.'), href: '/strategy-builder' },
              { icon: '📊', color: '#22d06e', title: t('نتائج الباك تست', 'Backtest Results'), desc: t('شفافية كاملة — نتيجة كل عملة على حدة من باك تست حقيقي على بيانات Binance، مع استبعاد العملات الضعيفة تلقائياً.', 'Full transparency — individual results per coin from real backtesting on Binance data, with weak coins automatically excluded.'), href: '/backtest-results' },
              { icon: '🔔', color: '#f59e0b', title: t('تتبع العملات', 'Coin Tracker'), desc: t('أضف تنبيهات سعر مخصصة (فوق/تحت قيمة، أو نسبة تغيّر 24 ساعة) — يُفحص كل 30 ثانية.', 'Add custom price alerts (above/below a value, or 24h change percentage) — checked every 30 seconds.'), href: '/coin-tracker' },
              { icon: '🤖', color: '#f04060', title: t('مساعد AI', 'AI Assistant'), desc: t('اسأله عن أي مؤشر أو إشارة — يشرحلك ليش صارت، وأساسيات إدارة المخاطر. تعليمي، مو نصيحة مالية.', 'Ask it about any indicator or signal — it explains why it happened, plus risk management basics. Educational, not financial advice.'), href: '/ai-assistant' },
              { icon: '💼', color: '#00c4ef', title: t('محفظة تجريبية', 'Paper Trading'), desc: t('جرّب استراتيجياتك بمحفظة محاكاة (بدون فلوس حقيقية) قبل ما تدخل بسوق حقيقي — رافعة، حجم، LONG/SHORT.', 'Test your strategies with a simulated portfolio (no real money) before entering the real market — leverage, size, LONG/SHORT.'), href: '/paper-trading' },
              { icon: '🎓', color: '#7c3aed', title: t('الأكاديمية', 'Academy'), desc: t('تعلّم الشموع، النماذج، والمؤشرات الفنية مجاناً — كل مفهوم مربوط بميزة حقيقية بالبوت.', 'Learn candlesticks, chart patterns, and technical indicators for free — every concept tied to a real bot feature.'), href: '/academy', featured: true },
            ].map((f, i) => (
              <Link key={i} href={f.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="signal-card" style={{
                  height: '100%', cursor: 'pointer', transition: 'border-color 0.15s, transform 0.15s',
                  background: f.featured ? 'linear-gradient(135deg, rgba(124,58,237,0.07), rgba(0,196,239,0.05))' : undefined,
                  borderColor: f.featured ? 'rgba(124,58,237,0.25)' : undefined,
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = f.color; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = f.featured ? 'rgba(124,58,237,0.25)' : 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '10px', marginBottom: '14px',
                    background: `${f.color}18`, border: `1px solid ${f.color}33`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                  }}>{f.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: '15px', marginBottom: '8px' }}>{f.title}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '13px', lineHeight: 1.7 }}>{f.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 04 · البداية ══ */}
      <section className="section">
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ marginBottom: '40px', textAlign: 'center' }}>
            <div className="section-eyebrow">{t('04 · البداية', '04 · Getting started')}</div>
            <h2 className="section-title" style={{ textAlign: 'center' }}>{t('3 خطوات وتبدأ', '3 steps and you\'re started')}</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { n: '01', title: t('سجّل مجاناً', 'Sign up free'), desc: t('حساب في ثوانٍ — بدون بطاقة ائتمان، 14 يوم تجربة كاملة', 'An account in seconds — no credit card, 14 days full trial'), href: '/register', cta: t('سجّل ←', 'Sign up →') },
              { n: '02', title: t('اربط بوت التلقرام', 'Connect the Telegram bot'), desc: t('افتح @Develpay_bot، ادفع، وفعّل حسابك — بعدها توصلك كل الإشارات على تلقرام فوراً', 'Open @Develpay_bot, pay, and activate your account — every signal then reaches you on Telegram instantly'), href: 'https://t.me/Develpay_bot', cta: t('فتح ↗', 'Open ↗') },
              { n: '03', title: t('تداول بثقة', 'Trade with confidence'), desc: t('كل إشارة تصلك مع الاستراتيجية، الدخول، الهدف، الوقف، والرافعة', 'Every signal arrives with the strategy, entry, target, stop loss, and leverage'), href: '/dashboard', cta: t('الإشارات ←', 'Signals →') },
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

      <PerformancePreview />

      {/* ══ الأسعار ══ */}
      <section className="section">
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div className="section-eyebrow">{t('الأسعار', 'Pricing')}</div>
            <h2 className="section-title" style={{ textAlign: 'center' }}>{t('بسيط وشفاف', 'Simple and transparent')}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '32px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '20px' }}>{t('تجربة مجانية', 'Free trial')}</div>
              <div style={{ fontSize: '52px', fontWeight: 900, marginBottom: '4px', letterSpacing: '-0.03em' }}>$0</div>
              <div style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '28px' }}>{t('14 يوم كاملة', 'Full 14 days')}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                {[t('كامل الإشارات', 'All signals'), t('ربط التلقرام', 'Telegram connection'), t('الداشبورد الكامل', 'Full dashboard'), t('بدون بطاقة', 'No card required')].map((item,i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#9ca3af' }}>
                    <span style={{ color: 'var(--green)', fontWeight: 700 }}>✓</span> {item}
                  </div>
                ))}
              </div>
              <Link href="/register" className="btn-ghost" style={{ display: 'block', textAlign: 'center', width: '100%', padding: '12px' }}>{t('ابدأ مجاناً', 'Start free')}</Link>
            </div>
            <div style={{ background: 'var(--surface)', border: '1px solid rgba(0,196,239,0.28)', borderRadius: '14px', padding: '32px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-11px', right: '20px', background: 'var(--cyan)', color: '#000', fontSize: '11px', fontWeight: 800, padding: '4px 12px', borderRadius: '5px' }}>{t('الأشهر', 'Most popular')}</div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '20px' }}>{t('احترافي', 'Pro')}</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', marginBottom: '4px' }}>
                <span style={{ fontSize: '52px', fontWeight: 900, letterSpacing: '-0.03em' }}>$35</span>
                <span style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '10px' }}>{t('/ 30 يوم', '/ 30 days')}</span>
              </div>
              <div style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '28px' }}>{t('وصول كامل بدون قيود', 'Full access, no limits')}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                {[t('كل مميزات المجاني', 'All free features'), t('100 عملة متجددة', '100 rotating coins'), t('رافعة ديناميكية', 'Dynamic leverage'), 'Quality Score', t('دعم فوري', 'Instant support')].map((item,i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#d1d5db' }}>
                    <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>✓</span> {item}
                  </div>
                ))}
              </div>
              <Link href="/subscribe" className="btn-primary" style={{ display: 'block', textAlign: 'center', width: '100%', padding: '12px', borderRadius: '8px' }}>{t('اشترك الآن', 'Subscribe now')}</Link>
            </div>
          </div>

          {/* Mini FAQ */}
          <div style={{ marginTop: '48px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { q: t('هل أحتاج بطاقة ائتمان للتجربة المجانية؟', 'Do I need a credit card for the free trial?'), a: t('لا، تسجّل بإيميلك فقط وتحصل على 14 يوم كاملة بدون أي التزام.', 'No, just sign up with your email and get a full 14 days with no commitment.') },
              { q: t('كيف توصلني الإشارات؟', 'How do signals reach me?'), a: t('على الموقع فوراً، وعلى تلقرام لو ربطت حسابك بالبوت.', 'Instantly on the website, and on Telegram if you connect your account to the bot.') },
              { q: t('هل النتائج مضمونة؟', 'Are results guaranteed?'), a: t('لا. التداول ينطوي على مخاطر ولا توجد أداة تضمن الربح — الأرقام المعروضة من باك تست حقيقي فقط.', 'No. Trading involves risk and no tool guarantees profit — the numbers shown are from real backtesting only.') },
              { q: t('أقدر ألغي اشتراكي وقت ما أبي؟', 'Can I cancel anytime?'), a: t('نعم، الاشتراك بدون عقد طويل — تجدده شهرياً أو تتوقف متى ما بغيت.', 'Yes, there\'s no long-term contract — renew monthly or stop whenever you like.') },
            ].map((f, i) => (
              <details key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 18px' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 700, fontSize: '14px', listStyle: 'none' }}>{f.q}</summary>
                <p style={{ color: 'var(--muted)', fontSize: '13px', lineHeight: 1.7, marginTop: '8px' }}>{f.a}</p>
              </details>
            ))}
            <div style={{ textAlign: 'center', marginTop: '4px' }}>
              <Link href="/faq" style={{ color: 'var(--cyan)', fontSize: '13px', textDecoration: 'none', fontWeight: 700 }}>{t('شوف كل الأسئلة الشائعة ←', 'See all FAQs →')}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid var(--border)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '16px' }}>
            {t('السوق يتحرك الآن.', 'The market is moving.')}<br/>
            <span className="gradient-text">{t('دع DevelBot يبحث لك عن التالي.', 'Let DevelBot find what comes next.')}</span>
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '15px', marginBottom: '32px' }}>{t('لا بطاقة، لا التزامات — 14 يوم مجاناً', 'No card, no commitments — 14 days free')}</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '32px' }}>
            <Link href="/register" className="btn-primary" style={{ padding: '13px 32px', fontSize: '15px' }}>{t('ابدأ مجاناً الآن ←', 'Start free now →')}</Link>
            <Link href="/dashboard" className="btn-ghost" style={{ padding: '13px 24px', fontSize: '15px' }}>{t('شوف الإشارات', 'View signals')}</Link>
          </div>
          <p style={{ color: 'var(--dim)', fontSize: '11.5px', lineHeight: 1.7, maxWidth: '520px', margin: '0 auto' }}>
            {t('التداول والاستثمار ينطويان على مخاطر، ولا توجد أداة أو استراتيجية تضمن الربح. المعلومات والنتائج المعروضة لأغراض تعليمية وتحليلية وليست نصيحة مالية.', 'Trading and investing involve risk. No tool or strategy can guarantee profit. Information and results are provided for educational and analytical purposes and do not constitute financial advice.')}
          </p>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '48px 24px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '40px', marginBottom: '40px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Logo size={42}/>
              </div>
              <p style={{ color: 'var(--muted)', fontSize: '13px', lineHeight: 1.6, maxWidth: '220px' }}>{t('منصة إشارات تداول مبنية على استراتيجيات محسوبة وبيانات حقيقية.', 'A trading signals platform built on calculated strategies and real data.')}</p>
            </div>
            <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
              {[
                { title: t('المنتج', 'Product'),  links: [[t('الإشارات','Signals'),'/dashboard'],[t('الأكاديمية','Academy'),'/academy'],[t('نتائج الباك تست','Backtest Results'),'/backtest-results'],[t('الأسعار','Pricing'),'/subscribe']] },
                { title: t('الحساب', 'Account'), links: [[t('تسجيل','Sign up'),'/register'],[t('دخول','Login'),'/login']] },
                { title: t('الشركة', 'Company'),  links: [[t('عن DevelBot','About'),'/about'],[t('الأسئلة الشائعة','FAQ'),'/faq'],[t('تواصل','Contact'),'/contact']] },
                { title: t('قانوني', 'Legal'),  links: [[t('سياسة الخصوصية','Privacy Policy'),'/privacy'],[t('الشروط والأحكام','Terms & Conditions'),'/terms'],[t('تنبيه المخاطر','Risk Disclaimer'),'/risk-disclaimer']] },
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
            <span style={{ color: 'var(--dim)', fontSize: '12px' }}>{t('للأغراض التعليمية فقط — التداول ينطوي على مخاطر.', 'For educational purposes only — trading involves risk.')}</span>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
        @keyframes sigRowIn { from{opacity:0; transform:translateY(6px)} to{opacity:1; transform:translateY(0)} }
        @keyframes sweepLine { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
        .hero-feed-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, #00c4ef, #00e664, transparent);
          animation: sweepLine 4s linear infinite; opacity: .8; pointer-events: none;
        }
        @media (max-width: 768px) {
          section[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; gap: 40px !important; }
          .hero-visuals-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
          .academy-teaser-card { grid-template-columns: 1fr !important; }
          .academy-teaser-card > div:last-child { height: 180px !important; order: -1; }
          h1 { font-size: 36px !important; }
        }
        .academy-teaser-card:hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(46,58,140,0.18); }
        @media (max-width: 860px) {
          .home-nav-links { display: none !important; }
          .home-nav-toggle { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
