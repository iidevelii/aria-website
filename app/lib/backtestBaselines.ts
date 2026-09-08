/**
 * أرقام الباك تست المرجعية لكل محرك — تُعرض بجانب الأداء الحي في شريط الأداء (PerformanceStrip)
 * حتى يرى المشترك الفجوة بصراحة. المصدر: EXPERIMENTS.md في aria-bot — حدّث هذا الملف عند تغيّر الإعداد الحي.
 *   SMC_MTF            : EXP-021 (أرضية متحفظة، عتبة 70، 50 عملة)          WR 61.5%  PF 1.67
 *   RETEST_MTF         : EXP-064 (OOS، Score≥90 + body≥0.65 + فلتر عدم المطاردة)  WR 89.7%  PF 13.25
 *   BOLLINGER_REVERSION: EXP-036 (MIN_TP_PCT=1.0%، OOS n=63)                      WR 92.0%  PF 2.17
 */
export const BACKTEST_BASELINES: Record<string, { wr: number; pf: number; exp: string }> = {
  SMC_MTF: { wr: 61.5, pf: 1.67, exp: 'EXP-021' },
  RETEST_MTF: { wr: 89.7, pf: 13.25, exp: 'EXP-064' },
  BOLLINGER_REVERSION: { wr: 92.0, pf: 2.17, exp: 'EXP-036' },
}

/** متوسط موزون بعدد الصفقات الحية لكل محرك — حتى تكون المقارنة على نفس المزيج الفعلي */
export function blendedBaseline(byStrategy: { engine: string; n: number }[]) {
  let n = 0, wr = 0, pf = 0
  for (const s of byStrategy) {
    const b = BACKTEST_BASELINES[s.engine]
    if (!b || !s.n) continue
    n += s.n; wr += b.wr * s.n; pf += b.pf * s.n
  }
  return n ? { wr: wr / n, pf: pf / n } : null
}
