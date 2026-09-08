'use client';
/**
 * DevelBot UI v2 — مكوّنات مشتركة تستبدل style={{...}} المتناثر في dashboard/page.tsx وغيرها.
 * تعتمد حصراً على tokens.css المولَّد من design-tokens.json (لا ألوان حرفية هنا).
 * الاستخدام: import { SignalCard, StatCard, EngineBadge, PerformanceStrip, RiskLadder, StatusPill } from '@/app/ui/v2';
 * الأنماط في ./v2.css — أضف `@import './ui/v2/v2.css';` إلى globals.css.
 */
import React from 'react';

/** يسمح بتمرير خصائص CSS مخصّصة (custom properties) عبر style={{...}} بدون اللجوء لـ`any`. */
type CSSVarStyle = React.CSSProperties & Record<`--${string}`, string | number>;

export type Engine = 'SMC_MTF' | 'RETEST_MTF' | 'BOLLINGER_REVERSION' | 'FUNDING_SQUEEZE' | 'AVWAP_RETEST' | 'US_TREND_PULLBACK' | string;
export type Side = 'LONG' | 'SHORT';
export type SignalStatus = 'OPEN' | 'PENDING' | 'TP' | 'SL' | 'VOID' | 'EXPIRED';

export interface Signal {
  id: number; pair: string; side: Side; market: 'SPOT' | 'FUTURES' | 'US'; engine: Engine;
  entry: number; tp: number; sl: number; current?: number; ai_score: number; leverage?: number;
  status: SignalStatus; created_at: string; pnl_pct?: number; void_reason?: string; auto_traded?: boolean;
}

const ENGINE_LABEL: Record<string, string> = {
  SMC_MTF: 'SMC', RETEST_MTF: 'Retest', BOLLINGER_REVERSION: 'Bollinger',
  FUNDING_SQUEEZE: 'Funding', AVWAP_RETEST: 'AVWAP', US_TREND_PULLBACK: 'US Pullback',
};
const engineVar = (e: string) => `var(--engine-${e.toLowerCase().replace(/_/g, '-')}, var(--cyan))`;

export function EngineBadge({ engine }: { engine: Engine }) {
  return (
    <span className="v2-badge" style={{ '--badge-c': engineVar(engine) } as CSSVarStyle} title={engine}>
      <i className="v2-badge__dot" />{ENGINE_LABEL[engine] ?? engine}
    </span>
  );
}

export function SideChip({ side }: { side: Side }) {
  return <span className={`v2-chip v2-chip--${side.toLowerCase()}`}>{side}</span>;
}

export function StatusPill({ status, reason }: { status: SignalStatus; reason?: string }) {
  const label: Record<SignalStatus, string> = { OPEN: 'مفتوحة', PENDING: 'انتظار', TP: 'هدف', SL: 'وقف', VOID: 'ملغاة', EXPIRED: 'منتهية' };
  return <span className={`v2-pill v2-pill--${status.toLowerCase()}`} title={reason}>{label[status]}</span>;
}

/** ثقة الإشارة كتصنيف لا كرقم عارٍ — 70–79 / 80–89 / 90+ (نفس الفكرة في المراجعة §2.1) */
export function ScoreMeter({ score }: { score: number }) {
  const bucket = score >= 90 ? 'A' : score >= 80 ? 'B' : 'C';
  return (
    <div className="v2-score" aria-label={`score ${score}`}>
      <div className="v2-score__bar"><i style={{ width: `${Math.min(100, score)}%` }} /></div>
      <span className="v2-score__num">{score}<small>{bucket}</small></span>
    </div>
  );
}

/** سلّم المخاطرة: يرسم SL / الدخول / السعر الحالي / TP على محور واحد — يقرأ R:R بالنظر لا بالحساب */
export function RiskLadder({ side, entry, sl, tp, current }: { side: Side; entry: number; sl: number; tp: number; current?: number }) {
  const lo = Math.min(sl, tp), hi = Math.max(sl, tp);
  const pos = (p: number) => `${((p - lo) / (hi - lo)) * 100}%`;
  const rr = Math.abs(tp - entry) / Math.abs(entry - sl);
  const pnl = current !== undefined ? ((side === 'LONG' ? current - entry : entry - current) / entry) * 100 : undefined;
  return (
    <div className={`v2-ladder v2-ladder--${side.toLowerCase()}`}>
      <div className="v2-ladder__track">
        <span className="v2-ladder__zone v2-ladder__zone--risk" style={{ left: pos(Math.min(entry, sl)), width: `${(Math.abs(entry - sl) / (hi - lo)) * 100}%` }} />
        <span className="v2-ladder__zone v2-ladder__zone--reward" style={{ left: pos(Math.min(entry, tp)), width: `${(Math.abs(tp - entry) / (hi - lo)) * 100}%` }} />
        <b className="v2-ladder__tick v2-ladder__tick--entry" style={{ left: pos(entry) }} />
        {current !== undefined && <b className="v2-ladder__tick v2-ladder__tick--now" style={{ left: pos(Math.max(lo, Math.min(hi, current))) }} />}
      </div>
      <div className="v2-ladder__labels">
        <span className="v2-ladder__l v2-ladder__l--sl">SL {fmt(sl)}</span>
        <span className="v2-ladder__l v2-ladder__l--rr">{rr.toFixed(1)}R{pnl !== undefined && <em className={pnl >= 0 ? 'up' : 'down'}> {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}%</em>}</span>
        <span className="v2-ladder__l v2-ladder__l--tp">TP {fmt(tp)}</span>
      </div>
    </div>
  );
}

export function SignalCard({ s, onOpenChart, lang = 'ar' }: { s: Signal; onOpenChart?: (s: Signal) => void; lang?: 'ar' | 'en' }) {
  const t = (a: string, e: string) => (lang === 'ar' ? a : e);
  return (
    <article className={`v2-signal v2-signal--${s.status.toLowerCase()}`}>
      <header className="v2-signal__head">
        <div className="v2-signal__id">
          <h3 className="v2-signal__pair">{s.pair}</h3>
          <SideChip side={s.side} />
          <EngineBadge engine={s.engine} />
          <span className="v2-market">{s.market}{s.leverage && s.leverage > 1 ? ` ×${s.leverage}` : ''}</span>
        </div>
        <div className="v2-signal__meta">
          <StatusPill status={s.status} reason={s.void_reason} />
          {s.auto_traded && <span className="v2-auto" title={t('نُفّذت آلياً على حسابك', 'Auto-executed on your account')}>⚡ {t('آلي', 'auto')}</span>}
          <time className="v2-time">{relTime(s.created_at, lang)}</time>
        </div>
      </header>
      <div className="v2-signal__body">
        <div className="v2-signal__entry">
          <span className="v2-label">{t('دخول', 'Entry')}</span>
          <span className="v2-num v2-num--lg">{fmt(s.entry)}</span>
          {s.current !== undefined && <span className="v2-label">{t('الآن', 'Now')} <b className="v2-num">{fmt(s.current)}</b></span>}
        </div>
        <RiskLadder side={s.side} entry={s.entry} sl={s.sl} tp={s.tp} current={s.status === 'OPEN' ? s.current : undefined} />
        <ScoreMeter score={s.ai_score} />
      </div>
      {s.status === 'VOID' && s.void_reason && <p className="v2-signal__void">{t('سبب الإلغاء:', 'Voided:')} {s.void_reason}</p>}
      {(s.status === 'TP' || s.status === 'SL') && s.pnl_pct !== undefined && (
        <p className={`v2-signal__result ${s.pnl_pct >= 0 ? 'up' : 'down'}`}>{s.pnl_pct >= 0 ? '+' : ''}{s.pnl_pct.toFixed(2)}% {t('بعد الرسوم', 'after fees')}</p>
      )}
      <footer className="v2-signal__foot">
        <button className="v2-btn v2-btn--ghost" onClick={() => onOpenChart?.(s)}>{t('الشارت', 'Chart')}</button>
        <button className="v2-btn v2-btn--ghost">{t('لماذا هذه الإشارة؟', 'Why this signal?')}</button>
      </footer>
    </article>
  );
}

export function StatCard({ label, value, sub, tone = 'neutral', spark }: { label: string; value: string; sub?: string; tone?: 'up' | 'down' | 'neutral'; spark?: number[] }) {
  return (
    <div className="v2-stat">
      <span className="v2-label">{label}</span>
      <span className={`v2-stat__value ${tone}`}>{value}</span>
      {sub && <span className="v2-stat__sub">{sub}</span>}
      {spark && <Sparkline data={spark} tone={tone} />}
    </div>
  );
}

export function Sparkline({ data, tone = 'neutral', w = 120, h = 32 }: { data: number[]; tone?: string; w?: number; h?: number }) {
  if (!data.length) return null;
  const min = Math.min(...data), max = Math.max(...data), rng = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / rng) * (h - 4) - 2}`).join(' ');
  return (
    <svg className={`v2-spark ${tone}`} viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden>
      <polyline points={pts} fill="none" strokeWidth="1.5" />
      <circle cx={w} cy={h - ((data[data.length - 1] - min) / rng) * (h - 4) - 2} r="2.5" />
    </svg>
  );
}

/** شريط الأداء: الأداء الحي مقابل الباك تست جنباً إلى جنب — الشفافية كميزة تصميم */
export function PerformanceStrip({ live, backtest, period }: { live: { wr: number; pf: number; n: number }; backtest: { wr: number; pf: number }; period: string }) {
  const gap = live.wr - backtest.wr;
  return (
    <div className="v2-perf">
      <div className="v2-perf__col"><span className="v2-label">{period} · حي · n={live.n}</span><b className="v2-num v2-num--lg">{live.wr.toFixed(1)}%</b><span className="v2-stat__sub">PF {live.pf.toFixed(2)}</span></div>
      <div className="v2-perf__col v2-perf__col--bt"><span className="v2-label">باك تست</span><b className="v2-num v2-num--lg">{backtest.wr.toFixed(1)}%</b><span className="v2-stat__sub">PF {backtest.pf.toFixed(2)}</span></div>
      <div className={`v2-perf__gap ${gap >= -5 ? 'ok' : 'warn'}`}>{gap >= 0 ? '+' : ''}{gap.toFixed(1)} نقطة {gap < -5 ? '· فجوة تحت المراجعة' : '· ضمن المتوقع'}</div>
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return <div className="v2-empty"><b>{title}</b>{hint && <span>{hint}</span>}</div>;
}

export function Skeleton({ h = 120 }: { h?: number }) {
  return <div className="v2-skel" style={{ height: h }} aria-hidden />;
}

// helpers
export function fmt(x: number) {
  if (x >= 100) return x.toLocaleString('en-US', { maximumFractionDigits: 2 });
  if (x >= 1) return x.toFixed(4);
  return x.toPrecision(4);
}
function relTime(iso: string, lang: 'ar' | 'en') {
  const m = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 60) return lang === 'ar' ? `قبل ${m} د` : `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 48) return lang === 'ar' ? `قبل ${h} س` : `${h}h ago`;
  return lang === 'ar' ? `قبل ${Math.round(h / 24)} ي` : `${Math.round(h / 24)}d ago`;
}
