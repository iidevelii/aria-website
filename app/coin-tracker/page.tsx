'use client'
import { useState, useEffect, useCallback } from 'react'
import { useLang } from '../ClientShell'

type AlertType = 'price_above' | 'price_below' | 'change_above' | 'change_below'
type WatchItem = {
  id: string
  symbol: string
  alertType: AlertType
  alertValue: number
  createdAt: string
  triggered?: boolean
  triggeredAt?: string
  currentPrice?: number
  change24h?: number
}

const PAIRS = [
  'BTCUSDT','ETHUSDT','BNBUSDT','SOLUSDT','XRPUSDT','DOGEUSDT','AVAXUSDT','ADAUSDT',
  'LINKUSDT','ATOMUSDT','XLMUSDT','INJUSDT','SUIUSDT','ARBUSDT','OPUSDT','NEARUSDT',
  'MATICUSDT','LTCUSDT','DOTUSDT','UNIUSDT','TIAUSDT','WIFUSDT','FLOKIUSDT','PEPEUSDT',
  'FETUSDT','RENDERUSDT','GRTUSDT','AXSUSDT','AAVEUSDT','LDOUSDT','SHIBUSDT','TRXUSDT',
  'HBARUSDT','VETUSDT','STXUSDT','CRVUSDT','MKRUSDT','FTMUSDT','RUNEUSDT','ICPUSDT',
]

const ALERT_LABELS_AR: Record<AlertType, string> = {
  price_above: 'السعر يرتفع فوق',
  price_below: 'السعر ينخفض تحت',
  change_above: 'التغير 24h يرتفع فوق %',
  change_below: 'التغير 24h ينخفض تحت %',
}
const ALERT_LABELS_EN: Record<AlertType, string> = {
  price_above: 'Price rises above',
  price_below: 'Price drops below',
  change_above: '24h change rises above %',
  change_below: '24h change drops below %',
}

const fmt = (p: number) => p>=10000?p.toLocaleString('en',{maximumFractionDigits:0}):p>=1?p.toFixed(4):p>=0.01?p.toFixed(5):p.toFixed(8)

function load(): WatchItem[] { try { return JSON.parse(localStorage.getItem('coin_tracker')||'[]') } catch { return [] } }
function save(items: WatchItem[]) { localStorage.setItem('coin_tracker', JSON.stringify(items)) }

export default function CoinTrackerPage() {
  const { t, lang } = useLang()
  const alertLabel = (type: AlertType) => t(ALERT_LABELS_AR[type], ALERT_LABELS_EN[type])
  const [items, setItems] = useState<WatchItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ symbol:'BTCUSDT', alertType:'price_above' as AlertType, alertValue:'' })
  const [tab, setTab] = useState<'active'|'triggered'>('active')
  const [lastRefresh, setLastRefresh] = useState<Date|null>(null)

  useEffect(() => { setItems(load()) }, [])

  // Live price checker — every 30 seconds
  const checkPrices = useCallback(async () => {
    const current = load()
    if (!current.length) return
    const active = current.filter(i=>!i.triggered)
    if (!active.length) return

    try {
      const unique = [...new Set(active.map(i=>i.symbol))]
      const prices = await Promise.all(unique.map(async sym => {
        const r = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${sym}`)
        const d = await r.json()
        return { symbol: sym, price: parseFloat(d.lastPrice), change: parseFloat(d.priceChangePercent) }
      }))
      const priceMap: Record<string,{price:number;change:number}> = {}
      prices.forEach(p=>{ priceMap[p.symbol]={price:p.price,change:p.change} })

      const updated = current.map(item => {
        const p = priceMap[item.symbol]
        if (!p) return item
        let triggered = item.triggered || false
        const newItem = { ...item, currentPrice: p.price, change24h: p.change }
        if (!triggered) {
          if (item.alertType==='price_above' && p.price>=item.alertValue) triggered=true
          if (item.alertType==='price_below' && p.price<=item.alertValue) triggered=true
          if (item.alertType==='change_above' && p.change>=item.alertValue) triggered=true
          if (item.alertType==='change_below' && p.change<=item.alertValue) triggered=true
          if (triggered) { newItem.triggered=true; newItem.triggeredAt=new Date().toISOString() }
        }
        return newItem
      })
      setItems(updated); save(updated); setLastRefresh(new Date())
    } catch {}
  }, [])

  useEffect(() => {
    checkPrices()
    const t = setInterval(checkPrices, 30000)
    return () => clearInterval(t)
  }, [checkPrices])

  const addAlert = () => {
    if (!form.alertValue) return
    const newItem: WatchItem = {
      id: Date.now().toString(), symbol: form.symbol,
      alertType: form.alertType, alertValue: parseFloat(form.alertValue),
      createdAt: new Date().toISOString(),
    }
    const next = [newItem, ...items]
    setItems(next); save(next); setShowForm(false)
    setForm(f=>({...f,alertValue:''}))
    setTimeout(checkPrices, 500)
  }

  const remove = (id: string) => {
    const next = items.filter(i=>i.id!==id); setItems(next); save(next)
  }
  const resetTriggered = (id: string) => {
    const next = items.map(i=>i.id===id?{...i,triggered:false,triggeredAt:undefined}:i)
    setItems(next); save(next)
  }

  const active = items.filter(i=>!i.triggered)
  const triggered = items.filter(i=>i.triggered)

  const isTriggeredAlert = (item: WatchItem) => {
    const p = item.currentPrice, c = item.change24h
    if (p===undefined) return false
    if (item.alertType==='price_above') return p>=item.alertValue
    if (item.alertType==='price_below') return p<=item.alertValue
    if (c===undefined) return false
    if (item.alertType==='change_above') return c>=item.alertValue
    if (item.alertType==='change_below') return c<=item.alertValue
    return false
  }

  const AlertCard = ({ item }: { item: WatchItem }) => {
    const p = item.currentPrice
    const c = item.change24h
    const trg = item.triggered
    const isPct = item.alertType.includes('change')
    const diffMsg = p !== undefined
      ? isPct
        ? `${t('الحالي', 'Current')}: ${c!==undefined?(c>=0?'+':'')+c.toFixed(2)+'%':'...'}`
        : `${t('الحالي', 'Current')}: $${fmt(p)}`
      : t('جاري التحقق...', 'Checking...')

    return (
      <div style={{background:'var(--surface)',border:`1px solid ${trg?'rgba(245,200,66,0.4)':'var(--border)'}`,borderRadius:'12px',padding:'16px',transition:'border-color 0.2s'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'12px'}}>
          <div>
            <div style={{fontWeight:800,fontSize:'15px',marginBottom:'4px'}}>{item.symbol.replace('USDT','/USDT')}</div>
            <div style={{fontSize:'12px',color:'var(--muted)'}}>{alertLabel(item.alertType)} <span style={{color:'var(--text)',fontFamily:'var(--mono)',fontWeight:700}}>{isPct?item.alertValue+'%':'$'+fmt(item.alertValue)}</span></div>
          </div>
          <div style={{display:'flex',gap:'6px',alignItems:'center'}}>
            {trg&&<span style={{padding:'3px 8px',borderRadius:'5px',fontSize:'11px',fontWeight:700,background:'rgba(245,200,66,0.12)',color:'var(--yellow)',border:'1px solid rgba(245,200,66,0.3)'}}>🔔 {t('تنبّه!', 'Triggered!')}</span>}
            <button onClick={()=>remove(item.id)} style={{background:'transparent',border:'1px solid var(--border)',color:'var(--muted)',padding:'4px 8px',borderRadius:'6px',fontSize:'11px',cursor:'pointer',fontFamily:'inherit'}}>✕</button>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
          <div style={{background:'var(--surface-2)',borderRadius:'8px',padding:'10px'}}>
            <div style={{fontSize:'10px',color:'var(--muted)',marginBottom:'3px'}}>{t('السعر الحالي', 'Current price')}</div>
            <div style={{fontFamily:'var(--mono)',fontWeight:700,fontSize:'13px'}}>{p!==undefined?'$'+fmt(p):'...'}</div>
          </div>
          <div style={{background:'var(--surface-2)',borderRadius:'8px',padding:'10px'}}>
            <div style={{fontSize:'10px',color:'var(--muted)',marginBottom:'3px'}}>{t('التغير 24h', '24h change')}</div>
            <div style={{fontFamily:'var(--mono)',fontWeight:700,fontSize:'13px',color:c!==undefined?(c>=0?'var(--green)':'var(--red)'):'var(--muted)'}}>{c!==undefined?(c>=0?'+':'')+c.toFixed(2)+'%':'...'}</div>
          </div>
        </div>

        {trg&&(
          <div style={{marginTop:'10px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:'11px',color:'var(--muted)'}}>{item.triggeredAt?t('تنبّه: ','Triggered: ')+new Date(item.triggeredAt).toLocaleString(lang==='ar'?'ar-SA':'en-US'):''}</span>
            <button onClick={()=>resetTriggered(item.id)} style={{background:'transparent',border:'1px solid var(--border)',color:'var(--cyan)',padding:'4px 10px',borderRadius:'6px',fontSize:'11px',cursor:'pointer',fontFamily:'inherit',fontWeight:700}}>{t('إعادة تعيين', 'Reset')}</button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)',color:'var(--text)',padding:'24px'}}>
      <div style={{maxWidth:'1000px',margin:'0 auto'}}>

        {/* Header */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'24px',flexWrap:'wrap',gap:'12px'}}>
          <div>
            <h1 style={{fontSize:'24px',fontWeight:900,letterSpacing:'-0.02em',marginBottom:'4px'}}>Coin Tracker</h1>
            <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
              <p style={{color:'var(--muted)',fontSize:'13px'}}>{t('تنبيهات سعرية لحظية', 'Real-time price alerts')}</p>
              {lastRefresh&&<span style={{fontSize:'11px',color:'var(--dim)',display:'flex',alignItems:'center',gap:'4px'}}><span className="live-dot"/>{t('آخر تحديث', 'Last updated')}: {lastRefresh.toLocaleTimeString(lang==='ar'?'ar-SA':'en-US')}</span>}
            </div>
          </div>
          <button onClick={()=>setShowForm(true)} style={{background:'var(--cyan)',color:'#000',border:'none',padding:'9px 20px',borderRadius:'8px',fontWeight:700,fontSize:'13px',cursor:'pointer',fontFamily:'inherit'}}>+ {t('إضافة تنبيه', 'Add alert')}</button>
        </div>

        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'24px'}}>
          {[
            { label:t('تنبيهات نشطة', 'Active alerts'), value:active.length, color:'var(--cyan)' },
            { label:t('تنبيهات مُشغَّلة', 'Triggered alerts'), value:triggered.length, color:'var(--yellow)' },
            { label:t('الإجمالي', 'Total'), value:items.length, color:'var(--text)' },
          ].map((s,i)=>(
            <div key={i} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'10px',padding:'16px'}}>
              <div style={{fontSize:'11px',color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'6px'}}>{s.label}</div>
              <div style={{fontSize:'28px',fontWeight:900,color:s.color}}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{display:'flex',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'9px',padding:'3px',gap:'2px',width:'fit-content',marginBottom:'16px'}}>
          {([['active',t('النشطة','Active'),active.length],['triggered',t('المُشغَّلة','Triggered'),triggered.length]] as const).map(([id,label,cnt])=>(
            <button key={id} onClick={()=>setTab(id)} style={{padding:'7px 16px',borderRadius:'6px',fontSize:'13px',fontWeight:600,cursor:'pointer',background:tab===id?'var(--surface-2)':'transparent',color:tab===id?'var(--text)':'var(--muted)',border:tab===id?'1px solid var(--border)':'1px solid transparent',fontFamily:'inherit',display:'flex',alignItems:'center',gap:'6px'}}>
              {label}
              <span style={{background:tab===id?'var(--cyan)':'var(--dim)',color:tab===id?'#000':'var(--muted)',borderRadius:'10px',padding:'0 7px',fontSize:'11px',fontWeight:800}}>{cnt}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {(tab==='active'?active:triggered).length===0
          ?<div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'12px',padding:'48px',textAlign:'center',color:'var(--muted)'}}>
            <div style={{fontSize:'32px',marginBottom:'12px'}}>{tab==='active'?'🔔':'✅'}</div>
            {tab==='active'?t('لا توجد تنبيهات نشطة، اضغط "+ إضافة تنبيه"','No active alerts, click "+ Add alert"'):t('لم يُشغَّل أي تنبيه بعد','No alerts have triggered yet')}
          </div>
          :<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'12px'}}>
            {(tab==='active'?active:triggered).map(item=><AlertCard key={item.id} item={item}/>)}
          </div>
        }

        {/* Add Alert Modal */}
        {showForm && (
          <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:9998,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px'}} onClick={e=>{if(e.target===e.currentTarget)setShowForm(false)}}>
            <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'16px',padding:'28px',width:'100%',maxWidth:'400px',boxShadow:'0 24px 64px rgba(0,0,0,0.4)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
                <h2 style={{fontSize:'18px',fontWeight:900}}>{t('إضافة تنبيه', 'Add alert')}</h2>
                <button onClick={()=>setShowForm(false)} style={{background:'transparent',border:'none',color:'var(--muted)',fontSize:'20px',cursor:'pointer'}}>✕</button>
              </div>

              <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
                <div>
                  <label style={{fontSize:'12px',fontWeight:600,color:'var(--muted)',display:'block',marginBottom:'6px'}}>{t('العملة', 'Coin')}</label>
                  <select value={form.symbol} onChange={e=>setForm(f=>({...f,symbol:e.target.value}))}
                    style={{width:'100%',background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'10px 12px',color:'var(--text)',fontSize:'14px',fontFamily:'inherit'}}>
                    {PAIRS.map(p=><option key={p} value={p}>{p.replace('USDT','/USDT')}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{fontSize:'12px',fontWeight:600,color:'var(--muted)',display:'block',marginBottom:'6px'}}>{t('نوع التنبيه', 'Alert type')}</label>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px'}}>
                    {(Object.keys(ALERT_LABELS_AR) as AlertType[]).map(v=>(
                      <button key={v} onClick={()=>setForm(f=>({...f,alertType:v}))} style={{padding:'8px',borderRadius:'7px',border:`1px solid ${form.alertType===v?'var(--cyan)':'var(--border)'}`,background:form.alertType===v?'rgba(0,196,239,0.08)':'transparent',color:form.alertType===v?'var(--cyan)':'var(--muted)',fontSize:'11px',cursor:'pointer',fontFamily:'inherit',fontWeight:600,textAlign:'center'}}>
                        {alertLabel(v)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{fontSize:'12px',fontWeight:600,color:'var(--muted)',display:'block',marginBottom:'6px'}}>
                    {t('القيمة', 'Value')} {form.alertType.includes('change')?'(%)':'(USD)'}
                  </label>
                  <input type="number" value={form.alertValue} placeholder={form.alertType.includes('change')?'5':'50000'}
                    onChange={e=>setForm(f=>({...f,alertValue:e.target.value}))}
                    style={{width:'100%',background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'10px 12px',color:'var(--text)',fontSize:'14px',fontFamily:'var(--mono)',boxSizing:'border-box'}}/>
                </div>

                <button onClick={addAlert} disabled={!form.alertValue}
                  style={{background:'var(--cyan)',color:'#000',border:'none',padding:'13px',borderRadius:'9px',fontWeight:800,fontSize:'14px',cursor:'pointer',fontFamily:'inherit',opacity:!form.alertValue?0.5:1}}>
                  🔔 {t('إضافة التنبيه', 'Add alert')}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
