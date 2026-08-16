'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLang } from '../ClientShell'
import { API_ORIGIN } from '../lib/api'

export default function Stats() {
  const { t, lang } = useLang()
  const [signals, setSignals] = useState<any[]>([])
  const [activeEngines, setActiveEngines] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [activeMonth, setActiveMonth] = useState('')

  useEffect(() => {
    fetch(`${API_ORIGIN}/signals?limit=1000`)
      .then(r => r.json())
      .then(d => {
        setSignals(Array.isArray(d) ? d : [])
        setLoading(false)
      })
      .catch(() => { setLoadError(true); setLoading(false) })
    fetch(`${API_ORIGIN}/bot-state/active_engines`)
      .then(r => r.json())
      .then(d => { try { setActiveEngines(JSON.parse(d.value) || {}) } catch { /* ignore */ } })
      .catch(() => { /* شارة النشاط اختيارية -- ما توقف الصفحة لو فشلت */ })
  }, [])

  // تجميع الصفقات حسب الشهر
  const months: Record<string, any[]> = {}
  signals.forEach(s => {
    const date = new Date(s.created_at)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (!months[key]) months[key] = []
    months[key].push(s)
  })

  const monthKeys = Object.keys(months).sort().reverse()
  const currentMonth = activeMonth || monthKeys[0] || ''
  const currentSignals = months[currentMonth] || []

  const wins = currentSignals.filter(s => s.status === 'WIN')
  const losses = currentSignals.filter(s => s.status === 'LOSS')
  const open = currentSignals.filter(s => s.status === 'OPEN')
  const closed = wins.length + losses.length
  const winRate = closed > 0 ? Math.round(wins.length / closed * 100) : 0
  const totalPnlWin = wins.reduce((sum, s) => sum + parseFloat(s.pnl_pct || '0'), 0)
  const totalPnlLoss = losses.reduce((sum, s) => sum + parseFloat(s.pnl_pct || '0'), 0)
  const netPnl = totalPnlWin + totalPnlLoss

  // تفصيل حسب الاستراتيجية (كل الوقت، مو مقيّد بالشهر المختار -- "منذ متى
  // شغالة" يحتاج أول صفقة فعلية لكل محرك)
  const ENGINE_LABELS: Record<string, string> = {
    TREND_MTF: '🌊 Trend MTF', SMC_MTF: '🧿 SMC MTF', RETEST_MTF: '🔁 Retest MTF',
    SMART_MONEY_BREAKOUT: '🟢 Smart Money Breakout', IMBA_ALGO: '🔴 IMBA Algo',
  }

  function summarize(rows: any[]) {
    const w = rows.filter(s => s.status === 'WIN')
    const l = rows.filter(s => s.status === 'LOSS')
    const o = rows.filter(s => s.status === 'OPEN')
    const closedN = w.length + l.length
    const wr = closedN > 0 ? Math.round(w.length / closedN * 100) : 0
    const net = [...w, ...l].reduce((sum, s) => sum + parseFloat(s.pnl_pct || '0'), 0)
    return { total: rows.length, closed: closedN, wins: w.length, losses: l.length, open: o.length, wr, net }
  }

  function engineBreakdown(rows: any[]) {
    return Object.keys(ENGINE_LABELS).map(eng => {
      const eSigs = rows.filter(s => s.engine === eng)
      if (eSigs.length === 0) return null
      const s = summarize(eSigs)
      const firstDate = eSigs.reduce((min, x) => { const d = new Date(x.created_at).getTime(); return d < min ? d : min }, Date.now())
      const daysLive = Math.max(1, Math.floor((Date.now() - firstDate) / 86400000))
      return { engine: eng, label: ENGINE_LABELS[eng], ...s, daysLive, active: activeEngines[eng] ?? null }
    }).filter(Boolean) as { engine: string; label: string; total: number; closed: number; wins: number; losses: number; open: number; wr: number; net: number; daysLive: number; active: boolean | null }[]
  }

  // إعادة هيكلة الاستراتيجيات (إصدار ٢): من أول صفقة Retest MTF فصاعداً --
  // نقطة التحوّل مُستنتَجة من البيانات نفسها (أول إشارة RETEST_MTF فعلية)
  // بدل تاريخ مثبّت بالكود، فتبقى صحيحة تلقائياً بدون صيانة يدوية.
  const retestSignals = signals.filter(s => s.engine === 'RETEST_MTF')
  const retestCutoverTs = retestSignals.length > 0
    ? Math.min(...retestSignals.map(s => new Date(s.created_at).getTime()))
    : null

  const v1Signals = retestCutoverTs ? signals.filter(s => new Date(s.created_at).getTime() < retestCutoverTs) : []
  const v2Signals = retestCutoverTs ? signals.filter(s => new Date(s.created_at).getTime() >= retestCutoverTs) : signals

  const v1Summary = summarize(v1Signals)
  const v2Summary = summarize(v2Signals)
  const engineStats = engineBreakdown(v2Signals)

  const getDuration = (s: any) => {
    if (!s.closed_at) return '—'
    const diff = new Date(s.closed_at).getTime() - new Date(s.created_at).getTime()
    const hours = Math.floor(diff / 3600000)
    const mins = Math.floor((diff % 3600000) / 60000)
    return lang === 'ar' ? `${hours}س ${mins}د` : `${hours}h ${mins}m`
  }

  const monthName = (key: string) => {
    const [year, month] = key.split('-')
    const namesAr = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
    const namesEn = ['January','February','March','April','May','June','July','August','September','October','November','December']
    const names = lang === 'ar' ? namesAr : namesEn
    return `${names[parseInt(month) - 1]} ${year}`
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'var(--cyan)', fontWeight: 700 }}>{t('جاري التحميل...', 'Loading...')}</div>
    </div>
  )

  if (loadError) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
      <div style={{ fontSize: '32px' }}>⚠️</div>
      <div>{t('تعذّر تحميل البيانات، تحقق من اتصالك وحاول مرة ثانية', 'Failed to load data, check your connection and try again')}</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: '24px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '4px' }}>{t('📊 إحصائيات الصفقات', '📊 Trade Statistics')}</h1>
            <p style={{ color: 'var(--muted)', fontSize: '14px' }}>{t('سجل كامل لجميع الصفقات', 'A complete record of all trades')}</p>
          </div>
          <Link href="/dashboard" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', textDecoration: 'none', padding: '10px 20px', borderRadius: '12px', fontSize: '13px', fontWeight: 700 }}>{t('← الداشبورد', '← Dashboard')}</Link>
        </div>

        {/* Months Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
          {monthKeys.map(key => (
            <button key={key} onClick={() => setActiveMonth(key)} style={{ padding: '8px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', border: 'none', fontFamily: 'inherit', whiteSpace: 'nowrap', background: currentMonth === key ? 'var(--cyan)' : 'var(--surface-2)', color: currentMonth === key ? '#000' : 'var(--muted)', transition: 'all 0.2s' }}>
              {monthName(key)}
            </button>
          ))}
        </div>

        {/* Monthly Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: t('الصفقات', 'Trades'), value: currentSignals.length, color: 'var(--text)' },
            { label: t('رابحة', 'Wins'), value: wins.length, color: 'var(--green)' },
            { label: t('خاسرة', 'Losses'), value: losses.length, color: 'var(--red)' },
            { label: t('مفتوحة', 'Open'), value: open.length, color: 'var(--yellow)' },
            { label: t('نسبة الفوز', 'Win Rate'), value: `${winRate}%`, color: winRate >= 60 ? 'var(--green)' : 'var(--yellow)' },
            { label: t('إجمالي الربح', 'Total Profit'), value: `+${totalPnlWin.toFixed(1)}%`, color: 'var(--green)' },
            { label: t('إجمالي الخسارة', 'Total Loss'), value: `${totalPnlLoss.toFixed(1)}%`, color: 'var(--red)' },
            { label: t('صافي الربح', 'Net Profit'), value: `${netPnl >= 0 ? '+' : ''}${netPnl.toFixed(1)}%`, color: netPnl >= 0 ? 'var(--green)' : 'var(--red)' },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div style={{ fontSize: '20px', fontWeight: 900, color: s.color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* إصدار سابق (متوقف) -- كل الاستراتيجيات قبل إضافة Retest MTF،
            معروض كأرشيف مجمَّع وليس بتفصيل كل استراتيجية على حدة */}
        {retestCutoverTs && v1Summary.total > 0 && (
          <div style={{ marginBottom: '16px', background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: '16px', padding: '18px 20px' }}>
            <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--muted)', marginBottom: '8px' }}>
              {t('⏸️ إصدار سابق (متوقف) — قبل إضافة Retest MTF', '⏸️ Previous version (discontinued) — before Retest MTF')}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '12px', lineHeight: 1.6 }}>
              {t('يضم الاستراتيجيات القديمة (Trend MTF + SMC MTF) قبل إعادة الهيكلة — معروض للأرشيف فقط، غير مستخدم بالتوليد الحالي.',
                 'Includes the old strategies (Trend MTF + SMC MTF) before the restructure — shown for archive only, not part of current signal generation.')}
            </div>
            <div style={{ display: 'flex', gap: '24px', fontSize: '13px', flexWrap: 'wrap' }}>
              <span>{t('صفقات', 'Trades')}: <b>{v1Summary.closed}</b></span>
              <span>{t('نسبة الفوز', 'Win rate')}: <b>{v1Summary.wr}%</b></span>
              <span>{t('صافي', 'Net')}: <b style={{ color: v1Summary.net >= 0 ? 'var(--green)' : 'var(--red)' }}>{v1Summary.net >= 0 ? '+' : ''}{v1Summary.net.toFixed(2)}%</b></span>
            </div>
          </div>
        )}

        {/* Per-Strategy Breakdown -- الإصدار الحالي (من Retest MTF فصاعداً
            لو فيه تحوّل مسجَّل، وإلا كل السجل زي ما هو) */}
        {engineStats.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>
              {retestCutoverTs ? t('🟢 الإصدار الحالي — نتائج كل استراتيجية', '🟢 Current version — results by strategy') : t('نتائج كل استراتيجية', 'Results by strategy')}
            </div>
            {retestCutoverTs && (
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '12px' }}>
                {t('من إضافة Retest MTF فصاعداً', 'Since Retest MTF was added')}
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
              {engineStats.map(e => (
                <div key={e.engine} className="stat-card" style={{ padding: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 800, fontSize: '14px' }}>{e.label}</span>
                    {e.active !== null && (
                      <span style={{ fontSize: '11px', fontWeight: 700, color: e.active ? 'var(--green)' : 'var(--muted)' }}>
                        {e.active ? t('🟢 شغالة', '🟢 Live') : t('⏸️ متوقفة', '⏸️ Paused')}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '10px' }}>
                    {t(`منذ ${e.daysLive} يوم`, `Running for ${e.daysLive} days`)}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span>{t('صفقات', 'Trades')}: <b>{e.closed}</b></span>
                    <span style={{ color: 'var(--green)' }}>✅ {e.wins}</span>
                    <span style={{ color: 'var(--red)' }}>❌ {e.losses}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginTop: '8px' }}>
                    <span>{t('نسبة الفوز', 'Win rate')}: <b style={{ color: e.wr >= 60 ? 'var(--green)' : 'var(--yellow)' }}>{e.wr}%</b></span>
                    <span>{t('صافي', 'Net')}: <b style={{ color: e.net >= 0 ? 'var(--green)' : 'var(--red)' }}>{e.net >= 0 ? '+' : ''}{e.net.toFixed(1)}%</b></span>
                  </div>
                </div>
              ))}
            </div>
            {retestCutoverTs && (
              <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end', gap: '8px', fontSize: '14px' }}>
                <span style={{ fontWeight: 700 }}>{t('الصافي الإجمالي (الإصدار الحالي)', 'Total net (current version)')}:</span>
                <b style={{ color: v2Summary.net >= 0 ? 'var(--green)' : 'var(--red)' }}>{v2Summary.net >= 0 ? '+' : ''}{v2Summary.net.toFixed(2)}%</b>
              </div>
            )}
          </div>
        )}

        {/* Signals Table */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '15px' }}>
            {t('سجل الصفقات', 'Trade Log')} · {monthName(currentMonth)}
          </div>
          {currentSignals.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--muted)' }}>{t('لا توجد صفقات في هذا الشهر', 'No trades this month')}</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                    {([
                      ['العملة', 'Coin'], ['الاتجاه', 'Direction'], ['الدخول', 'Entry'], ['الهدف', 'Target'],
                      ['الوقف', 'Stop'], ['الحالة', 'Status'], ['الربح/الخسارة', 'P/L'], ['تاريخ الدخول', 'Entry Date'],
                      ['تاريخ الإغلاق', 'Close Date'], ['المدة', 'Duration'], ['Score', 'Score'],
                    ] as [string, string][]).map(([ar, en]) => (
                      <th key={ar} style={{ padding: '12px 16px', textAlign: lang === 'en' ? 'left' : 'right', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t(ar, en)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentSignals.map((s: any) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding: '14px 16px', fontWeight: 800 }}>{s.pair}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ background: s.side === 'LONG' ? 'rgba(0,230,100,0.12)' : 'rgba(255,85,85,0.12)', color: s.side === 'LONG' ? 'var(--green)' : 'var(--red)', borderRadius: '6px', padding: '3px 10px', fontSize: '11px', fontWeight: 800 }}>{s.side}</span>
                      </td>
                      <td style={{ padding: '14px 16px', fontFamily: 'monospace' }}>${s.entry}</td>
                      <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: 'var(--green)' }}>${s.tp}</td>
                      <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: 'var(--red)' }}>${s.sl}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ background: s.status === 'WIN' ? 'rgba(0,230,100,0.1)' : s.status === 'LOSS' ? 'rgba(255,85,85,0.1)' : 'rgba(251,191,36,0.1)', color: s.status === 'WIN' ? 'var(--green)' : s.status === 'LOSS' ? 'var(--red)' : 'var(--yellow)', borderRadius: '6px', padding: '3px 10px', fontSize: '11px', fontWeight: 700 }}>
                          {s.status === 'WIN' ? t('✓ ربح', '✓ Win') : s.status === 'LOSS' ? t('✗ خسارة', '✗ Loss') : t('● مفتوحة', '● Open')}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: s.pnl_pct ? (parseFloat(s.pnl_pct) > 0 ? 'var(--green)' : 'var(--red)') : 'var(--muted)' }}>
                        {s.pnl_pct ? `${parseFloat(s.pnl_pct) > 0 ? '+' : ''}${parseFloat(s.pnl_pct).toFixed(2)}%` : '—'}
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--muted)', fontFamily: 'monospace', fontSize: '12px' }}>
                        {new Date(s.created_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')} {new Date(s.created_at).toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--muted)', fontFamily: 'monospace', fontSize: '12px' }}>
                        {s.closed_at ? `${new Date(s.closed_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')} ${new Date(s.closed_at).toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}` : '—'}
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--muted)', fontSize: '12px' }}>{getDuration(s)}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--cyan)', fontWeight: 700 }}>{s.ai_score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style>{`.stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 20px; }`}</style>
    </div>
  )
}
