'use client'
import { useState, useCallback, useEffect } from 'react'
import { useLang } from '../ClientShell'

const API = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-97af6.up.railway.app'

function _ema(v: number[], p: number) { const k=2/(p+1),r=[v[0]];for(let i=1;i<v.length;i++)r.push(v[i]*k+r[i-1]*(1-k));return r }
function _rsi(c: number[], p=14) { if(c.length<p+1)return 50;let g=0,l=0;for(let i=c.length-p;i<c.length;i++){const d=c[i]-c[i-1];if(d>0)g+=d;else l-=d}const ag=g/p,al=l/p;return al===0?100:100-100/(1+ag/al) }
function _macd(c: number[]) { if(c.length<35)return{bullish:false,rising:false};const e12=_ema(c,12),e26=_ema(c,26);const ml=e12.map((v,i)=>v-e26[i]);const sig=_ema(ml.slice(-30),9);const h=ml[ml.length-1]-sig[sig.length-1],ph=ml[ml.length-2]-sig[sig.length-2];return{bullish:h>0,rising:h>ph} }
function _adx(hi: number[], lo: number[], c: number[], p=14) { if(c.length<p*2)return{adx:0,pdi:50,mdi:50};const pdm=[],mdm=[],tr=[];for(let i=1;i<c.length;i++){const up=hi[i]-hi[i-1],dn=lo[i-1]-lo[i];pdm.push(up>dn&&up>0?up:0);mdm.push(dn>up&&dn>0?dn:0);tr.push(Math.max(hi[i]-lo[i],Math.abs(hi[i]-c[i-1]),Math.abs(lo[i]-c[i-1])))}let sTR=tr.slice(0,p).reduce((a,b)=>a+b,0),sPDM=pdm.slice(0,p).reduce((a,b)=>a+b,0),sMDM=mdm.slice(0,p).reduce((a,b)=>a+b,0);const dx=[];let lp=0,lm=0;for(let i=p;i<tr.length;i++){sTR=sTR-sTR/p+tr[i];sPDM=sPDM-sPDM/p+pdm[i];sMDM=sMDM-sMDM/p+mdm[i];lp=(sPDM/sTR)*100;lm=(sMDM/sTR)*100;dx.push(Math.abs(lp-lm)/(lp+lm+0.001)*100)}return{adx:dx.slice(-p).reduce((a,b)=>a+b,0)/p,pdi:lp,mdi:lm} }
function _st(hi: number[], lo: number[], c: number[], p=10, m=3): 'up'|'down' { if(c.length<p+2)return'up';const atrs=[];let a=0;for(let i=1;i<c.length;i++){const t=Math.max(hi[i]-lo[i],Math.abs(hi[i]-c[i-1]),Math.abs(lo[i]-c[i-1]));if(i<=p)a+=t/p;else a=(a*(p-1)+t)/p;if(i>=p)atrs.push(a)}let dir:'up'|'down'='up',upper=0,lower=0;for(let i=0;i<atrs.length;i++){const idx=c.length-atrs.length+i,hl2=(hi[idx]+lo[idx])/2,nu=hl2+m*atrs[i],nl=hl2-m*atrs[i];if(i===0){upper=nu;lower=nl}else{upper=nu<upper||c[idx-1]>upper?nu:upper;lower=nl>lower||c[idx-1]<lower?nl:lower}if(dir==='up'&&c[idx]<lower)dir='down';else if(dir==='down'&&c[idx]>upper)dir='up'}return dir }
function _bb(c: number[], p=20) { const sl=c.slice(-p),mn=sl.reduce((a,b)=>a+b,0)/p,std=Math.sqrt(sl.reduce((a,b)=>a+(b-mn)**2,0)/p);return Math.max(0,Math.min(100,(c[c.length-1]-(mn-2*std))/(4*std)*100)) }
function _score(r: number, md: { bullish: boolean; rising: boolean }, ax: { adx: number; pdi: number; mdi: number }, st: string) { let s=0;if(r>=70)s-=20;else if(r>=60)s+=25;else if(r>=50)s+=10;else if(r<=30)s+=20;else if(r<=40)s-=25;else s-=10;s+=md.bullish?(md.rising?25:15):(md.rising?-15:-25);s+=ax.adx>25?(ax.pdi>ax.mdi?25:-25):(ax.pdi>ax.mdi?10:-10);s+=st==='up'?20:-20;return Math.max(-100,Math.min(100,s)) }

const fmt = (p: number) => p>=10000?p.toLocaleString('en',{maximumFractionDigits:0}):p>=1?p.toFixed(3):p>=0.01?p.toFixed(5):p.toFixed(8)

async function fetchAllUsdtPairs(limit: number): Promise<string[]> {
  try {
    const r = await fetch('https://api.binance.com/api/v3/ticker/24hr')
    const data: { symbol: string; quoteVolume: string }[] = await r.json()
    return data
      .filter((t) => t.symbol.endsWith('USDT') && !t.symbol.includes('UP') && !t.symbol.includes('DOWN') && !t.symbol.includes('BEAR') && !t.symbol.includes('BULL'))
      .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
      .slice(0, limit)
      .map((t) => t.symbol)
  } catch {
    return ['BTCUSDT','ETHUSDT','BNBUSDT','SOLUSDT','XRPUSDT','DOGEUSDT','AVAXUSDT','ADAUSDT','LINKUSDT','ATOMUSDT']
  }
}

const TFS = ['15m','1h','4h','1d']
const PAIR_COUNTS = [
  { label: 'Top 50',  value: 50  },
  { label: 'Top 100', value: 100 },
  { label: 'Top 200', value: 200 },
  { label: 'الكل',    value: 999 },
]

type Condition = { id: string; indicator: string; operator: string; value: string; value2?: string }
type Logic = 'AND' | 'OR'
type Strategy = { id: string; name: string; conditions: Condition[]; logic: Logic; createdAt: string }
type Result = { symbol: string; price: number; chg: number; rsi: number; adx: number; st: string; macd: boolean; bb: number; score: number; passed: boolean }
type CustomAlert = {
  id: number; name: string; conditions: Condition[]; logic: Logic
  timeframe: string; pair_count: number; active: boolean
  alert_type?: string; pattern_type?: string | null
}

const PATTERN_TYPES: { id: string; label: [string, string] }[] = [
  { id: 'double_top',             label: ['قمة مزدوجة', 'Double Top'] },
  { id: 'double_bottom',          label: ['قاع مزدوج', 'Double Bottom'] },
  { id: 'triple_top',             label: ['قمة ثلاثية', 'Triple Top'] },
  { id: 'triple_bottom',          label: ['قاع ثلاثي', 'Triple Bottom'] },
  { id: 'head_shoulders',         label: ['رأس وكتفين', 'Head & Shoulders'] },
  { id: 'inverse_head_shoulders', label: ['رأس وكتفين معكوس', 'Inverse Head & Shoulders'] },
  { id: 'ascending_triangle',     label: ['مثلث صاعد', 'Ascending Triangle'] },
  { id: 'descending_triangle',    label: ['مثلث هابط', 'Descending Triangle'] },
  { id: 'symmetrical_triangle',   label: ['مثلث متماثل', 'Symmetrical Triangle'] },
  { id: 'rising_wedge',           label: ['وتد صاعد', 'Rising Wedge'] },
  { id: 'falling_wedge',          label: ['وتد هابط', 'Falling Wedge'] },
]

const INDICATORS = [
  { id: 'rsi',   label: 'RSI',         type: 'number' },
  { id: 'adx',   label: 'ADX',         type: 'number' },
  { id: 'score', label: 'Score',        type: 'number' },
  { id: 'bb',    label: 'Bollinger %',  type: 'number' },
  { id: 'chg',   label: 'تغير 24h %',  type: 'number' },
  { id: 'macd',  label: 'MACD',         type: 'enum', options: [{ v: 'bullish', l: 'صعودي' }, { v: 'bearish', l: 'هبوطي' }] },
  { id: 'st',    label: 'Supertrend',   type: 'enum', options: [{ v: 'up', l: 'صاعد ▲' }, { v: 'down', l: 'هابط ▼' }] },
]

const NUM_OPS = [{ v: '>', l: '>' }, { v: '<', l: '<' }, { v: '>=', l: '>=' }, { v: '<=', l: '<=' }, { v: 'between', l: 'بين' }]

const PRESETS: Strategy[] = [
  {
    id: 'buy', name: 'إشارة شراء', logic: 'AND', createdAt: '',
    conditions: [
      { id:'1', indicator:'rsi', operator:'<', value:'55' },
      { id:'2', indicator:'st', operator:'=', value:'up' },
      { id:'3', indicator:'adx', operator:'>', value:'20' },
      { id:'4', indicator:'macd', operator:'=', value:'bullish' },
    ]
  },
  {
    id: 'sell', name: 'إشارة بيع', logic: 'AND', createdAt: '',
    conditions: [
      { id:'1', indicator:'rsi', operator:'>', value:'65' },
      { id:'2', indicator:'st', operator:'=', value:'down' },
      { id:'3', indicator:'adx', operator:'>', value:'25' },
      { id:'4', indicator:'score', operator:'<', value:'-30' },
    ]
  },
  {
    id: 'strong', name: 'فرصة قوية', logic: 'AND', createdAt: '',
    conditions: [
      { id:'1', indicator:'score', operator:'>=', value:'60' },
      { id:'2', indicator:'rsi', operator:'between', value:'40', value2:'65' },
      { id:'3', indicator:'macd', operator:'=', value:'bullish' },
    ]
  },
  {
    id: 'oversold', name: 'ارتداد محتمل', logic: 'AND', createdAt: '',
    conditions: [
      { id:'1', indicator:'rsi', operator:'<', value:'35' },
      { id:'2', indicator:'st', operator:'=', value:'up' },
      { id:'3', indicator:'bb', operator:'<', value:'20' },
    ]
  },
]

function loadStrats(): Strategy[] { try { return JSON.parse(localStorage.getItem('strategies') || '[]') } catch { return [] } }
function saveStrats(s: Strategy[]) { localStorage.setItem('strategies', JSON.stringify(s)) }
function newCond(): Condition { return { id: Date.now().toString(), indicator: 'rsi', operator: '>', value: '50' } }

function evalCond(r: Result, c: Condition): boolean {
  const v = parseFloat(c.value)
  if (c.indicator === 'macd') return c.value === 'bullish' ? r.macd : !r.macd
  if (c.indicator === 'st')   return c.value === 'up' ? r.st === 'up' : r.st === 'down'
  const map: Record<string, number> = { rsi: r.rsi, adx: r.adx, score: r.score, bb: r.bb, chg: r.chg }
  const actual = map[c.indicator] ?? 0
  if (c.operator === '>')  return actual > v
  if (c.operator === '<')  return actual < v
  if (c.operator === '>=') return actual >= v
  if (c.operator === '<=') return actual <= v
  if (c.operator === 'between') return actual >= v && actual <= parseFloat(c.value2 || c.value)
  return false
}

function evalStrategy(r: Result, conds: Condition[], logic: Logic): boolean {
  if (!conds.length) return false
  return logic === 'AND' ? conds.every(c => evalCond(r, c)) : conds.some(c => evalCond(r, c))
}

export default function StrategyBuilderPage() {
  const { t, lang } = useLang()
  const [conditions, setConditions] = useState<Condition[]>([newCond()])
  const [logic, setLogic] = useState<Logic>('AND')
  const [stratName, setStratName] = useState('')
  const [tf, setTf] = useState('1h')
  const [pairCount, setPairCount] = useState(100)
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [totalPairs, setTotalPairs] = useState(0)
  const [saved, setSaved] = useState<Strategy[]>(() => { try { return loadStrats() } catch { return [] } })

  const [customAlerts, setCustomAlerts] = useState<CustomAlert[]>([])
  const [activating, setActivating] = useState(false)
  const [activateMsg, setActivateMsg] = useState('')

  const loadCustomAlerts = async () => {
    const uid = localStorage.getItem('user_id')
    if (!uid) return
    try {
      const r = await fetch(`${API}/custom-alerts?user_id=${uid}`, { credentials: 'include' })
      if (r.ok) setCustomAlerts(await r.json())
    } catch {}
  }

  useEffect(() => { loadCustomAlerts() }, [])

  const activateOnTelegram = async () => {
    const uid = localStorage.getItem('user_id')
    if (!uid) { setActivateMsg(t('سجّل دخولك عشان تفعّل التنبيه على تلقرام', 'Log in to activate Telegram alerts')); return }
    if (!stratName.trim()) { setActivateMsg(t('أدخل اسم الاستراتيجية أولاً', 'Enter a strategy name first')); return }
    setActivating(true); setActivateMsg('')
    try {
      const r = await fetch(`${API}/custom-alerts`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: Number(uid), name: stratName, conditions, logic, timeframe: tf, pair_count: pairCount }),
      })
      const d = await r.json()
      if (r.ok) { setActivateMsg(t('✅ تم التفعيل، راح توصلك تنبيهات على تلقرام', '✅ Activated, you\'ll get alerts on Telegram')); loadCustomAlerts() }
      else setActivateMsg(d.detail || t('تعذّر التفعيل', 'Could not activate'))
    } catch { setActivateMsg(t('تعذّر التفعيل', 'Could not activate')) }
    setActivating(false)
  }

  const toggleAlert = async (id: number, active: boolean) => {
    try {
      await fetch(`${API}/custom-alerts/${id}/toggle`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active }),
      })
      setCustomAlerts(cs => cs.map(a => a.id === id ? { ...a, active } : a))
    } catch {}
  }

  const deleteAlert = async (id: number) => {
    try {
      await fetch(`${API}/custom-alerts/${id}`, { method: 'DELETE', credentials: 'include' })
      setCustomAlerts(cs => cs.filter(a => a.id !== id))
    } catch {}
  }

  const [patternType, setPatternType] = useState(PATTERN_TYPES[0].id)
  const [patternTf, setPatternTf] = useState('1h')
  const [patternPairCount, setPatternPairCount] = useState(100)
  const [patternActivating, setPatternActivating] = useState(false)
  const [patternMsg, setPatternMsg] = useState('')

  const patternLabel = (id: string): string => {
    const p = PATTERN_TYPES.find(x => x.id === id)
    return p ? t(p.label[0], p.label[1]) : id
  }

  const activatePatternOnTelegram = async () => {
    const uid = localStorage.getItem('user_id')
    if (!uid) { setPatternMsg(t('سجّل دخولك عشان تفعّل التنبيه على تلقرام', 'Log in to activate Telegram alerts')); return }
    setPatternActivating(true); setPatternMsg('')
    try {
      const r = await fetch(`${API}/custom-alerts`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: Number(uid), name: `نمط: ${patternLabel(patternType)}`,
          alert_type: 'pattern', pattern_type: patternType,
          timeframe: patternTf, pair_count: patternPairCount,
        }),
      })
      const d = await r.json()
      if (r.ok) { setPatternMsg(t('✅ تم التفعيل، راح توصلك تنبيهات على تلقرام', '✅ Activated, you\'ll get alerts on Telegram')); loadCustomAlerts() }
      else setPatternMsg(d.detail || t('تعذّر التفعيل', 'Could not activate'))
    } catch { setPatternMsg(t('تعذّر التفعيل', 'Could not activate')) }
    setPatternActivating(false)
  }

  const addCond = () => setConditions(cs => [...cs, newCond()])
  const remCond = (id: string) => setConditions(cs => cs.filter(c => c.id !== id))
  const updCond = (id: string, field: string, val: string) => setConditions(cs => cs.map(c => c.id===id?{...c,[field]:val}:c))

  const indicatorLabel = (id: string): string => {
    const map: Record<string, [string, string]> = {
      rsi: ['RSI', 'RSI'],
      adx: ['ADX', 'ADX'],
      score: ['Score', 'Score'],
      bb: ['Bollinger %', 'Bollinger %'],
      chg: ['تغير 24h %', '24h Change %'],
      macd: ['MACD', 'MACD'],
      st: ['Supertrend', 'Supertrend'],
    }
    const pair = map[id]
    return pair ? t(pair[0], pair[1]) : id
  }

  const enumOptionLabel = (indicatorId: string, value: string): string => {
    const map: Record<string, Record<string, [string, string]>> = {
      macd: { bullish: ['صعودي', 'Bullish'], bearish: ['هبوطي', 'Bearish'] },
      st: { up: ['صاعد ▲', 'Up ▲'], down: ['هابط ▼', 'Down ▼'] },
    }
    const pair = map[indicatorId]?.[value]
    return pair ? t(pair[0], pair[1]) : value
  }

  const opLabel = (v: string): string => v === 'between' ? t('بين', 'between') : v

  const presetLabel = (id: string): string => {
    const map: Record<string, [string, string]> = {
      buy: ['إشارة شراء', 'Buy Signal'],
      sell: ['إشارة بيع', 'Sell Signal'],
      strong: ['فرصة قوية', 'Strong Opportunity'],
      oversold: ['ارتداد محتمل', 'Potential Rebound'],
    }
    const pair = map[id]
    return pair ? t(pair[0], pair[1]) : id
  }

  const pairCountLabel = (value: number, label: string): string => value === 999 ? t('الكل', 'All') : label

  const loadPreset = (p: Strategy) => {
    setConditions(p.conditions.map(c => ({ ...c, id: Date.now() + c.id })))
    setLogic(p.logic)
    setStratName(presetLabel(p.id))
  }

  const saveStrat = () => {
    if (!stratName.trim()) { alert(t('أدخل اسم الاستراتيجية', 'Please enter a strategy name')); return }
    const s: Strategy = { id: Date.now().toString(), name: stratName, conditions, logic, createdAt: new Date().toISOString() }
    const next = [s, ...loadStrats()]; saveStrats(next); setSaved(next)
  }

  const deleteSaved = (id: string) => { const next = saved.filter(s => s.id !== id); setSaved(next); saveStrats(next) }
  const loadSaved   = (s: Strategy) => { setConditions(s.conditions.map(c => ({ ...c, id: Date.now() + c.id }))); setLogic(s.logic); setStratName(s.name) }

  const runScan = useCallback(async () => {
    if (!conditions.length) return
    setLoading(true); setResults([]); setProgress(0); setTotalPairs(0)
    const PAIRS = await fetchAllUsdtPairs(pairCount)
    setTotalPairs(PAIRS.length)
    const res: Result[] = []
    for (let i = 0; i < PAIRS.length; i += 5) {
      const batch = PAIRS.slice(i, i + 5)
      const batchRes = await Promise.all(batch.map(async sym => {
        try {
          const [kr, tr] = await Promise.all([
            fetch(`https://api.binance.com/api/v3/klines?symbol=${sym}&interval=${tf}&limit=150`),
            fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${sym}`),
          ])
          const k = await kr.json(), t = await tr.json()
          if (!Array.isArray(k) || k.length < 50) return null
          const hi=k.map((x:(string|number)[])=>parseFloat(String(x[2]))),lo=k.map((x:(string|number)[])=>parseFloat(String(x[3]))),c=k.map((x:(string|number)[])=>parseFloat(String(x[4])))
          const rsi=_rsi(c),md=_macd(c),ax=_adx(hi,lo,c),st=_st(hi,lo,c),bb=_bb(c),sc=_score(rsi,md,ax,st)
          const r: Result = { symbol:sym, price:parseFloat(t.lastPrice||c[c.length-1]), chg:parseFloat(t.priceChangePercent||'0'), rsi, adx:ax.adx, st, macd:md.bullish, bb, score:sc, passed:false }
          r.passed = evalStrategy(r, conditions, logic)
          return r
        } catch { return null }
      }))
      batchRes.forEach(r => { if (r) res.push(r) })
      setProgress(Math.round(((i + 5) / PAIRS.length) * 100))
      setResults([...res])
      await new Promise(r => setTimeout(r, 80))
    }
    setLoading(false)
  }, [conditions, logic, tf, pairCount])

  const passed = results.filter(r => r.passed)
  const indDef = (id: string) => INDICATORS.find(x => x.id === id)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>

      {/* Hero bar */}
      <div style={{ background: 'linear-gradient(135deg, rgba(0,196,239,0.06) 0%, rgba(107,31,255,0.06) 100%)', borderBottom: '1px solid var(--border)', padding: '28px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 4px' }}>{t('منشئ الاستراتيجيات', 'Strategy Builder')}</h1>
            <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>{t('صمّم شروطك التقنية واكتشف أفضل الفرص من جميع عملات Binance', 'Design your technical conditions and discover the best opportunities across all Binance pairs')}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {PRESETS.map(p => (
              <button key={p.id} onClick={() => loadPreset(p)}
                style={{ padding: '8px 16px', borderRadius: '9px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='var(--cyan)'; e.currentTarget.style.color='var(--cyan)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text)' }}>
                {presetLabel(p.id)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="sb-grid" style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 32px', display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px', alignItems: 'flex-start' }}>

        {/* ─── Builder Panel ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Conditions Card */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: '14px' }}>{t('الشروط', 'Conditions')}</span>
              <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: '8px', padding: '3px', gap: '2px' }}>
                {(['AND','OR'] as const).map(l => (
                  <button key={l} onClick={() => setLogic(l)}
                    style={{ padding: '5px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, cursor: 'pointer', background: logic===l ? (l==='AND'?'var(--cyan)':'var(--purple)') : 'transparent', color: logic===l ? '#000' : 'var(--muted)', border: 'none', fontFamily: 'inherit', transition: 'all 0.15s' }}>{l}</button>
                ))}
              </div>
            </div>

            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {conditions.map((c, i) => {
                const def = indDef(c.indicator)
                return (
                  <div key={c.id}>
                    {i > 0 && (
                      <div style={{ textAlign: 'center', margin: '4px 0' }}>
                        <span style={{ padding: '2px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.08em', background: logic==='AND'?'rgba(0,196,239,0.1)':'rgba(107,31,255,0.1)', color: logic==='AND'?'var(--cyan)':'var(--purple)', border: `1px solid ${logic==='AND'?'rgba(0,196,239,0.2)':'rgba(107,31,255,0.2)'}` }}>{logic}</span>
                      </div>
                    )}
                    <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '11px', padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <select value={c.indicator} onChange={e => updCond(c.id, 'indicator', e.target.value)}
                          style={{ flex: 1, minWidth: '120px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '7px', padding: '8px 10px', color: 'var(--text)', fontSize: '12px', fontFamily: 'inherit', fontWeight: 600 }}>
                          {INDICATORS.map(ind => <option key={ind.id} value={ind.id}>{indicatorLabel(ind.id)}</option>)}
                        </select>

                        {def?.type === 'number' && (<>
                          <select value={c.operator} onChange={e => updCond(c.id, 'operator', e.target.value)}
                            style={{ width: '68px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '7px', padding: '8px 6px', color: 'var(--text)', fontSize: '13px', fontFamily: 'var(--mono)' }}>
                            {NUM_OPS.map(o => <option key={o.v} value={o.v}>{opLabel(o.v)}</option>)}
                          </select>
                          <input type="number" value={c.value} onChange={e => updCond(c.id, 'value', e.target.value)}
                            style={{ width: '62px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '7px', padding: '8px', color: 'var(--cyan)', fontSize: '13px', fontFamily: 'var(--mono)', fontWeight: 700, textAlign: 'center' }}/>
                          {c.operator === 'between' && <>
                            <span style={{ color: 'var(--muted)', fontSize: '12px' }}>{t('و', 'and')}</span>
                            <input type="number" value={c.value2||''} onChange={e => updCond(c.id, 'value2', e.target.value)}
                              style={{ width: '62px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '7px', padding: '8px', color: 'var(--cyan)', fontSize: '13px', fontFamily: 'var(--mono)', fontWeight: 700, textAlign: 'center' }}/>
                          </>}
                        </>)}

                        {def?.type === 'enum' && (
                          <select value={c.value} onChange={e => updCond(c.id, 'value', e.target.value)}
                            style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '7px', padding: '8px 10px', color: 'var(--text)', fontSize: '12px', fontFamily: 'inherit' }}>
                            {def.options?.map(o => <option key={o.v} value={o.v}>{enumOptionLabel(def.id, o.v)}</option>)}
                          </select>
                        )}

                        <button onClick={() => remCond(c.id)} disabled={conditions.length === 1}
                          style={{ width: '30px', height: '30px', background: 'transparent', border: '1px solid rgba(255,68,85,0.25)', color: 'var(--red)', borderRadius: '7px', cursor: conditions.length===1?'not-allowed':'pointer', opacity: conditions.length===1?0.3:1, fontSize: '13px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                      </div>
                    </div>
                  </div>
                )
              })}

              <button onClick={addCond}
                style={{ width: '100%', padding: '10px', background: 'transparent', border: '1.5px dashed var(--border)', color: 'var(--muted)', borderRadius: '9px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, marginTop: '4px', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='var(--cyan)'; e.currentTarget.style.color='var(--cyan)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--muted)' }}>
                {t('+ إضافة شرط', '+ Add condition')}
              </button>
            </div>
          </div>

          {/* Settings + Actions */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px 20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>{t('الإطار الزمني', 'Timeframe')}</div>
                <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: '8px', padding: '3px', gap: '2px' }}>
                  {TFS.map(tfOpt => (
                    <button key={tfOpt} onClick={() => setTf(tfOpt)}
                      style={{ flex: 1, padding: '6px 2px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: tf===tfOpt?'var(--cyan)':'transparent', color: tf===tfOpt?'#000':'var(--muted)', border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>{tfOpt}</button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>{t('عدد العملات', 'Number of pairs')}</div>
                <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: '8px', padding: '3px', gap: '2px' }}>
                  {PAIR_COUNTS.map(p => (
                    <button key={p.value} onClick={() => setPairCount(p.value)}
                      style={{ flex: 1, padding: '6px 2px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, background: pairCount===p.value?'var(--purple)':'transparent', color: pairCount===p.value?'#fff':'var(--muted)', border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>{pairCountLabel(p.value, p.label)}</button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>{t('اسم الاستراتيجية', 'Strategy name')}</div>
              <input value={stratName} onChange={e => setStratName(e.target.value)} placeholder={t('مثال: استراتيجية RSI', 'e.g. RSI Strategy')}
                style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 10px', color: 'var(--text)', fontSize: '12px', fontFamily: 'inherit', boxSizing: 'border-box' }}/>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px' }}>
              <button onClick={runScan} disabled={loading}
                style={{ padding: '13px', background: loading?'var(--surface-2)':'var(--cyan)', color: loading?'var(--muted)':'#000', border: 'none', borderRadius: '10px', fontWeight: 900, fontSize: '14px', cursor: loading?'not-allowed':'pointer', fontFamily: 'inherit', letterSpacing: '-0.01em', transition: 'all 0.2s' }}>
                {loading ? `${t('جارٍ المسح…', 'Scanning…')} ${progress}%` : `▶  ${t('ابدأ المسح', 'Start scan')}`}
              </button>
              <button onClick={saveStrat}
                style={{ padding: '13px 16px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>💾</button>
            </div>

            <button onClick={activateOnTelegram} disabled={activating}
              style={{ width: '100%', marginTop: '8px', padding: '11px', background: 'transparent', border: '1px solid rgba(0,196,239,0.3)', color: 'var(--cyan)', borderRadius: '10px', fontWeight: 800, fontSize: '13px', cursor: activating ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
              {activating ? t('جاري التفعيل...', 'Activating...') : `📲 ${t('فعّل على تلقرام', 'Activate on Telegram')}`}
            </button>
            {activateMsg && <div style={{ fontSize: '11.5px', color: activateMsg.startsWith('✅') ? 'var(--green)' : 'var(--red)', marginTop: '8px' }}>{activateMsg}</div>}
            <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '8px', lineHeight: 1.6 }}>
              {t('البوت يراقب هذي الشروط تلقائياً ويرسل لك تنبيه خاص على تلقرام أول ما تنطبق على أي عملة. لازم يكون حسابك مربوط بتلقرام من صفحة الإعدادات.', 'The bot monitors these conditions automatically and sends you a private Telegram alert whenever a coin matches. Your account must be linked to Telegram from the Settings page.')}
            </div>

            {loading && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ height: '4px', background: 'var(--surface-2)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg,var(--cyan),var(--purple))', borderRadius: '4px', transition: 'width 0.4s ease' }}/>
                </div>
                <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--muted)', textAlign: 'center' }}>{t(`تم تحليل ${results.length} من ${totalPairs} عملة…`, `Analyzed ${results.length} of ${totalPairs} coins…`)}</div>
              </div>
            )}
          </div>

          {/* Chart Pattern Alerts */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 800, fontSize: '14px' }}>
              📐 {t('تنبيهات أنماط الشارت', 'Chart Pattern Alerts')}
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ color: 'var(--muted)', fontSize: '12px', margin: 0 }}>
                {t('اختر نمط شارت كلاسيكي، والبوت يرصده تلقائياً ويرسل لك تنبيه بعد التأكيد.', 'Pick a classic chart pattern, and the bot detects it automatically and alerts you once confirmed.')}
              </p>
              <select value={patternType} onChange={e => setPatternType(e.target.value)}
                style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '7px', padding: '10px', color: 'var(--text)', fontSize: '13px', fontFamily: 'inherit', fontWeight: 700 }}>
                {PATTERN_TYPES.map(p => <option key={p.id} value={p.id}>{t(p.label[0], p.label[1])}</option>)}
              </select>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <select value={patternTf} onChange={e => setPatternTf(e.target.value)}
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '7px', padding: '9px', color: 'var(--text)', fontSize: '12px', fontFamily: 'inherit', fontWeight: 700 }}>
                  {TFS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <select value={patternPairCount} onChange={e => setPatternPairCount(Number(e.target.value))}
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '7px', padding: '9px', color: 'var(--text)', fontSize: '12px', fontFamily: 'inherit', fontWeight: 700 }}>
                  {[30, 60, 100].map(n => <option key={n} value={n}>{t(`أعلى ${n}`, `Top ${n}`)}</option>)}
                </select>
              </div>
              <button onClick={activatePatternOnTelegram} disabled={patternActivating}
                style={{ width: '100%', padding: '11px', background: 'transparent', border: '1px solid rgba(0,196,239,0.3)', color: 'var(--cyan)', borderRadius: '10px', fontWeight: 800, fontSize: '13px', cursor: patternActivating ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                {patternActivating ? t('جاري التفعيل...', 'Activating...') : `📲 ${t('فعّل على تلقرام', 'Activate on Telegram')}`}
              </button>
              {patternMsg && <div style={{ fontSize: '11.5px', color: patternMsg.startsWith('✅') ? 'var(--green)' : 'var(--red)' }}>{patternMsg}</div>}
            </div>
          </div>

          {/* Saved Strategies */}
          {saved.length > 0 && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontWeight: 800, fontSize: '13px' }}>{t('المحفوظة', 'Saved')}</div>
              {saved.map((s, i) => (
                <div key={s.id} style={{ padding: '12px 20px', borderBottom: i < saved.length-1 ? '1px solid var(--border)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13px' }}>{s.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{s.conditions.length} {t('شرط', 'conditions')} · {s.logic}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => loadSaved(s)} style={{ background: 'rgba(0,196,239,0.08)', border: '1px solid rgba(0,196,239,0.2)', color: 'var(--cyan)', padding: '5px 12px', borderRadius: '7px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>{t('تحميل', 'Load')}</button>
                    <button onClick={() => deleteSaved(s.id)} style={{ background: 'transparent', border: '1px solid rgba(255,68,85,0.2)', color: 'var(--red)', padding: '5px 10px', borderRadius: '7px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}>{t('حذف', 'Delete')}</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Active Telegram Custom Alerts */}
          {customAlerts.length > 0 && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontWeight: 800, fontSize: '13px' }}>
                📲 {t('التنبيهات المفعّلة على تلقرام', 'Active Telegram Alerts')}
              </div>
              {customAlerts.map((a, i) => (
                <div key={a.id} style={{ padding: '12px 20px', borderBottom: i < customAlerts.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13px' }}>{a.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                      {a.alert_type === 'pattern'
                        ? <>📐 {a.pattern_type ? patternLabel(a.pattern_type) : ''} · {a.timeframe} · {t('أعلى', 'top')} {a.pair_count}</>
                        : <>{a.conditions.length} {t('شرط', 'conditions')} · {a.logic} · {a.timeframe} · {t('أعلى', 'top')} {a.pair_count}</>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                    <button onClick={() => toggleAlert(a.id, !a.active)}
                      style={{ background: a.active ? 'rgba(0,230,100,0.1)' : 'var(--surface-2)', border: `1px solid ${a.active ? 'rgba(0,230,100,0.25)' : 'var(--border)'}`, color: a.active ? 'var(--green)' : 'var(--muted)', padding: '5px 12px', borderRadius: '7px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>
                      {a.active ? t('مفعّل', 'Active') : t('موقّف', 'Paused')}
                    </button>
                    <button onClick={() => deleteAlert(a.id)} style={{ background: 'transparent', border: '1px solid rgba(255,68,85,0.2)', color: 'var(--red)', padding: '5px 10px', borderRadius: '7px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}>{t('حذف', 'Delete')}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── Results ─── */}
        <div>
          {results.length > 0 && (
            <div className="sb-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
              {[
                { label: t('العملات المفحوصة', 'Coins scanned'), value: results.length,  color: 'var(--text)' },
                { label: t('تطابق الشروط', 'Matched conditions'),     value: passed.length,   color: 'var(--cyan)' },
                { label: t('نسبة التطابق', 'Match rate'),      value: `${results.length ? Math.round(passed.length/results.length*100) : 0}%`, color: passed.length>0?'var(--green)':'var(--muted)' },
                { label: t('الإطار الزمني', 'Timeframe'),     value: tf,              color: 'var(--yellow)' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '6px', fontWeight: 600 }}>{s.label}</div>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
            {results.length === 0 ? (
              <div style={{ padding: '64px 32px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                <div style={{ fontWeight: 800, fontSize: '16px', marginBottom: '6px' }}>{t('ابدأ بتحديد شروطك', 'Start by defining your conditions')}</div>
                <div style={{ color: 'var(--muted)', fontSize: '13px' }}>{t('أضف الشروط التقنية ثم اضغط "ابدأ المسح" لاكتشاف الفرص', 'Add your technical conditions then click "Start scan" to discover opportunities')}</div>
              </div>
            ) : (
              <>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: 800, fontSize: '14px' }}>{t('النتائج', 'Results')}</span>
                  {passed.length > 0 && (
                    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, background: 'rgba(0,230,100,0.1)', color: 'var(--green)', border: '1px solid rgba(0,230,100,0.2)' }}>
                      {passed.length} {t('فرصة مطابقة', 'matching opportunities')}
                    </span>
                  )}
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                    <thead>
                      <tr>
                        {[t('العملة','Coin'), t('السعر','Price'), '24h%', 'RSI', 'ADX', 'Supertrend', 'MACD', 'Score', t('الحالة','Status')].map(h => (
                          <th key={h} style={{ padding: '11px 16px', textAlign: lang==='en' ? 'left' : 'right', fontSize: '10px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.sort((a,b) => (b.passed?1:0)-(a.passed?1:0) || b.score-a.score).map((r, i) => (
                        <tr key={r.symbol} style={{ borderBottom: '1px solid var(--border)', background: r.passed ? 'rgba(0,230,100,0.03)' : i%2===0?'transparent':'rgba(255,255,255,0.01)', opacity: r.passed?1:0.55 }}>
                          <td style={{ padding: '12px 16px', fontWeight: 900, fontSize: '13px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {r.passed && <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--green)', flexShrink: 0, boxShadow: '0 0 6px rgba(0,230,100,0.5)' }}/>}
                              {r.symbol.replace('USDT','')}
                              <span style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 400 }}>USDT</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px', fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 600 }}>${fmt(r.price)}</td>
                          <td style={{ padding: '12px 16px', fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 700, color: r.chg>=0?'var(--green)':'var(--red)' }}>{r.chg>=0?'+':''}{r.chg.toFixed(2)}%</td>
                          <td style={{ padding: '12px 16px', fontFamily: 'var(--mono)', fontSize: '12px', color: r.rsi>=70?'var(--red)':r.rsi<=30?'var(--cyan)':'var(--text)' }}>{r.rsi.toFixed(1)}</td>
                          <td style={{ padding: '12px 16px', fontFamily: 'var(--mono)', fontSize: '12px', color: r.adx>25?'var(--yellow)':'var(--muted)' }}>{r.adx.toFixed(1)}</td>
                          <td style={{ padding: '12px 16px', fontWeight: 800, fontSize: '13px', color: r.st==='up'?'var(--green)':'var(--red)' }}>{r.st==='up'?`▲ ${t('صاعد','Up')}`:`▼ ${t('هابط','Down')}`}</td>
                          <td style={{ padding: '12px 16px', fontWeight: 800, fontSize: '13px', color: r.macd?'var(--green)':'var(--red)' }}>{r.macd?'▲':'▼'}</td>
                          <td style={{ padding: '12px 16px', fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 900, color: r.score>=50?'var(--green)':r.score<=-50?'var(--red)':r.score>0?'var(--cyan)':'var(--muted)' }}>{r.score>0?'+':''}{r.score}</td>
                          <td style={{ padding: '12px 16px' }}>
                            {r.passed
                              ? <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, background: 'rgba(0,230,100,0.1)', color: 'var(--green)', border: '1px solid rgba(0,230,100,0.2)', whiteSpace: 'nowrap' }}>{`✓ ${t('مطابق','Matched')}`}</span>
                              : <span style={{ fontSize: '11px', color: 'var(--dim)' }}>—</span>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .sb-grid { grid-template-columns: 1fr !important; padding: 20px 16px !important; }
          .sb-stats { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  )
}
