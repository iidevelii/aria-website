'use client'
import { useState } from 'react'

type Endpoint = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  title: string
  desc: string
  auth?: boolean
  params?: { name: string; type: string; required: boolean; desc: string }[]
  body?: { name: string; type: string; required: boolean; desc: string }[]
  response: string
  example?: string
}

const BASE = 'https://web-production-97af6.up.railway.app'

const MC = {
  string: '#f5c842',
  number: '#00c4ef',
  boolean: '#ff9f43',
  object: '#a29bfe',
  array: '#fd79a8',
  kw: '#00e664',
  muted: '#606778',
}

const ENDPOINTS: { section: string; emoji: string; items: Endpoint[] }[] = [
  {
    section: 'Authentication', emoji: '🔐',
    items: [
      {
        method: 'POST', path: '/register', title: 'تسجيل مستخدم جديد', auth: false,
        desc: 'إنشاء حساب جديد بالاسم والإيميل وكلمة المرور.',
        body: [
          { name: 'username', type: 'string', required: true,  desc: 'اسم المستخدم (3-30 حرف)' },
          { name: 'email',    type: 'string', required: true,  desc: 'البريد الإلكتروني' },
          { name: 'password', type: 'string', required: true,  desc: 'كلمة المرور (6+ أحرف)' },
        ],
        response: `{\n  "message": "User created successfully",\n  "user_id": 42\n}`,
      },
      {
        method: 'POST', path: '/login', title: 'تسجيل الدخول', auth: false,
        desc: 'تسجيل الدخول والحصول على JWT token.',
        body: [
          { name: 'email',    type: 'string', required: true, desc: 'البريد الإلكتروني' },
          { name: 'password', type: 'string', required: true, desc: 'كلمة المرور' },
        ],
        response: `{\n  "access_token": "eyJhbGciOi...",\n  "token_type": "bearer",\n  "user_id": 42\n}`,
      },
      {
        method: 'GET', path: '/user/{user_id}', title: 'بيانات المستخدم', auth: false,
        desc: 'استرجاع معلومات مستخدم عبر ID.',
        params: [{ name: 'user_id', type: 'number', required: true, desc: 'معرف المستخدم' }],
        response: `{\n  "id": 42,\n  "username": "ahmed",\n  "email": "ahmed@example.com",\n  "subscription": "pro",\n  "created_at": "2025-01-15T10:00:00Z"\n}`,
      },
    ]
  },
  {
    section: 'Signals', emoji: '📡',
    items: [
      {
        method: 'GET', path: '/signals', title: 'جميع الإشارات', auth: false,
        desc: 'استرجاع آخر الإشارات المُولَّدة (Spot + Futures).',
        params: [
          { name: 'limit',  type: 'number',  required: false, desc: 'عدد الإشارات (افتراضي: 20)' },
          { name: 'type',   type: 'string',  required: false, desc: '"spot" أو "futures"' },
          { name: 'active', type: 'boolean', required: false, desc: 'true = الإشارات النشطة فقط' },
        ],
        response: `[\n  {\n    "id": 1,\n    "symbol": "BTCUSDT",\n    "side": "LONG",\n    "entry": 95200.50,\n    "tp": 99960.53,\n    "sl": 90440.48,\n    "type": "futures",\n    "status": "active",\n    "created_at": "2025-07-14T08:30:00Z"\n  }\n]`,
      },
      {
        method: 'GET', path: '/signals/{id}', title: 'إشارة محددة', auth: false,
        desc: 'تفاصيل إشارة واحدة بمعرفها.',
        params: [{ name: 'id', type: 'number', required: true, desc: 'معرف الإشارة' }],
        response: `{\n  "id": 1,\n  "symbol": "BTCUSDT",\n  "side": "LONG",\n  "entry": 95200.50,\n  "tp": 99960.53,\n  "sl": 90440.48,\n  "result": "TP1 ✅",\n  "pnl_pct": 5.01,\n  "type": "futures",\n  "status": "closed"\n}`,
      },
      {
        method: 'GET', path: '/stats', title: 'إحصائيات الأداء', auth: false,
        desc: 'إجمالي الإشارات، نسب الفوز، Profit Factor.',
        response: `{\n  "total": 847,\n  "wins": 491,\n  "losses": 356,\n  "win_rate": 57.97,\n  "profit_factor": 2.14,\n  "spot": { "total": 421, "win_rate": 60.1 },\n  "futures": { "total": 426, "win_rate": 51.7 }\n}`,
      },
    ]
  },
  {
    section: 'Scanner', emoji: '🔍',
    items: [
      {
        method: 'GET', path: '/api/v1/scanner', title: 'نتائج السكانر', auth: false,
        desc: 'نتائج مسح السوق — يُحدَّث كل 30 دقيقة.',
        params: [
          { name: 'tf',        type: 'string', required: false, desc: 'التايم فريم: 15m,1h,4h,1d (افتراضي: 4h)' },
          { name: 'min_score', type: 'number', required: false, desc: 'أدنى Score للفلترة (مثال: 50)' },
        ],
        response: `[\n  {\n    "symbol": "ETHUSDT",\n    "score": 82,\n    "rsi": 58.3,\n    "macd": "bullish",\n    "supertrend": "up",\n    "adx": 31.2,\n    "signal": "STRONG BUY"\n  }\n]`,
      },
    ]
  },
  {
    section: 'AI Assistant', emoji: '🤖',
    items: [
      {
        method: 'POST', path: '/ai-chat', title: 'محادثة Devel', auth: false,
        desc: 'إرسال رسالة لمساعد Devel الذكي والحصول على رد فوري.',
        body: [
          { name: 'message', type: 'string', required: true,  desc: 'رسالة المستخدم' },
          { name: 'history', type: 'array',  required: false, desc: 'آخر 6 رسائل للسياق [{role,content}]' },
        ],
        response: `{\n  "response": "RSI أو Relative Strength Index هو مؤشر يقيس...",\n}`,
        example: `curl -X POST ${BASE}/ai-chat \\
  -H "Content-Type: application/json" \\
  -d '{"message": "ما هو RSI؟"}'`,
      },
    ]
  },
  {
    section: 'Subscription', emoji: '💳',
    items: [
      {
        method: 'POST', path: '/subscribe', title: 'تفعيل اشتراك', auth: true,
        desc: 'تفعيل اشتراك Pro لمستخدم عبر payment_id.',
        body: [
          { name: 'user_id',    type: 'number', required: true, desc: 'معرف المستخدم' },
          { name: 'payment_id', type: 'string', required: true, desc: 'رقم الدفع' },
          { name: 'days',       type: 'number', required: false, desc: 'مدة الاشتراك (افتراضي: 30)' },
        ],
        response: `{\n  "message": "Subscription activated",\n  "expires_at": "2025-08-14T10:00:00Z"\n}`,
      },
      {
        method: 'GET', path: '/subscription/{user_id}', title: 'حالة الاشتراك', auth: false,
        desc: 'التحقق من حالة اشتراك المستخدم.',
        params: [{ name: 'user_id', type: 'number', required: true, desc: 'معرف المستخدم' }],
        response: `{\n  "active": true,\n  "plan": "pro",\n  "expires_at": "2025-08-14T10:00:00Z",\n  "days_left": 30\n}`,
      },
    ]
  },
]

const METHOD_COLOR: Record<string, string> = {
  GET:    'rgba(0,196,239,0.12)', POST: 'rgba(0,230,100,0.12)',
  PUT:    'rgba(245,200,66,0.12)', DELETE: 'rgba(255,68,85,0.12)',
}
const METHOD_TEXT: Record<string, string> = {
  GET: '#00c4ef', POST: '#00e664', PUT: '#f5c842', DELETE: '#ff4455',
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500) }
  return (
    <div style={{ position: 'relative', background: '#0d0f14', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '9px', marginTop: '8px' }}>
      <button onClick={copy} style={{ position: 'absolute', top: '8px', right: '8px', background: copied?'rgba(0,230,100,0.15)':'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: copied?'#00e664':'var(--muted)', padding: '3px 10px', borderRadius: '5px', fontSize: '10px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>{copied?'✓ نُسخ':'نسخ'}</button>
      <pre style={{ margin: 0, padding: '14px 16px', fontSize: '12px', fontFamily: 'var(--mono,monospace)', overflowX: 'auto', color: '#e2e8f0', lineHeight: 1.7 }}>{code}</pre>
    </div>
  )
}

function ParamRow({ p }: { p: { name: string; type: string; required: boolean; desc: string } }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '130px 80px 60px 1fr', gap: '10px', padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'start', fontSize: '12px' }}>
      <code style={{ color: MC.kw, fontFamily: 'var(--mono)' }}>{p.name}</code>
      <span style={{ color: MC.string }}>{p.type}</span>
      <span style={{ color: p.required?'#ff4455':'var(--muted)', fontWeight: 700, fontSize: '10px', paddingTop: '1px' }}>{p.required?'مطلوب':'اختياري'}</span>
      <span style={{ color: 'var(--muted)' }}>{p.desc}</span>
    </div>
  )
}

function EndpointCard({ ep }: { ep: Endpoint }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: '11px', overflow: 'hidden', marginBottom: '10px', background: 'var(--surface)' }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'right', fontFamily: 'inherit' }}>
        <span style={{ padding: '3px 10px', borderRadius: '5px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.06em', background: METHOD_COLOR[ep.method], color: METHOD_TEXT[ep.method], flexShrink: 0 }}>{ep.method}</span>
        <code style={{ flex: 1, fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text)', fontWeight: 600, textAlign: 'left' }}>{ep.path}</code>
        <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{ep.title}</span>
        {ep.auth && <span style={{ padding: '2px 8px', borderRadius: '5px', fontSize: '10px', fontWeight: 700, background: 'rgba(245,200,66,0.1)', color: '#f5c842' }}>🔒 Auth</span>}
        <span style={{ color: 'var(--muted)', fontSize: '14px', transition: 'transform 0.2s', transform: open?'rotate(180deg)':'none' }}>▾</span>
      </button>
      {open && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '16px', background: 'var(--surface-2)' }}>
          <p style={{ margin: '0 0 14px', fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6 }}>{ep.desc}</p>

          {ep.params && ep.params.length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Path / Query Parameters</div>
              <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: '7px', overflow: 'hidden', background: '#0d0f14' }}>
                {ep.params.map(p => <ParamRow key={p.name} p={p} />)}
              </div>
            </div>
          )}

          {ep.body && ep.body.length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Request Body (JSON)</div>
              <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: '7px', overflow: 'hidden', background: '#0d0f14' }}>
                {ep.body.map(p => <ParamRow key={p.name} p={p} />)}
              </div>
            </div>
          )}

          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Response</div>
            <CodeBlock code={ep.response} />
          </div>

          {ep.example && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>مثال cURL</div>
              <CodeBlock code={ep.example} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ApiDocsPage() {
  const [search, setSearch] = useState('')
  const q = search.toLowerCase()

  const filtered = ENDPOINTS.map(s => ({
    ...s,
    items: s.items.filter(ep =>
      ep.path.toLowerCase().includes(q) || ep.title.includes(q) || ep.desc.includes(q) || !q
    )
  })).filter(s => s.items.length > 0)

  const total = ENDPOINTS.reduce((a, s) => a + s.items.length, 0)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: '24px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>REST API</h1>
            <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, background: 'rgba(0,196,239,0.1)', color: 'var(--cyan)', border: '1px solid rgba(0,196,239,0.2)' }}>v1.0</span>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '13px', margin: '0 0 16px' }}>توثيق الـ API الخاص بـ DevelBot — {total} endpoint متاح</p>

          {/* Base URL */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '9px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0 }}>Base URL</span>
            <code style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--cyan)' }}>{BASE}</code>
          </div>
        </div>

        {/* Info cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '24px' }}>
          {[
            { icon: '🔓', title: 'بدون مفتاح', desc: 'معظم الـ endpoints مفتوحة ولا تحتاج Auth' },
            { icon: '📋', title: 'JSON فقط', desc: 'Content-Type: application/json في كل الطلبات' },
            { icon: '⚡', title: 'Rate Limit', desc: '100 طلب/دقيقة لكل IP' },
          ].map(c => (
            <div key={c.icon} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '20px', marginBottom: '6px' }}>{c.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '3px' }}>{c.title}</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{c.desc}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث عن endpoint..."
            style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '9px', padding: '11px 40px 11px 16px', color: 'var(--text)', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--cyan)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          />
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: '14px' }}>🔍</span>
        </div>

        {/* Endpoints */}
        {filtered.map(section => (
          <div key={section.section} style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '18px' }}>{section.emoji}</span>
              <h2 style={{ fontSize: '15px', fontWeight: 800, margin: 0 }}>{section.section}</h2>
              <span style={{ padding: '1px 8px', borderRadius: '5px', fontSize: '10px', fontWeight: 700, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>{section.items.length}</span>
            </div>
            {section.items.map(ep => <EndpointCard key={ep.path + ep.method} ep={ep} />)}
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--muted)' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</div>
            لم يتم العثور على نتائج لـ "{search}"
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--dim)', marginTop: '32px' }}>
          DevelBot API — للأسئلة تواصل عبر تلقرام
        </p>
      </div>
    </div>
  )
}
