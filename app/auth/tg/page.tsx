'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, useLang } from '../../ClientShell';
import { API_ORIGIN as API } from '../../lib/api';

export default function TgAuthPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useAuth();
  const { t } = useLang();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const token = params.get('token');
    if (!token) { setStatus('error'); setMsg(t('رابط غير صالح', 'Invalid link')); return; }

    fetch(`${API}/auth/tg-verify?token=${token}`, { credentials: 'include' })
      .then(r => r.json())
      .then(async data => {
        if (data.token) {
          localStorage.setItem('user_id', String(data.user_id));
          await refresh();
          router.replace('/dashboard');
        } else {
          setStatus('error');
          setMsg(data.detail || t('انتهت صلاحية الرابط', 'The link has expired'));
        }
      })
      .catch(() => { setStatus('error'); setMsg(t('خطأ في الاتصال', 'Connection error')); });
    // عمداً مرة وحدة بس عند التحميل -- تحقّق التوكن عملية لمرة واحدة (توكن
    // Telegram قد يكون Single-use بالباك اند). إضافة router/refresh/t/params
    // (ولا وحدة منهم مضمونة الثبات بين الرندرات) كانت تخاطر بإعادة التحقق
    // مرة ثانية بعد نجاح الأولى، فيطلع خطأ "الرابط منتهي" للمستخدم بعد ما
    // كان دخل بنجاح فعلاً.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', color: 'var(--text)', gap: 16, position: 'relative',
    }}>
      <div className="orb-1"></div>
      <div className="orb-2"></div>
      <div className="grid-bg"></div>
      <img src="/logo.png" alt="DevelBot" style={{ height: 72, width: 'auto', borderRadius: 14, background: '#fff', padding: 8, position: 'relative', zIndex: 1, marginBottom: 8 }}/>
      {status === 'loading' ? (
        <>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            border: '3px solid var(--surface-3)',
            borderTop: '3px solid #00c4ef',
            animation: 'spin 0.8s linear infinite',
            position: 'relative', zIndex: 1,
          }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ color: 'var(--muted)', position: 'relative', zIndex: 1 }}>{t('جاري تسجيل الدخول...', 'Logging you in...')}</p>
        </>
      ) : (
        <>
          <span style={{ fontSize: 40, position: 'relative', zIndex: 1 }}>⚠️</span>
          <p style={{ color: 'var(--red)', fontWeight: 600, position: 'relative', zIndex: 1 }}>{msg}</p>
          <a href="/login" style={{ color: '#00c4ef', fontSize: 14, position: 'relative', zIndex: 1 }}>{t('تسجيل الدخول يدوياً', 'Log in manually')}</a>
        </>
      )}
    </div>
  );
}
