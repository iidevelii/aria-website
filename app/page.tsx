'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLang } from './layout'

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

  useEffect(() => {
    fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT')
      .then(r => r.json())
      .then(d => { setBtcPrice(parseFloat(d.lastPrice).toLocaleString()); setBtcChg(parseFloat(d.priceChangePercent)) })
      .catch(() => {})
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>

      {/* ══ NAV ══ */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid var(--border)', background: 'rgba(8,9,15,0.85)', backdropFilter: 'blur(16px)', padding: '0 24px', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}>
          <Logo size={52}/>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {[[t('الإشارات','Signals'),'/dashboard'],[t('نتائج الباك تست','Backtest Results'),'/backtest-results'],[t('الأسعار','Pricing'),'/subscribe'],[t('تواصل','Contact'),'https://t.me/devel_support']].map(([label,href]) => (
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
      </nav>

      {/* ══ HERO ══ */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px 80px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>
        {/* Left — copy */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,230,100,0.08)', border: '1px solid rgba(0,230,100,0.18)', borderRadius: '6px', padding: '5px 12px', marginBottom: '28px' }}>
            <span className="live-dot"/>
            <span style={{ fontSize: '12px', color: '#00e664', fontWeight: 600 }}>{t('online · 100+ عملة · فحص كل 15 دقيقة', 'online · 100+ coins · scanned every 15 minutes')}</span>
          </div>

          <h1 style={{ fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: '20px' }}>
            {t('إشارات كريبتو', 'Crypto signals')}<br/>
            <span className="gradient-text">{t('+ بوت تلقرام.', '+ Telegram bot.')}</span><br/>
            {t('اشتراك واحد.', 'One subscription.')}
          </h1>

          <p style={{ color: 'var(--muted)', fontSize: '16px', lineHeight: 1.75, marginBottom: '36px', maxWidth: '400px' }}>
            {t('DevelBot يراقب Binance Spot و Futures ويرسل إشارات عالية الجودة فوراً — مع الدخول، الهدف، الوقف، والرافعة.', 'DevelBot monitors Binance Spot and Futures and sends high-quality signals instantly — with entry, target, stop loss, and leverage.')}
          </p>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '48px' }}>
            <Link href="/register" className="btn-primary" style={{ padding: '12px 28px', fontSize: '15px', borderRadius: '8px' }}>{t('ابدأ مجاناً — 14 يوم ←', 'Start free — 14 days →')}</Link>
            <Link href="/dashboard" className="btn-ghost" style={{ padding: '12px 24px', fontSize: '15px', borderRadius: '8px' }}>{t('شوف الإشارات', 'View signals')}</Link>
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '6px' }}>
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
              <a href="https://t.me/Devel100_bot" target="_blank" className="btn-primary" style={{ padding: '10px 22px', fontSize: '13px' }}>{t('فتح البوت في تلقرام ↗', 'Open the bot on Telegram ↗')}</a>
              <Link href="/register" className="btn-ghost" style={{ padding: '10px 20px', fontSize: '13px' }}>{t('سجّل للحصول على الكود', 'Sign up to get your code')}</Link>
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
              { icon: '📡', title: t('السكانر', 'Scanner'), desc: t('يفحص عشرات العملات لحظياً ويحسب RSI وMACD وADX وSupertrend، ويعطي Score من -100 إلى +100 لكل عملة.', 'Scans dozens of coins in real time and calculates RSI, MACD, ADX and Supertrend, giving each coin a Score from -100 to +100.'), href: '/scanner' },
              { icon: '⚙️', title: t('منشئ الاستراتيجيات', 'Strategy Builder'), desc: t('ابنِ شروط الفحص الخاصة فيك (AND/OR بين المؤشرات) وشغّلها على كل السوق بضغطة زر.', 'Build your own scan conditions (AND/OR between indicators) and run them across the whole market with one click.'), href: '/strategy-builder' },
              { icon: '📊', title: t('نتائج الباك تست', 'Backtest Results'), desc: t('شفافية كاملة — نتيجة كل عملة على حدة من باك تست حقيقي على بيانات Binance، مع استبعاد العملات الضعيفة تلقائياً.', 'Full transparency — individual results per coin from real backtesting on Binance data, with weak coins automatically excluded.'), href: '/backtest-results' },
              { icon: '🔔', title: t('تتبع العملات', 'Coin Tracker'), desc: t('أضف تنبيهات سعر مخصصة (فوق/تحت قيمة، أو نسبة تغيّر 24 ساعة) — يُفحص كل 30 ثانية.', 'Add custom price alerts (above/below a value, or 24h change percentage) — checked every 30 seconds.'), href: '/coin-tracker' },
              { icon: '🤖', title: t('مساعد AI', 'AI Assistant'), desc: t('اسأله عن أي مؤشر أو إشارة — يشرحلك ليش صارت، وأساسيات إدارة المخاطر. تعليمي، مو نصيحة مالية.', 'Ask it about any indicator or signal — it explains why it happened, plus risk management basics. Educational, not financial advice.'), href: '/ai-assistant' },
              { icon: '💼', title: t('محفظة تجريبية', 'Paper Trading'), desc: t('جرّب استراتيجياتك بمحفظة محاكاة (بدون فلوس حقيقية) قبل ما تدخل بسوق حقيقي — رافعة، حجم، LONG/SHORT.', 'Test your strategies with a simulated portfolio (no real money) before entering the real market — leverage, size, LONG/SHORT.'), href: '/paper-trading' },
            ].map((f, i) => (
              <Link key={i} href={f.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="signal-card" style={{ height: '100%', cursor: 'pointer', transition: 'border-color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--cyan)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                  <div style={{ fontSize: '28px', marginBottom: '12px' }}>{f.icon}</div>
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
              { n: '02', title: t('اربط بوت التلقرام', 'Connect the Telegram bot'), desc: t('أرسل كود التفعيل لـ @DevelBot وابدأ استقبال الإشارات فوراً', 'Send your activation code to @DevelBot and start receiving signals instantly'), href: 'https://t.me/Devel100_bot', cta: t('فتح ↗', 'Open ↗') },
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
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid var(--border)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '16px' }}>
            {t('ابدأ التداول بالذكاء', 'Start trading smarter')}<br/>
            <span className="gradient-text">{t('الحين.', 'now.')}</span>
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '15px', marginBottom: '32px' }}>{t('لا بطاقة، لا التزامات — 14 يوم مجاناً', 'No card, no commitments — 14 days free')}</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn-primary" style={{ padding: '13px 32px', fontSize: '15px' }}>{t('ابدأ مجاناً الآن ←', 'Start free now →')}</Link>
            <Link href="/dashboard" className="btn-ghost" style={{ padding: '13px 24px', fontSize: '15px' }}>{t('شوف الإشارات', 'View signals')}</Link>
          </div>
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
                { title: t('المنتج', 'Product'),  links: [[t('الإشارات','Signals'),'/dashboard'],[t('نتائج الباك تست','Backtest Results'),'/backtest-results'],[t('الأسعار','Pricing'),'/subscribe']] },
                { title: t('الحساب', 'Account'), links: [[t('تسجيل','Sign up'),'/register'],[t('دخول','Login'),'/login']] },
                { title: t('تواصل', 'Contact'),  links: [[t('تلقرام','Telegram'),'https://t.me/Devel100_bot'],[t('القناة','Channel'),'https://t.me/DevilAISignals']] },
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
          h1 { font-size: 36px !important; }
        }
      `}</style>
    </div>
  )
}
