'use client'
import { useState, useEffect, createContext, useContext } from 'react'
import './globals.css'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

// ── Auth Context ──────────────────────────────────────────
type AuthCtx = { user: any; loading: boolean; refresh: () => void }
const AuthContext = createContext<AuthCtx>({ user: null, loading: true, refresh: () => {} })
export const useAuth = () => useContext(AuthContext)

// ── Language Context ──────────────────────────────────────
// t(ar, en) يرجّع النص المناسب حسب اللغة الحالية — بديل خفيف عن قاموس مفاتيح
// كامل، مناسب أكثر لكود فيه نصوص عربية مكتوبة مباشرة داخل JSX بكل صفحة.
type LangCtx = { lang: 'ar' | 'en'; setLang: (l: 'ar' | 'en') => void; t: (ar: string, en: string) => string }
const LanguageContext = createContext<LangCtx>({ lang: 'ar', setLang: () => {}, t: (ar) => ar })
export const useLang = () => useContext(LanguageContext)

const PUBLIC = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/activate', '/auth/tg', '/backtest-results']

const API = 'https://web-production-97af6.up.railway.app'

// ── SVG Icons ─────────────────────────────────────────────
const Icons = {
  dashboard: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  scanner:   <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  strategy:  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  paper:     <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  tracker:   <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
  ai:        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/></svg>,
  api:       <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  subscribe: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  backtest:  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  moon:      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  sun:       <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  logout:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  menu:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  help:      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
}

// ── Ticker Bar ────────────────────────────────────────────
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
          p: parseFloat(t.lastPrice)>=1000 ? parseFloat(t.lastPrice).toLocaleString('en',{maximumFractionDigits:0}) : parseFloat(t.lastPrice)>=1 ? parseFloat(t.lastPrice).toFixed(2) : parseFloat(t.lastPrice).toFixed(4),
          c: (parseFloat(t.priceChangePercent)>=0?'+':'')+parseFloat(t.priceChangePercent).toFixed(2)+'%',
          up: parseFloat(t.priceChangePercent)>=0,
        })))
      } catch {}
    }
    load(); const id=setInterval(load,30000); return ()=>clearInterval(id)
  },[])
  if(!ticks.length) return <div style={{height:'32px',background:'var(--surface)',borderBottom:'1px solid var(--border)'}}/>
  const items=[...ticks,...ticks]
  return (
    <div style={{height:'32px',background:'var(--surface)',borderBottom:'1px solid var(--border)',overflow:'hidden',display:'flex',alignItems:'center'}}>
      <div style={{display:'flex',animation:'ticker 40s linear infinite',whiteSpace:'nowrap',willChange:'transform'}}>
        {items.map((t,i)=>(
          <span key={i} style={{padding:'0 22px',fontSize:'11px',fontWeight:600,fontFamily:'var(--mono)',display:'inline-flex',alignItems:'center',gap:'6px',borderRight:'1px solid var(--border)',color:'var(--muted)'}}>
            <span style={{color:'var(--text)',fontWeight:700}}>{t.s}</span>
            <span>${t.p}</span>
            <span style={{color:t.up?'var(--green)':'var(--red)',fontWeight:700}}>{t.c}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Nav Config ────────────────────────────────────────────
const NAV = [
  { href:'/dashboard',        label:'الداشبورد',   icon:Icons.dashboard },
  { href:'/scanner',          label:'السكانر',     icon:Icons.scanner },
  { href:'/strategy-builder', label:'ستراتيجي',    icon:Icons.strategy },
  { href:'/paper-trading',    label:'التداول',      icon:Icons.paper },
  { href:'/coin-tracker',     label:'تتبع العملات',icon:Icons.tracker },
  { href:'/ai-assistant',     label:'مساعد AI',    icon:Icons.ai },
  { href:'/backtest-results', label:'نتائج الباك تست', icon:Icons.backtest },
  { href:'/subscribe',        label:'اشتراك',      icon:Icons.subscribe },
]

// ── Help Content ──────────────────────────────────────────
const PAGE_HELP: Record<string,{title:string;sections:{icon:string;heading:string;body:string}[]}> = {
  '/dashboard':        {title:'دليل الداشبورد',sections:[{icon:'📡',heading:'الإشارات النشطة',body:'آخر إشارات الشراء والبيع من البوت مع سعر الدخول، الهدف، ووقف الخسارة.'},{icon:'📊',heading:'الإحصائيات',body:'معدل الربح (Win Rate) وعامل الربح (Profit Factor) من جميع الصفقات المغلقة.'},{icon:'🎯',heading:'نوع الإشارة',body:'SPOT = تداول فوري. FUTURES = عقود آجلة مع رافعة.'}]},
  '/scanner':          {title:'دليل السكانر',sections:[{icon:'🔍',heading:'كيف يعمل',body:'يفحص عشرات العملات ويحسب RSI وMACD وADX وSupertrend ويعطي score من -100 إلى +100.'},{icon:'📈',heading:'Score',body:'+60 وأكثر = شراء قوي. -60 وأقل = بيع قوي.'},{icon:'💥',heading:'Pump & Dump',body:'حجم أكثر من 3× المعدل مع تغير سعر أكبر من 3%.'}]},
  '/strategy-builder': {title:'دليل منشئ الاستراتيجيات',sections:[{icon:'⚙️',heading:'بناء الشروط',body:'اختر مؤشراً ثم حدد الشرط (أكبر من، أصغر من، بين قيمتين).'},{icon:'🔗',heading:'AND vs OR',body:'AND = جميع الشروط. OR = شرط واحد يكفي.'},{icon:'▶',heading:'التشغيل',body:'اضغط "ابدأ المسح" لفحص جميع العملات.'}]},
  '/paper-trading':    {title:'دليل محفظة التداول',sections:[{icon:'💰',heading:'الرصيد',body:'محفظة تداول تجريبية (محاكاة) — ابدأ برصيد افتراضي وجرّب استراتيجياتك بدون مخاطرة حقيقية.'},{icon:'📋',heading:'فتح صفقة',body:'اختر العملة، الاتجاه (LONG/SHORT)، الرافعة (1-20×)، والحجم.'},{icon:'⏱',heading:'التحديث',body:'الأسعار تتحدث كل 15 ثانية — تُغلق الصفقات تلقائياً عند TP/SL.'}]},
  '/coin-tracker':     {title:'دليل تتبع العملات',sections:[{icon:'🔔',heading:'إنشاء تنبيه',body:'أضف عملة وحدد نوع التنبيه: السعر فوق/تحت قيمة، أو نسبة تغير 24h.'},{icon:'⚡',heading:'التشغيل',body:'يُفحص التنبيه كل 30 ثانية.'},{icon:'📋',heading:'التبويبات',body:'النشطة: لم تتحقق. المُشغَّلة: تحققت.'}]},
  '/ai-assistant':     {title:'دليل المساعد الذكي',sections:[{icon:'🤖',heading:'ما يستطيع فعله',body:'شرح المؤشرات، تفسير الإشارات، نصائح إدارة المخاطر.'},{icon:'⚠️',heading:'تنبيه',body:'تحليل تعليمي فقط — ليس نصيحة مالية.'}]},
  '/api-docs':         {title:'دليل API',sections:[{icon:'🔗',heading:'Base URL',body:`جميع الطلبات ترسل لـ ${API}`},{icon:'📋',heading:'الصيغة',body:'Content-Type: application/json'}]},
}

function HelpModal({path,onClose}:{path:string;onClose:()=>void}) {
  const help=PAGE_HELP[path]; if(!help) return null
  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',zIndex:99999,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
      <div onClick={e=>e.stopPropagation()} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'16px',width:'100%',maxWidth:'500px',maxHeight:'85vh',overflow:'auto'}}>
        <div style={{padding:'18px 22px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{fontWeight:800,fontSize:'15px'}}>{help.title}</span>
          <button onClick={onClose} style={{background:'transparent',border:'none',color:'var(--muted)',fontSize:'18px',cursor:'pointer'}}>✕</button>
        </div>
        <div style={{padding:'18px 22px',display:'flex',flexDirection:'column',gap:'14px'}}>
          {help.sections.map((s,i)=>(
            <div key={i} style={{display:'flex',gap:'12px',alignItems:'flex-start'}}>
              <div style={{width:'34px',height:'34px',borderRadius:'8px',background:'var(--surface-2)',border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'17px',flexShrink:0}}>{s.icon}</div>
              <div>
                <div style={{fontWeight:700,fontSize:'13px',marginBottom:'3px'}}>{s.heading}</div>
                <div style={{fontSize:'12px',color:'var(--muted)',lineHeight:1.6}}>{s.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Auth Gate ─────────────────────────────────────────────
function AuthGate({children,user,loading,pathname}:{children:React.ReactNode;user:any;loading:boolean;pathname:string}) {
  const router=useRouter()
  const isPublic=PUBLIC.includes(pathname)
  useEffect(()=>{if(!loading&&!user&&!isPublic)router.push('/login')},[loading,user,isPublic,router])
  if(loading) return null
  if(!user&&!isPublic) return null
  return <>{children}</>
}

// ── Sidebar ───────────────────────────────────────────────
function Sidebar({theme,toggleTheme,user,pathname,helpOpen,setHelpOpen,collapsed,setCollapsed}:{
  theme:string; toggleTheme:()=>void; user:any; pathname:string;
  helpOpen:boolean; setHelpOpen:(v:boolean)=>void; collapsed:boolean; setCollapsed:(v:boolean)=>void
}) {
  const { lang, setLang } = useLang()
  const logout=()=>{localStorage.removeItem('token');localStorage.removeItem('user_id');window.location.href='/'}
  const isApp = !PUBLIC.includes(pathname)
  if (!isApp) return null

  const W = collapsed ? 58 : 220

  return (
    <aside style={{
      position:'fixed', top:32, right:0, bottom:0, width:W, zIndex:9000,
      background:'var(--surface)', borderLeft:'1px solid var(--border)',
      display:'flex', flexDirection:'column', transition:'width 0.2s ease',
      overflow:'hidden',
    }}>
      {/* Logo — يرجّع للصفحة الرئيسية */}
      <Link href="/" title="الصفحة الرئيسية" style={{padding: collapsed?'14px 0':'14px 16px', display:'flex', alignItems:'center', gap:'10px', borderBottom:'1px solid var(--border)', justifyContent: collapsed?'center':'flex-start', textDecoration:'none'}}>
        <img src="/logo.png" alt="DevelBot" style={{height:44,width:'auto',display:'block',borderRadius:'9px',background:'#fff',padding:'4px',flexShrink:0}}/>
      </Link>

      {/* Nav */}
      <nav style={{flex:1,padding:'8px 6px',display:'flex',flexDirection:'column',gap:'2px',overflowY:'auto'}}>
        {NAV.filter(l => l.href !== '/paper-trading' || user?.is_admin).map(l=>{
          const active=pathname===l.href
          return (
            <Link key={l.href} href={l.href} title={collapsed?l.label:undefined} style={{
              display:'flex', alignItems:'center', gap:'10px',
              padding: collapsed?'10px 0':'9px 12px',
              justifyContent: collapsed?'center':'flex-start',
              borderRadius:'8px', textDecoration:'none',
              background: active?'rgba(0,196,239,0.1)':'transparent',
              color: active?'var(--cyan)':'var(--muted)',
              fontWeight: active?700:500, fontSize:'13px',
              transition:'all 0.15s', whiteSpace:'nowrap',
              borderRight: active?'2px solid var(--cyan)':'2px solid transparent',
            }}
              onMouseEnter={e=>{if(!active){e.currentTarget.style.background='var(--surface-2)';e.currentTarget.style.color='var(--text)'}}}
              onMouseLeave={e=>{if(!active){e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--muted)'}}}
            >
              <span style={{flexShrink:0,display:'flex'}}>{l.icon}</span>
              {!collapsed && l.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div style={{borderTop:'1px solid var(--border)',padding:'8px 6px',display:'flex',flexDirection:'column',gap:'4px'}}>
        {/* Help */}
        {PAGE_HELP[pathname] && (
          <button onClick={()=>setHelpOpen(!helpOpen)} title="مساعدة"
            style={{display:'flex',alignItems:'center',gap:'10px',padding:collapsed?'9px 0':'9px 12px',justifyContent:collapsed?'center':'flex-start',borderRadius:'8px',background:'transparent',border:'none',color:'var(--muted)',cursor:'pointer',fontFamily:'inherit',fontSize:'12px',fontWeight:500,transition:'all 0.15s'}}
            onMouseEnter={e=>{e.currentTarget.style.background='var(--surface-2)';e.currentTarget.style.color='var(--text)'}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--muted)'}}>
            <span style={{display:'flex',flexShrink:0}}>{Icons.help}</span>
            {!collapsed && 'مساعدة'}
          </button>
        )}
        {/* Theme */}
        <button onClick={toggleTheme} title="الثيم"
          style={{display:'flex',alignItems:'center',gap:'10px',padding:collapsed?'9px 0':'9px 12px',justifyContent:collapsed?'center':'flex-start',borderRadius:'8px',background:'transparent',border:'none',color:'var(--muted)',cursor:'pointer',fontFamily:'inherit',fontSize:'12px',fontWeight:500,transition:'all 0.15s'}}
          onMouseEnter={e=>{e.currentTarget.style.background='var(--surface-2)';e.currentTarget.style.color='var(--text)'}}
          onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--muted)'}}>
          <span style={{display:'flex',flexShrink:0}}>{theme==='dark'?Icons.sun:Icons.moon}</span>
          {!collapsed && (theme==='dark'?'وضع النهار':'وضع الليل')}
        </button>
        {/* Language */}
        <button onClick={()=>setLang(lang==='ar'?'en':'ar')} title="Language / اللغة"
          style={{display:'flex',alignItems:'center',gap:'10px',padding:collapsed?'9px 0':'9px 12px',justifyContent:collapsed?'center':'flex-start',borderRadius:'8px',background:'transparent',border:'none',color:'var(--muted)',cursor:'pointer',fontFamily:'inherit',fontSize:'12px',fontWeight:700,transition:'all 0.15s'}}
          onMouseEnter={e=>{e.currentTarget.style.background='var(--surface-2)';e.currentTarget.style.color='var(--text)'}}
          onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--muted)'}}>
          <span style={{display:'flex',flexShrink:0,width:'15px',justifyContent:'center'}}>{lang==='ar'?'EN':'ع'}</span>
          {!collapsed && (lang==='ar'?'English':'العربية')}
        </button>
        {/* User */}
        {user && (
          <div style={{display:'flex',flexDirection:'column',gap:'4px',padding:collapsed?'6px 0':'6px 12px',alignItems:collapsed?'center':'flex-start'}}>
            {!collapsed && (
              <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'2px'}}>
                <div style={{width:'26px',height:'26px',borderRadius:'50%',background:'linear-gradient(135deg,#00c4ef33,#6b1fff33)',border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:800,color:'var(--cyan)'}}>
                  {user.username?.[0]?.toUpperCase()}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:'12px',fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user.username}</div>
                  {user.is_admin && <div style={{fontSize:'9px',color:'var(--yellow)',fontWeight:800}}>ADMIN</div>}
                </div>
              </div>
            )}
            <button onClick={logout} title="خروج"
              style={{display:'flex',alignItems:'center',gap:'8px',padding:collapsed?'7px 0':'7px 10px',justifyContent:collapsed?'center':'flex-start',borderRadius:'7px',background:'rgba(255,68,85,0.06)',border:'1px solid rgba(255,68,85,0.15)',color:'#ff7070',cursor:'pointer',fontFamily:'inherit',fontSize:'11px',fontWeight:600,width:'100%',transition:'all 0.15s'}}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,68,85,0.12)'}}
              onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,68,85,0.06)'}}>
              <span style={{display:'flex',flexShrink:0}}>{Icons.logout}</span>
              {!collapsed && 'تسجيل الخروج'}
            </button>
          </div>
        )}
        {/* Collapse toggle */}
        <button onClick={()=>setCollapsed(!collapsed)}
          style={{display:'flex',alignItems:'center',gap:'10px',padding:collapsed?'9px 0':'9px 12px',justifyContent:collapsed?'center':'flex-start',borderRadius:'8px',background:'transparent',border:'none',color:'var(--muted)',cursor:'pointer',fontFamily:'inherit',fontSize:'12px',marginTop:'2px',transition:'all 0.15s'}}
          onMouseEnter={e=>{e.currentTarget.style.background='var(--surface-2)'}}
          onMouseLeave={e=>{e.currentTarget.style.background='transparent'}}>
          <span style={{display:'flex',transform:collapsed?'rotate(180deg)':'rotate(0deg)',transition:'transform 0.2s'}}>{Icons.menu}</span>
          {!collapsed && 'طي القائمة'}
        </button>
      </div>
    </aside>
  )
}

// ── Top bar for app pages ─────────────────────────────────
function TopBar({pathname,user}:{pathname:string;user:any}) {
  const pageNames: Record<string,string> = {
    '/dashboard':'الداشبورد','/scanner':'السكانر','/strategy-builder':'منشئ الاستراتيجيات',
    '/paper-trading':'التداول الحقيقي','/coin-tracker':'تتبع العملات','/ai-assistant':'مساعد AI',
    '/api-docs':'توثيق API','/subscribe':'الاشتراك',
  }
  const name=pageNames[pathname]
  if(!name) return null
  return (
    <div style={{height:'48px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 20px',background:'var(--surface)'}}>
      <span style={{fontWeight:800,fontSize:'15px',letterSpacing:'-0.02em'}}>{name}</span>
      {user && (
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <div style={{width:'7px',height:'7px',borderRadius:'50%',background:'var(--green)',animation:'pulse 2s infinite'}}/>
          <span style={{fontSize:'11px',color:'var(--muted)',fontWeight:600}}>مباشر</span>
        </div>
      )}
    </div>
  )
}

// ── Root Layout ───────────────────────────────────────────
export default function RootLayout({children}:{children:React.ReactNode}) {
  const [theme,setTheme]         = useState('dark')
  const [mounted,setMounted]     = useState(false)
  const [user,setUser]           = useState<any>(null)
  const [authLoading,setAuthLoading] = useState(true)
  const [helpOpen,setHelpOpen]   = useState(false)
  const [collapsed,setCollapsed] = useState(false)
  const [lang,setLangState]      = useState<'ar'|'en'>('ar')
  const pathname = usePathname()

  const fetchUser = async () => {
    const token=localStorage.getItem('token'), userId=localStorage.getItem('user_id')
    if(token&&userId){
      try{const r=await fetch(`${API}/user/${userId}`);const d=await r.json();if(d.username)setUser(d);else setUser(null)}
      catch{setUser(null)}
    }else setUser(null)
    setAuthLoading(false)
  }

  const setLang = (l:'ar'|'en') => {
    setLangState(l); localStorage.setItem('lang', l)
    document.documentElement.setAttribute('lang', l)
    document.documentElement.setAttribute('dir', l==='ar'?'rtl':'ltr')
  }
  const t = (ar:string, en:string) => lang==='en' ? en : ar

  useEffect(()=>{
    const saved=localStorage.getItem('theme')||'dark'
    setTheme(saved); document.documentElement.setAttribute('data-theme',saved)
    const savedLang = (localStorage.getItem('lang') as 'ar'|'en') || 'ar'
    setLangState(savedLang)
    document.documentElement.setAttribute('lang', savedLang)
    document.documentElement.setAttribute('dir', savedLang==='ar'?'rtl':'ltr')
    setMounted(true); fetchUser()
  },[])

  useEffect(()=>{setHelpOpen(false)},[pathname])

  const toggleTheme=()=>{
    const next=theme==='dark'?'light':'dark'
    setTheme(next); localStorage.setItem('theme',next); document.documentElement.setAttribute('data-theme',next)
  }

  const isApp=!PUBLIC.includes(pathname)
  const sideW=collapsed?58:220

  return (
    <html lang={lang} dir={lang==='ar'?'rtl':'ltr'}>
      <head>
        <meta charSet="utf-8"/>
        <title>DevelBot — منصة إشارات التداول</title>
        <meta name="description" content="DevelBot يراقب Binance Spot وFutures ويرسل إشارات دخول عالية الجودة فوراً — مع الدخول، الهدف، والوقف."/>
        <link rel="icon" href="/favicon.ico" sizes="any"/>
        <link rel="apple-touch-icon" href="/logo.png"/>

        {/* Open Graph / WhatsApp / Twitter link preview */}
        <meta property="og:type" content="website"/>
        <meta property="og:site_name" content="DevelBot"/>
        <meta property="og:title" content="DevelBot — منصة إشارات التداول"/>
        <meta property="og:description" content="إشارات كريبتو + بوت تلقرام — Spot وFutures، إشارات عالية الجودة فوراً مع الدخول والهدف والوقف."/>
        <meta property="og:image" content="https://devel-bot.space/logo.png"/>
        <meta property="og:url" content="https://devel-bot.space"/>
        <meta name="twitter:card" content="summary"/>
        <meta name="twitter:title" content="DevelBot — منصة إشارات التداول"/>
        <meta name="twitter:description" content="إشارات كريبتو + بوت تلقرام — Spot وFutures، إشارات عالية الجودة فوراً."/>
        <meta name="twitter:image" content="https://devel-bot.space/logo.png"/>
      </head>
      <body style={{margin:0,padding:0,background:'var(--bg)',color:'var(--text)',visibility:mounted?'visible':'hidden'}}>
        <LanguageContext.Provider value={{lang,setLang,t}}>
        <AuthContext.Provider value={{user,loading:authLoading,refresh:fetchUser}}>

          {/* Ticker — full width, fixed at top */}
          <div style={{position:'fixed',top:0,right:0,left:0,zIndex:9999}}>
            <TickerBar/>
          </div>

          {/* Sidebar — right side, below ticker */}
          <Sidebar
            theme={theme} toggleTheme={toggleTheme} user={user}
            pathname={pathname} helpOpen={helpOpen} setHelpOpen={setHelpOpen}
            collapsed={collapsed} setCollapsed={setCollapsed}
          />

          {/* Main content */}
          <div style={{
            marginTop:'32px',
            marginRight: isApp ? sideW+'px' : 0,
            minHeight:'calc(100vh - 32px)',
            transition:'margin-right 0.2s ease',
            display:'flex', flexDirection:'column',
          }}>
            {isApp && <TopBar pathname={pathname} user={user}/>}

            {/* Public header (login/register/etc) — الرئيسية "/" مستثناة لأن
                page.tsx عندها نافبار كامل خاص فيها، عرضهم مع بعض يسبب هيدر مكرر */}
            {!isApp && pathname !== '/' && (
              <header style={{padding:'0 24px',height:'60px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid var(--border)',background:'var(--surface)'}}>
                <Link href="/" title="الصفحة الرئيسية" style={{display:'flex',alignItems:'center',gap:'10px',textDecoration:'none',color:'var(--text)'}}>
                  <img src="/logo.png" alt="DevelBot" style={{height:34,width:'auto',display:'block',borderRadius:'8px',background:'#fff',padding:'3px',flexShrink:0}}/>
                </Link>
                <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                  <button onClick={()=>setLang(lang==='ar'?'en':'ar')} title="Language / اللغة" style={{minWidth:'32px',height:'32px',padding:'0 8px',borderRadius:'8px',border:'1px solid var(--border)',background:'transparent',cursor:'pointer',color:'var(--muted)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:700,fontFamily:'inherit'}}>
                    {lang==='ar'?'EN':'ع'}
                  </button>
                  <button onClick={toggleTheme} style={{width:'32px',height:'32px',borderRadius:'8px',border:'1px solid var(--border)',background:'transparent',cursor:'pointer',color:'var(--muted)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    {theme==='dark'?Icons.sun:Icons.moon}
                  </button>
                  <Link href="/login" style={{color:'var(--muted)',textDecoration:'none',fontSize:'13px',padding:'7px 14px',borderRadius:'8px',fontWeight:600}}>{t('دخول','Login')}</Link>
                  <Link href="/register" style={{background:'var(--cyan)',color:'#000',textDecoration:'none',fontWeight:800,fontSize:'13px',padding:'7px 18px',borderRadius:'8px'}}>{t('مجاناً','Free')}</Link>
                </div>
              </header>
            )}

            <AuthGate user={user} loading={authLoading} pathname={pathname}>
              <main style={{flex:1}}>
                {children}
              </main>
            </AuthGate>
          </div>

          {helpOpen && <HelpModal path={pathname} onClose={()=>setHelpOpen(false)}/>}

          <style>{`
            @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
            @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
          `}</style>
        </AuthContext.Provider>
        </LanguageContext.Provider>
      </body>
    </html>
  )
}
