'use client'
import { ReactNode } from 'react'

type Tone = 'cyan' | 'green' | 'red' | 'yellow' | 'purple' | 'muted'
const TONE: Record<Tone, { bg: string; fg: string; border: string }> = {
  cyan:   { bg: 'rgba(0,196,239,0.08)',  fg: 'var(--cyan)',   border: 'rgba(0,196,239,0.2)' },
  green:  { bg: 'rgba(34,208,110,0.1)',  fg: 'var(--green)',  border: 'rgba(34,208,110,0.22)' },
  red:    { bg: 'rgba(240,64,96,0.1)',   fg: 'var(--red)',    border: 'rgba(240,64,96,0.22)' },
  yellow: { bg: 'rgba(245,158,11,0.1)',  fg: 'var(--yellow)', border: 'rgba(245,158,11,0.22)' },
  purple: { bg: 'rgba(124,58,237,0.1)',  fg: 'var(--purple)', border: 'rgba(124,58,237,0.22)' },
  muted:  { bg: 'rgba(255,255,255,0.05)', fg: 'var(--muted)', border: 'var(--border)' },
}

/** شارة صغيرة موحّدة (حالة/تصنيف) — بدل تكرار pill-* يدوياً بكل صفحة. */
export default function Badge({ children, tone = 'cyan' }: { children: ReactNode; tone?: Tone }) {
  const c = TONE[tone]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      background: c.bg, color: c.fg, border: `1px solid ${c.border}`,
      borderRadius: '6px', padding: '3px 10px', fontSize: '11px', fontWeight: 700,
      letterSpacing: '0.02em', whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  )
}
