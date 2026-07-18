'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-97af6.up.railway.app';

export default function TgAuthPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const token = params.get('token');
    if (!token) { setStatus('error'); setMsg('رابط غير صالح'); return; }

    fetch(`${API}/auth/tg-verify?token=${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user_id', String(data.user_id));
          router.replace('/dashboard');
        } else {
          setStatus('error');
          setMsg(data.detail || 'انتهت صلاحية الرابط');
        }
      })
      .catch(() => { setStatus('error'); setMsg('خطأ في الاتصال'); });
  }, []);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', color: 'var(--text)', gap: 16,
    }}>
      {status === 'loading' ? (
        <>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            border: '3px solid var(--surface-3)',
            borderTop: '3px solid #00c4ef',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ color: 'var(--muted)' }}>جاري تسجيل الدخول...</p>
        </>
      ) : (
        <>
          <span style={{ fontSize: 40 }}>⚠️</span>
          <p style={{ color: 'var(--red)', fontWeight: 600 }}>{msg}</p>
          <a href="/login" style={{ color: '#00c4ef', fontSize: 14 }}>تسجيل الدخول يدوياً</a>
        </>
      )}
    </div>
  );
}
