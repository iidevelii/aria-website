'use client'
import { useState, useEffect, useCallback } from 'react'
import { useLang } from '../layout'

// ── Indicators ───────────────────────────────────────────
function ema(v: number[], p: number) { const k=2/(p+1),r=[v[0]];for(let i=1;i<v.length;i++)r.push(v[i]*k+r[i-1]*(1-k));return r }
function rsiVal(c: number[], p=14) { if(c.length<p+1)return 50;let g=0,l=0;for(let i=c.length-p;i<c.length;i++){const d=c[i]-c[i-1];if(d>0)g+=d;else l-=d}const ag=g/p,al=l/p;return al===0?100:100-100/(1+ag/al) }
function rsiSeries(c: number[], p=14) { const r=[];for(let i=p;i<c.length;i++){let g=0,l=0;for(let j=i-p+1;j<=i;j++){const d=c[j]-c[j-1];if(d>0)g+=d;else l-=d}const ag=g/p,al=l/p;r.push(al===0?100:100-100/(1+ag/al))}return r }
function macdCalc(c: number[]) { if(c.length<35)return{bullish:false,rising:false};const e12=ema(c,12),e26=ema(c,26);const ml=e12.map((v,i)=>v-e26[i]);const sig=ema(ml.slice(-30),9);const h=ml[ml.length-1]-sig[sig.length-1],ph=ml[ml.length-2]-sig[sig.length-2];return{bullish:h>0,rising:h>ph} }
function adxCalc(hi: number[], lo: number[], c: number[], p=14) { if(c.length<p*2)return{adx:0,pdi:50,mdi:50};const pdm=[],mdm=[],tr=[];for(let i=1;i<c.length;i++){const up=hi[i]-hi[i-1],dn=lo[i-1]-lo[i];pdm.push(up>dn&&up>0?up:0);mdm.push(dn>up&&dn>0?dn:0);tr.push(Math.max(hi[i]-lo[i],Math.abs(hi[i]-c[i-1]),Math.abs(lo[i]-c[i-1])))}let sTR=tr.slice(0,p).reduce((a,b)=>a+b,0),sPDM=pdm.slice(0,p).reduce((a,b)=>a+b,0),sMDM=mdm.slice(0,p).reduce((a,b)=>a+b,0);const dx=[];let lp=0,lm=0;for(let i=p;i<tr.length;i++){sTR=sTR-sTR/p+tr[i];sPDM=sPDM-sPDM/p+pdm[i];sMDM=sMDM-sMDM/p+mdm[i];lp=(sPDM/sTR)*100;lm=(sMDM/sTR)*100;dx.push(Math.abs(lp-lm)/(lp+lm+0.001)*100)}return{adx:dx.slice(-p).reduce((a,b)=>a+b,0)/p,pdi:lp,mdi:lm} }
function stCalc(hi: number[], lo: number[], c: number[], p=10, m=3): 'up'|'down' { if(c.length<p+2)return'up';const atrs=[];let a=0;for(let i=1;i<c.length;i++){const t=Math.max(hi[i]-lo[i],Math.abs(hi[i]-c[i-1]),Math.abs(lo[i]-c[i-1]));if(i<=p)a+=t/p;else a=(a*(p-1)+t)/p;if(i>=p)atrs.push(a)}let dir:'up'|'down'='up',upper=0,lower=0;for(let i=0;i<atrs.length;i++){const idx=c.length-atrs.length+i,hl2=(hi[idx]+lo[idx])/2,nu=hl2+m*atrs[i],nl=hl2-m*atrs[i];if(i===0){upper=nu;lower=nl}else{upper=nu<upper||c[idx-1]>upper?nu:upper;lower=nl>lower||c[idx-1]<lower?nl:lower}if(dir==='up'&&c[idx]<lower)dir='down';else if(dir==='down'&&c[idx]>upper)dir='up'}return dir }
function bbPct(c: number[], p=20) { const sl=c.slice(-p),m=sl.reduce((a,b)=>a+b,0)/p,std=Math.sqrt(sl.reduce((a,b)=>a+(b-m)**2,0)/p);return Math.max(0,Math.min(100,(c[c.length-1]-(m-2*std))/(4*std)*100)) }
function scoreCalc(r: number, mc: any, ax: any, st: string) { let s=0;if(r>=70)s-=20;else if(r>=60)s+=25;else if(r>=50)s+=10;else if(r<=30)s+=20;else if(r<=40)s-=25;else s-=10;s+=mc.bullish?(mc.rising?25:15):(mc.rising?-15:-25);s+=ax.adx>25?(ax.pdi>ax.mdi?25:-25):(ax.pdi>ax.mdi?10:-10);s+=st==='up'?20:-20;return Math.max(-100,Math.min(100,s)) }
function divCalc(c: number[], rs: number[], lb=20): 'bullish'|'bearish'|null { if(c.length<lb+5||rs.length<lb+5)return null;const pc=c.slice(-lb-5,-5),rc=c.slice(-5),pr=rs.slice(-lb-5,-5),rr=rs.slice(-5);if(Math.min(...rc)<Math.min(...pc)&&Math.min(...rr)>Math.min(...pr)+2)return'bullish';if(Math.max(...rc)>Math.max(...pc)&&Math.max(...rr)<Math.max(...pr)-2)return'bearish';return null }
function pdCalc(vols: number[], c: number[]): 'pump'|'dump'|null { if(vols.length<22)return null;const avg=vols.slice(-21,-1).reduce((a,b)=>a+b,0)/20,chg=(c[c.length-1]-c[c.length-2])/c[c.length-2]*100;if(vols[vols.length-1]>avg*3){if(chg>3)return'pump';if(chg<-3)return'dump'}return null }

// ── Pattern Detection ────────────────────────────────────
type Pat = { type: string; emoji: string; bullish: boolean|null; confidence: number; desc: { ar: string; en: string } }
type Pv  = { idx: number; val: number }
function pivH(hi: number[], n=5): Pv[] { const r:Pv[]=[];for(let i=n;i<hi.length-n;i++)if(hi[i]===Math.max(...hi.slice(i-n,i+n+1)))r.push({idx:i,val:hi[i]});return r }
function pivL(lo: number[], n=5): Pv[] { const r:Pv[]=[];for(let i=n;i<lo.length-n;i++)if(lo[i]===Math.min(...lo.slice(i-n,i+n+1)))r.push({idx:i,val:lo[i]});return r }
function detectPat(hi: number[], lo: number[], c: number[]): Pat[] {
  const ph=pivH(hi),pl=pivL(lo),res:Pat[]=[]
  if(pl.length>=2){const[a,b]=[pl[pl.length-2],pl[pl.length-1]];const s=Math.abs(a.val-b.val)/((a.val+b.val)/2);if(s<0.03&&b.idx-a.idx>=5)res.push({type:'Double Bottom',emoji:'W',bullish:true,confidence:Math.round((1-s/0.03)*90),desc:{ar:'قاع مزدوج',en:'Double bottom'}})}
  if(ph.length>=2){const[a,b]=[ph[ph.length-2],ph[ph.length-1]];const s=Math.abs(a.val-b.val)/((a.val+b.val)/2);if(s<0.03&&b.idx-a.idx>=5)res.push({type:'Double Top',emoji:'M',bullish:false,confidence:Math.round((1-s/0.03)*90),desc:{ar:'قمة مزدوجة',en:'Double top'}})}
  if(ph.length>=3){const[ls,hd,rs]=ph.slice(-3);if(hd.val>ls.val&&hd.val>rs.val){const sd=Math.abs(ls.val-rs.val)/((ls.val+rs.val)/2);if(sd<0.05)res.push({type:'Head & Shoulders',emoji:'⛰️',bullish:false,confidence:Math.round((1-sd/0.05)*80),desc:{ar:'رأس وكتفان هبوطي',en:'Bearish head & shoulders'}})}}
  if(pl.length>=3){const[ls,hd,rs]=pl.slice(-3);if(hd.val<ls.val&&hd.val<rs.val){const sd=Math.abs(ls.val-rs.val)/((ls.val+rs.val)/2);if(sd<0.05)res.push({type:'Inv H&S',emoji:'🏔️',bullish:true,confidence:Math.round((1-sd/0.05)*80),desc:{ar:'رأس وكتفان صعودي',en:'Bullish inverse head & shoulders'}})}}
  if(c.length>=30){const pole=(c[c.length-15]-c[c.length-25])/c[c.length-25]*100;const fr=(Math.max(...hi.slice(-10))-Math.min(...lo.slice(-10)))/c[c.length-10]*100;if(pole>10&&fr<8)res.push({type:'Bull Flag',emoji:'🚩',bullish:true,confidence:Math.min(90,Math.round(pole*4)),desc:{ar:`بول فلاق +${pole.toFixed(1)}%`,en:`Bull flag +${pole.toFixed(1)}%`}})}
  if(c.length>=30){const pole=(c[c.length-25]-c[c.length-15])/c[c.length-25]*100;const fr=(Math.max(...hi.slice(-10))-Math.min(...lo.slice(-10)))/c[c.length-10]*100;if(pole>10&&fr<8)res.push({type:'Bear Flag',emoji:'🏴',bullish:false,confidence:Math.min(90,Math.round(pole*4)),desc:{ar:`بير فلاق -${pole.toFixed(1)}%`,en:`Bear flag -${pole.toFixed(1)}%`}})}
  if(c.length>=60){const cs=c[c.length-50],ce=c[c.length-5],mid=Math.min(...c.slice(-45,-5));const s=Math.abs(cs-ce)/((cs+ce)/2),d=(Math.min(cs,ce)-mid)/Math.min(cs,ce);if(s<0.05&&d>0.10)res.push({type:'Cup & Handle',emoji:'☕',bullish:true,confidence:Math.round((1-s/0.05)*85),desc:{ar:'كوب وعروة صعودي',en:'Bullish cup & handle'}})}
  return res.sort((a,b)=>b.confidence-a.confidence).slice(0,2)
}

// ── Types ────────────────────────────────────────────────
type PairData = {
  symbol: string; price: number; chg24h: number
  rsi: number; macd: any; adx: any; st: 'up'|'down'; bb: number; score: number
  div: 'bullish'|'bearish'|null; pd: 'pump'|'dump'|null
  patterns: Pat[]; closes: number[]
}

const PAIRS = [
  'BTCUSDT','ETHUSDT','BNBUSDT','SOLUSDT','XRPUSDT','DOGEUSDT','AVAXUSDT','ADAUSDT',
  'DOTUSDT','MATICUSDT','LINKUSDT','LTCUSDT','UNIUSDT','ATOMUSDT','XLMUSDT','ETCUSDT',
  'NEARUSDT','APTUSDT','OPUSDT','INJUSDT','SUIUSDT','ARBUSDT','TIAUSDT','WIFUSDT',
  'FLOKIUSDT','PEPEUSDT','SHIBUSDT','TRXUSDT','FETUSDT','RENDERUSDT',
  'GRTUSDT','AXSUSDT','AAVEUSDT','LDOUSDT','STXUSDT','RUNEUSDT','ICPUSDT','VETUSDT',
  'HBARUSDT','ONDOUSDT','MKRUSDT','SANDUSDT','MANAUSDT','FTMUSDT','ALGOUSDT',
  'CRVUSDT','COMPUSDT','FLOWUSDT','SNXUSDT','SEIUSDT',
]
const TFS = ['15m','1h','4h','1d'] as const

const fmtPrice = (p: number) => p>=10000?p.toLocaleString('en',{maximumFractionDigits:0}):p>=1?p.toFixed(3):p>=0.01?p.toFixed(5):p.toFixed(8)

// ── Sparkline ─────────────────────────────────────────────
function Spark({ data, up }: { data: number[]; up: boolean }) {
  if (data.length < 2) return null
  const w=80, h=28, mn=Math.min(...data), mx=Math.max(...data), rng=mx-mn||1
  const pts = data.map((v,i) => `${(i/(data.length-1))*w},${h-((v-mn)/rng)*(h-2)+1}`).join(' ')
  return (
    <svg width={w} height={h} style={{ display:'block' }}>
      <polyline points={pts} fill="none" stroke={up?'#00e664':'#ff4455'} strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  )
}

// ── RSI Arc ───────────────────────────────────────────────
function RsiArc({ v }: { v: number }) {
  const color = v >= 70 ? '#ff4455' : v <= 30 ? '#00c4ef' : v >= 55 ? '#00e664' : '#f5c842'
  const pct = v / 100
  const r = 18, cx = 22, cy = 22, circ = 2 * Math.PI * r
  const dash = pct * circ * 0.75
  return (
    <svg width="44" height="44" viewBox="0 0 44 44">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--surface-2)" strokeWidth="3"
        strokeDasharray={`${circ*0.75} ${circ*0.25}`} strokeDashoffset={circ*0.125}
        strokeLinecap="round" transform={`rotate(135 ${cx} ${cy})`}/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="3"
        strokeDasharray={`${dash} ${circ-dash}`} strokeDashoffset={circ*0.125}
        strokeLinecap="round" transform={`rotate(135 ${cx} ${cy})`}/>
      <text x={cx} y={cy+4} textAnchor="middle" fontSize="10" fontWeight="800" fill={color}>{Math.round(v)}</text>
    </svg>
  )
}

// ── Score Badge ───────────────────────────────────────────
function ScoreBadge({ v }: { v: number }) {
  const { t } = useLang()
  const abs = Math.abs(v)
  const label = abs >= 75 ? (v > 0 ? t('شراء قوي', 'Strong Buy') : t('بيع قوي', 'Strong Sell')) : abs >= 50 ? (v > 0 ? t('شراء', 'Buy') : t('بيع', 'Sell')) : abs >= 25 ? (v > 0 ? t('تصاعدي', 'Bullish') : t('تنازلي', 'Bearish')) : t('محايد', 'Neutral')
  const color = v >= 50 ? '#00e664' : v <= -50 ? '#ff4455' : v > 0 ? '#00c4ef' : v < 0 ? '#f5c842' : '#606778'
  const bg = v >= 50 ? 'rgba(0,230,100,0.1)' : v <= -50 ? 'rgba(255,68,85,0.1)' : v > 0 ? 'rgba(0,196,239,0.1)' : v < 0 ? 'rgba(245,200,66,0.1)' : 'rgba(96,103,120,0.1)'
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'2px' }}>
      <div style={{ fontSize:'20px', fontWeight:900, color, fontFamily:'var(--mono)', letterSpacing:'-0.03em' }}>{v>0?'+':''}{v}</div>
      <div style={{ padding:'2px 8px', borderRadius:'20px', fontSize:'10px', fontWeight:800, background:bg, color, border:`1px solid ${color}33` }}>{label}</div>
    </div>
  )
}

// ── Coin Card ─────────────────────────────────────────────
function CoinCard({ d, tf }: { d: PairData; tf: string }) {
  const { t } = useLang()
  const sym = d.symbol.replace('USDT','')
  const isUp = d.chg24h >= 0
  const hasPat = d.patterns.length > 0
  const topPat = d.patterns[0]

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-card)', overflow: 'hidden', transition: 'border-color 0.2s, transform 0.15s',
      cursor: 'default',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor='var(--cyan)'; e.currentTarget.style.transform='translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='none' }}>

      {/* Header */}
      <div style={{ padding:'14px 16px 10px', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:'linear-gradient(135deg,rgba(0,196,239,0.15),rgba(107,31,255,0.15))', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:'13px', color:'var(--cyan)' }}>
            {sym.slice(0,3)}
          </div>
          <div>
            <div style={{ fontWeight:900, fontSize:'15px', letterSpacing:'-0.02em' }}>{sym}</div>
            <div style={{ fontSize:'10px', color:'var(--muted)', fontWeight:600 }}>USDT · {tf}</div>
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontWeight:800, fontSize:'14px', fontFamily:'var(--mono)' }}>${fmtPrice(d.price)}</div>
          <div style={{ fontSize:'12px', fontWeight:700, color:isUp?'#00e664':'#ff4455', fontFamily:'var(--mono)' }}>{isUp?'▲':'▼'} {Math.abs(d.chg24h).toFixed(2)}%</div>
        </div>
      </div>

      {/* Score + RSI */}
      <div style={{ padding:'6px 16px 10px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <ScoreBadge v={d.score} />
        <RsiArc v={d.rsi} />
        <div style={{ display:'flex', flexDirection:'column', gap:'5px', alignItems:'flex-end' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
            <span style={{ fontSize:'10px', color:'var(--muted)', fontWeight:600 }}>MACD</span>
            <span style={{ fontSize:'12px', fontWeight:800, color:d.macd.bullish?'#00e664':'#ff4455' }}>{d.macd.bullish?'▲':'▼'}</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
            <span style={{ fontSize:'10px', color:'var(--muted)', fontWeight:600 }}>ST</span>
            <span style={{ fontSize:'12px', fontWeight:800, color:d.st==='up'?'#00e664':'#ff4455' }}>{d.st==='up'?'▲':'▼'}</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
            <span style={{ fontSize:'10px', color:'var(--muted)', fontWeight:600 }}>ADX</span>
            <span style={{ fontSize:'11px', fontWeight:700, color:d.adx.adx>25?'var(--yellow)':'var(--muted)', fontFamily:'var(--mono)' }}>{d.adx.adx.toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* ADX bar */}
      <div style={{ padding:'0 16px 10px' }}>
        <div style={{ height:'3px', background:'var(--surface-2)', borderRadius:'2px', overflow:'hidden' }}>
          <div style={{ width:`${Math.min(100,d.adx.adx)}%`, height:'100%', background:`linear-gradient(90deg,${d.adx.pdi>d.adx.mdi?'#00e664':'#ff4455'},${d.adx.pdi>d.adx.mdi?'rgba(0,230,100,0.3)':'rgba(255,68,85,0.3)'})`, borderRadius:'2px' }}/>
        </div>
      </div>

      {/* Badges row */}
      <div style={{ padding:'0 12px 10px', display:'flex', gap:'5px', flexWrap:'wrap' }}>
        {d.div && (
          <span style={{ padding:'2px 7px', borderRadius:'5px', fontSize:'10px', fontWeight:800, background:d.div==='bullish'?'rgba(0,196,239,0.12)':'rgba(245,200,66,0.12)', color:d.div==='bullish'?'var(--cyan)':'var(--yellow)', border:`1px solid ${d.div==='bullish'?'rgba(0,196,239,0.25)':'rgba(245,200,66,0.25)'}` }}>
            {d.div==='bullish'?'↗ Div+':'↘ Div-'}
          </span>
        )}
        {d.pd && (
          <span style={{ padding:'2px 7px', borderRadius:'5px', fontSize:'10px', fontWeight:800, background:d.pd==='pump'?'rgba(0,230,100,0.12)':'rgba(255,68,85,0.12)', color:d.pd==='pump'?'#00e664':'#ff4455', border:`1px solid ${d.pd==='pump'?'rgba(0,230,100,0.25)':'rgba(255,68,85,0.25)'}` }}>
            {d.pd==='pump'?'🚀 Pump':'💥 Dump'}
          </span>
        )}
        {hasPat && (
          <span style={{ padding:'2px 7px', borderRadius:'5px', fontSize:'10px', fontWeight:800, background:'rgba(107,31,255,0.12)', color:'var(--purple)', border:'1px solid rgba(107,31,255,0.25)' }}>
            {topPat.emoji} {topPat.type}
          </span>
        )}
      </div>

      {/* Sparkline footer */}
      <div style={{ padding:'0 16px 12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <Spark data={d.closes.slice(-30)} up={isUp} />
        {hasPat && (
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:'9px', color:'var(--muted)' }}>{t(topPat.desc.ar, topPat.desc.en)}</div>
            <div style={{ fontSize:'10px', fontWeight:700, color:'var(--purple)' }}>{t(`${topPat.confidence}% ثقة`, `${topPat.confidence}% confidence`)}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────
type Tab = 'all' | 'bull' | 'bear' | 'div' | 'pump' | 'patterns'

export default function ScannerPage() {
  const { t, lang } = useLang()
  const [tf, setTf]         = useState<typeof TFS[number]>('4h')
  const [data, setData]     = useState<PairData[]>([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [tab, setTab]       = useState<Tab>('all')
  const [countdown, setCountdown] = useState(900)
  const [lastScan, setLastScan]   = useState<Date|null>(null)
  const [sort, setSort]     = useState<'score'|'rsi'|'chg'>('score')

  const scan = useCallback(async (timeframe = tf) => {
    setLoading(true); setProgress(0); setData([])
    const res: PairData[] = []
    for (let i = 0; i < PAIRS.length; i += 5) {
      const batch = PAIRS.slice(i, i+5)
      const batchRes = await Promise.all(batch.map(async sym => {
        try {
          const [kr, tr] = await Promise.all([
            fetch(`https://api.binance.com/api/v3/klines?symbol=${sym}&interval=${timeframe}&limit=150`),
            fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${sym}`),
          ])
          const k = await kr.json(), t = await tr.json()
          if (!Array.isArray(k) || k.length < 50) return null
          const hi=k.map((x:any)=>parseFloat(x[2])),lo=k.map((x:any)=>parseFloat(x[3])),c=k.map((x:any)=>parseFloat(x[4])),v=k.map((x:any)=>parseFloat(x[5]))
          const rsi=rsiVal(c), rs=rsiSeries(c), macd=macdCalc(c), adx=adxCalc(hi,lo,c), st=stCalc(hi,lo,c), bb=bbPct(c), score=scoreCalc(rsi,macd,adx,st)
          return {
            symbol:sym, price:parseFloat(t.lastPrice||c[c.length-1]), chg24h:parseFloat(t.priceChangePercent||'0'),
            rsi, macd, adx, st, bb, score,
            div:divCalc(c,rs), pd:pdCalc(v,c),
            patterns:detectPat(hi,lo,c), closes:c.slice(-50),
          } as PairData
        } catch { return null }
      }))
      batchRes.forEach(r => { if(r) res.push(r) })
      setProgress(Math.round(((i+5)/PAIRS.length)*100))
      setData([...res])
      await new Promise(r => setTimeout(r,80))
    }
    setLoading(false); setLastScan(new Date()); setCountdown(900)
  }, [tf])

  useEffect(() => { scan() }, [])

  useEffect(() => {
    const id = setInterval(() => setCountdown(c => {
      if (c <= 1) { scan(); return 900 }
      return c - 1
    }), 1000)
    return () => clearInterval(id)
  }, [scan])

  const sorted = [...data].sort((a,b) => sort==='score' ? b.score-a.score : sort==='rsi' ? b.rsi-a.rsi : b.chg24h-a.chg24h)

  const filtered = sorted.filter(d => {
    if (tab === 'bull')     return d.score >= 30
    if (tab === 'bear')     return d.score <= -30
    if (tab === 'div')      return d.div !== null
    if (tab === 'pump')     return d.pd !== null
    if (tab === 'patterns') return d.patterns.length > 0
    return true
  })

  const bull   = data.filter(d => d.score >= 30).length
  const bear   = data.filter(d => d.score <= -30).length
  const divN   = data.filter(d => d.div).length
  const pumpN  = data.filter(d => d.pd).length
  const patN   = data.filter(d => d.patterns.length > 0).length

  const mins = Math.floor(countdown/60), secs = countdown%60

  const TABS: {id:Tab; label:string; count:number; color:string}[] = [
    { id:'all',      label:t('الكل','All'),           count:data.length, color:'var(--muted)' },
    { id:'bull',     label:t('صعودي ▲','Bullish ▲'),  count:bull,        color:'#00e664' },
    { id:'bear',     label:t('هبوطي ▼','Bearish ▼'),  count:bear,        color:'#ff4455' },
    { id:'div',      label:t('تباعد','Divergence'),   count:divN,        color:'var(--cyan)' },
    { id:'pump',     label:'Pump/Dump',               count:pumpN,       color:'var(--yellow)' },
    { id:'patterns', label:t('نماذج','Patterns'),     count:patN,        color:'var(--purple)' },
  ]

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', color:'var(--text)' }}>

      {/* ── Top Bar ── */}
      <div style={{ borderBottom:'1px solid var(--border)', background:'var(--surface)', padding:'0 24px' }}>
        <div style={{ maxWidth:'1400px', margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center', height:'56px', gap:'12px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <h1 style={{ fontSize:'16px', fontWeight:900, margin:0, letterSpacing:'-0.02em' }}>Market Scanner</h1>
            {lastScan && <span style={{ fontSize:'11px', color:'var(--muted)' }}>{t('آخر مسح', 'Last scan')} {lastScan.toLocaleTimeString(lang==='ar'?'ar-SA':'en-US',{hour:'2-digit',minute:'2-digit'})}</span>}
            {loading && <span style={{ fontSize:'11px', color:'var(--cyan)', animation:'pulse 1s infinite' }}>{t(`● مسح ${progress}%`, `● Scanning ${progress}%`)}</span>}
          </div>
          <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
            {/* TF */}
            <div style={{ display:'flex', background:'var(--surface-2)', borderRadius:'8px', padding:'3px', gap:'2px' }}>
              {TFS.map(t => (
                <button key={t} onClick={() => { setTf(t); scan(t) }}
                  style={{ padding:'5px 12px', borderRadius:'6px', fontSize:'11px', fontWeight:700, background:tf===t?'var(--cyan)':'transparent', color:tf===t?'#000':'var(--muted)', border:'none', cursor:'pointer', fontFamily:'inherit' }}>{t}</button>
              ))}
            </div>
            {/* Sort */}
            <select value={sort} onChange={e => setSort(e.target.value as any)}
              style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'7px', padding:'6px 10px', color:'var(--text)', fontSize:'11px', fontFamily:'inherit', fontWeight:600 }}>
              <option value="score">{t('ترتيب: Score', 'Sort: Score')}</option>
              <option value="rsi">{t('ترتيب: RSI', 'Sort: RSI')}</option>
              <option value="chg">{t('ترتيب: 24h%', 'Sort: 24h%')}</option>
            </select>
            {/* Countdown */}
            {!loading && (
              <div style={{ display:'flex', alignItems:'center', gap:'6px', padding:'6px 12px', borderRadius:'7px', background:'var(--surface-2)', border:'1px solid var(--border)', fontSize:'11px', color:'var(--muted)', fontFamily:'var(--mono)', fontWeight:700 }}>
                ⏱ {mins}:{secs.toString().padStart(2,'0')}
              </div>
            )}
            <button onClick={() => scan()} disabled={loading}
              style={{ padding:'7px 16px', background:'var(--cyan)', color:'#000', border:'none', borderRadius:'7px', fontWeight:800, fontSize:'12px', cursor:loading?'not-allowed':'pointer', opacity:loading?0.5:1, fontFamily:'inherit' }}>
              {loading ? `${progress}%` : t('↺ مسح', '↺ Scan')}
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats Bar ── */}
      {data.length > 0 && (
        <div style={{ background:'var(--surface-2)', borderBottom:'1px solid var(--border)', padding:'0 24px' }}>
          <div style={{ maxWidth:'1400px', margin:'0 auto', display:'flex', gap:'0', overflowX:'auto' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ padding:'10px 18px', border:'none', borderBottom:`2px solid ${tab===t.id?t.color:'transparent'}`, background:'transparent', color:tab===t.id?t.color:'var(--muted)', cursor:'pointer', fontFamily:'inherit', fontWeight:700, fontSize:'12px', display:'flex', alignItems:'center', gap:'6px', whiteSpace:'nowrap', transition:'color 0.15s' }}>
                {t.label}
                <span style={{ padding:'1px 7px', borderRadius:'10px', fontSize:'10px', fontWeight:800, background:tab===t.id?`${t.color}22`:'var(--surface)', color:tab===t.id?t.color:'var(--muted)' }}>{t.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Progress Bar ── */}
      {loading && (
        <div style={{ height:'2px', background:'var(--surface-2)' }}>
          <div style={{ width:`${progress}%`, height:'100%', background:'linear-gradient(90deg,var(--cyan),var(--purple))', transition:'width 0.3s' }}/>
        </div>
      )}

      {/* ── Cards Grid ── */}
      <div style={{ maxWidth:'1400px', margin:'0 auto', padding:'20px 24px' }}>
        {data.length === 0 && !loading ? (
          <div style={{ textAlign:'center', padding:'80px 0' }}>
            <div style={{ fontSize:'48px', marginBottom:'16px' }}>📡</div>
            <div style={{ fontWeight:800, fontSize:'18px', marginBottom:'8px' }}>{t('جاهز للمسح', 'Ready to scan')}</div>
            <div style={{ color:'var(--muted)', fontSize:'13px', marginBottom:'20px' }}>{t(`اضغط "مسح" لفحص ${PAIRS.length} عملة وتحليل المؤشرات`, `Press "Scan" to analyze ${PAIRS.length} coins and their indicators`)}</div>
            <button onClick={() => scan()} style={{ padding:'12px 28px', background:'var(--cyan)', color:'#000', border:'none', borderRadius:'10px', fontWeight:800, fontSize:'14px', cursor:'pointer', fontFamily:'inherit' }}>{t('▶ ابدأ المسح', '▶ Start scan')}</button>
          </div>
        ) : (
          <>
            {filtered.length === 0 && data.length > 0 && (
              <div style={{ textAlign:'center', padding:'60px', color:'var(--muted)' }}>{t('لا توجد عملات تطابق هذا الفلتر حالياً', 'No coins currently match this filter')}</div>
            )}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:'12px' }}>
              {filtered.map(d => <CoinCard key={d.symbol} d={d} tf={tf} />)}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  )
}
