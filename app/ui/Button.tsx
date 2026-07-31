'use client'
import { ReactNode, CSSProperties, MouseEventHandler } from 'react'
import Link from 'next/link'

type Variant = 'primary' | 'ghost' | 'secondary'
type Props = {
  children: ReactNode
  href?: string
  onClick?: MouseEventHandler
  variant?: Variant
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  type?: 'button' | 'submit'
  style?: CSSProperties
  className?: string
  target?: string
}

const SIZE_PAD: Record<string, string> = { sm: '8px 16px', md: '11px 24px', lg: '14px 32px' }
const SIZE_FONT: Record<string, string> = { sm: '12px', md: '14px', lg: '15px' }

/** زر موحّد لكل الموقع — يلف نفس كلاسات btn-* الموجودة بـ globals.css
 * (ما نستبدلها، بس نوفر واجهة TSX واحدة بدل تكرار style={{}} يدوياً). */
export default function Button({ children, href, onClick, variant = 'primary', size = 'md', disabled, type = 'button', style, className, target }: Props) {
  const cls = variant === 'primary' ? 'btn-primary' : variant === 'ghost' ? 'btn-ghost' : 'btn-secondary'
  const mergedStyle: CSSProperties = { padding: SIZE_PAD[size], fontSize: SIZE_FONT[size], opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer', ...style }

  if (href && !disabled) {
    return <Link href={href} className={`${cls} ${className || ''}`} style={mergedStyle} target={target}>{children}</Link>
  }
  return (
    <button type={type} onClick={disabled ? undefined : onClick} disabled={disabled} className={`${cls} ${className || ''}`} style={mergedStyle}>
      {children}
    </button>
  )
}
