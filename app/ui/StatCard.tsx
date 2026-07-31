'use client'

type Props = {
  value: string | number
  label: string
  color?: string
  sub?: string
}

/** بطاقة إحصائية موحّدة (رقم كبير + تسمية) — تلف كلاس stat-card الموجود. */
export default function StatCard({ value, label, color, sub }: Props) {
  return (
    <div className="stat-card">
      <div className="stat-value" style={{ color: color || 'var(--text)' }}>{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>{sub}</div>}
    </div>
  )
}
