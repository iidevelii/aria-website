'use client'
import { ReactNode } from 'react'

type Props = { icon?: string; title: string; desc?: string; action?: ReactNode }

/** حالة "لا يوجد محتوى" موحّدة — تُستخدم بدل تكرار نفس التنسيق بكل صفحة جدول/قائمة فاضية. */
export default function EmptyState({ icon = '📭', title, desc, action }: Props) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--muted)' }}>
      <div style={{ fontSize: '36px', marginBottom: '12px', opacity: 0.7 }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: 'var(--fs-h3)', color: 'var(--text)', marginBottom: '6px' }}>{title}</div>
      {desc && <div style={{ fontSize: 'var(--fs-small)', lineHeight: 'var(--lh-relaxed)', maxWidth: '380px', margin: '0 auto' }}>{desc}</div>}
      {action && <div style={{ marginTop: '18px' }}>{action}</div>}
    </div>
  )
}
