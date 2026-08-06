'use client'
import { useState, useEffect, useCallback } from 'react'
import { useLang } from '../layout'

type Position = {
  id: string
  symbol: string
  side: 'LONG' | 'SHORT'
  entry: number
  tp: number
  sl: number
  leverage: number
  size: number
  openedAt: string
  status: 'OPEN' | 'WIN' | 'LOSS'
  pnl?: number
  closedAt?: string
  closePrice?: number
}

type Portfolio = {
  balance: number
  initialBalance: number
  positions: Position[]
}

const INIT: Portfolio = { balance: 10000, initialBalance: 10000, positions: [] }
const PORTFOLIO_KEY = 'trading_portfolio'

const PAIRS = [
  'BTCUSDT','ETHUSDT','BNBUSDT','SOLUSDT','XRPUSDT','DOGEUSDT','AVAXUSDT','ADAUSDT',
  'LINKUSDT','ATOMUSDT','XLMUSDT','INJUSDT','SUIUSDT','ARBUSDT','OPUSDT','NEARUSDT',
  'MATICUSDT','LTCUSDT','DOTUSDT','UNIUSDT','TIAUSDT','WIFUSDT','FLOKIUSDT','PEPEUSDT',
  'FETUSDT','RENDERUSDT','GRTUSDT','AXSUSDT','AAVEUSDT','LDOUSDT',
]

const fmt = (p: number) => p>=10000?p.toLocaleString('en',{maximumFractionDigits:0}):p>=1?p.toFixed(4):p>=0.01?p.toFixed(5):p.toFixed(8)
const fmtUSD = (v: number) => `$${Math.abs(v).toLocaleString('en',{minimumFractionDigits:2,maximumFractionDigits:2})}`

function load(): Portfolio {
  try { return JSON.parse(localStorage.getItem(PORTFOLIO_KEY)||'null') || INIT } catch { return INIT }
}
function save(p: Portfolio) { localStorage.setItem(PORTFOLIO_KEY,JSON.stringify(p)) }

export default function PaperTradingPage() {
  const { t, lang } = useLang()
  const [portfolio, setPortfolio] = useState<Portfolio>(INIT)
  const [prices, setPrices] = useState<Record<string,number>>({})
  const [tab, setTab] = useState<'open'|'history'>('open')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ symbol:'BTCUSDT', side:'LONG' as 'LONG'|'SHORT', leverage:5, sizeUSDT:100 })
  const [entryPrice, setEntryPrice] = useState<number|null>(null)
  const [loadingEntry, setLoadingEntry] = useState(false)

  useEffect(() => { setPortfolio(load()) }, [])

  // Fetch live prices
  useEffect(() => {
    const openSymbols = portfolio.positions.filter(p=>p.status==='OPEN').map(p=>p.symbol)
    if (!openSymbols.length) return
    const fetch5 = async () => {
      try {
        const res = await Promise.all(openSymbols.map(s=>fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${s}`).then(r=>r.json())))
        const map: Record<string,number> = {}
        res.forEach(r=>{ if(r.symbol)map[r.symbol]=parseFloat(r.price) })
        setPrices(map)
      } catch {}
    }
    fetch5()
    const t = setInterval(fetch5, 15000)
    return () => clearInterval(t)
  }, [portfolio.positions])

  // Auto close when TP/SL hit
  useEffect(() => {
    if (!Object.keys(prices).length) return
    setPortfolio(prev => {
      let updated = false
      const newPositions = prev.positions.map(pos => {
        if (pos.status !== 'OPEN') return pos
        const cur = prices[pos.symbol]
        if (!cur) return pos
        const hit = pos.side === 'LONG'
          ? (cur >= pos.tp ? 'WIN' : cur <= pos.sl ? 'LOSS' : null)
          : (cur <= pos.tp ? 'WIN' : cur >= pos.sl ? 'LOSS' : null)
        if (!hit) return pos
        const pnl = calcPnl(pos, cur)
        updated = true
        return { ...pos, status: hit as 'WIN'|'LOSS', pnl, closePrice: cur, closedAt: new Date().toISOString() }
      })
      if (!updated) return prev
      const totalPnl = newPositions.filter(p=>p.status!=='OPEN').reduce((acc,p)=>acc+(p.pnl||0),0)
      const next = { ...prev, positions: newPositions, balance: prev.initialBalance + totalPnl }
      save(next)
      return next
    })
  }, [prices])

  function calcPnl(pos: Position, cur: number): number {
    const pctChange = pos.side === 'LONG'
      ? (cur - pos.entry) / pos.entry
      : (pos.entry - cur) / pos.entry
    return pos.size * pctChange * pos.leverage
  }

  function calcPnlPct(pos: Position, cur: number): number {
    return pos.side === 'LONG'
      ? (cur - pos.entry) / pos.entry * 100 * pos.leverage
      : (pos.entry - cur) / pos.entry * 100 * pos.leverage
  }

  const fetchEntry = useCallback(async (sym: string) => {
    setLoadingEntry(true)
    try {
      const r = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${sym}`)
      const d = await r.json()
      setEntryPrice(parseFloat(d.price))
    } catch {}
    setLoadingEntry(false)
  }, [])

  useEffect(() => { if (showForm) fetchEntry(form.symbol) }, [showForm, form.symbol])

  const openTrade = () => {
    if (!entryPrice || form.sizeUSDT > portfolio.balance) return
    const e = entryPrice
    const tp = form.side === 'LONG' ? e * 1.05 : e * 0.95
    const sl = form.side === 'LONG' ? e * 0.97 : e * 1.03
    const pos: Position = {
      id: Date.now().toString(),
      symbol: form.symbol, side: form.side, entry: e, tp, sl,
      leverage: form.leverage, size: form.sizeUSDT,
      openedAt: new Date().toISOString(), status: 'OPEN',
    }
    const next = { ...portfolio, balance: portfolio.balance - form.sizeUSDT, positions: [pos, ...portfolio.positions] }
    setPortfolio(next); save(next); setShowForm(false)
  }

  const closeManual = (id: string) => {
    const pos = portfolio.positions.find(p=>p.id===id)
    if (!pos) return
    const cur = prices[pos.symbol] || pos.entry
    const pnl = calcPnl(pos, cur)
    const status: 'WIN' | 'LOSS' = pnl >= 0 ? 'WIN' : 'LOSS'
    const newPositions = portfolio.positions.map(p=>p.id===id?{...p,status,pnl,closePrice:cur,closedAt:new Date().toISOString()}:p)
    const totalPnl = newPositions.filter(p=>p.status!=='OPEN').reduce((acc,p)=>acc+(p.pnl||0),0)
    const next = { ...portfolio, positions: newPositions, balance: portfolio.initialBalance + totalPnl }
    setPortfolio(next); save(next)
  }

  const resetPortfolio = () => {
    if (!confirm(t('هل تريد إعادة تعيين المحفظة؟', 'Reset the portfolio?'))) return
    setPortfolio(INIT); save(INIT)
  }

  const openPos = portfolio.positions.filter(p=>p.status==='OPEN')
  const history = portfolio.positions.filter(p=>p.status!=='OPEN')
  const wins = history.filter(p=>p.status==='WIN').length
  const winRate = history.length ? Math.round(wins/history.length*100) : 0
  const totalPnl = history.reduce((a,p)=>a+(p.pnl||0),0)
  const totalReturn = ((portfolio.balance-portfolio.initialBalance)/portfolio.initialBalance*100)

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)',color:'var(--text)',padding:'24px'}}>
      <div style={{maxWidth:'1200px',margin:'0 auto'}}>

        {/* Header */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'16px',flexWrap:'wrap',gap:'12px'}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'4px',flexWrap:'wrap'}}>
              <h1 style={{fontSize:'24px',fontWeight:900,letterSpacing:'-0.02em',margin:0}}>{t('محفظة التداول التجريبي', 'Paper Trading Portfolio')}</h1>
              <span className="badge" style={{background:'rgba(251,191,36,0.1)',borderColor:'rgba(251,191,36,0.3)',color:'var(--yellow)'}}>{t('تجريبي، بدون مال حقيقي', 'Simulated, no real money')}</span>
            </div>
            <p style={{color:'var(--muted)',fontSize:'13px'}}>
              <span style={{color:'var(--green)',fontWeight:700}}>{t('● أسعار حية', '● Live prices')}</span>
              {'  '}{t('اختبر استراتيجيتك برصيد افتراضي وأسعار Binance اللحظية', 'Test your strategy with a virtual balance and live Binance prices')}
            </p>
          </div>
          <div style={{display:'flex',gap:'8px'}}>
            <button onClick={()=>setShowForm(true)} style={{background:'var(--cyan)',color:'#000',border:'none',padding:'9px 20px',borderRadius:'8px',fontWeight:700,fontSize:'13px',cursor:'pointer',fontFamily:'inherit'}}>{t('+ فتح صفقة', '+ Open trade')}</button>
          </div>
        </div>

        <div style={{background:'rgba(251,191,36,0.06)',border:'1px solid rgba(251,191,36,0.2)',borderRadius:'10px',padding:'10px 16px',marginBottom:'20px',fontSize:'12px',color:'var(--muted)',lineHeight:1.6}}>
          ⚠️ {t('هذه محفظة افتراضية بالكامل لأغراض التدريب فقط. الرصيد وهمي والصفقات لا تُنفَّذ فعلياً في أي منصة حقيقية، ولا علاقة لها بمالك الحقيقي أو اشتراكك.', 'This is a fully virtual portfolio for practice only. The balance is simulated and trades are never executed on any real exchange, and it has no connection to your real money or subscription.')}
        </div>

        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:'12px',marginBottom:'24px'}}>
          {[
            { label:t('الرصيد', 'Balance'), value:fmtUSD(portfolio.balance), color: portfolio.balance>=portfolio.initialBalance?'var(--green)':'var(--red)' },
            { label:t('الربح / الخسارة', 'Profit / Loss'), value:(totalPnl>=0?'+':'')+fmtUSD(totalPnl), color:totalPnl>=0?'var(--green)':'var(--red)' },
            { label:t('العائد الكلي', 'Total Return'), value:(totalReturn>=0?'+':'')+totalReturn.toFixed(2)+'%', color:totalReturn>=0?'var(--green)':'var(--red)' },
            { label:t('معدل الفوز', 'Win Rate'), value:winRate+'%', color:winRate>=60?'var(--green)':winRate>=40?'var(--yellow)':'var(--red)' },
            { label:t('صفقات مفتوحة', 'Open Trades'), value:openPos.length.toString(), color:'var(--text)' },
            { label:t('إجمالي الصفقات', 'Total Trades'), value:history.length.toString(), color:'var(--muted)' },
          ].map((s,i)=>(
            <div key={i} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'10px',padding:'16px'}}>
              <div style={{fontSize:'11px',color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'6px'}}>{s.label}</div>
              <div style={{fontSize:'20px',fontWeight:900,color:s.color,fontVariantNumeric:'tabular-nums'}}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{display:'flex',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'9px',padding:'3px',gap:'2px',width:'fit-content',marginBottom:'16px'}}>
          {([['open',t('الصفقات المفتوحة','Open Trades'),openPos.length],['history',t('السجل','History'),history.length]] as const).map(([id,label,cnt])=>(
            <button key={id} onClick={()=>setTab(id)} style={{padding:'7px 18px',borderRadius:'6px',fontSize:'13px',fontWeight:600,cursor:'pointer',background:tab===id?'var(--surface-2)':'transparent',color:tab===id?'var(--text)':'var(--muted)',border:tab===id?'1px solid var(--border)':'1px solid transparent',fontFamily:'inherit',display:'flex',alignItems:'center',gap:'6px'}}>
              {label}
              <span style={{background:tab===id?'var(--cyan)':'var(--dim)',color:tab===id?'#000':'var(--muted)',borderRadius:'10px',padding:'0 7px',fontSize:'11px',fontWeight:800}}>{cnt}</span>
            </button>
          ))}
        </div>

        {/* Open Positions */}
        {tab==='open' && (
          <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'12px',overflow:openPos.length===0?'hidden':'auto'}}>
            {openPos.length===0
              ?<div style={{padding:'48px',textAlign:'center',color:'var(--muted)'}}>
                  <div style={{fontSize:'32px',marginBottom:'12px'}}>📈</div>
                  {t('لا توجد صفقات مفتوحة، اضغط "+ فتح صفقة"', 'No open trades, press "+ Open trade"')}
                </div>
              :<table style={{width:'100%',borderCollapse:'collapse',minWidth:'720px'}}>
                <thead>
                  <tr>
                    {[t('الزوج','Pair'),t('جانب','Side'),t('دخول','Entry'),'TP','SL',t('الحجم','Size'),t('السعر الحالي','Current Price'),'P&L',t('إجراء','Action')].map(h=>(
                      <th key={h} style={{padding:'10px 14px',textAlign:lang==='en'?'left':'right',fontSize:'11px',color:'var(--muted)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',background:'var(--surface)',borderBottom:'1px solid var(--border)'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {openPos.map((pos,i)=>{
                    const cur = prices[pos.symbol]
                    const pnl = cur ? calcPnl(pos,cur) : 0
                    const pnlPct = cur ? calcPnlPct(pos,cur) : 0
                    const pnlColor = pnl>=0?'var(--green)':'var(--red)'
                    return <tr key={pos.id} style={{borderBottom:'1px solid var(--border)',background:i%2===0?'transparent':'rgba(255,255,255,0.015)'}}>
                      <td style={{padding:'12px 14px',fontWeight:800}}>{pos.symbol.replace('USDT','/USDT')}</td>
                      <td style={{padding:'12px 14px'}}>
                        <span style={{padding:'2px 8px',borderRadius:'5px',fontSize:'11px',fontWeight:800,background:pos.side==='LONG'?'rgba(0,230,100,0.1)':'rgba(255,68,85,0.1)',color:pos.side==='LONG'?'var(--green)':'var(--red)'}}>{pos.side}</span>
                        {pos.leverage>1&&<span style={{marginRight:'4px',fontSize:'10px',color:'var(--muted)'}}>×{pos.leverage}</span>}
                      </td>
                      <td style={{padding:'12px 14px',fontFamily:'var(--mono)',fontSize:'12px'}}>${fmt(pos.entry)}</td>
                      <td style={{padding:'12px 14px',fontFamily:'var(--mono)',fontSize:'12px',color:'var(--green)'}}>${fmt(pos.tp)}</td>
                      <td style={{padding:'12px 14px',fontFamily:'var(--mono)',fontSize:'12px',color:'var(--red)'}}>${fmt(pos.sl)}</td>
                      <td style={{padding:'12px 14px',fontFamily:'var(--mono)',fontSize:'12px'}}>{fmtUSD(pos.size)}</td>
                      <td style={{padding:'12px 14px',fontFamily:'var(--mono)',fontSize:'12px',fontWeight:600}}>
                        {cur?<><span className="live-dot" style={{marginLeft:'4px'}}/>${fmt(cur)}</>:'—'}
                      </td>
                      <td style={{padding:'12px 14px'}}>
                        <div style={{color:pnlColor,fontFamily:'var(--mono)',fontSize:'12px',fontWeight:800}}>{pnl>=0?'+':''}{fmtUSD(pnl)}</div>
                        <div style={{color:pnlColor,fontSize:'10px'}}>{pnlPct>=0?'+':''}{pnlPct.toFixed(1)}%</div>
                      </td>
                      <td style={{padding:'12px 14px'}}>
                        <button onClick={()=>closeManual(pos.id)} style={{background:'rgba(255,68,85,0.1)',border:'1px solid rgba(255,68,85,0.25)',color:'var(--red)',padding:'5px 10px',borderRadius:'6px',fontSize:'11px',cursor:'pointer',fontFamily:'inherit',fontWeight:700}}>{t('إغلاق', 'Close')}</button>
                      </td>
                    </tr>
                  })}
                </tbody>
              </table>
            }
          </div>
        )}

        {/* History */}
        {tab==='history' && (
          <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'12px',overflow:history.length===0?'hidden':'auto'}}>
            {history.length===0
              ?<div style={{padding:'48px',textAlign:'center',color:'var(--muted)'}}>{t('لا يوجد سجل بعد', 'No history yet')}</div>
              :<table style={{width:'100%',borderCollapse:'collapse',minWidth:'680px'}}>
                <thead>
                  <tr>
                    {[t('الزوج','Pair'),t('جانب','Side'),t('دخول','Entry'),t('إغلاق','Close'),t('الحجم','Size'),'P&L',t('النتيجة','Result'),t('التاريخ','Date')].map(h=>(
                      <th key={h} style={{padding:'10px 14px',textAlign:lang==='en'?'left':'right',fontSize:'11px',color:'var(--muted)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',background:'var(--surface)',borderBottom:'1px solid var(--border)'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map((pos,i)=>{
                    const pnl=pos.pnl||0;const pnlColor=pnl>=0?'var(--green)':'var(--red)'
                    const pnlPct=pos.closePrice?calcPnlPct(pos,pos.closePrice):0
                    return <tr key={pos.id} style={{borderBottom:'1px solid var(--border)',background:i%2===0?'transparent':'rgba(255,255,255,0.015)'}}>
                      <td style={{padding:'11px 14px',fontWeight:800}}>{pos.symbol.replace('USDT','/USDT')}</td>
                      <td style={{padding:'11px 14px'}}>
                        <span style={{padding:'2px 8px',borderRadius:'5px',fontSize:'11px',fontWeight:800,background:pos.side==='LONG'?'rgba(0,230,100,0.1)':'rgba(255,68,85,0.1)',color:pos.side==='LONG'?'var(--green)':'var(--red)'}}>{pos.side}</span>
                      </td>
                      <td style={{padding:'11px 14px',fontFamily:'var(--mono)',fontSize:'12px'}}>${fmt(pos.entry)}</td>
                      <td style={{padding:'11px 14px',fontFamily:'var(--mono)',fontSize:'12px'}}>${fmt(pos.closePrice||pos.entry)}</td>
                      <td style={{padding:'11px 14px',fontFamily:'var(--mono)',fontSize:'12px'}}>{fmtUSD(pos.size)}</td>
                      <td style={{padding:'11px 14px'}}>
                        <div style={{color:pnlColor,fontFamily:'var(--mono)',fontSize:'12px',fontWeight:800}}>{pnl>=0?'+':''}{fmtUSD(pnl)}</div>
                        <div style={{color:pnlColor,fontSize:'10px'}}>{pnlPct>=0?'+':''}{pnlPct.toFixed(1)}%</div>
                      </td>
                      <td style={{padding:'11px 14px'}}>
                        <span style={{padding:'3px 9px',borderRadius:'5px',fontSize:'11px',fontWeight:800,background:pos.status==='WIN'?'rgba(0,230,100,0.1)':'rgba(255,68,85,0.1)',color:pos.status==='WIN'?'var(--green)':'var(--red)'}}>{pos.status==='WIN'?t('✓ ربح','✓ Win'):t('✗ خسارة','✗ Loss')}</span>
                      </td>
                      <td style={{padding:'11px 14px',fontSize:'12px',color:'var(--muted)'}}>{pos.closedAt?new Date(pos.closedAt).toLocaleDateString(lang==='ar'?'ar-SA':'en-US'):'—'}</td>
                    </tr>
                  })}
                </tbody>
              </table>
            }
          </div>
        )}

        {/* Open Trade Modal */}
        {showForm && (
          <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:9998,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px'}} onClick={e=>{if(e.target===e.currentTarget)setShowForm(false)}}>
            <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'16px',padding:'28px',width:'100%',maxWidth:'440px',boxShadow:'0 24px 64px rgba(0,0,0,0.4)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
                <h2 style={{fontSize:'18px',fontWeight:900}}>{t('فتح صفقة', 'Open Trade')}</h2>
                <button onClick={()=>setShowForm(false)} style={{background:'transparent',border:'none',color:'var(--muted)',fontSize:'20px',cursor:'pointer'}}>✕</button>
              </div>

              <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
                <div>
                  <label style={{fontSize:'12px',fontWeight:600,color:'var(--muted)',display:'block',marginBottom:'6px'}}>{t('الزوج', 'Pair')}</label>
                  <select value={form.symbol} onChange={e=>setForm(f=>({...f,symbol:e.target.value}))}
                    style={{width:'100%',background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'10px 12px',color:'var(--text)',fontSize:'14px',fontFamily:'inherit'}}>
                    {PAIRS.map(p=><option key={p} value={p}>{p.replace('USDT','/USDT')}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{fontSize:'12px',fontWeight:600,color:'var(--muted)',display:'block',marginBottom:'6px'}}>{t('الجانب', 'Side')}</label>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                    {(['LONG','SHORT'] as const).map(s=>(
                      <button key={s} onClick={()=>setForm(f=>({...f,side:s}))} style={{padding:'10px',borderRadius:'8px',border:`1px solid ${form.side===s?(s==='LONG'?'rgba(0,230,100,0.5)':'rgba(255,68,85,0.5)'):'var(--border)'}`,background:form.side===s?(s==='LONG'?'rgba(0,230,100,0.1)':'rgba(255,68,85,0.1)'):'transparent',color:form.side===s?(s==='LONG'?'var(--green)':'var(--red)'):'var(--muted)',fontWeight:800,cursor:'pointer',fontFamily:'inherit'}}>
                        {s==='LONG'?'▲ LONG':'▼ SHORT'}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                  <div>
                    <label style={{fontSize:'12px',fontWeight:600,color:'var(--muted)',display:'block',marginBottom:'6px'}}>{t('الرافعة', 'Leverage')}</label>
                    <select value={form.leverage} onChange={e=>setForm(f=>({...f,leverage:parseInt(e.target.value)}))}
                      style={{width:'100%',background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'10px 12px',color:'var(--text)',fontSize:'14px',fontFamily:'inherit'}}>
                      {[1,2,3,5,10,15,20].map(l=><option key={l} value={l}>×{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{fontSize:'12px',fontWeight:600,color:'var(--muted)',display:'block',marginBottom:'6px'}}>{t('الحجم (USDT)', 'Size (USDT)')}</label>
                    <input type="number" value={form.sizeUSDT} min={10} max={portfolio.balance}
                      onChange={e=>setForm(f=>({...f,sizeUSDT:parseFloat(e.target.value)||100}))}
                      style={{width:'100%',background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'10px 12px',color:'var(--text)',fontSize:'14px',fontFamily:'var(--mono)',boxSizing:'border-box'}}/>
                  </div>
                </div>

                <div style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'10px',padding:'14px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:'13px',marginBottom:'6px'}}>
                    <span style={{color:'var(--muted)'}}>{t('سعر الدخول', 'Entry Price')}</span>
                    <span style={{fontFamily:'var(--mono)',fontWeight:700}}>{loadingEntry?'...':(entryPrice?'$'+fmt(entryPrice):'—')}</span>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:'13px',marginBottom:'6px'}}>
                    <span style={{color:'var(--green)'}}>{t('الهدف (TP) +5%', 'Target (TP) +5%')}</span>
                    <span style={{fontFamily:'var(--mono)',color:'var(--green)'}}>{entryPrice?'$'+fmt(form.side==='LONG'?entryPrice*1.05:entryPrice*0.95):'—'}</span>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:'13px',marginBottom:'8px'}}>
                    <span style={{color:'var(--red)'}}>{t('الوقف (SL) -3%', 'Stop (SL) -3%')}</span>
                    <span style={{fontFamily:'var(--mono)',color:'var(--red)'}}>{entryPrice?'$'+fmt(form.side==='LONG'?entryPrice*0.97:entryPrice*1.03):'—'}</span>
                  </div>
                  <div style={{borderTop:'1px solid var(--border)',paddingTop:'8px',display:'flex',justifyContent:'space-between',fontSize:'13px'}}>
                    <span style={{color:'var(--muted)'}}>{t('الرصيد بعد', 'Balance After')}</span>
                    <span style={{fontFamily:'var(--mono)',fontWeight:700}}>{fmtUSD(portfolio.balance-form.sizeUSDT)}</span>
                  </div>
                </div>

                <button onClick={openTrade} disabled={!entryPrice||form.sizeUSDT>portfolio.balance}
                  style={{background:'var(--cyan)',color:'#000',border:'none',padding:'13px',borderRadius:'9px',fontWeight:800,fontSize:'14px',cursor:'pointer',fontFamily:'inherit',opacity:(!entryPrice||form.sizeUSDT>portfolio.balance)?0.5:1}}>
                  {t(`فتح ${form.side==='LONG'?'▲ LONG':'▼ SHORT'} × ${form.sizeUSDT} USDT`, `Open ${form.side==='LONG'?'▲ LONG':'▼ SHORT'} × ${form.sizeUSDT} USDT`)}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
