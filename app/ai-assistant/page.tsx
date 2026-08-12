'use client'
import { useState, useRef, useEffect } from 'react'
import { useLang } from '../ClientShell'

type Message = { role: 'user' | 'assistant'; content: string; ts: Date }

const API = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-97af6.up.railway.app'

const QUICK: [string, string][] = [
  ['كيف أقرأ إشارة LONG بشكل صحيح؟', 'How do I read a LONG signal correctly?'],
  ['ما الفرق بين Spot v11 و Futures v13؟', "What's the difference between Spot v11 and Futures v13?"],
  ['كيف أستخدم RSI في التداول؟', 'How do I use RSI in trading?'],
  ['ما هو ADX وكيف أفسره؟', 'What is ADX and how do I interpret it?'],
  ['متى أدخل صفقة وفق الاستراتيجية؟', 'When should I enter a trade according to the strategy?'],
  ['كيف أحدد حجم الصفقة المناسب؟', 'How do I determine the right position size?'],
  ['ما هو Supertrend وكيف يعمل؟', 'What is Supertrend and how does it work?'],
  ['كيف أقرأ تباعد RSI (Divergence)؟', 'How do I read RSI divergence?'],
]

function getWelcome(t: (ar: string, en: string) => string) {
  return t(
    `مرحباً! أنا **Devel**، مساعد التداول الذكي من DevelBot.

يمكنني مساعدتك في:
- 📊 قراءة وتفسير الإشارات
- 📈 شرح المؤشرات الفنية
- 🎯 استراتيجيات إدارة المخاطر
- 🤔 الإجابة على أسئلتك عن التداول

كيف يمكنني مساعدتك اليوم؟`,
    `Hello! I'm **Devel**, DevelBot's smart trading assistant.

I can help you with:
- 📊 Reading and interpreting signals
- 📈 Explaining technical indicators
- 🎯 Risk management strategies
- 🤔 Answering your trading questions

How can I help you today?`
  )
}

function Avatar({ role }: { role: 'user' | 'assistant' }) {
  return (
    <div style={{
      width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
      background: role === 'assistant' ? 'linear-gradient(135deg,#00c4ef,var(--purple))' : 'var(--surface-2)',
      border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '14px', fontWeight: 900, color: role === 'assistant' ? '#fff' : 'var(--muted)',
    }}>
      {role === 'assistant' ? 'A' : '👤'}
    </div>
  )
}

function TypingDot() {
  return (
    <div style={{ display: 'flex', gap: '4px', padding: '4px 0' }}>
      {[0,1,2].map(i => (
        <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--muted)', animation: `bounce 1.2s ${i*0.2}s infinite` }}/>
      ))}
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>
    </div>
  )
}

function Bubble({ msg }: { msg: Message }) {
  const { lang } = useLang()
  const isAI = msg.role === 'assistant'
  const parts = msg.content.split(/(\*\*[^*]+\*\*)/g)

  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', justifyContent: isAI ? 'flex-start' : 'flex-end', marginBottom: '12px' }}>
      {isAI && <Avatar role="assistant" />}
      <div style={{
        maxWidth: '75%', padding: '12px 16px', borderRadius: isAI ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
        background: isAI ? 'var(--surface)' : 'var(--cyan)',
        border: isAI ? '1px solid var(--border)' : 'none',
        color: isAI ? 'var(--text)' : '#000',
        fontSize: '13px', lineHeight: 1.7,
      }}>
        {parts.map((p, i) =>
          p.startsWith('**') && p.endsWith('**')
            ? <strong key={i}>{p.slice(2,-2)}</strong>
            : <span key={i}>{p}</span>
        )}
        <div style={{ fontSize: '10px', marginTop: '6px', opacity: 0.5, textAlign: 'left' }}>
          {msg.ts.toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      {!isAI && <Avatar role="user" />}
    </div>
  )
}

export default function AIAssistantPage() {
  const { t } = useLang()
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: getWelcome(t), ts: new Date() }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text: string) => {
    const msg = text.trim()
    if (!msg || loading) return
    setInput('')
    setError('')
    const userMsg: Message = { role: 'user', content: msg, ts: new Date() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const history = messages.slice(1).map(m => ({ role: m.role, content: m.content }))
      const res = await fetch(`${API}/ai-chat`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history }),
      })
      if (res.status === 401 || res.status === 403) {
        setError(t('سجّل دخولك للمتابعة مع المساعد الذكي', 'Please log in to continue with the AI assistant'))
        setLoading(false)
        return
      }
      const data = await res.json()
      if (data.error && !data.response) throw new Error(data.error)
      const aiMsg: Message = { role: 'assistant', content: data.response || data.error, ts: new Date() }
      setMessages(prev => [...prev, aiMsg])
    } catch {
      setError(t('حدث خطأ في الاتصال، تحقق من الاتصال بالإنترنت', 'A connection error occurred, check your internet connection'))
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) }
  }

  const clear = () => {
    setMessages([{ role: 'assistant', content: getWelcome(t), ts: new Date() }])
    setError('')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto', padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#00c4ef,var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '16px', color: '#fff' }}>D</div>
              <div>
                <div style={{ fontWeight: 900, fontSize: '18px', letterSpacing: '-0.02em' }}>Devel</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><span className="live-dot"/>{t('مساعد تداول ذكي', 'Smart trading assistant')}</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={clear} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', padding: '7px 14px', borderRadius: '7px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>{t('مسح المحادثة', 'Clear conversation')}</button>
          </div>
        </div>

        {/* Quick prompts */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {QUICK.map(([ar, en], i) => (
            <button key={i} onClick={() => send(t(ar, en))} disabled={loading} style={{ padding: '5px 12px', borderRadius: '20px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--muted)', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
              onMouseEnter={e => { (e.currentTarget.style.borderColor = 'var(--cyan)'); (e.currentTarget.style.color = 'var(--cyan)') }}
              onMouseLeave={e => { (e.currentTarget.style.borderColor = 'var(--border)'); (e.currentTarget.style.color = 'var(--muted)') }}
            >{t(ar, en)}</button>
          ))}
        </div>

        {/* Chat window */}
        <div style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: '420px' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
            {messages.map((m, i) => <Bubble key={i} msg={m} />)}
            {loading && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '12px' }}>
                <Avatar role="assistant" />
                <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '4px 14px 14px 14px', padding: '12px 16px' }}>
                  <TypingDot />
                </div>
              </div>
            )}
            {error && <div style={{ background: 'rgba(255,68,85,0.08)', border: '1px solid rgba(255,68,85,0.2)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: 'var(--red)', marginBottom: '12px' }}>{error}</div>}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '14px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
              placeholder={t('اسأل Devel عن التداول...', 'Ask Devel about trading...')} rows={1} disabled={loading}
              style={{ flex: 1, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px', color: 'var(--text)', fontSize: '13px', fontFamily: 'inherit', resize: 'none', outline: 'none', lineHeight: 1.5, minHeight: '42px', maxHeight: '120px', transition: 'border-color 0.15s' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--cyan)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
            <button onClick={() => send(input)} disabled={!input.trim() || loading} style={{ background: 'var(--cyan)', color: '#000', border: 'none', width: '42px', height: '42px', borderRadius: '10px', cursor: !input.trim() || loading ? 'not-allowed' : 'pointer', opacity: !input.trim() || loading ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--dim)', marginTop: '12px' }}>
          {t('⚠️ Devel تقدم تحليلاً تعليمياً فقط، ليست نصيحة مالية', '⚠️ Devel provides educational analysis only, not financial advice')}
        </p>
      </div>
    </div>
  )
}
