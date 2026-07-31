'use client'
import { ReactNode, CSSProperties } from 'react'

type Props = {
  children: ReactNode
  title?: ReactNode
  action?: ReactNode
  padding?: string
  glow?: 'cyan' | 'purple' | 'green' | 'none'
  style?: CSSProperties
  onClick?: () => void
}

const GLOW: Record<string, string> = {
  cyan: 'var(--glow-cyan)', purple: 'var(--glow-purple)', green: 'var(--glow-green)', none: 'none',
}

/** بطاقة موحّدة — عنوان اختياري + منطقة إجراء (زر/رابط) بأعلى اليمين. */
export default function Card({ children, title, action, padding = '20px', glow = 'none', style, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
        boxShadow: glow !== 'none' ? GLOW[glow] : undefined, cursor: onClick ? 'pointer' : undefined,
        overflow: 'hidden', ...style,
      }}
    >
      {(title || action) && (
        <div style={{ padding: `14px ${padding}`, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
          {title && <div style={{ fontWeight: 800, fontSize: 'var(--fs-h3)' }}>{title}</div>}
          {action}
        </div>
      )}
      <div style={{ padding }}>{children}</div>
    </div>
  )
}
