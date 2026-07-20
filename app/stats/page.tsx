'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Stats() {
  const [signals, setSignals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeMonth, setActiveMonth] = useState('')

  useEffect(() => {
    fetch('https://web-production-97af6.up.railway.app/signals')
      .then(r => r.json())
      .then(d => {
        setSignals(Array.isArray(d) ? d : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
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

  const getDuration = (s: any) => {
    if (!s.closed_at) return '—'
    const diff = new Date(s.closed_at).getTime() - new Date(s.created_at).getTime()
    const hours = Math.floor(diff / 3600000)
    const mins = Math.floor((diff % 3600000) / 60000)
    return `${hours}س ${mins}د`
  }

  const monthName = (key: string) => {
    const [year, month] = key.split('-')
    const names = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
    return `${names[parseInt(month) - 1]} ${year}`
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'var(--cyan)', fontWeight: 700 }}>جاري التحميل...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: '24px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '4px' }}>📊 إحصائيات الصفقات</h1>
            <p style={{ color: 'var(--muted)', fontSize: '14px' }}>سجل كامل لجميع الصفقات</p>
          </div>
          <Link href="/dashboard" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', textDecoration: 'none', padding: '10px 20px', borderRadius: '12px', fontSize: '13px', fontWeight: 700 }}>← الداشبورد</Link>
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
            { label: 'الصفقات', value: currentSignals.length, color: 'var(--text)' },
            { label: 'رابحة', value: wins.length, color: 'var(--green)' },
            { label: 'خاسرة', value: losses.length, color: 'var(--red)' },
            { label: 'مفتوحة', value: open.length, color: 'var(--yellow)' },
            { label: 'نسبة الفوز', value: `${winRate}%`, color: winRate >= 60 ? 'var(--green)' : 'var(--yellow)' },
            { label: 'إجمالي الربح', value: `+${totalPnlWin.toFixed(1)}%`, color: 'var(--green)' },
            { label: 'إجمالي الخسارة', value: `${totalPnlLoss.toFixed(1)}%`, color: 'var(--red)' },
            { label: 'صافي الربح', value: `${netPnl >= 0 ? '+' : ''}${netPnl.toFixed(1)}%`, color: netPnl >= 0 ? 'var(--green)' : 'var(--red)' },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div style={{ fontSize: '20px', fontWeight: 900, color: s.color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Signals Table */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '15px' }}>
            سجل الصفقات — {monthName(currentMonth)}
          </div>
          {currentSignals.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--muted)' }}>لا توجد صفقات في هذا الشهر</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                    {['العملة', 'الاتجاه', 'الدخول', 'الهدف', 'الوقف', 'الحالة', 'الربح/الخسارة', 'تاريخ الدخول', 'تاريخ الإغلاق', 'المدة', 'Score'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
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
                          {s.status === 'WIN' ? '✓ ربح' : s.status === 'LOSS' ? '✗ خسارة' : '● مفتوحة'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: s.pnl_pct ? (parseFloat(s.pnl_pct) > 0 ? 'var(--green)' : 'var(--red)') : 'var(--muted)' }}>
                        {s.pnl_pct ? `${parseFloat(s.pnl_pct) > 0 ? '+' : ''}${parseFloat(s.pnl_pct).toFixed(2)}%` : '—'}
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--muted)', fontFamily: 'monospace', fontSize: '12px' }}>
                        {new Date(s.created_at).toLocaleDateString('ar-SA')} {new Date(s.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--muted)', fontFamily: 'monospace', fontSize: '12px' }}>
                        {s.closed_at ? `${new Date(s.closed_at).toLocaleDateString('ar-SA')} ${new Date(s.closed_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}` : '—'}
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
