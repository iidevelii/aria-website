'use client'
import { useState, useEffect } from 'react'
import { useLang } from '../ClientShell'
import { API_ORIGIN as API } from '../lib/api'

type ExchangeStatus = {
  linked: boolean
  can_spot: boolean
  can_futures: boolean
  auto_trade_enabled: boolean
  risk_pct_per_trade: string
  risk_mode: 'PERCENT' | 'FIXED_USD'
  risk_amount_usd: string | null
  market_pref: 'BOTH' | 'SPOT_ONLY' | 'FUTURES_ONLY'
  leverage_pref: number
  last_verified_at: string | null
}

type LinkState = { binance: ExchangeStatus; alpaca: ExchangeStatus }

const UNLINKED: ExchangeStatus = {
  linked: false, can_spot: false, can_futures: false, auto_trade_enabled: false,
  risk_pct_per_trade: '1.0', risk_mode: 'PERCENT', risk_amount_usd: null,
  market_pref: 'BOTH', leverage_pref: 5, last_verified_at: null,
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
      {children}
    </div>
  )
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', cursor: 'pointer' }}>
      <span style={{ fontSize: '13px' }}>{label}</span>
      <span
        onClick={() => onChange(!checked)}
        style={{
          width: '42px', height: '24px', borderRadius: '12px', position: 'relative', flexShrink: 0,
          background: checked ? 'var(--cyan)' : 'var(--surface-2)', border: '1px solid var(--border)', transition: 'background 0.15s',
        }}
      >
        <span style={{
          position: 'absolute', top: '2px', [checked ? 'right' : 'left']: '2px', width: '18px', height: '18px',
          borderRadius: '50%', background: checked ? '#000' : 'var(--muted)', transition: 'all 0.15s',
        }} />
      </span>
    </label>
  )
}

function SegRow<T extends string>({ options, value, onChange }: { options: [T, string][]; value: T; onChange: (v: T) => void }) {
  return (
    <div style={{ display: 'flex', gap: '6px' }}>
      {options.map(([v, label]) => {
        const selected = value === v
        return (
          <button key={v} onClick={() => onChange(v)} style={{
            flex: 1, padding: '8px 6px', fontSize: '11.5px', fontWeight: selected ? 800 : 500, cursor: 'pointer',
            background: selected ? 'rgba(0,229,255,0.15)' : 'transparent',
            border: `1px solid ${selected ? 'var(--cyan)' : 'var(--border)'}`,
            color: selected ? 'var(--cyan)' : 'var(--muted)', borderRadius: '10px', fontFamily: 'inherit',
          }}>
            {label}
          </button>
        )
      })}
    </div>
  )
}

export default function ExchangeLinkPage() {
  const { t } = useLang()
  const [state, setState] = useState<LinkState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [linkModal, setLinkModal] = useState<null | { exchange: 'binance' | 'alpaca'; step: 'warning' | 'form' }>(null)
  const [apiKey, setApiKey] = useState('')
  const [apiSecret, setApiSecret] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [unlinkTarget, setUnlinkTarget] = useState<'binance' | 'alpaca' | null>(null)
  const [fixedRiskInput, setFixedRiskInput] = useState<Record<string, string>>({})

  const load = async () => {
    try {
      const r = await fetch(`${API}/v1/exchange-credentials`, { credentials: 'include' })
      if (r.status === 401) { setError('unauthenticated'); setLoading(false); return }
      if (!r.ok) throw new Error()
      const d = await r.json()
      setState({ binance: d.binance ?? UNLINKED, alpaca: d.alpaca ?? UNLINKED })
    } catch { setError('network') }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const updateSettings = async (exchange: 'binance' | 'alpaca', body: Record<string, unknown>) => {
    if (!state) return
    // تحديث متفائل فوري (نفس UX التطبيق) -- نرجّع القديم لو فشل الطلب
    const prev = state
    setState({ ...state, [exchange]: { ...state[exchange], ...toSnake(body) } })
    try {
      const r = await fetch(`${API}/v1/exchange-credentials/${exchange}/settings`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!r.ok) setState(prev)
    } catch { setState(prev) }
  }

  const toSnake = (body: Record<string, unknown>) => {
    const map: Record<string, string> = {
      auto_trade_enabled: 'auto_trade_enabled', risk_pct_per_trade: 'risk_pct_per_trade',
      risk_mode: 'risk_mode', risk_amount_usd: 'risk_amount_usd', market_pref: 'market_pref', leverage_pref: 'leverage_pref',
    }
    const out: Record<string, unknown> = {}
    for (const k in body) out[map[k] ?? k] = body[k]
    return out
  }

  const submitLink = async () => {
    if (!linkModal) return
    setSubmitting(true)
    setFormError('')
    try {
      const r = await fetch(`${API}/v1/exchange-credentials/link`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exchange: linkModal.exchange, api_key: apiKey.trim(), api_secret: apiSecret.trim() }),
      })
      const d = await r.json().catch(() => ({}))
      if (r.ok) {
        setLinkModal(null); setApiKey(''); setApiSecret('')
        await load()
      } else {
        setFormError(d.detail?.toString() || t('تعذّر الربط', 'Could not link'))
      }
    } catch { setFormError(t('خطأ شبكة', 'Network error')) }
    setSubmitting(false)
  }

  const doUnlink = async () => {
    if (!unlinkTarget) return
    try {
      await fetch(`${API}/v1/exchange-credentials/${unlinkTarget}`, { method: 'DELETE', credentials: 'include' })
    } catch {}
    setUnlinkTarget(null)
    await load()
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
      {t('جاري التحميل...', 'Loading...')}
    </div>
  )

  if (error === 'unauthenticated') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
      {t('سجّل دخولك عشان تدير التداول الآلي', 'Log in to manage auto-trading')}
    </div>
  )

  if (!state) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red)' }}>
      {t('تعذّر تحميل حالة الربط', 'Could not load link status')}
    </div>
  )

  const exchanges: { key: 'binance' | 'alpaca'; title: string; subtitle: [string, string] }[] = [
    { key: 'binance', title: 'Binance', subtitle: [t('كريبتو — فيوتشر/سبوت', 'Crypto — Futures/Spot'), ''] },
    { key: 'alpaca', title: 'Alpaca', subtitle: [t('السوق الأمريكي — أسهم', 'US Market — Stocks'), ''] },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: '32px 20px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 900, marginBottom: '20px' }}>⚡ {t('التداول الآلي', 'Auto-Trade')}</h1>

        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '10px', background: 'rgba(255,68,85,0.1)',
          border: '1px solid rgba(255,68,85,0.35)', borderRadius: '12px', padding: '14px', marginBottom: '20px',
        }}>
          <span style={{ fontSize: '18px', lineHeight: 1 }}>⚠️</span>
          <p style={{ fontSize: '12.5px', lineHeight: 1.6, margin: 0 }}>
            {t(
              'التداول الآلي ينفّذ صفقات حقيقية بحسابك مباشرة، بدون تأكيد يدوي لكل صفقة. المخاطرة على مسؤوليتك الكاملة. لا نحتفظ بأي صلاحية سحب أموال — نرفض تخزين أي مفتاح يقدر يسحب فلوس.',
              'Auto-trading executes real trades on your account directly, with no manual confirmation per trade. The risk is entirely your own. We never hold withdrawal permission — any key with withdrawal enabled is auto-rejected.'
            )}
          </p>
        </div>

        {exchanges.map(({ key, title, subtitle }) => {
          const s = state[key]
          return (
            <Card key={key}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: s.linked ? '14px' : '10px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '15px' }}>{title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{subtitle[0]}</div>
                </div>
                <span style={{ color: s.linked ? 'var(--green)' : 'var(--muted)', fontSize: '18px' }}>
                  {s.linked ? '✓' : '⛓️‍💥'}
                </span>
              </div>

              {!s.linked ? (
                <button
                  onClick={() => setLinkModal({ exchange: key, step: 'warning' })}
                  style={{
                    width: '100%', padding: '11px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                    background: 'transparent', border: '1px solid var(--cyan)', color: 'var(--cyan)', borderRadius: '10px', fontFamily: 'inherit',
                  }}
                >
                  {t('ربط الحساب', 'Link account')}
                </button>
              ) : (
                <>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--green)', marginBottom: '12px' }}>
                    {t('مربوط', 'Linked')}
                    {(s.can_futures || s.can_spot) && ' — '}
                    {[s.can_futures && t('فيوتشر', 'Futures'), s.can_spot && t('سبوت', 'Spot')].filter(Boolean).join(' · ')}
                  </div>

                  <Toggle
                    checked={s.auto_trade_enabled}
                    onChange={(v) => updateSettings(key, { auto_trade_enabled: v })}
                    label={t('التنفيذ الآلي', 'Auto-execution')}
                  />

                  {key === 'binance' && (
                    <>
                      <div style={{ fontSize: '13px', margin: '10px 0 6px' }}>{t('السوق', 'Market')}</div>
                      <SegRow
                        value={s.market_pref}
                        onChange={(v) => updateSettings(key, { market_pref: v })}
                        options={[['BOTH', t('كلاهما', 'Both')], ['SPOT_ONLY', t('سبوت فقط', 'Spot only')], ['FUTURES_ONLY', t('فيوتشر فقط', 'Futures only')]]}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', margin: '14px 0 6px' }}>
                        <span>{t('الرافعة القصوى (فيوتشر)', 'Max leverage (futures)')}</span>
                        <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>{s.leverage_pref}x</span>
                      </div>
                      <SegRow
                        value={String(s.leverage_pref)}
                        onChange={(v) => updateSettings(key, { leverage_pref: Number(v) })}
                        options={[1, 2, 3, 5, 10].map((n) => [String(n), `${n}x`] as [string, string])}
                      />
                    </>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '14px 0 8px' }}>
                    <span style={{ fontSize: '13px' }}>{t('طريقة المخاطرة', 'Risk mode')}</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {(['PERCENT', 'FIXED_USD'] as const).map((m) => {
                        const selected = s.risk_mode === m
                        return (
                          <button key={m} onClick={() => updateSettings(key, { risk_mode: m })} style={{
                            padding: '5px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                            background: selected ? 'rgba(0,229,255,0.15)' : 'transparent',
                            border: `1px solid ${selected ? 'var(--cyan)' : 'var(--border)'}`,
                            color: selected ? 'var(--cyan)' : 'var(--muted)', borderRadius: '8px', fontFamily: 'inherit',
                          }}>
                            {m === 'PERCENT' ? t('نسبة%', 'Percent') : t('مبلغ ثابت', 'Fixed $')}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {s.risk_mode === 'FIXED_USD' ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="number" min={1} max={100000} dir="ltr"
                        placeholder={t('مبلغ ثابت لكل صفقة', 'Fixed amount per trade')}
                        defaultValue={s.risk_amount_usd ?? ''}
                        onChange={(e) => setFixedRiskInput({ ...fixedRiskInput, [key]: e.target.value })}
                        style={{ flex: 1, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', fontFamily: 'inherit' }}
                      />
                      <button
                        onClick={() => {
                          const v = parseFloat(fixedRiskInput[key] ?? s.risk_amount_usd ?? '')
                          if (v >= 1 && v <= 100000) updateSettings(key, { risk_amount_usd: v })
                        }}
                        style={{ padding: '9px 16px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', background: 'var(--cyan)', color: '#000', border: 'none', borderRadius: '8px', fontFamily: 'inherit' }}
                      >
                        {t('حفظ', 'Save')}
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                        <span>{t('نسبة المخاطرة لكل صفقة', 'Risk % per trade')}</span>
                        <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>{parseFloat(s.risk_pct_per_trade).toFixed(1)}%</span>
                      </div>
                      <input
                        type="range" min={0.1} max={10} step={0.1} dir="ltr"
                        value={s.risk_pct_per_trade}
                        onChange={(e) => updateSettings(key, { risk_pct_per_trade: parseFloat(e.target.value) })}
                        style={{ width: '100%', accentColor: 'var(--cyan)' }}
                      />
                    </>
                  )}

                  <div style={{ textAlign: 'left', marginTop: '10px' }}>
                    <button
                      onClick={() => setUnlinkTarget(key)}
                      style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: '12.5px', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}
                    >
                      {t('فك الربط', 'Unlink')}
                    </button>
                  </div>
                </>
              )}
            </Card>
          )
        })}
      </div>

      {/* ── نافذة تحذير المخاطرة ── */}
      {linkModal?.step === 'warning' && (
        <Modal onClose={() => setLinkModal(null)}>
          <h3 style={{ marginTop: 0, marginBottom: '14px' }}>{t('تنبيه مخاطر التداول الآلي', 'Auto-trade risk notice')}</h3>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>
            {t(
              'راح يقوم الحساب بفتح وإغلاق صفقات حقيقية تلقائياً بدون تأكيد يدوي لكل صفقة، بناءً على إشارات DevelBot. التداول بالرافعة خصوصاً عالي المخاطر وقد يؤدي لخسارة كامل رأس المال المخصَّص. هذا قرارك الكامل، DevelBot أداة تحليل ولا يضمن أي نتيجة.',
              'Your account will open and close real trades automatically with no manual confirmation per trade, based on DevelBot signals. Leveraged trading especially is high-risk and can lose your entire allocated capital. This is your own decision — DevelBot is an analysis tool and guarantees no outcome.'
            )}
            <br /><br />
            {t(
              'المفتاح لازم يكون بدون صلاحية سحب أموال (Withdrawal) — سنرفضه تلقائياً لو كانت مفعّلة.',
              'The key must not have withdrawal permission — we auto-reject it if enabled.'
            )}
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' }}>
            <button onClick={() => setLinkModal(null)} style={btnGhost}>{t('إلغاء', 'Cancel')}</button>
            <button onClick={() => setLinkModal({ exchange: linkModal.exchange, step: 'form' })} style={btnPrimary}>
              {t('أوافق، أكمل', 'I agree, continue')}
            </button>
          </div>
        </Modal>
      )}

      {/* ── نافذة إدخال المفتاح ── */}
      {linkModal?.step === 'form' && (
        <Modal onClose={() => !submitting && setLinkModal(null)}>
          <h3 style={{ marginTop: 0, marginBottom: '14px' }}>
            {t('مفاتيح', 'Keys for')} {linkModal.exchange === 'binance' ? 'Binance' : 'Alpaca'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              value={apiKey} onChange={(e) => setApiKey(e.target.value)} dir="ltr" placeholder="API Key"
              style={inputStyle}
            />
            <input
              value={apiSecret} onChange={(e) => setApiSecret(e.target.value)} dir="ltr" type="password" placeholder="API Secret"
              style={inputStyle}
            />
          </div>
          {formError && <div style={{ color: 'var(--red)', fontSize: '12px', marginTop: '10px' }}>{formError}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' }}>
            <button onClick={() => setLinkModal(null)} disabled={submitting} style={btnGhost}>{t('إلغاء', 'Cancel')}</button>
            <button onClick={submitLink} disabled={submitting || !apiKey.trim() || !apiSecret.trim()} style={btnPrimary}>
              {submitting ? t('جاري الربط...', 'Linking...') : t('ربط', 'Link')}
            </button>
          </div>
        </Modal>
      )}

      {/* ── تأكيد فك الربط ── */}
      {unlinkTarget && (
        <Modal onClose={() => setUnlinkTarget(null)}>
          <h3 style={{ marginTop: 0, marginBottom: '10px' }}>{t('فك الربط؟', 'Unlink?')}</h3>
          <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
            {t('راح يتوقف التنفيذ الآلي فوراً ويُحذف المفتاح المخزَّن.', 'Auto-execution stops immediately and the stored key is deleted.')}
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' }}>
            <button onClick={() => setUnlinkTarget(null)} style={btnGhost}>{t('إلغاء', 'Cancel')}</button>
            <button onClick={doUnlink} style={{ ...btnPrimary, background: 'var(--red)' }}>{t('فك الربط', 'Unlink')}</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 100,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px',
        padding: '22px', maxWidth: '420px', width: '100%',
      }}>
        {children}
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '8px',
  padding: '10px 12px', color: 'var(--text)', fontSize: '13px', fontFamily: 'inherit',
}
const btnGhost: React.CSSProperties = {
  padding: '9px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
  background: 'transparent', border: 'none', color: 'var(--muted)', fontFamily: 'inherit',
}
const btnPrimary: React.CSSProperties = {
  padding: '9px 18px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
  background: 'var(--cyan)', color: '#000', border: 'none', borderRadius: '8px', fontFamily: 'inherit',
}
