'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function Subscribe() {
  const [txid, setTxid] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

  const handleVerify = async () => {
    if (!txid) return
    setLoading(true)
    setMessage('')
    try {
      const user_id = localStorage.getItem('user_id')
      const res = await fetch('https://web-production-dfe62.up.railway.app/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txid, user_id: parseInt(user_id || '0') })
      })
      const data = await res.json()
      if (data.status === 'success') {
        setSuccess(true)
        setMessage(data.message)
      } else {
        setMessage(data.message || 'لم يتم التحقق بعد')
      }
    } catch {
      setMessage('خطأ في الاتصال')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#050508', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative' }}>
      <div className="orb-1"></div>
      <div className="orb-2"></div>
      <div className="grid-bg"></div>

      <div style={{ width: '100%', maxWidth: '560px', position: 'relative', zIndex: 1 }}>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #00d4ff, #7b2fff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '18px', color: 'white' }}>A</div>
            <span style={{ fontWeight: 900, fontSize: '20px', color: 'white' }}>ARIA<span style={{ color: '#00d4ff' }}>Bot</span></span>
          </Link>
          <h1 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '8px' }}>الاشتراك الاحترافي</h1>
          <p style={{ color: '#6b7280', fontSize: '15px' }}>35 USDT — 30 يوم وصول كامل بدون قيود</p>
        </div>

        {/* Pricing highlight */}
        <div style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.06), rgba(123,47,255,0.06))', border: '1px solid rgba(0,212,255,0.15)', borderRadius: '20px', padding: '24px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '48px', fontWeight: 900 }}>$35</div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>لمدة 30 يوم كاملة</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {['70 عملة متجددة', 'رافعة ديناميكية', 'Quality Score', 'اشعارات فورية'].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#9ca3af' }}>
                <span style={{ color: '#00d4ff' }}>✓</span> {f}
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="glass-card" style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>خطوات الدفع</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { num: '1', color: '#00d4ff', title: 'ارسل 35 USDT', content: (
                <div>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>على شبكة TRC20 لهذا العنوان:</div>
                  <div style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: '10px', padding: '12px 16px', fontFamily: 'monospace', fontSize: '13px', color: '#00d4ff', wordBreak: 'break-all', userSelect: 'all' }}>
                    TGxUP5bdLgazTSq4n8aSkHfiFxFrKK9QWY
                  </div>
                </div>
              )},
              { num: '2', color: '#7b2fff', title: 'انسخ TXID الحوالة', content: (
                <div style={{ fontSize: '13px', color: '#6b7280' }}>من محفظتك أو البورصة بعد اتمام الارسال</div>
              )},
              { num: '3', color: '#34d399', title: 'ادخل TXID وتحقق', content: (
                <div style={{ fontSize: '13px', color: '#6b7280' }}>سيتم تفعيل حسابك تلقائياً خلال ثوانٍ</div>
              )},
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: `${s.color}18`, border: `1px solid ${s.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '14px', color: s.color, flexShrink: 0 }}>{s.num}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '6px' }}>{s.title}</div>
                  {s.content}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verify */}
        <div className="glass-card">
          <label className="label">أدخل TXID الحوالة</label>
          <input
            type="text"
            className="input"
            placeholder="Transaction Hash..."
            value={txid}
            onChange={e => setTxid(e.target.value)}
            style={{ marginBottom: '16px', fontFamily: 'monospace' }}
          />

          {message && (
            <div style={{ background: success ? 'rgba(0,230,100,0.08)' : 'rgba(255,200,0,0.08)', border: `1px solid ${success ? 'rgba(0,230,100,0.2)' : 'rgba(255,200,0,0.2)'}`, borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', color: success ? '#00e664' : '#fbbf24', fontSize: '14px' }}>
              {success ? '✅' : '⏳'} {message}
            </div>
          )}

          <button onClick={handleVerify} disabled={loading || !txid} className="btn-primary"
            style={{ width: '100%', opacity: (loading || !txid) ? 0.5 : 1 }}>
            {loading ? 'جاري التحقق...' : 'تحقق من الدفع ←'}
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link href="/dashboard" style={{ color: '#374151', fontSize: '13px', textDecoration: 'none' }}>رجوع للداشبورد ←</Link>
        </p>
      </div>
    </div>
  )
}