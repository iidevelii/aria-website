'use client'
import { useState, useEffect } from 'react'
import { useLang } from '../../ClientShell'
import { API_ORIGIN as API } from '../../lib/api'

type WatchItem = { symbol: string; added_at: string | null }

export default function USMarketWatchlistPage() {
  const { t } = useLang()
  const [items, setItems] = useState<WatchItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loggedIn, setLoggedIn] = useState(true)
  const [newSymbol, setNewSymbol] = useState('')

  const load = () => {
    fetch(`${API}/us/watchlist`, { credentials: 'include' })
      .then(r => { if (r.status === 401) { setLoggedIn(false); return [] } setLoggedIn(true); return r.json() })
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const addSymbol = async () => {
    const symbol = newSymbol.trim().toUpperCase()
    if (!symbol) return
    setNewSymbol('')
    await fetch(`${API}/us/watchlist`, {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol }),
    })
    load()
  }

  const removeSymbol = async (symbol: string) => {
    await fetch(`${API}/us/watchlist/${symbol}`, { method: 'DELETE', credentials: 'include' })
    load()
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <div style={{ padding: '32px 24px', maxWidth: '560px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 900, margin: 0 }}>⭐ {t('قائمة المتابعة', 'Watchlist')}</h1>

        {!loggedIn ? (
          <div className="card" style={{ marginTop: '20px', padding: '22px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
            {t('سجّل دخولك عشان تبني قائمة متابعة خاصة بك.', 'Log in to build your own watchlist.')}
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '8px', marginTop: '18px' }}>
              <input
                value={newSymbol}
                onChange={e => setNewSymbol(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSymbol()}
                placeholder={t('رمز السهم (مثال: AAPL)', 'Ticker (e.g. AAPL)')}
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: '10px', fontSize: '13px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: 'var(--text)', fontFamily: 'inherit',
                }}
              />
              <button onClick={addSymbol} style={{
                padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 800,
                cursor: 'pointer', border: 'none', fontFamily: 'inherit', background: '#00c4ef', color: 'black',
              }}>
                {t('إضافة', 'Add')}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '18px' }}>
              {loading ? (
                <div style={{ color: 'var(--muted)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
                  {t('جاري التحميل...', 'Loading...')}
                </div>
              ) : items.length === 0 ? (
                <div style={{ color: 'var(--muted)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
                  {t('قائمتك فاضية — أضف أول رمز أعلاه.', 'Your watchlist is empty — add your first ticker above.')}
                </div>
              ) : (
                items.map(it => (
                  <div key={it.symbol} className="card" style={{
                    padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <span style={{ fontWeight: 800, fontSize: '14px' }}>{it.symbol}</span>
                    <button onClick={() => removeSymbol(it.symbol)} style={{
                      background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '13px',
                    }}>
                      {t('إزالة', 'Remove')}
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
