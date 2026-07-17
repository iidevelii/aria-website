'use client'
import { useState, useEffect, createContext, useContext } from 'react'
import './globals.css'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

// ── Auth Context ──────────────────────────────────────────
type AuthCtx = { user: any; loading: boolean; refresh: () => void }
const AuthContext = createContext<AuthCtx>({ user: null, loading: true, refresh: () => {} })
export const useAuth = () => useContext(AuthContext)

// Public routes that don't require login
const PUBLIC = ['/', '/login', '/register', '/forgot-password', '/reset-password']

// ── Logo ─────────────────────────────────────────────────
function DevelLogo({ size = 36 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: Math.round(size * 0.28) + 'px',
      background: 'linear-gradient(135deg,#00c4ef,#6b1fff)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 900, fontSize: Math.round(size * 0.45) + 'px', color: '#fff',
      flexShrink: 0, letterSpacing: '-0.02em',
    }}>D</div>
  )
}

// ── Live Ticker Bar ───────────────────────────────────────
const TICKER_PAIRS = ['BTCUSDT','ETHUSDT','BNBUSDT','SOLUSDT','XRPUSDT','DOGEUSDT','AVAXUSDT','ADAUSDT','LINKUSDT','LTCUSDT']

function TickerBar() {
  const [ticks, setTicks] = useState<{s:string;p:string;c:string;up:boolean}[]>([])
  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${JSON.stringify(TICKER_PAIRS)}`)
        const d = await r.json()
        setTicks(d.map((t:any) => ({
          s: t.symbol.replace('USDT',''),
          p: parseFloat(t.lastPrice) >= 1000 ? parseFloat(t.lastPrice).toLocaleString('en',{maximumFractionDigits:0}) : parseFloat(t.lastPrice) >= 1 ? parseFloat(t.lastPrice).toFixed(2) : parseFloat(t.lastPrice).toFixed(4),
          c: (parseFloat(t.priceChangePercent) >= 0 ? '+' : '') + parseFloat(t.priceChangePercent).toFixed(2) + '%',
          up: parseFloat(t.priceChangePercent) >= 0,
        })))
      } catch {}
    }
    load()
    const id = setInterval(load, 30000)
    return () => clearInterval(id)
  }, [])
  if (!ticks.length) return null
  const items = [...ticks, ...ticks]
  return (
    <div style={{ height: '32px', background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid var(--border)', overflow: 'hidden', position: 'fixed', top: 0, width: '100%', zIndex: 10000, display: 'flex', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: '0', animation: 'ticker 35s linear infinite', whiteSpace: 'nowrap' }}>
        {items.map((t,i) => (
          <span key={i} style={{ padding: '0 20px', fontSize: '11px', fontWeight: 700, fontFamily: 'var(--mono)', display: 'inline-flex', alignItems: 'center', gap: '6px', borderRight: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--muted)' }}>{t.s}</span>
            <span style={{ color: 'var(--text)' }}>${t.p}</span>
            <span style={{ color: t.up ? '#00e664' : '#ff4455' }}>{t.c}</span>
          </span>
        ))}
      </div>
      <style>{`@keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
    </div>
  )
}

// ── Theme Toggle ──────────────────────────────────────────
function ThemeToggle({ theme, toggle }: { theme: string; toggle: () => void }) {
  return (
    <button onClick={toggle} title="تبديل الثيم" style={{
      width: '36px', height: '36px', borderRadius: '8px', border: '1px solid var(--border)',
      background: 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center',
      justifyContent: 'center', color: 'var(--muted)', transition: 'all 0.15s', flexShrink: 0,
    }}>
      {theme === 'dark'
        ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      }
    </button>
  )
}

// ── Page Help Modal ───────────────────────────────────────
const PAGE_HELP: Record<string, { title: string; sections: { icon: string; heading: string; body: string }[] }> = {
  '/dashboard': {
    title: 'دليل الداشبورد',
    sections: [
      { icon: '📡', heading: 'الإشارات النشطة', body: 'تعرض آخر إشارات الشراء والبيع الصادرة من البوت. كل إشارة تحتوي على سعر الدخول، الهدف، ووقف الخسارة.' },
      { icon: '📊', heading: 'الإحصائيات', body: 'تُظهر معدل الربح (Win Rate) وعامل الربح (Profit Factor) المحسوبة من جميع الصفقات المغلقة.' },
      { icon: '🎯', heading: 'نوع الإشارة', body: 'SPOT = تداول فوري بدون رافعة. FUTURES = عقود آجلة مع رافعة مالية (أعلى مخاطرة وأعلى ربح).' },
    ]
  },
  '/scanner': {
    title: 'دليل السكانر',
    sections: [
      { icon: '🔍', heading: 'كيف يعمل', body: 'يفحص السكانر عشرات العملات تلقائياً ويحسب مؤشرات RSI و MACD و ADX و Supertrend ثم يعطي كل عملة نقاط من -100 إلى +100.' },
      { icon: '📈', heading: 'Score', body: '+60 وأكثر = إشارة شراء قوية. -60 وأقل = إشارة بيع قوية. الأرقام القريبة من الصفر = سوق محايد.' },
      { icon: '🔔', heading: 'تباعد RSI', body: 'Bullish Divergence = السعر ينزل لكن RSI يرتفع → احتمال ارتداد صعودي. Bearish = العكس.' },
      { icon: '💥', heading: 'Pump & Dump', body: 'يكتشف التحركات المفاجئة — الحجم أكثر من 3× المعدل مع تغير سعر أكبر من 3%.' },
    ]
  },
  '/strategy-builder': {
    title: 'دليل منشئ الاستراتيجيات',
    sections: [
      { icon: '⚙️', heading: 'بناء الشروط', body: 'اختر مؤشراً (RSI، ADX، Score...) ثم حدد الشرط (أكبر من، أصغر من، بين قيمتين).' },
      { icon: '🔗', heading: 'AND vs OR', body: 'AND = يجب تحقق جميع الشروط. OR = يكفي تحقق شرط واحد.' },
      { icon: '▶', heading: 'تشغيل المسح', body: 'اضغط "ابدأ المسح" — يفحص البوت جميع العملات المختارة ويعرض المطابقة بعلامة ✓.' },
      { icon: '💾', heading: 'الحفظ', body: 'يمكنك حفظ استراتيجيتك وإعادة تشغيلها لاحقاً في أي وقت.' },
    ]
  },
  '/paper-trading': {
    title: 'دليل التداول الورقي',
    sections: [
      { icon: '💰', heading: 'الرصيد الافتراضي', body: 'تبدأ بـ $10,000 افتراضية — لا توجد أموال حقيقية. مناسب لاختبار الاستراتيجيات.' },
      { icon: '📋', heading: 'فتح صفقة', body: 'اختر العملة، الاتجاه (LONG شراء / SHORT بيع)، الرافعة (1-20×)، والحجم بالـ USDT.' },
      { icon: '🎯', heading: 'TP & SL', body: 'الهدف يُضبط تلقائياً +5% والوقف -3% من سعر الدخول. يمكن تعديلهما.' },
      { icon: '⏱', heading: 'التحديث', body: 'الأسعار تتحدث كل 15 ثانية — تُغلق الصفقات تلقائياً عند الوصول للهدف أو الوقف.' },
    ]
  },
  '/coin-tracker': {
    title: 'دليل تتبع العملات',
    sections: [
      { icon: '🔔', heading: 'إنشاء تنبيه', body: 'أضف عملة وحدد نوع التنبيه: السعر فوق/تحت قيمة معينة، أو نسبة تغير خلال 24 ساعة.' },
      { icon: '⚡', heading: 'التشغيل', body: 'يُفحص التنبيه كل 30 ثانية — عند تحققه يظهر بلون أحمر مع أيقونة 🔔.' },
      { icon: '📋', heading: 'التبويبات', body: 'النشطة: التنبيهات التي لم تتحقق بعد. المُشغَّلة: التنبيهات التي تحققت.' },
    ]
  },
  '/ai-assistant': {
    title: 'دليل مساعد ARIA الذكي',
    sections: [
      { icon: '🤖', heading: 'ما يستطيع ARIA فعله', body: 'شرح المؤشرات التقنية، تفسير الإشارات، نصائح إدارة المخاطر، والإجابة على أسئلة التداول بالعربية.' },
      { icon: '⚡', heading: 'الأسئلة السريعة', body: 'استخدم الأزرار الجاهزة في الأعلى للأسئلة الشائعة بدلاً من كتابتها.' },
      { icon: '⚠️', heading: 'تنبيه مهم', body: 'ARIA يقدم تحليلاً تعليمياً فقط — ليس نصيحة مالية. دائماً ابحث وتحقق قبل اتخاذ أي قرار تداول.' },
    ]
  },
  '/api-docs': {
    title: 'دليل توثيق API',
    sections: [
      { icon: '🔗', heading: 'Base URL', body: 'جميع الطلبات ترسل لـ https://web-production-97af6.up.railway.app' },
      { icon: '📋', heading: 'الصيغة', body: 'Content-Type: application/json — كل الطلبات والردود بصيغة JSON.' },
      { icon: '🔍', heading: 'البحث', body: 'استخدم حقل البحث للعثور على endpoint محدد بالاسم أو المسار.' },
    ]
  },
}

function HelpModal({ path, onClose }: { path: string; onClose: () => void }) {
  const help = PAGE_HELP[path]
  if (!help) return null
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px', width: '100%', maxWidth: '520px', maxHeight: '85vh', overflow: 'auto' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#00c4ef,#6b1fff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff', fontSize: '14px' }}>?</div>
            <span style={{ fontWeight: 800, fontSize: '16px' }}>{help.title}</span>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: '20px', cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {help.sections.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>{s.icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{s.heading}</div>
                <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6 }}>{s.body}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', fontSize: '11px', color: 'var(--dim)', textAlign: 'center' }}>اضغط خارج النافذة لإغلاقها</div>
      </div>
    </div>
  )
}

// ── Auth Gate ─────────────────────────────────────────────
function AuthGate({ children, user, loading, pathname }: { children: React.ReactNode; user: any; loading: boolean; pathname: string }) {
  const router = useRouter()
  const isPublic = PUBLIC.includes(pathname)

  useEffect(() => {
    if (!loading && !user && !isPublic) {
      router.push('/login')
    }
  }, [loading, user, isPublic, router])

  if (loading) return null
  if (!user && !isPublic) return null
  return <>{children}</>
}

// ── Header ────────────────────────────────────────────────
function Header({ theme, toggleTheme, user, onHelp, showHelp }: { theme: string; toggleTheme: () => void; user: any; onHelp: () => void; showHelp: boolean }) {
  const router = useRouter()
  const pathname = usePathname()

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user_id')
    window.location.href = '/'
  }

  const navLinks = [
    { href: '/dashboard',        label: 'الداشبورد' },
    { href: '/scanner',          label: 'السكانر' },
    { href: '/strategy-builder', label: 'ستراتيجي' },
    { href: '/paper-trading',    label: 'ورقي' },
    { href: '/coin-tracker',     label: 'تتبع' },
    { href: '/ai-assistant',     label: 'ARIA AI' },
    { href: '/api-docs',         label: 'API' },
    { href: '/subscribe',        label: 'اشتراك' },
  ]

  return (
    <nav style={{
      position: 'fixed', top: 0, width: '100%', zIndex: 9999,
      background: theme === 'dark' ? 'rgba(5,5,8,0.88)' : 'rgba(240,244,248,0.92)',
      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      borderBottom: '1px solid var(--border)',
      padding: '0 20px', height: '64px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      boxSizing: 'border-box',
    }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'var(--text)' }}>
        <DevelLogo size={34} />
        <span style={{ fontWeight: 900, fontSize: '19px', letterSpacing: '-0.04em' }}>
          Devel<span style={{ color: 'var(--cyan)' }}>Bot</span>
        </span>
      </Link>

      <div style={{ display: 'flex', gap: '2px', alignItems: 'center', flexWrap: 'nowrap', overflow: 'auto' }}>
        {navLinks.map(l => (
          <Link key={l.href} href={l.href}
            style={{ color: pathname === l.href ? 'var(--text)' : 'var(--muted)', textDecoration: 'none', fontSize: '13px', padding: '7px 11px', borderRadius: '8px', transition: 'color 0.15s', fontWeight: pathname === l.href ? 700 : 400, background: pathname === l.href ? 'var(--surface)' : 'transparent', whiteSpace: 'nowrap' }}>
            {l.label}
          </Link>
        ))}

        {showHelp && (
          <button onClick={onHelp} title="مساعدة" style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cyan)', fontWeight: 800, fontSize: '14px', margin: '0 2px' }}>?</button>
        )}

        <ThemeToggle theme={theme} toggle={toggleTheme} />
        <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 4px' }}/>

        {user ? (
          <>
            {user.is_admin && <span style={{ padding: '3px 8px', borderRadius: '5px', fontSize: '10px', fontWeight: 800, background: 'rgba(245,200,66,0.15)', color: '#f5c842', border: '1px solid rgba(245,200,66,0.3)' }}>ADMIN</span>}
            <span style={{ color: 'var(--cyan)', fontSize: '13px', padding: '7px 10px', fontWeight: 700 }}>👤 {user.username}</span>
            <button onClick={logout} style={{ background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.25)', color: '#ff7070', fontSize: '12px', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit' }}>خروج</button>
          </>
        ) : (
          <>
            <Link href="/login" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '13px', padding: '7px 12px', borderRadius: '8px' }}>دخول</Link>
            <Link href="/register" style={{ background: 'var(--cyan)', color: '#000', textDecoration: 'none', fontWeight: 800, fontSize: '13px', padding: '7px 16px', borderRadius: '8px' }}>مجاناً</Link>
          </>
        )}
      </div>
    </nav>
  )
}

// ── Root Layout ───────────────────────────────────────────
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState('dark')
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [helpOpen, setHelpOpen] = useState(false)
  const pathname = usePathname()

  const fetchUser = async () => {
    const token = localStorage.getItem('token')
    const userId = localStorage.getItem('user_id')
    if (token && userId) {
      try {
        const r = await fetch(`https://web-production-97af6.up.railway.app/user/${userId}`)
        const data = await r.json()
        if (data.username) setUser(data); else setUser(null)
      } catch { setUser(null) }
    } else { setUser(null) }
    setAuthLoading(false)
  }

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'dark'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)
    setMounted(true)
    fetchUser()
  }, [])

  useEffect(() => {
    setHelpOpen(false)
  }, [pathname])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  const showHelp = !!PAGE_HELP[pathname]

  return (
    <html lang="ar" dir="rtl">
      <head><meta charSet="utf-8" /><title>ARIA</title></head>
      <body style={{ margin: 0, padding: 0, background: 'var(--bg)', color: 'var(--text)', paddingTop: '96px', visibility: mounted ? 'visible' : 'hidden' }}>
        <AuthContext.Provider value={{ user, loading: authLoading, refresh: fetchUser }}>
          <TickerBar />
          <div style={{ marginTop: '32px' }}>
          <Header theme={theme} toggleTheme={toggleTheme} user={user} onHelp={() => setHelpOpen(true)} showHelp={showHelp} />
          <AuthGate user={user} loading={authLoading} pathname={pathname}>
            {children}
          </AuthGate>
          {helpOpen && <HelpModal path={pathname} onClose={() => setHelpOpen(false)} />}
          </div>
        </AuthContext.Provider>
      </body>
    </html>
  )
}
