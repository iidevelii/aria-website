'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useLang } from './ClientShell'
import { API_ORIGIN as API } from './lib/api'
import { BACKTEST_BASELINES } from './lib/backtestBaselines'
import './landing-redesign.css'

// شكل صف Signal الحقيقي من main.py (الحقول المستخدمة هنا بس) -- /signals
// عام بلا تسجيل دخول (صفقات مغلقة أقدم من 24 ساعة، نفس سياسة الشفافية
// التسويقية المستخدمة بكل الموقع)، عكس /v1/performance اللي يحتاج تسجيل دخول.
type RawSignal = { status: 'WIN' | 'LOSS'; engine: string | null; market: 'SPOT' | 'FUTURES' }

type EngineStat = { live: number; n: number }
type Kpis = { closed: number; winRate: number; winLossRatio: number; profitFactor: number }

const ENGINE_ORDER = ['SMC_MTF', 'RETEST_MTF', 'BOLLINGER_REVERSION']
const ENGINE_LABEL: Record<string, string> = { SMC_MTF: 'SMC', RETEST_MTF: 'Retest', BOLLINGER_REVERSION: 'Bollinger' }

export default function Home() {
  const { t, lang, setLang } = useLang()
  const rootRef = useRef<HTMLDivElement>(null)
  const [byEngine, setByEngine] = useState<Record<string, EngineStat>>({})
  const [kpis, setKpis] = useState<Kpis | null>(null)
  const [pairsCount, setPairsCount] = useState<number | null>(null)
  const [theme, setTheme] = useState('dark')

  // ── بيانات الأداء الحقيقية -- /signals عام (بلا تسجيل دخول)، نفس
  // الحقول والفلترة اللي main.py يطبّقها أصلاً (archived/SHADOW مستبعدة
  // تلقائياً من هذا الـendpoint). نحسب هنا بدل الاعتماد على /v1/performance
  // لأنه يحتاج تسجيل دخول وهذي صفحة عامة يزورها غير المسجّلين. ──
  useEffect(() => {
    Promise.all([
      fetch(`${API}/signals?status=WIN&limit=1000`).then(r => r.json()).catch(() => []),
      fetch(`${API}/signals?status=LOSS&limit=1000`).then(r => r.json()).catch(() => []),
    ]).then(([wins, losses]: [RawSignal[], RawSignal[]]) => {
      if (!Array.isArray(wins) || !Array.isArray(losses)) return
      const all = [...wins, ...losses]
      if (!all.length) return

      const byE: Record<string, { w: number; n: number }> = {}
      for (const s of all) {
        const e = s.engine || '-'
        if (!byE[e]) byE[e] = { w: 0, n: 0 }
        byE[e].n++
        if (s.status === 'WIN') byE[e].w++
      }
      const liveByEngine: Record<string, EngineStat> = {}
      for (const [e, v] of Object.entries(byE)) liveByEngine[e] = { live: Math.round((v.w / v.n) * 100), n: v.n }
      setByEngine(liveByEngine)

      const closed = all.length
      const w = wins.length
      setKpis({
        closed,
        winRate: Math.round((w / closed) * 100),
        winLossRatio: 0, // يُحسب تحت لو احتجنا رقماً دقيقاً لاحقاً -- حالياً غير معروض
        profitFactor: 0,
      })
    })
  }, [])

  // عدد أزواج فيوتشر USDT-M الحقيقي والحي من بايننس نفسه -- رقم حقيقي
  // يتغيّر مع الوقت، مو رقم ثابت مكتوب يدوياً.
  useEffect(() => {
    fetch('https://fapi.binance.com/fapi/v1/exchangeInfo')
      .then(r => r.json())
      .then(d => {
        const n = (d.symbols || []).filter((s: any) => s.contractType === 'PERPETUAL' && s.quoteAsset === 'USDT' && s.status === 'TRADING').length
        if (n > 0) setPairsCount(n)
      })
      .catch(() => {})
  }, [])

  // ثيم -- نفس مفتاح localStorage ونفس آلية ClientShell بالضبط (data-theme
  // على <html>)، حتى ما يتعارض مع تبديل الثيم بباقي الموقع.
  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'dark'
    setTheme(saved)
  }, [])
  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  // ── أنيميشن GSAP -- يشتغل بعد ما البيانات الحقيقية توصل (kpis/byEngine)
  // حتى عناصر data-count تكون موجودة بالـDOM وقت التشغيل. ──
  useEffect(() => {
    if (!kpis || !Object.keys(byEngine).length || !rootRef.current) return
    const root = rootRef.current
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

    let cleanup = () => {}
    ;(async () => {
      const gsapMod = await import('gsap')
      const gsap = gsapMod.default
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')

      const countUp = (el: Element) => {
        const to = +(el.getAttribute('data-count') || 0)
        const o = { v: 0 }
        gsap.to(o, { v: to, duration: 1.4, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(o.v).toLocaleString('en-US') } })
      }

      if (reduce) {
        root.classList.add('static')
        root.querySelectorAll('[data-count]').forEach(el => { el.textContent = (+(el.getAttribute('data-count') || 0)).toLocaleString('en-US') })
        return
      }
      gsap.registerPlugin(ScrollTrigger)

      const line = root.querySelector('#chartLine') as SVGPathElement | null
      if (line) { const L = line.getTotalLength(); gsap.set(line, { strokeDasharray: L, strokeDashoffset: L }) }
      const scanRows = [...root.querySelectorAll('#scan > div')]

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
        .to(root.querySelectorAll('#hero h1 .l span'), { y: 0, duration: 1, stagger: .12 }, .2)
        .to(root.querySelector('#hero .lead'), { opacity: 1, y: 0, duration: .8 }, '-=.6')
        .to(root.querySelector('#hero .ctas'), { opacity: 1, duration: .7 }, '-=.5')
        .to(root.querySelector('#hero .proof'), { opacity: 1, duration: .7, onStart: () => root.querySelectorAll('#hero [data-count]').forEach(countUp) }, '-=.5')
        .fromTo(root.querySelector('.terminal'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .9 }, '-=1.1')
        .to(scanRows, { opacity: 1, duration: .3, stagger: .18 }, '-=.4')
      if (line) tl.to(line, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' }, '-=.6')
      tl.to(root.querySelector('.entry-dot'), { scale: 1, duration: .4, ease: 'back.out(3)' }, '-=.6')
        .to(root.querySelector('.tg'), { opacity: 1, y: 0, duration: .7, ease: 'back.out(1.4)' }, '-=.2')

      // ── شريط السكانر: حركة توضيحية لآلية الفحص (أسماء عملات حقيقية من
      // كون فيوتشر فعلي، لكن نتيجة "hit/no setup" عشوائية للعرض فقط -- ما
      // تمثّل إشارات حقيقية لحظية) ──
      const pairs = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'LINKUSDT', 'ARBUSDT', 'AVAXUSDT', 'OPUSDT', 'DOGEUSDT', 'SUIUSDT', 'APTUSDT', 'INJUSDT', 'TIAUSDT']
      const stratName = ['SMC_MTF', 'RETEST_MTF', 'BOLLINGER']
      const scanInterval = setInterval(() => {
        const scan = root.querySelector('#scan')
        if (!scan) return
        const hit = Math.random() < .18
        const d = document.createElement('div')
        d.className = hit ? 'hit' : ''
        d.innerHTML = `<span>${pairs[Math.floor(Math.random() * pairs.length)]}</span><span>${stratName[Math.floor(Math.random() * 3)]} · ${hit ? (Math.random() < .5 ? 'LONG ✔' : 'SHORT ✔') : (Math.random() < .5 ? 'no setup' : 'waiting')}</span>`
        scan.prepend(d)
        gsap.fromTo(d, { opacity: 0, y: -6 }, { opacity: 1, y: 0, duration: .3 })
        if (scan.children.length > 8) scan.lastElementChild?.remove()
      }, 1600)

      const clockEl = root.querySelector('#clock')
      const clockInterval = setInterval(() => { if (clockEl) clockEl.textContent = new Date().toLocaleTimeString('en-GB') }, 1000)

      root.querySelectorAll('.rv').forEach(el => gsap.to(el, { opacity: 1, y: 0, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 86%' } }))
      gsap.to(root.querySelectorAll('.steps .step'), { opacity: 1, y: 0, duration: .8, stagger: .12, ease: 'power3.out', scrollTrigger: { trigger: root.querySelector('.steps'), start: 'top 80%' } })
      root.querySelectorAll('.strat .mini path').forEach(p => {
        const l = (p as SVGPathElement).getTotalLength()
        gsap.set(p, { strokeDasharray: l, strokeDashoffset: l })
        gsap.to(p, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut', scrollTrigger: { trigger: p, start: 'top 85%' } })
      })
      gsap.to(root.querySelectorAll('.bars2 i'), { scaleY: 1, duration: .9, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: root.querySelector('#bars'), start: 'top 80%' } })
      ScrollTrigger.create({ trigger: root.querySelector('#kpis'), start: 'top 85%', once: true, onEnter: () => root.querySelectorAll('#kpis [data-count]').forEach(countUp) })
      const flow = root.querySelector('.flow')
      if (flow) {
        gsap.timeline({ scrollTrigger: { trigger: flow, start: 'top 78%' } })
          .to(flow.querySelector('.draw'), { scaleX: 1, duration: 1.4, ease: 'power2.inOut' }, 0)
          .to(flow.querySelectorAll(':scope > div'), { opacity: 1, y: 0, duration: .6, stagger: .3, ease: 'power3.out' }, .1)
      }
      gsap.to(root.querySelectorAll('.channels .channel'), { opacity: 1, y: 0, duration: .7, stagger: .08, scrollTrigger: { trigger: root.querySelector('.channels'), start: 'top 82%' } })
      document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh())

      cleanup = () => { clearInterval(scanInterval); clearInterval(clockInterval); ScrollTrigger.getAll().forEach(s => s.kill()); tl.kill() }
    })()

    return () => cleanup()
  }, [kpis, byEngine])

  const engines = ENGINE_ORDER.filter(e => byEngine[e])
  const kpiRows: [string, number | string][] = kpis ? [
    [t('صفقات مغلقة (حي)', 'Closed trades (live)'), kpis.closed],
    [t('نسبة الرابحة (حي)', 'Win rate (live)'), `${kpis.winRate}%`],
    [t('استراتيجيات حية', 'Live strategies'), engines.length],
    [t('فحص بدون توقف', 'Scanning'), '24/7'],
  ] : []

  return (
    <div className="landing-redesign" ref={rootRef} data-theme={theme}>
      {/* ══ NAV ══ */}
      <header className="nav">
        <div className="container">
          <Link className="brand" href="/">
            <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><rect width="28" height="28" rx="8" fill="#00c4ef" /><path d="M8 18l4-6 3 4 5-8" fill="none" stroke="#041018" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            DevelBot
          </Link>
          <nav className="links">
            <a href="#how">{t('كيف يشتغل', 'How it works')}</a>
            <a href="#strategies">{t('الاستراتيجيات', 'Strategies')}</a>
            <a href="#performance">{t('الأداء', 'Performance')}</a>
            <a href="#auto">{t('التداول الآلي', 'Auto-trading')}</a>
            <a href="#pricing">{t('الاشتراك', 'Pricing')}</a>
            <a href="#faq">{t('أسئلة', 'FAQ')}</a>
          </nav>
          <div className="actions">
            <button className="btn btn-ghost btn-sm" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} aria-label="Language / اللغة">{lang === 'ar' ? 'EN' : 'ع'}</button>
            <button className="btn btn-ghost btn-sm" onClick={toggleTheme} aria-label="theme">◐</button>
            <Link className="btn btn-secondary btn-sm" href="/login">{t('دخول', 'Log in')}</Link>
            <Link className="btn btn-primary btn-sm" href="/register">{t('جرّب 14 يوم مجاناً', 'Try 14 days free')}</Link>
          </div>
        </div>
      </header>

      {/* ══ HERO ══ */}
      <section id="hero">
        <div className="glow" style={{ width: 520, height: 520, background: 'var(--cyan)', top: -200, insetInlineEnd: -120 }} />
        <div className="glow" style={{ width: 420, height: 420, background: 'var(--purple)', bottom: -200, insetInlineStart: -100 }} />
        <div className="container wrap">
          <div>
            <span className="badge badge-green" style={{ marginBottom: 'var(--s-4)' }}><span className="dot dot-live" /> {t('يفحص Binance الآن', 'Scanning Binance now')}</span>
            <h1>
              <span className="l"><span>{t('إشارات تداول', 'Trading signals')}</span></span>
              <span className="l"><span>{t('بأرقام ', 'with ')}<em>{t('شفافة', 'transparent')}</em>{t('،', ' numbers,')}</span></span>
              <span className="l"><span>{t('بما فيها الخسائر.', 'including the losses.')}</span></span>
            </h1>
            <p className="lead">{t(
              'DevelBot يفحص مئات أزواج Binance في الفيوتشر والسبوت بثلاث استراتيجيات مُختبرة، ويرسل لك الدخول والهدف والوقف مع الشارت خلال ثوانٍ. ولو تبي، ينفّذ الصفقة على حسابك بنفسه.',
              'DevelBot scans hundreds of Binance futures and spot pairs with three tested strategies, and sends you entry, target, and stop with a chart in seconds. If you want, it can execute the trade on your own account.'
            )}</p>
            <div className="ctas">
              <Link className="btn btn-primary btn-lg" href="/register">{t('ابدأ 14 يوم مجاناً', 'Start 14 days free')}</Link>
              <a className="btn btn-secondary btn-lg" href="#performance">{t('شوف الأداء الحي', 'See live performance')}</a>
            </div>
            <div className="proof">
              <div><b data-count={pairsCount || 0}>0</b><small>{t('زوج فيوتشر مراقَب', 'Futures pairs monitored')}</small></div>
              <div><b>3</b><small>{t('استراتيجيات مُختبرة', 'Tested strategies')}</small></div>
              <div><b data-text="24/7">24/7</b><small>{t('فحص بدون توقف', 'Non-stop scanning')}</small></div>
            </div>
          </div>
          <div className="stage" aria-hidden="true">
            <div className="terminal">
              <div className="tb"><i /><i /><i /><span>scanner · futures · 5m</span><span className="ms-auto" id="clock">00:00:00</span></div>
              <div className="scan" id="scan">
                <div><span>ETHUSDT</span><span>SMC_MTF · no setup</span></div>
                <div><span>SOLUSDT</span><span>RETEST_MTF · waiting</span></div>
                <div><span>LINKUSDT</span><span>BOLLINGER · no setup</span></div>
                <div className="hit"><span>ARBUSDT</span><span>SMC_MTF · LONG ✔ 0.8421</span></div>
                <div><span>AVAXUSDT</span><span>RETEST_MTF · no setup</span></div>
                <div><span>OPUSDT</span><span>SMC_MTF · waiting</span></div>
              </div>
              <div className="chart">
                <svg viewBox="0 0 400 150" preserveAspectRatio="none">
                  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#00c4ef" /><stop offset="1" stopColor="#00c4ef" stopOpacity="0" /></linearGradient></defs>
                  <line className="lvl" x1="0" x2="400" y1="38" y2="38" stroke="#22d06e" /><text x="4" y="34">TP 0.8790</text>
                  <line className="lvl" x1="0" x2="400" y1="92" y2="92" stroke="#00c4ef" /><text x="4" y="88">ENTRY 0.8421</text>
                  <line className="lvl" x1="0" x2="400" y1="128" y2="128" stroke="#f04060" /><text x="4" y="124">SL 0.8260</text>
                  <path className="area" d="M0 110 L40 100 L80 112 L120 95 L160 104 L200 92 L240 98 L280 80 L320 70 L360 60 L400 44 L400 150 L0 150Z" />
                  <path className="line" id="chartLine" d="M0 110 L40 100 L80 112 L120 95 L160 104 L200 92 L240 98 L280 80 L320 70 L360 60 L400 44" />
                  <circle className="entry-dot" cx="200" cy="92" r="5" />
                </svg>
              </div>
            </div>
            <div className="tg">
              <div className="from"><i>DB</i>DevelBot Signals</div>
              <div className="msg">{'🟢 LONG ARBUSDT · SMC_MTF\nEntry 0.8421\nTP 0.8790 (+4.4%)\nSL 0.8260 (−1.9%)\nR:R 2.3 · 5m / 1h'}</div>
              <div className="time">12:04</div>
            </div>
          </div>
        </div>
      </section>

      <div className="strip"><div className="container">
        <span>Spot + Futures</span>
        <span>{t('إشارة بالدخول والهدف والوقف مع الشارت', 'Signal with entry, target, stop and chart')}</span>
        <span>{t('تلقرام · الموقع · تطبيق الجوال', 'Telegram · Website · Mobile app')}</span>
        <span>{t('تداول آلي على حسابك في Binance', 'Auto-trading on your own Binance account')}</span>
      </div></div>

      {/* ══ HOW ══ */}
      <section className="section" id="how">
        <div className="container">
          <div className="section-head rv"><div className="eyebrow">{t('كيف يشتغل', 'How it works')}</div><h2 className="t-h1">{t('ثلاث خطوات من الفحص إلى جوالك', 'Three steps from scan to your phone')}</h2></div>
          <div className="steps">
            <div className="card card-hover step rv"><span className="n">01</span><div className="ic"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5M8 11h6M11 8v6" /></svg></div><h3 className="t-h3">{t('يفحص السوق كل دقائق', 'Scans the market every few minutes')}</h3><p>{t('مئات الأزواج على أكثر من إطار زمني. كل استراتيجية لها شروط دخول صارمة، فأغلب الفحوصات تنتهي بلا إشارة، وهذا مقصود.', 'Hundreds of pairs across multiple timeframes. Each strategy has strict entry conditions, so most scans end with no signal — on purpose.')}</p></div>
            <div className="card card-hover step rv"><span className="n">02</span><div className="ic"><svg viewBox="0 0 24 24"><path d="M3 17l5-6 4 4 5-7 4 3" /><path d="M3 21h18" /></svg></div><h3 className="t-h3">{t('يبني الإشارة كاملة', 'Builds the full signal')}</h3><p>{t('دخول، هدف، وقف، نسبة المخاطرة للعائد، الاستراتيجية، والشارت. ما فيه إشارة بدون وقف.', 'Entry, target, stop, risk/reward, strategy, and chart. No signal ever goes out without a stop.')}</p></div>
            <div className="card card-hover step rv"><span className="n">03</span><div className="ic"><svg viewBox="0 0 24 24"><path d="M21 3L10 14M21 3l-7 18-4-7-7-4z" /></svg></div><h3 className="t-h3">{t('يرسلها ويتابعها', 'Sends it and tracks it')}</h3><p>{t('تصلك على تلقرام والموقع والتطبيق بنفس الثانية. ويتابع الصفقة حتى تنتهي ويسجّل نتيجتها، ربح أو خسارة، في الإحصائيات العامة.', 'It reaches you on Telegram, the website and the app the same second. It tracks the trade until it closes and logs the result — win or loss — in the public stats.')}</p></div>
          </div>
        </div>
      </section>

      {/* ══ STRATEGIES ══ */}
      <section className="section" id="strategies" style={{ background: 'var(--surface)' }}>
        <div className="container">
          <div className="section-head rv"><div className="eyebrow">{t('الاستراتيجيات', 'Strategies')}</div><h2 className="t-h1">{t('ثلاث استراتيجيات، لكل وحدة لون وشروطها', 'Three strategies, each with its own color and conditions')}</h2><p>{t('تعرف من لون الشارة أي استراتيجية ولّدت الإشارة، وتقدر تتابع أداء كل وحدة لحالها.', "The badge color tells you which strategy generated the signal, and you can track each one's performance separately.")}</p></div>
          <div className="grid grid-3">
            <div className="card card-hover strat rv"><span className="badge" data-strategy="SMC_MTF">SMC_MTF</span><div className="mini"><svg viewBox="0 0 200 60"><path d="M0 40 L30 36 L50 44 L80 30 L100 34 L130 22 L160 26 L200 12" stroke="#00c4ef" /><rect x="60" y="28" width="60" height="18" fill="rgba(0,196,239,.12)" stroke="#00c4ef" strokeWidth="1" /></svg></div><h3 className="t-h3">{t('هيكل السوق على عدة أطر', 'Market structure across multiple timeframes')}</h3><ul><li>{t('مناطق الطلب والعرض مع كسر الهيكل', 'Supply/demand zones with structure breaks')}</li><li>{t('تأكيد على إطار أعلى قبل الدخول', 'Higher-timeframe confirmation before entry')}</li><li>{t('مناسبة للاتجاهات الواضحة', 'Suited to clear trends')}</li></ul></div>
            <div className="card card-hover strat rv"><span className="badge" data-strategy="RETEST_MTF">RETEST_MTF</span><div className="mini"><svg viewBox="0 0 200 60"><path d="M0 44 L40 40 L70 20 L95 34 L110 30 L140 18 L170 24 L200 8" stroke="#a78bfa" /><line x1="60" x2="200" y1="33" y2="33" stroke="#a78bfa" strokeDasharray="3 3" /></svg></div><h3 className="t-h3">{t('إعادة اختبار المستوى المكسور', 'Retesting a broken level')}</h3><ul><li>{t('كسر مستوى ثم الرجوع له', 'A level breaks, then price returns to it')}</li><li>{t('دخول عند إعادة الاختبار بوقف قريب', 'Entry on the retest with a tight stop')}</li><li>{t('الإشارة لها صلاحية زمنية', 'The signal has a time validity window')}</li></ul></div>
            <div className="card card-hover strat rv"><span className="badge" data-strategy="BOLLINGER_REVERSION">BOLLINGER_REVERSION</span><div className="mini"><svg viewBox="0 0 200 60"><path d="M0 18 C 50 14, 150 14, 200 18" stroke="#f59e0b" strokeOpacity=".5" /><path d="M0 46 C 50 50, 150 50, 200 46" stroke="#f59e0b" strokeOpacity=".5" /><path d="M0 30 L30 36 L60 50 L80 42 L110 28 L140 20 L170 30 L200 32" stroke="#f59e0b" /></svg></div><h3 className="t-h3">{t('الارتداد من أطراف النطاق', 'Reversion from the range edges')}</h3><ul><li>{t('للأسواق العرضية بدون اتجاه', 'For ranging, non-trending markets')}</li><li>{t('دخول عند الخروج من النطاق والرجوع', 'Entry on a band breach and return')}</li><li>{t('أهداف أقصر ووقف أضيق', 'Shorter targets, tighter stop')}</li></ul></div>
          </div>
        </div>
      </section>

      {/* ══ PERFORMANCE — بيانات حقيقية ══ */}
      <section className="section" id="performance">
        <div className="container">
          <div className="section-head rv"><div className="eyebrow">{t('الأداء', 'Performance')}</div><h2 className="t-h1">{t('الأداء الحي مقابل الباك تست، بالخسائر', 'Live performance vs backtest, losses included')}</h2><p>{t('الأرقام هنا تُقرأ مباشرة من سجل الصفقات الحقيقي المغلق. ما فيه رقم يُكتب يدوياً.', 'These numbers are read directly from the real closed-trade log. Nothing here is hand-typed.')}</p></div>
          <div className="perf">
            <div className="card rv">
              <div className="card-head"><h3>{t('نسبة الصفقات الرابحة لكل استراتيجية', 'Win rate per strategy')}</h3><div className="legend"><span><i style={{ background: 'var(--cyan)' }} />{t('حي', 'Live')}</span><span><i style={{ background: 'var(--purple)' }} />{t('باك تست', 'Backtest')}</span></div></div>
              <div className="bars2" id="bars">
                {engines.map(e => (
                  <div className="g" key={e}>
                    <i className="a" style={{ height: `${byEngine[e].live}%` }} title={`${byEngine[e].live}%`} />
                    <i className="b" style={{ height: `${BACKTEST_BASELINES[e]?.wr || 0}%` }} title={`${BACKTEST_BASELINES[e]?.wr || 0}%`} />
                  </div>
                ))}
              </div>
              <div className="barlbl" id="barlbl">{engines.map(e => <span key={e}>{ENGINE_LABEL[e] || e}</span>)}</div>
            </div>
            <div className="stack">
              <div className="grid grid-2" id="kpis">
                {kpiRows.map(([l, v]) => (
                  <div className="stat rv" key={l}>
                    <span className="label">{l}</span>
                    <span className="value" {...(typeof v === 'number' ? { 'data-count': v } : {})}>{typeof v === 'number' ? 0 : v}</span>
                  </div>
                ))}
              </div>
              <div className="honest rv">{t('الباك تست يُحدَّث عند تغيير إعداد الاستراتيجية الحي (EXPERIMENTS.md). الأداء الحي يشمل كل الصفقات المغلقة الأقدم من 24 ساعة، بما فيها الخاسرة والملغاة.', 'Backtest numbers update when the live strategy config changes. Live performance includes every closed trade older than 24h, losses and voids included.')}</div>
              <Link className="btn btn-secondary rv" href="/stats">{t('افتح الإحصائيات التفصيلية ←', 'Open detailed stats →')}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══ AUTO TRADING ══ */}
      <section className="section" id="auto" style={{ background: 'var(--surface)' }}>
        <div className="container">
          <div className="section-head rv"><div className="eyebrow">{t('التداول الآلي', 'Auto-trading')}</div><h2 className="t-h1">{t('اربط حساب Binance، والبوت ينفّذ بدلك', 'Link your Binance account, the bot executes for you')}</h2><p>{t('مفتاح API بصلاحية تداول فقط، بدون سحب. أنت تحدد حجم الصفقة والحد اليومي، وتوقّفه بضغطة.', 'A trade-only API key, no withdrawal permission. You set the position size and daily limit, and can stop it with one tap.')}</p></div>
          <div className="flow">
            <div className="draw" />
            <div><i>1</i><b>{t('أنشئ مفتاح API', 'Create an API key')}</b>{t('من Binance بصلاحية تداول فقط، بدون سحب', 'on Binance, trade-only, no withdrawal permission')}</div>
            <div><i>2</i><b>{t('اربطه في DevelBot', 'Link it in DevelBot')}</b>{t('من صفحة ربط المنصة، يتشفر ولا يُعرض مرة ثانية', 'from the exchange-link page — it gets encrypted and is never shown again')}</div>
            <div><i>3</i><b>{t('حدد المخاطرة', 'Set your risk')}</b>{t('حجم الصفقة، الحد الأقصى اليومي، والاستراتيجيات المسموحة', 'position size, daily cap, and which strategies are allowed')}</div>
            <div><i>4</i><b>{t('البوت ينفّذ ويتابع', 'The bot executes and tracks')}</b>{t('دخول وهدف ووقف على حسابك، وتقرير لكل صفقة', 'entry, target and stop on your own account, with a report per trade')}</div>
          </div>
          <div className="row mt-6 rv"><Link className="btn btn-primary" href="/exchange-link">{t('اربط حسابك', 'Link your account')}</Link><Link className="btn btn-ghost" href="/binance-guide">{t('ما عندك حساب Binance؟ الدليل خطوة بخطوة', "Don't have a Binance account? Step-by-step guide")}</Link></div>
        </div>
      </section>

      {/* ══ CHANNELS ══ */}
      <section className="section" id="channels">
        <div className="container">
          <div className="section-head rv"><div className="eyebrow">{t('الوصول', 'Access')}</div><h2 className="t-h1">{t('نفس الإشارة، في المكان اللي تفضّله', 'The same signal, wherever you prefer')}</h2></div>
          <div className="channels">
            <div className="card card-hover channel rv"><div className="ic">TG</div><h3 className="t-h3">{t('تلقرام', 'Telegram')}</h3><p>{t('بوت خاص للمشتركين، وقناة عامة بالأرقام.', 'A private bot for subscribers, and a public channel with the numbers.')}</p></div>
            <div className="card card-hover channel rv"><div className="ic">WEB</div><h3 className="t-h3">{t('لوحة الموقع', 'Website dashboard')}</h3><p>{t('آخر الإشارات، الفلاتر، والأداء الحي مقابل الباك تست.', 'Latest signals, filters, and live performance vs backtest.')}</p></div>
            <div className="card card-hover channel rv"><div className="ic">APP</div><h3 className="t-h3">{t('تطبيق الجوال', 'Mobile app')}</h3><p>{t('إشعار فوري مع الشارت لكل إشارة.', 'Instant notification with a chart for every signal.')}</p></div>
            <div className="card card-hover channel rv"><div className="ic">API</div><h3 className="t-h3">{t('واجهة برمجية', 'API')}</h3><p>{t('للي يبي يربط الإشارات بأدواته.', 'For connecting signals to your own tools.')}</p></div>
          </div>
        </div>
      </section>

      {/* ══ PRICING ══ */}
      <section className="section" id="pricing" style={{ background: 'var(--surface)' }}>
        <div className="container">
          <div className="section-head rv"><div className="eyebrow">{t('الاشتراك', 'Pricing')}</div><h2 className="t-h1">{t('سعر واحد، كل شي مفتوح', 'One price, everything unlocked')}</h2></div>
          <div className="price-card rv">
            <div>
              <div className="p">$45 <small>/ {t('30 يوم', '30 days')}</small></div>
              <p className="t-2 mt-3">{t('أول 14 يوم مجاناً بكل المميزات. ما يُطلب منك دفع قبل ما تشوف الإشارات بنفسك.', 'First 14 days free with every feature. No payment required before you see the signals yourself.')}</p>
              <div className="row mt-6"><Link className="btn btn-primary btn-lg" href="/register">{t('ابدأ التجربة المجانية', 'Start the free trial')}</Link><Link className="btn btn-ghost" href="/subscribe">{t('تفاصيل الاشتراك', 'Subscription details')}</Link></div>
            </div>
            <ul>
              <li>{t('إشارات الفيوتشر والسبوت من الاستراتيجيات الثلاث', 'Futures and spot signals from all three strategies')}</li>
              <li>{t('تلقرام + الموقع + تطبيق الجوال', 'Telegram + website + mobile app')}</li>
              <li>{t('التداول الآلي على حسابك في Binance', 'Auto-trading on your own Binance account')}</li>
              <li>{t('السكانر والشارت والتداول التجريبي ومتابعة العملات', 'Scanner, chart, paper trading, and coin tracking')}</li>
              <li>{t('الأكاديمية والمساعد الذكي وبناء التنبيهات المخصصة', 'Academy, AI assistant, and custom alert building')}</li>
              <li>{t('الإحصائيات الكاملة بما فيها الخسائر', 'Full statistics, losses included')}</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section className="section" id="faq">
        <div className="container" style={{ maxWidth: 860 }}>
          <div className="section-head rv"><div className="eyebrow">{t('أسئلة', 'FAQ')}</div><h2 className="t-h1">{t('اللي يسأله كل متداول قبل ما يشترك', 'What every trader asks before subscribing')}</h2></div>
          <div className="rv">
            <details><summary><span>{t('هل البوت يضمن ربح؟', 'Does the bot guarantee profit?')}</span><i>+</i></summary><p>{t('لا. ما فيه نظام يضمن ربح في التداول. اللي نضمنه إن كل إشارة لها وقف، وإن أرقام الأداء المعروضة حقيقية وتشمل الخسائر.', "No. No system can guarantee trading profit. What we do guarantee is that every signal has a stop, and the performance numbers shown are real and include losses.")}</p></details>
            <details><summary><span>{t('هل يقدر البوت يسحب من حسابي في Binance؟', 'Can the bot withdraw from my Binance account?')}</span><i>+</i></summary><p>{t('لا. مفتاح API يُنشأ بصلاحية تداول فقط، بدون صلاحية سحب. وتقدر تلغيه من Binance بأي وقت.', 'No. The API key is created trade-only, with no withdrawal permission, and you can revoke it from Binance at any time.')}</p></details>
            <details><summary><span>{t('كم إشارة باليوم؟', 'How many signals per day?')}</span><i>+</i></summary><p>{t('يعتمد على السوق. بعض الأيام تطلع إشارات قليلة أو لا تطلع، لأن الشروط صارمة. الجودة قبل العدد.', 'It depends on the market. Some days produce few signals or none, because the conditions are strict. Quality over quantity.')}</p></details>
            <details><summary><span>{t('هل أحتاج خبرة؟', 'Do I need experience?')}</span><i>+</i></summary><p>{t('الإشارة تجيك كاملة بالدخول والهدف والوقف، والأكاديمية تشرح الأساسيات. والتداول التجريبي يخليك تتدرب بدون مخاطرة.', 'The signal arrives complete with entry, target and stop, and the academy covers the basics. Paper trading lets you practice risk-free.')}</p></details>
          </div>
          <div className="risk mt-8 rv"><b>{t('تنبيه:', 'Warning:')}</b><span>{t('التداول في العملات الرقمية ينطوي على مخاطر عالية وقد يؤدي لخسارة رأس المال. المحتوى هنا ليس نصيحة استثمارية. اقرأ', 'Crypto trading carries high risk and may lead to loss of capital. Nothing here is investment advice. Read the full')} <Link href="/risk-disclaimer" style={{ color: 'var(--cyan)' }}>{t('إخلاء المسؤولية', 'risk disclaimer')}</Link> {t('كاملاً.', '')}</span></div>
        </div>
      </section>

      <footer><div className="container">
        <span>© <span className="num">{new Date().getFullYear()}</span> DevelBot</span>
        <nav>
          <Link href="/features">{t('المميزات', 'Features')}</Link>
          <Link href="/about">{t('عن المنصة', 'About')}</Link>
          <Link href="/faq">{t('الأسئلة', 'FAQ')}</Link>
          <Link href="/api-docs">API</Link>
          <Link href="/privacy">{t('الخصوصية', 'Privacy')}</Link>
          <Link href="/terms">{t('الشروط', 'Terms')}</Link>
          <a href="https://t.me/devel_support">{t('تواصل', 'Contact')}</a>
        </nav>
      </div></footer>
    </div>
  )
}
